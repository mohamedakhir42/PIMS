import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PORT = Number(process.env.PORT) || 3000
const ALLOWED_HOSTS = ['frontend-production-b095.up.railway.app']

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: PORT,
    allowedHosts: ALLOWED_HOSTS,
  },

  preview: {
    host: '0.0.0.0',
    port: PORT,
    allowedHosts: ALLOWED_HOSTS,
  }
})