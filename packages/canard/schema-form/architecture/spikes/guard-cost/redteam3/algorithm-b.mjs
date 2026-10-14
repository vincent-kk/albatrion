/**
 * Literal implementation of round-3-spec.md §B (판별식 식별 알고리즘).
 * Every place where the spec leaves a choice open is an option with the spec's most literal reading as default:
 *  - `resolveAllOfItemRefs` (§B.1): the spec resolves the *branch's* `$ref` and flattens the branch's top-level
 *    `allOf` one level; it does not say the `$ref`s *inside* `allOf` items are resolved. Default: not resolved.
 *  - `sameKey` (§B.1 "같은 키는 교차 — 두 선언이 모두 유효 스키마"): 'allOf' keeps both declarations as
 *    `{allOf:[a,b]}`; 'merge' shallow-merges keywords (rjsf style). Default: 'allOf'.
 *  - `multiEnum` (§B.3 "원소가 하나인 enum"): default false = only single-element enums are candidates.
 */

/** Resolve a local JSON pointer `#/a/b` against `root`. Returns undefined when it does not resolve. */
export function resolvePointer(root, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return undefined;
  return ref
    .slice(2)
    .split('/')
    .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce((node, seg) => (node == null ? undefined : node[seg]), root);
}

const derefBranch = (schema, root, seen = new Set()) => {
  let cur = schema;
  while (cur && typeof cur === 'object' && typeof cur.$ref === 'string') {
    if (seen.has(cur.$ref)) throw new Error(`B.1: $ref cycle at ${cur.$ref}`);
    seen.add(cur.$ref);
    const target = resolvePointer(root, cur.$ref);
    if (target === undefined) throw new Error(`B.1: unresolvable $ref ${cur.$ref}`);
    const { $ref, ...siblings } = cur;
    cur = { ...target, ...siblings };
  }
  return cur;
};

const intersectKey = (a, b, mode) => (mode === 'merge' ? { ...a, ...b } : { allOf: [a, b] });

/** §B.1 — resolve the branch `$ref`, flatten the top-level `allOf` one level. */
export function normalizeBranch(branch, root, { resolveAllOfItemRefs = false, sameKey = 'allOf' } = {}) {
  const b = derefBranch(branch, root);
  if (!Array.isArray(b.allOf)) return b;
  const { allOf, ...rest } = b;
  const properties = { ...(rest.properties ?? {}) };
  const required = new Set(rest.required ?? []);
  for (const rawItem of allOf) {
    const item = resolveAllOfItemRefs ? derefBranch(rawItem, root) : rawItem;
    for (const [k, v] of Object.entries(item.properties ?? {}))
      properties[k] = k in properties ? intersectKey(properties[k], v, sameKey) : v;
    for (const r of item.required ?? []) required.add(r);
    if (item.type !== undefined && rest.type === undefined) rest.type = item.type;
  }
  return { ...rest, properties, required: [...required] };
}

/** §B.2 — a branch that is only `{type:'null'}` (or `type: ['null']`). */
export const isNullBranch = (b) =>
  b.type === 'null' || (Array.isArray(b.type) && b.type.length === 1 && b.type[0] === 'null');

/** §B.3 — the tag values a property schema fixes, or null when it fixes none the spec recognises. */
export function tagValues(schema, { multiEnum = false } = {}) {
  if (!schema || typeof schema !== 'object') return null;
  if ('const' in schema) return [schema.const];
  if (Array.isArray(schema.enum) && (schema.enum.length === 1 || multiEnum)) return [...schema.enum];
  return null;
}

/**
 * Run §B on a union host. `union` is the schema object holding `oneOf`/`anyOf` (and maybe `discriminator`).
 * Output: `{kind:'discriminated', key, values, guards, nullable}` | `{kind:'select', nullable, reason}` |
 *         `{kind:'single', branch, nullable}` (§B.2 "남은 분기가 하나면 union이 아니다").
 */
export function identify(union, root, options = {}) {
  const raw = union.oneOf ?? union.anyOf;
  if (!Array.isArray(raw)) throw new Error('B: no oneOf/anyOf');
  const normalized = raw.map((b) => normalizeBranch(b, root, options));
  let nullable = false;
  const branches = normalized.filter((b) => (isNullBranch(b) ? ((nullable = true), false) : true));
  if (branches.length === 1) return { kind: 'single', branch: branches[0], nullable };

  let candidates;
  const propertyName = union.discriminator?.propertyName;
  if (propertyName !== undefined) candidates = [propertyName];
  else
    candidates = Object.keys(branches[0].properties ?? {}).filter((k) =>
      branches.every((b) => b.properties?.[k] !== undefined && tagValues(b.properties[k], options) !== null),
    );
  if (candidates.length === 0) return { kind: 'select', nullable, reason: 'no-candidate' };
  const key = candidates[0];

  const values = branches.map((b) => tagValues(b.properties?.[key], options) ?? []);
  for (let i = 0; i < values.length; i++)
    for (let j = i + 1; j < values.length; j++)
      if (values[i].some((v) => values[j].includes(v)))
        return { kind: 'select', nullable, reason: 'overlap', key, values, candidates };

  const mappingOnly = union.discriminator?.mapping !== undefined && values.every((v) => v.length === 0);
  const guards = values.map((v) => ({
    required: [key],
    properties: { [key]: v.length === 1 ? { const: v[0] } : { enum: v } },
  }));
  return { kind: 'discriminated', key, values, guards, nullable, candidates, unsupported: mappingOnly ? 'B.5 mapping-only' : undefined };
}
