import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Ecommerce/',
  server: {
    host: true, // Permite conexiones externas
    allowedHosts: [
      'localhost',
      '.trycloudflare.com' // Permite todos los subdominios de trycloudflare
    ]
  }
})
