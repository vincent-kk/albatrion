/**
 * Independent model of round-4-spec.md §A (work loop 3.1). Built from the spec
 * text only; proto/loop-v3.mjs and redteam3/model.mjs were not copied.
 *
 * State (A1): leaf `raw`; host `raw` only when a non-object arrived; host
 * `selection`; host `extras`. Everything else is computed per settle (A3).
 * Guards are compiled by ajv 8 (2020) from the `if` schema — the model itself
 * interprets nothing but `properties`/`default` (P1).
 */
import { createRequire } from 'node:module';

const require = createRequire(
  '/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-ajv8-plugin/package.json',
);
const Ajv2020 = require('ajv/dist/2020').default ?? require('ajv/dist/2020');
export const ajv = new Ajv2020({ allErrors: true, strict: false });

/** "없음" (A2) — distinct from every JSON value. */
export const NONE = Symbol('none');

export const counters = { guards: 0, sweeps: 0, computes: 0, rounds: 0 };
export const resetCounters = () => Object.keys(counters).forEach((k) => (counters[k] = 0));

/** Model options; each default is the spec's stated choice, or the reading noted in the report. */
export const options = {
  omitEmpty: true,
  deriveCap: 25, // A3 파생·전이 shared round budget
  gaussSeidel: true, // A4-3 "현재 A" — A updated within a sweep (false = sweep-start snapshot)
  childRecompute: 'per-toggle', // A4-6 — 'per-toggle' | 'per-sweep'
  disableDefaultInjection: false, // A2 Form flag
  extrasSurviveNonObject: false, // A5/A2 미정의 — does `setValue(17)` clear extras?
  refreshEq: (a, b) => a === b, // A6 "다르다" — equality is unspecified
  capAdjust: 0, // A4-4 "조각 수" — 0 counts the unconditional fragment, -1 does not
  log: null,
};

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const cmpOrder = (a, b) => { const n = Math.max(a.length, b.length); for (let i = 0; i < n; i++) { const x = a[i] ?? -1, y = b[i] ?? -1; if (x !== y) return x - y; } return 0; };
let FID = 0;

// ---------------------------------------------------------------- build (A4-2, A4-6, A7)

/** Build a node tree. Fragments form a tree; `enclosing` gates traversal (A4-2). */
export function build(schema, key = '', parent = null, defaultValue) {
  const node = { key, schema, parent, kind: 'leaf', raw: NONE, defaultValue, children: new Map(), fragments: [], overlays: new Map(), inherited: new Set(), active: new Set(), committedActive: new Set(), extras: {}, selection: undefined, local: undefined, emit: undefined, settle: { status: 'stable', sweeps: 0 }, dirty: true, injectTo: schema.injectTo };
  if (schema.type === 'object' || schema.properties || schema.allOf || schema.oneOf || schema.anyOf || schema.if) {
    node.kind = 'object';
    addFragment(node, schema, null, [0], 'root', null);
    node.fragments.sort((a, b) => cmpOrder(a.order, b.order));
  }
  return node;
}

