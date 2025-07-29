import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Validación de email
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validación de contraseña
  const isValidPassword = (pwd) => pwd.length >= 6 && /\d/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("La contraseña debe tener al menos 6 caracteres y un número.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await register(email, password, nombre, apellido);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
    <h2 className="mb-4 apple-regular title-auth">Crear cuenta</h2>
    {error && <Alert variant="danger">{error}</Alert>}
    {success && (
      <Alert variant="success">Registro exitoso. Redirigiendo...</Alert>
    )}
    
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="nombre" className="sans-regular">Nombre</Form.Label>
        <Form.Control
          id="nombre"
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="apellido" className="sans-regular">Apellido</Form.Label>
        <Form.Control
          id="apellido"
          type="text"
          placeholder="Tu apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="email" className="sans-regular">Email</Form.Label>
        <Form.Control
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="password" className="sans-regular">Contraseña</Form.Label>
        <Form.Control
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres y al menos un número"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label htmlFor="confirmPassword" className="sans-regular">Confirma contraseña</Form.Label>
        <Form.Control
          id="confirmPassword"
          type="password"
          placeholder="Repetí tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </Form.Group>

      <button type="submit" className="w-100 btn-complete sans-regular">
        Registrarme
      </button>
    </Form>
  </Container>
  );
};

export default Register;
