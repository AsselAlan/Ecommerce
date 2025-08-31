/**
 * Componente mejorado de ProductCard que utiliza las nuevas funcionalidades
 * Incluye: favoritos, variantes, reviews y mejor UX
 */

import React, { useState } from 'react';
import { Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaEye } from 'react-icons/fa';
import { useFavoriteStatus } from '../../hooks/favorites/useFavorites';
import { useProductRating } from '../../hooks/useProductReviews';
import { useVariantInfo } from '../../hooks/useProductVariants';
import { useAuth } from '../../hooks/useAuth';

const ProductCard = ({ 
  producto,
  onViewDetails,
  onAddToCart,
  className = '',
  showVariantInfo = true,
  showRating = true,
  showFavoriteButton = true 
}) => {
  const { user } = useAuth();
  const { isFavorite, loading: favoriteLoading, toggleFavorite } = useFavoriteStatus(producto.id);
  const { rating, loading: ratingLoading } = useProductRating(showRating ? producto.id : null);
  const { variantInfo, loading: variantLoading } = useVariantInfo(showVariantInfo ? producto.id : null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calcular precio final considerando descuento
  const precioFinal = producto.precio_descuento || producto.precio;
  const tieneDescuento = producto.precio_descuento && producto.precio_descuento < producto.precio;
  const porcentajeDescuento = tieneDescuento 
    ? Math.round(((producto.precio - producto.precio_descuento) / producto.precio) * 100)
    : 0;

  // Determinar estado del stock
  const sinStock = producto.stock <= 0;
  const stockBajo = producto.stock > 0 && producto.stock <= 5;

  // Manejar toggle de favoritos
  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Evitar que se dispare el click del card
    
    if (!user) {
      setError('Debes iniciar sesión para agregar favoritos');
      return;
    }

    try {
      setError(null);
      await toggleFavorite();
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar agregar al carrito
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (sinStock) return;
    
    try {
      setActionLoading(true);
      setError(null);
      await onAddToCart(producto);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Renderizar estrellas de rating
  const renderStars = () => {
    if (ratingLoading) return <Spinner size="sm" />;
    
    const stars = [];
    const fullStars = Math.floor(rating.average);
    const hasHalfStar = rating.average % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-muted" />);
      }
    }
    
    return (
      <div className="d-flex align-items-center gap-1">
        {stars}
        <small className="text-muted ms-1">({rating.total})</small>
      </div>
    );
  };

  // Renderizar información de variantes
  const renderVariantInfo = () => {
    if (!showVariantInfo || variantLoading) return null;
    
    if (variantInfo.hasVariants) {
      return (
        <div className="variant-info mt-2">
          {variantInfo.colors.length > 0 && (
            <small className="text-muted d-block">
              Colores: {variantInfo.colors.join(', ')}
            </small>
          )}
          {variantInfo.sizes.length > 0 && (
            <small className="text-muted d-block">
              Talles: {variantInfo.sizes.join(', ')}
            </small>
          )}
          {variantInfo.priceRange && variantInfo.priceRange.max > 0 && (
            <small className="text-muted d-block">
              +${variantInfo.priceRange.min} - ${variantInfo.priceRange.max}
            </small>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card 
      className={`h-100 product-card ${className}`}
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      onClick={() => onViewDetails(producto)}
    >
      {/* Imagen del producto */}
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={producto.imagen_url || '/placeholder-product.jpg'} 
          alt={producto.nombre}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        
        {/* Badges superiores */}
        <div className="position-absolute top-0 start-0 p-2">
          {producto.destacado && (
            <Badge bg="warning" text="dark" className="me-1">
              Destacado
            </Badge>
          )}
          {tieneDescuento && (
            <Badge bg="danger">
              -{porcentajeDescuento}%
            </Badge>
          )}
          {sinStock && (
            <Badge bg="secondary" className="ms-1">
              Sin Stock
            </Badge>
          )}
          {stockBajo && !sinStock && (
            <Badge bg="warning" text="dark" className="ms-1">
              Stock Bajo
            </Badge>
          )}
        </div>

        {/* Botón de favorito */}
        {showFavoriteButton && (
          <div className="position-absolute top-0 end-0 p-2">
            <Button
              variant="light"
              size="sm"
              className="rounded-circle p-2"
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
            >
              {favoriteLoading ? (
                <Spinner size="sm" />
              ) : isFavorite ? (
                <FaHeart className="text-danger" />
              ) : (
                <FaRegHeart />
              )}
            </Button>
          </div>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Nombre del producto */}
        <Card.Title className="h6 mb-2" style={{ minHeight: '2.5rem' }}>
          {producto.nombre}
        </Card.Title>

        {/* Rating */}
        {showRating && (
          <div className="mb-2">
            {renderStars()}
          </div>
        )}

        {/* Información de variantes */}
        {renderVariantInfo()}

        {/* Precio */}
        <div className="price-section mt-auto">
          <div className="d-flex align-items-center gap-2">
            <span className="h5 mb-0 text-success fw-bold">
              ${precioFinal?.toLocaleString('es-AR')}
            </span>
            {tieneDescuento && (
              <span className="text-muted text-decoration-line-through">
                ${producto.precio?.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>

        {/* Información de stock */}
        {!sinStock && (
          <small className="text-muted mt-1">
            {stockBajo ? `Solo quedan ${producto.stock} unidades` : 'En stock'}
          </small>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="danger" className="mt-2 py-1 px-2 small" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="action-buttons mt-3 d-flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-grow-1"
            disabled={sinStock || actionLoading}
            onClick={handleAddToCart}
          >
            {actionLoading ? (
              <Spinner size="sm" className="me-1" />
            ) : (
              <FaShoppingCart className="me-1" />
            )}
            {sinStock ? 'Sin Stock' : 'Agregar'}
          </Button>
          
          <Button
            variant="outline-primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(producto);
            }}
          >
            <FaEye />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// Componente de loading para ProductCard
export const ProductCardSkeleton = () => (
  <Card className="h-100">
    <div 
      style={{ height: '200px', backgroundColor: '#f8f9fa' }}
      className="d-flex align-items-center justify-content-center"
    >
      <Spinner animation="border" variant="secondary" />
    </div>
    <Card.Body>
      <div className="placeholder-glow">
        <div className="placeholder col-8 mb-2"></div>
        <div className="placeholder col-6 mb-2"></div>
        <div className="placeholder col-4 mb-3"></div>
        <div className="placeholder col-12 placeholder-sm"></div>
      </div>
    </Card.Body>
  </Card>
);

export default ProductCard;