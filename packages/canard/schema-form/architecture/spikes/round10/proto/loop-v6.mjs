/** Round 9 spike. Generated from v4e by make-v5.mjs; raw and extras are the state cells. */

/** Sentinel for "this node emits nothing", so it is omitted by its parent. */
export const MISSING = Symbol('missing');

/** Sentinel for "no input has reported a value for this node yet" (A6). */
const NOREPORT = Symbol('noreport');

/** Maximum derive + transition rounds per settle (A3). */
export const ROUND_CAP = 25;

/** Maximum notification waves per synchronous call (B3-4). */
export const WAVE_CAP = 25;

/** Signal bit: RequestRefresh (A6). */
export const REFRESH = 1;

/** Set switches before constructing a tree. */
export const SWITCHES = {
  EXPERIMENT: false, CLEAR_PRIORITY: 'clear-wins', LOSER_FATE: 'dropped',
  EDGE_CONSUMED_ON_LOSS: true, LOAD_EDGE_CLEAR: 'held',
  FINAL_SHAPE: true, AUTO_SCOPE: 'settle', EDGE_REF: 'entry',
  INJECT_TO_EDGE: true, LOAD_EDGE: 'fire', ORDER_HINT: false,
  DERIVED_MODE: 'edge', EDGE_COMPARE: 'value', DEFAULT_WINNER: 'last',
  COMMIT_ON_BUDGET: 'base', ROUND_CAP, EXTRAS_ORDER: 'insertion',
  DERIVE_ORDER: ['derived', 'injectTo', 'clearValue'],
  WRITE_CONFLICT: 'last', CONTROL_COMBINE: 'and-or', NODE_GATE_UNIT: 'shape',
};
/** Historical write switches; retired branch state is not emulated. */
export const OLD_SWITCHES = Object.freeze({ ...SWITCHES,
  FINAL_SHAPE: false, EDGE_REF: 'commit', INJECT_TO_EDGE: false,
  COMMIT_ON_BUDGET: 'lastRound',
});

/** The default (new) switch values. */
export const NEW_SWITCHES = Object.freeze({ ...SWITCHES });

/**
 * Overwrite switches with the given values; missing keys keep their value.
 * @param {Partial<typeof SWITCHES>} values
 * @returns {object} the values before the call, for restoring
 */
export function setSwitches(values) {
  const prev = { ...SWITCHES };
  Object.assign(SWITCHES, values);
  return prev;
}

/** Work counters, zeroed by {@link resetCounters}. */
export const counters = {
  visited: 0,
  guards: 0,
  composes: 0,
  rebuilds: 0,
  copies: 0,
  normalizes: 0,
  sweeps: 0,
  rounds: 0,
  settles: 0,
  injections: 0,
  waves: 0,
  notifications: 0,
  entries: 0,
  onChange: 0,
  validations: 0,
  retractions: 0,
};

/** Zero every counter in {@link counters}. */
export function resetCounters() {
  for (const k of Object.keys(counters)) counters[k] = 0;
}

/** Facts about the most recent settle, for scenario assertions. */
export const lastSettle = {
  rounds: 0,
  sweeps: 0,
  budgetExceeded: false,
  hostExceeded: false,
  maxSweepsOnOneHost: 0,
  injected: [],
  refreshed: [],
  waves: 0,
  wavesExceeded: false,
  delivered: [],
  errors: [],
  /** Which budget ended the settle: '' | 'host' | 'rounds'. */
  budgetWhich: '',
  /** Paths whose automatic write was retracted (trace only). */
  retracted: [],
  /** v4e: '' | 'lastRound' | 'base' — which state a rounds overrun committed. */
  budgetCommit: '',
  /** v4e: logged automatic writes present at commit: {path, value, kind, host}. */
  autoAtCommit: [],
};

/** Facts about the most recent completed ENTRY (depth back to 0). */
export const lastEntry = {
  /** Settles (= commits) performed by this entry, including listener writes. */
  settles: 0,
  /** Waves run by this entry's dispatches, summed. */
  waves: 0,
  /** Whether `root.onChange` was called for this entry. */
  onChange: false,
  /** Whether `root.onValidate` was requested for this entry. */
  validation: false,
  /** Commit number stamped on the validation request / onChange payload. */
  commit: 0,
  /** onChange nesting depth at which this entry ran (0 = not inside onChange). */
  onChangeDepth: 0,
  /** Set when an onChange -> write -> onChange chain hit WAVE_CAP. */
  onChangeCapExceeded: false,
  /** Set when the entry unwound with an exception (dev-mode budget throw). */
  aborted: false,
};

let SID = 0;
let batchDepth = 0;
let stagingDepth = 0;
let trace = false;
/** True while the rounds of a settle run: a replacement made then is not the caller's. */
let inSettle = false;
/** > 0 while a caller's full replacement of a host is being staged. */
let loadDepth = 0;

/** Record injected / refreshed / delivered paths in {@link lastSettle} (costs a pathOf per event). */
export function setTrace(on) {
  trace = on;
}

const EMPTY_KEYS = Object.freeze([]);
const EMPTY_LOCAL = Object.freeze({});

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
    root: null,
    pos: 0,
    children: null,
    index: null,
    itemFactory: null,
    omitTrailing: false,
    fragments: null,
    conditionalKids: null,
    fragOn: null,
    nextFragOn: null,
    fragStamp: -1,
    conditional: false,
    declaredBy: null,
    defaultValue: undefined,
    schema: null,
    effectiveSchema: null,
    shapePresent: false,
    controls: { active: true, visible: true, readOnly: false, disabled: false },
    controlNext: null,
    controlLayers: [],
    expressionDefault: undefined,
    clearExpression: undefined,
    clearWas: false,
    clearNext: false,
    unconditional: false,
    raw: undefined,
    pendingRaw: undefined,
    hasPending: false,
    reported: NOREPORT,
    extras: null,
    pendingExtras: null,
    hasPendingExtras: false,
    local: MISSING,
    emit: MISSING,
    localKeys: EMPTY_KEYS,
    nextLocal: MISSING,
    nextEmit: MISSING,
    nextLocalKeys: EMPTY_KEYS,
    stamp: -1,
    settle: null,
    nextSettle: null,
    active: true,
    actNext: true,
    dirty: false,
    dirtyKids: null,
    replaced: false,
    absent: true,
    detached: false,
    listeners: null,
    revision: 0,
    signals: 0,
    callerLoaded: false,
    loaded: false,
    isSource: false,
    srcWritten: false,
    edgeRef: MISSING,
    edgeRefEntry: -1,
    entryFragOn: null,
    entryFragEntry: -1,
    hintOrder: null,
    // root only
    injections: null,
    options: null,
    onChange: null,
    onValidate: null,
    initialValue: undefined,
    replacedHosts: null,
    computedHosts: null,
    dispatching: false,
    waveQueue: null,
    entryDepth: 0,
    entryEmit: MISSING,
    entryCommit: 0,
    entrySettles: 0,
    entryWaves: 0,
    commitNumber: 0,
    onChangeDepth: 0,
    entryId: 0,
    autoLog: null,
    loadedList: null,
  };
}

/**
 * Open an entry on the root of `node` (depth 0 -> 1 records the emit and
 * commit number the entry starts from). @returns {object} the root
 */
function enter(node) {
  const root = node.root ?? node;
  if (root.entryDepth++ === 0) {
    root.entryId++;
    root.entryEmit = root.emit;
    root.entryCommit = root.commitNumber;
    root.entrySettles = 0;
    root.entryWaves = 0;
  }
  return root;
}

/**
 * Close an entry: at depth 1 -> 0 request validation once and call
 * `onChange` once with the final emit. `ok === false` (exception unwinding)
 * only restores the depth.
 */
