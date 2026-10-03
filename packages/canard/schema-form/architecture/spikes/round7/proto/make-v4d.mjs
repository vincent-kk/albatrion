/**
 * Derives proto/loop-v4d.mjs from spikes/work-loop/proto/loop-v4c.mjs by exact-string
 * edits, so the diff v4c -> v4d is this file (same method as make-v4c.mjs). Run from
 * spikes/round7:
 *   cp ../work-loop/proto/loop-v4c.mjs proto/loop-v4d.mjs && node proto/make-v4d.mjs proto/loop-v4d.mjs
 * Every edit must match exactly once or the script throws and writes nothing.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
let src = readFileSync(file, 'utf8');
let applied = 0;
const rep = (from, to) => {
  const i = src.indexOf(from);
  if (i < 0 || src.indexOf(from, i + 1) >= 0) throw new Error('no unique match: ' + from.slice(0, 80));
  src = src.slice(0, i) + to + src.slice(i + from.length);
  applied++;
};

// ---------------------------------------------------------------- header
rep(` * Node kinds: leaf | object | array.`, ` * v4d (round 7; loop-v4c.mjs is untouched) — proposed principle P6 "automatic
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
 * Node kinds: leaf | object | array.`);

// ---------------------------------------------------------------- switches
rep(`export const REFRESH = 1;
`, `export const REFRESH = 1;

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
`);

rep(`  validations: 0,
};`, `  validations: 0,
  retractions: 0,
};`);

rep(`  delivered: [],
  errors: [],
};`, `  delivered: [],
  errors: [],
  /** Which budget ended the settle: '' | 'host' | 'rounds'. */
  budgetWhich: '',
  /** Paths whose automatic write was retracted (trace only). */
  retracted: [],
};`);

rep(`let trace = false;
`, `let trace = false;
/** True while the rounds of a settle run: a replacement made then is not the caller's. */
let inSettle = false;
/** > 0 while a caller's full replacement of a host is being staged. */
let loadDepth = 0;
`);

// ---------------------------------------------------------------- node fields
rep(`    signals: 0,
    // root only
`, `    signals: 0,
    callerLoaded: false,
    loaded: false,
    isSource: false,
    edgeRef: MISSING,
    edgeRefEntry: -1,
    entryFragOn: null,
    entryFragEntry: -1,
    hintOrder: null,
    // root only
