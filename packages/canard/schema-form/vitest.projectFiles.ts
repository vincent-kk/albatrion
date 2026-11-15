// Imported by vite.config.ts and vitest.verify.config.ts; these globs decide which Vitest project runs a test file.

/** DOM-backed product tests run in the render projects. */
export const renderTests = [
  'src/**/*.test.tsx',
  'src/**/helpers/virtualization/VirtualizationManager/__tests__/VirtualizationManager.test.ts',
];

/** Built-bundle tests run only in the production project after a build. */
export const bundleTests = [
  'src/core/surface/__tests__/detached.production.test.ts',
  'src/__tests__/e2e/exact-focus.production.test.ts',
];