function leave(root, ok) {
  if (--root.entryDepth !== 0) return;
  endEntryScope(root);
  counters.entries++;
  lastEntry.settles = root.entrySettles;
  lastEntry.waves = root.entryWaves;
  lastEntry.commit = root.commitNumber;
  lastEntry.onChangeDepth = root.onChangeDepth;
  lastEntry.onChange = false;
  lastEntry.validation = false;
  lastEntry.onChangeCapExceeded = false;
  lastEntry.aborted = ok === false;
  if (ok === false) return;
  const previous = root.entryEmit;
  const current = root.emit;
  if (previous === current) return;
  if (root.onValidate !== null) {
    counters.validations++;
    lastEntry.validation = true;
    try {
      root.onValidate(root.commitNumber);
    } catch (e) {
      lastSettle.errors.push({ path: '/', error: e });
    }
  }
  if (root.onChange === null) return;
  if (root.onChangeDepth >= WAVE_CAP) {
    lastEntry.onChangeCapExceeded = true;
    root.settle.status = 'onchange-cap-exceeded';
    if (root.options.dev) {
      const err = new Error(`onChange cap exceeded: depth=${root.onChangeDepth}`);
      err.onChangeCap = true;
      throw err;
    }
    return;
  }
  counters.onChange++;
  lastEntry.onChange = true;
  root.onChangeDepth++;
  try {
    root.onChange(valueOrUndefined(current), { previous: valueOrUndefined(previous), current: valueOrUndefined(current), commit: root.commitNumber });
  } catch (e) {
    if (e !== null && typeof e === 'object' && e.onChangeCap === true) throw e;
    lastSettle.errors.push({ path: '/', error: e });
  } finally {
    root.onChangeDepth--;
  }
}

/**
 * Create a leaf node.
 * @param {string|number} name key within the parent
 * @param {*} [defaultValue] the unconditional (`properties`) default
 */
export function leaf(name, defaultValue) {
  const n = makeNode('leaf', name);
  n.defaultValue = defaultValue;
  return n;
}

/** Create an object host with a name index over its children. */
export function object(name) {
  const n = makeNode('object', name);
  n.children = [];
  n.index = new Map();
  n.dirtyKids = [];
  n.fragments = [];
  n.conditionalKids = [];
  n.fragOn = new Uint8Array(0);
  n.nextFragOn = new Uint8Array(0);
  n.extras = null;
  n.settle = { status: 'stable', sweeps: 0 };
  n.nextSettle = { status: 'stable', sweeps: 0 };
  return n;
}

/**
 * Create an array node.
 * @param {string|number} name
 * @param {(index: number) => object} [itemFactory] builds a node for an
 *   index a full replacement or `push` needs
 */
export function array(name, itemFactory) {
  const n = makeNode('array', name);
  n.children = [];
  n.dirtyKids = [];
  n.itemFactory = itemFactory ?? null;
  n.settle = { status: 'stable', sweeps: 0 };
  n.nextSettle = { status: 'stable', sweeps: 0 };
  return n;
}

function setRoot(node, root) {
  node.root = root;
  const kids = node.children;
  if (kids === null) return;
  for (let i = 0; i < kids.length; i++) setRoot(kids[i], root);
}

/**
 * Attach `child` to `parent` (document order = attach order).
 * @returns {object} the child
 */
export function attach(parent, child) {
  child.parent = parent;
  child.pos = parent.children.length;
  child.detached = false;
  parent.children.push(child);
  if (parent.kind === 'object') parent.index.set(child.name, child);
  setRoot(child, parent.root ?? parent);
  return child;
}

/** Make `node` the root: options, injections, bookkeeping lists. */
function ensureRoot(node) {
  if (node.replacedHosts !== null) return node;
  node.root = node;
  node.replacedHosts = [];
  node.computedHosts = [];
  node.waveQueue = [];
  node.options = { dev: false, disableAutomaticWrites: false };
  node.warnings = [];
  node.schemaMode = false;
  node.loadSuppressed = false;
  node.fillSeen = new Set();
  node.fillValues = new Map();
  node.cleared = new Set();
  node.injections = [];
  node.autoLog = new Map();
  node.loadedList = [];
  setRoot(node, node);
  return node;
}

/** Declare precompiled guard predicates and unconditional fragments in document order. */
export function declareFragments(host, fragments) {
  const flat = [];
  const walk = (list, parentIdx) => {
    const ordered = list
      .map((f, i) => ({ f, i }))
      .sort((a, b) => (a.f.rank ?? 0) - (b.f.rank ?? 0) || a.i - b.i)
      .map((x) => x.f);
    for (const f of ordered) {
      const idx = flat.length;
      flat.push({
        id: f.id ?? `f${idx}`,
        guard: f.guard ?? null,
        controls: f.controls ?? null,
        declares: f.declares ?? [],
        defaults: f.defaults ?? null,
        expressionDefaults: f.expressionDefaults ?? null,
        parentIdx,
        inherited: false,
        owner: null,
        ownerIdx: -1,
        overlays: f.overlays ?? [],
      });
      if (f.children) walk(f.children, idx);
    }
  };
  walk(fragments, -1);
  for (const f of flat) addFragment(host, f);
  for (let i = 0; i < flat.length; i++) {
    const f = flat[i];
    for (const o of f.overlays) {
      const child = host.index.get(o.host);
      if (child === undefined || child.kind !== 'object') throw new Error(`overlay host ${o.host} is not an object child`);
      addFragment(child, {
        id: o.id ?? `${f.id}@${o.host}`,
        guard: null,
        controls: o.controls ?? null,
        declares: o.declares ?? [],
        defaults: o.defaults ?? null,
        parentIdx: -1,
        inherited: true,
        owner: host,
        ownerIdx: i,
        overlays: [],
      });
    }
  }

}

function addFragment(host, f) {
  const idx = host.fragments.length;
  host.fragments.push(f);
  const n = idx + 1;
  const on = new Uint8Array(n);
  on.set(host.fragOn);
  host.fragOn = on;
  host.nextFragOn = new Uint8Array(n);
  host.entryFragOn = new Uint8Array(n);
  host.entryFragEntry = -1;
  for (const name of f.declares) {
    const child = host.index.get(name);
    if (child === undefined) throw new Error(`fragment declares unknown child ${name}`);
    if (child.unconditional) {
      child.declaredBy ??= [];
      child.declaredBy.push(idx);
      continue;
    }
    if (child.conditional === false) {
      child.conditional = true;
      child.active = false;
      child.actNext = false;
      child.declaredBy = [];
      host.conditionalKids.push(child);
    }
    child.declaredBy.push(idx);
  }
}

/**
 * Declare derive-stage `injectTo` rules on the root (A3). After every
 * compute, each rule reads `from`'s emit and fully replaces `to` with
 * `map(emit)` when it differs from what `to` holds.
 * @param {object} root
 * @param {Array<{from: object, to: object, map: (emit: *) => *}>} rules
 */
export function declareInjections(root, rules) {
  ensureRoot(root).injections = rules;
  for (let i = 0; i < rules.length; i++) rules[i].from.isSource = true;
}

/**
 * v4e '&derived': append derive rules after the injectTo rules. A derived rule
 * is an injectTo rule whose trigger follows DERIVED_MODE instead of
 * INJECT_TO_EDGE ('edge' = the injectTo edge test, 'level' = every round).
 * @param {object} root
 * @param {Array<{from: object, to: object, map: (emit: *) => *}>} rules
 * @returns {Array<object>} the stored rule objects (identity used by the log)
 */
export function declareDerived(root, rules) {
  const r = ensureRoot(root);
  const stored = rules.map((x) => ({ ...x, derived: true }));
  r.injections = [...r.injections, ...stored];
  for (let i = 0; i < stored.length; i++) stored[i].from.isSource = true;
  return stored;
}

/** Whether a rule is gated by the edge test (derived: DERIVED_MODE, injectTo: INJECT_TO_EDGE). */
const edgeGated = (rule) => (rule.derived === true ? SWITCHES.DERIVED_MODE === 'edge' : SWITCHES.INJECT_TO_EDGE);

/** Undeclared keys of a host in emit order (EXTRAS_ORDER). */
const extrasKeys = (extras) => (SWITCHES.EXTRAS_ORDER === 'sorted' ? Object.keys(extras).sort() : Object.keys(extras));

/** Subscribe to a node's notifications. @returns {() => void} unsubscribe */
export function subscribe(node, listener) {
  if (node.listeners === null) node.listeners = [];
  node.listeners.push(listener);
  return () => {
    const i = node.listeners.indexOf(listener);
    if (i >= 0) node.listeners.splice(i, 1);
  };
}

/** Slash path from the root, for reports. */
export function pathOf(node) {
  const parts = [];
  for (let n = node; n.parent !== null; n = n.parent) parts.push(n.name);
  return `/${parts.reverse().join('/')}`;
}

// ----------------------------------------------------------------- marking

/** Mark the path from `node` to the root dirty. @returns {object} the root */
function touch(node) {
  let n = node;
  while (n.dirty === false) {
    n.dirty = true;
    const p = n.parent;
    if (p === null) break;
    p.dirtyKids.push(n);
    n = p;
  }
  return node.root;
}

