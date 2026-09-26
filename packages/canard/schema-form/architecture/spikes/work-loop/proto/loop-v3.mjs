/**
 * Prototype of the round-3 work loop (reviews/round-3-spec.md §A): mark ->
 * compute (ONE root-down recursion, dirty children completed first, host
 * fragments decided inside the host's compute from a fixed start) -> derive
 * (injectTo, round-capped) -> commit. No begin pass. No React, no validation,
 * no events.
 *
 * Node kinds: leaf | object | array.
 * A node with children holds `local` (pre-projection composition of its
 * active children's `emit`) and `emit` = project(local). A leaf's local is
 * its emit is its raw, minus omitEmpty ('' / undefined -> MISSING).
 * Absent keys are truly absent in committed `local`/`emit`; during a sweep a
 * key being reset is assigned `undefined` (AJV `required`/`properties` treat
 * that as absent) and deleted + re-normalized only if it stays absent.
 */

/** Sentinel for "this node emits nothing", so it is omitted by its parent. */
export const MISSING = Symbol('missing');

/** Maximum derive rounds (injectTo -> mark -> compute) per settle (A4). */
export const ROUND_CAP = 25;

/** Work counters, zeroed by {@link resetCounters}. */
export const counters = {
  visited: 0,
  guards: 0,
  reguards: 0,
  memos: 0,
  shares: 0,
  normalizes: 0,
  sweeps: 0,
  rounds: 0,
  settles: 0,
  injections: 0,
};

/** Zero every counter in {@link counters}. */
export function resetCounters() {
  for (const k of Object.keys(counters)) counters[k] = 0;
}

/** Facts about the most recent {@link flush}, for scenario assertions. */
export const lastSettle = {
  rounds: 0,
  sweeps: 0,
  budgetExceeded: false,
  maxSweepsOnOneHost: 0,
};

let SID = 0;

/**
 * Allocate a node with every field present, so V8 keeps one hidden class for
 * the whole tree.
 * @param {'leaf'|'object'|'array'} kind
 * @param {string|number} name key within the parent
 */
function makeNode(kind, name) {
  return {
    kind,
    name,
    parent: null,
    children: null,
    index: null,
    fragments: null,
    fragOn: null,
    nextFragOn: null,
    fragStamp: -1,
    activeKids: null,
    nextActiveKids: null,
    conditional: false,
    defaultValue: undefined,
    raw: undefined,
    pendingRaw: undefined,
    hasPending: false,
    local: MISSING,
    emit: MISSING,
    nextLocal: MISSING,
    nextEmit: MISSING,
    stamp: -1,
    active: true,
    nextActive: true,
    activeStamp: -1,
    dirty: false,
    dirtyKids: null,
    injections: null,
  };
}

/**
 * Create a leaf node.
 * @param {string|number} name key within the parent
 * @param {*} [defaultValue] injected when the leaf becomes active while its
 *   raw is absent (`undefined`)
 */
export function leaf(name, defaultValue) {
  const n = makeNode('leaf', name);
  n.defaultValue = defaultValue;
  return n;
}

/** Create an object node, with a name index over its children. */
export function object(name) {
  const n = makeNode('object', name);
  n.children = [];
  n.index = new Map();
  n.dirtyKids = [];
  n.fragments = [];
  n.fragOn = new Uint8Array(0);
  n.nextFragOn = new Uint8Array(0);
  n.activeKids = [];
  n.nextActiveKids = [];
  return n;
}

/** Create an array node. */
export function array(name) {
  const n = makeNode('array', name);
  n.children = [];
  n.dirtyKids = [];
  return n;
}

/**
 * Attach `child` to `parent`, registering it in the parent's name index when
 * the parent is an object.
 * @returns {object} the child
 */
export function attach(parent, child) {
  child.parent = parent;
  parent.children.push(child);
  if (parent.kind === 'object') parent.index.set(child.name, child);
  return child;
}

