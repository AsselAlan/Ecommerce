import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import OrdenConfirmada from "../pages/OrdenConfirmada";
import UserOrders from "../pages/UserOrders";
import AdminRoutes from "./AdminRoutes";
import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/Dashboard";
import { Pedidos, Productos, Usuarios } from "../admin";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/orden-confirmada/:numeroOrden"
        element={<OrdenConfirmada />}
      />
      <Route path="/profile/orders" element={<UserOrders />} />

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
