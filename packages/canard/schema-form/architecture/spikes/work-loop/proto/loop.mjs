/**
 * Prototype of the ADR 0006 / 0007 work loop: mark -> compute (begin/complete
 * passes to a fixed point) -> commit. No React, no validation, no events.
 *
 * Node kinds: leaf | object | array.
 * Emission: a leaf holding '' or undefined is omitted (omitEmpty); an object
 * that would emit nothing is omitted. A node keeps its raw value while
 * inactive; it is excluded from emission only.
 */

/** Sentinel for "this node emits nothing", so it is omitted by its parent. */
export const MISSING = Symbol('missing');

/** Maximum begin/complete passes per settle before the cycle guard throws. */
export const PASS_CAP = 25;

/** Work counters, zeroed by {@link resetCounters}. */
export const counters = {
  visited: 0,
  guards: 0,
  memos: 0,
  shares: 0,
  normalizes: 0,
  passes: 0,
  settles: 0,
};

/** Zero every counter in {@link counters}. */
export function resetCounters() {
  counters.visited = 0;
  counters.guards = 0;
  counters.memos = 0;
  counters.shares = 0;
  counters.normalizes = 0;
  counters.passes = 0;
  counters.settles = 0;
}

let SID = 0;
let PID = 0;

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
    hostsGuards: false,
    fragResults: null,
    fragSeeded: false,
    guardKeys: null,
    declaredBy: null,
    conditional: false,
    everActive: true,
    defaultValue: undefined,
    raw: undefined,
    pendingRaw: undefined,
    hasPending: false,
    memo: MISSING,
    active: true,
    dirty: false,
    wipMemo: MISSING,
    memoStamp: -1,
    wipActive: true,
    activeStamp: -1,
    ccStamp: -1,
    touched: null,
    touchedStamp: -1,
    dirtyKids: null,
  };
}

/**
 * Record that `child`'s contribution to `parent` moved this pass, so complete
 * can patch the previous memo instead of rebuilding it.
 */
function touch(parent, child) {
  if (parent.touchedStamp !== PID) {
    parent.touchedStamp = PID;
    if (parent.touched === null) parent.touched = [];
    else parent.touched.length = 0;
  }
  parent.touched.push(child);
}

/**
 * Create a leaf node.
 * @param {string|number} name key within the parent
 * @param {*} [defaultValue] injected on first activation when raw is absent
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
 * Declare conditional fragments on an object node. A child named by at least
 * one fragment is active iff some declaring fragment's guard holds; guards are
 * evaluated against the host's EMITTED value (ADR 0007).
 * @param {object} host object node
 * @param {Array<{guard: (hostValue: *) => boolean, declares: string[]}>} fragments
 * @param {string[]} [guardKeys] top-level keys the guards read, enabling the
 *   changed-key -> guard inverted index; omit to always evaluate every guard
 */
export function declareFragments(host, fragments, guardKeys) {
  host.fragments = fragments;
  host.hostsGuards = fragments.length > 0;
  host.fragResults = new Uint8Array(fragments.length);
  host.guardKeys = guardKeys || null;
  for (let i = 0; i < fragments.length; i++) {
    const declares = fragments[i].declares;
    for (let j = 0; j < declares.length; j++) {
      const child = host.index.get(declares[j]);
      if (child === undefined) continue;
      child.conditional = true;
      child.everActive = false;
      child.active = false;
      if (child.declaredBy === null) child.declaredBy = [];
      child.declaredBy.push(i);
    }
  }
}

/**
 * Stage a write and mark the path to the root dirty. Nothing is recomputed
 * until {@link flush}.
 */
export function write(node, value) {
  node.pendingRaw = value;
  node.hasPending = true;
  let n = node;
  while (n.dirty === false) {
    n.dirty = true;
    const p = n.parent;
    if (p === null) break;
    if (scanDirty === false) p.dirtyKids.push(n);
    n = p;
  }
}

/** Mark `child` dirty from inside a pass, keeping its parent's list current. */
function markDirty(parent, child) {
  if (child.dirty) return;
  child.dirty = true;
  if (scanDirty === false) parent.dirtyKids.push(child);
}

const rawOf = (n) => (n.hasPending ? n.pendingRaw : n.raw);
const memoOf = (n, sid) => (n.memoStamp === sid ? n.wipMemo : n.memo);
const activeOf = (n, sid) => (n.activeStamp === sid ? n.wipActive : n.active);

let guardFlipped = false;
let guardInputChanged = false;
let useIndex = false;
let share = true;
let scanDirty = false;
let changedKeys = null;
const flipped = [];

/**
 * begin: re-evaluate this host's guards against its emitted value and toggle
 * the active set. Runs top-down, before the children are visited, so a child
 * activated here is walked in the same pass.
 */
