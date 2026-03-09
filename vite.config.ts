import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Auto-import design tokens into every SCSS module
        additionalData: `@use "@/styles/variables" as *;`,
      },
    },
  },
  resolve: {
    alias: { '@': '/src' },
  },
})
