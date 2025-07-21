import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { supabase } from "../libs/supabaseClient";

const Dashboard = () => {
  const [stats, setStats] = useState({
    pedidos: 0,
    productos: 0,
    usuarios: 0,
    totalVendido: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      setLoading(true);
      try {
        const [
          { count: pedidos },
          { count: productos },
          { data: usuariosData },
          { data: ordenes },
        ] = await Promise.all([
          supabase.from("pedidos").select("*", { count: "exact", head: true }),
          supabase
            .from("productos")
            .select("*", { count: "exact", head: true }),
          supabase.rpc("get_usuarios"),
          supabase.from("pedidos").select("total").eq("estado", "completado"),
        ]);

        const totalVendido = ordenes?.reduce((acc, p) => acc + p.total, 0) || 0;
        const usuarios = usuariosData.length ?? 0;

        setStats({
          pedidos: pedidos || 0,
          productos: productos || 0,
          usuarios,
          totalVendido,
        });
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  return (
    <div>
      <h2 className="mb-4">📊 Dashboard de Administración</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          <Col md={3}>
            <Card bg="info" text="white" className="mb-4">
              <Card.Body>
                <Card.Title>Pedidos</Card.Title>
                <h3>{stats.pedidos}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card bg="success" text="white" className="mb-4">
              <Card.Body>
                <Card.Title>Productos</Card.Title>
                <h3>{stats.productos}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card bg="warning" text="dark" className="mb-4">
              <Card.Body>
                <Card.Title>Usuarios</Card.Title>
                <h3>{stats.usuarios}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card bg="danger" text="white" className="mb-4">
              <Card.Body>
                <Card.Title>Total Vendido</Card.Title>
                <h4>${stats.totalVendido.toLocaleString()}</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
