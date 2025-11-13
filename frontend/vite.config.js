import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expõe para rede externa
    port: 5173,
    watch: {
      usePolling: true, // Necessário para HMR em Docker
    }
  }
})
