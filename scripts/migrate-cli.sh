#!/bin/bash

# ==============================================
# Script para ejecutar migración 005 usando Supabase CLI
# EntrePatitas - Paso 5: Crear Tablas Faltantes
# ==============================================

echo "🐾 EntrePatitas - Migración 005 (Supabase CLI)"
echo "=============================================="
echo ""

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado"
    echo "💡 Instálalo con: npm install -g supabase"
    echo "   Más info: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Verificar si estamos en un proyecto Supabase
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ No se encontró supabase/config.toml"
    echo "💡 Ejecuta este script desde la raíz del proyecto EntrePatitas"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo "✅ Proyecto Supabase detectado"
echo ""

# Crear carpeta de migraciones si no existe
mkdir -p supabase/migrations

# Copiar archivo de migración a la carpeta de Supabase
MIGRATION_FILE="supabase/migrations/$(date +%Y%m%d%H%M%S)_create_missing_tables.sql"

echo "📁 Copiando migración a: $MIGRATION_FILE"
cp "scripts/migrations/005_create_missing_tables.sql" "$MIGRATION_FILE"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: No se pudo copiar el archivo de migración"
    echo "💡 Verifica que existe: scripts/migrations/005_create_missing_tables.sql"
    exit 1
fi

echo "✅ Archivo de migración copiado"
echo ""

# Mostrar estado actual
echo "🔍 Estado actual del proyecto..."
supabase status

echo ""
echo "⚡ Aplicando migración..."

# Aplicar migración
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migración aplicada exitosamente!"
    echo ""
    echo "📋 Tablas creadas:"
    echo "   ✅ favoritos"
    echo "   ✅ producto_variantes"
    echo "   ✅ producto_reviews"  
    echo "   ✅ review_votos"
    echo "   ✅ direcciones"
    echo "   ✅ lista_deseos"
    echo "   ✅ lista_deseos_productos"
    echo ""
    echo "🔧 Funciones creadas:"
    echo "   ✅ obtener_promedio_puntuacion()"
    echo "   ✅ obtener_total_reviews()"
    echo "   ✅ obtener_stock_total()"
    echo ""
    echo "👁️  Vista creada:"
    echo "   ✅ v_productos_completos"
    echo ""
    echo "🔒 RLS habilitado en todas las tablas"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Verificar en Supabase Studio que todo esté correcto"
    echo "   2. Probar funcionalidad en tu aplicación React"
    echo "   3. Continuar con el Paso 6 de la guía"
    echo ""
else
    echo ""
    echo "❌ Error aplicando la migración"
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   1. Verificar conexión a la base de datos: supabase db status"
    echo "   2. Revisar logs: supabase logs"
    echo "   3. Aplicar manualmente en Supabase Studio"
    echo ""
    echo "📂 La migración está guardada en: $MIGRATION_FILE"
    echo ""
    exit 1
fi