import { visitSchemaObjects } from './visitSchemaObjects';

/** Name maps whose subschemas run only through `$ref`, so their references and declarations are not inline. */
const DEFINITION_KEYWORDS: ReadonlySet<string> = new Set(['$defs', 'definitions']);

/**
 * Find the anchor names a guard references inline that neither its chain nor an ancestor of the reference binds.
 * A reference is a `$dynamicRef: '#name'` or a `$recursiveRef: '#name'` (`'#'` is the name `''`); AJV reads a `#/…`
 * pointer fragment of either as a name no anchor can declare. A reference counts when it is reached without
 * passing `$defs` or `definitions`. It is bound when `isBound(name)` holds, or when the schema object holding it
 * or one of its ancestors inside the guard declares the name, because AJV runs an object's dynamic keywords
 * before its subschemas; siblings, descendants and `$defs` declarations do not bind.
 * @param guard - The guard schema, an object or a boolean.
 * @param isBound - Whether the chain's table already binds a name.
 * @returns Distinct unbound names in document order.
 */
export const findUnboundGuardReferences = (
  guard: unknown,
  isBound: (name: string) => boolean,
): string[] => {
  const unbound = new Set<string>();
  visitSchemaObjects(guard, (schema, _pointer, ancestors) => {
    for (const name of readReferenceNames(schema))
      if (!isBound(name) && ![...ancestors, schema].some((scope) => declaresAnchor(scope, name)))
        unbound.add(name);
    return true;
  }, DEFINITION_KEYWORDS);
  return [...unbound];
};

/** The anchor names a schema object references dynamically; `$dynamicRef` and `$recursiveRef` are read independently. */
const readReferenceNames = (schema: object): string[] => {
  const names: string[] = [];
  if ('$dynamicRef' in schema && typeof schema.$dynamicRef === 'string' && schema.$dynamicRef.startsWith('#'))
    names.push(schema.$dynamicRef.slice(1));
  if ('$recursiveRef' in schema && typeof schema.$recursiveRef === 'string' && schema.$recursiveRef.startsWith('#'))
    names.push(schema.$recursiveRef.slice(1));
  return names;
};

/** Whether a schema object declares an anchor name (`''` is `$recursiveAnchor: true`). */
const declaresAnchor = (schema: object, name: string): boolean =>
  name === ''
    ? '$recursiveAnchor' in schema && schema.$recursiveAnchor === true
    : '$dynamicAnchor' in schema && schema.$dynamicAnchor === name;
