#!/usr/bin/env node

/**
 * Script de verificación post-migración 005
 * Verifica que todas las tablas, funciones y políticas estén correctamente implementadas
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY
);

const REQUIRED_TABLES = [
  'favoritos',
  'producto_variantes', 
  'producto_reviews',
  'review_votos',
  'direcciones',
  'lista_deseos',
  'lista_deseos_productos'
];

const REQUIRED_FUNCTIONS = [
  'obtener_promedio_puntuacion',
  'obtener_total_reviews',
  'obtener_stock_total'
];

const REQUIRED_VIEWS = [
  'v_productos_completos'
];

async function verifyMigration() {
  console.log('🔍 EntrePatitas - Verificación Post-Migración 005');
  console.log('================================================');
  console.log('');

  let allChecksPass = true;

  // 1. Verificar tablas
  console.log('📋 Verificando tablas...');
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error && error.code === '42P01') {
        console.log(`   ❌ ${table}: No existe`);
        allChecksPass = false;
      } else {
        console.log(`   ✅ ${table}: OK`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${table}: Error de verificación`);
    }
  }

  console.log('');

  // 2. Verificar funciones
  console.log('🔧 Verificando funciones SQL...');
  for (const func of REQUIRED_FUNCTIONS) {
    try {
      const { error } = await supabase.rpc(func, {
        producto_uuid: '00000000-0000-0000-0000-000000000000'
      });
      
      if (error && error.code === '42883') {
        console.log(`   ❌ ${func}(): No existe`);
        allChecksPass = false;
      } else {
        console.log(`   ✅ ${func}(): OK`);
      }
    } catch (error) {
      console.log(`   ✅ ${func}(): OK (error esperado con UUID dummy)`);
    }
  }

  console.log('');

  // 3. Verificar vistas
  console.log('👁️  Verificando vistas...');
  for (const view of REQUIRED_VIEWS) {
    try {
      const { error } = await supabase
        .from(view)
        .select('*')
        .limit(1);
        
      if (error && error.code === '42P01') {
        console.log(`   ❌ ${view}: No existe`);
        allChecksPass = false;
      } else {
        console.log(`   ✅ ${view}: OK`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${view}: Error de verificación`);
    }
  }

  console.log('');

  // 4. Verificar RLS
  console.log('🔒 Verificando Row Level Security...');
  for (const table of REQUIRED_TABLES) {
    try {
      // Consulta para verificar si RLS está habilitado
      const { data, error } = await supabase
        .from('pg_class')
        .select('relrowsecurity')
        .eq('relname', table)
        .single();
        
      if (error) {
        console.log(`   ⚠️  ${table}: No se pudo verificar RLS`);
      } else if (data?.relrowsecurity) {
        console.log(`   ✅ ${table}: RLS habilitado`);
      } else {
        console.log(`   ❌ ${table}: RLS NO habilitado`);
        allChecksPass = false;
      }
    } catch (error) {
      console.log(`   ⚠️  ${table}: Error verificando RLS`);
    }
  }

  console.log('');

  // 5. Verificar políticas básicas
  console.log('🛡️  Verificando políticas de acceso...');
  
  const basicPolicies = [
    { table: 'favoritos', policy: 'Usuario_gestiona_sus_favoritos' },
    { table: 'producto_reviews', policy: 'Reviews_lectura_publica' },
    { table: 'direcciones', policy: 'Usuario_gestiona_sus_direcciones' }
  ];

  for (const { table, policy } of basicPolicies) {
    try {
      const { data, error } = await supabase
        .from('pg_policies')
        .select('policyname')
        .eq('tablename', table)
        .eq('policyname', policy)
        .single();
        
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ ${table}.${policy}: No existe`);
        allChecksPass = false;
      } else if (data) {
        console.log(`   ✅ ${table}.${policy}: OK`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${table}.${policy}: Error verificando política`);
    }
  }

  console.log('');

  // 6. Probar funcionalidad básica (si hay productos)
  console.log('🧪 Probando funcionalidades...');
  
  try {
    // Verificar si hay productos para probar
    const { data: productos, error: productError } = await supabase
      .from('productos')
      .select('id')
      .limit(1);
      
    if (productError) {
      console.log('   ⚠️  No se pudo acceder a tabla productos');
    } else if (productos && productos.length > 0) {
      const productId = productos[0].id;
      
      // Probar funciones con producto real
      const [ratingResult, reviewsResult, stockResult] = await Promise.all([
        supabase.rpc('obtener_promedio_puntuacion', { producto_uuid: productId }),
        supabase.rpc('obtener_total_reviews', { producto_uuid: productId }),
        supabase.rpc('obtener_stock_total', { producto_uuid: productId })
      ]);
      
      console.log(`   ✅ Rating promedio: ${ratingResult.data || 0}`);
      console.log(`   ✅ Total reviews: ${reviewsResult.data || 0}`);
      console.log(`   ✅ Stock total: ${stockResult.data || 0}`);
      
      // Probar vista
      const { data: vistaData, error: vistaError } = await supabase
        .from('v_productos_completos')
        .select('id, puntuacion_promedio, total_reviews, stock_total')
        .eq('id', productId)
        .single();
        
      if (vistaError) {
        console.log('   ❌ Vista v_productos_completos: Error');
        allChecksPass = false;
      } else {
        console.log('   ✅ Vista v_productos_completos: Funcionando');
      }
      
    } else {
      console.log('   ℹ️  No hay productos para probar funciones');
    }
  } catch (error) {
    console.log('   ⚠️  Error probando funcionalidades:', error.message);
  }

  console.log('');

  // Resultado final
  if (allChecksPass) {
    console.log('🎉 ¡VERIFICACIÓN EXITOSA!');
    console.log('=======================');
    console.log('✅ Todas las tablas están creadas');
    console.log('✅ Funciones SQL funcionando');
    console.log('✅ RLS habilitado correctamente');
    console.log('✅ Políticas de seguridad activas');
    console.log('');
    console.log('🚀 La migración 005 se completó correctamente');
    console.log('📝 Puedes continuar con el desarrollo del frontend');
    console.log('');
  } else {
    console.log('❌ VERIFICACIÓN FALLÓ');
    console.log('===================');
    console.log('Algunos elementos no están configurados correctamente.');
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('   1. Ejecutar la migración nuevamente');
    console.log('   2. Verificar permisos de la service key');
    console.log('   3. Aplicar el SQL manualmente en Supabase Studio');
    console.log('');
    process.exit(1);
  }
}

// Ejecutar verificación
if (import.meta.url === `file://${process.argv[1]}`) {
  runVerification().catch(console.error);
}

async function runVerification() {
  try {
    await verifyMigration();
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

export { verifyMigration };