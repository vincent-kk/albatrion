import { disposeSchemaRoot } from './disposeSchemaRoot';
import type { SchemaRootRegistry } from './registerSchemaRoot';

/** Construct weak root ownership with cleanup for roots callers abandon. */
export const createSchemaRootRegistry = (): SchemaRootRegistry => ({
  entries: new WeakMap(),
  active: [],
  finalizer: new FinalizationRegistry(disposeSchemaRoot),
  compilerCount: 0,
  nextId: 0,
});
