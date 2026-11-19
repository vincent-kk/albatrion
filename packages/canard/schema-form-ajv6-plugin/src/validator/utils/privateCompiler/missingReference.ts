import type { Ajv } from 'ajv';

/**
 * Produce the bound AJV class's reference error without asking the application to compile.
 * @param source - Application constructor supplying the native missing-reference error class.
 * @param base - Native resolution base at the unresolved schema position.
 * @param ref - Authored reference that cannot resolve from current raw entries.
 * @returns Never returns; throws the application version native missing-reference error.
 */
export const missingReference = (
  source: Ajv,
  base: string,
  ref: string,
): never => {
  const Constructor = Reflect.get(source.constructor, 'MissingRefError');
  if (typeof Constructor === 'function')
    throw Reflect.construct(Constructor, [base, ref]);
  throw new Error(`Cannot resolve schema reference ${ref} from ${base}`);
};
