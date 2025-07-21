import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Outlet, NavLink } from "react-router-dom";

const AdminLayout = () => {
  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={2} className="bg-light min-vh-100 p-3 border-end">
          <h4 className="text-center mb-4">EntrePatitas 🐾</h4>
          <Nav className="flex-column">
            <Nav.Link as={NavLink} to="/admin" end>
              Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/pedidos">
              Pedidos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/productos">
              Productos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/usuarios">
              Usuarios
            </Nav.Link>
          </Nav>
        </Col>

        {/* Contenido principal */}
        <Col md={10} className="p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
