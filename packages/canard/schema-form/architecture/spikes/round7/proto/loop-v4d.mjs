/**
 * Prototype of the round-4 work loop (reviews/round-4-spec.md §A "3.1판") and
 * event system (§B). Derived from loop-v3.mjs; the differences that matter:
 *
 *  - compute never writes raw. Default injection is a transition-stage event
 *    (E1): after each round the host's newly-on fragments (vs the previous
 *    COMMIT) and the hosts that received a full replacement inject `default`
 *    into ABSENT children, which stages writes and costs a derive round.
 *  - guard input G is the projected emit-equivalent of the host's local
 *    composed from the current A; a host whose own raw is a non-object sees {}.
 *  - option B (a guard that turns false turns its fragment off); cap =
 *    fragments + 1; `settle = {status, sweeps}` per host.
 *  - fragments form a tree: nested fragments are traversed only while their
 *    enclosing fragment is on in the same sweep.
 *  - inherited overlays (A4-6): a parent fragment's overlay is a fragment of
 *    the child host whose on-state is the parent's; when the parent's sweep
 *    changes it the child is re-dirtied (another round).
 *  - no prohibition fragments (D-3 (iii)).
 *  - a null / non-object host is a full replacement: children raw erased,
 *    load contract injects defaults, emit = raw, a partial write into a child
 *    clears the host raw (A5).
 *  - `selection` (select-guard unions), `extras` (undeclared keys), the
 *    `disableDefaultInjection` form option (A2), RequestRefresh rule (A6).
 *  - every write outside `batch` settles and notifies synchronously (B2);
 *    root dispatcher with waves, revision, isolation, detached skip (B3).
 *
 * v4c (this file; loop-v4.mjs is untouched) — D-10 (c) / F31, round-5 C-9:
 *  - an ENTRY is one call of a public write API made while no other public
 *    write API of the same root is on the stack: `setValue`, `write`,
 *    `select`, `removeKey`, `push`, `remove`, `batch` (and `reset`/`prime`,
 *    which call `setValue`). Each keeps `root.entryDepth`; a write made by a
 *    listener during a wave, or inside `batch(fn)`, sits at depth >= 2.
 *  - `root.onChange` fires ONCE when the depth returns to 0, after the last
 *    wave, with the final emit, iff the emit reference differs from the one
 *    at entry; `root.onValidate(commitNumber)` is requested once per such
 *    entry, right before `onChange`. Neither is called per wave any more.
 *  - a write inside `onChange` finds depth 0 and is therefore a NEW entry:
 *    it fires its own `onChange` (nested on the stack). The nesting is
 *    capped at WAVE_CAP (`settle.status = 'onchange-cap-exceeded'`, dev
 *    throws); the write itself is still applied.
 *  - `root.commitNumber` (F28) rises once per commit of that root.
 *
 * v4d (round 7; loop-v4c.mjs is untouched) — proposed principle P6 "automatic
 * writes are a function of the settle's FINAL shape; history is read only as a
 * trigger". Every change sits behind a field of SWITCHES; OLD_SWITCHES
 * reproduces v4c. New behaviour (defaults):
 *  - FINAL_SHAPE (D-12 a): transition defaults and injectTo writes go through a
 *    retractable log (node -> base snapshot). Every round recomputes the wanted
 *    automatic writes from the CURRENT shape; a logged write no longer wanted is
 *    retracted (its subtree restored), a changed one re-applied. The settle ends
 *    when a round wants no change; a log still changing at ROUND_CAP commits the
 *    last completed round and reports status 'budget-exceeded' (budgetWhich
 *    'rounds').
 *  - AUTO_SCOPE: 'settle' drops the log before commit; 'entry' keeps it until the
 *    outermost entry ends, so a later settle of the same entry may retract an
 *    automatic write an earlier settle committed. A caller/listener write to a
 *    logged node, its ancestor or descendant makes that write permanent.
 *  - EDGE_REF (D-13 a): the edge reference of transitions (fragment off -> on)
 *    and of injectTo is the state at the start of the outermost entry
 *    (copy-on-write at commit), not the previous commit.
 *  - INJECT_TO_EDGE: injectTo fires only when its source emit differs from the
 *    edge reference (F11, native; v4c fired whenever the mapped value differed).
 *  - LOAD_EDGE: a source inside a caller's full replacement of a host (mount,
 *    reset, setValue Overwrite) has no start state: 'fire' treats it as changed
 *    from MISSING, 'skip' never fires in that settle, 'fill' fires only into an
 *    absent target, 'ref' applies no load rule (the edge reference as for any
 *    write; comparison value only).
 *  - ORDER_HINT (F13, default off): fragments on in the previous commit are
 *    evaluated first in each sweep.
 *  - SELECT_RULE 'score' (D-14 a): initial selection = most declared keys
 *    present; zero keys -> NO_SELECTION (ADR 0002 rule 1); TIE_MODE picks the
 *    first branch or none. required is never read (v4c never read it either).
 *
 * Node kinds: leaf | object | array. Absent = raw `undefined`.
 */

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

