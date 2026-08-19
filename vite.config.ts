import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(root, 'src/app'),
      '@sim': path.resolve(root, 'src/sim'),
      '@content': path.resolve(root, 'src/content'),
      '@contracts': path.resolve(root, 'src/contracts'),
      '@ui': path.resolve(root, 'src/ui'),
      '@assets': path.resolve(root, 'src/assets'),
      '@tests': path.resolve(root, 'tests'),
    },
  },
  build: {
    sourcemap: true,
  },
});
