import React from "react";
import { useProducts } from "../../context/ProductContext";
import { Card, Col, Container, Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import './home.css' 

const Home = () => {
  const { featured } = useProducts();

  return (
    <Container className="mt-4">
      {/* Carrusel principal */}
      <section className="mb-5">
        <div className="bg-light p-4 text-center rounded shadow-sm" style={{position:'relative', overflow:'hidden'}}>
          <h2>🎉 ¡Ofertas Exclusivas en EntrePatitas! 🎉</h2>
          <p style={{fontSize:'1.1rem', color:'#b48a78'}}>Productos irresistibles para tu mejor amigo.</p>
          <img
            src="https://placehold.co/800x300?text=Banner+EntrePatitas"
            alt="ofertas"
            className="img-fluid rounded"
            style={{objectFit:'cover', maxHeight:'340px', width:'100%'}}
          />
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mb-5">
        <h3 className="mb-4 text-center color-green apple-medium">Nuestros productos <span className="text-italic apple-bold">destacados</span></h3>
        <Row className="justify-content-center">
          {featured.map((product) => (
            <Col key={product.id} md={4} className="mb-4 d-flex">
              <Card className="h-100 hover-shadow w-100" style={{position:'relative', minHeight:'370px'}}>
                {/* Etiqueta NUEVO si aplica */}
                {product.nuevo && (
                  <span style={{position:'absolute',top:12,left:12,background:'#2d3a2d',color:'#fff',fontSize:'0.85rem',fontWeight:600,padding:'4px 12px',borderRadius:'8px',zIndex:2}}>NUEVO</span>
                )}
                <Carousel interval={null} indicators={false}>
                  {product.imagenes_extra?.map((img, index) => (
                    <Carousel.Item key={index}>
                      <Card.Img variant="top" src={img} />
                    </Carousel.Item>
                  ))}
                </Carousel>

                <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                  <Card.Title className="text-center">{product.nombre}</Card.Title>
                  <Card.Text className="text-center">{product.descripcion}</Card.Text>
                  <strong style={{fontSize:'1.1rem', color:'#2d3a2d'}}>${product.precio}</strong>
                  <div className="d-grid mt-3 w-100">
                    <Button
                      as={Link}
                      to={`/product/${product.id}`}
                      variant="primary"
                      className="add-cart-btn"
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
        <h3 className="mb-4 text-center"><span style={{fontStyle:'italic', color:'#b48a78'}}>Categorías</span></h3>
        <Row className="justify-content-center">
          <Col md={6} className="mb-4 d-flex">
            <Card className="h-100 text-center border-info w-100 categoria-card">
              <Card.Img
                variant="top"
                src="https://placehold.co/400x250/38bdf8/ffffff?text=Accesorios"
                className="card-img"
              />
              <Card.Body>
                <Card.Title className="categoria-title">Accesorios</Card.Title>
                <Button
                  variant="info"
                  as={Link}
                  to="/products?category=accesorios"
                  className="categoria-btn"
                >
                  Ver productos
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4 d-flex">
            <Card className="h-100 text-center border-warning w-100 categoria-card">
              <Card.Img
                variant="top"
                src="https://placehold.co/400x250/facc15/000000?text=Juguetes"
                className="card-img"
              />
              <Card.Body>
                <Card.Title className="categoria-title">Juguetes</Card.Title>
                <Button
                  variant="warning"
                  as={Link}
                  to="/products?category=juguetes"
                  className="categoria-btn"
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
