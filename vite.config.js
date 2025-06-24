import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    open: true
  },  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three')) {
            return 'three';
          }
          if (id.includes('@jaames/iro') || id.includes('gsap')) {
            return 'ui';
          }
          if (id.includes('katex')) {
            return 'math';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', '@jaames/iro', 'gsap', 'katex']
  }
});