/**
 * Declare the conditional fragments of an object host, in total order (A3
 * step 2: keyword rank, then array index). Children named by no fragment are
 * unconditional (the implicit `properties` fragment) and form the fixed start.
 * @param {object} host object node
 * @param {Array<{guard: (local: object) => boolean, declares?: string[],
 *   prohibits?: string[], keys?: string[], rank?: number}>} fragments
 *   `guard` is evaluated on the host's local memo composed from the active
 *   set at that moment; `declares` names children that exist only while the
 *   fragment is on; `prohibits` names children excluded in projection only
 *   (A3 step 5); `keys` lists the top-level keys the guard reads so the
 *   inverted index can reuse the previous result when none of them changed
 *   and all of them are unconditional (root host only); `rank` orders
 *   fragments before their array index (default 0, stable).
 */
export function declareFragments(host, fragments) {
  const ordered = fragments
    .map((f, i) => ({ f, i }))
    .sort((a, b) => (a.f.rank ?? 0) - (b.f.rank ?? 0) || a.i - b.i)
    .map((x) => ({
      guard: x.f.guard,
      declares: x.f.declares ?? [],
      prohibits: x.f.prohibits ?? [],
      keys: x.f.keys ?? null,
      keysUnconditional: false,
    }));
  host.fragments = ordered;
  host.fragOn = new Uint8Array(ordered.length);
  host.nextFragOn = new Uint8Array(ordered.length);
  for (const f of ordered) {
    for (const name of f.declares) {
      const child = host.index.get(name);
      if (child === undefined) continue;
      child.conditional = true;
      child.active = false;
      child.nextActive = false;
    }
  }
  for (const f of ordered) {
    if (f.keys === null) continue;
    f.keysUnconditional = f.keys.every((k) => {
      const c = host.index.get(k);
      return c !== undefined && c.conditional === false;
    });
  }
}

/**
 * Declare derive-stage `injectTo` rules on the root (A4). After every
 * compute, each rule reads `from`'s emit and writes `map(emit)` into `to`
 * when it differs from `to`'s raw.
 * @param {object} root
 * @param {Array<{from: object, to: object, map: (emit: *) => *}>} rules
 */
export function declareInjections(root, rules) {
  root.injections = rules;
}

/** Stage `value` as `node`'s next raw and mark the path to the root dirty. */
function stage(node, value) {
  node.pendingRaw = value;
  node.hasPending = true;
  let n = node;
  while (n.dirty === false) {
    n.dirty = true;
    const p = n.parent;
    if (p === null) break;
    p.dirtyKids.push(n);
    n = p;
  }
}

/**
 * Partial write (C1 "부분 쓰기"): stage `value` as the node's raw. A host
 * above the node whose raw holds a non-object (null / wrong kind) is emptied
 * so its children live again (C3). Nothing is recomputed until {@link flush}.
 */
export function write(node, value) {
  stage(node, value);
  for (let p = node.parent; p !== null; p = p.parent) {
    if (rawOf(p) !== undefined) stage(p, undefined);
  }
}

/**
 * Full replacement (C1 `setValue(V)`): a host receives an object by
 * distributing it to its children — a child absent from V loses its raw
 * (becomes absent, not default). A host receiving null or a non-object holds
 * it as its own raw and its children are left untouched (A6 / C3). Extra
 * keys V declares that no child owns are dropped by this prototype.
 */
export function setValue(node, value) {
  if (node.kind === 'leaf') {
    stage(node, value);
    return;
  }
  if (value === null || typeof value !== 'object') {
    stage(node, value);
    return;
  }
  if (rawOf(node) !== undefined || node.dirty === false) stage(node, undefined);
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    setValue(child, value[child.name]);
  }
}

const rawOf = (n) => (n.hasPending ? n.pendingRaw : n.raw);
const emitOf = (n, sid) => (n.stamp === sid ? n.nextEmit : n.emit);
const localOf = (n, sid) => (n.stamp === sid ? n.nextLocal : n.local);
const activeOf = (n, sid) => (n.activeStamp === sid ? n.nextActive : n.active);
const activeKidsOf = (n, sid) =>
  n.fragStamp === sid ? n.nextActiveKids : n.activeKids;

let useIndex = false;
let changedKeys = null;
const EMPTY_LOCAL = Object.freeze({});

/**
 * Shallow-copy a fast-mode memo. This site must see fast-mode sources only:
 * routing the dictionary-mode normalize spread (after `delete`) through the
 * same site, or writing `{ ...prev }` inline in computeObject, measured ~85 us
 * per copy of an 800-key object in the flip loop instead of ~1 us.
 */
function cloneFast(o) {
  return { ...o };
}

