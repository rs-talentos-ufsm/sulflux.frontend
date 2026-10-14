import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sharedPath = fs.existsSync(
  path.resolve(__dirname, './external_shared/dist/index.js'),
)
  ? path.resolve(__dirname, './external_shared/dist/index.js')
  : fs.existsSync(
        path.resolve(__dirname, '../../packages/shared/dist/index.js'),
      )
    ? path.resolve(__dirname, '../../packages/shared/dist/index.js')
    : path.resolve(__dirname, './node_modules/@lib/shared/dist/index.js');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Exclui a biblioteca compartilhada do sistema de cache agressivo do Vite
  optimizeDeps: {
    exclude: ['@lib/shared'],
  },

  server: {
    host: '0.0.0.0', // <-- Diz ao Vite para escutar em todas as interfaces (0.0.0.0)
    port: 5173, // Garante que ele vai fixar a porta interna que mapeamos no Compose
    strictPort: true, // Se a porta já estiver em uso, o Vite vai falhar ao invés de escolher outra porta
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, './external_shared'),
        path.resolve(__dirname, '../../packages/shared'),
        path.resolve(__dirname, './node_modules/@lib/shared'),
      ],
    },
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib/shared': sharedPath,
    },
  },
  test: {
    // Para o frontend, precisamos simular o navegador
    environment: 'jsdom',

    globals: true,

    // Arquivo para injetar matchers do testing-library antes dos testes rodarem
    setupFiles: ['./tests/setupTests.ts'],

    // Inclui arquivos .tsx (componentes React)
    include: ['tests/**/*.{spec,test}.{ts,tsx}'],

    testTimeout: 10000,

    coverage: {
      reportsDirectory: './coverage',
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/__mocks__/**',
        '**/__tests__/**',
      ],
    },
  },
});
