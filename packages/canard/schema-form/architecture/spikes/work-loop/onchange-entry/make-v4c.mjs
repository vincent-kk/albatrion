/**
 * Derives proto/loop-v4c.mjs from proto/loop-v4.mjs by exact-string edits, so
 * the diff v4 -> v4c is this file. Run from spikes/work-loop:
 *   cp proto/loop-v4.mjs proto/loop-v4c.mjs && node onchange-entry/make-v4c.mjs proto/loop-v4c.mjs
 * Every edit must match exactly once or the script throws and writes nothing.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
let src = readFileSync(file, 'utf8');
let applied = 0;
const rep = (from, to) => {
  const i = src.indexOf(from);
  if (i < 0 || src.indexOf(from, i + 1) >= 0) throw new Error('no unique match: ' + from.slice(0, 60));
  src = src.slice(0, i) + to + src.slice(i + from.length);
  applied++;
};

rep(` *  - every write outside \`batch\` settles and notifies synchronously (B2);
 *    root dispatcher with waves, revision, isolation, detached skip (B3).
 *
 * Node kinds`, ` *  - every write outside \`batch\` settles and notifies synchronously (B2);
 *    root dispatcher with waves, revision, isolation, detached skip (B3).
 *
 * v4c (this file; loop-v4.mjs is untouched) — D-10 (c) / F31, round-5 C-9:
 *  - an ENTRY is one call of a public write API made while no other public
 *    write API of the same root is on the stack: \`setValue\`, \`write\`,
 *    \`select\`, \`removeKey\`, \`push\`, \`remove\`, \`batch\` (and \`reset\`/\`prime\`,
 *    which call \`setValue\`). Each keeps \`root.entryDepth\`; a write made by a
 *    listener during a wave, or inside \`batch(fn)\`, sits at depth >= 2.
 *  - \`root.onChange\` fires ONCE when the depth returns to 0, after the last
 *    wave, with the final emit, iff the emit reference differs from the one
 *    at entry; \`root.onValidate(commitNumber)\` is requested once per such
 *    entry, right before \`onChange\`. Neither is called per wave any more.
 *  - a write inside \`onChange\` finds depth 0 and is therefore a NEW entry:
 *    it fires its own \`onChange\` (nested on the stack). The nesting is
 *    capped at WAVE_CAP (\`settle.status = 'onchange-cap-exceeded'\`, dev
 *    throws); the write itself is still applied.
 *  - \`root.commitNumber\` (F28) rises once per commit of that root.
 *
 * Node kinds`);

rep(`  waves: 0,
  notifications: 0,
};`, `  waves: 0,
  notifications: 0,
  entries: 0,
  onChange: 0,
  validations: 0,
};`);

rep(`  delivered: [],
  errors: [],
};

let SID = 0;`, `  delivered: [],
  errors: [],
};

/** Facts about the most recent completed ENTRY (depth back to 0). */
export const lastEntry = {
  /** Settles (= commits) performed by this entry, including listener writes. */
  settles: 0,
  /** Waves run by this entry's dispatches, summed. */
  waves: 0,
  /** Whether \`root.onChange\` was called for this entry. */
  onChange: false,
  /** Whether \`root.onValidate\` was requested for this entry. */
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

let SID = 0;`);

rep(`    onChange: null,
    initialValue: undefined,
    replacedHosts: null,
    computedHosts: null,
    dispatching: false,
    waveQueue: null,
  };
}`, `    onChange: null,
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
  };
}

/**
 * Open an entry on the root of \`node\` (depth 0 -> 1 records the emit and
 * commit number the entry starts from). @returns {object} the root
 */
function enter(node) {
  const root = node.root ?? node;
  if (root.entryDepth++ === 0) {
    root.entryEmit = root.emit;
    root.entryCommit = root.commitNumber;
    root.entrySettles = 0;
    root.entryWaves = 0;
  }
  return root;
}

/**
 * Close an entry: at depth 1 -> 0 request validation once and call
 * \`onChange\` once with the final emit. \`ok === false\` (exception unwinding)
 * only restores the depth.
 */
