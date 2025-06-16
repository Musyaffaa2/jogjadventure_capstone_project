import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173
  },
  build: {
    outDir: 'dist'
  }
});