/**
 * v4d behaviour switches (round 7, P6). Defaults are the new behaviour;
 * {@link OLD_SWITCHES} reproduces loop-v4c.mjs. Read at call time: flip them
 * between trees, never while a settle runs.
 */
export const SWITCHES = {
  /** D-12 (a): automatic writes are reconciled against the final shape through a retractable log. false = v4c. */
  FINAL_SHAPE: true,
  /** Lifetime of the retractable log: 'settle' (dropped before commit) | 'entry' (until the outermost entry ends). */
  AUTO_SCOPE: 'settle',
  /** D-13: edge reference of transitions and injectTo: 'entry' (outermost entry start) | 'commit' (previous commit, v4c). */
  EDGE_REF: 'entry',
  /** injectTo fires only when the source emit differs from the edge reference. false = v4c (fires whenever the mapped value differs). */
  INJECT_TO_EDGE: true,
  /** injectTo for a source inside a caller's full replacement: 'fire' | 'skip' | 'fill' | 'ref' (no load rule: compare with the edge reference as for any write). */
  LOAD_EDGE: 'fire',
  /** F13: evaluate fragments on in the previous commit first. */
  ORDER_HINT: false,
  /** Initial selection of select-guard unions: 'score' (D-14 a + ADR 0002 rule 1) | 'v4c'. */
  SELECT_RULE: 'score',
  /** Tie under 'score': 'first' declared branch | 'none'. */
  TIE_MODE: 'first',
};

/** Switch values that reproduce loop-v4c.mjs. */
export const OLD_SWITCHES = Object.freeze({
  FINAL_SHAPE: false,
  AUTO_SCOPE: 'settle',
  EDGE_REF: 'commit',
  INJECT_TO_EDGE: false,
  LOAD_EDGE: 'fire',
  ORDER_HINT: false,
  SELECT_RULE: 'v4c',
  TIE_MODE: 'first',
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

/** selection of a select-guard host with no branch on (loop-v4b's constant). */
export const NO_SELECTION = -1;

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
    raw: undefined,
    pendingRaw: undefined,
    hasPending: false,
    reported: NOREPORT,
    selection: 0,
    initialSelection: 0,
    pendingSelection: 0,
    hasPendingSelection: false,
    selectBranches: 0,
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
  node.options = { dev: false, disableDefaultInjection: false };
  node.injections = [];
  node.autoLog = new Map();
  node.loadedList = [];
  setRoot(node, node);
  return node;
}

/**
 * Declare the fragment tree of an object host in total order.
 * @param {object} host object node
 * @param {Array<Fragment>} fragments in keyword-rank / index order; each is
 *   `{guard?, select?, declares?, defaults?, children?, overlays?, rank?}`.
 *   `guard(G)` reads the projected local; `select: i` makes the fragment on
 *   iff `host.selection === i` (select-guard union); `declares` names the
 *   children that exist only while the fragment is on; `defaults` maps a
 *   declared name to the default THIS declaration carries; `children` are
 *   nested fragments traversed only while this one is on; `overlays` are
 *   `{host: childName, declares, defaults}` inherited by the child host
 *   (A4-6). `rank` sorts siblings before their array index.
 */
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
        select: f.select,
        declares: f.declares ?? [],
        defaults: f.defaults ?? null,
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
        select: undefined,
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
  host.selectBranches = flat.filter((f) => f.select !== undefined).length;
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
const selectionOf = (n) => (n.hasPendingSelection ? n.pendingSelection : n.selection);
const extrasOf = (n) => (n.hasPendingExtras ? n.pendingExtras : n.extras);
const fragOnOf = (n, sid) => (n.fragStamp === sid ? n.nextFragOn : n.fragOn);

function markReplaced(host) {
  if (inSettle === false && host.callerLoaded === false && SWITCHES.FINAL_SHAPE) {
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

/** Erase a subtree's raw (absent), extras and selection — "V에 없는 자식". */
function erase(node) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);
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
    if (node.selectBranches > 0) {
      node.pendingSelection = SWITCHES.SELECT_RULE === 'score' ? NO_SELECTION : 0;
      node.hasPendingSelection = true;
    }
  }
  markReplaced(node);
  const kids = node.children;
  for (let i = 0; i < kids.length; i++) erase(kids[i]);
}

