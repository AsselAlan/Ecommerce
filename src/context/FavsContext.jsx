import React, { createContext, useContext, useEffect, useState } from "react";

const FavsContext = createContext();

export const FavsProvider = ({ children }) => {
  const [favs, setFavs] = useState(() => {
    const stored = localStorage.getItem("favs");
    return stored ? JSON.parse(stored) : [];
  });

  const addToFavs = (product) => {
    setFavs((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Si ya existe, no lo agregamos de nuevo
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromFavs = (id) => {
    setFavs((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ FUNCIÓN: Verificar si un producto está en favoritos
  const isFavorite = (productId) => {
    return favs.some((item) => item.id === productId);
  };

  // ✅ FUNCIÓN: Toggle favorito (agregar si no está, quitar si está)
  const toggleFavorite = (product) => {
    setFavs((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Si existe, lo quitamos
        return prev.filter((item) => item.id !== product.id);
      } else {
        // Si no existe, lo agregamos
        return [...prev, product];
      }
    });
  };

  // ✅ FUNCIÓN: Limpiar todos los favoritos
  const clearFavs = () => setFavs([]);

  // ✅ FUNCIÓN: Obtener cantidad de favoritos
  const getFavsCount = () => favs.length;

  // ✅ FUNCIÓN: Verificar si hay favoritos
  const hasFavs = () => favs.length > 0;

  // ✅ FUNCIÓN: Obtener favoritos por categoría (si el producto tiene categoría)
  const getFavsByCategory = (category) => {
    return favs.filter((item) => item.category === category);
  };

  // ✅ FUNCIÓN: Buscar en favoritos
  const searchInFavs = (searchTerm) => {
    return favs.filter((item) => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    localStorage.setItem("favs", JSON.stringify(favs));
  }, [favs]);

  return (
    <FavsContext.Provider
      value={{ 
        favs, 
        addToFavs, 
        removeFromFavs,
        isFavorite,
        toggleFavorite,
        clearFavs,
        getFavsCount,
        hasFavs,
        getFavsByCategory,
        searchInFavs
      }}
    >
      {children}
    </FavsContext.Provider>
  );
};

export const useFavs = () => {
  const context = useContext(FavsContext);
  if (context === undefined) {
    throw new Error('useFavs must be used within a FavsProvider');
  }
  return context;
};