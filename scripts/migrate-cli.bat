@echo off
REM ==============================================
REM Script Batch para ejecutar migracion 005
REM EntrePatitas - Paso 5: Crear Tablas Faltantes
REM ==============================================

echo.
echo EntrePatitas - Migracion 005 (Batch)
echo =====================================
echo.

REM Verificar si Supabase CLI esta instalado
supabase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Supabase CLI no esta instalado
    echo Instalalo con: npm install -g supabase
    echo Mas info: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

REM Verificar si estamos en un proyecto Supabase
if not exist "supabase\config.toml" (
    echo ERROR: No se encontro supabase\config.toml
    echo Ejecuta este script desde la raiz del proyecto EntrePatitas
    pause
    exit /b 1
)

echo Supabase CLI encontrado
echo Proyecto Supabase detectado
echo.

REM Crear carpeta de migraciones si no existe
if not exist "supabase\migrations" mkdir "supabase\migrations"

REM Crear nombre de archivo con timestamp
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format 'yyyyMMddHHmmss'"') do set timestamp=%%a
set migrationFile=supabase\migrations\%timestamp%_create_missing_tables.sql

echo Copiando migracion a: %migrationFile%
copy "scripts\migrations\005_create_missing_tables.sql" "%migrationFile%" >nul

if not exist "%migrationFile%" (
    echo ERROR: No se pudo copiar el archivo de migracion
    echo Verifica que existe: scripts\migrations\005_create_missing_tables.sql
    pause
    exit /b 1
)

echo Archivo de migracion copiado
echo.

REM Mostrar estado actual
echo Estado actual del proyecto...
supabase status
echo.

echo Aplicando migracion...
echo.

REM Aplicar migracion
supabase db push

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo aplicar la migracion
    echo.
    echo Posibles soluciones:
    echo    1. Verificar conexion: supabase db status
    echo    2. Revisar logs: supabase logs
    echo    3. Aplicar manualmente en Supabase Studio
    echo.
    echo La migracion esta guardada en: %migrationFile%
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo MIGRACION APLICADA EXITOSAMENTE!
echo ========================================
echo.
echo Tablas creadas:
echo    - favoritos
echo    - producto_variantes
echo    - producto_reviews
echo    - review_votos
echo    - direcciones
echo    - lista_deseos
echo    - lista_deseos_productos
echo.
echo Funciones creadas:
echo    - obtener_promedio_puntuacion()
echo    - obtener_total_reviews()
echo    - obtener_stock_total()
echo.
echo Vista creada:
echo    - v_productos_completos
echo.
echo RLS habilitado en todas las tablas
echo.
echo Proximos pasos:
echo    1. Verificar en Supabase Studio que todo este correcto
echo    2. Probar funcionalidad en tu aplicacion React
echo    3. Continuar con el Paso 6 de la guia
echo.
pause