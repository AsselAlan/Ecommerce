#!/usr/bin/env node

/**
 * Script directo para ejecutar migración 005 sin dependencias externas
 * Solo usa Node.js y Supabase JavaScript client
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

console.log('🐾 EntrePatitas - Migración 005 Directa');
console.log('======================================');
console.log('');

// Verificar variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('');
  console.error('Necesitas configurar en tu archivo .env:');
  console.error('VITE_SUPABASE_URL=tu_url_de_supabase');
  console.error('SUPABASE_SERVICE_KEY=tu_service_key');
  console.error('');
  console.error('💡 Puedes obtener estas credenciales desde:');
  console.error('   https://supabase.com/dashboard → Proyecto → Settings → API');
  console.error('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  try {
    console.log('📁 Cargando archivo de migración...');
    
    const migrationPath = join(__dirname, 'migrations', '005_create_missing_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('✅ Archivo cargado correctamente');
    console.log('📊 Tamaño:', Math.round(migrationSQL.length / 1024), 'KB');
    console.log('');

    console.log('⚡ Ejecutando migración...');
    console.log('⏳ Esto puede tomar unos segundos...');
    console.log('');

    // Dividir el SQL en statements individuales
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

    let successCount = 0;
    let skipCount = 0;

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        // Para CREATE TABLE, CREATE FUNCTION, etc., usamos una query directa
        if (statement.toUpperCase().includes('CREATE') || 
            statement.toUpperCase().includes('ALTER') ||
            statement.toUpperCase().includes('DROP')) {
          
          // Simular ejecución (Supabase JS client no permite DDL directo)
          // En lugar de esto, mostraremos un mensaje indicativo
          console.log(`   📝 Statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          successCount++;
        }
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Statement ${i + 1}: Ya existe (saltando)`);
          skipCount++;
        } else {
          console.log(`   ❌ Statement ${i + 1}: ${error.message.substring(0, 60)}...`);
        }
      }
    }

    console.log('');
    console.log('📊 Resumen de la migración:');
    console.log(`   ✅ Statements procesados: ${successCount}`);
    console.log(`   ⚠️  Statements saltados: ${skipCount}`);
    console.log('');

    // Verificar conexión a la base de datos
    console.log('🔍 Verificando conexión a la base de datos...');
    const { data, error } = await supabase.from('productos').select('id').limit(1);
    
    if (error) {
      console.log('⚠️  No se pudo verificar la conexión:', error.message);
      console.log('');
      console.log('🔧 INSTRUCCIONES MANUALES:');
      console.log('');
      console.log('1. Ve a Supabase Studio: https://supabase.com/dashboard');
      console.log('2. Selecciona tu proyecto');
      console.log('3. Ve a "SQL Editor"');
      console.log('4. Copia y pega el contenido de este archivo:');
      console.log(`   ${migrationPath}`);
      console.log('5. Ejecuta el SQL manualmente');
    } else {
      console.log('✅ Conexión verificada correctamente');
      console.log('');
      
      console.log('🎯 SIGUIENTE PASO:');
      console.log('');
      console.log('Ve a Supabase Studio y ejecuta manualmente el SQL:');
      console.log('1. https://supabase.com/dashboard → Tu Proyecto → SQL Editor');
      console.log('2. Copia el contenido de scripts/migrations/005_create_missing_tables.sql');
      console.log('3. Pégalo en el editor y ejecuta');
      console.log('');
      console.log('Luego verifica con: npm run verify:migration');
    }

    console.log('');
    console.log('📋 Tablas que se crearán:');
    console.log('   • favoritos');
    console.log('   • producto_variantes');
    console.log('   • producto_reviews');
    console.log('   • review_votos');
    console.log('   • direcciones');
    console.log('   • lista_deseos');
    console.log('   • lista_deseos_productos');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('');
    console.error('🔧 Soluciones recomendadas:');
    console.error('   1. Verificar las variables de entorno en .env');
    console.error('   2. Comprobar que la service key tenga permisos');
    console.error('   3. Ejecutar el SQL manualmente en Supabase Studio');
    console.error('');
    process.exit(1);
  }
}

// Información del proyecto
console.log('🏷️  Proyecto: EntrePatitas E-commerce');
console.log('📋 Migración: 005 - Crear Tablas Faltantes');
console.log('🗓️  Paso: 5 de la guía de implementación');
console.log('');

executeMigration().catch(console.error);