/** Publish a node's computed local/emit for this settle. */
function publish(node, sid, local, emit) {
  node.nextLocal = local;
  node.nextEmit = emit;
  node.stamp = sid;
}

/** compute: one node, its dirty children first (A2). */
function compute(node, sid) {
  counters.visited++;
  if (node.kind === 'leaf') {
    const r = rawOf(node);
    const e = r === '' || r === undefined ? MISSING : r;
    publish(node, sid, e, e);
    return;
  }
  const kids = node.dirtyKids;
  for (let i = 0; i < kids.length; i++) compute(kids[i], sid);
  if (node.kind === 'array') computeArray(node, sid);
  else computeObject(node, sid);
}

/** Compose an array local from its children; emit is the local (no projection here). */
function computeArray(node, sid) {
  const prev = localOf(node, sid);
  const kids = node.dirtyKids;
  let next;
  counters.memos++;
  if (prev === MISSING || kids.length * 2 > node.children.length) {
    const children = node.children;
    next = new Array(children.length);
    for (let i = 0; i < children.length; i++) {
      const m = emitOf(children[i], sid);
      next[i] = m === MISSING ? undefined : m;
    }
    if (prev !== MISSING && sameArray(prev, next)) next = prev;
  } else {
    counters.shares++;
    next = prev.slice();
    let moved = false;
    for (let i = 0; i < kids.length; i++) {
      const child = kids[i];
      const m = emitOf(child, sid);
      const v = m === MISSING ? undefined : m;
      if (next[child.name] !== v) {
        next[child.name] = v;
        moved = true;
      }
    }
    if (moved === false) next = prev;
  }
  publish(node, sid, next, next);
}

