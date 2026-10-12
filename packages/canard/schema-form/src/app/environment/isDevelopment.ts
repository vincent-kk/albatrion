/** Cached verdict after the first read; `undefined` until a development-only branch asks. */
let development: boolean | undefined;

/**
 * Whether development-only branches run: diagnostics, warnings, frozen internal records.
 * The `process.env.NODE_ENV` token is read as written so a consumer bundler can replace it
 * statically and drop the development branches; without a bundler the Node environment is
 * read at the first call, not at module load, and the verdict is cached for every later call.
 * A host with neither a bundler define nor a `process` object follows the same premise as the
 * CommonJS build: the consumer supplies the define.
 * @returns `true` outside production builds
 */
export const isDevelopment = (): boolean =>
  (development ??= process.env.NODE_ENV !== 'production');
