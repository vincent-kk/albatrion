import { instanceIdRegistrationsOf } from '../instanceIdRegistrationsOf';
import type { SchemaRootRegistration } from '../registerSchemaRoot';
import { preparePrivateCompiler } from './preparePrivateCompiler';
import type { PrivateCompiler } from './types';

/**
 * Select a bounded pooled compiler with conflict-isolated named resource reservations.
 * @param registration - Detached root state whose previous compiler may be reused.
 * @param schema - Current root or selected guard schema to compile.
 * @param kind - Separate validation or guard namespace to select.
 * @returns A current compatible private environment, creating one lazily when required.
 */
export const selectRootCompiler = (
  registration: SchemaRootRegistration,
  schema: object | boolean,
  kind: 'validation' | 'guard',
): PrivateCompiler => {
  const source = registration.baseAjv;
  const ledger = instanceIdRegistrationsOf(source);
  const allErrors = kind === 'validation' && !!source._opts.allErrors;
  const previous = registration[kind] ?? ledger.pool[kind];
  const compiler = preparePrivateCompiler(
    source,
    previous,
    schema,
    kind,
    allErrors,
    '',
    registration.key,
    kind === 'validation' && schema === registration.copy
      ? registration.serialized
      : undefined,
  );
  registration[kind] = compiler;
  ledger.pool.count = compiler.count;
  ledger.pool[kind] = compiler;
  return compiler;
};
