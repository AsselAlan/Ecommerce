import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Container, Form, Row, Col } from 'react-bootstrap';

const WebhookTester = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);
  const [paymentId, setPaymentId] = useState('1234567890');

  const webhookUrl = 'https://xjdbcvcbejgbnagnmgbe.supabase.co/functions/v1/mp-webhook';

  const testWebhook = async (paymentStatus = 'approved') => {
    setTesting(true);
    const timestamp = Date.now();
    
    try {
      // Simulación de webhook de MercadoPago
      const webhookData = {
        id: timestamp,
        live_mode: false,
        type: 'payment',
        date_created: new Date().toISOString(),
        application_id: '123456789',
        user_id: '123456789',
        version: 1,
        api_version: 'v1',
        action: 'payment.updated',
        data: {
          id: paymentId
        }
      };

      console.log('📤 Enviando webhook simulado:', webhookData);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'test-signature-for-local-testing',
          'x-request-id': `test-${timestamp}`
        },
        body: JSON.stringify(webhookData)
      });

      const responseText = await response.text();
      
      const result = {
        timestamp: new Date().toLocaleTimeString(),
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        success: response.ok,
        paymentId: paymentId,
        paymentStatus: paymentStatus
      };

      setResults(prev => [result, ...prev.slice(0, 4)]); // Mantener solo los últimos 5
      
    } catch (error) {
      const result = {
        timestamp: new Date().toLocaleTimeString(),
        status: 'ERROR',
        statusText: 'Network Error',
        response: error.message,
        success: false,
        paymentId: paymentId,
        paymentStatus: paymentStatus
      };
      
      setResults(prev => [result, ...prev.slice(0, 4)]);
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusBadge = (success, status) => {
    if (success) return <Badge bg="success">✅ {status}</Badge>;
    return <Badge bg="danger">❌ {status}</Badge>;
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h3>🔗 Webhook Tester - MercadoPago</h3>
          <small className="text-muted">
            Simula notificaciones de MercadoPago hacia la Edge Function
          </small>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <Alert.Heading>ℹ️ Cómo funciona</Alert.Heading>
            <ul className="mb-0">
              <li>Simula webhooks reales de MercadoPago</li>
              <li>Envía datos a la Edge Function desplegada</li>
              <li>La función consulta la API de MP y actualiza la BD</li>
              <li>⚠️ <strong>Nota:</strong> Necesitas credenciales reales para que funcione completamente</li>
            </ul>
          </Alert>

          <Row className="mb-4">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Payment ID a simular</Form.Label>
                <Form.Control
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="ID del pago para simular"
                />
                <Form.Text className="text-muted">
                  Usar un ID real de MercadoPago para pruebas completas
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearResults}
                disabled={results.length === 0}
                className="me-2"
              >
                🗑️ Limpiar
              </Button>
            </Col>
          </Row>

          <div className="d-flex gap-2 mb-4">
            <Button
              variant="success"
              onClick={() => testWebhook('approved')}
              disabled={testing}
            >
              {testing ? '🔄 Enviando...' : '✅ Test Pago Aprobado'}
            </Button>
            
            <Button
              variant="warning"
              onClick={() => testWebhook('pending')}
              disabled={testing}
            >
              {testing ? '🔄 Enviando...' : '⏳ Test Pago Pendiente'}
            </Button>
            
            <Button
              variant="danger"
              onClick={() => testWebhook('rejected')}
              disabled={testing}
            >
              {testing ? '🔄 Enviando...' : '❌ Test Pago Rechazado'}
            </Button>
          </div>

          <div className="mb-3">
            <h5>📋 Resultados de Pruebas</h5>
            {results.length === 0 ? (
              <Alert variant="light">
                No se han ejecutado pruebas aún. Haz clic en uno de los botones de arriba.
              </Alert>
            ) : (
              results.map((result, index) => (
                <Alert
                  key={index}
                  variant={result.success ? 'success' : 'danger'}
                  className="mb-2"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{result.timestamp}</strong> - Payment ID: {result.paymentId}
                      <br />
                      <small>Status: {result.paymentStatus}</small>
                    </div>
                    {getStatusBadge(result.success, result.status)}
                  </div>
                  
                  {result.response && (
                    <details className="mt-2">
                      <summary className="text-muted" style={{ cursor: 'pointer' }}>
                        Ver respuesta completa
                      </summary>
                      <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '0.8em' }}>
                        {result.response}
                      </pre>
                    </details>
                  )}
                </Alert>
              ))
            )}
          </div>

          <Alert variant="secondary">
            <Alert.Heading>🔧 Información Técnica</Alert.Heading>
            <p><strong>Webhook URL:</strong> <code>{webhookUrl}</code></p>
            <p><strong>Método:</strong> POST</p>
            <p><strong>Headers:</strong> Content-Type: application/json, x-signature, x-request-id</p>
            <p className="mb-0">
              <strong>⚠️ Para producción:</strong> Configurar MP_ACCESS_TOKEN real en las variables de entorno de la Edge Function
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WebhookTester;