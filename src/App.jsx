import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ProductProvider } from "./context/ProductContext";
import "bootstrap/dist/css/bootstrap.min.css";
import AppNavbar from "./components/AppNavbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import "./styles/global.css";
// ADMIN ------------------------------
import AdminLayout from "./admin/AdminLayout";
import AdminRoutes from "./routes/AdminRoutes";
import { Dashboard, Pedidos, Productos, Usuarios } from "./admin";

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <BrowserRouter basename="/Ecommerce">
            <AppNavbar />
            <main>
              <AppRoutes />
            </main>
            <Footer />
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;