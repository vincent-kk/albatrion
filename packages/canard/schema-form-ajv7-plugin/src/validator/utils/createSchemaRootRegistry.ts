import type { SchemaRootRegistry } from './registerSchemaRoot';

/** Construct only weak adapter-local selections; native compilers are created lazily. */
export const createSchemaRootRegistry = (): SchemaRootRegistry => ({ entries: new WeakMap() });
