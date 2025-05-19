import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // keeps working if you disable mkcert certs later
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
    },
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      external: ['recordrtc'],
    },
  },
})
