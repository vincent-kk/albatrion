/**
 * Derives proto/loop-v4e.mjs from spikes/round7/proto/loop-v4d.mjs by exact-string
 * edits, so the diff v4d -> v4e is this file (same method as make-v4d.mjs). Run from
 * spikes/round8:
 *   cp ../round7/proto/loop-v4d.mjs proto/loop-v4e.mjs && node proto/make-v4e.mjs proto/loop-v4e.mjs
 * Every edit must match exactly once or the script throws and writes nothing.
 * Default values of the new switches reproduce loop-v4d.mjs.
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

// ---------------------------------------------------------------- 1. header
rep(` * Node kinds: leaf | object | array.`, ` * v4e (round 8; loop-v4d.mjs is untouched) — execution probes for D-11′,
 * D-27, D-29, D-31, D-32. New SWITCHES fields; their defaults reproduce v4d:
 *  - DERIVED_MODE: rules declared with {@link declareDerived} ('&derived') fire
 *    on the edge like injectTo ('edge') or every round whenever the mapped value
 *    differs from the target ('level' = computed value, a user edit is
 *    overwritten in the same settle).
 *  - EDGE_COMPARE: 'value' (v4d, D-33) | 'write' — a source written by a caller
 *    in this settle fires even when its value did not change (current code).
 *  - DEFAULT_WINNER: 'last' (v4d) | 'first' active declaration in total order.
 *  - COMMIT_ON_BUDGET (FINAL_SHAPE only): 'lastRound' (v4d) | 'base' — on a
 *    rounds budget overrun retract every logged automatic write and commit the
 *    shape of the caller-only raw B.
 *  - ROUND_CAP: the rounds budget (default {@link ROUND_CAP}).
 *  - EXTRAS_ORDER: 'insertion' (v4d, JS property order) | 'sorted'.
 *
 * Node kinds: leaf | object | array.`);

// ---------------------------------------------------------------- 2. switches
rep(`  /** Tie under 'score': 'first' declared branch | 'none'. */
  TIE_MODE: 'first',
};`, `  /** Tie under 'score': 'first' declared branch | 'none'. */
  TIE_MODE: 'first',
  /** v4e: '&derived' rules fire on the source edge ('edge') or every round ('level'). */
  DERIVED_MODE: 'edge',
  /** v4e: edge test of injectTo / derived: 'value' (emit differs) | 'write' (a caller wrote the source this settle, or the value differs). */
  EDGE_COMPARE: 'value',
  /** v4e: several active declarations default the same child: 'last' | 'first' in total order. */
  DEFAULT_WINNER: 'last',
  /** v4e: what a FINAL_SHAPE settle commits on a rounds budget overrun: 'lastRound' | 'base'. */
  COMMIT_ON_BUDGET: 'lastRound',
  /** v4e: rounds budget per settle. */
  ROUND_CAP,
  /** v4e: emit order of undeclared keys: 'insertion' | 'sorted'. */
  EXTRAS_ORDER: 'insertion',
};`);

rep(`  TIE_MODE: 'first',
});`, `  TIE_MODE: 'first',
  DERIVED_MODE: 'edge',
  EDGE_COMPARE: 'value',
  DEFAULT_WINNER: 'last',
  COMMIT_ON_BUDGET: 'lastRound',
  ROUND_CAP,
  EXTRAS_ORDER: 'insertion',
});`);

// ---------------------------------------------------------------- 3. node field, lastSettle facts
rep(`    isSource: false,`, `    isSource: false,
    srcWritten: false,`);

rep(`  /** Paths whose automatic write was retracted (trace only). */
  retracted: [],
};`, `  /** Paths whose automatic write was retracted (trace only). */
  retracted: [],
  /** v4e: '' | 'lastRound' | 'base' — which state a rounds overrun committed. */
  budgetCommit: '',
  /** v4e: logged automatic writes present at commit: {path, value, kind, host}. */
  autoAtCommit: [],
};`);

// ---------------------------------------------------------------- 4. caller writes mark sources (EDGE_COMPARE 'write')
rep(`function erase(node) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);`, `function erase(node) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);
  if (node.isSource && inSettle === false) markSourceWritten(node);`);

rep(`function applyValue(node, value, merge) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);`, `function applyValue(node, value, merge) {
  if (loadDepth > 0 && node.isSource) markSourceLoaded(node);
  if (node.isSource && inSettle === false) markSourceWritten(node);`);

rep(`      node.reported = value;`, `      node.reported = value;
      if (node.isSource) markSourceWritten(node);`);

// ---------------------------------------------------------------- 5. declareDerived
rep(`  for (let i = 0; i < rules.length; i++) rules[i].from.isSource = true;
}`, `  for (let i = 0; i < rules.length; i++) rules[i].from.isSource = true;
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
const extrasKeys = (extras) => (SWITCHES.EXTRAS_ORDER === 'sorted' ? Object.keys(extras).sort() : Object.keys(extras));`);

// ---------------------------------------------------------------- 6. extras order in compose
rep(`    for (const k of Object.keys(extras)) {
      out[k] = extras[k];`, `    for (const k of extrasKeys(extras)) {
      out[k] = extras[k];`);

// ---------------------------------------------------------------- 7. edge gate per rule
rep(`    if (SWITCHES.INJECT_TO_EDGE && fires(rule, e) === false) continue;`, `    if (edgeGated(rule) && fires(rule, e) === false) continue;`);
rep(`    if (SWITCHES.INJECT_TO_EDGE && fires(rule, e) === false) {`, `    if (edgeGated(rule) && fires(rule, e) === false) {`);

// ---------------------------------------------------------------- 8. default winner
rep(`/** Last active declaration in total order wins; \`properties\` is the floor. */`, `/** DEFAULT_WINNER: last (or first) active declaration in total order wins; \`properties\` is the floor. */`);
rep(`    if (defaults !== null && Object.hasOwn(defaults, child.name)) d = defaults[child.name];`, `    if (defaults !== null && Object.hasOwn(defaults, child.name)) {
      d = defaults[child.name];
      if (SWITCHES.DEFAULT_WINNER === 'first') break;
    }`);

// ---------------------------------------------------------------- 9. EDGE_COMPARE 'write'
rep(`  return sameValue(e, ref) === false;`, `  if (SWITCHES.EDGE_COMPARE === 'write' && src.srcWritten) return true;
  return sameValue(e, ref) === false;`);

rep(`/** Clear every load mark (host callerLoaded, source loaded). */`, `/** A caller wrote this source in the current settle (EDGE_COMPARE 'write'); cleared at its commit. */
function markSourceWritten(node) {
  node.srcWritten = true;
}

/** Clear every load mark (host callerLoaded, source loaded). */`);

rep(`  if (node.isSource && node.stamp === sid) trackSourceRef(node, prevEmit);`, `  if (node.isSource && node.stamp === sid) {
    trackSourceRef(node, prevEmit);
    node.srcWritten = false;
  }`);

// ---------------------------------------------------------------- 10. rounds budget, COMMIT_ON_BUDGET, autoAtCommit
rep(`      const atCap = lastSettle.rounds >= ROUND_CAP;`, `      const atCap = lastSettle.rounds >= SWITCHES.ROUND_CAP;`);

rep(`      if (wrote === false) break;
    }
  } finally {`, `      if (wrote === false) break;
    }
    lastSettle.budgetCommit = exceeded ? (finalShape && SWITCHES.COMMIT_ON_BUDGET === 'base' ? 'base' : 'lastRound') : '';
    if (lastSettle.budgetCommit === 'base') commitBase(root, sid);
    lastSettle.autoAtCommit = finalShape ? autoEntries(root) : [];
  } finally {`);

rep(`// ----------------------------------------------------------------- commit / settle`, `// ----------------------------------------------------------------- v4e: budget commit, provenance

/**
 * COMMIT_ON_BUDGET 'base': retract every logged automatic write (the staged raw
 * becomes the caller-only raw B), then compute B's shape once more so the commit
 * carries the shape of B. No derive / transition runs on it.
 */
function commitBase(root, sid) {
  const log = root.autoLog;
  const keys = [...log.keys()];
  for (let i = 0; i < keys.length; i++) if (log.has(keys[i])) retract(root, keys[i]);
  root.computedHosts.length = 0;
  compute(root, sid);
  for (let i = 0; i < root.replacedHosts.length; i++) root.replacedHosts[i].replaced = false;
  root.replacedHosts.length = 0;
}

/** Logged automatic writes about to be committed, for provenance checks. */
function autoEntries(root) {
  const out = [];
  for (const [n, e] of root.autoLog) {
    out.push({ path: pathOf(n), value: e.value, kind: e.rule === null ? 'default' : e.rule.derived === true ? 'derived' : 'injectTo', host: e.host === null ? null : pathOf(e.host) });
  }
  return out;
}

// ----------------------------------------------------------------- commit / settle`);

writeFileSync(file, src);
console.log(`make-v4e: ${applied} edits applied to ${file}`);
