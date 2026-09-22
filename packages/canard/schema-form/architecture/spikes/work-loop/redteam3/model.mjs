/**
 * Independent model of round-3-spec.md §A (work loop v3) and §C (write kinds).
 * Built from the spec text only; proto/loop.mjs was not copied.
 *
 * Node: { kind:'leaf'|'object'|'array', key, schema, parent, raw, local, emit,
 *         active:Set<fragment>, children:Map, fragments:[], injectTo? }
 * Fragment: { id, order, guard(L):boolean, declares:[key], forbids:[key],
 *             uncond:boolean }
 * Guards are compiled by ajv 8 (2020) from the `if` schema — nothing is
 * interpreted by the model itself (ADR 0004).
 */
import { createRequire } from 'node:module';

const require = createRequire(
  '/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-ajv8-plugin/package.json',
);
const Ajv2020 = require('ajv/dist/2020').default ?? require('ajv/dist/2020');
export const ajv = new Ajv2020({ allErrors: true, strict: false });

/** Sentinel for "raw is absent" (C1: 없음) — distinct from `undefined` written by a user. */
export const NONE = Symbol('none');

export const counters = { guards: 0, rounds: 0, computes: 0, deriveRounds: 0 };
export const resetCounters = () => Object.keys(counters).forEach((k) => (counters[k] = 0));

/** Model options. All default to the spec's stated choice. */
export const options = {
  monotone: true, // A3 step 4 option A
  reevalOn: true, // step 4: "이미 켜진 조각의 가드도 다시 평가한다"
  reevalOnlyOn: false, // A3-2 literal: "각 바퀴는 켜진 조각의 가드만 다시 돈다"
  firstActive: 'settle', // 'settle' | 'lifetime' — what "이번에 처음 활성" means
  nullKeepsChildren: true, // A6 (true) vs C1 full replace (false)
  omitEmpty: true,
  deriveCap: 25,
  log: null,
};

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const has = (v) => v !== NONE && v !== undefined;

let FID = 0;
/** Build a node tree from a JSON-schema subset (properties, allOf, if/then/else, oneOf/anyOf with const discriminators, default, x:false, not:{required:[x]}). */
export function build(schema, key = '', parent = null) {
  const node = { key, schema, parent, raw: NONE, dirty: true, local: undefined, emit: undefined, active: new Set(), children: new Map(), fragments: [], everActive: new Set(), injectTo: schema.injectTo };
  if (schema.type === 'array' && schema.items) {
    node.kind = 'array';
    return node;
  }
  if (schema.type !== 'object' && !schema.properties && !schema.allOf && !schema.oneOf && !schema.anyOf) {
    node.kind = 'leaf';
    return node;
  }
  node.kind = 'object';
  collectFragments(node, schema, [], 1);
  node.fragments.sort((a, b) => cmp(a.order, b.order));
  return node;
}

