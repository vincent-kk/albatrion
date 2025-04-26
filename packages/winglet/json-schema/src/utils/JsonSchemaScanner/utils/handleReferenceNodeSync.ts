import type { JsonScannerOptions, SchemaEntry, SchemaVisitor } from '../type';

export const handleReferenceNodeSync = <ContextType = void>(
  entry: SchemaEntry,
  stack: SchemaEntry[],
  visitedRefs: Set<string>,
  visitor: SchemaVisitor<ContextType>,
  options: JsonScannerOptions<ContextType>,
): void => {
  if (visitedRefs.has(entry.schema.$ref)) {
    visitor.exit?.(entry, options.context);
    return;
  }
  visitedRefs.add(entry.schema.$ref);

  const resolvedReference = options.resolveReference?.(
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
  } else
    visitor.exit?.(
      {
        schema: entry.schema,
        path: entry.path,
        depth: entry.depth,
        hasReference: true,
      },
      options.context,
    );
};
