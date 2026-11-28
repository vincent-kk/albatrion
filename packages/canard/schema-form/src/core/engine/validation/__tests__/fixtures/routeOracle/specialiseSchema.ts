import { isArray, isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';

import type { UnionSelection } from './readUnionSelection';
import type { RouteOracleDialect } from './routeOracleValidators';

/** Applicators evaluated against the same instance as the schema that holds them. */
const IN_PLACE_SINGLE = new Set(['not', 'if', 'then', 'else']);

/** Applicators that may apply one subschema to several instances; copied only when they hold no reference or union. */
const SHARED_ACROSS_INSTANCES = new Set([
  'additionalProperties',
  'patternProperties',
  'propertyNames',
  'contains',
  'unevaluatedProperties',
  'unevaluatedItems',
]);

/** Array keywords rebuilt as one position per array element. */
const ARRAY_KEYWORDS = new Set(['items', 'prefixItems', 'additionalItems']);

/**
 * Report whether a schema value holds no reference and no union at any depth.
 * @param schema - Schema value copied unchanged when this holds.
 * @returns True when the value can be shared by several instances unchanged.
 */
const isUnbound = (schema: unknown): boolean =>
  isArray(schema)
    ? schema.every(isUnbound)
    : !isPlainObject(schema) ||
      (!hasOwnProperty(schema, '$ref') &&
        !hasOwnProperty(schema, 'oneOf') &&
        !hasOwnProperty(schema, 'anyOf') &&
        Object.values(schema).every(isUnbound));

/**
 * Build the schema specialised to one value: every `$ref` points to its own copy of the
 * target for the instance it applies to, so recursion ends where the value ends, and every
 * union whose host has a committed branch keeps that branch alone. A host without a single
 * committed branch keeps the whole union. Reference siblings, keyword names and the union
 * keyword itself stay, so the validator reports the same keywords at the same instances.
 * @param root - Authored root schema; only same-document `#` references are supported.
 * @param value - Emitted value the form validates.
 * @param select - Committed branch per occurrence and authored branch array.
 * @param dialect - Tuple keyword family of the validator that will compile the result.
 * @returns A new root schema that shares no subschema with `root`.
 * @throws Error for a remote reference, a nested `$id`, an in-place reference cycle, or a
 * reference or union under an applicator that is shared by several instances.
 */
export const specialiseSchema = (
  root: unknown,
  value: unknown,
  select: UnionSelection,
  dialect: RouteOracleDialect,
): BlueprintSchema => {
  const definitions: Dictionary<unknown> = {};
  let count = 0;
  const entered = new Map<object, Set<string>>();
  const resolve = (reference: unknown): unknown => {
    if (typeof reference !== 'string' || !reference.startsWith('#'))
      throw new Error(`Unsupported reference ${String(reference)}`);
    let target = root;
    for (const segment of reference.slice(2).split('/').filter(Boolean)) {
      const key = decodeURIComponent(segment)
        .replace(/~1/g, '/')
        .replace(/~0/g, '~');
      target =
        isPlainObject(target) || isArray(target)
          ? Reflect.get(target, key)
          : undefined;
    }
    return target;
  };
  const visit = (
    schema: unknown,
    data: unknown,
    path: string,
  ): BlueprintSchema => {
    if (typeof schema === 'boolean') return schema;
    if (!isPlainObject(schema)) throw new Error(`No schema at ${path}`);
    const paths = entered.get(schema) ?? new Set<string>();
    if (paths.has(path)) throw new Error(`In-place reference cycle at ${path}`);
    entered.set(schema, paths.add(path));
    try {
      const out: Dictionary<unknown> = {};
      for (const [key, sub] of Object.entries(schema)) {
        if (key === '$defs' || key === 'definitions' || ARRAY_KEYWORDS.has(key))
          continue;
        if (key === '$id' && schema !== root)
          throw new Error(`Nested $id at ${path}`);
        if (key === '$ref') {
          const name = `instance${count++}`;
          definitions[name] = visit(resolve(sub), data, path);
          out.$ref = `#/$defs/${name}`;
        } else if (IN_PLACE_SINGLE.has(key)) out[key] = visit(sub, data, path);
        else if (key === 'allOf' && isArray(sub))
          out[key] = sub.map((entry) => visit(entry, data, path));
        else if ((key === 'oneOf' || key === 'anyOf') && isArray(sub)) {
          const index = select(path, sub);
          out[key] =
            index === undefined
              ? sub.map((entry) => visit(entry, data, path))
              : [visit(sub[index], data, path)];
        } else if (
          (key === 'dependentSchemas' || key === 'dependencies') &&
          isPlainObject(sub)
        ) {
          const map: Dictionary<unknown> = {};
          for (const [name, entry] of Object.entries(sub))
            map[name] = isArray(entry) ? entry : visit(entry, data, path);
          out[key] = map;
        } else if (key === 'properties' && isPlainObject(sub)) {
          const map: Dictionary<unknown> = {};
          for (const [name, entry] of Object.entries(sub))
            map[name] =
              isPlainObject(data) && hasOwnProperty(data, name)
                ? visit(
                    entry,
                    data[name],
                    `${path}/${name.replace(/~/g, '~0').replace(/\//g, '~1')}`,
                  )
                : true;
          out[key] = map;
        } else if (SHARED_ACROSS_INSTANCES.has(key)) {
          if (!isUnbound(sub))
            throw new Error(`Reference or union under ${key} at ${path}`);
          out[key] = sub;
        } else out[key] = sub;
      }
      if (isArray(data)) {
        const isTuple = dialect === '2020-12' || isArray(schema.items);
        const tupleKey = dialect === '2020-12' ? 'prefixItems' : 'items';
        const restKey =
          isTuple && dialect === 'draft-07' ? 'additionalItems' : 'items';
        const tuple = isTuple ? schema[tupleKey] : undefined;
        const prefix: readonly unknown[] = isArray(tuple) ? tuple : [];
        const rest = schema[restKey];
        const isRestShared = rest === undefined || typeof rest === 'boolean';
        const length = isRestShared
          ? Math.min(prefix.length, data.length)
          : data.length;
        const positions: unknown[] = [];
        for (let index = 0; index < length; index++)
          positions.push(
            visit(
              index < prefix.length ? prefix[index] : rest,
              data[index],
              `${path}/${index}`,
            ),
          );
        if (positions.length) out[tupleKey] = positions;
        if (isRestShared && rest !== undefined) out[restKey] = rest;
      }
      return out;
    } finally {
      paths.delete(path);
    }
  };
  const specialised = visit(root, value, '');
  if (typeof specialised === 'boolean' || !count) return specialised;
  return { ...specialised, $defs: definitions };
};
