/** Checked v4e-to-v5 derivation. Run: node proto/make-v5.mjs */
import { readFileSync, writeFileSync } from 'node:fs';
let src = readFileSync(new URL('../../round8/proto/loop-v4e.mjs', import.meta.url), 'utf8');
let edits = 0;
const rep = (from, to) => {
  const i = src.indexOf(from);
  if (i < 0 || src.indexOf(from, i + 1) >= 0) throw new Error('Non-unique edit: ' + from.slice(0, 80));
  src = src.slice(0, i) + to + src.slice(i + from.length);
  edits++;
};
const block = (start, end, replacement = '') => {
  const a = src.indexOf(start), b = src.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error('Missing block: ' + start);
  rep(src.slice(a, b), replacement);
};
block('/**\n * Prototype', '/** Sentinel', '/** Round 9 spike. Generated from v4e by make-v5.mjs; raw and extras are the state cells. */\n\n');
block('/**\n * v4d behaviour switches', '/** The default (new)', `/** Set switches before constructing a tree. */
export const SWITCHES = {
  FINAL_SHAPE: true, AUTO_SCOPE: 'settle', EDGE_REF: 'entry',
  INJECT_TO_EDGE: true, LOAD_EDGE: 'fire', ORDER_HINT: false,
  DERIVED_MODE: 'edge', EDGE_COMPARE: 'value', DEFAULT_WINNER: 'last',
  COMMIT_ON_BUDGET: 'base', ROUND_CAP, EXTRAS_ORDER: 'insertion',
  DERIVE_ORDER: ['derived', 'injectTo', 'clearValue'],
  WRITE_CONFLICT: 'last', CONTROL_COMBINE: 'and-or', NODE_GATE_UNIT: 'shape',
};
/** Historical write switches; retired branch selection is not emulated. */
export const OLD_SWITCHES = Object.freeze({ ...SWITCHES,
  FINAL_SHAPE: false, EDGE_REF: 'commit', INJECT_TO_EDGE: false,
  COMMIT_ON_BUDGET: 'lastRound',
});

`);
block('/** selection of a select-guard', '/** Work counters');
rep(`    selection: 0,
    initialSelection: 0,
    pendingSelection: 0,
    hasPendingSelection: false,
    selectBranches: 0,
`, '');
rep('    defaultValue: undefined,', `    defaultValue: undefined,
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
    unconditional: false,`);
rep('  node.options = { dev: false, disableDefaultInjection: false };', `  node.options = { dev: false, disableAutomaticWrites: false };
  node.warnings = [];
  node.schemaMode = false;
  node.loadSuppressed = false;
  node.fillSeen = new Set();
  node.fillValues = new Map();
  node.cleared = new Set();`);
rep('host.callerLoaded === false && SWITCHES.FINAL_SHAPE', 'host.callerLoaded === false');
block('function isLoaded(host)', '/**\n * Defaults the CURRENT', `function isLoaded(host) {
  return host.callerLoaded;
}

`);
rep('        select: f.select,', '        controls: f.controls ?? null,');
rep('        select: undefined,', '        controls: o.controls ?? null,');
rep('  host.selectBranches = flat.filter((f) => f.select !== undefined).length;', '');
rep('    if (child.conditional === false) {', `    if (child.unconditional) {
      child.declaredBy ??= [];
      child.declaredBy.push(idx);
      continue;
    }
    if (child.conditional === false) {`);
