import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Configuração de hosts permitidos
  const allowedHosts = process.env.ALLOWED_HOSTS 
    ? process.env.ALLOWED_HOSTS.split(',').map(host => host.trim())
    : mode === 'production' ? 'all' : ['localhost', '127.0.0.1']
  
  console.log('Allowed hosts:', allowedHosts)
  console.log('Mode:', mode)
  console.log('PORT:', process.env.PORT)
  
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
      allowedHosts: allowedHosts,
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
      port: parseInt(process.env.PORT || '4173'),
      allowedHosts: allowedHosts
    }
  }
})