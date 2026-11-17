import { foldAllowedTypes } from './foldAllowedTypes';

/** Schema-type representation shared with the folding helper's input contract. */
type FoldTypes = Parameters<typeof foldAllowedTypes>[0];

/**
 * Identify a blueprint kind including its union fold without changing dispatch.
 * A union blueprint node always carries its normalized schemaType list.
 * @param node - Immutable blueprint with a normalized type list for a union
 * @returns Existing non-union kind or a build-order-independent union mask token
 */
export const getBlueprintNodeIdentity = (node: {
  readonly kind: string;
  readonly schemaType?: FoldTypes;
}): string => {
  if (node.kind !== 'union') return node.kind;
  return 'union:' + foldAllowedTypes(node.schemaType);
};
