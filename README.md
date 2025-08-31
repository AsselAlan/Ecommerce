# 🐾 EntrePatitas - Tienda Online de Productos para Mascotas

Ecommerce completo desarrollado con **React** + **Supabase** + **MercadoPago** para la venta de productos para mascotas. Sistema seguro con autenticación, carrito de compras, pagos y panel de administración.

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![MercadoPago](https://img.shields.io/badge/MercadoPago-Payments-blue.svg)](https://mercadopago.com.ar/)
[![Vite](https://img.shields.io/badge/Vite-6.0.3-purple.svg)](https://vitejs.dev/)

🟡 **En desarrollo - Próximamente en producción**

---

## ✨ Características Principales

### 🛍️ **Para Usuarios**
- 🗂️ Catálogo de productos por categorías (comederos, juguetes, accesorios, higiene)
- 🛒 Carrito de compras con persistencia
- ❤️ Sistema de favoritos
- 🔐 Autenticación segura (registro/login)
- 💳 Pagos con MercadoPago (tarjetas, efectivo, cuotas)
- 📱 Diseño responsive (móvil y desktop)
- 🔍 Búsqueda y filtros avanzados

### 👨‍💼 **Panel de Administración**
- 📊 Dashboard con estadísticas
- 📦 Gestión completa de productos (CRUD)
- 🛒 Administración de pedidos
- 👥 Gestión de usuarios
- 📈 Reportes de ventas

### 🔒 **Seguridad**
- 🛡️ Row Level Security (RLS) en base de datos
- 🔑 Autenticación JWT con Supabase
- 🚫 Protección de credenciales sensibles
- ⚡ Políticas de acceso por roles

---

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React 19** - Biblioteca principal
- **Vite** - Herramientas de desarrollo
- **React Router** - Navegación
- **React Bootstrap** - Componentes UI
- **React Icons** - Iconografía

### **Backend & Base de Datos**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos principal
- **Row Level Security** - Seguridad a nivel de BD

### **Pagos & Servicios**
- **MercadoPago API** - Procesamiento de pagos
- **Edge Functions** - Webhooks serverless

### **Deploy & DevOps**
- **Vercel** - Hosting y deploy
- **GitHub Actions** - CI/CD (próximamente)

---

## 🏗️ Arquitectura del Proyecto

```
📦 EntrePatitas/
├── 📂 src/
│   ├── 📂 components/          # Componentes reutilizables
│   │   ├── 📂 navbar/         # Barra de navegación
│   │   ├── 📂 carrito/        # Carrito de compras
│   │   ├── 📂 favs/           # Sistema de favoritos
│   │   └── 📂 footer/         # Pie de página
│   ├── 📂 pages/              # Páginas principales
│   │   ├── 📂 home/           # Página principal
│   │   ├── 📂 products/       # Catálogo y detalles
│   │   ├── 📂 Auth/           # Login/Registro
│   │   └── 📂 payment/        # Proceso de pago
│   ├── 📂 admin/              # Panel de administración
│   │   ├── 📜 Dashboard.jsx   # Estadísticas
│   │   ├── 📜 Productos.jsx   # Gestión de productos
│   │   └── 📜 Pedidos.jsx     # Gestión de pedidos
│   ├── 📂 context/            # Estado global
│   │   ├── 📜 AuthContext.jsx # Autenticación
│   │   ├── 📜 CartContext.jsx # Carrito
│   │   └── 📜 FavsContext.jsx # Favoritos
│   ├── 📂 services/           # APIs y servicios
│   │   ├── 📜 productService.js
│   │   ├── 📜 orderService.js
│   │   └── 📜 mercadopagoService.js
│   ├── 📂 hooks/              # Hooks personalizados
│   └── 📂 libs/               # Configuraciones
└── 📂 supabase/               # Configuración de BD
    ├── 📂 functions/          # Edge Functions
    └── 📂 migrations/         # Migraciones de BD
```

---

## ⚙️ Configuración Local

### **Prerequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase
- Cuenta de desarrollador en MercadoPago

### **1. Clonar y configurar**
```bash
git clone https://github.com/AsselAlan/EntrePatitas.git
cd EntrePatitas
npm install
```

### **2. Variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env.development

# Completar con tus credenciales
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_EMAIL_ADMIN=tu_email@gmail.com
VITE_MP_PUBLIC_KEY=TEST-tu-public-key-de-mercadopago
```

### **3. Configurar Base de Datos**
```bash
# Ejecutar migraciones (desde Supabase Dashboard)
# Copiar contenido de scripts/migrate.sql
```

### **4. Iniciar desarrollo**
```bash
npm run dev
# Abrir http://localhost:5173
```

---

## 🧪 Herramientas de Testing

### **Verificar Configuración**
```bash
# Ir a: http://localhost:5173/config-check
# Verifica que todas las variables estén configuradas
```

### **Probar Seguridad RLS**
```bash
# Ir a: http://localhost:5173/test-rls  
# Ejecuta pruebas de Row Level Security
```

---

## 📊 Base de Datos

### **Esquema Principal**
- **productos** - Catálogo de productos
- **pedidos** - Órdenes de compra  
- **users** - Usuarios (Supabase Auth)
- **favoritos** - Lista de favoritos por usuario

### **Seguridad RLS Implementada**
- ✅ Usuarios solo ven sus propios pedidos
- ✅ Solo admin puede modificar productos
- ✅ Productos inactivos ocultos para usuarios
- ✅ Políticas específicas para webhooks

---

## 💳 Integración con MercadoPago

### **Funcionalidades**
- ✅ Pagos con tarjeta (hasta 12 cuotas)
- ✅ Pagos en efectivo (Pago Fácil, Rapipago)
- ✅ Webhooks para actualización automática
- ✅ URLs de retorno configurables
- ✅ Manejo de estados (aprobado/rechazado/pendiente)

### **Flujo de Pago**
1. Usuario agrega productos al carrito
2. Completa datos de entrega
3. Se genera preferencia en MercadoPago
4. Redirección a checkout de MP
5. Webhook actualiza estado del pedido
6. Confirmación y seguimiento

---

## 🚀 Deploy a Producción

### **Preparación**
1. Completar `.env.production` con credenciales reales
2. Configurar dominio personalizado
3. Configurar Edge Functions para webhooks
4. Configurar variables en Vercel/Netlify

### **Deploy Automático**
```bash
# Usar script de deploy
npm run deploy
```

---

## 📈 Próximas Mejoras

### **Funcionalidades Pendientes**
- [ ] Sistema de reviews y calificaciones
- [ ] Búsqueda con filtros avanzados
- [ ] Notificaciones push
- [ ] Descuentos y cupones
- [ ] Programa de fidelización
- [ ] Integración con redes sociales

### **Optimizaciones Técnicas**
- [ ] Lazy loading de componentes
- [ ] Cache de productos
- [ ] Optimización de imágenes
- [ ] PWA (Progressive Web App)
- [ ] Tests automatizados

---

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Alan Assel**
- 💼 [LinkedIn](https://linkedin.com/in/alanasseldev)
- 🐱 [GitHub](https://github.com/AsselAlan)
- 📧 Email: asselalan@gmail.com

---

## 📞 Soporte

Si tienes problemas con la configuración o encuentras bugs:

1. 🔍 Revisa la [documentación](docs/)
2. 🐛 Crea un [issue](https://github.com/AsselAlan/EntrePatitas/issues)
3. 💬 Contacta por [email](mailto:asselalan@gmail.com)

---

⭐ **¡Si te gusta el proyecto, dale una estrella!** ⭐