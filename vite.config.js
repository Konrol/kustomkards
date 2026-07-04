import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3173,
    strictPort: true,
  },
  preview: {
    host: 'localhost',
    port: 3173,
    strictPort: true,
  },
})
