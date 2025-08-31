// Hook para gestión segura de variables de entorno
// src/hooks/useEnvConfig.js

import { useMemo } from 'react';

const useEnvConfig = () => {
  const config = useMemo(() => {
    // Verificar que las variables críticas estén definidas
    const requiredVars = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      emailAdmin: import.meta.env.VITE_EMAIL_ADMIN,
      mpPublicKey: import.meta.env.VITE_MP_PUBLIC_KEY,
      domain: import.meta.env.VITE_DOMAIN,
    };

    // Verificar que todas las variables estén presentes
    const missing = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error('🚨 Variables de entorno faltantes:', missing);
      console.error('📝 Revisa tu archivo .env o .env.development');
    }

    return {
      ...requiredVars,
      // URLs de MercadoPago
      urls: {
        success: import.meta.env.VITE_MP_SUCCESS_URL,
        failure: import.meta.env.VITE_MP_FAILURE_URL,
        pending: import.meta.env.VITE_MP_PENDING_URL,
        notification: import.meta.env.VITE_MP_NOTIFICATION_URL,
      },
      // Información de la app
      app: {
        name: import.meta.env.VITE_APP_NAME || 'EntrePatitas',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        env: import.meta.env.MODE,
        isProd: import.meta.env.PROD,
        isDev: import.meta.env.DEV,
      },
      // Estado de configuración
      isConfigured: missing.length === 0,
      missingVars: missing,
    };
  }, []);

  return config;
};

export default useEnvConfig;