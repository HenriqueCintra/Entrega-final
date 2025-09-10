import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
    proxy: {
      '/osrm': {
        target: 'http://router.project-osrm.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/osrm/, ''),
      }
    }
  },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '4173')
    }
  }
})