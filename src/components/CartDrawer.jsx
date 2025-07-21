import React, { useState } from "react";
import { Offcanvas, Button, ListGroup, Image } from "react-bootstrap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CheckoutModal from "./CheckoutModal";

const CartDrawer = ({ show, handleClose }) => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0
  );

  const handleCheckout = () => {
    setShowCheckout(true);
    handleClose(); // Cerramos el drawer al abrir el modal
  };

  return (
    <>
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        className="cart-drawer"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>🛒 Tu Carrito</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {cart.length === 0 ? (
            <p>Tu carrito está vacío.</p>
          ) : (
            <>
              <ListGroup variant="flush">
                {cart.map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center gap-2">
                      {item.imagen_url && (
                        <Image
                          src={item.imagen_url}
                          alt={item.nombre}
                          rounded
                          width="40"
                          height="40"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                      <div>
                        <strong>{item.nombre}</strong> x{item.quantity}
                        <div>${item.precio * item.quantity}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ❌
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="mt-4">
                <h5>Total: ${total}</h5>
                <Button variant="danger" onClick={clearCart} className="me-2">
                  Vaciar
                </Button>
                <Button variant="success" onClick={handleCheckout}>
                  Finalizar Compra
                </Button>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modal de checkout */}
      <CheckoutModal
        show={showCheckout}
        handleClose={() => setShowCheckout(false)}
      />
    </>
  );
};

export default CartDrawer;