/** One fragment: guard (null = unconditional), declared keys, nested fragments, lifted grandchild declarations. */
function addFragment(host, body, guard, order, tag, enclosing) {
  const f = { id: FID++, tag, order, guard, enclosing, declares: new Map(), overlays: new Map(), selectionIndex: undefined };
  host.fragments.push(f);
  for (const [k, sub] of Object.entries(body.properties ?? {})) {
    if (sub === false) continue; // A4-5: declares nothing
    const existing = host.children.get(k);
    if (existing && guard && existing.kind === 'object' && sub.properties) { f.overlays.set(k, sub.properties); continue; } // A4-6 lifted → inherited overlay
    if (!existing) host.children.set(k, build(sub, k, host));
    f.declares.set(k, sub);
  }
  (body.allOf ?? []).forEach((item, i) => {
    if (item.if) { conditional(host, item, [...order, 1, i], `${tag}/allOf[${i}]`, f); return; }
    addFragment(host, item, null, [...order, 1, i], `${tag}/allOf[${i}]`, f);
  });
  if (body.if) conditional(host, body, [...order, 2, 0], `${tag}`, f);
  for (const kw of ['oneOf', 'anyOf']) if (body[kw]) union(host, body, kw, [...order, 3], `${tag}/${kw}`, f);
  return f;
}
const compileGuard = (s) => { const v = ajv.compile(s); return (G) => { counters.guards++; return v(G); }; };
function conditional(host, s, order, tag, enclosing) {
  if (s.then) addFragment(host, s.then, compileGuard(s.if), [...order, 0], `${tag}.then`, enclosing);
  if (s.else) addFragment(host, s.else, compileGuard({ not: s.if }), [...order, 1], `${tag}.else`, enclosing);
}
/** A7: discriminator k owned by the host (enum = union of branch consts, default = explicit or first branch); else selection-gated. */
function union(host, s, kw, order, tag, enclosing) {
  const branches = s[kw];
  const k = Object.keys(branches[0].properties ?? {}).find((c) => branches.every((b) => b.properties?.[c]?.const !== undefined));
  if (k) {
    const values = branches.map((b) => b.properties[k].const);
    const kSchema = { ...(s.properties?.[k] ?? {}), enum: values, default: s.properties?.[k]?.default ?? values[0] };
    const owner = addFragment(host, { properties: { [k]: kSchema } }, null, [...order, -1], `${tag}.k`, enclosing);
    host.children.get(k).schema = kSchema; owner.declares.set(k, kSchema);
    branches.forEach((b, i) => { const rest = { ...b, properties: { ...b.properties } }; delete rest.properties[k];
      addFragment(host, rest, compileGuard({ required: [k], properties: { [k]: { const: values[i] } } }), [...order, i], `${tag}[${i}]`, enclosing); });
    return;
  }
  host.selectable = branches;
  branches.forEach((b, i) => { const f = addFragment(host, b, (G, h) => { counters.guards++; return h.selection === i; }, [...order, i], `${tag}[${i}]`, enclosing); f.selectionIndex = i; });
}
/** A7 initial selection: passing branch declaring the most value keys; ties → first. */
export function initialSelection(host, V) {
  if (!host.selectable) return undefined;
  let best = 0, bestN = -1;
  host.selectable.forEach((b, i) => { const n = Object.keys(b.properties ?? {}).length; if (ajv.validate({ ...b, allOf: undefined, if: undefined }, isObj(V) ? V : {}) && n > bestN) { best = i; bestN = n; } });
  return best;
}

// ---------------------------------------------------------------- writes (A2) — "표시"

function markDirty(n) { for (let c = n; c; c = c.parent) c.dirty = true; }
const declaredAnywhere = (host, k) => host.fragments.some((f) => f.declares.has(k));
function clearSubtree(n) { n.raw = NONE; n.extras = {}; n.committedActive = new Set(); n.dirty = true; for (const c of n.children.values()) clearSubtree(c); }
/** Non-object ancestors become objects when a partial write lands below them (A5). */
function promote(n) { for (let h = n.parent; h; h = h.parent) if (h.kind === 'object' && h.raw !== NONE) { options.log?.(`promote ${pathOf(h)}: raw ${JSON.stringify(h.raw)} → object`); h.raw = NONE; } }

/** Leaf input / `setValue(V, Merge)` — partial write (A2 row 1). `undefined` → 없음. */
export function write(node, v) { setValue(node, v, 'Merge'); }
/** `setValue(V, Overwrite)` — full replace (A2 row 2): children not in V become 없음; null/17 too. */
export function setValue(node, V, kind = 'Overwrite') {
  markDirty(node); promote(node);
  const root = rootOf(node); if (kind === 'Overwrite') root.loadSettle = true;
  if (node.kind === 'leaf') { node.raw = V === undefined ? NONE : V; return; }
  if (!isObj(V)) { // null / 17 / undefined: keys absent → every child 없음
    if (kind === 'Merge' && V === undefined) return;
    const extras = node.extras; clearSubtree(node); node.raw = V === undefined ? NONE : V;
    if (options.extrasSurviveNonObject) node.extras = extras; return;
  }
  node.raw = NONE;
  if (kind === 'Overwrite') { for (const [k, c] of node.children) if (!(k in V)) clearSubtree(c); node.extras = {}; node.committedActive = new Set(); }
  for (const [k, v] of Object.entries(V)) {
    if (declaredAnywhere(node, k)) setValue(node.children.get(k), v, kind); // E16: any fragment, active or not
    else if (v === undefined) delete node.extras[k]; else node.extras[k] = v;
  }
}
/** Uncontrolled input reporting `v` (A6 bookkeeping). */
export function input(node, v) { node.reported = v; write(node, v); }
/** A8 `removeKey(path)` — partial write. */
export function removeKey(host, k) { markDirty(host); if (k in host.extras) delete host.extras[k]; else if (host.children.has(k)) setValue(host.children.get(k), undefined, 'Merge'); }
/** `reset()` — full replace with the node's defaultValue; selection returns to the initial one. */
export function reset(node) { setValue(node, node.defaultValue, 'Overwrite'); walk(node, (h) => { if (h.selectable) h.selection = initialSelection(h, h.defaultValue); }); }
const rootOf = (n) => (n.parent ? rootOf(n.parent) : n);
/** The host's raw as an object (children's raw + extras) — the initial-selection input. */
const rawView = (h) => { const o = { ...h.extras }; for (const [k, c] of h.children) if (c.raw !== NONE) o[k] = c.kind === 'leaf' ? c.raw : rawView(c); return o; };

