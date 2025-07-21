import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, Container } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../libs/supabaseClient";

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const { data, error } = await supabase
            .from("pedidos")
            .select("*")
            .eq("usuario", user.id)
            .order("fecha_creacion", { ascending: false });
          if (error) throw error;
          setOrders(data);
        } catch (err) {
          setError("No se pudieron cargar tus pedidos.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 310px)" }}
      >
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-4" style={{ minHeight: "calc(100vh - 310px)" }}>
      <h3>📦 Mis Pedidos</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Orden #</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Pago</th>
            <th>Seguimiento</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.numero_orden}>
              <td>{o.numero_orden}</td>
              <td>{new Date(o.fecha_creacion).toLocaleDateString()}</td>
              <td>{o.estado}</td>
              <td>${o.total}</td>
              <td>{o.estado_pago}</td>
              <td>{o.numero_seguimiento || "Despacho pendiente"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default UserOrders;
