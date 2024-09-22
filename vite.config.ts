import { fileURLToPath, URL } from 'node:url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
