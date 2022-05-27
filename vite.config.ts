import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
  build: {
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      input: 'src/spine-viewer.tsx',
    },
    assetsDir: '.',
  },
});
