-- ===============================================
-- MIGRACIÓN 005: CREAR TABLAS FALTANTES
-- Paso 5 de la Guía de EntrePatitas
-- ===============================================

-- Verificar si las extensiones necesarias están habilitadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. TABLA DE FAVORITOS
-- ===============================================

CREATE TABLE IF NOT EXISTS favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados: un usuario no puede tener el mismo producto como favorito más de una vez
  UNIQUE(usuario_id, producto_id)
);

-- Crear índice para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario 
ON favoritos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_favoritos_producto 
ON favoritos(producto_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden gestionar sus propios favoritos
DROP POLICY IF EXISTS "Usuario_gestiona_sus_favoritos" ON favoritos;
CREATE POLICY "Usuario_gestiona_sus_favoritos" ON favoritos
FOR ALL USING (usuario_id = auth.uid());

-- ===============================================
-- 2. TABLA DE VARIANTES DE PRODUCTO
-- ===============================================

CREATE TABLE IF NOT EXISTS producto_variantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  
  -- Características de la variante
  color VARCHAR(50),
  talla VARCHAR(20),
  material VARCHAR(50),
  
  -- Stock y pricing específico de la variante
  stock_variante INTEGER DEFAULT 0 CHECK (stock_variante >= 0),
  precio_extra NUMERIC(10,2) DEFAULT 0 CHECK (precio_extra >= 0),
  
  -- Imágenes específicas de la variante
  imagen_variante TEXT,
  imagenes_adicionales JSONB DEFAULT '[]',
  
  -- SKU único para la variante
  sku_variante VARCHAR(100) UNIQUE,
  
  -- Estado de la variante
  activa BOOLEAN DEFAULT TRUE,
  
  -- Metadatos
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT variante_tiene_caracteristica 
  CHECK (color IS NOT NULL OR talla IS NOT NULL OR material IS NOT NULL)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_variantes_producto 
ON producto_variantes(producto_id);

CREATE INDEX IF NOT EXISTS idx_variantes_activas 
ON producto_variantes(producto_id, activa) WHERE activa = true;

CREATE INDEX IF NOT EXISTS idx_variantes_sku 
ON producto_variantes(sku_variante) WHERE sku_variante IS NOT NULL;

-- RLS para variantes (lectura pública, modificación solo admin)
ALTER TABLE producto_variantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Variantes_lectura_publica" ON producto_variantes;
CREATE POLICY "Variantes_lectura_publica" ON producto_variantes
FOR SELECT USING (activa = true);

DROP POLICY IF EXISTS "Solo_admin_modifica_variantes" ON producto_variantes;
CREATE POLICY "Solo_admin_modifica_variantes" ON producto_variantes
FOR ALL USING (
  auth.email() = 'asselalan@gmail.com' OR
  auth.jwt() ->> 'role' = 'admin'
);

-- ===============================================
-- 3. TABLA DE REVIEWS/RESEÑAS
-- ===============================================

CREATE TABLE IF NOT EXISTS producto_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Puntuación del 1 al 5
  puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
  
  -- Título opcional para la reseña
  titulo VARCHAR(200),
  
  -- Comentario detallado
  comentario TEXT,
  
  -- Imágenes que el usuario puede subir con su reseña
  imagenes_review JSONB DEFAULT '[]',
  
  -- Información sobre la compra (si existe)
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  
  -- Moderación
  aprobada BOOLEAN DEFAULT TRUE,
  moderada_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fecha_moderacion TIMESTAMP WITH TIME ZONE,
  
  -- Utilidad de la reseña (votación de otros usuarios)
  votos_positivos INTEGER DEFAULT 0 CHECK (votos_positivos >= 0),
  votos_negativos INTEGER DEFAULT 0 CHECK (votos_negativos >= 0),
  
  -- Metadatos
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede hacer una reseña por producto
  UNIQUE(producto_id, usuario_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reviews_producto 
ON producto_reviews(producto_id);

CREATE INDEX IF NOT EXISTS idx_reviews_usuario 
ON producto_reviews(usuario_id);

CREATE INDEX IF NOT EXISTS idx_reviews_puntuacion 
ON producto_reviews(producto_id, puntuacion);

CREATE INDEX IF NOT EXISTS idx_reviews_aprobadas 
ON producto_reviews(producto_id, aprobada, fecha_creacion DESC) WHERE aprobada = true;

-- RLS para reviews
ALTER TABLE producto_reviews ENABLE ROW LEVEL SECURITY;

-- Lectura pública de reviews aprobadas
DROP POLICY IF EXISTS "Reviews_lectura_publica" ON producto_reviews;
CREATE POLICY "Reviews_lectura_publica" ON producto_reviews
FOR SELECT USING (aprobada = true);

-- Los usuarios pueden crear sus propias reviews
DROP POLICY IF EXISTS "Usuario_crea_su_review" ON producto_reviews;
CREATE POLICY "Usuario_crea_su_review" ON producto_reviews
FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Los usuarios pueden editar sus propias reviews
DROP POLICY IF EXISTS "Usuario_edita_su_review" ON producto_reviews;
CREATE POLICY "Usuario_edita_su_review" ON producto_reviews
FOR UPDATE USING (usuario_id = auth.uid()) 
WITH CHECK (usuario_id = auth.uid());

-- Los usuarios pueden eliminar sus propias reviews
DROP POLICY IF EXISTS "Usuario_elimina_su_review" ON producto_reviews;
CREATE POLICY "Usuario_elimina_su_review" ON producto_reviews
FOR DELETE USING (usuario_id = auth.uid());

-- Admin puede moderar todas las reviews
DROP POLICY IF EXISTS "Admin_modera_reviews" ON producto_reviews;
CREATE POLICY "Admin_modera_reviews" ON producto_reviews
FOR ALL USING (
  auth.email() = 'asselalan@gmail.com' OR
  auth.jwt() ->> 'role' = 'admin'
);

-- ===============================================
-- 4. TABLA DE VOTOS PARA REVIEWS (Para evitar spam)
-- ===============================================

CREATE TABLE IF NOT EXISTS review_votos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES producto_reviews(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_voto VARCHAR(10) CHECK (tipo_voto IN ('positivo', 'negativo')),
  fecha_voto TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede votar una vez por review
  UNIQUE(review_id, usuario_id)
);

-- Índice para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_review_votos 
ON review_votos(review_id);

-- RLS para votos
ALTER TABLE review_votos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario_vota_reviews" ON review_votos;
CREATE POLICY "Usuario_vota_reviews" ON review_votos
FOR ALL USING (usuario_id = auth.uid());

-- ===============================================
-- 5. TABLA DE DIRECCIONES DE USUARIOS
-- ===============================================

CREATE TABLE IF NOT EXISTS direcciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la dirección
  alias VARCHAR(50) NOT NULL, -- 'Casa', 'Trabajo', 'Casa de mamá', etc.
  nombre_completo VARCHAR(200) NOT NULL, -- Nombre de quien recibe
  telefono VARCHAR(20),
  
  -- Dirección completa
  calle VARCHAR(200) NOT NULL,
  numero VARCHAR(10) NOT NULL,
  piso VARCHAR(10),
  departamento VARCHAR(10),
  ciudad VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  
  -- Referencias adicionales para el delivery
  referencias TEXT,
  
  -- Configuración
  es_predeterminada BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  
  -- Metadatos
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario no puede tener dos direcciones con el mismo alias
  UNIQUE(usuario_id, alias)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario 
ON direcciones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada 
ON direcciones(usuario_id, es_predeterminada) WHERE es_predeterminada = true;

-- RLS para direcciones
ALTER TABLE direcciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario_gestiona_sus_direcciones" ON direcciones;
CREATE POLICY "Usuario_gestiona_sus_direcciones" ON direcciones
FOR ALL USING (usuario_id = auth.uid());

-- ===============================================
-- 6. TABLA DE LISTA DE DESEOS (WISHLIST)
-- ===============================================

CREATE TABLE IF NOT EXISTS lista_deseos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_lista VARCHAR(100) NOT NULL DEFAULT 'Mi Lista de Deseos',
  descripcion TEXT,
  publica BOOLEAN DEFAULT FALSE, -- Si otros usuarios pueden ver la lista
  
  -- Metadatos
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla intermedia para productos en lista de deseos
CREATE TABLE IF NOT EXISTS lista_deseos_productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lista_id UUID REFERENCES lista_deseos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  variante_id UUID REFERENCES producto_variantes(id) ON DELETE SET NULL,
  
  -- Cantidad deseada
  cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0),
  
  -- Prioridad en la lista
  prioridad INTEGER DEFAULT 1 CHECK (prioridad >= 1 AND prioridad <= 5),
  
  -- Notas personales
  notas TEXT,
  
  fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un producto no puede estar duplicado en la misma lista
  UNIQUE(lista_id, producto_id, variante_id)
);

