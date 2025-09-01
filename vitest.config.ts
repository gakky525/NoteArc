import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        '.next/**',
        'next.config.*',
        'postcss.config.*',
        'eslint.config.*',
        'vitest.config.*',
        'next-env.d.*',
        'docker/**',
        'notearc/docker/**',
        'src/types/**',
      ],
    },
  },
});
