import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/voltage': {
        target: 'https://voltageapi.com/v1',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/voltage/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add the API key header from environment variables
            if (process.env.VITE_VOLTAGE_API_KEY) {
              proxyReq.setHeader('X-Api-Key', process.env.VITE_VOLTAGE_API_KEY);
            }
            
            // Log the proxied request
            console.log(`🔗 Proxying ${req.method} ${req.url} -> ${proxyReq.path}`);
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`✅ Response ${proxyRes.statusCode} from ${req.url}`);
          });
        },
      },
    },
  },
})