-- Índices para listas de deseos
CREATE INDEX IF NOT EXISTS idx_lista_deseos_usuario 
ON lista_deseos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_lista_productos 
ON lista_deseos_productos(lista_id);

-- RLS para listas de deseos
ALTER TABLE lista_deseos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_deseos_productos ENABLE ROW LEVEL SECURITY;

-- Política para listas de deseos
DROP POLICY IF EXISTS "Usuario_gestiona_sus_listas" ON lista_deseos;
CREATE POLICY "Usuario_gestiona_sus_listas" ON lista_deseos
FOR ALL USING (usuario_id = auth.uid());

-- Lectura pública de listas públicas
DROP POLICY IF EXISTS "Listas_publicas_lectura" ON lista_deseos;
CREATE POLICY "Listas_publicas_lectura" ON lista_deseos
FOR SELECT USING (publica = true);

-- Política para productos en listas
DROP POLICY IF EXISTS "Usuario_gestiona_productos_listas" ON lista_deseos_productos;
CREATE POLICY "Usuario_gestiona_productos_listas" ON lista_deseos_productos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lista_deseos 
    WHERE id = lista_id AND usuario_id = auth.uid()
  )
);

-- ===============================================
-- 7. TRIGGERS PARA AUTOMATIZACIÓN
-- ===============================================

