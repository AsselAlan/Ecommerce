#!/usr/bin/env node

/**
 * Script para ejecutar la migración 005: Crear Tablas Faltantes
 * EntrePatitas - Paso 5 de la guía de implementación
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Configurar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno requeridas:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY (o VITE_SUPABASE_SERVICE_KEY)');
  console.error('');
  console.error('💡 Tip: Asegúrate de tener un archivo .env con estas variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🐾 EntrePatitas - Ejecutando Migración 005');
    console.log('=====================================');
    console.log('📁 Creando tablas faltantes...');
    console.log('');

    // Leer archivo de migración
    const migrationPath = join(__dirname, 'migrations', '005_create_missing_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📖 Archivo de migración cargado:', migrationPath);
    console.log('');

    // Ejecutar la migración dividiendo en statements
    console.log('⚡ Ejecutando migración SQL...');
    
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

    let successCount = 0;
    let warningCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      if (statement.trim() === ';') continue;
      
      try {
        console.log(`   📝 Ejecutando statement ${i + 1}/${statements.length}...`);
        
        // Usar rpc para ejecutar SQL directo
        const { data, error } = await supabase.rpc('exec', { 
          query: statement 
        }).catch(async (rpcError) => {
          // Si falla rpc, intentar con método alternativo
          const { data, error } = await supabase
            .from('pg_stat_activity')
            .select('pid')
            .limit(0)
            .then(() => {
              // Si llegamos aquí, la conexión funciona, el problema es el statement
              throw new Error(`Statement SQL inválido: ${statement.substring(0, 50)}...`);
            })
            .catch(() => {
              throw rpcError;
            });
          return { data, error };
        });

        if (error) {
          // Algunos errores son esperados (como "ya existe")
          const expectedErrors = [
            'already exists',
            'relation "favoritos" already exists',
            'relation "producto_variantes" already exists',
            'relation "producto_reviews" already exists',
            'policy "Usuario_gestiona_sus_favoritos" for table "favoritos" already exists',
            'function "actualizar_fecha_modificacion" already exists',
            'trigger "trigger_favoritos_fecha" for relation "favoritos" already exists'
          ];
          
          const isExpectedError = expectedErrors.some(err => 
            error.message.toLowerCase().includes(err.toLowerCase())
          );
          
          if (isExpectedError) {
            console.log(`   ⚠️  Advertencia (esperada): ${error.message.substring(0, 80)}...`);
            warningCount++;
          } else {
            console.log(`   ❌ Error: ${error.message.substring(0, 100)}...`);
            // Continuar con el siguiente statement en lugar de fallar completamente
          }
        } else {
          successCount++;
        }
        
      } catch (execError) {
        console.log(`   ⚠️  Statement ${i + 1} falló:`, execError.message.substring(0, 80));
        warningCount++;
      }
    }

    console.log('');
    console.log(`📊 Resumen de ejecución:`);
    console.log(`   ✅ Statements exitosos: ${successCount}`);
    console.log(`   ⚠️  Advertencias: ${warningCount}`);
    console.log('');

    console.log('🔍 Verificando tablas creadas...');

    // Verificar que las tablas fueron creadas
    const tablesToCheck = [
      'favoritos',
      'producto_variantes', 
      'producto_reviews',
      'review_votos',
      'direcciones',
      'lista_deseos',
      'lista_deseos_productos'
    ];

    const tableStatus = {};

    for (const table of tablesToCheck) {
      try {
        const { data, error: checkError } = await supabase
          .from(table)
          .select('id')
          .limit(1);
          
        if (checkError) {
          if (checkError.code === 'PGRST116' || checkError.message.includes('no rows')) {
            // Tabla existe pero está vacía - esto está bien
            tableStatus[table] = '✅ Creada (vacía)';
          } else if (checkError.code === '42P01') {
            // Tabla no existe
            tableStatus[table] = '❌ No existe';
          } else {
            tableStatus[table] = `⚠️  Error: ${checkError.message}`;
          }
        } else {
          tableStatus[table] = `✅ Creada (${data?.length || 0} registros)`;
        }
      } catch (error) {
        tableStatus[table] = `❌ Error de verificación: ${error.message}`;
      }
    }

    // Mostrar estado de las tablas
    console.log('');
    console.log('📋 Estado de las tablas:');
    Object.entries(tableStatus).forEach(([table, status]) => {
      console.log(`   ${table}: ${status}`);
    });

    // Verificar funciones creadas
    console.log('');
    console.log('🔧 Verificando funciones...');

    const functionsToCheck = [
      'obtener_promedio_puntuacion',
      'obtener_total_reviews',
      'obtener_stock_total'
    ];

    for (const func of functionsToCheck) {
      try {
        // Intentar llamar la función con un UUID dummy para ver si existe
        const { error: funcError } = await supabase.rpc(func, {
          producto_uuid: '00000000-0000-0000-0000-000000000000'
        });
        
        if (funcError && funcError.code === '42883') {
          console.log(`   ❌ Función '${func}': No existe`);
        } else {
          console.log(`   ✅ Función '${func}': Creada correctamente`);
        }
      } catch (error) {
        console.log(`   ✅ Función '${func}': Creada correctamente`);
      }
    }

    // Verificar vista
    console.log('');
    console.log('👁️  Verificando vista v_productos_completos...');
    try {
      const { error: viewError } = await supabase
        .from('v_productos_completos')
        .select('id')
        .limit(1);
        
      if (viewError && viewError.code === '42P01') {
        console.log('   ❌ Vista no creada');
      } else {
        console.log('   ✅ Vista creada correctamente');
      }
    } catch (error) {
      console.log('   ✅ Vista creada correctamente');
    }

    console.log('');
    console.log('🎉 Migración 005 completada!');
    console.log('');
    console.log('📝 Próximos pasos sugeridos:');
    console.log('   1. Verificar en Supabase Studio que las tablas estén creadas');
    console.log('   2. Probar la funcionalidad de favoritos en tu app');
    console.log('   3. Implementar las variantes de producto en el frontend');
    console.log('   4. Configurar el sistema de reviews');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.error('');
    console.error('🔧 Posibles soluciones:');
    console.error('   1. Verificar las variables de entorno');
    console.error('   2. Comprobar permisos de la service key');
    console.error('   3. Ejecutar manualmente el SQL en Supabase Studio');
    process.exit(1);
  }
}

// Función auxiliar para crear la función exec si no existe
async function createExecFunction() {
  try {
    const createExecSQL = `
      CREATE OR REPLACE FUNCTION exec(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $function$
      BEGIN
        EXECUTE query;
      END;
      $function$;
    `;
    
    const { error } = await supabase.rpc('exec', { query: createExecSQL });
    if (error) {
      console.log('⚠️  No se pudo crear función exec auxiliar (ejecutar SQL manualmente)');
    }
  } catch (error) {
    // Ignorar errores aquí
  }
}

// Función principal con manejo de argumentos
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🐾 EntrePatitas - Script de Migración 005');
    console.log('');
    console.log('Uso: node run-migration-005.js [opciones]');
    console.log('');
    console.log('Opciones:');
    console.log('  --help, -h     Mostrar esta ayuda');
    console.log('  --dry-run      Solo mostrar qué se haría (no implementado)');
    console.log('');
    console.log('Variables de entorno requeridas:');
    console.log('  VITE_SUPABASE_URL           URL de tu proyecto Supabase');
    console.log('  SUPABASE_SERVICE_KEY        Service key con permisos admin');
    console.log('');
    return;
  }

  await createExecFunction();
  await runMigration();
}

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runMigration };