import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Image,
  ListGroup,
  Alert,
  Spinner
} from "react-bootstrap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { crearPedido } from "../services/orderService";
import { crearPreferenciaPago, actualizarPedidoConMP } from "../services/mercadopagoService";
import { useNavigate } from "react-router-dom";
import { supabase } from "../libs/supabaseClient";

const CheckoutModal = ({ show, handleClose }) => {
  const { cart, clearCart, setPendingPayment } = useCart();
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
  
  // Estados para MercadoPago
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState(null);
  const [metodoPago, setMetodoPago] = useState('mercadopago');

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
    // Limpiar errores al abrir el modal
    setErrorPago(null);
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

  const validarFormulario = () => {
    const camposRequeridos = ['provincia', 'ciudad', 'codigopostal', 'direccion', 'telefono'];
    
    for (const campo of camposRequeridos) {
      if (!entrega[campo] || entrega[campo].trim() === '') {
        setErrorPago(`Por favor completa el campo: ${campo}`);
        return false;
      }
    }
    
    return true;
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
      setErrorPago(null);
      
      // Validar formulario
      if (!validarFormulario()) {
        return;
      }

      setProcesandoPago(true);

      // Actualizar perfil del usuario
      await actualizarPerfilSiEsNecesario(entrega, user.user_metadata);

      // Crear el pedido base
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

      // Crear el pedido en la base de datos
      const ordenCreada = await crearPedido(pedido);

      if (metodoPago === 'mercadopago') {
        // Preparar datos para MercadoPago
        const pedidoMP = {
          ...pedido,
          usuario_email: user.email,
          usuario_metadata: user.user_metadata,
        };

        // Crear preferencia de pago en MercadoPago
        const { preference_id, init_point, sandbox_init_point } = await crearPreferenciaPago(pedidoMP);

        // Actualizar el pedido con el preference_id
        await actualizarPedidoConMP(pedido.numero_orden, preference_id);

        // ✅ MARCAR PAGO COMO PENDIENTE (en lugar de limpiar carrito)
        setPendingPayment(pedido.numero_orden);
        
        handleClose();

        // Redirigir a MercadoPago en la misma ventana
        const paymentUrl = import.meta.env.VITE_MP_ACCESS_TOKEN?.includes('TEST') 
          ? sandbox_init_point 
          : init_point;
          
        console.log('🚀 Redirigiendo a MercadoPago:', paymentUrl);
        console.log('⏳ Pago marcado como pendiente para orden:', pedido.numero_orden);
        
        window.location.href = paymentUrl;

      } else {
        // Método de pago alternativo (transferencia, efectivo, etc.)
        clearCart();
        handleClose();
        navigate(`/orden-confirmada/${pedido.numero_orden}`);
      }

    } catch (err) {
      console.error('Error en el proceso de compra:', err);
      setErrorPago(err.message || "Hubo un error al procesar el pago. Por favor intenta nuevamente.");
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Finalizar compra</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorPago && (
          <Alert variant="danger" className="mb-3">
            {errorPago}
          </Alert>
        )}
        
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
                    {['provincia', 'ciudad', 'codigopostal', 'direccion', 'telefono'].includes(campo) && 
                      <span className="text-danger"> *</span>
                    }
                  </Form.Label>
                  <Form.Control
                    as={campo === "descripcion" ? "textarea" : "input"}
                    rows={campo === "descripcion" ? 2 : undefined}
                    name={campo}
                    value={entrega[campo]}
                    onChange={handleChange}
                    onFocus={() => handleFocus(campo)}
                    required={['provincia', 'ciudad', 'codigopostal', 'direccion', 'telefono'].includes(campo)}
                  />
                </Form.Group>
              ))}
            </Form>

            {/* Método de Pago */}
            <div className="mt-4">
              <h5>Método de pago</h5>
              <Form.Check
                type="radio"
                id="mercadopago"
                name="metodoPago"
                label="💳 MercadoPago (Tarjetas, efectivo, transferencia)"
                checked={metodoPago === 'mercadopago'}
                onChange={() => setMetodoPago('mercadopago')}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                id="transferencia"
                name="metodoPago"
                label="🏦 Transferencia bancaria"
                checked={metodoPago === 'transferencia'}
                onChange={() => setMetodoPago('transferencia')}
                className="mb-2"
              />
            </div>
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
            
            {metodoPago === 'mercadopago' && (
              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  🔒 Pago seguro con MercadoPago<br/>
                  • Hasta 12 cuotas sin interés<br/>
                  • Todos los medios de pago<br/>
                  • Protección al comprador<br/>
                  • Será redirigido a MercadoPago
                </small>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="success" 
          onClick={handleConfirmarCompra}
          disabled={procesandoPago}
          size="lg"
        >
          {procesandoPago ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Procesando...
            </>
          ) : (
            metodoPago === 'mercadopago' 
              ? `Pagar $${total} con MercadoPago`
              : `Confirmar pedido por $${total}`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutModal;