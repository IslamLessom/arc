import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Restaurant POS',
        short_name: 'POS',
        description: 'Система учета для ресторанов',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        categories: ['business', 'food']
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@restaurant-pos/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@restaurant-pos/pwa-core': path.resolve(__dirname, '../../packages/pwa-core/src'),
      '@restaurant-pos/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@restaurant-pos/types': path.resolve(__dirname, '../../packages/types/src'),
      '@restaurant-pos/real-time': path.resolve(__dirname, '../../packages/real-time/src'),
      '@restaurant-pos/print-service': path.resolve(__dirname, '../../packages/print-service/src'),
      '@restaurant-pos/assets': path.resolve(__dirname, '../../packages/assets/src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3002
  },
  build: {
    outDir: 'dist'
  }
})
