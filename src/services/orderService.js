import { supabase } from "../libs/supabaseClient";

// ↓ Ya está esto en tu código:
export const crearPedido = async (pedido) => {
  // 1. Insertar pedido
  const { data: nuevoPedido, error } = await supabase
    .from("pedidos")
    .insert([pedido])
    .select(); // ← importante para obtener el id o numero de orden

  if (error) throw error;

  // 2. Por cada producto, restar el stock
  const updates = pedido.productos.map(async (prod) => {
    const { error: updateError } = await supabase.rpc("restar_stock", {
      pid: prod.id,
      cantidad: prod.cantidad,
    });
    if (updateError) throw updateError;
  });

  await Promise.all(updates);

  return nuevoPedido[0];
};
