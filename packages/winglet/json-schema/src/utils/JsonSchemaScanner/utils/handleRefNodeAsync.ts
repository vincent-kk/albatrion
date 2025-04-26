import type {
  JsonScannerOptionsAsync,
  SchemaVisitor,
  StackEntry,
} from '../type';

export const handleRefNodeAsync = async <ContextType = void>(
  entry: StackEntry,
  stack: StackEntry[],
  visitedRefs: Set<string>,
  visitor: SchemaVisitor<ContextType>,
  options: JsonScannerOptionsAsync<ContextType>,
): Promise<void> => {
  if (visitedRefs.has(entry.schema.$ref)) {
    await visitor.exit?.(entry, options.context);
    return;
  }
  visitedRefs.add(entry.schema.$ref);

  const resolved = await options.resolveReference?.(
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
  } else if (visitor.exit) {
    await visitor.exit(entry, options.context);
  }
};
