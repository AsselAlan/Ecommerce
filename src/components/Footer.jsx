import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-light mt-5 py-4 border-top">
      <Container>
        <Row className="text-center text-md-start">
          <Col md={4} className="mb-3">
            <h5 className="text-primary fw-bold">🐾 EntrePatitas</h5>
            <p className="small text-muted">
              Accesorios y juguetes que enamoran a tu mascota.
            </p>
          </Col>
          <Col md={4} className="mb-3">
            <h6>Enlaces</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-decoration-none text-muted">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-decoration-none text-muted"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none text-muted">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={4} className="mb-3">
            <h6>Contacto</h6>
            <p className="small text-muted mb-0">
              WhatsApp: +54 9 11 1234 5678
            </p>
            <p className="small text-muted mb-0">
              Email: hola@entrepatitas.com
            </p>
            <p className="small text-muted">
              © {new Date().getFullYear()} EntrePatitas
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
