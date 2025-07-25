import React, { useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';

// Página de éxito que comunica con la ventana padre
const PaymentSuccess = () => {
  const { numeroOrden } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Comunicar con la ventana padre (nuestra aplicación principal)
    if (window.opener) {
      const paymentData = {
        status: 'success',
        numeroOrden,
        payment_id: searchParams.get('payment_id'),
        external_reference: searchParams.get('external_reference')
      };
      
      // Enviar mensaje a la ventana padre
      window.opener.postMessage({
        type: 'PAYMENT_RESULT',
        data: paymentData
      }, window.location.origin);
      
      // Cerrar esta ventana después de un momento
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, [numeroOrden, searchParams]);

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="border" variant="success" className="mb-3" />
      <h4 className="text-success">¡Pago Exitoso!</h4>
      <p>Procesando resultado... Esta ventana se cerrará automáticamente.</p>
    </Container>
  );
};

// Página de fallo que comunica con la ventana padre
const PaymentFailure = () => {
  const { numeroOrden } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (window.opener) {
      const paymentData = {
        status: 'failure',
        numeroOrden,
        error: searchParams.get('error') || 'Payment rejected'
      };
      
      window.opener.postMessage({
        type: 'PAYMENT_RESULT',
        data: paymentData
      }, window.location.origin);
      
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, [numeroOrden, searchParams]);

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="border" variant="danger" className="mb-3" />
      <h4 className="text-danger">Pago Rechazado</h4>
      <p>Procesando resultado... Esta ventana se cerrará automáticamente.</p>
    </Container>
  );
};

// Página de pendiente que comunica con la ventana padre
const PaymentPending = () => {
  const { numeroOrden } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (window.opener) {
      const paymentData = {
        status: 'pending',
        numeroOrden,
        payment_type: searchParams.get('payment_type')
      };
      
      window.opener.postMessage({
        type: 'PAYMENT_RESULT',
        data: paymentData
      }, window.location.origin);
      
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, [numeroOrden, searchParams]);

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="border" variant="warning" className="mb-3" />
      <h4 className="text-warning">Pago Pendiente</h4>
      <p>Procesando resultado... Esta ventana se cerrará automáticamente.</p>
    </Container>
  );
};

export { PaymentSuccess, PaymentFailure, PaymentPending };