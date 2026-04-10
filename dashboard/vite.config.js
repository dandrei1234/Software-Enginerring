import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      "positivistic-carline-superblessed.ngrok-free.dev"
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:1337', // your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
