import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Inoltra le richieste /api al server backend in esecuzione su localhost:5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true, // Necessario per host virtuali
      },
    }
  },
  build: {
    // Genera un manifest degli asset, essenziale per l'integrazione
    // dinamica degli script nel plugin di WordPress.
    manifest: 'asset-manifest.json',
    outDir: 'dist',
  },
});