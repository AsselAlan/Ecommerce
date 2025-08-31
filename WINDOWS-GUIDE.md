# 🐾 EntrePatitas - Guía Rápida Paso 5 (Windows)

## 🚀 Método Recomendado para Windows

### Paso 1: Verificar Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_KEY=tu_service_key_admin
```

> 💡 **¿Dónde obtener las claves?**
> Ve a: https://supabase.com/dashboard → Tu Proyecto → Settings → API

### Paso 2: Ejecutar la Migración

**Opción A: Script Directo (Sin Supabase CLI)**
```cmd
npm run migrate:direct
```

**Opción B: Script Batch (Windows Nativo)**
```cmd
npm run migrate:batch
```

**Opción C: Manual en Supabase Studio**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Copia el contenido de `scripts/migrations/005_create_missing_tables.sql`
5. Pégalo y ejecuta

### Paso 3: Verificar que Funcionó

```cmd
npm run verify:migration
```

---

## ✅ Si Todo Sale Bien

Verás este mensaje:
```
🎉 ¡VERIFICACIÓN EXITOSA!
=======================
✅ Todas las tablas están creadas
✅ Funciones SQL funcionando
✅ RLS habilitado correctamente
```

---

## 🔧 Si Hay Problemas

### Error: "Variables de entorno faltantes"

**Solución:**
1. Verifica que tu archivo `.env` existe
2. Copia las credenciales desde Supabase Dashboard
3. Reinicia tu terminal/editor

### Error: "relation does not exist"

**Solución:**
1. Ejecuta manualmente en Supabase Studio
2. O usa: `npm run migrate:direct` y sigue las instrucciones

### Error: "Cannot find module"

**Solución:**
```cmd
npm install
npm run migrate:direct
```

---

## 📋 ¿Qué Se Crea?

### Tablas Nuevas:
- `favoritos` - Para que usuarios guarden productos favoritos
- `producto_variantes` - Colores, talles, materiales
- `producto_reviews` - Reseñas con calificaciones 1-5
- `direcciones` - Direcciones de entrega del usuario

### Funciones SQL:
- `obtener_promedio_puntuacion()` - Rating promedio
- `obtener_total_reviews()` - Cantidad de reseñas
- `obtener_stock_total()` - Stock considerando variantes

### Hooks de React:
- `useFavorites()` - Gestionar favoritos
- `useProductVariants()` - Manejar variantes
- `useProductReviews()` - Sistema de reseñas

---

## 🎯 Próximo Paso

Una vez completado:

1. **Probar en tu app React:**
   ```jsx
   import { useFavorites } from './hooks/favorites/useFavorites';
   
   const { favorites, toggleFavorite } = useFavorites();
   ```

2. **Usar el ProductCard mejorado:**
   ```jsx
   import ProductCard from './components/Products/ProductCard';
   ```

3. **Continuar con Paso 6** de tu guía

---

## 💡 Tip

Si tienes dudas, el método más seguro es:

1. `npm run migrate:direct` (te dará instrucciones)
2. Copiar/pegar manualmente en Supabase Studio
3. `npm run verify:migration` para confirmar

¡Eso es todo! 🎉