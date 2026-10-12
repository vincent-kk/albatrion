/**
 * True outside production builds. The bare `process.env.NODE_ENV` token lets a consumer
 * bundler replace it statically and drop every development-only branch; without a bundler
 * the Node environment is read when this module loads. A host with neither a bundler define
 * nor a `process` object follows the same premise as the CommonJS build: the consumer
 * supplies the define (rounds 189, 196).
 */
export const DEVELOPMENT = process.env.NODE_ENV !== 'production';
