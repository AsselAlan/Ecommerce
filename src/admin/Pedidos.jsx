import React, { useEffect, useState } from "react";
import { Table, Badge, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { supabase } from "../libs/supabaseClient";

const DashboardPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchPedidos = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_pedidos");

    if (error) {
      console.error("Error al cargar pedidos:", error);
    } else {
      setPedidos(data);
    }
    setLoading(false);
  };

  const filtrarPedidos = () => {
    return pedidos.filter((pedido) => {
      const fecha = new Date(pedido.fecha_creacion);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      return (
        (!estadoFiltro || pedido.estado === estadoFiltro) &&
        (!desde || fecha >= desde) &&
        (!hasta || fecha <= hasta)
      );
    });
  };

  const marcarComoCompletado = async (id) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ estado: "completado" })
      .eq("id", id);

    if (!error) {
      fetchPedidos();
    } else {
      alert("No se pudo actualizar el estado.");
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div>
      <h2 className="mb-4">📦 Pedidos</h2>

      <Form className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Filtrar por estado</Form.Label>
              <Form.Select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="enviado">Enviado</option>
                <option value="cancelado">Cancelado</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Hasta</Form.Label>
              <Form.Control
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.numero_orden}</td>
                <td>{pedido.usuario || "Desconocido"}</td>
                <td>{new Date(pedido.fecha_creacion).toLocaleString()}</td>
                <td>${pedido.total}</td>
                <td>
                  <Badge
                    bg={pedido.estado === "completado" ? "success" : "warning"}
                  >
                    {pedido.estado}
                  </Badge>
                </td>
                <td>
                  {pedido.estado !== "completado" && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => marcarComoCompletado(pedido.id)}
                    >
                      Marcar como completado
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default DashboardPedidos;
