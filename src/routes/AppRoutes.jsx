import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Profile from "../pages/Profile";
import OrdenConfirmada from "../pages/OrdenConfirmada";
import UserOrders from "../pages/UserOrders";
import CompraExitosa from "../pages/CompraExitosa";
import { PagoExitoso, PagoFallido, PagoPendiente } from "../pages/payment/PaymentPages";
import AdminRoutes from "./AdminRoutes";
import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/Dashboard";
import { Pedidos, Productos, Usuarios } from "../admin";
import ProductDetail from "../pages/products/ProductDetail";
import Products from "../pages/products/Products";
import Home from "../pages/home/Home";
import TestRLS from "../components/TestRLS";
import ConfigCheck from "../components/ConfigCheck";
import WebhookTester from "../components/WebhookTester";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test-rls" element={<TestRLS />} />
      <Route path="/config-check" element={<ConfigCheck />} />
      <Route path="/webhook-test" element={<WebhookTester />} />
      <Route path="/products" element={<Products/>} />
      <Route path="/product/:id" element={<ProductDetail/>} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/orden-confirmada/:numeroOrden"
        element={<OrdenConfirmada />}
      />
      <Route path="/profile/orders" element={<UserOrders />} />
      
      {/* Página de agradecimiento después de compra exitosa */}
      <Route path="/compra-exitosa/:numeroOrden" element={<CompraExitosa />} />
      
      {/* Rutas de MercadoPago */}
      <Route path="/pago-exitoso" element={<PagoExitoso />} />
      <Route path="/pago-fallido" element={<PagoFallido />} />
      <Route path="/pago-pendiente" element={<PagoPendiente />} />

      <Route element={<AdminRoutes />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="productos" element={<Productos />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
