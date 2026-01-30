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
        manualChunks(id) {
          // Vendor chunks - split large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('/react/')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('jspdf') || id.includes('@react-pdf')) {
              return 'vendor-pdf';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-ui';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            if (id.includes('html2canvas')) {
              return 'vendor-canvas';
            }
            if (id.includes('exceljs')) {
              return 'vendor-excel';
            }
          }

          // Feature-based chunks for app code
          if (id.includes('/src/features/planner/')) {
            return 'feature-planner';
          }
          if (id.includes('/src/features/billing/')) {
            return 'feature-billing';
          }
          if (id.includes('/src/features/onboarding/')) {
            return 'feature-onboarding';
          }
          if (id.includes('/src/features/marketplace/')) {
            return 'feature-marketplace';
          }
          if (id.includes('/src/features/appointments/')) {
            return 'feature-appointments';
          }
          if (id.includes('/src/features/live/')) {
            return 'feature-live';
          }
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

