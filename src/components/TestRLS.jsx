import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import { supabase } from '../libs/supabaseClient';

const TestRLS = () => {
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Obtener usuario actual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const ejecutarPruebas = async () => {
    setLoading(true);
    const results = {};

    try {
      // ✅ TEST 1: Lectura pública de productos
      console.log('🧪 TEST 1: Lectura pública de productos...');
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .limit(5);

      results.productosLectura = {
        success: !productosError,
        data: productosData,
        error: productosError?.message,
        message: productosError ? 
          'Error al leer productos (verificar que hay productos activos)' : 
          `✅ Éxito: ${productosData?.length || 0} productos obtenidos`
      };

      // ✅ TEST 2: Intentar leer todos los productos (incluso inactivos) - DEBE FALLAR si no eres admin
      console.log('🧪 TEST 2: Intentar leer productos inactivos...');
      const { data: todosProductos, error: todosError } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', false)
        .limit(1);

      results.productosInactivos = {
        success: !todosError,
        data: todosProductos,
        error: todosError?.message,
        message: user?.email === 'asselalan@gmail.com' ?
          `✅ Admin: Puedes ver productos inactivos (${todosProductos?.length || 0})` :
          (todosError ? '✅ Seguridad OK: No puedes ver productos inactivos' : '⚠️ Posible problema de seguridad')
      };

      // ✅ TEST 3: Leer pedidos del usuario
      console.log('🧪 TEST 3: Leer pedidos del usuario...');
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .limit(5);

      results.pedidosLectura = {
        success: !pedidosError,
        data: pedidosData,
        error: pedidosError?.message,
        message: user ? 
          (pedidosError ? 
            (pedidosError.message.includes('row-level security') ? 
              '✅ Seguridad OK: RLS está funcionando' : 
              `❌ Error: ${pedidosError.message}`) :
            `✅ Éxito: ${pedidosData?.length || 0} pedidos obtenidos`) :
          '⚠️ No autenticado - esperado'
      };

      // ✅ TEST 4: Intentar crear un producto (solo admin)
      console.log('🧪 TEST 4: Intentar crear producto...');
      const { data: nuevoProducto, error: crearError } = await supabase
        .from('productos')
        .insert({
          nombre: 'TEST PRODUCTO RLS',
          descripcion: 'Producto de prueba para RLS',
          categoria: 'test',
          precio: 100,
          stock: 1,
          activo: true
        })
        .select()
        .single();

      results.crearProducto = {
        success: !crearError,
        data: nuevoProducto,
        error: crearError?.message,
        message: user?.email === 'asselalan@gmail.com' ?
          (crearError ? `❌ Error admin: ${crearError.message}` : '✅ Admin: Producto creado exitosamente') :
          (crearError ? '✅ Seguridad OK: No puedes crear productos' : '⚠️ Problema: Usuario común creó producto')
      };

      // Si se creó un producto de prueba, eliminarlo
      if (nuevoProducto?.id) {
        await supabase.from('productos').delete().eq('id', nuevoProducto.id);
        console.log('🧹 Producto de prueba eliminado');
      }

      setProductos(productosData || []);
      setPedidos(pedidosData || []);
      setTestResults(results);

    } catch (error) {
      console.error('Error en pruebas:', error);
      setTestResults({
        error: {
          success: false,
          error: error.message,
          message: `❌ Error general: ${error.message}`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getVariant = (result) => {
    if (!result) return 'secondary';
    if (result.success && result.message?.includes('✅')) return 'success';
    if (result.message?.includes('⚠️')) return 'warning';
    if (result.message?.includes('❌')) return 'danger';
    return 'info';
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header>
          <h3>🔒 Test de Row Level Security (RLS)</h3>
          <Badge bg={user ? 'success' : 'warning'}>
            {user ? `Conectado: ${user.email}` : 'No autenticado'}
          </Badge>
          {user?.email === 'asselalan@gmail.com' && (
            <Badge bg="primary" className="ms-2">ADMIN</Badge>
          )}
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <Button 
              variant="primary" 
              onClick={ejecutarPruebas}
              disabled={loading}
            >
              {loading ? '🧪 Ejecutando pruebas...' : '🚀 Ejecutar Pruebas de Seguridad'}
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <Row>
              {Object.entries(testResults).map(([test, result]) => (
                <Col md={6} className="mb-3" key={test}>
                  <Alert variant={getVariant(result)}>
                    <Alert.Heading className="h6">
                      📋 {test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Alert.Heading>
                    <p className="mb-1">{result.message}</p>
                    {result.error && (
                      <small className="text-muted d-block mt-1">
                        Error: {result.error}
                      </small>
                    )}
                    {result.data && (
                      <small className="text-muted d-block mt-1">
                        Datos obtenidos: {Array.isArray(result.data) ? result.data.length : 1} registro(s)
                      </small>
                    )}
                  </Alert>
                </Col>
              ))}
            </Row>
          )}

          {productos.length > 0 && (
            <div className="mt-4">
              <h5>📦 Productos Obtenidos ({productos.length})</h5>
              <div className="row">
                {productos.slice(0, 3).map(producto => (
                  <div key={producto.id} className="col-md-4 mb-2">
                    <Card size="sm">
                      <Card.Body className="p-2">
                        <Card.Title className="h6">{producto.nombre}</Card.Title>
                        <Badge bg={producto.activo ? 'success' : 'danger'}>
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {producto.destacado && (
                          <Badge bg="warning" className="ms-1">Destacado</Badge>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h5>📋 Interpretación de Resultados</h5>
            <Alert variant="info">
              <ul className="mb-0">
                <li><Badge bg="success">✅ Verde</Badge>: RLS funcionando correctamente</li>
                <li><Badge bg="warning">⚠️ Amarillo</Badge>: Revisar configuración</li>
                <li><Badge bg="danger">❌ Rojo</Badge>: Problema de seguridad detectado</li>
                <li><Badge bg="primary">Admin</Badge>: Tu email tiene permisos especiales</li>
              </ul>
            </Alert>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestRLS;