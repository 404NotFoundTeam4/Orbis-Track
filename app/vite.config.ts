import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://server:4041',
        changeOrigin: true,
        ws: true,
        rewrite: (p) => p.replace(/^\/api/, '/api/v1'),
      },
    },
  },
})