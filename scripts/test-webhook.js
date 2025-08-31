/**
 * Script para probar la Edge Function de webhooks de MercadoPago
 * Simula una notificación real de MercadoPago
 */

const WEBHOOK_URL = 'https://xjdbcvcbejgbnagnmgbe.supabase.co/functions/v1/mp-webhook';

// Simulación de webhook de MercadoPago
const testPaymentWebhook = async () => {
  console.log('🧪 Probando webhook de MercadoPago...');
  
  // Datos simulados de webhook de MercadoPago
  const webhookData = {
    id: Date.now(), // ID único del webhook
    live_mode: false,
    type: 'payment',
    date_created: new Date().toISOString(),
    application_id: '123456789',
    user_id: '123456789',
    version: 1,
    api_version: 'v1',
    action: 'payment.updated',
    data: {
      id: '1234567890' // ID del pago simulado
    }
  };

  try {
    console.log('📤 Enviando webhook simulado:', webhookData);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'test-signature-for-local-testing',
        'x-request-id': `test-${Date.now()}`
      },
      body: JSON.stringify(webhookData)
    });

    console.log('📥 Respuesta del webhook:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('📄 Body de respuesta:', responseText);

    if (response.ok) {
      console.log('✅ Webhook procesado exitosamente');
    } else {
      console.log('❌ Error en webhook:', response.status, responseText);
    }

  } catch (error) {
    console.error('💥 Error enviando webhook:', error);
  }
};

// Ejecutar test
testPaymentWebhook();