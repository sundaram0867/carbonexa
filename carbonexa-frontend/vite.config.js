import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, projectDirectory, '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: environment.PHP_API_ORIGIN || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
