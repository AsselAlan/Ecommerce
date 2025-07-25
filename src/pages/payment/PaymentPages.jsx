import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import { supabase } from '../../libs/supabaseClient';
import { useCart } from '../../context/CartContext'; // ← AGREGAR

// Página de agradecimiento por compra exitosa
const PagoExitoso = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCartAfterPayment, clearPendingPayment } = useCart(); // ← AGREGAR
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [yaActualizado, setYaActualizado] = useState(false);

  useEffect(() => {
    const procesarPagoExitoso = async () => {
      try {
        const external_reference = searchParams.get('external_reference');
        const payment_id = searchParams.get('payment_id');
        const status = searchParams.get('status');

        console.log('🎉 Procesando pago exitoso:', { external_reference, payment_id, status });
        console.log('🔗 URL completa:', window.location.href);
        console.log('📊 SearchParams completos:', Object.fromEntries(searchParams));

        if (!external_reference) {
          setError('No se encontró información del pedido');
          return;
        }

        const numeroOrden = parseInt(external_reference);

        // ✅ LIMPIAR CARRITO SOLO SI EL PAGO FUE APROBADO
        if (status === 'approved') {
          clearCartAfterPayment(numeroOrden);
          clearPendingPayment();
        }

        // Buscar el pedido en la base de datos
        const { data: pedidoData, error: pedidoError } = await supabase
          .from('pedidos')
          .select('*')
          .eq('numero_orden', numeroOrden)
          .single();

        if (pedidoError) {
          console.error('Error buscando pedido:', pedidoError);
          throw pedidoError;
        }

        setPedido(pedidoData);

        // Actualizar el pedido con la información del pago si no está ya actualizado
        if (status === 'approved' && payment_id && !pedidoData.mp_payment_id && !yaActualizado) {
          console.log('💾 Actualizando pedido con datos de pago...');
          
          const { error: updateError } = await supabase
            .from('pedidos')
            .update({
              mp_payment_id: payment_id,
              mp_status: status,
              estado_pago: 'aprobado',
              estado: 'confirmado',
              mp_approved_date: new Date().toISOString()
            })
            .eq('numero_orden', numeroOrden);

          if (updateError) {
            console.error('Error actualizando pedido:', updateError);
          } else {
            console.log('✅ Pedido actualizado correctamente');
            setYaActualizado(true);
            // Actualizar el estado local
            setPedido(prev => ({
              ...prev,
              mp_payment_id: payment_id,
              mp_status: status,
              estado_pago: 'aprobado',
              estado: 'confirmado'
            }));
          }
        }

      } catch (err) {
        console.error('Error procesando pago exitoso:', err);
        setError('Error al procesar la información del pago');
      } finally {
        setCargando(false);
      }
    };

    procesarPagoExitoso();
  }, [searchParams, yaActualizado, clearCartAfterPayment, clearPendingPayment]);

  if (cargando) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Procesando...</span>
          </Spinner>
          <p>Procesando información del pago...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger" className="text-center">
              <h5>Error al procesar el pago</h5>
              <p>{error}</p>
              <Button variant="primary" onClick={() => navigate('/')}>
                Volver al inicio
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              {/* Icono de éxito */}
              <div className="mb-4">
                <FaCheckCircle size={80} className="text-success" />
              </div>

              {/* Título principal */}
              <h1 className="display-4 text-success mb-3">¡Gracias por tu compra!</h1>
              <h4 className="text-muted mb-4">Tu pago ha sido procesado exitosamente</h4>

              {/* Información del pedido */}
              {pedido && (
                <div className="bg-light p-4 rounded mb-4">
                  <Row className="text-start">
                    <Col sm={6}><strong>📦 Número de orden:</strong></Col>
                    <Col sm={6}>#{pedido.numero_orden}</Col>
                    <Col sm={6}><strong>💰 Total pagado:</strong></Col>
                    <Col sm={6}>${pedido.total}</Col>
                    <Col sm={6}><strong>📊 Estado:</strong></Col>
                    <Col sm={6}>
                      <span className="badge bg-success fs-6">
                        {pedido.estado === 'confirmado' ? 'Confirmado ✅' : 'Procesando 🔄'}
                      </span>
                    </Col>
                    {pedido.mp_payment_id && (
                      <>
                        <Col sm={6}><strong>🏦 ID de pago:</strong></Col>
                        <Col sm={6}>{pedido.mp_payment_id}</Col>
                      </>
                    )}
                  </Row>
                </div>
              )}

              {/* Mensaje de agradecimiento */}
              <div className="alert alert-info border-0" style={{ backgroundColor: '#e3f2fd' }}>
                <h5 className="alert-heading text-primary">🐾 ¡Tu mascota te lo agradecerá!</h5>
                <p className="mb-0">
                  Hemos recibido tu pedido y ya estamos preparando todo con mucho cariño.
                  Te mantendremos informado sobre el estado de tu envío.
                </p>
              </div>

              {/* Próximos pasos */}
              <div className="text-start mb-4">
                <h6 className="text-primary mb-3">📋 Próximos pasos:</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">✉️ <strong>Email de confirmación:</strong> Te enviamos todos los detalles</li>
                  <li className="mb-2">📦 <strong>Preparación:</strong> Empezamos a preparar tu pedido</li>
                  <li className="mb-2">🚚 <strong>Envío:</strong> Te notificamos cuando salga hacia tu domicilio</li>
                  <li className="mb-2">🔍 <strong>Seguimiento:</strong> Podés ver el estado en tu perfil</li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={() => {
                    if (pedido) {
                      navigate(`/compra-exitosa/${pedido.numero_orden}`);
                    } else {
                      navigate('/profile/orders');
                    }
                  }}
                  className="py-3"
                >
                  <FaCheckCircle className="me-2" />
                  Volver a la web
                </Button>
                <Button 
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate('/profile/orders')}
                  className="py-2"
                >
                  <FaShoppingBag className="me-2" />
                  Ver mis pedidos directamente
                </Button>
              </div>

              {/* Nota final */}
              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  💬 ¿Tenés alguna consulta? Contactanos y te ayudamos con lo que necesites.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Página de error para pagos fallidos