function leave(root, ok) {
  if (--root.entryDepth !== 0) return;
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
      const err = new Error(\`onChange cap exceeded: depth=\${root.onChangeDepth}\`);
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
}`);

rep(`export function setValue(node, value, mode = 'Overwrite') {
  stagingDepth++;
  try {
    applyValue(node, value, mode === 'Merge');
    if (mode === 'Merge') clearNonObjectAncestors(node);
  } finally {
    stagingDepth--;
  }
  autoSettle(node);
}`, `export function setValue(node, value, mode = 'Overwrite') {
  const root = enter(node);
  let ok = false;
  try {
    stagingDepth++;
    try {
      applyValue(node, value, mode === 'Merge');
      if (mode === 'Merge') clearNonObjectAncestors(node);
    } finally {
      stagingDepth--;
    }
    autoSettle(node);
    ok = true;
  } finally {
    leave(root, ok);
  }
}`);

rep(`export function write(node, value) {
  stagingDepth++;
  try {
    stageRaw(node, value);
    node.reported = value;
    clearNonObjectAncestors(node);
  } finally {
    stagingDepth--;
  }
  autoSettle(node);
}`, `export function write(node, value) {
  const root = enter(node);
  let ok = false;
  try {
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
}`);

rep(`export function select(host, branch) {
  host.pendingSelection = branch;
  host.hasPendingSelection = true;
  touch(host);
  autoSettle(host);
}`, `export function select(host, branch) {
  const root = enter(host);
  let ok = false;
  try {
    host.pendingSelection = branch;
    host.hasPendingSelection = true;
    touch(host);
    autoSettle(host);
    ok = true;
  } finally {
    leave(root, ok);
  }
}`);

rep(`export function removeKey(host, key) {
  const extras = extrasOf(host);
  if (extras === null || !Object.hasOwn(extras, key)) return;
  const next = {};
  for (const k of Object.keys(extras)) if (k !== key) next[k] = extras[k];
  host.pendingExtras = Object.keys(next).length === 0 ? null : next;
  host.hasPendingExtras = true;
  touch(host);
  autoSettle(host);
}`, `export function removeKey(host, key) {
  const root = enter(host);
  let ok = false;
  try {
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
}`);

rep(`export function push(arr, value) {
  stagingDepth++;
  try {
    const item = attach(arr, arr.itemFactory(arr.children.length));
    touch(arr);
    applyValue(item, value, false);
  } finally {
    stagingDepth--;
  }
  autoSettle(arr);
}`, `export function push(arr, value) {
  const root = enter(arr);
  let ok = false;
  try {
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
}`);

rep(`export function remove(arr, index) {
  const kids = arr.children;
  const child = kids[index];
  if (child === undefined) return;
  kids.splice(index, 1);
  child.detached = true;
  child.parent = null;
  for (let i = index; i < kids.length; i++) {
    kids[i].name = i;
    kids[i].pos = i;
  }
  touch(arr);
  autoSettle(arr);
}`, `export function remove(arr, index) {
  const root = enter(arr);
  let ok = false;
  try {
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
}`);

rep(`export function batch(root, fn) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
  }
  if (batchDepth === 0 && root.dirty) settle(root);
}`, `export function batch(root, fn) {
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
}`);

rep(`  rs.rounds = lastSettle.rounds;
  for (let i = 0; i < signalOnly.length; i++) out.push(signalOnly[i]);
  dispatch(root, out);`, `  rs.rounds = lastSettle.rounds;
  root.commitNumber++;
  root.entrySettles++;
  for (let i = 0; i < signalOnly.length; i++) out.push(signalOnly[i]);
  dispatch(root, out);`);

rep(`        if (payload === null) continue;
        if (node === root && root.onChange !== null && payload.previous.emit !== payload.current.emit) {
          try {
            root.onChange(payload.current.emit, payload);
          } catch (e) {
            lastSettle.errors.push({ path: pathOf(node), error: e });
          }
        }
        const listeners = node.listeners;`, `        if (payload === null) continue;
        const listeners = node.listeners;`);

rep(`  } finally {
    root.dispatching = false;
    root.settle.waves = lastSettle.waves;
  }`, `  } finally {
    root.dispatching = false;
    root.settle.waves = lastSettle.waves;
    root.entryWaves += lastSettle.waves;
  }`);

writeFileSync(file, src);
console.log(`applied ${applied} edits to ${file}`);
