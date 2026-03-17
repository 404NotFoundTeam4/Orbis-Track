import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 4040,
    proxy: {
      '/api/v1': {
        target: 'http://server:4041',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})