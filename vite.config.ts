import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      allow: ['./'],
    },
    watch: {
      usePolling: true,
      ignored: ['!**/external_shared/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib/shared': path.resolve(__dirname, './external_shared/dist'),
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
