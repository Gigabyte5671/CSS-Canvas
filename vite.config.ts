import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  envPrefix: ['VITE_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    // don't minify for debug builds
    minify: 'esbuild',
    // produce sourcemaps for debug builds
    sourcemap: process.env.NODE_ENV === 'production' ? false : true
  },
  base: '/'
});
