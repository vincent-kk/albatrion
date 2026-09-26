/**
 * Slice 0 measurement: run the generator-produced schema corpus
 * (`../guard-cost/redteam3/corpus.mjs`, 14 schemas) through the round-9
 * prototype model (`../round9/proto/build-v5.mjs` + `loop-v5.mjs`, imported
 * read-only — this file never writes into round9/ or round10/).
 *
 * `build-v5.mjs` has no `$ref` support, so every schema is passed through
 * `wrapRef`: a lazy Proxy-based resolver applied to a plain deep clone of
 * the corpus schema. It resolves a `$ref` only when the model's own code
 * actually reads that property — the same laziness `build-v5.mjs` already
 * uses for array `items` (an `itemFactory` closure, invoked only for
 * indices the loaded value actually has). That is what lets
 * `pydanticRecursive` (`Node.children` → `items.anyOf` → `Node` again)
 * build a finite tree bounded by the sample's actual nesting, instead of
 * looping forever on the schema's self-reference.
 *
 * Three modes per schema, decided by `reviews/round-10-owner-answers.md`
 * row B-22 (`&discriminator` sugar adds `&active` per tagged branch; the
 * branch schema itself is not modified) and A-3 (`if`/`then`/`else` is the
 * JSON-only way to gate a branch):
 *   - pure          — schema as written: every oneOf/anyOf branch is
 *                      always on (no `if`, no `&active`).
 *   - discriminator — `&active: G => G[key] === value` added to each
 *                      branch with a `const`/`enum` on the common tag key.
 *   - if-rewrite    — each tagged branch replaced by
 *                      `{ if: {properties:{key:{const}}, required:[key]},
 *                         then: <branch>, else: false }`.
 */
import { writeFileSync } from 'node:fs';
import * as L from '../round9/proto/loop-v5.mjs';
import { buildSchema } from '../round9/proto/build-v5.mjs';
import { corpus } from '../guard-cost/redteam3/corpus.mjs';

// --------------------------------------------------------------- $ref reading

