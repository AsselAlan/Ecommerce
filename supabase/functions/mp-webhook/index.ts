import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.177.0/crypto/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
}

console.log("🚀 MercadoPago Webhook Function iniciada")

serve(async (req) => {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID()
  console.log(`📥 [${requestId}] Nueva petición: ${req.method} ${req.url}`)

  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] Respondiendo a CORS preflight`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Solo aceptar POST requests
    if (req.method !== 'POST') {
      console.log(`❌ [${requestId}] Método no permitido: ${req.method}`)
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    // Obtener headers importantes
    const signature = req.headers.get('x-signature')
    const requestId_mp = req.headers.get('x-request-id')
    console.log(`🔐 [${requestId}] Signature recibido: ${signature ? 'SÍ' : 'NO'}`)
    console.log(`🆔 [${requestId}] MP Request ID: ${requestId_mp}`)

    // Leer el body
    const body = await req.text()
    console.log(`📄 [${requestId}] Body recibido (${body.length} chars):`, body.substring(0, 200) + '...')

    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (parseError) {
      console.error(`❌ [${requestId}] Error parseando JSON:`, parseError)
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders })
    }

    // Validar estructura del webhook
    if (!webhookData || !webhookData.data) {
      console.log(`⚠️ [${requestId}] Webhook sin data válida:`, webhookData)
      return new Response('Invalid webhook structure', { status: 400, headers: corsHeaders })
    }

    console.log(`🎯 [${requestId}] Tipo de evento: ${webhookData.type}`)
    console.log(`💳 [${requestId}] Payment ID: ${webhookData.data.id}`)

    // Solo procesar eventos de payment
    if (webhookData.type !== 'payment') {
      console.log(`⏭️ [${requestId}] Evento ignorado (no es payment)`)
      return new Response('OK - Event ignored', { 
        status: 200, 
        headers: corsHeaders 
      })
    }

    // Obtener detalles del pago desde MercadoPago
    const paymentId = webhookData.data.id
    const paymentDetails = await getPaymentDetails(paymentId, requestId)
    
    if (!paymentDetails) {
      console.error(`❌ [${requestId}] No se pudo obtener detalles del pago`)
      return new Response('Payment details not found', { status: 404, headers: corsHeaders })
    }

    console.log(`💰 [${requestId}] Estado del pago: ${paymentDetails.status}`)
    console.log(`📋 [${requestId}] External reference: ${paymentDetails.external_reference}`)

    // Actualizar pedido en Supabase
    const updateResult = await updateOrderStatus(paymentDetails, requestId)
    
    if (!updateResult.success) {
      console.error(`❌ [${requestId}] Error actualizando pedido:`, updateResult.error)
      return new Response('Database update failed', { status: 500, headers: corsHeaders })
    }

    console.log(`✅ [${requestId}] Pedido actualizado exitosamente`)
    return new Response('OK', { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`💥 [${requestId}] Error general:`, error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      requestId: requestId,
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Obtener detalles del pago desde MercadoPago API
 */
async function getPaymentDetails(paymentId: string, requestId: string) {
  try {
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN')
    if (!accessToken) {
      console.error(`❌ [${requestId}] MP_ACCESS_TOKEN no configurado`)
      return null
    }

    console.log(`🔍 [${requestId}] Consultando detalles del pago ${paymentId}`)
    
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`❌ [${requestId}] Error API MercadoPago: ${response.status}`)
      return null
    }

    const paymentData = await response.json()
    console.log(`✅ [${requestId}] Detalles obtenidos correctamente`)
    
    return {
      id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      external_reference: paymentData.external_reference,
      transaction_amount: paymentData.transaction_amount,
      payment_method_id: paymentData.payment_method_id,
      date_approved: paymentData.date_approved,
      date_created: paymentData.date_created,
      payer_email: paymentData.payer?.email
    }
  } catch (error) {
    console.error(`💥 [${requestId}] Error obteniendo detalles del pago:`, error)
    return null
  }
}

/**
 * Actualizar estado del pedido en Supabase
 */
async function updateOrderStatus(paymentDetails: any, requestId: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (!paymentDetails.external_reference) {
      console.error(`❌ [${requestId}] Sin external_reference`)
      return { success: false, error: 'No external reference' }
    }

    // Mapear estados de MercadoPago a nuestro sistema
    let estadoPago = 'pendiente'
    switch (paymentDetails.status) {
      case 'approved':
        estadoPago = 'aprobado'
        break
      case 'rejected':
        estadoPago = 'rechazado'
        break
      case 'cancelled':
        estadoPago = 'cancelado'
        break
      case 'refunded':
        estadoPago = 'reembolsado'
        break
      case 'pending':
      case 'in_process':
        estadoPago = 'pendiente'
        break
      default:
        estadoPago = 'pendiente'
    }

    console.log(`🔄 [${requestId}] Actualizando pedido ${paymentDetails.external_reference} a estado: ${estadoPago}`)

    const { data, error } = await supabase
      .from('pedidos')
      .update({
        mp_payment_id: paymentDetails.id.toString(),
        mp_status: paymentDetails.status,
        estado_pago: estadoPago,
        mp_payment_method: paymentDetails.payment_method_id,
        mp_transaction_amount: paymentDetails.transaction_amount,
        mp_approved_date: paymentDetails.date_approved,
        mp_created_date: paymentDetails.date_created,
        // Actualizar estado general del pedido si el pago fue aprobado
        estado: paymentDetails.status === 'approved' ? 'confirmado' : 'pendiente'
      })
      .eq('numero_orden', parseInt(paymentDetails.external_reference))
      .select()

    if (error) {
      console.error(`❌ [${requestId}] Error Supabase:`, error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      console.error(`❌ [${requestId}] Pedido no encontrado: ${paymentDetails.external_reference}`)
      return { success: false, error: 'Order not found' }
    }

    console.log(`✅ [${requestId}] Pedido actualizado:`, data[0])
    return { success: true, data: data[0] }

  } catch (error) {
    console.error(`💥 [${requestId}] Error actualizando pedido:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Verificar firma de MercadoPago (implementación futura)
 * Por ahora retornamos true para permitir testing
 */
function verifyMPSignature(body: string, signature: string): boolean {
  // TODO: Implementar verificación HMAC-SHA256
  // Por ahora permitimos todas las peticiones para testing
  console.log('⚠️ Verificación de firma deshabilitada para testing')
  return true
}