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
import { useCart } from "../../context/CartContext";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import { getAllProducts } from "../../services/productService";
import { useFavs } from "../../context/FavsContext";
import "./Products.css";  

const Products = () => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavs(); // ✅ Usamos toggleFavorite e isFavorite
  const navigate = useNavigate();
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
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Función para navegar al detalle del producto
  const handleReadMore = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${productId}`);
  };

  // Función para manejar el toggle de favoritos
  const handleToggleFavorite = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  // Función para truncar texto
  const truncateText = (text, maxWords = 15) => {
    if (!text) return text;
    
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Función para verificar si el texto necesita truncado
  const needsTruncation = (text, maxWords = 15) => {
    if (!text) return false;
    return text.split(' ').length > maxWords;
  };

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
    <Container className="mt-4 container-section">
      <Row>
        {/* Sidebar de filtros (izquierda) */}
        <Col md={3}>
          <button
            // variant="outline-secondary"
            className="mb-3 btn-filtros"
            onClick={() => setShowFilters(!showFilters)}
            aria-controls="filters-collapse"
            aria-expanded={showFilters}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>

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
                className="form-range"
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
              <Col xxl={2} xl={3} lg={3} md={4} sm={6} className="mb-4 container-product" key={product.id}>
                <Card className="h-100 product-card">
                    <div 
                      className="product-image-container"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <Card.Img 
                        variant="top" 
                        src={
                          hoveredProduct === product.id && product.imagenes_extra?.length > 0
                            ? product.imagenes_extra[0]
                            : product.imagen_url 
                        }
                        className="product-image"
                      />
                    </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-decoration-none text-dark"
                  >
                    <Card.Body className="m-0 p-0">
                        <div className="d-flex justify-content-araund align-items-start">
                          <Card.Title className="apple-medium">{product.nombre}</Card.Title>
                            <Button
                                className="btn-fav-add"
                                variant="primary"
                                onClick={(e) => handleToggleFavorite(product, e)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '4px',
                                  transition: 'transform 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                <svg 
                                  className="trash-icon-fav" 
                                  width="33" 
                                  height="29" 
                                  viewBox="0 0 33 29" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ 
                                    transition: 'all 0.3s ease',
                                    filter: isFavorite(product.id) ? 'drop-shadow(0 0 4px rgba(4, 91, 71, 0.4))' : 'none'
                                  }}
                                >
                                  <path 
                                    d="M9.13191 1.00971C12.3715 0.995377 14.8682 3.02225 16.4026 5.67645C16.5588 5.71307 16.8048 5.1343 16.9092 4.98225C22.6172 -3.28287 33.6252 2.46737 31.7978 11.7467C30.9521 16.0401 26.4346 19.8224 23.2411 22.5952C21.417 24.1794 19.4261 25.9261 17.5324 27.4084C16.9942 27.8295 16.6332 28.2292 15.879 27.8447C11.716 23.8801 5.79843 20.2857 2.68265 15.4303C-1.01178 9.67287 1.48247 1.04235 9.13191 1.00971Z" 
                                    stroke="#045b47" 
                                    strokeMiterlimit="10"
                                    fill={isFavorite(product.id) ? "#045b47" : "transparent"}
                                    strokeWidth={isFavorite(product.id) ? "1" : "1"}
                                  />
                                </svg>
                            </Button>
                        </div>
                      <Card.Text className="sans-regular">
                        {truncateText(product.descripcion, 10)}
                        {needsTruncation(product.descripcion, 10) && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-1 sans-regular"
                            style={{ 
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              verticalAlign: 'baseline',
                              color: '#045b47'
                            }}
                            onClick={(e) => handleReadMore(product.id, e)}
                          >
                            Leer más
                          </Button>
                        )}
                      </Card.Text>
                      <p className="card-price sans-medium">${product.precio}</p>
                    </Card.Body>
                  </Link>
                  <Card.Footer>
                    <button
                      variant="primary"
                      onClick={() => addToCart(product)}
                      className="sans-ligth"
                    >
                      Agregar al carrito
                    </button>
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