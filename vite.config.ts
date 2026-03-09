import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< Current (Your changes)
  plugins: [react()],
=======
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Инвестиционный Портфель',
        short_name: 'Портфель',
        description: 'Управление инвестиционным портфелем',
        theme_color: '#0f1729',
        background_color: '#0f1729',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
>>>>>>> Incoming (Background Agent changes)
})

