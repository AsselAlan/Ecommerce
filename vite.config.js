import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Ecommerce/',
   server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'legacy-play-seekers-generates.trycloudflare.com' // <-- agrega aquí tu host Cloudflare
    ]
  }
})
