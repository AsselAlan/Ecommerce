/**
 * Hook para manejar las variantes de productos
 * Utiliza la nueva tabla 'producto_variantes' creada en la migración 005
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../libs/supabaseClient';

export const useProductVariants = (productId) => {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar variantes del producto
  const loadVariants = useCallback(async () => {
    if (!productId) {
      setVariants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('producto_variantes')
        .select('*')
        .eq('producto_id', productId)
        .eq('activa', true)
        .order('color', { ascending: true })
        .order('talla', { ascending: true });

      if (error) throw error;

      setVariants(data || []);
      
      // Seleccionar la primera variante por defecto si hay alguna
      if (data && data.length > 0 && !selectedVariant) {
        setSelectedVariant(data[0]);
      }

    } catch (err) {
      console.error('Error cargando variantes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId, selectedVariant]);

  // Obtener variantes agrupadas por característica
  const getGroupedVariants = useCallback(() => {
    const grouped = {
      colors: [],
      sizes: [],
      materials: []
    };

    variants.forEach(variant => {
      if (variant.color && !grouped.colors.find(c => c.value === variant.color)) {
        grouped.colors.push({
          value: variant.color,
          label: variant.color,
          available: variant.stock_variante > 0
        });
      }

      if (variant.talla && !grouped.sizes.find(s => s.value === variant.talla)) {
        grouped.sizes.push({
          value: variant.talla,
          label: variant.talla,
          available: variant.stock_variante > 0
        });
      }

      if (variant.material && !grouped.materials.find(m => m.value === variant.material)) {
        grouped.materials.push({
          value: variant.material,
          label: variant.material,
          available: variant.stock_variante > 0
        });
      }
    });

    return grouped;
  }, [variants]);

  // Seleccionar variante específica
  const selectVariant = useCallback((variantId) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
    }
  }, [variants]);

  // Seleccionar variante por características
  const selectVariantByAttributes = useCallback((attributes) => {
    const { color, talla, material } = attributes;
    
    const matchingVariant = variants.find(variant => {
      const colorMatch = !color || variant.color === color;
      const sizeMatch = !talla || variant.talla === talla;
      const materialMatch = !material || variant.material === material;
      
      return colorMatch && sizeMatch && materialMatch;
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      return matchingVariant;
    }
    
    return null;
  }, [variants]);

  // Obtener precio final considerando variante
  const getFinalPrice = useCallback((basePrice, baseDiscountPrice) => {
    if (!selectedVariant) {
      return {
        price: baseDiscountPrice || basePrice,
        originalPrice: basePrice,
        hasDiscount: !!baseDiscountPrice,
        extraCost: 0
      };
    }

    const extraCost = selectedVariant.precio_extra || 0;
    const finalPrice = (baseDiscountPrice || basePrice) + extraCost;
    const originalPrice = basePrice + extraCost;

    return {
      price: finalPrice,
      originalPrice: originalPrice,
      hasDiscount: !!baseDiscountPrice,
      extraCost: extraCost
    };
  }, [selectedVariant]);

  // Obtener stock disponible
  const getAvailableStock = useCallback((baseStock) => {
    if (!selectedVariant) {
      return baseStock;
    }

    return selectedVariant.stock_variante;
  }, [selectedVariant]);

  // Obtener imagen de la variante o imagen base
  const getVariantImage = useCallback((baseImage) => {
    if (selectedVariant && selectedVariant.imagen_variante) {
      return selectedVariant.imagen_variante;
    }
    return baseImage;
  }, [selectedVariant]);

  // Verificar si hay variantes disponibles
  const hasVariants = variants.length > 0;
  
  // Verificar si la variante seleccionada está en stock
  const isInStock = selectedVariant ? selectedVariant.stock_variante > 0 : true;

  // Cargar variantes al cambiar el productId
  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  return {
    variants,
    selectedVariant,
    loading,
    error,
    hasVariants,
    isInStock,
    getGroupedVariants,
    selectVariant,
    selectVariantByAttributes,
    getFinalPrice,
    getAvailableStock,
    getVariantImage,
    refreshVariants: loadVariants
  };
};

// Hook simplificado para obtener solo información de variantes sin selección
export const useVariantInfo = (productId) => {
  const [variantInfo, setVariantInfo] = useState({
    hasVariants: false,
    totalVariants: 0,
    colors: [],
    sizes: [],
    materials: [],
    priceRange: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVariantInfo = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('producto_variantes')
          .select('color, talla, material, precio_extra, stock_variante')
          .eq('producto_id', productId)
          .eq('activa', true);

        if (error) throw error;

        const colors = [...new Set(data.map(v => v.color).filter(Boolean))];
        const sizes = [...new Set(data.map(v => v.talla).filter(Boolean))];
        const materials = [...new Set(data.map(v => v.material).filter(Boolean))];
        
        const prices = data.map(v => v.precio_extra || 0);
        const priceRange = prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices)
        } : null;

        setVariantInfo({
          hasVariants: data.length > 0,
          totalVariants: data.length,
          colors,
          sizes,
          materials,
          priceRange,
          inStockVariants: data.filter(v => v.stock_variante > 0).length
        });

      } catch (error) {
        console.error('Error cargando info de variantes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVariantInfo();
  }, [productId]);

  return { variantInfo, loading };
};