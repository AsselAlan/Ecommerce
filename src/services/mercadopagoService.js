import { supabase } from '../libs/supabaseClient';

// Configuración segura de variables
const getEnvVar = (name, defaultValue = null) => {
  const value = import.meta.env[name];
  if (!value && defaultValue === null) {
    console.error(`🚨 Variable de entorno faltante: ${name}`);
  }
  return value || defaultValue;
};

const MP_ACCESS_TOKEN = getEnvVar('VITE_MP_ACCESS_TOKEN');
const MP_SUCCESS_URL = getEnvVar('VITE_MP_SUCCESS_URL', `${window.location.origin}/pago-exitoso`);
const MP_FAILURE_URL = getEnvVar('VITE_MP_FAILURE_URL', `${window.location.origin}/pago-fallido`);
const MP_PENDING_URL = getEnvVar('VITE_MP_PENDING_URL', `${window.location.origin}/pago-pendiente`);
const MP_NOTIFICATION_URL = getEnvVar('VITE_MP_NOTIFICATION_URL');

/**
 * Crear preferencia de pago en MercadoPago usando la API REST
 * @param {Object} pedidoData - Datos del pedido
 * @returns {Object} - Respuesta con preference_id y init_point
 */
export const crearPreferenciaPago = async (pedidoData) => {
  try {
    console.log('🔑 Access Token configurado:', MP_ACCESS_TOKEN ? 'SÍ' : 'NO');
    console.log('🌍 URLs de retorno:', {
      success: MP_SUCCESS_URL,
      failure: MP_FAILURE_URL,
      pending: MP_PENDING_URL,
      webhook: MP_NOTIFICATION_URL
    });
    
    if (!MP_ACCESS_TOKEN) {
      throw new Error('Token de acceso de MercadoPago no configurado');
    }

    const items = pedidoData.productos.map(producto => ({
      id: producto.id,
      title: producto.nombre,
      description: `Accesorio para mascotas - ${producto.nombre}`,
      picture_url: producto.imagen || undefined,
      category_id: 'pets',
      quantity: producto.cantidad,
      currency_id: 'ARS',
      unit_price: parseFloat(producto.precio)
    }));

    // Agregar el costo de envío como un item separado si existe
    if (pedidoData.costo_envio > 0) {
      items.push({
        id: 'envio',
        title: 'Costo de envío',
        description: 'Envío a domicilio',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(pedidoData.costo_envio)
      });
    }

    const preferenceData = {
      items,
      payer: {
        name: pedidoData.usuario_metadata?.nombre || 'Cliente',
        surname: pedidoData.usuario_metadata?.apellido || 'Test',
        email: 'cliente.test@gmail.com',
        phone: {
          area_code: '',
          number: pedidoData.lugar_entrega?.telefono || ''
        },
        address: {
          street_name: pedidoData.lugar_entrega?.direccion || '',
          street_number: '',
          zip_code: pedidoData.lugar_entrega?.codigopostal || ''
        }
      },
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12,
        default_installments: 1
      },
      back_urls: {
        success: MP_SUCCESS_URL,
        failure: MP_FAILURE_URL,
        pending: MP_PENDING_URL
      },
      notification_url: MP_NOTIFICATION_URL,
      auto_return: 'approved',
      binary_mode: false,
      external_reference: pedidoData.numero_orden.toString(),
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      metadata: {
        numero_orden: pedidoData.numero_orden,
        usuario_id: pedidoData.usuario,
        tienda: 'Entre Patitas'
      }
    };

    console.log('Enviando datos a MercadoPago:', preferenceData);
    console.log('📝 External reference:', pedidoData.numero_orden);

    // Hacer la petición a la API de MercadoPago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de MercadoPago:', errorData);
      throw new Error(`Error HTTP ${response.status}: ${errorData.message || 'Error desconocido'}`);
    }

    const result = await response.json();
    console.log('Respuesta de MercadoPago:', result);
    
    return {
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    };

  } catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error);
    throw new Error(`Error en MercadoPago: ${error.message}`);
  }
};

/**
 * Actualizar pedido con información de MercadoPago
 * @param {string} numeroOrden - Número de orden del pedido
 * @param {string} preferenceId - ID de la preferencia de MercadoPago
 */
export const actualizarPedidoConMP = async (numeroOrden, preferenceId) => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({
        mp_preference_id: preferenceId,
        estado_pago: 'procesando'
      })
      .eq('numero_orden', numeroOrden);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error actualizando pedido con MercadoPago:', error);
    throw error;
  }
};

/**
 * Monitorear estado del pedido en tiempo real
 * @param {string} numeroOrden - Número de orden del pedido
 * @param {function} callback - Callback que se ejecuta cuando cambia el estado
 */
export const monitorearEstadoPedido = (numeroOrden, callback) => {
  let isMonitoring = true;
  
  const checkStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('estado_pago, mp_status, mp_payment_id')
        .eq('numero_orden', numeroOrden)
        .single();

      if (error) {
        console.error('Error consultando estado:', error);
        return;
      }

      console.log('Estado actual del pedido:', data);

      // Si el pago fue aprobado o rechazado, detener monitoreo
      if (data.estado_pago === 'aprobado' || data.mp_status === 'approved') {
        isMonitoring = false;
        callback('success', data);
      } else if (data.estado_pago === 'rechazado' || data.mp_status === 'rejected') {
        isMonitoring = false;
        callback('failure', data);
      } else if (data.mp_status === 'cancelled') {
        isMonitoring = false;
        callback('cancelled', data);
      }

    } catch (error) {
      console.error('Error monitoreando pedido:', error);
    }
  };

  // Verificar cada 3 segundos
  const interval = setInterval(() => {
    if (!isMonitoring) {
      clearInterval(interval);
      return;
    }
    checkStatus();
  }, 3000);

  // Detener después de 5 minutos máximo
  setTimeout(() => {
    isMonitoring = false;
    clearInterval(interval);
    callback('timeout');
  }, 300000); // 5 minutos

  return () => {
    isMonitoring = false;
    clearInterval(interval);
  };
};