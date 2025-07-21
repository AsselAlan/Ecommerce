import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const OrdenConfirmada = () => {
  const { numeroOrden } = useParams();
  const navigate = useNavigate();

  // Si no hay número de orden, redirige al home
  useEffect(() => {
    if (!numeroOrden) {
      navigate("/");
    }
  }, [numeroOrden, navigate]);

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div className="text-center">
        <h1 className="display-5 mb-4">🎉 ¡Gracias por tu compra!</h1>
        <p className="lead">Tu orden fue procesada con éxito.</p>
        <p>
          Número de orden: <strong>{numeroOrden}</strong>
        </p>
        <Link to="/products" className="btn btn-success mt-4">
          🛍️ Seguir comprando
        </Link>
      </div>
    </div>
  );
};

export default OrdenConfirmada;
