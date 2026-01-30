import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large dependencies for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['jspdf', '@react-pdf/renderer'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Increase warning limit since we're now chunking intentionally
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})