-- Función para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas nuevas
DROP TRIGGER IF EXISTS trigger_favoritos_fecha ON favoritos;
CREATE TRIGGER trigger_favoritos_fecha
  BEFORE UPDATE ON favoritos
  FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trigger_variantes_fecha ON producto_variantes;
CREATE TRIGGER trigger_variantes_fecha
  BEFORE UPDATE ON producto_variantes
  FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trigger_reviews_fecha ON producto_reviews;
CREATE TRIGGER trigger_reviews_fecha
  BEFORE UPDATE ON producto_reviews
  FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

DROP TRIGGER IF EXISTS trigger_direcciones_fecha ON direcciones;
CREATE TRIGGER trigger_direcciones_fecha
  BEFORE UPDATE ON direcciones
  FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Trigger para mantener una sola dirección predeterminada por usuario
CREATE OR REPLACE FUNCTION mantener_direccion_predeterminada()
RETURNS TRIGGER AS $
BEGIN
  -- Si la nueva dirección se marca como predeterminada
  IF NEW.es_predeterminada = true THEN
    -- Desmarcar todas las otras direcciones del usuario
    UPDATE direcciones 
    SET es_predeterminada = false 
    WHERE usuario_id = NEW.usuario_id 
      AND id != NEW.id
      AND es_predeterminada = true;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_direccion_predeterminada ON direcciones;
CREATE TRIGGER trigger_direccion_predeterminada
  AFTER INSERT OR UPDATE ON direcciones
  FOR EACH ROW 
  WHEN (NEW.es_predeterminada = true)
  EXECUTE FUNCTION mantener_direccion_predeterminada();

-- Trigger para actualizar contadores de votos en reviews
CREATE OR REPLACE FUNCTION actualizar_contadores_review()
RETURNS TRIGGER AS $
DECLARE
  positivos INTEGER;
  negativos INTEGER;
BEGIN
  -- Contar votos positivos y negativos
  SELECT 
    COUNT(*) FILTER (WHERE tipo_voto = 'positivo'),
    COUNT(*) FILTER (WHERE tipo_voto = 'negativo')
  INTO positivos, negativos
  FROM review_votos 
  WHERE review_id = COALESCE(NEW.review_id, OLD.review_id);
  
  -- Actualizar la review
  UPDATE producto_reviews 
  SET 
    votos_positivos = positivos,
    votos_negativos = negativos,
    fecha_actualizacion = NOW()
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_votos ON review_votos;
CREATE TRIGGER trigger_actualizar_votos
  AFTER INSERT OR UPDATE OR DELETE ON review_votos
  FOR EACH ROW 
  EXECUTE FUNCTION actualizar_contadores_review();

-- ===============================================
-- 8. FUNCIONES ÚTILES
-- ===============================================

-- Función para obtener promedio de puntuación de un producto
CREATE OR REPLACE FUNCTION obtener_promedio_puntuacion(producto_uuid UUID)
RETURNS NUMERIC AS $
DECLARE
  promedio NUMERIC(3,2);
BEGIN
  SELECT ROUND(AVG(puntuacion), 2)
  INTO promedio
  FROM producto_reviews 
  WHERE producto_id = producto_uuid 
    AND aprobada = true;
    
  RETURN COALESCE(promedio, 0);
END;
$ LANGUAGE plpgsql;

-- Función para obtener total de reviews de un producto
CREATE OR REPLACE FUNCTION obtener_total_reviews(producto_uuid UUID)
RETURNS INTEGER AS $
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO total
  FROM producto_reviews 
  WHERE producto_id = producto_uuid 
    AND aprobada = true;
    
  RETURN COALESCE(total, 0);