const PagoFallido = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearPendingPayment } = useCart(); // ← AGREGAR

  const external_reference = searchParams.get('external_reference');

  useEffect(() => {
    // ✅ LIMPIAR ESTADO DE PAGO PENDIENTE (pero NO el carrito)
    clearPendingPayment();
    
    // Si hay una referencia externa, intentar marcar el pedido como fallido
    if (external_reference) {
      const marcarPedidoFallido = async () => {
        try {
          await supabase
            .from('pedidos')
            .update({
              estado_pago: 'rechazado',
              estado: 'cancelado',
              mp_status: 'rejected'
            })
            .eq('numero_orden', parseInt(external_reference));
            
          console.log(`❌ Pedido #${external_reference} marcado como fallido`);
        } catch (error) {
          console.error('Error marcando pedido como fallido:', error);
        }
      };

      marcarPedidoFallido();
    }
  }, [external_reference, clearPendingPayment]);

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-danger">
            <Card.Body className="p-5 text-center">
              <div className="text-danger mb-4">
                <i className="fas fa-times-circle" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h2 className="text-danger mb-3">Pago no procesado</h2>
              <p className="lead mb-4">No se pudo completar tu compra en este momento</p>
              
              {external_reference && (
                <div className="bg-light p-3 rounded mb-4">
                  <p className="mb-0">
                    <strong>Orden:</strong> #{external_reference}
                  </p>
                </div>
              )}

              <Alert variant="warning" className="text-start">
                <h6>💡 Posibles soluciones:</h6>
                <ul className="mb-0">
                  <li>Verificá que los datos de tu tarjeta sean correctos</li>
                  <li>Asegurate de tener fondos suficientes</li>
                  <li>Intentá con otro medio de pago</li>
                  <li>Contactá a tu banco si el problema persiste</li>
                </ul>
              </Alert>

              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Volver a la web e intentar nuevamente
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Página para pagos pendientes
const PagoPendiente = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearPendingPayment } = useCart(); // ← AGREGAR

  const external_reference = searchParams.get('external_reference');
  const payment_type = searchParams.get('payment_type');

  useEffect(() => {
    // ✅ LIMPIAR ESTADO DE PAGO PENDIENTE (el carrito se mantiene hasta que se confirme)
    clearPendingPayment();
    
    console.log(`⏳ Pago pendiente para orden #${external_reference}`);
  }, [external_reference, clearPendingPayment]);

  const mensajesPorTipo = {
    'ticket': 'Tu pago en efectivo está pendiente. Tenés 3 días para realizarlo en cualquier punto autorizado.',
    'bank_transfer': 'Tu transferencia bancaria está siendo procesada. Puede tardar hasta 1 día hábil.',
    'account_money': 'Tu pago con dinero en cuenta está siendo verificado.',
    'default': 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'
  };

  const mensaje = mensajesPorTipo[payment_type] || mensajesPorTipo.default;

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-warning">
            <Card.Body className="p-5 text-center">
              <div className="text-warning mb-4">
                <i className="fas fa-clock" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h2 className="text-warning mb-3">Pago Pendiente</h2>
              <p className="lead mb-4">Tu pedido está esperando confirmación de pago</p>
              
              {external_reference && (
                <div className="bg-light p-3 rounded mb-4">
                  <p className="mb-0">
                    <strong>Orden:</strong> #{external_reference}
                  </p>
                </div>
              )}

              <Alert variant="info">
                <p className="mb-0">{mensaje}</p>
              </Alert>

              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/profile/orders')}
                >
                  Ver estado del pedido
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Volver al inicio
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export { PagoExitoso, PagoFallido, PagoPendiente };