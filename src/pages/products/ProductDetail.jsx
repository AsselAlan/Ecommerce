import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import { Container, Row, Col, Image, Button, ListGroup } from "react-bootstrap";

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (product?.imagen_url || product?.imagenes_extra?.length) {
      setSelectedImage(product.imagenes_extra?.[0] || product.imagen_url);
    }
  }, [product]);

  if (!product) {
    return (
      <Container className="mt-5">
        <h3>Producto no encontrado</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        {/* Miniaturas */}
        <Col md={2} className="d-none d-md-block">
          <ListGroup variant="flush">
            {product.imagenes_extra?.map((img, idx) => (
              <ListGroup.Item
                key={idx}
                className="p-1 border-0"
                style={{
                  cursor: "pointer",
                  borderRadius: 6,
                  overflow: "hidden",
                  outline: selectedImage === img ? "2px solid #0d6efd" : "none",
                }}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img}
                  thumbnail
                  fluid
                  style={{ objectFit: "cover", height: "80px", width: "100%" }}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Imagen principal */}
        <Col md={5} className="mb-4">
          <Image
            src={selectedImage}
            fluid
            rounded
            style={{
              border: "1px solid #dee2e6",
              maxHeight: "450px",
              objectFit: "contain",
              width: "100%",
            }}
          />
        </Col>

        {/* Info del producto */}
        <Col md={5}>
          <h2>{product.nombre}</h2>
          <p className="text-muted">{product.descripcion}</p>
          <h4 className="text-success">${product.precio}</h4>
          <p className="mt-2">
            Stock disponible: <strong>{product.stock}</strong>
          </p>

          <Button
            variant="primary"
            size="lg"
            className="mt-3"
            onClick={() => addToCart(product)}
          >
            Agregar al carrito
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
