import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://a0baf2c7052d44141ac4d637738eda55-1d1e7c89a77d4039.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/api/v1/flights': {
        target: 'http://a0baf2c7052d44141ac4d637738eda55-1d1e7c89a77d4039.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/api/v1/bookings': {
        target: 'http://a0baf2c7052d44141ac4d637738eda55-1d1e7c89a77d4039.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/api/v1/baggage': {
        target: 'http://a0baf2c7052d44141ac4d637738eda55-1d1e7c89a77d4039.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://a0baf2c7052d44141ac4d637738eda55-1d1e7c89a77d4039.elb.us-east-1.amazonaws.com',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
