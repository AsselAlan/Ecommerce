import { supabase } from "../libs/supabaseClient";

// Obtener todos los productos activos
export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true);

  if (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }

  return data;
};

// Obtener producto por ID
export const obtenerProductoPorId = async (id) => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error al obtener producto:", error);
    throw error;
  }

  return data;
};

// Obtener productos destacados
export const obtenerDestacados = async () => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .eq("destacado", true);

  if (error) {
    console.error("Error al obtener productos destacados:", error);
    throw error;
  }

  return data;
};

// Filtrar por categoría (opcional)
export const obtenerPorCategoria = async (categoria) => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .eq("categoria", categoria);

  if (error) {
    console.error("Error al obtener productos por categoría:", error);
    throw error;
  }

  return data;
};
