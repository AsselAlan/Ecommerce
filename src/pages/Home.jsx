import React from "react";
import { useProducts } from "../context/ProductContext";
import { Card, Col, Container, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";

const Home = () => {
  const { featured } = useProducts();

  return (
    <Container className="mt-4">
      {/* Carrusel principal */}
      <section className="mb-5">
        <div className="bg-light p-4 text-center rounded shadow-sm">
          <h2>🎉 ¡Ofertas Exclusivas en EntrePatitas! 🎉</h2>
          <p>Productos irresistibles para tu mejor amigo.</p>
          <img
            src="https://placehold.co/800x300?text=Banner+EntrePatitas"
            alt="ofertas"
            className="img-fluid rounded"
          />
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mb-5">
        <h3 className="mb-4">🐾 Productos Destacados</h3>
        <Row>
          {featured.map((product) => (
            <Col key={product.id} md={4} className="mb-4">
              <Card className="h-100 hover-shadow">
                <Carousel interval={null} indicators={false}>
                  {product.imagenes_extra?.map((img, index) => (
                    <Carousel.Item key={index}>
                      <Card.Img variant="top" src={img} />
                    </Carousel.Item>
                  ))}
                </Carousel>

                <Card.Body>
                  <Card.Title>{product.nombre}</Card.Title>
                  <Card.Text>{product.descripcion}</Card.Text>
                  <strong>${product.precio}</strong>
                  <div className="d-grid mt-3">
                    <Button
                      as={Link}
                      to={`/product/${product.id}`}
                      variant="primary"
                    >
                      Ver más
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Selección por categoría */}
      <section>
        <h3 className="mb-4">🎯 Buscar por categoría</h3>
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 text-center border-info">
              <Card.Img
                variant="top"
                src="https://placehold.co/400x250/38bdf8/ffffff?text=Accesorios"
              />
              <Card.Body>
                <Card.Title>Accesorios</Card.Title>
                <Button
                  variant="info"
                  as={Link}
                  to="/products?category=accesorios"
                >
                  Ver productos
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 text-center border-warning">
              <Card.Img
                variant="top"
                src="https://placehold.co/400x250/facc15/000000?text=Juguetes"
              />
              <Card.Body>
                <Card.Title>Juguetes</Card.Title>
                <Button
                  variant="warning"
                  as={Link}
                  to="/products?category=juguetes"
                >
                  Ver productos
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </Container>
  );
};

export default Home;
