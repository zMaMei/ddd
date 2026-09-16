import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 后端 Spring Boot 跑在 8080，开发时将 /api 代理过去
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
