import { detectDialect } from '../../utils/dialectFlag/detectDialect';
import type {
  ReferenceResolver,
  ReferenceStep,
  SchemaEntry,
} from '../../utils/type';
import { contextForChild } from './utils/contextForChild';

/** Convert a fixture source value into the public tagged result; native promises remain pending protocol results. */
function step(value: unknown, reference: string): ReferenceStep {
  return value === undefined
    ? { status: 'skipped', reason: 'unresolved', uri: reference }
    : {
        status: 'resolved',
        uri: reference,
        target: value as SchemaEntry['schema'],
      };
}

/**
 * Adapt a test's custom source to an explicit hand-written context protocol.
 * @param source Fixture source callback; native promises exercise the async driver and are rejected by the sync driver.
 * @returns A provider whose contexts are fixture-owned source provenance, separate from visitor context.
 */
export function createTestResolver(
  source: (reference: string, context: SchemaEntry) => unknown,
): ReferenceResolver<any> {
  return {
    root: (schema) => ({ schema, path: '#', dataPath: '', depth: 0 }),
    child: (parent, keyword, schema) =>
      contextForChild(parent, keyword, schema),
    dialect: (context) => {
      const flag =
        typeof context.schema === 'object' &&
        typeof context.schema.$schema === 'string'
          ? detectDialect(context.schema.$schema)
          : undefined;
      return flag === 1
        ? 'draft-04'
        : flag === 2
          ? 'draft-06'
          : flag === 4
            ? 'draft-07'
            : flag === 8
              ? '2019-09'
              : '2020-12';
    },
    resolve: (reference, _keyword, context): any => {
      const value = source(reference, context);
      return value instanceof Promise
        ? value.then((result) => step(result, reference))
        : step(value, reference);
    },
  };
}
