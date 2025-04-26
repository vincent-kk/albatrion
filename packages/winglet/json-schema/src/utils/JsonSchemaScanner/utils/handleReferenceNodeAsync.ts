import type {
  JsonScannerOptionsAsync,
  SchemaEntry,
  SchemaVisitor,
} from '../type';

export const handleReferenceNodeAsync = async <ContextType = void>(
  entry: SchemaEntry,
  stack: SchemaEntry[],
  visitedRefs: Set<string>,
  visitor: SchemaVisitor<ContextType>,
  options: JsonScannerOptionsAsync<ContextType>,
): Promise<void> => {
  if (visitedRefs.has(entry.schema.$ref)) {
    await visitor.exit?.(entry, options.context);
    return;
  }
  visitedRefs.add(entry.schema.$ref);

  const resolvedReference = await options.resolveReference?.(
    entry.schema.$ref,
    options.context,
  );
  if (resolvedReference) {
    stack.push({
      schema: entry.schema,
      path: entry.path,
      depth: entry.depth,
      referenceResolved: true,
    });
    stack.push({
      schema: resolvedReference,
      path: entry.path,
      depth: entry.depth + 1,
      referencePath: entry.schema.$ref,
    });
  } else if (visitor.exit)
    await visitor.exit(
      {
        schema: entry.schema,
        path: entry.path,
        depth: entry.depth,
        hasReference: true,
      },
      options.context,
    );
};
