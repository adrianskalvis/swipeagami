import { defineConfig } from 'vite';

// The app is served from https://<owner>.github.io/swipeagami/
const base = process.env.BASE_PATH || '/swipeagami/';

export default defineConfig({
  base,
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
