import React, { useEffect, useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../libs/supabaseClient";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [codigopostal, setCodigoPostal] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      const metadata = user.user_metadata || {};
      setTelefono(metadata.telefono || "");
      setDireccion(metadata.direccion || "");
      setCodigoPostal(metadata.codigopostal || "");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { error } = await supabase.auth.updateUser({
      data: {
        telefono,
        direccion,
        codigopostal,
      },
    });

    if (error) {
      setError("Hubo un problema al actualizar los datos.");
    } else {
      setSuccess(true);
    }
  };

  return (
    <Container
      className="py-5"
      style={{ minHeight: "calc(100vh - 310px)", maxWidth: "600px" }}
    >
      <h2 className="mb-4">📋 Mi Perfil</h2>
      {success && <Alert variant="success">¡Datos actualizados!</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control value={user?.user_metadata?.nombre || ""} disabled />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control value={user?.user_metadata?.apellido || ""} disabled />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control value={user?.email || ""} disabled />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 11-1234-5678"
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: Av. Siempreviva 742"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Código Postal</Form.Label>
          <Form.Control
            type="text"
            value={codigopostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button type="submit" variant="primary">
            Guardar cambios
          </Button>
          <Button variant="outline-danger" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default Profile;
