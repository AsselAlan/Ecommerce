import React, { useEffect, useState } from "react";
import { Table, Spinner, Badge } from "react-bootstrap";
import { supabase } from "../libs/supabaseClient";

const DashboardUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarUsuarios = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc("get_usuarios");

    if (error) {
      console.error("Error al cargar usuarios:", error);
    } else {
      setUsuarios(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">👤 Usuarios registrados</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Email</th>
            <th>Provincia</th>
            <th>Ciudad</th>
            <th>Teléfono</th>
            <th>Registrado</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => {
            const meta = u.user_metadata || {};
            return (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{meta.provincia || "-"}</td>
                <td>{meta.ciudad || "-"}</td>
                <td>{meta.telefono || "-"}</td>
                <td>
                  <Badge bg="info">
                    {new Date(u.created_at).toLocaleDateString()}
                  </Badge>
                </td>
                <td>
                  <code>{u.id.slice(0, 8)}...</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default DashboardUsuarios;
