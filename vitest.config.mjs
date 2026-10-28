// @ts-check
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      './tests/**/*.spec.ts'
    ],
    coverage: {
      enabled: true,
      reportsDirectory: 'built/coverage'
    }
  }
});
