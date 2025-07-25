import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome, FaWhatsapp } from 'react-icons/fa';
import { supabase } from '../libs/supabaseClient';

const CompraExitosa = () => {
  const { numeroOrden } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        if (numeroOrden) {
          const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('numero_orden', parseInt(numeroOrden))
            .single();

          if (!error && data) {
            setPedido(data);
          }
        }
      } catch (error) {
        console.error('Error cargando pedido:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPedido();
  }, [numeroOrden]);

  const irAMisPedidos = () => {
    navigate('/profile/orders');
  };

  const seguirComprando = () => {
    navigate('/');
  };

  if (cargando) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              {/* Animación de éxito */}
              <div className="mb-4">
                <FaCheckCircle 
                  size={100} 
                  className="text-success"
                  style={{
                    animation: 'pulse 2s infinite',
                  }}
                />
              </div>

              {/* Mensaje principal */}
              <h1 className="display-4 text-success mb-3">¡Muchas gracias por tu compra!</h1>
              <h4 className="text-muted mb-4">Tu pedido ha sido confirmado exitosamente</h4>

              {/* Información del pedido */}
              {pedido && (
                <div className="bg-light p-4 rounded mb-4">
                  <Row>
                    <Col md={6} className="text-start">
                      <p><strong>📦 Número de orden:</strong> #{pedido.numero_orden}</p>
                      <p><strong>💰 Total:</strong> ${pedido.total}</p>
                    </Col>
                    <Col md={6} className="text-start">
                      <p><strong>📊 Estado:</strong> <span className="badge bg-success">Confirmado</span></p>
                      <p><strong>🚚 Envío:</strong> ${pedido.costo_envio}</p>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Mensaje motivacional */}
              <div className="alert alert-info border-0 mb-4" style={{ backgroundColor: '#e8f4fd' }}>
                <h5 className="text-primary mb-3">🐾 ¡Tu mascota estará feliz!</h5>
                <p className="mb-0">
                  Ya estamos preparando tu pedido con todo el amor que se merece tu compañero peludo.
                  Te mantendremos informado en cada paso del proceso.
                </p>
              </div>

              {/* Información adicional */}
              <div className="row text-start mb-4">
                <div className="col-md-6">
                  <h6 className="text-primary">📋 Próximos pasos:</h6>
                  <ul className="list-unstyled">
                    <li>✉️ Email de confirmación enviado</li>
                    <li>📦 Preparación del pedido (1-2 días)</li>
                    <li>🚚 Envío y seguimiento</li>
                    <li>🏠 Entrega en tu domicilio</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">🔍 Seguimiento:</h6>
                  <p className="mb-2">Podés ver el estado de tu pedido en:</p>
                  <p className="h6 text-dark">Perfil → Mis Pedidos</p>
                </div>
              </div>

              {/* Botones principales */}
              <div className="d-grid gap-3 mb-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={irAMisPedidos}
                  className="py-3"
                >
                  <FaShoppingBag className="me-2" />
                  Ingresar a Mi Perfil - Mis Pedidos
                </Button>
                
                <Button 
                  variant="outline-secondary"
                  size="lg"
                  onClick={seguirComprando}
                  className="py-2"
                >
                  <FaHome className="me-2" />
                  Seguir comprando
                </Button>
              </div>

              {/* Contacto */}
              <div className="border-top pt-4">
                <p className="text-muted mb-3">
                  💬 ¿Tenés alguna consulta? ¡Estamos para ayudarte!
                </p>
                <Button 
                  variant="success" 
                  size="sm"
                  href="https://wa.me/5492223674061"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="me-1" />
                  Contactanos por WhatsApp
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CSS para la animación */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Container>
  );
};

export default CompraExitosa;