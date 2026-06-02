import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/v1/flights': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/v1/bookings': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/v1/baggage': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
