import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  FormControl,
  Button,
  Dropdown,
  Offcanvas,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaShoppingCart } from "react-icons/fa";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const AppNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const [showCart, setShowCart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCartOpen = () => setShowCart(true);
  const handleCartClose = () => setShowCart(false);
  const handleMenuClose = () => setShowMenu(false);
  const handleMenuOpen = () => setShowMenu(true);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userName = user?.user_metadata?.nombre || "Cuenta";

  return (
    <>
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
            🐾 EntrePatitas
          </Navbar.Brand>

          {/* Carrito + Burger en mobile */}
          <div className="d-flex align-items-center d-lg-none">
            <Nav.Link onClick={handleCartOpen} className="me-2">
              <FaShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="ms-1 badge bg-danger rounded-pill">
                  {cart.length}
                </span>
              )}
            </Nav.Link>
            <Button
              variant="outline-secondary"
              onClick={handleMenuOpen}
              aria-label="Menú"
            >
              ☰
            </Button>
          </div>

          {/* Menú Desktop */}
          <Navbar.Collapse id="main-navbar" className="d-none d-lg-flex">
            <Nav className="mx-auto gap-3">
              <Nav.Link as={Link} to="/" className="fw-semibold">
                Inicio
              </Nav.Link>
              <Nav.Link as={Link} to="/products" className="fw-semibold">
                Productos
              </Nav.Link>
            </Nav>

            {/* Carrito */}
            <Nav className="align-items-center me-3">
              <Nav.Link onClick={handleCartOpen} title="Carrito">
                <FaShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="ms-1 badge bg-danger rounded-pill">
                    {cart.length}
                  </span>
                )}
              </Nav.Link>
            </Nav>

            {/* Usuario */}
            <Nav>
              {!user ? (
                <>
                  <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => navigate("/login")}
                  >
                    Iniciar sesión
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/register")}
                  >
                    Registrarse
                  </Button>
                </>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    id="dropdown-user"
                    className="d-flex align-items-center"
                  >
                    <FaUser className="me-2" />
                    {userName}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      Mi perfil
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile/orders">
                      Mis pedidos
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      Cerrar sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 🛒 Drawer del carrito */}
      <CartDrawer show={showCart} handleClose={handleCartClose} />

      {/* ☰ Offcanvas lateral del menú (mobile) */}
      <Offcanvas show={showMenu} onHide={handleMenuClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menú</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" onClick={handleMenuClose}>
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/products" onClick={handleMenuClose}>
              Productos
            </Nav.Link>

            <hr />

            {!user ? (
              <>
                <Button
                  variant="outline-primary"
                  className="mb-2"
                  onClick={() => {
                    navigate("/login");
                    handleMenuClose();
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate("/register");
                    handleMenuClose();
                  }}
                >
                  Registrarse
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/profile" onClick={handleMenuClose}>
                  Mi perfil
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/profile/orders"
                  onClick={handleMenuClose}
                >
                  Mis pedidos
                </Nav.Link>
                <Button
                  variant="outline-danger"
                  className="mt-3"
                  onClick={async () => {
                    await logout();
                    handleMenuClose();
                    navigate("/");
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AppNavbar;