/** "값 키를 가장 많이 선언한 분기, 동점이면 앞의 분기" (A7). */
function initialSelection(host, value) {
  if (SWITCHES.SELECT_RULE === 'score') return scoreSelection(host, value);
  let best = 0;
  let bestCount = -1;
  const frags = host.fragments;
  for (let i = 0; i < frags.length; i++) {
    const f = frags[i];
    if (f.select === undefined) continue;
    let count = 0;
    for (const name of f.declares) if (Object.hasOwn(value, name)) count++;
    if (count > bestCount) {
      bestCount = count;
      best = f.select;
    }
  }
  return best;
}

/**
 * D-14 (a): score = declared keys of the branch present in the value; the
 * highest score wins; zero everywhere -> NO_SELECTION (ADR 0002 rule 1); a tie
 * at the top -> first declared branch, or NO_SELECTION under TIE_MODE 'none'.
 * Never reads required.
 * @returns {number} the branch index or NO_SELECTION
 */
function scoreSelection(host, value) {
  let best = NO_SELECTION;
  let bestCount = 0;
  let tie = false;
  const frags = host.fragments;
  for (let i = 0; i < frags.length; i++) {
    const f = frags[i];
    if (f.select === undefined) continue;
    let count = 0;
    for (const name of f.declares) if (Object.hasOwn(value, name)) count++;
    if (count > bestCount) {
      bestCount = count;
      best = f.select;
      tie = false;
    } else if (count === bestCount && count > 0) tie = true;
  }
  return tie && SWITCHES.TIE_MODE === 'none' ? NO_SELECTION : best;
}

function applyValue(node, value, merge) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);
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
      if (node.selectBranches > 0 && SWITCHES.SELECT_RULE === 'score') {
        node.pendingSelection = NO_SELECTION;
        node.hasPendingSelection = true;
      }
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
    if (node.selectBranches > 0) {
      node.pendingSelection = initialSelection(node, value);
      node.hasPendingSelection = true;
    }
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
  const root = enter(node);
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

