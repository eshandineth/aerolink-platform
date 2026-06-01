import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://a1462f181d9c047cba7c7695a8bc83a5-28ab496a7fb63650.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/api/v1/flights': {
        target: 'http://a1462f181d9c047cba7c7695a8bc83a5-28ab496a7fb63650.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/api/v1/bookings': {
        target: 'http://a1462f181d9c047cba7c7695a8bc83a5-28ab496a7fb63650.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/api/v1/baggage': {
        target: 'http://a1462f181d9c047cba7c7695a8bc83a5-28ab496a7fb63650.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://a1462f181d9c047cba7c7695a8bc83a5-28ab496a7fb63650.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
