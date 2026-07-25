/**
 * Output settings that pin the *shape* of the emitted JavaScript — syntax
 * level, wrapper codegen, and comment retention — independently of format,
 * paths, and module layout.
 *
 * Every value here is a deliberate choice, not a default. Rolldown's own
 * defaults would change the published artifacts, so each one is pinned:
 *
 * - `minify: false`            — rolldown defaults to `'dce-only'`. Publishing
 *                               unminified is intentional; consumers minify.
 * - `minifyInternalExports`    — defaults to `true` for `es` format, which
 *                               renames cross-module exports to single letters.
 * - `strict: true`             — rolldown's `'auto'` mirrors source directives,
 *                               and ESM sources carry none, so CJS output would
 *                               ship without a `'use strict'` prologue.
 * - `generatedCode.preset`     — `es2015` wrappers: const bindings, arrow
 *                               functions, object shorthand.
 * - `generatedCode.symbols`    — off, so CJS entries do not gain a
 *                               `Symbol.toStringTag` namespace marker.
 * - `comments`                 — stripped unless sourcemaps are on, matching
 *                               the declaration build's `removeComments`.
 */

/**
 * Downlevel target for the oxc transform.
 *
 * This must be kept in sync with `target` in `tsconfig.base.json` by hand:
 * rolldown reads `paths`, `jsx`, and `useDefineForClassFields` from tsconfig,
 * but NOT `target` — it defaults to `esnext`, which performs no lowering at
 * all. Leaving it unset would ship post-ES2020 syntax to consumers.
 */
export const TRANSFORM_TARGET = 'es2020';

/** @type {(sourcemap?: boolean) => Partial<import('rolldown').OutputOptions>} */
export const getCodegenOptions = (sourcemap = false) => ({
  minify: false,
  minifyInternalExports: false,
  strict: true,
  generatedCode: {
    preset: 'es2015',
    symbols: false,
  },
  comments: !!sourcemap,
});
