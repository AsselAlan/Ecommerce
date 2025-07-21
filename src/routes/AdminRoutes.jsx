// src/routes/AdminRoutes.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // o podés renderizar un spinner

  const isAdmin = user?.email === "asselalan@gmail.com"; // luego usar metadata

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoutes;
