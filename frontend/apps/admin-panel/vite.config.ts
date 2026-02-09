import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3001
  },
  resolve: {
    alias: {
      '@restaurant-pos/types': path.resolve(__dirname, '../../packages/types/src'),
      '@restaurant-pos/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@restaurant-pos/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@restaurant-pos/assets': path.resolve(__dirname, '../../packages/assets/src'),
    }
  }
})


