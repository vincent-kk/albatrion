import type { ControlKey } from '../../types/controls';

/** Authored control expression positions indexed once per immutable analysis. */
const CONTROL_EXPRESSIONS = new WeakMap<object, ReadonlyMap<string, number>>();

/**
 * Find one compiled control expression without scanning the analysis each time.
 * @typeParam Expression - Compiled expression shape preserved by the lookup.
 * @param blueprint - Immutable analysis shared by all settlements of this tree
 * @param declarationId - Authored declaration whose controls own the expression
 * @param schemaPath - Exact control key address in the authored schema
 * @param key - Control key compiled at that address
 * @returns Compiled expression or undefined when that declaration is not compiled
 */
export const getControlExpression = <
  Expression extends {
    readonly declarationId: number;
    readonly schemaPath: string;
    readonly key: ControlKey;
  },
>(
  blueprint: { readonly expressions: readonly Expression[] },
  declarationId: number,
  schemaPath: string,
  key: ControlKey,
): Expression | undefined => {
  let expressions = CONTROL_EXPRESSIONS.get(blueprint);
  if (!expressions) {
    expressions = new Map(
      blueprint.expressions.map((expression, index) => [
        JSON.stringify([
          expression.declarationId,
          expression.schemaPath,
          expression.key,
        ]),
        index,
      ]),
    );
    CONTROL_EXPRESSIONS.set(blueprint, expressions);
  }
  const index = expressions.get(
    JSON.stringify([declarationId, schemaPath, key]),
  );
  return index === undefined ? undefined : blueprint.expressions[index];
};
