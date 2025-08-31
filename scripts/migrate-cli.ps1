# ==============================================
# Script PowerShell para ejecutar migracion 005
# EntrePatitas - Paso 5: Crear Tablas Faltantes
# ==============================================

Write-Host "EntrePatitas - Migracion 005 (PowerShell)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Supabase CLI esta instalado
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Host "Error: Supabase CLI no esta instalado" -ForegroundColor Red
    Write-Host "Instalalo con: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "Mas info: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Verificar si estamos en un proyecto Supabase
if (-not (Test-Path "supabase\config.toml")) {
    Write-Host "Error: No se encontro supabase\config.toml" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raiz del proyecto EntrePatitas" -ForegroundColor Yellow
    exit 1
}

Write-Host "Supabase CLI encontrado" -ForegroundColor Green
Write-Host "Proyecto Supabase detectado" -ForegroundColor Green
Write-Host ""

# Crear carpeta de migraciones si no existe
if (-not (Test-Path "supabase\migrations")) {
    New-Item -ItemType Directory -Path "supabase\migrations" | Out-Null
}

# Crear nombre de archivo con timestamp
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationFile = "supabase\migrations\${timestamp}_create_missing_tables.sql"

Write-Host "Copiando migracion a: $migrationFile" -ForegroundColor Blue
Copy-Item "scripts\migrations\005_create_missing_tables.sql" $migrationFile

if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: No se pudo copiar el archivo de migracion" -ForegroundColor Red
    Write-Host "Verifica que existe: scripts\migrations\005_create_missing_tables.sql" -ForegroundColor Yellow
    exit 1
}

Write-Host "Archivo de migracion copiado" -ForegroundColor Green
Write-Host ""

# Mostrar estado actual
Write-Host "Estado actual del proyecto..." -ForegroundColor Blue
supabase status

Write-Host ""
Write-Host "Aplicando migracion..." -ForegroundColor Yellow

# Aplicar migracion
supabase db push
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "Migracion aplicada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tablas creadas:" -ForegroundColor Cyan
    Write-Host "   favoritos" -ForegroundColor Green
    Write-Host "   producto_variantes" -ForegroundColor Green
    Write-Host "   producto_reviews" -ForegroundColor Green
    Write-Host "   review_votos" -ForegroundColor Green
    Write-Host "   direcciones" -ForegroundColor Green
    Write-Host "   lista_deseos" -ForegroundColor Green
    Write-Host "   lista_deseos_productos" -ForegroundColor Green
    Write-Host ""
    Write-Host "Funciones creadas:" -ForegroundColor Cyan
    Write-Host "   obtener_promedio_puntuacion()" -ForegroundColor Green
    Write-Host "   obtener_total_reviews()" -ForegroundColor Green
    Write-Host "   obtener_stock_total()" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vista creada:" -ForegroundColor Cyan
    Write-Host "   v_productos_completos" -ForegroundColor Green
    Write-Host ""
    Write-Host "RLS habilitado en todas las tablas" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Verificar en Supabase Studio que todo este correcto"
    Write-Host "   2. Probar funcionalidad en tu aplicacion React"
    Write-Host "   3. Continuar con el Paso 6 de la guia"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error aplicando la migracion" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verificar conexion a la base de datos: supabase db status"
    Write-Host "   2. Revisar logs: supabase logs"
    Write-Host "   3. Aplicar manualmente en Supabase Studio"
    Write-Host ""
    Write-Host "La migracion esta guardada en: $migrationFile" -ForegroundColor Blue
    Write-Host ""
    exit 1
}

# Pausa para que el usuario pueda leer los resultados
Write-Host ""
Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host