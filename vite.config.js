import { defineConfig } from 'vite'

export default defineConfig({
  root: 'examples',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  resolve: {
    alias: {
      owen: '/src/index.js'
    }
  }
})