END;
$ LANGUAGE plpgsql;

-- Función para obtener stock total considerando variantes
CREATE OR REPLACE FUNCTION obtener_stock_total(producto_uuid UUID)
RETURNS INTEGER AS $
DECLARE
  stock_producto INTEGER;
  stock_variantes INTEGER;
  total_stock INTEGER;
BEGIN
  -- Obtener stock del producto principal
  SELECT stock INTO stock_producto
  FROM productos 
  WHERE id = producto_uuid;
  
  -- Obtener stock de variantes activas
  SELECT COALESCE(SUM(stock_variante), 0)
  INTO stock_variantes
  FROM producto_variantes 
  WHERE producto_id = producto_uuid 
    AND activa = true;
  
  -- Si hay variantes, usar el stock de variantes; sino, el del producto
  IF stock_variantes > 0 THEN
    total_stock = stock_variantes;
  ELSE
    total_stock = stock_producto;
  END IF;
  
  RETURN COALESCE(total_stock, 0);
END;
$ LANGUAGE plpgsql;

-- ===============================================
-- 9. VISTA MEJORADA DE PRODUCTOS CON REVIEWS
-- ===============================================

CREATE OR REPLACE VIEW v_productos_completos AS
SELECT 
  p.*,
  -- Información de descuento
  CASE 
    WHEN p.precio_descuento IS NOT NULL AND p.precio_descuento < p.precio 
    THEN ROUND(((p.precio - p.precio_descuento) / p.precio * 100))
    ELSE 0 
  END as porcentaje_descuento,
  COALESCE(p.precio_descuento, p.precio) as precio_final,
  
  -- Estado del stock
  obtener_stock_total(p.id) as stock_total,
  CASE 
    WHEN obtener_stock_total(p.id) <= 0 THEN 'sin_stock'
    WHEN obtener_stock_total(p.id) <= 5 THEN 'stock_bajo'
    ELSE 'disponible'
  END as estado_stock,
  
  -- Información de reviews
  obtener_promedio_puntuacion(p.id) as puntuacion_promedio,
  obtener_total_reviews(p.id) as total_reviews,
  
  -- Información de variantes
  (SELECT COUNT(*) FROM producto_variantes pv WHERE pv.producto_id = p.id AND pv.activa = true) as total_variantes,
  
  -- Información de favoritos (requiere contexto de usuario)
  (
    SELECT COUNT(*) > 0 
    FROM favoritos f 
    WHERE f.producto_id = p.id 
      AND f.usuario_id = auth.uid()
  ) as es_favorito
  
FROM productos p;

-- ===============================================
-- 10. DATOS DE EJEMPLO (OPCIONAL - SOLO DESARROLLO)
-- ===============================================

-- Descomentar las siguientes líneas si quieres datos de ejemplo
/*
-- Solo insertar si hay productos existentes
DO $
BEGIN
  IF EXISTS (SELECT 1 FROM productos LIMIT 1) THEN
    -- Insertar algunas variantes de ejemplo
    INSERT INTO producto_variantes (producto_id, color, talla, stock_variante, precio_extra, sku_variante)
    SELECT 
      p.id,
      CASE (RANDOM() * 4)::INTEGER
        WHEN 0 THEN 'Rojo'
        WHEN 1 THEN 'Azul'
        WHEN 2 THEN 'Verde'
        WHEN 3 THEN 'Negro'
        ELSE 'Blanco'
      END,
      CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN 'S'
        WHEN 1 THEN 'M'
        WHEN 2 THEN 'L'
        ELSE 'XL'
      END,
      (RANDOM() * 10 + 1)::INTEGER,
      (RANDOM() * 500)::NUMERIC(10,2),
      'VAR-' || SUBSTR(p.sku || '', 1, 6) || '-' || (RANDOM() * 1000)::INTEGER
    FROM productos p
    LIMIT 3
    ON CONFLICT (sku_variante) DO NOTHING;
    
    RAISE NOTICE 'Datos de ejemplo insertados correctamente';
  END IF;
END
$;
*/

-- ===============================================
-- CONFIRMACIÓN DE MIGRACIÓN
-- ===============================================

DO $
BEGIN
  RAISE NOTICE '✅ Migración 005 completada exitosamente';
  RAISE NOTICE 'Tablas creadas: favoritos, producto_variantes, producto_reviews, review_votos, direcciones, lista_deseos, lista_deseos_productos';
  RAISE NOTICE 'RLS habilitado en todas las tablas';
  RAISE NOTICE 'Triggers y funciones creados correctamente';
  RAISE NOTICE 'Vista v_productos_completos actualizada';
END
$;