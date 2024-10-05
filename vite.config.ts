import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    })
  ],
  // test: {
  //   globals: true,
  //   environment: 'jsdom',
  //   setupFiles: ['./vitest.setup.ts'],
  //   reporters: ['verbose'],
  // },
})
