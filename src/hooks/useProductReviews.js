/**
 * Hook para manejar reviews/reseñas de productos
 * Utiliza la nueva tabla 'producto_reviews' creada en la migración 005
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../libs/supabaseClient';
import { useAuth } from '../useAuth';

export const useProductReviews = (productId) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar reviews del producto
  const loadReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener reviews aprobadas con información del usuario
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('producto_reviews')
        .select(`
          *,
          perfiles_usuario:usuario_id (
            nombre,
            apellido
          )
        `)
        .eq('producto_id', productId)
        .eq('aprobada', true)
        .order('fecha_creacion', { ascending: false });

      if (reviewsError) throw reviewsError;

      setReviews(reviewsData || []);

      // Calcular estadísticas
      if (reviewsData && reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, review) => acc + review.puntuacion, 0);
        const average = sum / total;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(review => {
          distribution[review.puntuacion]++;
        });

        setReviewStats({ average, total, distribution });
      } else {
        setReviewStats({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      }

      // Si hay usuario logueado, verificar si ya hizo una review
      if (user) {
        const userReviewData = reviewsData?.find(review => review.usuario_id === user.id);
        setUserReview(userReviewData || null);
      }

    } catch (err) {
      console.error('Error cargando reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId, user]);

  // Crear nueva review
  const createReview = async (reviewData) => {
    if (!user) {
      throw new Error('Debes iniciar sesión para escribir una reseña');
    }

    try {
      const { data, error } = await supabase
        .from('producto_reviews')
        .insert({
          producto_id: productId,
          usuario_id: user.id,
          ...reviewData
        })
        .select(`
          *,
          perfiles_usuario:usuario_id (
            nombre,
            apellido
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ya has escrito una reseña para este producto');
        }
        throw error;
      }

      // Actualizar estado local
      setUserReview(data);
      await loadReviews(); // Recargar todas las reviews para actualizar estadísticas

      return data;
    } catch (err) {
      console.error('Error creando review:', err);
      throw err;
    }
  };

  // Actualizar review existente
  const updateReview = async (reviewData) => {
    if (!user || !userReview) {
      throw new Error('No tienes permisos para actualizar esta reseña');
    }

    try {
      const { data, error } = await supabase
        .from('producto_reviews')
        .update(reviewData)
        .eq('id', userReview.id)
        .eq('usuario_id', user.id)
        .select(`
          *,
          perfiles_usuario:usuario_id (
            nombre,
            apellido
          )
        `)
        .single();

      if (error) throw error;

      // Actualizar estado local
      setUserReview(data);
      await loadReviews();

      return data;
    } catch (err) {
      console.error('Error actualizando review:', err);
      throw err;
    }
  };

  // Eliminar review
  const deleteReview = async () => {
    if (!user || !userReview) {
      throw new Error('No tienes permisos para eliminar esta reseña');
    }

    try {
      const { error } = await supabase
        .from('producto_reviews')
        .delete()
        .eq('id', userReview.id)
        .eq('usuario_id', user.id);

      if (error) throw error;

      // Actualizar estado local
      setUserReview(null);
      await loadReviews();

    } catch (err) {
      console.error('Error eliminando review:', err);
      throw err;
    }
  };

  // Votar por una review (útil/no útil)
  const voteReview = async (reviewId, voteType) => {
    if (!user) {
      throw new Error('Debes iniciar sesión para votar');
    }

    try {
      // Verificar si ya votó
      const { data: existingVote } = await supabase
        .from('review_votos')
        .select('tipo_voto')
        .eq('review_id', reviewId)
        .eq('usuario_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.tipo_voto === voteType) {
          // Si es el mismo voto, eliminarlo
          await supabase
            .from('review_votos')
            .delete()
            .eq('review_id', reviewId)
            .eq('usuario_id', user.id);
        } else {
          // Si es diferente, actualizarlo
          await supabase
            .from('review_votos')
            .update({ tipo_voto: voteType })
            .eq('review_id', reviewId)
            .eq('usuario_id', user.id);
        }
      } else {
        // Crear nuevo voto
        await supabase
          .from('review_votos')
          .insert({
            review_id: reviewId,
            usuario_id: user.id,
            tipo_voto: voteType
          });
      }

      // Los contadores se actualizan automáticamente por trigger
      await loadReviews();

    } catch (err) {
      console.error('Error votando review:', err);
      throw err;
    }
  };

  // Obtener distribución de estrellas para mostrar en gráficos
  const getStarsDistribution = useCallback(() => {
    const { distribution, total } = reviewStats;
    
    return Object.entries(distribution)
      .map(([stars, count]) => ({
        stars: parseInt(stars),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.stars - a.stars);
  }, [reviewStats]);

  // Verificar si el usuario puede escribir una review
  const canWriteReview = user && !userReview;

  // Cargar reviews al montar el componente
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    userReview,
    reviewStats,
    loading,
    error,
    canWriteReview,
    createReview,
    updateReview,
    deleteReview,
    voteReview,
    getStarsDistribution,
    refreshReviews: loadReviews
  };
};

// Hook simple para obtener solo el rating promedio de un producto
export const useProductRating = (productId) => {
  const [rating, setRating] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRating = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        // Usar las funciones SQL creadas en la migración
        const [avgResult, totalResult] = await Promise.all([
          supabase.rpc('obtener_promedio_puntuacion', { producto_uuid: productId }),
          supabase.rpc('obtener_total_reviews', { producto_uuid: productId })
        ]);

        setRating({
          average: avgResult.data || 0,
          total: totalResult.data || 0
        });
      } catch (error) {
        console.error('Error cargando rating:', error);
        setRating({ average: 0, total: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadRating();
  }, [productId]);

  return { rating, loading };
};