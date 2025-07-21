import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllProducts, obtenerDestacados } from "../services/productService";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const allProducts = await getAllProducts();
        const destacados = await obtenerDestacados();
        setProducts(allProducts);
        setFeatured(destacados);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return (
    <ProductContext.Provider value={{ products, featured, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
