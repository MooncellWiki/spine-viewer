import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: 'src/main.tsx',
    },
    assetsDir: '.',
  },
});