function begin(node, sid) {
  const fragments = node.fragments;
  const results = node.fragResults;
  const n = fragments.length;
  const hostValue = memoOf(node, sid);
  const host = hostValue === MISSING ? undefined : hostValue;
  flipped.length = 0;
  for (let i = 0; i < n; i++) {
    counters.guards++;
    const r = fragments[i].guard(host) ? 1 : 0;
    if (r !== results[i]) {
      results[i] = r;
      flipped.push(i);
    }
  }

  if (node.fragSeeded === false) {
    node.fragSeeded = true;
    flipped.length = 0;
    for (let i = 0; i < n; i++) flipped.push(i);
  } else if (flipped.length === 0) return;

  for (let f = 0; f < flipped.length; f++) {
    const declares = fragments[flipped[f]].declares;
    for (let j = 0; j < declares.length; j++) {
      const child = node.index.get(declares[j]);
      if (child === undefined) continue;
      const declaredBy = child.declaredBy;
      let on = false;
      for (let k = 0; k < declaredBy.length; k++) {
        if (results[declaredBy[k]] === 1) {
          on = true;
          break;
        }
      }
      if (on === activeOf(child, sid)) continue;
      child.wipActive = on;
      child.activeStamp = sid;
      guardFlipped = true;
      node.ccStamp = PID;
      touch(node, child);
      markDirty(node, child);
      if (on && child.everActive === false) {
        child.everActive = true;
        if (
          child.kind === 'leaf' &&
          rawOf(child) === undefined &&
          child.defaultValue !== undefined
        ) {
          child.pendingRaw = child.defaultValue;
          child.hasPending = true;
        }
      }
    }
  }
}

/**
 * complete: rebuild this node's emitted value from its active children. When
 * no child's memo reference moved, the previous reference is kept — that is
 * what makes "the same value read twice returns the same reference" hold.
 */
function complete(node, sid) {
  let next;
  if (node.kind === 'leaf') {
    const r = rawOf(node);
    next = r === '' || r === undefined ? MISSING : r;
  } else if (node.ccStamp !== PID && node.memoStamp !== -1) {
    return;
  } else {
    const prev = memoOf(node, sid);
    const shareable =
      share === true &&
      prev !== MISSING &&
      node.touchedStamp === PID &&
      node.touched.length * 2 <= node.children.length;
    next =
      node.kind === 'object'
        ? shareable
          ? patchObject(node, prev, sid)
          : rebuildObject(node, sid)
        : shareable
          ? patchArray(node, prev, sid)
          : rebuildArray(node, sid);
  }

  if (next === memoOf(node, sid)) return;
  node.wipMemo = next;
  node.memoStamp = sid;
  const parent = node.parent;
  if (parent !== null) {
    parent.ccStamp = PID;
    touch(parent, node);
    if (useIndex && parent.parent === null) changedKeys.add(node.name);
  }
  if (node.hostsGuards) guardInputChanged = true;
}

/** Compose an object memo from scratch. O(children), leaves V8 dictionary mode. */
function rebuildObject(node, sid) {
  counters.memos++;
  const children = node.children;
  let out = null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.conditional && activeOf(child, sid) === false) continue;
    const m = memoOf(child, sid);
    if (m === MISSING) continue;
    if (out === null) out = {};
    out[child.name] = m;
  }
  if (out === null) return MISSING;
  // Inserting keys one at a time drops V8 into dictionary mode past ~128
  // properties; one spread converts the result back to fast mode, without
  // which every later copy of this memo costs ~150x more.
  if (share === false) return out;
  counters.normalizes++;
  return { ...out };
}

/**
 * Copy the previous object memo and patch only the children that moved.
 * A removed key forces a second copy: `delete` drops V8 out of fast mode, and
 * a dictionary-mode memo makes every later copy ~150x more expensive.
 */
function patchObject(node, prev, sid) {
  counters.memos++;
  counters.shares++;
  const out = { ...prev };
  const touched = node.touched;
  let removed = false;
  for (let i = 0; i < touched.length; i++) {
    const child = touched[i];
    const name = child.name;
    const m =
      child.conditional && activeOf(child, sid) === false
        ? MISSING
        : memoOf(child, sid);
    if (m === MISSING) {
      if (name in out) {
        delete out[name];
        removed = true;
      }
    } else out[name] = m;
  }
  if (removed === false) return out;
  counters.normalizes++;
  const keys = Object.keys(out);
  if (keys.length === 0) return MISSING;
  return { ...out };
}