`);
rep(`    onChangeDepth: 0,
  };
}`, `    onChangeDepth: 0,
    entryId: 0,
    autoLog: null,
    loadedList: null,
  };
}`);

// ---------------------------------------------------------------- entry
rep(`  if (root.entryDepth++ === 0) {
    root.entryEmit = root.emit;`, `  if (root.entryDepth++ === 0) {
    root.entryId++;
    root.entryEmit = root.emit;`);
rep(`  if (--root.entryDepth !== 0) return;
  counters.entries++;`, `  if (--root.entryDepth !== 0) return;
  endEntryScope(root);
  counters.entries++;`);

rep(`  node.injections = [];
  setRoot(node, node);`, `  node.injections = [];
  node.autoLog = new Map();
  node.loadedList = [];
  setRoot(node, node);`);

rep(`  host.nextFragOn = new Uint8Array(n);
`, `  host.nextFragOn = new Uint8Array(n);
  host.entryFragOn = new Uint8Array(n);
  host.entryFragEntry = -1;
`);

rep(`  ensureRoot(root).injections = rules;
`, `  ensureRoot(root).injections = rules;
  for (let i = 0; i < rules.length; i++) rules[i].from.isSource = true;
`);

// ---------------------------------------------------------------- load marks
rep(`function markReplaced(host) {
  if (host.replaced) return;`, `function markReplaced(host) {
  if (inSettle === false && host.callerLoaded === false && SWITCHES.FINAL_SHAPE) {
    host.callerLoaded = true;
    host.root.loadedList.push(host);
  }
  if (host.replaced) return;`);

rep(`function erase(node) {
  if (node.kind === 'leaf') {`, `function erase(node) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);
  if (node.kind === 'leaf') {`);
rep(`    if (node.selectBranches > 0) {
      node.pendingSelection = 0;`, `    if (node.selectBranches > 0) {
      node.pendingSelection = SWITCHES.SELECT_RULE === 'score' ? NO_SELECTION : 0;`);

// ---------------------------------------------------------------- initial selection (D-14 a)
rep(`function initialSelection(host, value) {
  let best = 0;`, `function initialSelection(host, value) {
  if (SWITCHES.SELECT_RULE === 'score') return scoreSelection(host, value);
  let best = 0;`);
rep(`  return best;
}

function applyValue(node, value, merge) {
  markPresent(node);`, `  return best;
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
  markPresent(node);`);
rep(`    if (isArray === false) {
      node.pendingExtras = null;
      node.hasPendingExtras = true;
    }`, `    if (isArray === false) {
      node.pendingExtras = null;
      node.hasPendingExtras = true;
      if (node.selectBranches > 0 && SWITCHES.SELECT_RULE === 'score') {
        node.pendingSelection = NO_SELECTION;
        node.hasPendingSelection = true;
      }
    }`);

// ---------------------------------------------------------------- public writes
rep(`  const root = enter(node);
  let ok = false;
  try {
    stagingDepth++;
    try {
      applyValue(node, value, mode === 'Merge');
      if (mode === 'Merge') clearNonObjectAncestors(node);
    } finally {
      stagingDepth--;
    }`, `  const root = enter(node);
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
    }`);
rep(`  const root = enter(node);
  let ok = false;
  try {
    stagingDepth++;
    try {
      stageRaw(node, value);`, `  const root = enter(node);
  let ok = false;
  try {
    noteCallerWrite(root, node);
    stagingDepth++;
    try {
      stageRaw(node, value);`);
rep(`  try {
    host.pendingSelection = branch;`, `  try {
    noteCallerWrite(root, host);
    host.pendingSelection = branch;`);
rep(`  try {
    const extras = extrasOf(host);`, `  try {
    noteCallerWrite(root, host);
    const extras = extrasOf(host);`);
rep(`    stagingDepth++;
    try {
      const item = attach(arr, arr.itemFactory(arr.children.length));`, `    noteCallerWrite(root, arr);
    stagingDepth++;
    try {
      const item = attach(arr, arr.itemFactory(arr.children.length));`);
rep(`  try {
    const kids = arr.children;
    const child = kids[index];`, `  try {
    noteCallerWrite(root, arr);
    const kids = arr.children;
    const child = kids[index];`);

// ---------------------------------------------------------------- F13 order hint
rep(`function sweepOnce(node, on, sid, nonObject) {
  const frags = node.fragments;
  let changed = false;
  for (let i = 0; i < frags.length; i++) {
    const f = frags[i];`, `function sweepOnce(node, on, sid, nonObject) {
  const frags = node.fragments;
  const order = SWITCHES.ORDER_HINT ? node.hintOrder : null;
  let changed = false;
  for (let k = 0; k < frags.length; k++) {
    const i = order === null ? k : order[k];
    const f = frags[i];`);
rep(`  const cap = nFrag + 1;
  applyActive(node, on);`, `  const cap = nFrag + 1;
  if (SWITCHES.ORDER_HINT) node.hintOrder = hintOrderOf(node);
  applyActive(node, on);`);

// ---------------------------------------------------------------- v4c derive / transition + edge
rep(`    const rule = rules[i];
    const e = emitOf(rule.from, sid);
    const v = rule.map(e === MISSING ? undefined : e);`, `    const rule = rules[i];
    const e = emitOf(rule.from, sid);
    if (SWITCHES.INJECT_TO_EDGE && fires(rule, e) === false) continue;
    const v = rule.map(e === MISSING ? undefined : e);`);
rep(`    const was = host.fragOn;
    if (suppressInjection === false) {`, `    const was = refFragOn(host);
    if (suppressInjection === false) {`);

// ---------------------------------------------------------------- P6 layer
rep(`// ----------------------------------------------------------------- commit / settle
`, `// ----------------------------------------------------------------- P6 automatic-write layer (v4d)

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
 * A caller or listener wrote \`node\`: logged automatic writes on it, its
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
 * Edge test of one injectTo rule (F11 / D-13): the source emit \`e\` of this
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
 * Stage an automatic write (full replacement of \`node\`) through the log. The
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
 * Defaults the CURRENT shape of \`host\` wants: every on fragment that is off in
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
        if (trace) lastSettle.injected.push(\`\${pathOf(c)}=\${JSON.stringify(v)}\`);
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
`);

// ---------------------------------------------------------------- commit bookkeeping
rep(`    node.local = node.nextLocal;
    node.emit = node.nextEmit;
    node.localKeys = node.nextLocalKeys;
  }
`, `    node.local = node.nextLocal;
    node.emit = node.nextEmit;
    node.localKeys = node.nextLocalKeys;
  }
  if (node.isSource && node.stamp === sid) trackSourceRef(node, prevEmit);
`);
rep(`  if (node.kind === 'object' && node.fragStamp === sid) {
    const tmp = node.fragOn;`, `  if (node.kind === 'object' && node.fragStamp === sid) {
    if (SWITCHES.EDGE_REF === 'entry' && node.entryFragEntry !== node.root.entryId && sameOn(node.fragOn, node.nextFragOn) === false) {
      node.entryFragOn.set(node.fragOn);
      node.entryFragEntry = node.root.entryId;
    }
    const tmp = node.fragOn;`);

// ---------------------------------------------------------------- settle loop
rep(`  const sweeps0 = counters.sweeps;
  let exceeded = false;
  for (;;) {
    lastSettle.rounds++;
    counters.rounds++;
    root.computedHosts.length = 0;
    compute(root, sid);
    const atCap = lastSettle.rounds >= ROUND_CAP;
    let wrote = derive(root, sid, atCap);
    if (atCap === false || wrote === false) wrote = transition(root, sid, atCap, suppress) || wrote;
    for (let i = 0; i < root.replacedHosts.length; i++) root.replacedHosts[i].replaced = false;
    root.replacedHosts.length = 0;
    if (atCap) {
      exceeded = wrote;
      break;
    }
    if (wrote === false) break;
  }
  lastSettle.sweeps = counters.sweeps - sweeps0;
  lastSettle.budgetExceeded = exceeded || lastSettle.hostExceeded;
  const out = [];
  const signalOnly = [];
  commit(root, sid, out, signalOnly);
`, `  const sweeps0 = counters.sweeps;
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
`);

writeFileSync(file, src);
console.log(`make-v4d: ${applied} edits applied to ${file}`);