// ---------------------------------------------------------------- compute (A3 계산, A4)

const declaredBy = (A) => { const s = new Map(); for (const f of A) for (const [k, sub] of f.declares) s.set(k, sub); return s; };
/** Traversal order: total order, nested fragments only while the enclosing one is in A (A4-2). */
const traversal = (host, A) => host.fragments.filter((f) => { for (let e = f.enclosing; e; e = e.enclosing) if (!A.has(e)) return false; return true; });

export function compute(node) {
  counters.computes++; node.dirty = false;
  if (node.kind === 'leaf') { node.local = node.emit = node.raw === NONE ? undefined : node.raw; return; }
  const nonObject = node.raw !== NONE;
  if (node.selectable && node.selection === undefined) node.selection = initialSelection(node, rawView(node));
  const A = new Set();
  for (const f of node.fragments) for (const [k] of f.overlays) { const c = node.children.get(k); const ov = c.overlays.get(f); if (ov && c.inherited.has(ov)) { c.inherited.delete(ov); c.dirty = true; } } // A4-1: the starting point carries no overlay
  for (const f of node.fragments) if (!f.guard && !f.enclosing && !f.inheritedFrom) A.add(f); // 무조건 조각 (root uncond, k owner)
  for (const f of node.inherited) A.add(f); // 조상에서 상속된 overlay
  let gCache; const G = () => (nonObject ? {} : (gCache ??= project(node, compose(node, A))));
  const cap = node.fragments.length + 1 + options.capAdjust;
  let sweeps = 0, changed = true, status = 'stable';
  const toggle = (f, on) => { if (on) A.add(f); else A.delete(f); changed = true; gCache = undefined; for (const [k] of f.overlays) setOverlay(node, node.children.get(k), f, on); };
  while (changed) {
    if (sweeps === cap) { status = 'budget-exceeded'; break; }
    changed = false; sweeps++; counters.sweeps++;
    const pending = [];
    const snapshot = options.gaussSeidel ? null : G();
    for (const f of traversal(node, A)) {
      if (!f.guard) { if (!f.inheritedFrom && !A.has(f)) toggle(f, true); continue; } // unconditional nested: on iff enclosing on
      const r = f.guard(snapshot ?? G(), node);
      if (r !== A.has(f)) { if (options.childRecompute === 'per-sweep') pending.push([f, r]); else toggle(f, r); }
    }
    for (const [f, r] of pending) toggle(f, r);
    for (const f of [...A]) if (f.enclosing && !A.has(f.enclosing)) toggle(f, false); // enclosing went off → nested off
  }
  node.active = A; node.settle = { status, sweeps };
  for (const c of node.children.values()) if (c.dirty) compute(c); // inactive children still hold local (node.value)
  node.local = nonObject ? node.raw : compose(node, A);
  node.emit = nonObject ? node.raw : project(node, node.local);
}
/** Inherited overlay: a synthetic unconditional fragment on the child, present iff the parent's fragment is on (A4-6). */
function setOverlay(parent, child, f, on) {
  let ov = child.overlays.get(f);
  if (!ov) { ov = addFragment(child, { properties: f.overlays.get(child.key) }, null, [0, 1, f.id], `inherited(${f.tag})`, null); ov.inheritedFrom = f; child.overlays.set(f, ov); child.fragments.sort((a, b) => cmpOrder(a.order, b.order)); }
  if (on) child.inherited.add(ov); else child.inherited.delete(ov);
  child.dirty = true; options.log?.(`overlay ${pathOf(child)} ${on ? '+' : '-'}${f.tag}`);
  if (options.childRecompute === 'per-toggle') compute(child);
}
/** local := compose(A) — active children's emit in schema declaration order, then extras in insertion order (A4-7). */
function compose(node, A) {
  const out = {}; const decl = declaredBy(A);
  for (const [k, c] of node.children) { if (!decl.has(k)) continue; if (c.dirty) compute(c); if (c.emit !== undefined) out[k] = c.emit; }
  for (const [k, v] of Object.entries(node.extras)) if (!(k in out)) out[k] = v;
  return out;
}
/** emit := project(local) — omitEmpty drops '' and {} (A4-3 투영). */
function project(node, local) {
  const out = {};
  for (const [k, v] of Object.entries(local)) { if (options.omitEmpty && (v === '' || (isObj(v) && Object.keys(v).length === 0))) continue; out[k] = v; }
  return out;
}

// ---------------------------------------------------------------- settle (A3): 계산 → 파생 → 전이 → 커밋

