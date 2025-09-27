import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/football': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/football/, ''),
        headers: {
          'X-Auth-Token': '354c9341dac74c788f59795973d8099d'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Football proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying football request to:', proxyReq.path);
          });
        }
      },
      '/api/valorant': {
        target: 'https://vlrggapi.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/valorant/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Valorant proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying valorant request to:', proxyReq.path);
          });
        }
      },
      '/api/lol': {
        target: 'https://esports-api.lolesports.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lol/, ''),
        headers: {
          'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('LoL proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying LoL request to:', proxyReq.path);
          });
        }
      }
    }
  }
})
