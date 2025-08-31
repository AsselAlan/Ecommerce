import React from 'react';
import { Alert, Card, Badge, Container, Row, Col } from 'react-bootstrap';
import useEnvConfig from '../hooks/useEnvConfig';

const ConfigCheck = () => {
  const config = useEnvConfig();

  const getStatusBadge = (value) => {
    if (value && value !== '') {
      return <Badge bg="success">✅ Configurado</Badge>;
    }
    return <Badge bg="danger">❌ Faltante</Badge>;
  };

  const getMaskedValue = (value, name) => {
    if (!value) return 'No configurado';
    
    // Enmascarar valores sensibles
    if (name.includes('KEY') || name.includes('TOKEN')) {
      return value.substring(0, 8) + '***' + value.substring(value.length - 4);
    }
    
    return value;
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h3>⚙️ Verificación de Configuración</h3>
          <Badge bg={config.isConfigured ? 'success' : 'warning'}>
            {config.isConfigured ? 'Completamente Configurado' : 'Configuración Incompleta'}
          </Badge>
        </Card.Header>
        <Card.Body>
          {!config.isConfigured && (
            <Alert variant="warning" className="mb-4">
              <Alert.Heading>⚠️ Variables Faltantes</Alert.Heading>
              <p>Las siguientes variables de entorno están faltantes:</p>
              <ul>
                {config.missingVars.map(varName => (
                  <li key={varName}><code>{varName}</code></li>
                ))}
              </ul>
              <hr />
              <p className="mb-0">
                Asegúrate de tener un archivo <code>.env.development</code> con todas las variables necesarias.
              </p>
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <h5>🗄️ Supabase</h5>
              <div className="mb-2">
                <strong>URL:</strong> {getStatusBadge(config.supabaseUrl)}
                <br />
                <small className="text-muted">{getMaskedValue(config.supabaseUrl, 'URL')}</small>
              </div>
              <div className="mb-3">
                <strong>Anon Key:</strong> {getStatusBadge(config.supabaseAnonKey)}
                <br />
                <small className="text-muted">{getMaskedValue(config.supabaseAnonKey, 'KEY')}</small>
              </div>

              <h5>👤 Administración</h5>
              <div className="mb-3">
                <strong>Email Admin:</strong> {getStatusBadge(config.emailAdmin)}
                <br />
                <small className="text-muted">{config.emailAdmin || 'No configurado'}</small>
              </div>
            </Col>

            <Col md={6}>
              <h5>💳 MercadoPago</h5>
              <div className="mb-2">
                <strong>Public Key:</strong> {getStatusBadge(config.mpPublicKey)}
                <br />
                <small className="text-muted">{getMaskedValue(config.mpPublicKey, 'KEY')}</small>
              </div>

              <h5>🌐 URLs de Respuesta</h5>
              <div className="mb-2">
                <strong>Éxito:</strong> {getStatusBadge(config.urls.success)}
                <br />
                <small className="text-muted">{config.urls.success || 'No configurado'}</small>
              </div>
              <div className="mb-2">
                <strong>Fallo:</strong> {getStatusBadge(config.urls.failure)}
                <br />
                <small className="text-muted">{config.urls.failure || 'No configurado'}</small>
              </div>
              <div className="mb-3">
                <strong>Pendiente:</strong> {getStatusBadge(config.urls.pending)}
                <br />
                <small className="text-muted">{config.urls.pending || 'No configurado'}</small>
              </div>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md={6}>
              <h5>📱 Información de la App</h5>
              <p>
                <strong>Nombre:</strong> {config.app.name}<br />
                <strong>Versión:</strong> {config.app.version}<br />
                <strong>Entorno:</strong> <Badge bg={config.app.isDev ? 'info' : 'primary'}>
                  {config.app.env}
                </Badge>
              </p>
            </Col>

            <Col md={6}>
              <h5>🎯 Dominio</h5>
              <div className="mb-2">
                <strong>Dominio Base:</strong> {getStatusBadge(config.domain)}
                <br />
                <small className="text-muted">{config.domain || 'No configurado'}</small>
              </div>
            </Col>
          </Row>

          {config.isConfigured && (
            <Alert variant="success" className="mt-3">
              <Alert.Heading>🎉 ¡Configuración Completa!</Alert.Heading>
              <p className="mb-0">
                Todas las variables de entorno están configuradas correctamente. 
                El proyecto está listo para funcionar.
              </p>
            </Alert>
          )}

          <Alert variant="info" className="mt-3">
            <Alert.Heading>ℹ️ Información de Seguridad</Alert.Heading>
            <ul className="mb-0">
              <li>Las claves sensibles se muestran parcialmente por seguridad</li>
              <li>Nunca compartas las credenciales completas en capturas de pantalla</li>
              <li>Los archivos <code>.env.production</code> no deben subirse a Git</li>
              <li>En producción, usa las variables de entorno del hosting (Vercel, Netlify)</li>
            </ul>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ConfigCheck;