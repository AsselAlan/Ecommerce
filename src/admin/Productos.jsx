import React, { useEffect, useState } from "react";
import { Table, Badge, Button, Spinner } from "react-bootstrap";
import { supabase } from "../libs/supabaseClient";
import NuevoProductoModal from "./NuevoProductoModal";

const DashboardProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("fecha_creacion", { ascending: false });

    if (error) {
      console.error("Error al cargar productos:", error);
    } else {
      setProductos(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const toggleActivo = async (id, estadoActual) => {
    await supabase
      .from("productos")
      .update({ activo: !estadoActual })
      .eq("id", id);
    fetchProductos();
  };

  const toggleDestacado = async (id, estadoActual) => {
    await supabase
      .from("productos")
      .update({ destacado: !estadoActual })
      .eq("id", id);
    fetchProductos();
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">🛍️ Productos</h2>
      <Button
        variant="primary"
        className="mb-3"
        onClick={() => setModalShow(true)}
      >
        ➕ Nuevo Producto
      </Button>

      <NuevoProductoModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        onProductoCreado={() => {
          // recargar productos
        }}
      />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Activo</th>
            <th>Destacado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>${p.precio}</td>
              <td>{p.stock}</td>
              <td>
                <Badge bg={p.activo ? "success" : "secondary"}>
                  {p.activo ? "Sí" : "No"}
                </Badge>
              </td>
              <td>
                <Badge
                  bg={p.destacado ? "warning" : "light"}
                  text={p.destacado ? "dark" : "muted"}
                >
                  {p.destacado ? "Sí" : "No"}
                </Badge>
              </td>
              <td>
                <Button
                  size="sm"
                  variant={p.activo ? "outline-danger" : "outline-success"}
                  className="me-2"
                  onClick={() => toggleActivo(p.id, p.activo)}
                >
                  {p.activo ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline-warning"
                  onClick={() => toggleDestacado(p.id, p.destacado)}
                >
                  {p.destacado ? "Quitar Destacado" : "Destacar"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DashboardProductos;