const RANK = { properties: 0, allOf: 1, if: 2, union: 3 };
const cmp = (a, b) => { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

function declare(node, key, sub) {
  if (!node.children.has(key)) node.children.set(key, build(sub, key, node));
  else node.children.get(key).overlays = [...(node.children.get(key).overlays ?? []), sub];
}

function fragmentFrom(node, sub, order, guard, uncond, tag) {
  const f = { id: `${tag}#${FID++}`, order, guard, uncond, declares: [], declared: {}, forbids: [], tag };
  for (const [k, s] of Object.entries(sub.properties ?? {})) {
    if (s === false) f.forbids.push(k);
    else { f.declares.push(k); f.declared[k] = s; declare(node, k, s); }
  }
  if (sub.not && Array.isArray(sub.not.required) && sub.not.required.length === 1) f.forbids.push(sub.not.required[0]);
  node.fragments.push(f);
  // nested conditionals inside a fragment body: the spec's tuple order carries no gating by the enclosing fragment
  if (!uncond && (sub.allOf || sub.if)) collectNested(node, sub, [tag], order[2] + 1);
  return f;
}

const compileGuard = (s) => { const v = ajv.compile(s); return (L) => { counters.guards++; return v(L); }; };

function collectFragments(node, s, path, depth) {
  fragmentFrom(node, { properties: s.properties ?? {}, not: s.not }, [RANK.properties, 0, depth], () => true, true, `${path.join('/')}/properties`);
  (s.allOf ?? []).forEach((item, i) => {
    if (item.if) {
      if (item.then) fragmentFrom(node, item.then, [RANK.allOf, i, depth], compileGuard(item.if), false, `allOf[${i}].then`);
      if (item.else) fragmentFrom(node, item.else, [RANK.allOf, i, depth], compileGuard({ not: item.if }), false, `allOf[${i}].else`);
    } else {
      fragmentFrom(node, item, [RANK.allOf, i, depth], () => true, true, `allOf[${i}]`);
      // nested fragments inside an unconditional allOf item (S13 order question)
      if (item.allOf || item.if) collectNested(node, item, [...path, `allOf[${i}]`], depth + 1);
    }
  });
  if (s.if) {
    if (s.then) fragmentFrom(node, s.then, [RANK.if, 0, depth], compileGuard(s.if), false, 'then');
    if (s.else) fragmentFrom(node, s.else, [RANK.if, 0, depth], compileGuard({ not: s.if }), false, 'else');
  }
  for (const kw of ['oneOf', 'anyOf']) {
    if (!s[kw]) continue;
    const disc = discriminator(s[kw]);
    if (!disc) { node.select = s[kw]; continue; }
    // A5: k is an unconditional child of the union host
    const enumVals = s[kw].map((b) => b.properties[disc].const);
    fragmentFrom(node, { properties: { [disc]: { ...(s.disc ?? {}), enum: enumVals } } }, [RANK.union, -1, depth], () => true, true, `${kw}.discriminator`);
    s[kw].forEach((b, i) => {
      const rest = { ...b, properties: { ...b.properties } };
      delete rest.properties[disc];
      fragmentFrom(node, rest, [RANK.union, i, depth], compileGuard({ required: [disc], properties: { [disc]: { const: b.properties[disc].const } } }), false, `${kw}[${i}]`);
    });
  }
}
function collectNested(node, s, path, depth) {
  (s.allOf ?? []).forEach((item, i) => {
    if (item.if && item.then) fragmentFrom(node, item.then, [RANK.allOf, i, depth], compileGuard(item.if), false, `${path.join('/')}/allOf[${i}].then`);
  });
  if (s.if && s.then) fragmentFrom(node, s.then, [RANK.if, 0, depth], compileGuard(s.if), false, `${path.join('/')}/then`);
}
/** B step 3–4 (minimal): a key present in every branch with a const, values pairwise distinct. */
function discriminator(branches) {
  const first = branches[0]?.properties ?? {};
  for (const k of Object.keys(first)) {
    if (!branches.every((b) => b.properties?.[k]?.const !== undefined)) continue;
    const vals = branches.map((b) => b.properties[k].const);
    if (new Set(vals).size === vals.length) return k;
  }
  return null;
}

// ---------------------------------------------------------------- writes (C1–C3)

/** C1 full replace: raw of the target — active, inactive, extra — becomes V. Children absent from V become NONE. */
export function setValue(node, V) {
  markDirty(node); markAll(node);
  if (node.kind === 'leaf') { node.raw = V; return; }
  if (node.kind === 'array') {
    if (!Array.isArray(V)) { node.raw = V; node.children.clear(); return; }
    node.raw = NONE; node.children.clear();
    V.forEach((v, i) => { const c = build(node.schema.items, i, node); node.children.set(i, c); setValue(c, v); });
    return;
  }
  if (V === null) {
    node.raw = null;
    if (!options.nullKeepsChildren) for (const c of node.children.values()) clear(c);
    return;
  }
  if (!isObj(V)) { node.raw = V; for (const c of node.children.values()) clear(c); return; }
  const extras = {};
  for (const [k, v] of Object.entries(V)) if (!node.children.has(k)) extras[k] = v;
  node.raw = Object.keys(extras).length ? extras : NONE; // C2: extras live in the host raw
  for (const [k, c] of node.children) (k in V ? setValue(c, V[k]) : clear(c));
}
function clear(node) { node.raw = NONE; node.dirty = true; for (const c of node.children.values()) clear(c); }
function markAll(node) { node.dirty = true; for (const c of node.children.values()) markAll(c); }

/** Partial write: only the target changes. Walks up clearing non-object host raws (C3). */
export function write(node, V) {
  if (node.kind === 'leaf') node.raw = V; else setValue(node, V);
  markDirty(node);
  for (let p = node.parent; p; p = p.parent) if (p.kind === 'object' && p.raw !== NONE && !isObj(p.raw)) p.raw = NONE;
}
function markDirty(node) { for (let n = node; n; n = n.parent) n.dirty = true; }

// ---------------------------------------------------------------- compute (A3)

export function compute(node) {
  if (!node.dirty) return;
  node.dirty = false;
  counters.computes++;
  if (node.kind === 'leaf') { node.local = node.emit = has(node.raw) ? node.raw : undefined; return; }
  if (node.kind === 'array') {
    if (node.raw !== NONE && !Array.isArray(node.raw)) { node.local = undefined; node.emit = node.raw; return; }
    const local = []; for (const [i, c] of node.children) { compute(c); local[i] = c.emit; }
    node.local = local;
    let end = local.length; while (end > 0 && (local[end - 1] === undefined || local[end - 1] === null)) end--; // omitTrailing
    node.emit = local.slice(0, end);
    return;
  }
  // C3: wrong kind of value
  if (node.raw !== NONE && node.raw !== null && !isObj(node.raw)) { node.active = new Set(); node.local = undefined; node.emit = node.raw; return; }
  const isNull = node.raw === null;
  const A = new Set();
  const activatedThisSettle = new Set();
  const turnOn = (f) => {
    A.add(f);
    for (const k of f.declares) {
      const c = node.children.get(k);
      const first = options.firstActive === 'settle' ? !activatedThisSettle.has(k) : !node.everActive.has(k);
      activatedThisSettle.add(k); node.everActive.add(k);
      const d = f.declared[k].default;
      if (first && c.raw === NONE && d !== undefined) { c.raw = structuredClone(d); c.dirty = true; options.log?.(`default ${pathOf(c)} := ${JSON.stringify(d)} (by ${f.id})`); }
      compute(c); // "즉시 그 자식의 계산을 완료시켜 emit을 얻는다"
    }
  };
  for (const f of node.fragments) if (f.uncond) turnOn(f);
  const L = () => (isNull ? {} : compose(node, A));
  let changed = true, rounds = 0;
  const cap = node.fragments.length + 1;
  while (changed && rounds < cap) {
    changed = false; rounds++; counters.rounds++;
    for (const f of node.fragments) {
      if (f.uncond) continue;
      if (A.has(f)) {
        if (options.reevalOn) { const r = f.guard(L()); if (!r && !options.monotone) { A.delete(f); changed = true; } }
        continue;
      }
      if (rounds > 1 && options.reevalOnlyOn) continue;
      if (f.guard(L())) { turnOn(f); changed = true; }
    }
  }
  node.rounds = rounds;
  node.active = A;
  for (const c of node.children.values()) if (!activeKeys(node, A).has(c.key)) compute(c); // inactive children still hold local (for node.value)
  node.local = isNull ? null : compose(node, A);
  node.emit = isNull ? null : project(node, node.local, A);
}
const activeKeys = (node, A) => { const s = new Set(); for (const f of A) for (const k of f.declares) s.add(k); return s; };
/** L := compose(A): active children's emit, keyed; extras from host raw; forbidden keys stay (A3-5). */
function compose(node, A) {
  const out = {};
  for (const k of activeKeys(node, A)) { const e = node.children.get(k).emit; if (e !== undefined) out[k] = e; }
  if (isObj(node.raw)) for (const [k, v] of Object.entries(node.raw)) if (!(k in out)) out[k] = v;
  return out;
}
function project(node, local, A) {
  const forb = new Set(); for (const f of A) for (const k of f.forbids) forb.add(k);
  const out = {};
  for (const [k, v] of Object.entries(local)) {
    if (forb.has(k)) continue;
    if (options.omitEmpty && (v === '' || (isObj(v) && Object.keys(v).length === 0))) continue;
    out[k] = v;
  }
  return out;
}

// ---------------------------------------------------------------- settle = compute + derive (A4)

export function settle(root) {
  compute(root);
  let round = 0;
  for (;;) {
    let wrote = false;
    walk(root, (n) => {
      if (!n.injectTo || !isActive(n)) return;
      for (const [path, fn] of Object.entries(n.injectTo)) {
        const target = find(root, path);
        const next = fn(n.emit, root.emit);
        if (!Object.is(target.raw, next)) { options.log?.(`injectTo ${pathOf(n)} -> ${path} := ${JSON.stringify(next)} (round ${round})`); write(target, next); wrote = true; }
      }
    });
    if (!wrote) return { rounds: round, capped: false };
    round++; counters.deriveRounds++;
    if (round > options.deriveCap) return { rounds: round, capped: true }; // "값은 받아들이고 마지막 라운드의 트리로 고정"
    compute(root);
  }
}
function isActive(n) { for (let c = n; c.parent; c = c.parent) { if (c.parent.kind === 'object' && !activeKeys(c.parent, c.parent.active).has(c.key)) return false; } return true; }
function walk(n, fn) { fn(n); for (const c of n.children.values()) walk(c, fn); }
export function find(root, path) { let n = root; for (const seg of path.split('/').filter(Boolean)) n = n.children.get(/^\d+$/.test(seg) ? Number(seg) : seg); return n; }
export const pathOf = (n) => (n.parent ? `${pathOf(n.parent)}/${n.key}` : '');
export const activeTags = (n) => [...n.active].filter((f) => !f.uncond).map((f) => f.tag);
export const rawTree = (n) => (n.kind === 'leaf' ? (n.raw === NONE ? '∅' : n.raw) : Object.fromEntries([...n.children].map(([k, c]) => [k, rawTree(c)])));
/** Validate an emitted value against the authored schema, as the validator plugin would. */
export function validate(schema, value) { const v = ajv.compile(schema); const ok = v(value); return { ok, errors: ok ? [] : v.errors.map((e) => `${e.instancePath || '/'} ${e.message}`) }; }
