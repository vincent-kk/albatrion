import type { JsonScannerOptions, SchemaVisitor, StackEntry } from '../type';

export const handleRefNodeSync = <ContextType = void>(
  entry: StackEntry,
  stack: StackEntry[],
  visitedRefs: Set<string>,
  visitor: SchemaVisitor<ContextType>,
  options: JsonScannerOptions<ContextType>,
): void => {
  if (visitedRefs.has(entry.schema.$ref)) {
    visitor.exit?.(entry, options.context);
    return;
  }
  visitedRefs.add(entry.schema.$ref);

  const resolved = options.resolveReference?.(
    entry.schema.$ref,
    options.context,
  );
  if (resolved) {
    stack.push({
      schema: entry.schema,
      path: entry.path,
      depth: entry.depth,
      resolvedRef: true,
    });
    stack.push({
      schema: resolved,
      path: entry.path,
      depth: entry.depth + 1,
      referencePath: entry.schema.$ref,
    });
  } else visitor.exit?.(entry, options.context);
};
