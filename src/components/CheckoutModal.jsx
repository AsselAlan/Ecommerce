import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Image,
  ListGroup,
} from "react-bootstrap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { crearPedido } from "../services/orderService";
import { useNavigate } from "react-router-dom";
import { supabase } from "../libs/supabaseClient"; // al principio si no está

const CheckoutModal = ({ show, handleClose }) => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [datosPrecargados, setDatosPrecargados] = useState({});
  const [entrega, setEntrega] = useState({
    codigopostal: "",
    provincia: "",
    ciudad: "",
    direccion: "",
    piso: "",
    depto: "",
    descripcion: "",
    telefono: "",
  });

  useEffect(() => {
    if (user && show) {
      const perfil = user.user_metadata || {};
      setDatosPrecargados(perfil);
      setEntrega((prev) => ({
        ...prev,
        codigopostal: perfil.codigopostal || "",
        direccion: perfil.direccion || "",
        telefono: perfil.telefono || "",
        provincia: "",
        ciudad: "",
        piso: "",
        depto: "",
        descripcion: "",
      }));
    }
  }, [user, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntrega((prev) => ({ ...prev, [name]: value }));
  };

  const actualizarPerfilSiEsNecesario = async (datosEntrega, datosUsuario) => {
    const cambios = {};

    for (const campo of [
      "direccion",
      "telefono",
      "codigopostal",
      "provincia",
      "ciudad",
      "piso",
      "depto",
      "descripcion",
    ]) {
      if (!datosUsuario[campo] && datosEntrega[campo]) {
        cambios[campo] = datosEntrega[campo];
      }
    }

    if (Object.keys(cambios).length > 0) {
      const { error } = await supabase.auth.updateUser({
        data: cambios,
      });

      if (error) {
        console.warn("Error actualizando perfil:", error.message);
      } else {
        console.log("Perfil actualizado con:", cambios);
      }
    }
  };

  const handleFocus = (campo) => {
    if (entrega[campo] === datosPrecargados[campo]) {
      setEntrega((prev) => ({ ...prev, [campo]: "" }));
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.precio * item.quantity,
    0
  );
  const costo_envio = 800;
  const descuentos = 0;
  const total = subtotal + costo_envio - descuentos;

  const handleConfirmarCompra = async () => {
    try {
      await actualizarPerfilSiEsNecesario(entrega, user.user_metadata);

      const pedido = {
        numero_orden: Date.now(),
        usuario: user.id,
        fecha_creacion: new Date().toISOString(),
        estado: "pendiente",
        productos: cart.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.quantity,
          precio: p.precio,
          imagen: p.imagen_url || "",
        })),
        lugar_entrega: entrega,
        subtotal,
        costo_envio,
        descuentos,
        total,
        estado_pago: "pendiente",
        numero_seguimiento: "",
      };

      const orden = await crearPedido(pedido);
      clearCart();
      handleClose();
      navigate(`/orden-confirmada/${pedido.numero_orden}`);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al generar la orden.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Finalizar compra</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {/* Formulario de Entrega */}
          <Col md={6}>
            <h5>Datos de entrega</h5>
            <Form>
              {[
                "provincia",
                "ciudad",
                "codigopostal",
                "direccion",
                "piso",
                "depto",
                "telefono",
                "descripcion",
              ].map((campo, idx) => (
                <Form.Group className="mb-2" key={idx}>
                  <Form.Label>
                    {campo.charAt(0).toUpperCase() + campo.slice(1)}
                  </Form.Label>
                  <Form.Control
                    as={campo === "descripcion" ? "textarea" : "input"}
                    rows={campo === "descripcion" ? 2 : undefined}
                    name={campo}
                    value={entrega[campo]}
                    onChange={handleChange}
                    onFocus={() => handleFocus(campo)}
                  />
                </Form.Group>
              ))}
            </Form>
          </Col>

          {/* Resumen de Productos */}
          <Col md={6}>
            <h5>Resumen de productos</h5>
            <ListGroup variant="flush">
              {cart.map((item, i) => (
                <ListGroup.Item key={i} className="d-flex align-items-center">
                  <Image
                    src={item.imagen_url}
                    rounded
                    width="60"
                    className="me-3"
                  />
                  <div>
                    <div>{item.nombre}</div>
                    <small>
                      ${item.precio} x {item.quantity}
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <hr />
            <p>Subtotal: ${subtotal}</p>
            <p>Envío: ${costo_envio}</p>
            <p>Descuentos: ${descuentos}</p>
            <h5>Total: ${total}</h5>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleConfirmarCompra}>
          Confirmar compra
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutModal;