function sameArray(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/**
 * Host compute (A3): fixed start = unconditional children; sweep fragments in
 * total order against the local memo composed so far; monotone (option A);
 * repeat while the active set grew, capped at fragments + 1; then project.
 * A null host sweeps against `{}` and emits null (A6); a host holding a
 * non-object non-null raw skips the sweep and emits that raw (C3). In both
 * cases the composed local is kept so a later recovery has a patch base.
 */
function computeObject(node, sid) {
  const raw = rawOf(node);
  const wrongKind = raw !== undefined && raw !== null && typeof raw !== 'object';
  const isNull = raw === null;
  const fragments = node.fragments;
  const nFrag = fragments.length;
  const on = node.nextFragOn;
  on.fill(0);

  const prev = localOf(node, sid);
  counters.memos++;
  let L;
  if (prev === MISSING) L = {};
  else {
    counters.shares++;
    L = cloneFast(prev);
  }
  let moved = prev === MISSING;
  let removeCandidates = null;

  // Fixed start: every conditional child that was active goes off.
  const wasActive = activeKidsOf(node, sid);
  for (let i = 0; i < wasActive.length; i++) {
    const c = wasActive[i];
    c.nextActive = false;
    c.activeStamp = sid;
    if (c.name in L) {
      L[c.name] = undefined;
      if (removeCandidates === null) removeCandidates = [];
      removeCandidates.push(c.name);
    }
  }
  // In a later derive round `wasActive` IS nextActiveKids (this round's
  // predecessor), already iterated above, so clearing it here is safe.
  const nowActive = node.nextActiveKids;
  nowActive.length = 0;
  node.fragStamp = sid;

  // Patch the dirty unconditional children into the start memo.
  const kids = node.dirtyKids;
  const isRoot = node.parent === null;
  for (let i = 0; i < kids.length; i++) {
    const c = kids[i];
    if (c.conditional) continue;
    const m = emitOf(c, sid);
    if (m === MISSING) {
      if (c.name in L) {
        L[c.name] = undefined;
        if (removeCandidates === null) removeCandidates = [];
        removeCandidates.push(c.name);
        moved = true;
      } else continue;
    } else if (L[c.name] !== m) {
      L[c.name] = m;
      moved = true;
    } else continue;
    if (useIndex && isRoot) changedKeys.add(c.name);
  }

  // Sweep.
  const G = isNull ? EMPTY_LOCAL : L;
  const cap = nFrag + 1;
  let sweep = 0;
  if (nFrag > 0 && wrongKind === false) {
    for (;;) {
      sweep++;
      counters.sweeps++;
      let grew = false;
      for (let i = 0; i < nFrag; i++) {
        const f = fragments[i];
        if (on[i] === 1) {
          // Option A: re-evaluated on repeat sweeps, result ignored.
          counters.reguards++;
          f.guard(G);
          continue;
        }
        let r;
        if (useIndex && isRoot && f.keysUnconditional && noneChanged(f.keys)) {
          r = node.fragOn[i];
        } else {
          counters.guards++;
          r = f.guard(G) ? 1 : 0;
        }
        if (r === 0) continue;
        on[i] = 1;
        grew = true;
        const declares = f.declares;
        for (let j = 0; j < declares.length; j++) {
          const c = node.index.get(declares[j]);
          if (c === undefined || activeOf(c, sid)) continue;
          c.nextActive = true;
          c.activeStamp = sid;
          nowActive.push(c);
          if (rawOf(c) === undefined && c.defaultValue !== undefined) {
            counters.injections++;
            stage(c, c.defaultValue);
            compute(c, sid);
          }
          const m = emitOf(c, sid);
          if (m !== MISSING && L[c.name] !== m) {
            L[c.name] = m;
            if (prev === MISSING || prev[c.name] !== m) moved = true;
          }
        }
      }
      if (grew === false) break;
      if (sweep >= cap) {
        lastSettle.budgetExceeded = true;
        break;
      }
    }
  }
  if (sweep > lastSettle.maxSweepsOnOneHost) lastSettle.maxSweepsOnOneHost = sweep;

  // Keys that stayed absent leave the object for real.
  let removed = false;
  if (removeCandidates !== null) {
    for (let i = 0; i < removeCandidates.length; i++) {
      const name = removeCandidates[i];
      if (L[name] === undefined) {
        delete L[name];
        removed = true;
        moved = true;
      }
    }
  }
  let local;
  if (moved === false) local = prev;
  else if (removed) {
    counters.normalizes++;
    local = Object.keys(L).length === 0 ? MISSING : { ...L };
  } else if (prev === MISSING) {
    // Keys inserted one at a time leave V8 in dictionary mode; one spread
    // restores fast mode, without which every later copy costs ~100x more.
    counters.normalizes++;
    local = Object.keys(L).length === 0 ? MISSING : { ...L };
  } else local = L;

  const emit = wrongKind ? raw : isNull ? null : project(node, sid, local);
  publish(node, sid, local, emit);
}

/** True when none of `keys` changed at the root this settle (inverted index). */
function noneChanged(keys) {
  for (let i = 0; i < keys.length; i++) if (changedKeys.has(keys[i])) return false;
  return true;
}

/**
 * project(local): active prohibition fragments remove their names (A3 step
 * 5); an object left with no keys is omitted; otherwise emit IS local (A8).
 */
function project(node, sid, local) {
  if (local === MISSING) return MISSING;
  const fragments = node.fragments;
  const on = node.nextFragOn;
  let out = null;
  for (let i = 0; i < fragments.length; i++) {
    if (on[i] === 0) continue;
    const prohibits = fragments[i].prohibits;
    for (let j = 0; j < prohibits.length; j++) {
      const name = prohibits[j];
      if (!(name in local)) continue;
      if (out === null) out = { ...local };
      delete out[name];
    }
  }
  if (out === null) return local;
  counters.normalizes++;
  const prevEmit = emitOf(node, sid);
  if (prevEmit !== MISSING && prevEmit !== null && sameKeys(prevEmit, out)) return prevEmit;
  return Object.keys(out).length === 0 ? MISSING : { ...out };
}

function sameKeys(a, b) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) if (a[ka[i]] !== b[ka[i]]) return false;
  return true;
}

/**
 * derive (A4): evaluate injectTo rules on the computed tree's emits; stage a
 * write when the mapped value differs from the target's raw. With `dryRun`
 * nothing is staged — used at the round cap so the tree is fixed to the last
 * computed round.
 * @returns {boolean} whether any write was (or would be) staged
 */
function derive(root, sid, dryRun) {
  const rules = root.injections;
  if (rules === null) return false;
  let wrote = false;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const e = emitOf(rule.from, sid);
    const v = rule.map(e === MISSING ? undefined : e);
    if (v === rawOf(rule.to)) continue;
    wrote = true;
    if (dryRun) return true;
    write(rule.to, v);
  }
  return wrote;
}