/** Select a branch of a select-guard union host (A7). */
export function select(host, branch) {
  const root = enter(host);
  let ok = false;
  try {
    noteCallerWrite(root, host);
    host.pendingSelection = branch;
    host.hasPendingSelection = true;
    touch(host);
    autoSettle(host);
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
 * Full replacement with the initial value (`reset()`): also restores the
 * initial selection of every select-guard host.
 */
export function reset(root) {
  setValue(root, root.initialValue);
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
  if (activeSame && prev !== MISSING && node.hasPendingExtras === false) {
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
    if (c.conditional && c.actNext === false) continue;
    const m = emitOf(c, sid);
    if (m === MISSING) continue;
    out[c.name] = m;
    keys.push(c.name);
  }
  if (extras !== null) {
    for (const k of Object.keys(extras)) {
      out[k] = extras[k];
      keys.push(k);
    }
  }
  node.nextLocalKeys = keys;
  return keys.length > 16 ? normalize(out) : out;
}

/**
 * One sweep: every fragment in tree order against G composed from the
 * CURRENT A — a fragment that turns on or off recomposes G before the next
 * guard (this is what makes a forward chain resolve in one sweep). A nested
 * fragment is traversed only when its enclosing fragment is on in this same
 * sweep; inherited overlays take the owner's current state; select
 * fragments read `selection`.
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
    else if (f.select !== undefined) v = selectionOf(node) === f.select ? 1 : 0;
    else {
      counters.guards++;
      v = f.guard(nonObject ? EMPTY_LOCAL : node.nextLocal) ? 1 : 0;
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

/**
 * derive (A3): injectTo rules in declaration order; each is a full
 * replacement of its target when the mapped value differs. `dryRun` only
 * reports whether a write would happen (the round past the cap is not
 * executed).
 */
function derive(root, sid, dryRun) {
  const rules = root.injections;
  let wrote = false;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const e = emitOf(rule.from, sid);
    if (SWITCHES.INJECT_TO_EDGE && fires(rule, e) === false) continue;
    const v = rule.map(e === MISSING ? undefined : e);
    const to = rule.to;
    const current = to.kind === 'leaf' ? rawOf(to) : emitOf(to, sid);
    if (to.kind === 'leaf' ? v === current : deepEqual(v, current === MISSING ? undefined : current)) continue;
    wrote = true;
    if (dryRun) return true;
    stagingDepth++;
    try {
      applyValue(to, v, false);
    } finally {
      stagingDepth--;
    }
  }
  return wrote;
}

/** Last active declaration in total order wins; `properties` is the floor. */
function resolveDefault(host, child) {
  let d = child.defaultValue;
  const by = child.declaredBy;
  if (by === null) return d;
  const on = host.nextFragOn;
  for (let i = 0; i < by.length; i++) {
    const idx = by[i];
    if (on[idx] === 0) continue;
    const defaults = host.fragments[idx].defaults;
    if (defaults !== null && Object.hasOwn(defaults, child.name)) d = defaults[child.name];
  }
  return d;
}

function inject(host, child, dryRun) {
  const d = resolveDefault(host, child);
  if (d === undefined) return false;
  if (dryRun) return true;
  counters.injections++;
  if (trace) lastSettle.injected.push(`${pathOf(child)}=${JSON.stringify(d)}`);
  stagingDepth++;
  try {
    applyValue(child, d, false);
  } finally {
    stagingDepth--;
  }
  return true;
}

/**
 * transition (A3, E1): for each host computed this round, fragments that
 * went off -> on since the previous COMMIT (or every on fragment of a host
 * that received a full replacement) inject `default` into ABSENT declared
 * children; a replaced host also injects unconditional defaults. Overlay
 * owners whose state differs from what the child computed with re-dirty the
 * child. Returns whether anything was (or would be) staged.
 */
function transition(root, sid, dryRun, suppressInjection) {
  const hosts = root.computedHosts;
  let wrote = false;
  for (let h = 0; h < hosts.length; h++) {
    const host = hosts[h];
    if (host.kind !== 'object') continue;
    const frags = host.fragments;
    const now = host.nextFragOn;
    const was = refFragOn(host);
    if (suppressInjection === false) {
      for (let i = 0; i < frags.length; i++) {
        if (now[i] === 0) continue;
        if (was[i] === 1 && host.replaced === false) continue;
        const declares = frags[i].declares;
        for (let j = 0; j < declares.length; j++) {
          const c = host.index.get(declares[j]);
          if (isAbsent(c) && inject(host, c, dryRun)) {
            wrote = true;
            if (dryRun) return true;
          }
        }
      }
      if (host.replaced) {
        const kids = host.children;
        for (let i = 0; i < kids.length; i++) {
          const c = kids[i];
          if (c.conditional || isAbsent(c) === false) continue;
          if (inject(host, c, dryRun)) {
            wrote = true;
            if (dryRun) return true;
          }
        }
      }
    }
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

// ----------------------------------------------------------------- P6 automatic-write layer (v4d)

/** A source reached by a caller's full replacement has no start state this settle (LOAD_EDGE). */
function markSourceLoaded(node) {
  if (node.loaded) return;
  node.loaded = true;
  node.root.loadedList.push(node);
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
  recs.push({ n, raw: rawOf(n), absent: n.absent, extras: obj ? extrasOf(n) : null, selection: obj ? selectionOf(n) : 0, kids: n.kind === 'array' ? n.children.slice() : null });
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
    if (n.selectBranches > 0 && selectionOf(n) !== r.selection) {
      n.pendingSelection = r.selection;
      n.hasPendingSelection = true;
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

/** Absent before the transition layer: a logged default does not count as a value. */
function baseAbsent(root, c) {
  const entry = root.autoLog.get(c);
  return entry !== undefined && entry.rule === null ? true : isAbsent(c);
}

/** A caller full replacement, or an injectTo write logged on it or an ancestor. */
function isLoaded(host) {
  if (host.callerLoaded) return true;
  const log = host.root.autoLog;
  if (log.size === 0) return false;
  for (let n = host; n !== null; n = n.parent) {
    const e = log.get(n);
    if (e !== undefined && e.rule !== null) return true;
  }
  return false;
}

/**
 * Defaults the CURRENT shape of `host` wants: every on fragment that is off in
 * the edge reference (or every on fragment of a loaded host) wants
 * resolveDefault for each base-absent declared child; a loaded host also wants
 * unconditional defaults. @returns {Map<object, *>|null}
 */
function wantedDefaults(root, host) {
  let want = null;
  const frags = host.fragments;
  const now = host.nextFragOn;
  const was = refFragOn(host);
  const loaded = isLoaded(host);
  for (let i = 0; i < frags.length; i++) {
    if (now[i] === 0) continue;
    if (was[i] === 1 && loaded === false) continue;
    const declares = frags[i].declares;
    for (let j = 0; j < declares.length; j++) {
      const c = host.index.get(declares[j]);
      if ((want !== null && want.has(c)) || baseAbsent(root, c) === false) continue;
      const d = resolveDefault(host, c);
      if (d === undefined) continue;
      if (want === null) want = new Map();
      want.set(c, d);
    }
  }
  if (loaded) {
    const kids = host.children;
    for (let i = 0; i < kids.length; i++) {
      const c = kids[i];
      if (c.conditional || baseAbsent(root, c) === false) continue;
      const d = resolveDefault(host, c);
      if (d === undefined) continue;
      if (want === null) want = new Map();
      want.set(c, d);
    }
  }
  return want;
}

/**
 * derive under FINAL_SHAPE: each rule either fires this round (edge) and wants
 * map(emit) on its target, or does not and its logged write is retracted.
 * @returns {boolean} whether anything was (or, with dryRun, would be) staged
 */
function reconcileDerive(root, sid, dryRun) {
  const rules = root.injections;
  const log = root.autoLog;
  let wrote = false;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const to = rule.to;
    const e = emitOf(rule.from, sid);
    const logged = log.get(to);
    if (SWITCHES.INJECT_TO_EDGE && fires(rule, e) === false) {
      if (logged === undefined || logged.rule !== rule) continue;
      wrote = true;
      if (dryRun) return true;
      retract(root, to);
      continue;
    }
    const v = rule.map(e === MISSING ? undefined : e);
    const current = to.kind === 'leaf' ? rawOf(to) : emitOf(to, sid);
    if (to.kind === 'leaf' ? v === current : deepEqual(v, current === MISSING ? undefined : current)) continue;
    wrote = true;
    if (dryRun) return true;
    autoWrite(root, to, v, rule, null);
  }
  return wrote;
}

/**
 * transition under FINAL_SHAPE (D-12 a): per host computed this round, the
 * defaults its current shape wants are reconciled with the logged ones —
 * unwanted retracted, changed re-applied, new applied. Overlay re-dirtying is
 * v4c's. @returns {boolean} whether anything was (or would be) staged
 */
function reconcileTransition(root, sid, dryRun, suppressInjection) {
  const hosts = root.computedHosts;
  const log = root.autoLog;
  let wrote = false;
  for (let h = 0; h < hosts.length; h++) {
    const host = hosts[h];
    if (host.kind !== 'object') continue;
    const want = suppressInjection ? null : wantedDefaults(root, host);
    if (log.size > 0) {
      const mine = [];
      for (const [n, entry] of log) if (entry.host === host && entry.rule === null) mine.push(n);
      for (let i = 0; i < mine.length; i++) {
        const n = mine[i];
        const entry = log.get(n);
        if (entry === undefined) continue;
        const v = want === null ? undefined : want.get(n);
        if (v !== undefined && sameValue(v, entry.value)) continue;
        wrote = true;
        if (dryRun) return true;
        if (v === undefined) retract(root, n);
        else autoWrite(root, n, v, null, host);
      }
    }
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

// ----------------------------------------------------------------- commit / settle

function payloadOf(node, prevLocal, prevEmit) {
  const cur = node.kind === 'leaf' ? valueOrUndefined(node.emit) : { local: valueOrUndefined(node.local), emit: valueOrUndefined(node.emit) };
  const prev = node.kind === 'leaf' ? valueOrUndefined(prevEmit) : { local: valueOrUndefined(prevLocal), emit: valueOrUndefined(prevEmit) };
  return { previous: prev, current: cur, refresh: (node.signals & REFRESH) !== 0, settle: node.settle === null ? undefined : { ...node.settle } };
}

const valueOrUndefined = (v) => (v === MISSING ? undefined : v);

/** Apply staged raw / selection / extras / memos; collect changed nodes in tree order. */
function commit(node, sid, out, signalOnly) {
  let changed = false;
  if (node.hasPending) {
    node.raw = node.pendingRaw;
    node.hasPending = false;
    node.pendingRaw = undefined;
    if (node.kind === 'leaf' && node.raw !== node.reported) {
      node.signals |= REFRESH;
      if (trace) lastSettle.refreshed.push(pathOf(node));
    }
  }
  if (node.hasPendingSelection) {
    node.selection = node.pendingSelection;
    node.hasPendingSelection = false;
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
  if (node.isSource && node.stamp === sid) trackSourceRef(node, prevEmit);
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
  counters.settles++;
  lastSettle.rounds = 0;
  lastSettle.sweeps = 0;
  lastSettle.budgetExceeded = false;
  lastSettle.hostExceeded = false;
  lastSettle.maxSweepsOnOneHost = 0;
  lastSettle.injected = [];
  lastSettle.refreshed = [];
  const suppress = root.options.disableDefaultInjection === true && root.replacedHosts.length > 0;
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
      compute(root, sid);
      const atCap = lastSettle.rounds >= ROUND_CAP;
      let wrote;
      if (finalShape) {
        wrote = reconcileDerive(root, sid, atCap);
        if (atCap === false || wrote === false) wrote = reconcileTransition(root, sid, atCap, suppress) || wrote;
      } else {
        wrote = derive(root, sid, atCap);
        if (atCap === false || wrote === false) wrote = transition(root, sid, atCap, suppress) || wrote;
      }
      for (let i = 0; i < root.replacedHosts.length; i++) root.replacedHosts[i].replaced = false;
      root.replacedHosts.length = 0;
      if (atCap) {
        exceeded = wrote;
        break;
      }
      if (wrote === false) break;
    }
  } finally {
    inSettle = false;
    if (SWITCHES.AUTO_SCOPE === 'settle') root.autoLog.clear();
  }
  lastSettle.sweeps = counters.sweeps - sweeps0;
  lastSettle.budgetExceeded = exceeded || lastSettle.hostExceeded;
  lastSettle.budgetWhich = exceeded ? 'rounds' : lastSettle.hostExceeded ? 'host' : '';
  const out = [];
  const signalOnly = [];
  commit(root, sid, out, signalOnly);
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
