import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Intercept SCSS module imports so they don't fail in the test environment.
// Each class name is returned as-is (e.g. styles.foo → "foo"), which lets
// component tests assert on class names without needing a real CSS build.
const scssMockPlugin = {
  name: 'scss-module-mock',
  transform(_: string, id: string) {
    if (id.endsWith('.module.scss') || id.endsWith('.module.css')) {
      return {
        code: 'export default new Proxy({}, { get: (_, key) => String(key) })',
        map: null,
      }
    }
  },
}

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [scssMockPlugin as any, react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
