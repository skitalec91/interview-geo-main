/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: environment.VITE_API_TARGET || 'http://localhost:3100',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'build'
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts'
    }
  };
});
