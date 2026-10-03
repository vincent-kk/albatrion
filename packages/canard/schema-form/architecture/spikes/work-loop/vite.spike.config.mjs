/**
 * Vite config for the current-library scripts. Mirrors the package's
 * `vitest.bench.config.ts` alias so scripts kept outside the repository can
 * import `@/schema-form/core` from source. No imports: this file is loaded
 * from a directory that cannot resolve `vite`/`vitest`.
 */
export default {
  resolve: {
    alias: {
      '@/schema-form':
        '/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src',
    },
  },
};
