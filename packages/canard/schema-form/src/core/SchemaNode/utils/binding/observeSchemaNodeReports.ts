import type { SchemaNode } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Run report delivery in the core observer scope without permitting form writes.
 * @param root - Live public root whose runtime owns the error delivery flag
 * @param deliver - Synchronous observer callback; nested scopes are supported
 * @returns Nothing; restores the preceding scope even when delivery throws
 * @throws The callback's exception after restoring the observer scope
 */
export const observeSchemaNodeReports = (root: SchemaNode, deliver: () => void): void => {
  const runtime = requireRuntimeSchemaNode(root, true).runtime;
  const previous = runtime.reportingErrors;
  runtime.reportingErrors = true;
  try { deliver(); }
  finally { runtime.reportingErrors = previous; }
};
