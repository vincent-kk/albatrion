/**
 * Rolldown `platform` for every published build, in both formats.
 *
 * Rolldown defaults to `'node'` for `cjs` and `'browser'` for every other
 * format, and the `'browser'` platform replaces `process.env.NODE_ENV` with a
 * constant chosen by `minify` (`"development"` when off, `"production"` when
 * on), whatever the build process's own environment is. Because these builds
 * publish unminified output, the default would hard-wire development branches
 * into the ESM files while the CJS files keep reading the variable.
 *
 * `'neutral'` leaves `process.env.NODE_ENV` for the consumer's bundler or
 * runtime to resolve in both formats. Its other effects (empty main fields
 * and no platform resolve conditions) never apply here: `isExternalModule`
 * keeps every bare specifier external, so only relative, absolute and
 * tsconfig-path imports are resolved.
 */
export const BUILD_PLATFORM = 'neutral';
