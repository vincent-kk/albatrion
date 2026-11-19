import { createFinalizer } from './createFinalizer';
import { disposeSchemaRoot } from './disposeSchemaRoot';
import type { SchemaRootRegistry } from './registerSchemaRoot';

/** Construct weak root ownership with cleanup for roots callers abandon. */
export const createSchemaRootRegistry = (): SchemaRootRegistry => ({
  entries: new WeakMap(),
  active: [],
  finalizer: createFinalizer(disposeSchemaRoot),
  compilerCount: 0,
});
