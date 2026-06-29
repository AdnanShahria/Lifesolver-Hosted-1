import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import type { Plugin } from 'vite';

// Middleware to rewrite requests for other shells during dev
function shellRewriteMiddleware(): Plugin {
  return {
    name: 'shell-rewrite-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const url = req.url;

        // Pass through assets and api
        if (url.startsWith('/@') || url.startsWith('/node_modules') || url.startsWith('/src') || url.startsWith('/api')) {
          return next();
        }

        if (url.startsWith('/auth')) {
          req.url = '/auth.html';
        } else if (url.startsWith('/app')) {
          req.url = '/app.html';
        }
        
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), shellRewriteMiddleware()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
        app: resolve(__dirname, 'app.html'),
      },
    },
  },
});
