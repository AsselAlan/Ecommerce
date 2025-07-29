import React, { useState } from "react";
import { Offcanvas, Image } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductContext";
import "./CartDrawer.css";
import CheckoutModal from "../CheckoutModal";
import CartModals from "./CartsModals";

const CartDrawer = ({ show, handleClose }) => {
  const { cart, removeFromCart, clearCart, addToCart, decrementFromCart } = useCart();
  const { user } = useAuth();
  const { featured } = useProducts();
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Estados para los modales de confirmación
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  const handleCheckout = () => {
    setShowCheckout(true);
    handleClose();
  };

  const handleIncrement = (item) => {
    addToCart(item);
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      decrementFromCart(item.id);
    }
  };

  // Funciones para manejar modales de confirmación
  const handleRemoveClick = (item) => {
    setSelectedProduct(item);
    setShowRemoveModal(true);
  };

  const handleClearClick = () => {
    setShowClearModal(true);
  };

  const confirmRemoveProduct = () => {
    if (selectedProduct) {
      removeFromCart(selectedProduct.id);
    }
    setShowRemoveModal(false);
    setSelectedProduct(null);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  const cancelModal = () => {
    setShowRemoveModal(false);
    setShowClearModal(false);
    setSelectedProduct(null);
  };

  // Obtener productos sugeridos (destacados que no estén en el carrito)
  const getSuggestedProducts = () => {
    const cartProductIds = cart.map(item => item.id);
    return featured
      .filter(product => !cartProductIds.includes(product.id))
      .slice(0, 2); // Mostrar máximo 2 productos sugeridos
  };

  const suggestedProducts = getSuggestedProducts();

  const handleAddSuggested = (product) => {
    addToCart(product);
  };

  return (
    <>
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        className="cart-drawer-custom" 
      >
        <div className="cart-header">
          <div className="cart-title apple-regular">
            <h3>Tu carrito</h3>
          </div>
          <button
            onClick={handleClose}
            className="cart-close-btn"
            title="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        <div className="cart-body sans-regular">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {/* Items del carrito */}
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="w-100 d-flex justify-content-between pb-4">
                      <div className="item-image">
                        <Image
                          src={item.imagen_url || "/placeholder-product.jpg"}
                          alt={item.nombre}
                          className="product-image"
                        />
                      </div>
                      
                      <div className="item-details ms-4 d-flex flex-column justify-content-between">
                        <h6 className="item-name mesans-medium">{item.nombre}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="item-price sans-bold">${item.precio}</p>
                          <button
                            onClick={() => handleRemoveClick(item)}
                            title="Eliminar producto"
                            className="cart-remove-btn"
                          > 
                            <svg className="trash-icon" width="19" height="23" viewBox="0 0 19 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clip-path="url(#clip0_1704_764)">
                              <path d="M13.7946 2.87709C14.7507 2.9526 15.8608 2.77423 16.7979 2.8765C18.5704 3.06914 19.1911 5.57951 17.6559 6.58913C17.4549 6.72113 17.05 6.79129 17.0072 7.01069V20.3896C16.8752 21.7292 15.8858 22.7781 14.5373 22.9136C11.1374 22.7168 7.43545 23.1788 4.07125 22.9166C2.41947 22.7882 1.50321 21.4319 1.48418 19.8551L1.48953 6.8995C-0.0302451 6.39707 -0.545162 4.4706 0.693968 3.36228C1.66256 2.49596 3.54622 3.01979 4.75741 2.87709C4.61352 1.50477 5.27708 0.215104 6.74988 0.0831042C8.04491 -0.0328412 10.4417 -0.0227332 11.7456 0.0801312C13.2595 0.19905 13.9058 1.47564 13.7946 2.87709ZM12.6655 2.87709V1.89601C12.6655 1.66472 12.081 1.12959 11.798 1.15813C10.2312 1.29786 8.27442 0.951208 6.75464 1.15813C6.16481 1.2384 5.8687 1.68791 5.82589 2.25099C5.81162 2.43709 5.78248 2.74866 5.91686 2.87769H12.6655V2.87709ZM1.82845 3.96163C0.784346 4.24287 0.85748 5.66929 1.93191 5.85124H16.6213C17.7284 5.66156 17.7344 4.11384 16.6201 3.94676L1.82904 3.96103L1.82845 3.96163ZM15.9357 6.92031H2.61688V20.5067C2.61688 20.5394 2.7905 20.9414 2.82855 21.0086C3.09552 21.4771 3.54741 21.7679 4.07957 21.8386C7.40453 21.6626 11.0101 22.0949 14.303 21.8475C14.9124 21.8018 15.3804 21.5734 15.686 21.0306C15.733 20.9467 15.9351 20.4972 15.9351 20.4473V6.92031H15.9357Z" fill="black"/>
                              <path d="M12.3538 8.35819C12.6035 8.32786 12.8539 8.46938 12.9228 8.71375L12.9621 18.9604C12.9175 19.5972 12.1986 19.7446 11.9186 19.1714L11.8906 8.85051C11.8989 8.60375 12.1148 8.38673 12.3538 8.35759V8.35819Z" fill="black"/>
                              <path d="M6.05157 8.35759C6.30605 8.32489 6.56767 8.51635 6.63189 8.76191L6.65983 18.9604C6.61524 19.5972 5.89638 19.7446 5.61632 19.1714L5.58838 8.85051C5.5967 8.60316 5.81254 8.38732 6.05157 8.357V8.35759Z" fill="black"/>
                              <path d="M9.20293 8.35759C9.45742 8.32489 9.71904 8.51635 9.78325 8.76191L9.8112 18.9604C9.76661 19.5972 9.04774 19.7446 8.76769 19.1714L8.73975 8.85051C8.74807 8.60316 8.96391 8.38732 9.20293 8.357V8.35759Z" fill="black"/>
                              </g>
                              <defs>
                              <clipPath id="clip0_1704_764">
                              <rect width="18.5281" height="23" fill="white"/>
                              </clipPath>
                              </defs>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="quantity-controls w-100">
                      <div className="quantity-buttons w-100 d-flex justify-content-between align-items-center">
                        <span className="color-label">Color: Rojo</span>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="quantity-label">Cantidad</span>
                          <button
                            onClick={() => handleDecrement(item)}
                            className={`qty-btn ${item.quantity <= 1 ? 'button-disabled' : ''}`}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="cart-total mb-4">
                <h5 className="sans-bold">Total: ${total}</h5>
              </div>

              {/* Botones de acción */}
              <div className="cart-actions sans-light">
                <button 
                  onClick={handleClearClick}
                  className="button-white"
                >
                  Vaciar
                </button>
                <button 
                  onClick={handleCheckout}
                  className="button-green sans-light"
                >
                  Comprar
                </button>
              </div>

              {/* Productos sugeridos */}
              {suggestedProducts.length > 0 && (
                <div className="suggested-products sans-medium">
                  <h5 className="apple-regular">Otros productos que podrían interesarte</h5>
                  <div className="suggested-grid">
                    {suggestedProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="suggested-item d-flex flex-column justify-content-between align-items-center"
                        onClick={() => handleAddSuggested(product)}
                      >
                        <Image
                          src={product.imagen_url || "/placeholder-product.jpg"}
                          alt={product.nombre}
                          className="suggested-image"
                        />
                        <div className="suggested-info">
                          <p className="suggested-name apple-regular pb-4">{product.nombre}</p>
                          <p className="suggested-price">${product.precio}</p>
                        </div>
                        <button 
                          className="button-white px-0 w-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSuggested(product);
                          }}
                        >
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Offcanvas>

      {/* Modal de Checkout */}
      <CheckoutModal
        show={showCheckout}
        handleClose={() => setShowCheckout(false)}
      />

      {/* Modales de confirmación */}
      <CartModals
        showRemoveModal={showRemoveModal}
        showClearModal={showClearModal}
        selectedProduct={selectedProduct}
        onConfirmRemove={confirmRemoveProduct}
        onConfirmClear={confirmClearCart}
        onCancel={cancelModal}
      />
    </>
  );
};

export default CartDrawer;