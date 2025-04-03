import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Any custom aliases can be added here if needed
    },
  },
  optimizeDeps: {
    include: ['react-router-dom'],
  }
})
