/**
 * Hook para manejar favoritos de productos
 * Utiliza la nueva tabla 'favoritos' creada en la migración 005
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../libs/supabaseClient';
import { useAuth } from '../useAuth';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar favoritos del usuario
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          id,
          producto_id,
          fecha_creacion,
          productos!inner (
            id,
            nombre,
            precio,
            precio_descuento,
            imagen_url,
            stock,
            activo
          )
        `)
        .eq('usuario_id', user.id)
        .eq('productos.activo', true)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (err) {
      console.error('Error cargando favoritos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Verificar si un producto es favorito
  const isFavorite = useCallback((productId) => {
    return favorites.some(fav => fav.producto_id === productId);
  }, [favorites]);

  // Agregar a favoritos
  const addToFavorites = async (productId) => {
    if (!user) {
      throw new Error('Debes iniciar sesión para agregar favoritos');
    }

    try {
      const { data, error } = await supabase
        .from('favoritos')
        .insert({
          usuario_id: user.id,
          producto_id: productId
        })
        .select(`
          id,
          producto_id,
          fecha_creacion,
          productos!inner (
            id,
            nombre,
            precio,
            precio_descuento,
            imagen_url,
            stock,
            activo
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // Violación de restricción UNIQUE
          throw new Error('Este producto ya está en tus favoritos');
        }
        throw error;
      }

      // Actualizar estado local
      setFavorites(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error agregando a favoritos:', err);
      throw err;
    }
  };

  // Eliminar de favoritos
  const removeFromFavorites = async (productId) => {
    if (!user) {
      throw new Error('Debes iniciar sesión');
    }

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('usuario_id', user.id)
        .eq('producto_id', productId);

      if (error) throw error;

      // Actualizar estado local
      setFavorites(prev => prev.filter(fav => fav.producto_id !== productId));

    } catch (err) {
      console.error('Error eliminando de favoritos:', err);
      throw err;
    }
  };

  // Toggle favorito
  const toggleFavorite = async (productId) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
      return false; // Ya no es favorito
    } else {
      await addToFavorites(productId);
      return true; // Ahora es favorito
    }
  };

  // Cargar favoritos al montar el componente o cambiar usuario
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    error,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refreshFavorites: loadFavorites,
    favoritesCount: favorites.length
  };
};

// Hook para usar solo la funcionalidad de verificar favoritos (más liviano)
export const useFavoriteStatus = (productId) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !productId) {
      setIsFavorite(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('producto_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado = no es favorito
          setIsFavorite(false);
        } else {
          throw error;
        }
      } else {
        setIsFavorite(!!data);
      }
    } catch (err) {
      console.error('Error verificando estado de favorito:', err);
      setIsFavorite(false);
    } finally {
      setLoading(false);
    }
  }, [user, productId]);

  const toggleFavorite = async () => {
    if (!user) {
      throw new Error('Debes iniciar sesión');
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', user.id)
          .eq('producto_id', productId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('favoritos')
          .insert({
            usuario_id: user.id,
            producto_id: productId
          });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggleando favorito:', err);
      throw err;
    }
  };

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  return {
    isFavorite,
    loading,
    toggleFavorite
  };
};