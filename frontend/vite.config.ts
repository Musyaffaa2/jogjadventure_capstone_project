import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173
  },
  css: {
    transformer: 'postcss', // Force pakai PostCSS instead of LightningCSS
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      external: (id) => {
        // Exclude lightningcss dari bundle
        return id.includes('lightningcss');
      }
    }
  }
});