import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Required for Google Sign-In popup to communicate via postMessage
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/ollama_api': {
        target: 'http://localhost:11434/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama_api/, '')
      }
    },
  },
})