/** Compose an array memo from scratch. */
function rebuildArray(node, sid) {
  counters.memos++;
  const children = node.children;
  const len = children.length;
  const out = new Array(len);
  for (let i = 0; i < len; i++) {
    const m = memoOf(children[i], sid);
    out[i] = m === MISSING ? undefined : m;
  }
  return out;
}

/** Copy the previous array memo and patch only the slots that moved. */
function patchArray(node, prev, sid) {
  counters.memos++;
  counters.shares++;
  const out = prev.slice();
  const touched = node.touched;
  for (let i = 0; i < touched.length; i++) {
    const child = touched[i];
    const m = memoOf(child, sid);
    out[child.name] = m === MISSING ? undefined : m;
  }
  return out;
}

/** One begin/complete pass over the dirty subtrees rooted at `node`. */
function walk(node, sid) {
  counters.visited++;
  if (node.hostsGuards) {
    if (useIndex && node.guardKeys !== null && node.fragSeeded === true) {
      const keys = node.guardKeys;
      for (let i = 0; i < keys.length; i++) {
        if (changedKeys.has(keys[i])) {
          begin(node, sid);
          break;
        }
      }
    } else {
      begin(node, sid);
    }
  }
  if (node.children !== null) {
    if (scanDirty) {
      const children = node.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i].dirty) walk(children[i], sid);
      }
    } else {
      const kids = node.dirtyKids;
      for (let i = 0; i < kids.length; i++) walk(kids[i], sid);
    }
  }
  complete(node, sid);
}

/** Apply staged raw values and memos, clear dirty, collect changed nodes. */
function commit(node, sid, out) {
  let changed = false;
  if (node.hasPending) {
    node.raw = node.pendingRaw;
    node.hasPending = false;
    node.pendingRaw = undefined;
    changed = true;
  }
  if (node.activeStamp === sid && node.active !== node.wipActive) {
    node.active = node.wipActive;
    changed = true;
  }
  if (node.memoStamp === sid && node.memo !== node.wipMemo) {
    node.memo = node.wipMemo;
    changed = true;
  }
  if (changed) out.push(node);
  node.dirty = false;
  if (node.children !== null) {
    if (scanDirty) {
      const children = node.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i].dirty) commit(children[i], sid, out);
      }
    } else {
      const kids = node.dirtyKids;
      for (let i = 0; i < kids.length; i++) commit(kids[i], sid, out);
      kids.length = 0;
    }
  }
}

/** Drop staged writes and computed state, leaving the committed tree intact. */
function discard(node) {
  node.hasPending = false;
  node.pendingRaw = undefined;
  node.dirty = false;
  if (node.children !== null) {
    if (scanDirty) {
      const children = node.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i].dirty) discard(children[i]);
      }
    } else {
      const kids = node.dirtyKids;
      for (let i = 0; i < kids.length; i++) discard(kids[i]);
      kids.length = 0;
    }
  }
}

const EMPTY_CHANGED = [];

/**
 * Run the work loop to a fixed point and commit.
 * @param {object} root
 * @param {{index?: boolean}} [opts] `index: true` enables the changed-key ->
 *   guard inverted index, skipping guards whose read keys did not change
 * @returns {object[]} changed nodes in tree order
 * @throws {Error} when the pass cap is exceeded; the committed tree is left
 *   untouched and staged writes are dropped
 */
export function flush(root, opts) {
  if (root.dirty === false) return EMPTY_CHANGED;
  const sid = ++SID;
  counters.settles++;
  useIndex = opts !== undefined && opts.index === true;
  share = opts === undefined || opts.share !== false;
  scanDirty = opts !== undefined && opts.scanDirty === true;
  if (useIndex) {
    if (changedKeys === null) changedKeys = new Set();
    else changedKeys.clear();
  }
  let pass = 0;
  for (;;) {
    if (++pass > PASS_CAP) {
      discard(root);
      throw new Error(
        `work loop did not settle in ${PASS_CAP} passes (oscillating guard)`,
      );
    }
    counters.passes++;
    PID++;
    guardFlipped = false;
    guardInputChanged = false;
    walk(root, sid);
    if (guardFlipped === false && guardInputChanged === false) break;
  }
  const out = [];
  commit(root, sid, out);
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

/** Read a node's committed emitted value; `undefined` when it emits nothing. */
export function valueOf(node) {
  return node.memo === MISSING ? undefined : node.memo;
}

function markAll(node) {
  node.dirty = true;
  const children = node.children;
  if (children === null) return;
  for (let i = 0; i < children.length; i++) {
    if (scanDirty === false) node.dirtyKids.push(children[i]);
    markAll(children[i]);
  }
}

/** Settle a freshly built tree: mark every node dirty, then flush. */
export function prime(root, opts) {
  scanDirty = opts !== undefined && opts.scanDirty === true;
  markAll(root);
  return flush(root, opts);
}
