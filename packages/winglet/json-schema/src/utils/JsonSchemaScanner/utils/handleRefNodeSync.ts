import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { JsonScannerOptions, SchemaVisitor, StackEntry } from '../type';

export const handleRefNodeSync = <ContextType = void>(
  node: UnknownSchema,
  path: string,
  depth: number,
  stack: StackEntry[],
  visitedRefs: Set<string>,
  visitor: SchemaVisitor<ContextType>,
  options: Required<JsonScannerOptions<ContextType>>,
): void => {
  if (visitedRefs.has(node.$ref)) {
    visitor.exit?.(node, path, depth, options.context);
    return;
  }
  visitedRefs.add(node.$ref);

  const resolved = options.resolveReference(node.$ref, options.context);
  if (resolved) {
    stack.push({ node, path, depth, parentIsRef: true });
    stack.push({
      node: resolved,
      path: `${path} -> (${node.$ref})`,
      depth: depth + 1,
    });
  } else visitor.exit?.(node, path, depth, options.context);
};