function stageRaw(node, value) {
  node.pendingRaw = value;
  node.hasPending = true;
  touch(node);
}

const rawOf = (n) => (n.hasPending ? n.pendingRaw : n.raw);
const emitOf = (n, sid) => (n.stamp === sid ? n.nextEmit : n.emit);
const extrasOf = (n) => (n.hasPendingExtras ? n.pendingExtras : n.extras);
const fragOnOf = (n, sid) => (n.fragStamp === sid ? n.nextFragOn : n.fragOn);

function markReplaced(host) {
  if (inSettle === false && host.callerLoaded === false) {
    host.callerLoaded = true;
    host.root.loadedList.push(host);
  }
  if (host.replaced) return;
  host.replaced = true;
  host.root.replacedHosts.push(host);
}

/** Absent = a leaf without raw, or a host that received no value (A2 "없음"). */
const isAbsent = (n) => (n.kind === 'leaf' ? rawOf(n) === undefined : n.absent);

/** A value landed on `node`: it and every ancestor host exist now. */
function markPresent(node) {
  for (let n = node; n !== null && n.absent; n = n.parent) n.absent = false;
}

/** Erase a subtree's raw (absent) and extras — "V에 없는 자식". */
function erase(node) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);
  if (node.isSource && inSettle === false) markSourceWritten(node);
  if (node.kind === 'leaf') {
    if (rawOf(node) !== undefined) stageRaw(node, undefined);
    else touch(node);
    return;
  }
  if (rawOf(node) !== undefined) stageRaw(node, undefined);
  else touch(node);
  node.absent = true;
  if (node.kind === 'object') {
    node.pendingExtras = null;
    node.hasPendingExtras = true;
  }
  markReplaced(node);
  const kids = node.children;
  for (let i = 0; i < kids.length; i++) erase(kids[i]);
}

function applyValue(node, value, merge) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);
  if (node.isSource && inSettle === false) markSourceWritten(node);
  markPresent(node);
  if (node.kind === 'leaf') {
    stageRaw(node, value);
    return;
  }
  const isArray = node.kind === 'array';
  const wrongKind = value === null || typeof value !== 'object' || Array.isArray(value) !== isArray;
  if (wrongKind) {
    stageRaw(node, value);
    if (isArray === false) {
      node.pendingExtras = null;
      node.hasPendingExtras = true;
    }
    markReplaced(node);
    const kids = node.children;
    for (let i = 0; i < kids.length; i++) erase(kids[i]);
    return;
  }
  if (rawOf(node) !== undefined) stageRaw(node, undefined);
  else touch(node);
  if (isArray) {
    applyArray(node, value);
    return;
  }
  if (merge === false) {
    markReplaced(node);
    let extras = null;
    for (const key in value) {
      if (node.index.has(key)) continue;
      if (extras === null) extras = {};
      extras[key] = value[key];
    }
    if (extras !== null || extrasOf(node) !== null) {
      node.pendingExtras = extras;
      node.hasPendingExtras = true;
    }
  } else {
    let extras = extrasOf(node);
    let touched = false;
    for (const key in value) {
      if (node.index.has(key)) continue;
      if (touched === false) {
        extras = extras === null ? {} : { ...extras };
        touched = true;
      }
      extras[key] = value[key];
    }
    if (touched) {
      node.pendingExtras = extras;
      node.hasPendingExtras = true;
    }
  }
  const kids = node.children;
  for (let i = 0; i < kids.length; i++) {
    const child = kids[i];
    if (Object.hasOwn(value, child.name)) applyValue(child, value[child.name], merge);
    else if (merge === false) erase(child);
  }
}

/** Array full replacement (Merge = Overwrite for arrays, A2). */
function applyArray(node, value) {
  markReplaced(node);
  const kids = node.children;
  while (kids.length > value.length) detachLast(node);
  for (let i = 0; i < value.length; i++) {
    if (i >= kids.length) {
      if (node.itemFactory === null) throw new Error('array needs an itemFactory to grow');
      attach(node, node.itemFactory(i));
    }
    applyValue(kids[i], value[i], false);
  }
}

function detachLast(node) {
  const child = node.children.pop();
  child.detached = true;
  child.parent = null;
}

function autoSettle(node) {
  if (batchDepth > 0 || stagingDepth > 0) return;
  const root = node.root;
  if (root.dirty) settle(root);
}

/**
 * Caller-declared write (A2): `Overwrite` (default) is a full replacement —
 * children absent from V become absent, `null`/`17` too; `Merge` is a
 * partial write — only the given keys change. Outside `batch` it settles
 * and notifies synchronously.
 */
export function setValue(node, value, mode = 'Overwrite') {
  const loadOptions = typeof mode === 'object' ? mode : {};
  mode = loadOptions.mode ?? (typeof mode === 'string' ? mode : 'Overwrite');
  const root = enter(node);
  if (mode !== 'Merge' && node.kind !== 'leaf') root.loadSuppressed ||= loadOptions.disableAutomaticWrites ?? root.options.disableAutomaticWrites;
  let ok = false;
  try {
    noteCallerWrite(root, node);
    const load = mode !== 'Merge' && node.kind !== 'leaf';
    if (load) loadDepth++;
    stagingDepth++;
    try {
      applyValue(node, value, mode === 'Merge');
      if (mode === 'Merge') clearNonObjectAncestors(node);
    } finally {
      stagingDepth--;
      if (load) loadDepth--;
    }
    autoSettle(node);
    ok = true;
  } finally {
    leave(root, ok);
  }
}

function clearNonObjectAncestors(node) {
  markPresent(node);
  for (let p = node.parent; p !== null; p = p.parent) {
    if (rawOf(p) !== undefined) stageRaw(p, undefined);
  }
}

/**
 * Leaf input (partial write): the input reports `value` as what it shows,
 * so a committed raw equal to it needs no RequestRefresh (A6). A host above
 * whose raw is a non-object is emptied (A5).
 */
export function write(node, value) {
  const root = enter(node);
  let ok = false;
  try {
    noteCallerWrite(root, node);
    stagingDepth++;
    try {
      stageRaw(node, value);
      node.reported = value;
      if (node.isSource) markSourceWritten(node);
      clearNonObjectAncestors(node);
    } finally {
      stagingDepth--;
    }
    autoSettle(node);
    ok = true;
  } finally {
    leave(root, ok);
  }
}

/** Remove an undeclared key from a host's extras (A8 `removeKey`). */
export function removeKey(host, key) {
  const root = enter(host);
  let ok = false;
  try {
    noteCallerWrite(root, host);
    const extras = extrasOf(host);
    if (extras !== null && Object.hasOwn(extras, key)) {
      const next = {};
      for (const k of Object.keys(extras)) if (k !== key) next[k] = extras[k];
      host.pendingExtras = Object.keys(next).length === 0 ? null : next;
      host.hasPendingExtras = true;
      touch(host);
      autoSettle(host);
    }
    ok = true;
  } finally {
    leave(root, ok);
  }
}

/** Array structure op: append an item built by the factory, holding `value`. */
export function push(arr, value) {
  const root = enter(arr);
  let ok = false;
  try {
    noteCallerWrite(root, arr);
    stagingDepth++;
    try {
      const item = attach(arr, arr.itemFactory(arr.children.length));
      touch(arr);
      applyValue(item, value, false);
    } finally {
      stagingDepth--;
    }
    autoSettle(arr);
    ok = true;
  } finally {
    leave(root, ok);
  }
}

/** Array structure op: detach the item at `index`; later items shift down. */
export function remove(arr, index) {
  const root = enter(arr);
  let ok = false;
  try {
    noteCallerWrite(root, arr);
    const kids = arr.children;
    const child = kids[index];
    if (child !== undefined) {
      kids.splice(index, 1);
      child.detached = true;
      child.parent = null;
      for (let i = index; i < kids.length; i++) {
        kids[i].name = i;
        kids[i].pos = i;
      }
      touch(arr);
      autoSettle(arr);
    }
    ok = true;
  } finally {
    leave(root, ok);
  }
}

/**
 * Full replacement with the initial value (`reset()`).
 */
export function reset(root, options = {}) {
  setValue(root, root.initialValue, options);
}