/** Apply staged raw values, computed memos and active flags; clear dirty. */
function commit(node, sid, out) {
  let changed = false;
  if (node.hasPending) {
    if (node.raw !== node.pendingRaw) changed = true;
    node.raw = node.pendingRaw;
    node.hasPending = false;
    node.pendingRaw = undefined;
  }
  if (node.stamp === sid) {
    if (node.local !== node.nextLocal || node.emit !== node.nextEmit) changed = true;
    node.local = node.nextLocal;
    node.emit = node.nextEmit;
  }
  if (node.activeStamp === sid && node.active !== node.nextActive) {
    node.active = node.nextActive;
    changed = true;
  }
  if (changed) out.push(node);
  node.dirty = false;
  if (node.kind === 'object' && node.fragStamp === sid) {
    const was = node.activeKids;
    for (let i = 0; i < was.length; i++) {
      const c = was[i];
      if (c.dirty) continue;
      if (c.activeStamp === sid && c.active !== c.nextActive) {
        c.active = c.nextActive;
        out.push(c);
      }
    }
    const now = node.nextActiveKids;
    for (let i = 0; i < now.length; i++) {
      const c = now[i];
      if (c.dirty) continue;
      if (c.active === false) {
        c.active = true;
        out.push(c);
      }
    }
    node.activeKids = now;
    node.nextActiveKids = was;
    was.length = 0;
    const tmp = node.fragOn;
    node.fragOn = node.nextFragOn;
    node.nextFragOn = tmp;
  }
  if (node.children !== null) {
    const kids = node.dirtyKids;
    for (let i = 0; i < kids.length; i++) commit(kids[i], sid, out);
    kids.length = 0;
  }
}

const EMPTY_CHANGED = [];

/**
 * Run mark -> compute -> derive rounds -> commit once.
 * @param {object} root
 * @param {{index?: boolean, dev?: boolean}} [opts] `index` enables the
 *   changed-key -> guard reuse at the root; `dev` raises after commit when the
 *   derive round cap was exceeded (production stays silent, A4)
 * @returns {object[]} changed nodes in tree order
 */
export function flush(root, opts) {
  if (root.dirty === false) return EMPTY_CHANGED;
  const sid = ++SID;
  counters.settles++;
  useIndex = opts !== undefined && opts.index === true;
  const dev = opts !== undefined && opts.dev === true;
  if (useIndex) {
    if (changedKeys === null) changedKeys = new Set();
    else changedKeys.clear();
  }
  lastSettle.rounds = 0;
  lastSettle.sweeps = 0;
  lastSettle.budgetExceeded = false;
  lastSettle.maxSweepsOnOneHost = 0;
  const sweeps0 = counters.sweeps;
  let exceeded = false;
  for (;;) {
    lastSettle.rounds++;
    counters.rounds++;
    compute(root, sid);
    if (lastSettle.rounds >= ROUND_CAP) {
      exceeded = derive(root, sid, true);
      break;
    }
    if (derive(root, sid, false) === false) break;
  }
  lastSettle.sweeps = counters.sweeps - sweeps0;
  if (exceeded) lastSettle.budgetExceeded = true;
  const out = [];
  commit(root, sid, out);
  if (exceeded && dev) {
    throw new Error(
      `derive did not settle in ${ROUND_CAP} rounds (computation budget exceeded); tree fixed to the last round`,
    );
  }
  return out;
}

/**
 * Stage every write `fn` performs, then settle once.
 * @returns {object[]} changed nodes in tree order
 */
export function batch(root, fn, opts) {
  fn();
  return flush(root, opts);
}

/** Read a node's committed emit (`getValue()` at the root); `undefined` when omitted. */
export function valueOf(node) {
  return node.emit === MISSING ? undefined : node.emit;
}

/** Read a node's committed local memo (`node.value`, A8); `undefined` when omitted. */
export function localValueOf(node) {
  return node.local === MISSING ? undefined : node.local;
}

function markAll(node) {
  node.dirty = true;
  const children = node.children;
  if (children === null) return;
  for (let i = 0; i < children.length; i++) {
    node.dirtyKids.push(children[i]);
    markAll(children[i]);
  }
}

/** Settle a freshly built tree: mark every node dirty, then flush. */
export function prime(root, opts) {
  markAll(root);
  return flush(root, opts);
}
