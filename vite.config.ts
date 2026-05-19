import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La API key de OpenRouter NO se inyecta en el cliente. Vive solo en el
// servidor (Vercel env vars) y la consume la función serverless /api/analyze.
export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