rep('        defaults: f.defaults ?? null,', '        defaults: f.defaults ?? null,\n        expressionDefaults: f.expressionDefaults ?? null,');
rep('const selectionOf = (n) => (n.hasPendingSelection ? n.pendingSelection : n.selection);\n', '');
rep(`    if (node.selectBranches > 0) {
      node.pendingSelection = SWITCHES.SELECT_RULE === 'score' ? NO_SELECTION : 0;
      node.hasPendingSelection = true;
    }
`, '');
block('/** "값 키를 가장 많이', 'function applyValue');
rep(`      if (node.selectBranches > 0 && SWITCHES.SELECT_RULE === 'score') {
        node.pendingSelection = NO_SELECTION;
        node.hasPendingSelection = true;
      }
`, '');
rep(`    if (node.selectBranches > 0) {
      node.pendingSelection = initialSelection(node, value);
      node.hasPendingSelection = true;
    }
`, '');
block('/** Select a branch', '/** Remove an undeclared');
rep(`    if (n.selectBranches > 0 && selectionOf(n) !== r.selection) {
      n.pendingSelection = r.selection;
      n.hasPendingSelection = true;
    }
`, '');
rep(', selection: obj ? selectionOf(n) : 0', '');
rep(`  if (node.hasPendingSelection) {
    node.selection = node.pendingSelection;
    node.hasPendingSelection = false;
  }
`, '');
rep('    else if (f.select !== undefined) v = selectionOf(node) === f.select ? 1 : 0;\n', '');
rep('      v = f.guard(nonObject ? EMPTY_LOCAL : node.nextLocal) ? 1 : 0;', '      v = f.guard === null || f.guard(nonObject ? EMPTY_LOCAL : node.nextLocal) ? 1 : 0;');
rep(`export function setValue(node, value, mode = 'Overwrite') {
  const root = enter(node);`, `export function setValue(node, value, mode = 'Overwrite') {
  const loadOptions = typeof mode === 'object' ? mode : {};
  mode = loadOptions.mode ?? (typeof mode === 'string' ? mode : 'Overwrite');
  const root = enter(node);
  if (mode !== 'Merge' && node.kind !== 'leaf') root.loadSuppressed ||= loadOptions.disableAutomaticWrites ?? root.options.disableAutomaticWrites;`);
rep(`export function reset(root) {
  setValue(root, root.initialValue);`, `export function reset(root, options = {}) {
  setValue(root, root.initialValue, options);`);
rep('    if (c.conditional && c.actNext === false) continue;', '    if ((c.conditional && c.actNext === false) || c.controlNext?.active === false) continue;');
rep('  if (activeSame && prev !== MISSING && node.hasPendingExtras === false) {', '  if (!node.root.schemaMode && activeSame && prev !== MISSING && node.hasPendingExtras === false) {');
rep('  return keys.length > 16 ? normalize(out) : out;', '  if (node.root.schemaMode && sameValue(prev, out)) return prev;\n  return keys.length > 16 ? normalize(out) : out;');
rep('  const by = child.declaredBy;', '  if (child.expressionDefault !== undefined) return evalExpression(child.expressionDefault, expressionView(child.root));\n  const by = child.declaredBy;');
block('function wantedDefaults(root, host)', '/**\n * derive under FINAL_SHAPE', `function wantedDefaults(root, host) {
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

`);
block('function reconcileDerive(root, sid, dryRun)', '/**\n * transition under FINAL_SHAPE', `function reconcileDerive(root, sid, dryRun) {
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

`);
block('    if (log.size > 0) {\n      const mine = [];', '    if (want !== null) {');
rep('function reconcileTransition(root, sid, dryRun, suppressInjection) {\n  const hosts = root.computedHosts;', `function reconcileTransition(root, sid, dryRun, suppressInjection) {
  const hosts = [];
  visitNodes(root, node => { if (node.kind === 'object') hosts.push(node); });`);
rep('  const log = root.autoLog;\n  let wrote = false;', `  const log = root.autoLog;
  let wrote = false;
  for (const [node, entry] of [...log]) {
    if (!log.has(node) || entry.rule !== null || !root.fillValues.has(node) || existsInShape(node)) continue;
    if (dryRun) return true;
    retract(root, node);
    wrote = true;
  }
  if (wrote) return true;`);
rep("kind: e.rule === null ? 'default' : e.rule.derived === true ? 'derived' : 'injectTo'", "kind: e.kind ?? (e.rule === null ? 'default' : e.rule.derived === true ? 'derived' : 'injectTo')");
rep('  const suppress = root.options.disableDefaultInjection === true && root.replacedHosts.length > 0;', `  const suppress = root.loadSuppressed === true;
  root.fillSeen.clear();
  root.fillValues.clear();
  root.cleared.clear();
  const base = snapshot(root);`);
