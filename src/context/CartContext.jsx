import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ NUEVA FUNCIÓN: Limpiar carrito solo si el pago fue exitoso
  const clearCartAfterPayment = (numeroOrden) => {
    const cartCleared = localStorage.getItem(`cart_cleared_${numeroOrden}`);
    
    if (!cartCleared) {
      console.log(`🧹 Limpiando carrito después del pago exitoso de la orden #${numeroOrden}`);
      setCart([]);
      localStorage.setItem(`cart_cleared_${numeroOrden}`, 'true');
      
      // Limpiar la marca después de 1 hora para evitar acumulación
      setTimeout(() => {
        localStorage.removeItem(`cart_cleared_${numeroOrden}`);
      }, 3600000); // 1 hora
    } else {
      console.log(`ℹ️ Carrito ya fue limpiado para la orden #${numeroOrden}`);
    }
  };

  const clearCart = () => setCart([]);

  // ✅ NUEVA FUNCIÓN: Verificar si hay un pago pendiente
  const hasPendingPayment = () => {
    const pendingPayment = localStorage.getItem('pending_payment_order');
    return pendingPayment !== null;
  };

  // ✅ NUEVA FUNCIÓN: Marcar pago como pendiente
  const setPendingPayment = (numeroOrden) => {
    console.log(`⏳ Marcando pago como pendiente para orden #${numeroOrden}`);
    localStorage.setItem('pending_payment_order', numeroOrden.toString());
  };

  // ✅ NUEVA FUNCIÓN: Limpiar pago pendiente
  const clearPendingPayment = () => {
    console.log('🧹 Limpiando estado de pago pendiente');
    localStorage.removeItem('pending_payment_order');
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        clearCart,
        clearCartAfterPayment, // ← NUEVA
        hasPendingPayment,     // ← NUEVA
        setPendingPayment,     // ← NUEVA
        clearPendingPayment    // ← NUEVA
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
