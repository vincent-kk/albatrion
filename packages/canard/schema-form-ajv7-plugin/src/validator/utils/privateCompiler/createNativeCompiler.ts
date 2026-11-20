import type { AjvInstance as Ajv } from '../../types/AjvInstance';
import { instanceIdRegistrationsOf } from '../instanceIdRegistrationsOf';
import { installPrivateResolver } from './installPrivateResolver';
import { isNativeCompiler } from './isNativeCompiler';
import { observeIdentity } from './observeIdentity';
import type { PrivateCompiler } from './types';

/**
 * Construct an empty compiler with the application's class and no bootstrap registrations.
 * @param source - Application constructor and live profile; bootstrap registrations are excluded.
 * @param kind - Validation, guard or meta namespace with independent generated code.
 * @param allErrors - Error collection policy selected for this private environment.
 * @param validateSchema - Native schema-validation policy after detached bootstrap construction.
 * @returns An isolated lazy-import environment; throws a clear isolation error for unsupported constructors.
 */
export const createNativeCompiler = (
  source: Ajv,
  kind: PrivateCompiler['kind'],
  allErrors: boolean,
  validateSchema: PrivateCompiler['validateSchema'],
): PrivateCompiler => {
  const options = {
    ...source.opts,
    schemas: undefined,
    keywords: undefined,
    formats: undefined,
    cache: undefined,
    serialize: undefined,
    meta: false,
    $data: false,
    validateSchema: false,
    allErrors,
  };
  for (const key of ['schemas', 'keywords', 'formats', 'cache', 'serialize'])
    Reflect.deleteProperty(options, key);
  let candidate: unknown;
  try {
    candidate = Reflect.construct(source.constructor, [options]);
  } catch (cause) {
    throw new Error(
      `AJV isolation compiler creation failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
  if (
    !isNativeCompiler(candidate, source) ||
    Object.keys(candidate.schemas).length ||
    Object.keys(candidate.refs).length
  )
    throw new Error(
      'AJV isolation compiler creation failed: the constructor must honor empty compiler options',
    );
  const instance = candidate;
  Object.defineProperties(instance, {
    RULES: { value: source.RULES, configurable: true },
    formats: { value: source.formats, configurable: true },
  });
  Object.assign(instance.opts, {
    ...source.opts,
    schemas: undefined,
    keywords: undefined,
    formats: undefined,
    cache: undefined,
    serialize: undefined,
    meta:
      typeof source.opts.meta === 'object'
        ? JSON.parse(JSON.stringify(source.opts.meta))
        : source.opts.meta,
    allErrors,
    validateSchema,
  });
  const omitted = new Set([
    'schemas',
    'keywords',
    'formats',
    'cache',
    'serialize',
  ]);
  const ledger = instanceIdRegistrationsOf(source);
  const identities = (ledger.identities ??= new WeakMap());
  const compiler: PrivateCompiler = {
    instance,
    source,
    identities,
    kind,
    allErrors,
    validateSchema,
    options: Object.entries(source.opts)
      .filter(([key]) => !omitted.has(key))
      .map(([key, value]): readonly [string, unknown] => [
        key,
        observeIdentity(identities, value),
      ]),
    optionCount: Object.keys(source.opts).length,
    entries: new Map(),
    rules: new Map(),
    formats: new Map(),
    imported: new Set(),
    claims: new Map(),
    copies: new WeakMap(),
    asynchronous: false,
    retired: false,
    count: 0,
  };
  installPrivateResolver(compiler);
  return compiler;
};