/** injectTo rules: `{ [sourcePath]: { [targetPath]: (sourceEmit, rootEmit) => value } }` on the root — full replace on the target (E7). */
export function settle(root, rules = root.injectTo ?? {}) {
  let round = 0, capped = false;
  const budget = () => { if (round + 1 > options.deriveCap) { capped = true; return false; } round++; counters.rounds++; return true; };
  for (;;) {
    compute(root);
    const writes = derive(root, rules);
    if (writes.length) { if (!budget()) break; for (const [t, v] of writes) { options.log?.(`injectTo ${pathOf(t)} := ${JSON.stringify(v)} (round ${round})`); setValue(t, v, 'Overwrite'); } continue; }
    const inj = transition(root);
    if (inj.length) { if (!budget()) break; for (const [c, v, f] of inj) { options.log?.(`default ${pathOf(c)} := ${JSON.stringify(v)} by ${f.tag} (round ${round})`); c.raw = structuredClone(v); markDirty(c); } continue; }
    break;
  }
  walk(root, (n) => { n.committedActive = new Set(n.active); n.committedRaw = n.raw; });
  root.loadSettle = false;
  root.settleRounds = { rounds: round, capped };
  return root.settleRounds;
}
function derive(root, rules) {
  const writes = [];
  for (const [src, targets] of Object.entries(rules)) { const s = find(root, src); if (!isActive(s)) continue;
    for (const [tp, fn] of Object.entries(targets)) { const t = find(root, tp); const v = fn(s.emit, root.emit); if (!Object.is(t.raw === NONE ? undefined : t.raw, v)) writes.push([t, v]); } }
  return writes;
}
/** 전이: fragments OFF (at the last commit) → ON (now); default into 없음 children; last declaration in total order wins. */
function transition(root) {
  const out = new Map();
  walk(root, (h) => {
    if (h.kind !== 'object') return;
    if (options.disableDefaultInjection && root.loadSettle) return;
    for (const f of [...h.active].sort((a, b) => cmpOrder(a.order, b.order))) {
      if (h.committedActive.has(f)) continue;
      for (const [k, sub] of f.declares) { const c = h.children.get(k); if (c.raw === NONE && sub.default !== undefined && !(c.kind === 'object' && c.children.size)) out.set(c, [c, sub.default, f]); }
    }
  });
  return [...out.values()];
}
function isActive(n) { for (let c = n; c.parent; c = c.parent) if (c.parent.kind === 'object' && !declaredBy(c.parent.active).has(c.key)) return false; return true; }

// ---------------------------------------------------------------- read-side (A6, A8) and helpers

/** A6: nodes whose committed raw differs from what their input last reported. */
export function refreshTargets(root) { const out = []; walk(root, (n) => { if ('reported' in n && !options.refreshEq(n.raw === NONE ? undefined : n.raw, n.reported)) out.push(pathOf(n)); }); return out; }
/** A8: keys of a host's emit that no active fragment declares and the validator rejected. */
export function residual(root, schema) {
  const { errors } = validate(schema, root.emit); const out = [];
  walk(root, (h) => { if (h.kind !== 'object' || !isObj(h.local)) return; const decl = declaredBy(h.active); const p = pathOf(h);
    for (const k of Object.keys(h.local)) { if (decl.has(k)) continue; const hit = errors.find((e) => e.instancePath === `${p}/${k}` || (e.instancePath === p && (e.params.additionalProperty === k || e.params.unevaluatedProperty === k)));
      if (hit) out.push({ path: `${p}/${k}`, value: h.local[k], error: hit.message, from: k in h.extras ? 'extras' : 'inactive-child' }); } });
  return out;
}
export function walk(n, fn) { fn(n); for (const c of n.children.values()) walk(c, fn); }
export function find(root, path) { let n = root; for (const seg of path.split('/').filter(Boolean)) n = n.children.get(seg); return n; }
export const pathOf = (n) => (n.parent ? `${pathOf(n.parent)}/${n.key}` : '');
export const activeTags = (n) => [...n.active].filter((f) => f.guard || f.inheritedFrom).map((f) => f.tag).sort();
export const rawTree = (n) => (n.kind === 'leaf' ? (n.raw === NONE ? '∅' : n.raw) : n.raw !== NONE ? n.raw : Object.fromEntries([...n.children].map(([k, c]) => [k, rawTree(c)])));
/** Validate an emitted value against the authored schema, as the validator plugin would. */
export function validate(schema, value) { const v = ajv.compile(schema); const ok = v(value); return { ok, errors: ok ? [] : v.errors.map((e) => ({ ...e, text: `${e.instancePath || '/'} ${e.message} ${e.schemaPath}` })) }; }