/** Load: remember the initial value, replace the whole tree with it, settle. */
export function prime(root, value, opts) {
  ensureRoot(root);
  if (opts) Object.assign(root.options, opts);
  root.initialValue = value;
  markAll(root);
  setValue(root, value === undefined ? {} : value);
  return root;
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

/**
 * Stage every write `fn` performs, then settle once and notify once.
 * Nested batches: the outermost wins (B2).
 */
export function batch(root, fn) {
  enter(root);
  let ok = false;
  try {
    batchDepth++;
    try {
      fn();
    } finally {
      batchDepth--;
    }
    if (batchDepth === 0 && root.dirty) settle(root);
    ok = true;
  } finally {
    leave(root, ok);
  }
}

// ----------------------------------------------------------------- compute

/**
 * Shallow-copy a fast-mode object. Kept in its own tiny function: v3 measured
 * the same spread at ~85 us instead of ~1 us when it shared an inline cache
 * with a dictionary-mode source.
 */
function cloneFast(o) {
  counters.copies++;
  return { ...o };
}

/**
 * One spread over an object whose keys were inserted one at a time: V8 keeps
 * such an object in dictionary mode past ~128 keys and every later copy of
 * it costs ~100x more; the spread result is a fast-mode object. Separate
 * site from {@link cloneFast} on purpose (v3 REPORT §4).
 */
function normalize(o) {
  counters.normalizes++;
  return { ...o };
}

function publish(node, sid, local, emit) {
  node.nextLocal = local;
  node.nextEmit = emit;
  node.stamp = sid;
}

function sortDirty(kids) {
  for (let i = 1; i < kids.length; i++) {
    if (kids[i - 1].pos > kids[i].pos) {
      kids.sort((a, b) => a.pos - b.pos);
      return;
    }
  }
}

/** compute: one node, its dirty children first, in document order. */
function compute(node, sid) {
  counters.visited++;
  if (node.kind === 'leaf') {
    const r = rawOf(node);
    const e = r === '' || r === undefined ? MISSING : r;
    publish(node, sid, e, e);
    return;
  }
  const kids = node.dirtyKids;
  if (kids.length > 1) sortDirty(kids);
  for (let i = 0; i < kids.length; i++) if (kids[i].detached === false) compute(kids[i], sid);
  node.root.computedHosts.push(node);
  if (node.kind === 'array') computeArray(node, sid);
  else computeObject(node, sid);
}

function computeArray(node, sid) {
  const raw = rawOf(node);
  if (raw !== undefined) {
    publish(node, sid, MISSING, raw);
    return;
  }
  const prev = node.local;
  const children = node.children;
  const kids = node.dirtyKids;
  if (prev !== MISSING && prev.length === children.length && node.omitTrailing === false && kids.length * 2 <= children.length) {
    let next = prev;
    for (let i = 0; i < kids.length; i++) {
      const child = kids[i];
      if (child.detached) continue;
      const m = emitOf(child, sid);
      const v = m === MISSING ? undefined : m;
      if (next[child.name] === v) continue;
      if (next === prev) next = prev.slice();
      next[child.name] = v;
    }
    publish(node, sid, next, next);
    return;
  }
  let end = children.length;
  if (node.omitTrailing) {
    while (end > 0) {
      const m = emitOf(children[end - 1], sid);
      if (m === MISSING || m === null) end--;
      else break;
    }
  }
  let same = prev !== MISSING && prev.length === end;
  if (same) {
    for (let i = 0; i < end; i++) {
      const m = emitOf(children[i], sid);
      if (prev[i] !== (m === MISSING ? undefined : m)) {
        same = false;
        break;
      }
    }
  }
  if (same) {
    publish(node, sid, prev, prev);
    return;
  }
  const next = new Array(end);
  for (let i = 0; i < end; i++) {
    const m = emitOf(children[i], sid);
    next[i] = m === MISSING ? undefined : m;
  }
  publish(node, sid, next, next);
}

function sameOn(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Set every conditional child's `actNext` from the fragment set `on`. */
function applyActive(node, on) {
  const cond = node.conditionalKids;
  for (let i = 0; i < cond.length; i++) cond[i].actNext = false;
  const frags = node.fragments;
  for (let i = 0; i < frags.length; i++) {
    if (on[i] === 0) continue;
    const declares = frags[i].declares;
    for (let j = 0; j < declares.length; j++) node.index.get(declares[j]).actNext = true;
  }
}

/**
 * local := compose(A): active children's emit in schema (attach) order, then
 * extras in insertion order. When A equals the committed active set and no
 * dirty child appeared or disappeared, the committed local is copied and
 * patched with the dirty children only (O(dirty), the v3 path; same
 * reference when nothing differs). Otherwise it is rebuilt in schema order
 * (O(children), no `delete`, A4-7) — every fragment toggle pays this.
 * @param {boolean} activeSame A equals the committed fragment set
 */
function compose(node, sid, activeSame) {
  counters.composes++;
  const prev = node.local;
  const prevKeys = node.localKeys;
  const children = node.children;
  const extras = extrasOf(node);
  if (!node.root.schemaMode && activeSame && prev !== MISSING && node.hasPendingExtras === false) {
    const kids = node.dirtyKids;
    let out = prev;
    let shape = true;
    for (let i = 0; i < kids.length; i++) {
      const c = kids[i];
      if (c.detached || (c.conditional && c.actNext === false)) continue;
      const m = emitOf(c, sid);
      const had = prev[c.name] !== undefined;
      if ((m === MISSING) === had) {
        shape = false;
        break;
      }
      if (m === MISSING || prev[c.name] === m) continue;
      if (out === prev) out = cloneFast(prev);
      out[c.name] = m;
    }
    if (shape) {
      node.nextLocalKeys = prevKeys;
      return out;
    }
  }
  counters.rebuilds++;
  const out = {};
  const keys = [];
  for (let i = 0; i < children.length; i++) {
    const c = children[i];
    if ((c.conditional && c.actNext === false) || c.controlNext?.active === false) continue;
    const m = emitOf(c, sid);
    if (m === MISSING) continue;
    out[c.name] = m;
    keys.push(c.name);
  }
  if (extras !== null) {
    for (const k of extrasKeys(extras)) {
      out[k] = extras[k];
      keys.push(k);
    }
  }
  node.nextLocalKeys = keys;
  if (node.root.schemaMode && sameValue(prev, out)) return prev;
  return keys.length > 16 ? normalize(out) : out;
}

/**
 * One sweep: every fragment in tree order against G composed from the
 * CURRENT A — a fragment that turns on or off recomposes G before the next
 * guard (this is what makes a forward chain resolve in one sweep). A nested
 * fragment is traversed only when its enclosing fragment is on in this same
 * sweep; inherited overlays take the owner's current state.
 * @returns {boolean} whether A changed during the sweep
 */
function sweepOnce(node, on, sid, nonObject) {
  const frags = node.fragments;
  const order = SWITCHES.ORDER_HINT ? node.hintOrder : null;
  let changed = false;
  for (let k = 0; k < frags.length; k++) {
    const i = order === null ? k : order[k];
    const f = frags[i];
    let v;
    if (f.parentIdx >= 0 && on[f.parentIdx] === 0) v = 0;
    else if (f.inherited) v = fragOnOf(f.owner, sid)[f.ownerIdx];
    else {
      counters.guards++;
      v = f.guard === null || f.guard(nonObject ? EMPTY_LOCAL : node.nextLocal) ? 1 : 0;
    }
    if (v === on[i]) continue;
    on[i] = v;
    changed = true;
    applyActive(node, on);
    node.nextLocal = compose(node, sid, sameOn(on, node.fragOn));
  }
  return changed;
}

/**
 * Host compute (A4): A0 = unconditional + inherited overlays that are on;
 * G = compose(A) (projected: children's emit already carry omitEmpty /
 * omitTrailing / null; a non-object host raw makes G = {}); all guards each
 * sweep, option B, repeat while A changed, cap = fragments + 1.
 */
function computeObject(node, sid) {
  const raw = rawOf(node);
  const nonObject = raw !== undefined;
  const frags = node.fragments;
  const nFrag = frags.length;
  const on = node.nextFragOn;
  on.fill(0);
  let status = 'stable';
  let sweeps = 0;
  node.fragStamp = sid;
  if (nFrag === 0) {
    const L = compose(node, sid, true);
    publishHost(node, sid, L, nonObject, raw, status, sweeps);
    return;
  }
  for (let i = 0; i < nFrag; i++) {
    const f = frags[i];
    if (f.inherited) on[i] = fragOnOf(f.owner, sid)[f.ownerIdx];
  }
  const cap = nFrag + 1;
  if (SWITCHES.ORDER_HINT) node.hintOrder = hintOrderOf(node);
  applyActive(node, on);
  node.nextLocal = compose(node, sid, sameOn(on, node.fragOn));
  for (;;) {
    sweeps++;
    counters.sweeps++;
    if (sweepOnce(node, on, sid, nonObject) === false) break;
    if (sweeps >= cap) {
      status = 'budget-exceeded';
      lastSettle.hostExceeded = true;
      break;
    }
  }
  if (sweeps > lastSettle.maxSweepsOnOneHost) lastSettle.maxSweepsOnOneHost = sweeps;
  publishHost(node, sid, node.nextLocal, nonObject, raw, status, sweeps);
}

function publishHost(node, sid, L, nonObject, raw, status, sweeps) {
  const s = node.nextSettle;
  s.status = status;
  s.sweeps = sweeps;
  const emit = nonObject ? raw : node.nextLocalKeys.length === 0 ? MISSING : L;
  publish(node, sid, L, emit);
}

// ----------------------------------------------------------------- derive / transition

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/** DEFAULT_WINNER: last (or first) active declaration in total order wins; `properties` is the floor. */
function resolveDefault(host, child) {
  const plain = [];
  const expressions = [];
  for (const i of child.declaredBy ?? []) {
    if (!host.nextFragOn[i]) continue;
    const fragment = host.fragments[i];
    if (fragment.defaults && Object.hasOwn(fragment.defaults, child.name)) plain.push(fragment.defaults[child.name]);
    if (fragment.expressionDefaults && Object.hasOwn(fragment.expressionDefaults, child.name)) expressions.push(fragment.expressionDefaults[child.name]);
  }
  const pick = values => SWITCHES.DEFAULT_WINNER === 'first' ? values[0] : values.at(-1);
  const expression = expressions.length ? pick(expressions) : child.expressionDefault;
  if (expression !== undefined) return evalExpression(expression, expressionView(child.root));
  return plain.length ? pick(plain) : child.defaultValue;
}

// ----------------------------------------------------------------- P6 automatic-write layer (v4d)

/** A source reached by a caller's full replacement has no start state this settle (LOAD_EDGE). */
function markSourceLoaded(node) {
  if (node.loaded) return;
  node.loaded = true;
  node.root.loadedList.push(node);
}

/** A caller wrote this source in the current settle (EDGE_COMPARE 'write'); cleared at its commit. */
function markSourceWritten(node) {
  node.srcWritten = true;
}

/** Clear every load mark (host callerLoaded, source loaded). */
function clearLoaded(root) {
  const list = root.loadedList;
  if (list === null) return;
  for (let i = 0; i < list.length; i++) {
    list[i].callerLoaded = false;
    list[i].loaded = false;
  }
  list.length = 0;
}

/** Outermost entry ended: every logged automatic write becomes permanent. */
function endEntryScope(root) {
  if (root.autoLog !== null) root.autoLog.clear();
  clearLoaded(root);
}

const isAncestor = (a, n) => {
  for (let p = n.parent; p !== null; p = p.parent) if (p === a) return true;
  return false;
};

/**
 * A caller or listener wrote `node`: logged automatic writes on it, its
 * ancestors or its descendants stop being retractable (only non-empty under
 * AUTO_SCOPE 'entry', where the log outlives a commit).
 */
function noteCallerWrite(root, node) {
  const log = root.autoLog;
  if (log === null || log.size === 0) return;
  for (const n of log.keys()) if (n === node || isAncestor(n, node) || isAncestor(node, n)) log.delete(n);
}

/** Fragment on-set the transition edge compares with (EDGE_REF). */
function refFragOn(host) {
  return SWITCHES.EDGE_REF === 'entry' && host.entryFragEntry === host.root.entryId ? host.entryFragOn : host.fragOn;
}

const sameValue = (a, b) => a === b || (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null && deepEqual(a, b));

/**
 * Edge test of one injectTo rule (F11 / D-13): the source emit `e` of this
 * round against the edge reference. A loaded source follows LOAD_EDGE.
 * @returns {boolean} whether the rule fires this round
 */
function fires(rule, e) {
  const src = rule.from;
  if (src.loaded && SWITCHES.LOAD_EDGE !== 'ref') {
    const mode = SWITCHES.LOAD_EDGE;
    if (mode === 'skip') return false;
    if (mode === 'fill') {
      const entry = src.root.autoLog.get(rule.to);
      return entry !== undefined && entry.rule === rule ? entry.baseAbsent : isAbsent(rule.to);
    }
    return e !== MISSING;
  }
  const ref = SWITCHES.EDGE_REF === 'entry' && src.edgeRefEntry === src.root.entryId ? src.edgeRef : src.emit;
  if (SWITCHES.EDGE_COMPARE === 'write' && src.srcWritten) return true;
  return sameValue(e, ref) === false;
}

/** Commit of a source: keep its emit at the start of the entry (copy-on-write). */
function trackSourceRef(node, prevEmit) {
  const root = node.root;
  if (node.loaded && SWITCHES.LOAD_EDGE !== 'ref') {
    if (SWITCHES.AUTO_SCOPE === 'settle') {
      node.edgeRef = node.emit;
      node.edgeRefEntry = root.entryId;
    }
    return;
  }
  if (node.edgeRefEntry === root.entryId || prevEmit === node.emit) return;
  node.edgeRef = prevEmit;
  node.edgeRefEntry = root.entryId;
}

/** F13: fragments on in the previous commit first, then the rest, each in total order. */
function hintOrderOf(node) {
  const prev = node.fragOn;
  const order = [];
  for (let i = 0; i < prev.length; i++) if (prev[i] === 1) order.push(i);
  for (let i = 0; i < prev.length; i++) if (prev[i] === 0) order.push(i);
  return order;
}

/** Effective staged state of a subtree plus its ancestors' absent flags. */
function snapshot(node) {
  const recs = [];
  snapNode(node, recs);
  const anc = [];
  for (let p = node.parent; p !== null; p = p.parent) anc.push(p, p.absent);
  return { recs, anc };
}

function snapNode(n, recs) {
  const obj = n.kind === 'object';
  recs.push({ n, raw: rawOf(n), absent: n.absent, extras: obj ? extrasOf(n) : null, kids: n.kind === 'array' ? n.children.slice() : null });
  const kids = n.children;
  if (kids !== null) for (let i = 0; i < kids.length; i++) snapNode(kids[i], recs);
}

/** Stage a snapshot back (works before and after a commit: it is a staged write). */
function restore(snap) {
  const recs = snap.recs;
  for (let i = 0; i < recs.length; i++) {
    const r = recs[i];
    const n = r.n;
    if (r.kids !== null) restoreItems(n, r.kids);
    if (rawOf(n) !== r.raw) stageRaw(n, r.raw);
    else touch(n);
    n.absent = r.absent;
    if (n.kind !== 'object') continue;
    if (extrasOf(n) !== r.extras) {
      n.pendingExtras = r.extras;
      n.hasPendingExtras = true;
    }
  }
  const anc = snap.anc;
  for (let i = 0; i < anc.length; i += 2) if (anc[i + 1] === true && anc[i].children.every(isAbsent)) anc[i].absent = true;
}

function restoreItems(arr, saved) {
  const kids = arr.children;
  for (let i = 0; i < kids.length; i++) {
    if (saved.includes(kids[i])) continue;
    kids[i].detached = true;
    kids[i].parent = null;
  }
  kids.length = 0;
  for (let i = 0; i < saved.length; i++) {
    const k = saved[i];
    k.detached = false;
    k.parent = arr;
    k.pos = i;
    k.name = i;
    kids.push(k);
  }
}

/** Undo one logged automatic write; logged writes inside its subtree go with it. */
function retract(root, node) {
  const log = root.autoLog;
  const entry = log.get(node);
  log.delete(node);
  for (const n of log.keys()) if (isAncestor(node, n)) log.delete(n);
  restore(entry.snap);
  counters.retractions++;
  if (trace) lastSettle.retracted.push(pathOf(node));
}

/**
 * Stage an automatic write (full replacement of `node`) through the log. The
 * first write to a node retracts logged writes below it, then snapshots the
 * base; a re-write keeps the original base.
 * @param {object|null} rule the injectTo rule, null for a transition default
 * @param {object|null} host the host whose transition wants the default
 */
function autoWrite(root, node, value, rule, host) {
  const log = root.autoLog;
  let entry = log.get(node);
  if (entry === undefined) {
    const inside = [];
    for (const n of log.keys()) if (isAncestor(node, n)) inside.push(n);
    for (let i = 0; i < inside.length; i++) if (log.has(inside[i])) retract(root, inside[i]);
    entry = { rule, host, value, baseAbsent: isAbsent(node), snap: snapshot(node) };
    log.set(node, entry);
  } else {
    entry.rule = rule;
    entry.host = host;
    entry.value = value;
  }
  stagingDepth++;
  try {
    applyValue(node, value, false);
  } finally {
    stagingDepth--;
  }
}

/** Only a caller load creates a fresh fill opportunity for an existing host. */
function isLoaded(host) {
  return host.callerLoaded;
}

/** Plan missing-value candidates; births are confirmed only after joint convergence. */
function wantedDefaults(root, host) {
  const want = new Map();
  if (!existsInShape(host) || clearedInTree(root, host)) return want;
  for (const child of host.children) {
    const candidate = !wasInShape(child) && existsInShape(child);
    if (!candidate || root.cleared.has(child)) continue;
    if (!root.fillSeen.has(child)) {
      root.fillSeen.add(child);
      if (isAbsent(child)) {
        const value = resolveDefault(host, child);
        if (value !== undefined) root.fillValues.set(child, value);
      }
    }
    if (root.fillValues.has(child)) want.set(child, root.fillValues.get(child));
  }
  return want;
}

/** Evaluate the stage snapshot, resolve same-target winners, then stage writes. */
function reconcileDerive(root, sid, dryRun) {
  if (SWITCHES.EXPERIMENT) return experimentDerive(root, sid, dryRun);
  if (root.loadSuppressed) return false;
  const candidates = [];
  for (const kind of SWITCHES.DERIVE_ORDER) {
    if (kind === 'clearValue') {
      visitNodes(root, node => {
        if (node.clearExpression === undefined) return;
        node.clearNext = !!evalExpression(node.clearExpression, expressionView(root));
        if (node.clearNext && !node.clearWas) candidates.push({ to: node, value: undefined, kind, rule: node });
      });
      continue;
    }
    for (const rule of root.injections) {
      if ((rule.derived ? 'derived' : 'injectTo') !== kind) continue;
      const e = emitOf(rule.from, sid);
      if (edgeGated(rule) && !fires(rule, e)) continue;
      candidates.push({ to: rule.to, value: rule.map(valueOrUndefined(e)), kind, rule });
    }
  }
  const winners = new Map();
  for (const item of candidates) {
    if (SWITCHES.WRITE_CONFLICT === 'first' && winners.has(item.to)) continue;
    winners.set(item.to, item);
  }
  lastSettle.conflicts = candidates.length - winners.size;
  let wrote = false;
  if (SWITCHES.FINAL_SHAPE) {
    for (const [node, entry] of [...root.autoLog]) {
      if (entry.rule === null || entry.kind === 'clearValue' || winners.has(node)) continue;
      wrote = true;
      if (dryRun) return true;
      retract(root, node);
    }
  }
  for (const { to, value, rule, kind } of winners.values()) {
    if (kind === 'clearValue') {
      root.cleared.add(to);
      root.fillValues.delete(to);
    }
    const current = kind === 'clearValue' && isAbsent(to) ? undefined : to.kind === 'leaf' ? rawOf(to) : stagedTree(to);
    if (sameValue(value, current)) continue;
    wrote = true;
    if (dryRun) return true;
    autoWrite(root, to, value, rule, null);
    if (kind === 'clearValue') erase(to);
    root.autoLog.get(to).kind = kind;
  }
  return wrote;
}

/** Retract out-of-shape candidates, then plan parent-first fills and inherited overlays. */
function reconcileTransition(root, sid, dryRun, suppressInjection) {
  const hosts = [];
  visitNodes(root, node => { if (node.kind === 'object') hosts.push(node); });
  const log = root.autoLog;
  let wrote = false;
  for (const [node, entry] of [...log]) {
    if (!log.has(node) || entry.rule !== null || !root.fillValues.has(node) || existsInShape(node)) continue;
    if (dryRun) return true;
    retract(root, node);
    wrote = true;
  }
  if (wrote) return true;
  for (let h = 0; h < hosts.length; h++) {
    const host = hosts[h];
    if (host.kind !== 'object') continue;
    const want = suppressInjection ? null : wantedDefaults(root, host);
    if (want !== null) {
      for (const [c, v] of want) {
        if (log.has(c)) continue;
        wrote = true;
        if (dryRun) return true;
        counters.injections++;
        if (trace) lastSettle.injected.push(`${pathOf(c)}=${JSON.stringify(v)}`);
        autoWrite(root, c, v, null, host);
      }
    }
    const frags = host.fragments;
    const now = host.nextFragOn;
    for (let i = 0; i < frags.length; i++) {
      const overlays = frags[i].overlays;
      for (let k = 0; k < overlays.length; k++) {
        const child = host.index.get(overlays[k].host);
        const seen = fragOnOf(child, sid);
        const childIdx = child.fragments.findIndex((f) => f.inherited && f.owner === host && f.ownerIdx === i);
        if (seen[childIdx] === now[i]) continue;
        wrote = true;
        if (dryRun) return true;
        touch(child);
      }
    }
  }
  return wrote;
}

// ----------------------------------------------------------------- v4e: budget commit, provenance

/** Logged automatic writes about to be committed, for provenance checks. */
function autoEntries(root) {
  const out = [];
  for (const [n, e] of root.autoLog) {
    out.push({ path: pathOf(n), value: e.value, kind: e.kind ?? (e.rule === null ? 'default' : e.rule.derived === true ? 'derived' : 'injectTo'), host: e.host === null ? null : pathOf(e.host) });
  }
  return out;
}

// ----------------------------------------------------------------- commit / settle

function payloadOf(node, prevLocal, prevEmit) {
  const cur = node.kind === 'leaf' ? valueOrUndefined(node.emit) : { local: valueOrUndefined(node.local), emit: valueOrUndefined(node.emit) };
  const prev = node.kind === 'leaf' ? valueOrUndefined(prevEmit) : { local: valueOrUndefined(prevLocal), emit: valueOrUndefined(prevEmit) };
  return { previous: prev, current: cur, refresh: (node.signals & REFRESH) !== 0, settle: node.settle === null ? undefined : { ...node.settle } };
}

const valueOrUndefined = (v) => (v === MISSING ? undefined : v);

/** Apply staged raw / extras / memos; collect changed nodes in tree order. */
function commit(node, sid, out, signalOnly) {
  let changed = false;
  if (node.controlNext !== null) {
    changed = !sameValue(node.controls, node.controlNext);
    node.controls = node.controlNext;
  }
  if (node.clearExpression !== undefined) node.clearWas = !!evalExpression(node.clearExpression, expressionView(node.root));
  if (node.hasPending) {
    node.raw = node.pendingRaw;
    node.hasPending = false;
    node.pendingRaw = undefined;
    if (node.kind === 'leaf' && node.raw !== node.reported) {
      node.signals |= REFRESH;
      if (trace) lastSettle.refreshed.push(pathOf(node));
    }
  }
  if (node.hasPendingExtras) {
    node.extras = node.pendingExtras;
    node.hasPendingExtras = false;
    node.pendingExtras = null;
  }
  const prevLocal = node.local;
  const prevEmit = node.emit;
  if (node.stamp === sid) {
    if (node.local !== node.nextLocal || node.emit !== node.nextEmit) changed = true;
    node.local = node.nextLocal;
    node.emit = node.nextEmit;
    node.localKeys = node.nextLocalKeys;
  }
  if (node.isSource && node.stamp === sid) {
    trackSourceRef(node, prevEmit);
    node.srcWritten = false;
  }
  if (node.settle !== null && node.stamp === sid) {
    const s = node.settle;
    const n = node.nextSettle;
    if (s.status !== n.status || s.sweeps !== n.sweeps) {
      s.status = n.status;
      s.sweeps = n.sweeps;
      changed = true;
    }
  }
  if (node.kind === 'object' && node.fragStamp === sid) {
    if (SWITCHES.EDGE_REF === 'entry' && node.entryFragEntry !== node.root.entryId && sameOn(node.fragOn, node.nextFragOn) === false) {
      node.entryFragOn.set(node.fragOn);
      node.entryFragEntry = node.root.entryId;
    }
    const tmp = node.fragOn;
    node.fragOn = node.nextFragOn;
    node.nextFragOn = tmp;
    const cond = node.conditionalKids;
    for (let i = 0; i < cond.length; i++) cond[i].active = cond[i].actNext;
  }
  node.replaced = false;
  node.dirty = false;
  if (changed || node.signals !== 0) {
    const wants = node.listeners !== null || node.parent === null;
    const entry = { node, payload: wants ? payloadOf(node, prevLocal, prevEmit) : null };
    if (changed) out.push(entry);
    else signalOnly.push(entry);
  }
  if (node.children !== null) {
    const kids = node.dirtyKids;
    for (let i = 0; i < kids.length; i++) {
      const k = kids[i];
      if (k.detached) {
        k.dirty = false;
        continue;
      }
      commit(k, sid, out, signalOnly);
    }
    kids.length = 0;
  }
}

/**
 * One settle: rounds of compute -> derive -> transition until nothing is
 * staged (cap 25; the round past the cap is not executed), then commit,
 * then notify (B). Dev mode throws after the notification when a budget was
 * exceeded; production only records it in `settle`.
 */
function settle(root) {
  const sid = ++SID;
  if (SWITCHES.EXPERIMENT) beginExperiment(root);
  counters.settles++;
  lastSettle.rounds = 0;
  lastSettle.sweeps = 0;
  lastSettle.budgetExceeded = false;
  lastSettle.hostExceeded = false;
  lastSettle.maxSweepsOnOneHost = 0;
  lastSettle.injected = [];
  lastSettle.refreshed = [];
  const suppress = root.loadSuppressed === true;
  root.fillSeen.clear();
  root.fillValues.clear();
  root.cleared.clear();
  const base = snapshot(root);
  const sweeps0 = counters.sweeps;
  const finalShape = SWITCHES.FINAL_SHAPE;
  lastSettle.retracted = [];
  let exceeded = false;
  inSettle = true;
  try {
    for (;;) {
      lastSettle.rounds++;
      counters.rounds++;
      root.computedHosts.length = 0;
      if (root.schemaMode) { updateControls(root); markAllFresh(root); }
      compute(root, sid);
      const atCap = lastSettle.rounds >= SWITCHES.ROUND_CAP;
      let wrote;
      wrote = reconcileDerive(root, sid, atCap);
      if (wrote === false) wrote = reconcileTransition(root, sid, atCap, suppress);
      for (let i = 0; i < root.replacedHosts.length; i++) root.replacedHosts[i].replaced = false;
      root.replacedHosts.length = 0;
      if (atCap) {
        exceeded = wrote;
        break;
      }
      if (wrote === false) break;
    }
    lastSettle.budgetCommit = exceeded ? (finalShape && SWITCHES.COMMIT_ON_BUDGET === 'base' ? 'base' : 'lastRound') : '';
    if (lastSettle.budgetCommit === 'base') {
      restore(base);
      root.autoLog.clear();
      root.computedHosts.length = 0;
      if (root.schemaMode) { updateControls(root); markAllFresh(root); }
      compute(root, sid);
    }
    lastSettle.autoAtCommit = finalShape ? autoEntries(root) : [];
  } finally {
    inSettle = false;
    if (SWITCHES.AUTO_SCOPE === 'settle') root.autoLog.clear();
  }
  lastSettle.sweeps = counters.sweeps - sweeps0;
  lastSettle.budgetExceeded = exceeded || lastSettle.hostExceeded;
  lastSettle.budgetWhich = exceeded ? 'rounds' : lastSettle.hostExceeded ? 'host' : '';
  lastSettle.birthsAtCommit = [];
  if (!lastSettle.budgetExceeded) visitNodes(root, node => {
    const born = !wasInShape(node) && existsInShape(node);
    if (born) lastSettle.birthsAtCommit.push(pathOf(node));
  });
  const out = [];
  const signalOnly = [];
  commit(root, sid, out, signalOnly);
  visitNodes(root, node => { node.shapePresent = existsInShape(node); });
  if (SWITCHES.AUTO_SCOPE === 'settle') clearLoaded(root);
  const rs = root.settle;
  const status = lastSettle.budgetExceeded ? 'budget-exceeded' : rs.status;
  if (rs.status !== status) {
    rs.status = status;
    if (out.length === 0 || out[0].node !== root) out.unshift({ node: root, payload: payloadOf(root, root.local, root.emit) });
    else out[0].payload.settle = { ...rs };
  }
  rs.rounds = lastSettle.rounds;
  root.commitNumber++;
  root.entrySettles++;
  for (let i = 0; i < signalOnly.length; i++) out.push(signalOnly[i]);
  root.loadSuppressed = false;
  dispatch(root, out);
  if (root.options.dev && lastSettle.budgetExceeded) {
    throw new Error(`budget exceeded: rounds=${lastSettle.rounds} hostExceeded=${lastSettle.hostExceeded}`);
  }
}

// ----------------------------------------------------------------- notify (B)

/** True when `node` no longer hangs from `root` (itself or an ancestor detached). */
function isDetached(node, root) {
  let n = node;
  while (n.parent !== null) n = n.parent;
  return n !== root;
}

/**
 * Root dispatcher (B3): the delivery set is fixed per commit and delivered
 * top -> down; a node's revision rises right before its listeners; a
 * listener's write settles immediately and its notification is the next
 * wave; detached nodes are skipped; each listener call is isolated.
 */
function dispatch(root, entries) {
  if (root.dispatching) {
    for (let i = 0; i < entries.length; i++) root.waveQueue.push(entries[i]);
    return;
  }
  root.dispatching = true;
  lastSettle.waves = 0;
  lastSettle.wavesExceeded = false;
  lastSettle.delivered = [];
  lastSettle.errors = [];
  try {
    let wave = entries;
    for (;;) {
      lastSettle.waves++;
      counters.waves++;
      if (lastSettle.waves > WAVE_CAP) lastSettle.wavesExceeded = true;
      for (let i = 0; i < wave.length; i++) {
        const { node, payload } = wave[i];
        if (isDetached(node, root)) {
          node.signals = 0;
          continue;
        }
        node.revision++;
        node.signals = 0;
        counters.notifications++;
        if (trace) lastSettle.delivered.push({ wave: lastSettle.waves, path: pathOf(node) });
        if (payload === null) continue;
        const listeners = node.listeners;
        if (listeners === null) continue;
        for (let k = 0; k < listeners.length; k++) {
          try {
            listeners[k](payload, node);
          } catch (e) {
            lastSettle.errors.push({ path: pathOf(node), error: e });
          }
        }
      }
      if (root.waveQueue.length === 0) break;
      wave = root.waveQueue;
      root.waveQueue = [];
    }
  } finally {
    root.dispatching = false;
    root.settle.waves = lastSettle.waves;
    root.entryWaves += lastSettle.waves;
  }
  if (lastSettle.wavesExceeded) {
    root.settle.status = 'wave-cap-exceeded';
    if (root.options.dev) throw new Error(`wave cap exceeded: waves=${lastSettle.waves}`);
  }
}

// ----------------------------------------------------------------- reads

/** Committed emit (`getValue()`); `undefined` when omitted. */
export function valueOf(node) {
  return node.emit === MISSING ? undefined : node.emit;
}

/** Committed local (`node.value`); `undefined` when omitted. */
export function localValueOf(node) {
  return node.local === MISSING ? undefined : node.local;
}

/** Fragment ids currently on, for reports. */
export function activeIds(host) {
  const out = [];
  for (let i = 0; i < host.fragments.length; i++) if (host.fragOn[i] === 1) out.push(host.fragments[i].id);
  return out;
}

/** Raw tree as plain data (`undefined` = absent), for reports. */
export function rawTree(node) {
  if (node.kind === 'leaf') return node.raw;
  if (node.raw !== undefined) return node.raw;
  if (node.kind === 'array') return node.children.map(rawTree);
  const out = {};
  for (const c of node.children) out[c.name] = rawTree(c);
  if (node.extras !== null) for (const k of Object.keys(node.extras)) out[k] = node.extras[k];
  return out;
}

// Canonical extension source; make-v5.mjs appends this to the generated module.
/** Visit allocated nodes in document order. */
function visitNodes(node, fn) {
  fn(node);
  for (const child of node.children ?? []) visitNodes(child, fn);
}

/** Staged raw view for reserved expressions; JSON Schema guards use projected G. */
function stagedTree(node) {
  if (node.kind === 'leaf' || rawOf(node) !== undefined) return rawOf(node);
  if (node.kind === 'array') return node.children.map(stagedTree);
  const value = {};
  for (const child of node.children) {
    const v = stagedTree(child);
    if (v !== undefined) value[child.name] = v;
  }
  return Object.assign(value, extrasOf(node));
}
const expressionView = root => stagedTree(root);
const evalExpression = (expression, value) => typeof expression === 'function' ? expression(value) : expression;
const controlKeys = ['active', 'visible', 'readOnly', 'disabled'];

/** Fragment gates and, in shape mode, node controls gate the entire subtree. */
function existsInShape(node) {
  for (let n = node; n !== null; n = n.parent) {
    if (n.conditional && !n.actNext) return false;
    if (SWITCHES.NODE_GATE_UNIT === 'shape' && n.controlNext?.active === false) return false;
  }
  return true;
}

/** Caller loads start a new lifetime; runtime writes compare the previous commit. */
function wasInShape(node) {
  for (let n = node; n !== null; n = n.parent) if (isLoaded(n)) return false;
  return node.shapePresent;
}

/** Clearing an object consumes fill for its descendants in the same settle. */
function clearedInTree(root, node) {
  for (let n = node; n !== null; n = n.parent) if (root.cleared.has(n)) return true;
  return false;
}

/** control.foo wins over &foo on the same declaration. */
export function controlOption(schema, key) {
  return schema?.control && Object.hasOwn(schema.control, key) ? schema.control[key] : schema?.[`&${key}`];
}

/** Omitted keys do not override inherited values. */
function combineControls(layers, value) {
  const result = { active: true, visible: true, readOnly: false, disabled: false };
  for (const layer of layers) {
    for (const key of controlKeys) {
      const expr = controlOption(layer, key) ?? layer?.[key];
      if (expr === undefined) continue;
      const v = !!evalExpression(expr, value);
      result[key] = SWITCHES.CONTROL_COMBINE === 'nearest' ? v :
        key === 'active' || key === 'visible' ? result[key] && v : result[key] || v;
    }
  }
  return result;
}

/** Compute scope controls without writing values. */
function updateControls(root) {
  const value = expressionView(root);
  const walk = (node, inherited) => {
    const layers = [...inherited];
    for (const scope of node.controlLayers) if (scope.when(value)) layers.push(scope.schema);
    if (node.parent) {
      const children = controlOption(node.parent.schema, 'children');
      if (children?.[node.name]) layers.push(children[node.name]);
    }
    layers.push(node.schema);
    node.controlNext = combineControls(layers, value);
    for (const child of node.children ?? []) walk(child, layers);
  };
  walk(root, [root.options.form ?? {}]);
}

/** Schema-mode full traversal: this spike does not build a dependency index. */
function markAllFresh(node) {
  node.dirty = true;
  if (!node.children) return;
  node.dirtyKids = node.children.slice();
  for (const child of node.children) markAllFresh(child);
}

/** Configure schema-mode bookkeeping before loading values. */
export function configureSchema(root, schema, options = {}) {
  ensureRoot(root);
  root.schemaMode = true;
  root.schema = schema;
  Object.assign(root.options, options);
  return root;
}

/** Each trial settle owns an event queue; the original v5 path is unchanged when disabled. */
function beginExperiment(root) {
  root.experiment = { seen: new Map(), clearSeen: new Map(), pending: new Map(),
    offers: [], attempts: [], sequence: 0, ruleIds: new Map() };
  root.injections.forEach((rule, index) => root.experiment.ruleIds.set(rule, index));
}

/** JSON-safe experiment trace; values use an explicit missing marker. */
export function experimentTrace(root) {
  const state = root.experiment;
  const value = v => v === undefined ? { missing: true } : { value: v };
  return {
    offers: state.offers.map(item => ({ id: item.id, kind: item.kind, target: pathOf(item.to),
      source: item.kind === 'clearValue' ? null : pathOf(item.rule.from), order: item.order,
      value: value(item.value), sourceValue: value(item.sourceValue), bornRound: item.bornRound,
      appliedRound: item.appliedRound ?? null, dropped: item.dropped ?? false,
      superseded: item.superseded ?? false })),
    attempts: state.attempts,
  };
}

/** A higher score wins; equal kinds use later schema declaration, never target traversal order. */
function experimentPriority(item) {
  if (item.kind === 'clearValue') return SWITCHES.CLEAR_PRIORITY === 'clear-wins' ? 2 : -1;
  if (SWITCHES.WRITE_CONFLICT === 'inject-wins') return item.kind === 'injectTo' ? 1 : 0;
  if (SWITCHES.WRITE_CONFLICT === 'derived-wins') return item.kind === 'derived' ? 1 : 0;
  return 0;
}

/** Consume a winner once; retry queued losses or unconsumed inject edges in the next round. */
function experimentDerive(root, sid, dryRun) {
  if (root.loadSuppressed) return false;
  const state = root.experiment;
  const candidates = new Map(state.pending);
  const offer = (rule, to, kind, value, sourceValue, order) => {
    const previous = candidates.get(rule);
    if (previous) previous.superseded = true;
    const item = { id: ++state.sequence, rule, to, kind, value, sourceValue, order,
      bornRound: lastSettle.rounds };
    state.offers.push(item);
    candidates.set(rule, item);
  };
  for (const rule of root.injections) {
    const e = emitOf(rule.from, sid);
    const changed = state.seen.has(rule) ? !sameValue(e, state.seen.get(rule)) :
      !edgeGated(rule) || fires(rule, e);
    state.seen.set(rule, e);
    if (changed) offer(rule, rule.to, rule.derived ? 'derived' : 'injectTo',
      rule.map(valueOrUndefined(e)), valueOrUndefined(e), rule.order ?? state.ruleIds.get(rule));
  }
  visitNodes(root, node => {
    if (node.clearExpression === undefined) return;
    const condition = !!evalExpression(node.clearExpression, expressionView(root));
    let loaded = false;
    for (let n = node; n; n = n.parent) loaded ||= isLoaded(n);
    const previous = state.clearSeen.has(node) ? state.clearSeen.get(node) :
      SWITCHES.LOAD_EDGE_CLEAR === 'rising' && loaded ? false : node.clearWas;
    state.clearSeen.set(node, condition);
    if (condition && !previous) offer(node, node, 'clearValue', undefined, condition, node.clearOrder ?? -1);
  });
  const winners = new Map();
  for (const item of candidates.values()) {
    const previous = winners.get(item.to);
    if (!previous || experimentPriority(item) > experimentPriority(previous) ||
      experimentPriority(item) === experimentPriority(previous) && item.order > previous.order) winners.set(item.to, item);
  }
  const next = new Map();
  let wrote = false;
  for (const item of candidates.values()) {
    const winner = winners.get(item.to);
    const won = winner === item;
    const consumed = won || item.kind !== 'injectTo' || SWITCHES.EDGE_CONSUMED_ON_LOSS;
    const retry = !won && (SWITCHES.LOSER_FATE === 'requeued' || !consumed);
    state.attempts.push({ round: lastSettle.rounds, offer: item.id, winner: winner.id,
      won, consumed, retry, dryRun });
    if (!won) {
      if (retry) next.set(item.rule, item);
      else if (!dryRun) item.dropped = true;
      continue;
    }
    const current = item.kind === 'clearValue' && isAbsent(item.to) ? undefined :
      item.to.kind === 'leaf' ? rawOf(item.to) : stagedTree(item.to);
    const changed = !sameValue(item.value, current);
    wrote ||= changed;
    if (dryRun) continue;
    item.appliedRound = lastSettle.rounds;
    if (item.kind === 'clearValue') {
      root.cleared.add(item.to);
      root.fillValues.delete(item.to);
    }
    if (changed) {
      autoWrite(root, item.to, item.value, item.rule, null);
      if (item.kind === 'clearValue') erase(item.to);
      root.autoLog.get(item.to).kind = item.kind;
    }
  }
  if (!dryRun) state.pending = next;
  lastSettle.conflicts = candidates.size - winners.size;
  return wrote || next.size > 0;
}