/** Navigate a `#/a/b/c` JSON pointer ref from `root`. */
function resolveRef(root, ref) {
  const segments = ref.replace(/^#\//, '').split('/').map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  let node = root;
  for (const segment of segments) node = node?.[segment];
  if (node === undefined) throw new Error(`Unresolved $ref ${ref}`);
  return node;
}

/**
 * Wrap a schema so every property read resolves `$ref` on demand instead of
 * eagerly. A `{$ref}` node becomes a `Proxy` whose getter re-wraps the
 * resolved target; a plain object becomes a real object with lazy getters;
 * arrays (branch lists) are copied eagerly — they hold finitely many
 * branches, never a cycle by themselves.
 */
function wrapRef(node, root) {
  if (node === null || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map((n) => wrapRef(n, root));
  if (typeof node.$ref === 'string') {
    const target = resolveRef(root, node.$ref);
    // A sibling key next to `$ref` (the `&active` sugar adds one) must still
    // be read from `node` itself — a plain `$ref` proxy would silently drop it.
    const own = { ...node };
    delete own.$ref;
    return new Proxy(
      {},
      {
        get: (_, prop) => (prop in own ? wrapRef(own[prop], root) : wrapRef(target[prop], root)),
        has: (_, prop) => prop in own || prop in target,
        ownKeys: () => [...new Set([...Reflect.ownKeys(own), ...Reflect.ownKeys(target)])],
        getOwnPropertyDescriptor: (_, prop) =>
          (prop in own ? Object.getOwnPropertyDescriptor(own, prop) : Object.getOwnPropertyDescriptor(target, prop)) ??
          { enumerable: true, configurable: true },
      },
    );
  }
  const out = {};
  for (const key of Object.keys(node)) {
    Object.defineProperty(out, key, { enumerable: true, configurable: true, get: () => wrapRef(node[key], root) });
  }
  return out;
}

/** Merge `$ref` + `allOf` into one plain `{properties, required, type}` view, for reading tag/type facts (never fed to `buildSchema`). */
function flattenBranch(branch, root, seen = new Set()) {
  if (branch && typeof branch === 'object' && typeof branch.$ref === 'string') {
    if (seen.has(branch.$ref)) return { properties: {}, required: [], type: undefined, cyclic: true };
    return flattenBranch(resolveRef(root, branch.$ref), root, new Set([...seen, branch.$ref]));
  }
  let properties = {};
  let required = [];
  let type = branch?.type;
  let cyclic = false;
  for (const part of branch?.allOf ?? []) {
    const flat = flattenBranch(part, root, seen);
    properties = { ...properties, ...flat.properties };
    required = [...new Set([...required, ...flat.required])];
    type = type ?? flat.type;
    cyclic ||= flat.cyclic;
  }
  properties = { ...properties, ...(branch?.properties ?? {}) };
  required = [...new Set([...required, ...(branch?.required ?? [])])];
  return { properties, required, type, cyclic };
}

/** JSON Schema-ish type of one property schema, for cross-branch kind comparison. */
function typeOf(prop) {
  if (!prop || typeof prop !== 'object') return 'unknown';
  if (Array.isArray(prop.type)) return [...prop.type].sort().join('|');
  if (prop.type) return prop.type;
  if (prop.const !== undefined) return typeof prop.const;
  if (Array.isArray(prop.enum) && prop.enum.length > 0) return typeof prop.enum[0];
  return 'unknown';
}

// --------------------------------------------------------- pointer -> branches

/** The array of oneOf/anyOf branch schemas a corpus `pointer` names. */
function branchesAtPointer(schema, pointer) {
  const segments = pointer.split('/').filter(Boolean);
  let node = schema;
  for (const segment of segments) node = node[segment];
  return node;
}

/** The node path (`root.find(...)`) of the host that owns the union at `pointer` — every oneOf/anyOf/allOf branch attaches its fragments to that same host, so path segments past the first union keyword never name a new node. */
function nodePathFor(pointer) {
  const segments = pointer.split('/').filter(Boolean);
  let i = 0;
  while (i < segments.length && !['oneOf', 'anyOf', 'allOf'].includes(segments[i])) i++;
  return '/' + segments.slice(0, i).filter((s) => s !== 'properties').join('/');
}

/** The host's direct fragments for the union at `pointer` (fragment id encodes the keyword/index path `build-v5.mjs` assigned), each paired with its index into `host.fragOn`. */
function targetFragments(host, pointer) {
  const segments = pointer.split('/').filter(Boolean);
  let i = 0;
  while (i < segments.length && !['oneOf', 'anyOf', 'allOf'].includes(segments[i])) i++;
  const keywordPath = segments.slice(i);
  const indexed = host.fragments.map((f, idx) => ({ f, idx }));
  if (keywordPath.length === 1) {
    const prefix = `base/${keywordPath[0]}/`;
    return indexed.filter(({ f }) => f.id.startsWith(prefix) && !f.id.slice(prefix.length).includes('/'));
  }
  const parentId = `base/${keywordPath.slice(0, -1).join('/')}`;
  const parentIdx = indexed.findIndex(({ f }) => f.id === parentId);
  return indexed.filter(({ f }) => f.parentIdx === parentIdx);
}

function treeSize(node) {
  let n = 1;
  for (const c of node.children ?? []) n += treeSize(c);
  return n;
}

/** A corpus sample is scoped to the union host (e.g. `pet`'s own value); nest it under `nodePath` to build the value `buildSchema` expects at the tree root. */
function nestValue(nodePath, value) {
  const segments = nodePath.split('/').filter(Boolean);
  return segments.reduceRight((acc, segment) => ({ [segment]: acc }), value);
}

// ------------------------------------------------------------- discriminator

/** The tag key every branch shares as a `const`/`enum`, preferring one whose values are pairwise distinct; `null` when no such key exists. */
function discriminatorCandidates(schema, pointer) {
  const branches = branchesAtPointer(schema, pointer);
  const flats = branches.map((b) => flattenBranch(b, schema));
  if (flats.some((f) => f.cyclic)) return { key: null, reason: '재귀 $ref로 분기 속성을 펼칠 수 없음' };
  const tagKeySets = flats.map(
    (f) => new Set(Object.keys(f.properties).filter((k) => f.properties[k]?.const !== undefined || Array.isArray(f.properties[k]?.enum))),
  );
  const common = [...tagKeySets[0]].filter((k) => tagKeySets.every((s) => s.has(k)));
  if (common.length === 0) return { key: null, reason: '분기 전체가 공유하는 const/enum 태그 키 없음' };
  const tagValues = (k) => flats.map((f) => (f.properties[k].const !== undefined ? [f.properties[k].const] : f.properties[k].enum));
  const distinguishing = common.filter((k) => {
    const all = tagValues(k).flat();
    return new Set(all).size === all.length;
  });
  const key = distinguishing[0] ?? common[0];
  return { key, reason: null, distinguishing: distinguishing.includes(key) };
}

/** A minimal value for a branch that has no aligned corpus sample: every const/first-enum tag it declares. */
function deriveMinimal(branch, schema) {
  const flat = flattenBranch(branch, schema);
  const value = {};
  for (const [k, prop] of Object.entries(flat.properties)) {
    if (prop?.const !== undefined) value[k] = prop.const;
    else if (Array.isArray(prop?.enum) && prop.enum.length > 0) value[k] = prop.enum[0];
  }
  return value;
}

/** Deep, JSON-safe clone (the corpus holds no functions). */
const cloneSchema = (schema) => structuredClone(schema);

/** Apply the `&discriminator` sugar (B-22) or the mechanical if-rewrite to a clone's branches at `pointer`; branches without a tag stay gate-less, exactly as the owner specified. Returns the clone. */
function applySugar(schema, pointer, key, mode) {
  const clone = cloneSchema(schema);
  const branches = branchesAtPointer(clone, pointer);
  for (let i = 0; i < branches.length; i++) {
    const branch = branches[i];
    const flat = flattenBranch(branch, clone);
    const prop = flat.properties[key];
    const tagged = prop && (prop.const !== undefined || Array.isArray(prop.enum));
    if (!tagged) continue;
    if (mode === 'discriminator') {
      if (prop.const !== undefined) {
        const v = prop.const;
        branch['&active'] = (G) => G[key] === v;
      } else {
        const values = prop.enum;
        branch['&active'] = (G) => values.includes(G[key]);
      }
    } else if (mode === 'if-rewrite') {
      const ifSchema =
        prop.const !== undefined
          ? { properties: { [key]: { const: prop.const } }, required: [key] }
          : { properties: { [key]: { enum: prop.enum } }, required: [key] };
      branches[i] = { if: ifSchema, then: branch, else: false };
    }
  }
  return clone;
}

// ------------------------------------------------------------------- driver

const rows = [];

function runSchema(entry) {
  const modeResults = {};
  for (const mode of ['pure', 'discriminator', 'if-rewrite']) {
    L.setSwitches({ ...L.NEW_SWITCHES });
    let discKey = null;
    let discReason = null;
    let distinguishing = null;
    let schemaForMode = entry.root;
    if (mode !== 'pure') {
      const cand = discriminatorCandidates(entry.root, entry.pointer);
      if (cand.key === null) {
        modeResults[mode] = { mode, applicable: false, reason: cand.reason };
        continue;
      }
      discKey = cand.key;
      distinguishing = cand.distinguishing;
      schemaForMode = applySugar(entry.root, entry.pointer, discKey, mode);
    }
    const wrapped = wrapRef(schemaForMode, schemaForMode);
    const nodePath = nodePathFor(entry.pointer);
    const branches = branchesAtPointer(schemaForMode, entry.pointer);
    const totalBranches = branches.length;
    const values = branches.map((b, i) => nestValue(nodePath, entry.samples[i] ?? deriveMinimal(b, schemaForMode)));
    const onCounts = [];
    let lastRoot = null;
    for (const value of values) {
      const root = buildSchema(wrapped, value);
      lastRoot = root;
      const host = root.find(nodePath);
      const frags = targetFragments(host, entry.pointer);
      onCounts.push(frags.filter(({ idx }) => host.fragOn[idx] === 1).length);
    }
    const nodeCount = treeSize(lastRoot);
    let conflict = null;
    if (mode === 'pure') {
      const flats = branches.map((b) => flattenBranch(b, entry.root));
      const byKey = new Map();
      for (const flat of flats) {
        for (const [k, prop] of Object.entries(flat.properties)) {
          if (!byKey.has(k)) byKey.set(k, new Set());
          byKey.get(k).add(typeOf(prop));
        }
      }
      const conflictKeys = [...byKey.entries()].filter(([, types]) => types.size > 1).map(([k]) => k);
      const redeclaredKeys = [...byKey.entries()].filter(([, types]) => types.size >= 1).map(([k]) => k)
        .filter((k) => flats.filter((f) => Object.hasOwn(f.properties, k)).length >= 2);
      conflict = { hasTypeConflict: conflictKeys.length > 0, conflictKeys, redeclaredKeys };
    }
    modeResults[mode] = { mode, applicable: true, discriminatorKey: discKey, distinguishing, totalBranches, onCounts, nodeCount, conflict };
  }
  const row = { schemaId: entry.id, dialect: entry.dialect, pointer: entry.pointer, ...modeResults };
  rows.push(row);
  return row;
}

for (const entry of corpus) runSchema(entry);

const outputLines = [
  'META ' + JSON.stringify({
    schema: 'round11-corpus-v1',
    corpus: '../guard-cost/redteam3/corpus.mjs',
    model: '../round9/proto/build-v5.mjs + loop-v5.mjs (read-only, byte-identical import)',
    refResolution: 'lazy Proxy wrapRef() over a structuredClone — resolves $ref only when build-v5.mjs actually reads the property',
    modes: ['pure', 'discriminator', 'if-rewrite'],
  }),
  ...rows.map((row) => 'ROW ' + JSON.stringify(row)),
];
writeFileSync(new URL('./corpus-output.txt', import.meta.url), outputLines.join('\n') + '\n');
console.log(JSON.stringify({ schemas: rows.length }));
