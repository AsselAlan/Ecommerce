import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Credenciales incorrectas o usuario no registrado.");
    }
  };

  return (
    <Container className="container-auth mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 apple-regular title-auth">Iniciar sesión</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
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

        <Form.Group className="mb-4">
          <Form.Label htmlFor="password" className="sans-regular">Contraseña</Form.Label>
          <Form.Control
            id="password"
            type="password" 
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <button type="submit" className="w-100 btn-complete sans-regular">
          Iniciar sesión
        </button>
      </Form>
    </Container>
  );
};

export default Login;
