import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type {
  JsonScannerOptionsAsync,
  SchemaVisitor,
  StackEntry,
} from '../type';

export const handleRefNodeAsync = async <ContextType = void>(
  node: UnknownSchema,
  path: string,
  depth: number,
  stack: StackEntry[],
  visitedRefs: Set<string>,
  visitor: SchemaVisitor<ContextType>,
  options: JsonScannerOptionsAsync<ContextType>,
): Promise<void> => {
  if (visitedRefs.has(node.$ref)) {
    await visitor.exit?.(node, path, depth, options.context);
    return;
  }
  visitedRefs.add(node.$ref);

  const resolved = await options.resolveReference?.(node.$ref, options.context);
  if (resolved) {
    stack.push({ node, path, depth, parentIsRef: true });
    stack.push({
      node: resolved,
      path: `${path} -> (${node.$ref})`,
      depth: depth + 1,
    });
  } else if (visitor.exit) {
    await visitor.exit(node, path, depth, options.context);
  }
};