rep('      compute(root, sid);\n      const atCap', `      if (root.schemaMode) { updateControls(root); markAllFresh(root); }
      compute(root, sid);
      const atCap`);
block('      if (finalShape) {\n        wrote = reconcileDerive', '      for (let i = 0; i < root.replacedHosts.length;', `      wrote = reconcileDerive(root, sid, atCap);
      if (wrote === false) wrote = reconcileTransition(root, sid, atCap, suppress);
`);
rep("    if (lastSettle.budgetCommit === 'base') commitBase(root, sid);", `    if (lastSettle.budgetCommit === 'base') {
      restore(base);
      root.autoLog.clear();
      root.computedHosts.length = 0;
      if (root.schemaMode) { updateControls(root); markAllFresh(root); }
      compute(root, sid);
    }`);
rep('  dispatch(root, out);', '  root.loadSuppressed = false;\n  dispatch(root, out);');
rep('  commit(root, sid, out, signalOnly);', `  commit(root, sid, out, signalOnly);
  visitNodes(root, node => { node.shapePresent = existsInShape(node); });`);
rep('  const out = [];\n  const signalOnly = [];', `  lastSettle.birthsAtCommit = [];
  if (!lastSettle.budgetExceeded) visitNodes(root, node => {
    const born = !wasInShape(node) && existsInShape(node);
    if (born) lastSettle.birthsAtCommit.push(pathOf(node));
  });
  const out = [];
  const signalOnly = [];`);
rep('  let changed = false;\n  if (node.hasPending)', `  let changed = false;
  if (node.controlNext !== null) {
    changed = !sameValue(node.controls, node.controlNext);
    node.controls = node.controlNext;
  }
  if (node.clearExpression !== undefined) node.clearWas = !!evalExpression(node.clearExpression, expressionView(node.root));
  if (node.hasPending)`);
block('/**\n * derive (A3)', '/** DEFAULT_WINNER');
block('function inject(host, child, dryRun)', '// ----------------------------------------------------------------- P6');
block('/** Absent before the transition layer', '/** A caller full replacement');
block('/**\n * COMMIT_ON_BUDGET', '/** Logged automatic writes');
block('/**\n * Declare the fragment tree', 'export function declareFragments', '/** Declare precompiled guard predicates and unconditional fragments in document order. */\n');
rep('raw (absent), extras and selection', 'raw (absent) and extras');
rep(' * Full replacement with the initial value (`reset()`): also restores the\n * initial selection of every select-guard host.', ' * Full replacement with the initial value (`reset()`).');
rep(" * sweep; inherited overlays take the owner's current state; select\n * fragments read `selection`.", " * sweep; inherited overlays take the owner's current state.");
rep('staged raw / selection / extras / memos', 'staged raw / extras / memos');
rep('retired branch selection', 'retired branch state');
block('function resolveDefault(host, child)', '// ----------------------------------------------------------------- P6', `function resolveDefault(host, child) {
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

`);
block('/** A caller full replacement, or an injectTo', 'function isLoaded', '/** Only a caller load creates a fresh fill opportunity for an existing host. */\n');
block('/**\n * Defaults the CURRENT', 'function wantedDefaults', '/** Plan missing-value candidates; births are confirmed only after joint convergence. */\n');
block('/**\n * derive under FINAL_SHAPE', 'function reconcileDerive', '/** Evaluate the stage snapshot, resolve same-target winners, then stage writes. */\n');
block('/**\n * transition under FINAL_SHAPE', 'function reconcileTransition', '/** Retract out-of-shape candidates, then plan parent-first fills and inherited overlays. */\n');
src += readFileSync(new URL('./runtime-v5.inc.txt', import.meta.url), 'utf8');
if (/selection|selectBranches|SELECT_RULE|TIE_MODE|scoreSelection/.test(src)) throw new Error('Retired state survived');
writeFileSync(new URL('./loop-v5.mjs', import.meta.url), src);
console.log('make-v5: ' + edits + ' checked edits');
