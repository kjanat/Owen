import { defineConfig } from 'vite'
import path from 'path'

/**
 * Vite configuration for Owen Animation System Demo
 *
 * This configuration builds the demo application showcasing
 * the multi-scheme animation naming system and its features.
 */
export default defineConfig({
  // Demo-specific build configuration
  root: './demo',

  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,

    // Optimization settings for demo
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'demo/index.html'),
        examples: path.resolve(__dirname, 'demo/examples.html'),
        comparison: path.resolve(__dirname, 'demo/comparison.html'),
        interactive: path.resolve(__dirname, 'demo/interactive.html')
      },

      output: {
        // Asset organization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]'
          }

          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }

          if (/gltf|glb|fbx/i.test(ext)) {
            return 'assets/animations/[name]-[hash][extname]'
          }

          return 'assets/[name]-[hash][extname]'
        },

        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },

    // Source maps for debugging
    sourcemap: true,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for demo
        drop_debugger: true
      }
    },

    // Target modern browsers for demo
    target: 'es2020'
  },

  // Development server settings
  server: {
    port: 3001,
    host: true,
    open: '/demo/',

    // Proxy API calls if needed
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Preview server settings
  preview: {
    port: 3002,
    host: true,
    open: true
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@demo': path.resolve(__dirname, 'demo'),
      '@assets': path.resolve(__dirname, 'assets'),
      '@examples': path.resolve(__dirname, 'examples')
    }
  },

  // Define global constants for demo
  define: {
    __DEMO_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __ANIMATION_SCHEMES__: JSON.stringify(['legacy', 'artist', 'hierarchical', 'semantic'])
  },

  // Plugin configuration
  plugins: [
    // Add any demo-specific plugins here
  ],

  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@demo/styles/variables.scss";
          @import "@demo/styles/mixins.scss";
        `
      }
    },

    // CSS modules for component styling
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // Asset handling
  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    '**/*.fbx',
    '**/*.babylon'
  ],

  // Optimization
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/loaders/GLTFLoader',
      'three/examples/jsm/loaders/FBXLoader',
      'three/examples/jsm/controls/OrbitControls'
    ],
    exclude: [
      // Exclude any demo-specific modules that shouldn't be pre-bundled
    ]
  },

  // Environment variables
  envPrefix: 'OWEN_DEMO_',

  // Base path for deployment
  base: process.env.NODE_ENV === 'production' ? '/Owen/' : '/',

  // Worker configuration for animation processing
  worker: {
    format: 'es'
  },

  // Experimental features
  experimental: {
    buildAdvancedBaseOptions: true
  }
})
