import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Collapse,
  Spinner,
} from "react-bootstrap";
import { useCart } from "../context/CartContext";
import { Link, useSearchParams } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import { getAllProducts } from "../services/productService";

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  // Estados sincronizados con la URL
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";
  const initialSort = searchParams.get("sort") === "price";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sortByPrice, setSortByPrice] = useState(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllProducts()
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sortByPrice) params.sort = "price";
    setSearchParams(params);
  }, [category, search, maxPrice, sortByPrice]);

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nombre
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category ? p.categoria === category : true;
    const matchesPrice = maxPrice ? p.precio <= maxPrice : true;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = sortByPrice
    ? [...filteredProducts].sort((a, b) => a.precio - b.precio)
    : filteredProducts;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        {/* Sidebar de filtros (izquierda) */}
        <Col md={3}>
          <Button
            variant="outline-secondary"
            className="mb-3"
            onClick={() => setShowFilters(!showFilters)}
            aria-controls="filters-collapse"
            aria-expanded={showFilters}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>

          <Collapse in={showFilters}>
            <div
              id="filters-collapse"
              className="sticky-top"
              style={{ top: "80px" }}
            >
              <hr />

              <h5 className="mb-3">Categorías</h5>
              {["", "juguetes", "accesorios", "comederos", "higiene"].map(
                (cat) => (
                  <Form.Check
                    key={cat || "todas"}
                    type="radio"
                    name="category"
                    label={
                      cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "Todas"
                    }
                    value={cat}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    checked={category === cat}
                  />
                )
              )}

              <hr />

              <h5 className="mb-3">Filtrar por precio</h5>

              <Form.Check
                type="checkbox"
                label="Más baratos"
                checked={sortByPrice}
                onChange={() => setSortByPrice(!sortByPrice)}
              />

              <Form.Range
                min="500"
                max="5000"
                step="100"
                value={maxPrice || 5000}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <div>Hasta: ${maxPrice || "5000"}</div>
              <hr />
            </div>
          </Collapse>
        </Col>

        {/* Productos (derecha) */}
        <Col md={9}>
          <Form className="mb-4">
            <Form.Control
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form>

          <Row>
            {sortedProducts.map((product) => (
              <Col md={4} sm={6} className="mb-4" key={product.id}>
                <Card className="h-100">
                  <Carousel interval={null} indicators={false}>
                    {[
                      product.imagen_url,
                      ...(product.imagenes_extra || []),
                    ].map((img, index) => (
                      <Carousel.Item key={index}>
                        <Card.Img variant="top" src={img} />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-decoration-none text-dark"
                  >
                    <Card.Body>
                      <Card.Title>{product.nombre}</Card.Title>
                      <Card.Text>{product.descripcion}</Card.Text>
                      <strong>${product.precio}</strong>
                    </Card.Body>
                  </Link>
                  <Card.Footer className="d-grid mt-2">
                    <Button
                      variant="primary"
                      onClick={() => addToCart(product)}
                    >
                      Agregar al carrito
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Products;
