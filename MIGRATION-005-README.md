# 🐾 EntrePatitas - Paso 5: Tablas Faltantes

## ✅ Migración 005 Completada

Este paso implementa las tablas faltantes para mejorar la funcionalidad del e-commerce EntrePatitas, agregando:

- **Favoritos** de usuarios
- **Variantes** de productos (colores, talles, materiales)
- **Reviews/Reseñas** con sistema de votación
- **Direcciones** de usuarios
- **Listas de deseos** (wishlist)

---

## 📋 Tablas Creadas

### 1. `favoritos`
```sql
- id (UUID, PK)
- usuario_id (UUID, FK auth.users)
- producto_id (UUID, FK productos)
- fecha_creacion (TIMESTAMP)
```

### 2. `producto_variantes`
```sql
- id (UUID, PK)
- producto_id (UUID, FK productos)
- color, talla, material (VARCHAR)
- stock_variante (INTEGER)
- precio_extra (NUMERIC)
- imagen_variante (TEXT)
- sku_variante (VARCHAR, UNIQUE)
```

### 3. `producto_reviews`
```sql
- id (UUID, PK)
- producto_id (UUID, FK productos)
- usuario_id (UUID, FK auth.users)
- puntuacion (INTEGER 1-5)
- titulo, comentario (TEXT)
- votos_positivos, votos_negativos (INTEGER)
```

### 4. `direcciones`
```sql
- id (UUID, PK)
- usuario_id (UUID, FK auth.users)
- alias, nombre_completo (VARCHAR)
- calle, numero, ciudad, provincia (VARCHAR)
- codigo_postal (VARCHAR)
- es_predeterminada (BOOLEAN)
```

### 5. `lista_deseos` & `lista_deseos_productos`
Sistema de wishlist con productos organizados en listas.

---

## 🚀 Cómo Ejecutar la Migración

### Opción 1: Script de Node.js
```bash
npm run migrate:005
```

### Opción 2: Usando Supabase CLI (Linux/Mac)
```bash
npm run migrate:cli
```

### Opción 3: PowerShell (Windows)
```bash
npm run migrate:cli:win
```

### Opción 4: Manual en Supabase Studio
1. Abre Supabase Studio
2. Ve a SQL Editor
3. Copia el contenido de `scripts/migrations/005_create_missing_tables.sql`
4. Ejecuta el script

---

## 🔧 Funciones SQL Incluidas

### Funciones de Consulta
- `obtener_promedio_puntuacion(producto_uuid)` - Rating promedio
- `obtener_total_reviews(producto_uuid)` - Total de reseñas  
- `obtener_stock_total(producto_uuid)` - Stock considerando variantes

### Triggers Automáticos
- Actualización de fecha de modificación
- Mantener una sola dirección predeterminada por usuario
- Actualizar contadores de votos en reviews

---

## ⚛️ Hooks de React Incluidos

### `useFavorites()`
```jsx
import { useFavorites } from './hooks/favorites/useFavorites';

const { favorites, toggleFavorite, isFavorite } = useFavorites();
```

### `useProductVariants(productId)`
```jsx
import { useProductVariants } from './hooks/useProductVariants';

const { variants, selectedVariant, selectVariant } = useProductVariants(productId);
```

### `useProductReviews(productId)`
```jsx
import { useProductReviews } from './hooks/useProductReviews';

const { reviews, reviewStats, createReview } = useProductReviews(productId);
```

### `useUserAddresses()`
```jsx
import { useUserAddresses } from './hooks/useUserAddresses';

const { addresses, createAddress, setAsDefault } = useUserAddresses();
```

---

## 🎨 Componentes Actualizados

### ProductCard Mejorado
- Botón de favoritos funcional
- Información de variantes
- Rating con estrellas
- Estados de stock inteligentes

```jsx
import ProductCard from './components/Products/ProductCard';

<ProductCard 
  producto={producto}
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
  showFavoriteButton={true}
  showRating={true}
  showVariantInfo={true}
/>
```

---

## 🔒 Seguridad RLS

Todas las tablas tienen **Row Level Security (RLS)** habilitado con políticas:

- **Favoritos**: Los usuarios solo ven/modifican sus favoritos
- **Reviews**: Lectura pública, escritura solo del propietario
- **Direcciones**: Completamente privadas por usuario
- **Variantes**: Lectura pública, modificación solo admin

---

## 🧪 Testing

### Verificar Tablas Creadas
```sql
-- En Supabase Studio SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'favoritos', 
    'producto_variantes', 
    'producto_reviews', 
    'direcciones'
  );
```

### Probar Funciones
```sql
-- Obtener rating de un producto
SELECT obtener_promedio_puntuacion('uuid-del-producto');
SELECT obtener_total_reviews('uuid-del-producto');
```

### Insertar Datos de Prueba
```sql
-- Crear una variante de producto
INSERT INTO producto_variantes (producto_id, color, talla, stock_variante)
VALUES ('tu-producto-uuid', 'Rojo', 'M', 10);

-- Agregar una review
INSERT INTO producto_reviews (producto_id, usuario_id, puntuacion, comentario)
VALUES ('tu-producto-uuid', 'tu-usuario-uuid', 5, 'Excelente producto!');
```

---

## 📝 Próximos Pasos

1. **Probar en el Frontend**
   - Agregar/quitar favoritos
   - Seleccionar variantes de producto
   - Escribir reseñas

2. **Implementar en Componentes Existentes**
   - Actualizar ProductDetail con variantes
   - Agregar página de favoritos
   - Crear formulario de direcciones

3. **Continuar con Paso 6**
   - Implementar autenticación robusta
   - Optimizar performance del frontend

---

## 🆘 Solución de Problemas

### Error: "relation does not exist"
```bash
# Verificar conexión a Supabase
supabase status
supabase db status

# Reiniciar proyecto local
supabase stop
supabase start
```

### Error: "function exec does not exist"
- Ejecutar manualmente el SQL en Supabase Studio
- O usar el método de Supabase CLI

### Variables de Entorno Faltantes
```env
# Archivo .env
VITE_SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_KEY=tu_service_key
```

---

## 🎯 Estado del Proyecto

| Funcionalidad | Estado | Notas |
|--------------|--------|-------|
| ✅ Favoritos | Implementado | Hooks y componentes listos |
| ✅ Variantes | Implementado | Colores, talles, materiales |
| ✅ Reviews | Implementado | Con sistema de votos |
| ✅ Direcciones | Implementado | Con validaciones |
| ✅ RLS | Implementado | Todas las tablas protegidas |
| ✅ Triggers | Implementado | Automatización completa |

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `supabase logs`
2. Verifica en Supabase Studio que las tablas existan
3. Confirma que los hooks se importen correctamente
4. Revisa que las políticas RLS permitan las operaciones

---

**¡Migración 005 completada! 🎉**

*Ahora tienes un e-commerce con funcionalidades avanzadas: favoritos, variantes, reviews y más.*