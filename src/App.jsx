import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ProductProvider } from "./context/ProductContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { CartProvider } from "./context/CartContext";
import "./styles/global.css";
// ADMIN ------------------------------
import AppNavbar from "./components/navbar/AppNavbar";
import Footer from "./components/footer/Footer";

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