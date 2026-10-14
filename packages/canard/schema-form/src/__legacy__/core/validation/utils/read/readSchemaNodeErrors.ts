import type { SchemaNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../type';

/** Stable empty read shared by nodes with no external or validator issues. */
const EMPTY_ISSUES: readonly ValidationIssue[] = Object.freeze([]);

/**
 * Read a node's displayed external and validator issues without recomputing them.
 * @param node - Occurrence whose current errors are requested.
 * @returns Stable ordered issues until either source changes.
 */
export const readSchemaNodeErrors = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): readonly ValidationIssue[] => {
  const runtime = node.rootNode.runtime;
  if (node.detached) return runtime.detachedReads?.get(node)?.errors ?? EMPTY_ISSUES;
  const external = runtime.nodeErrors?.get(node);
  const validation = runtime.validationErrors?.get(node);
  const isIssues = (items: readonly unknown[] | undefined): items is readonly ValidationIssue[] =>
    !!items && items.every((item) => item !== null && typeof item === 'object' &&
      'dataPath' in item && typeof item.dataPath === 'string');
  if (!isIssues(external)) return isIssues(validation) ? validation : EMPTY_ISSUES;
  if (!isIssues(validation)) return external;
  const cached = runtime.combinedErrors?.get(node);
  if (cached?.external === external && cached.validation === validation &&
    isIssues(cached.errors)) return cached.errors;
  const errors = [...external, ...validation];
  (runtime.combinedErrors ??= new Map()).set(node, { external, validation, errors });
  return errors;
};
