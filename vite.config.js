import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  base: './', 
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './localhost+1-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './localhost+1.pem')),
    }
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream-browserify',
    ],
  }
})
