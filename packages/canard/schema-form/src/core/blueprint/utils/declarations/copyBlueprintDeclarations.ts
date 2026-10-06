import type { PropertyDeclaration } from '../../type';

/** Bundlers remove development protection from record-copy sites in production. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Give a virtual binding its own records and memberships while borrowing graph links.
 * @param source - Complete declarations whose gate elements and authored schemas stay shared.
 * @returns An owned declaration list with independent order and gates arrays.
 */
export const copyBlueprintDeclarations = (
  source: readonly PropertyDeclaration[],
): readonly PropertyDeclaration[] => {
  const result: PropertyDeclaration[] = [];
  for (let index = 0; index < source.length; index++) {
    const declaration = source[index];
    const copy = {
      ...declaration,
      order: [...declaration.order],
      gates: [...declaration.gates],
    };
    if (DEVELOPMENT) {
      Object.freeze(copy.order);
      Object.freeze(copy.gates);
      Object.freeze(copy);
    }
    result.push(copy);
  }
  return DEVELOPMENT ? Object.freeze(result) : result;
};
