// Round 8 — execution probes P1-P5 against proto/loop-v4e.mjs.
//   node r8.mjs                          driver: one fresh node process per (probe, config); writes r8-output.txt
//   node r8.mjs child <probe> <cfgJSON>  one configuration: prints `R8 {json}` lines, nothing else is parsed
// A config is a set of switch values applied on top of NEW_SWITCHES (or OLD_SWITCHES when cfg.base === 'OLD')
// before any tree is built; it is never changed inside a child.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as L from './proto/loop-v4e.mjs';

const { leaf, object, attach, declareFragments, declareInjections, declareDerived, prime, write, setValue, batch, reset, removeKey, valueOf, rawTree, activeIds, lastSettle, setSwitches, setTrace, OLD_SWITCHES, NEW_SWITCHES, SWITCHES } = L;

const SELF = fileURLToPath(import.meta.url);
const J = (v) => JSON.stringify(v === undefined ? '<undefined>' : v);
const V = (v) => (v === undefined ? '<undefined>' : v);

// ================================================================ child side

let CUR = { probe: '', cfg: '' };
const emitLine = (kase, result) => console.log(`R8 ${JSON.stringify({ probe: CUR.probe, cfg: CUR.cfg, case: kase, result })}`);
const st = (root) => ({ emit: V(valueOf(root)), raw: rawTree(root), active: activeIds(root), status: root.settle.status, rounds: lastSettle.rounds });

// ---------------------------------------------------------------- P1 D-11′ derived edge vs level
const fOf = (v) => (v === undefined ? undefined : `f(${v})`);

/** a, d = f(a) (&derived); withFrag adds E (guard: d absent) -> y default Y and F (guard: d = f(1)) -> x default X. */
function p1Tree(withFrag) {
  const root = object('root');
  const a = attach(root, leaf('a'));
  const d = attach(root, leaf('d'));
  if (withFrag) {
    attach(root, leaf('y'));
    attach(root, leaf('x'));
    declareFragments(root, [
      { id: 'E', guard: (G) => G.d === undefined, declares: ['y'], defaults: { y: 'Y' } },
      { id: 'F', guard: (G) => G.d === 'f(1)', declares: ['x'], defaults: { x: 'X' } },
    ]);
  }
  declareDerived(root, [{ from: a, to: d, map: fOf }]);
  return { root, a, d };
}

function probeP1() {
  setTrace(true);
  {
    const { root, a, d } = p1Tree(false);
    prime(root, { a: 1 });
    const load = valueOf(root);
    write(d, 'mine');
    const edit = { emit: valueOf(root), refreshD: lastSettle.refreshed.includes('/d') };
    write(a, 2);
    emitLine('i', { load, afterUserEditD: edit, afterA2: valueOf(root) });
  }
  {
    const { root, a, d } = p1Tree(false);
    prime(root, { a: 1 });
    write(d, 'mine');
    const edit = valueOf(root);
    write(a, 1);
    emitLine('ii', { afterUserEditD: edit, afterSameA1: valueOf(root), rounds: lastSettle.rounds });
  }
  {
    const run = (how) => {
      const { root, a, d } = p1Tree(false);
      prime(root, { a: 1 });
      if (how === 'seq') {
        write(a, 2);
        write(d, 'mine');
      } else if (how === 'batch') {
        batch(root, () => {
          write(a, 2);
          write(d, 'mine');
        });
      } else if (how === 'seqRev') {
        write(d, 'mine');
        write(a, 2);
      } else {
        batch(root, () => {
          write(d, 'mine');
          write(a, 2);
        });
      }
      return valueOf(root).d;
    };
    emitLine('iii', { seq_a2_dMine: run('seq'), batch_a2_dMine: run('batch'), seq_dMine_a2: run('seqRev'), batch_dMine_a2: run('batchRev') });
  }
  {
    const r = {};
    for (const [label, load] of [['load_a1', { a: 1 }], ['load_a1_dMine', { a: 1, d: 'mine' }]]) {
      const { root } = p1Tree(true);
      prime(root, load);
      r[label] = { ...st(root), injected: lastSettle.injected, retracted: lastSettle.retracted };
    }
    emitLine('iv', r);
  }
  {
    // same final (a=2, last caller write of d = 'mine'), two histories
    const h = (order) => {
      const { root, a, d } = p1Tree(false);
      prime(root, { a: 1 });
      for (const step of order) step === 'a' ? write(a, 2) : write(d, 'mine');
      return { emit: valueOf(root), raw: rawTree(root) };
    };
    emitLine('fn', { H1_dMine_then_a2: h(['d', 'a']), H2_a2_then_dMine: h(['a', 'd']) });
  }
  {
    const { root, d } = p1Tree(false);
    prime(root, { a: 1 });
    write(d, 'mine');
    const v0 = valueOf(root);
    setValue(root, v0);
    const v1 = valueOf(root);
    emitLine('idem', { before: v0, afterSetValueGetValue: v1, idempotent: JSON.stringify(v0) === JSON.stringify(v1) });
  }
  setTrace(false);
}

// ---------------------------------------------------------------- P2 D-27 injectTo at mount / reset / full replace
function e3Tree() {
  const root = object('root');
  const src = attach(root, leaf('src'));
  const tgt = attach(root, leaf('tgt'));
  declareInjections(root, [{ from: src, to: tgt, map: (e) => `f(${e})` }]);
  return { root, src, tgt };
}

function probeP2() {
  {
    // round-7 X3L, unchanged
    const a = e3Tree();
    prime(a.root, { src: 'x', tgt: 'custom' });
    const loadWithTgt = valueOf(a.root);
    write(a.tgt, 'mine');
    write(a.src, 'z');
    const edited = valueOf(a.root);
    reset(a.root);
    const afterReset = valueOf(a.root);
    const b = e3Tree();
    prime(b.root, { src: 'x' });
    const loadNoTgt = valueOf(b.root);
    const c = e3Tree();
    prime(c.root, { src: 'x', tgt: 'custom' });
    write(c.tgt, 'mine');
    reset(c.root);
    const resetSrcSame = valueOf(c.root);
    emitLine('X3L', { loadWithTgt, loadNoTgt, edited, afterReset, resetWhereSrcUnchanged: resetSrcSame });
  }
  {
    const r = {};
    for (const [label, V2] of [
      ['newSrc_withTgt', { src: 'w', tgt: 'given' }],
      ['sameSrc_withTgt', { src: 'x', tgt: 'given' }],
      ['newSrc_noTgt', { src: 'w' }],
      ['sameSrc_noTgt', { src: 'x' }],
    ]) {
      const t = e3Tree();
      prime(t.root, { src: 'x', tgt: 'custom' });
      write(t.tgt, 'mine');
      const before = valueOf(t.root);
      setValue(t.root, V2);
      r[label] = { before, V: V2, after: V(valueOf(t.root)) };
    }
    emitLine('replace', r);
  }
  {
    const r = {};
    const prep = {
      freshLoad: () => {},
      tgtEdited: (t) => write(t.tgt, 'mine'),
      tgtCleared: (t) => write(t.tgt, undefined),
      srcEditedThenTgtEdited: (t) => {
        write(t.src, 'z');
        write(t.tgt, 'mine');
      },
    };
    for (const [label, fn] of Object.entries(prep)) {
      const t = e3Tree();
      prime(t.root, { src: 'x', tgt: 'custom' });
      fn(t);
      let changes = 0;
      t.root.onChange = () => changes++;
      const v0 = valueOf(t.root);
      setValue(t.root, v0);
      const v1 = valueOf(t.root);
      setValue(t.root, v1);
      const v2 = valueOf(t.root);
      r[label] = { v0: V(v0), v1: V(v1), idempotent: JSON.stringify(v0) === JSON.stringify(v1), secondApplication: JSON.stringify(v1) === JSON.stringify(v2), onChangeCalls: changes };
    }
    emitLine('idem', r);
  }
  {
    // comparison only: the load contract of `default` under the same D-7 test
    const root = object('root');
    const x = attach(root, leaf('x', 'D'));
    prime(root, {});
    write(x, undefined);
    const v0 = valueOf(root);
    setValue(root, v0 === undefined ? {} : v0);
    emitLine('idemDefault', { v0: V(v0), v1: V(valueOf(root)), idempotent: JSON.stringify(v0) === JSON.stringify(valueOf(root)) });
  }
}

// ---------------------------------------------------------------- P3 D-29 default winner
/** Fragments are given in SOURCE order; `rank` may make the total (evaluation) order differ. */
function winnerOracle(root, sourceIds, rule, child) {
  const on = new Set(activeIds(root));
  let d;
  for (const id of sourceIds) {
    if (on.has(id) === false) continue;
    const f = root.fragments.find((g) => g.id === id);
    if (f.defaults === null || Object.hasOwn(f.defaults, child) === false) continue;
    d = f.defaults[child];
    if (rule === 'first') break;
  }
  return d;
}

function n7Tree(ranks) {
  const root = object('root');
  const a = attach(root, leaf('a'));
  const b = attach(root, leaf('b'));
  const x = attach(root, leaf('x'));
  const frags = [
    { id: 'A', guard: (G) => G.a === true, declares: ['x'], defaults: { x: 'A' }, rank: ranks?.[0] },
    { id: 'B', guard: (G) => G.b === true, declares: ['x'], defaults: { x: 'B' }, rank: ranks?.[1] },
  ];
  declareFragments(root, frags);
  return { root, a, b, x, sourceIds: ['A', 'B'] };
}

/** B (b = true) declares x default B and y default Y; A (y = Y) declares x default A: A turns on one round after B. */
function laterRoundTree(sourceOrder) {
  const root = object('root');
  const b = attach(root, leaf('b'));
  attach(root, leaf('x'));
  attach(root, leaf('y'));
  const A = { id: 'A', guard: (G) => G.y === 'Y', declares: ['x'], defaults: { x: 'A' } };
  const B = { id: 'B', guard: (G) => G.b === true, declares: ['x', 'y'], defaults: { x: 'B', y: 'Y' } };
  declareFragments(root, sourceOrder === 'AB' ? [A, B] : [B, A]);
  return { root, b, sourceIds: sourceOrder === 'AB' ? ['A', 'B'] : ['B', 'A'] };
}

function probeP3() {
  const rule = SWITCHES.DEFAULT_WINNER;
  const judge = (t) => {
    const x = rawTree(t.root).x;
    const oracle = winnerOracle(t.root, t.sourceIds, rule, 'x');
    return { x: V(x), active: activeIds(t.root), totalOrder: t.root.fragments.filter((f) => !f.inherited).map((f) => f.id), oracleSourceOrder: V(oracle), equalsOracle: x === oracle, rounds: lastSettle.rounds };
  };
  const seqOrBatch = (t, steps, useBatch) => {
    const run = () => {
      for (const [k, v] of steps) write(t[k], v);
    };
    if (useBatch) batch(t.root, run);
    else run();
    return judge(t);
  };
  const mk = (ranks) => {
    const t = n7Tree(ranks);
    prime(t.root, { a: false, b: false });
    return t;
  };
  emitLine('N7_a_then_b', { seq: seqOrBatch(mk(), [['a', true], ['b', true]], false), batch: seqOrBatch(mk(), [['a', true], ['b', true]], true) });
  emitLine('N7_b_then_a', { seq: seqOrBatch(mk(), [['b', true], ['a', true]], false), batch: seqOrBatch(mk(), [['b', true], ['a', true]], true) });
  {
    const t = n7Tree();
    prime(t.root, { a: false, b: true });
    const loadX = rawTree(t.root).x;
    write(t.x, undefined);
    write(t.a, true);
    emitLine('N7_extra_Bon_xMissing_then_a', { loadX: V(loadX), ...judge(t) });
  }
  {
    // source order A, B; rank makes the total (evaluation + resolveDefault) order B, A
    const t = mk([1, 0]);
    emitLine('rank_totalOrder_BA', { batch: seqOrBatch(t, [['a', true], ['b', true]], true) });
  }
  for (const order of ['AB', 'BA']) {
    const t = laterRoundTree(order);
    prime(t.root, { b: false });
    write(t.b, true);
    emitLine(`laterRound_source${order}`, { ...judge(t), injected: lastSettle.injected, raw: rawTree(t.root) });
  }
}

// ---------------------------------------------------------------- P4 D-31 commit on non-convergence
/** X16 = selfcheck A4b load. withDefault false drops c's default; withInject false drops injectTo. */
function x16(withDefault, withInject) {
  const root = object('');
  const t = attach(root, leaf('t'));
  const c = attach(root, leaf('c'));
  declareFragments(root, [{ id: 'then', guard: (G) => !('t' in G), declares: ['c'], defaults: withDefault ? { c: 'C' } : undefined }]);
  prime(root, {});
  const rules = withInject ? [{ from: c, to: t, map: (v) => `from-${v}` }] : [];
  if (withInject) declareInjections(root, rules);
  setValue(root, {});
  return { root, rules };
}

/** codex N1 / N9: x is a base child (fragment BASE always on) and the fragments only add defaults to it. */
function nSchema(which, withDefault) {
  const root = object('');
  attach(root, leaf('x'));
  const d = (v) => (withDefault ? { x: v } : undefined);
  const frags =
    which === 'N1'
      ? [
          { id: 'BASE', guard: () => true, declares: ['x'] },
          { id: 'F', guard: (G) => G.x !== 1, declares: ['x'], defaults: d(1) },
        ]
      : [
          { id: 'BASE', guard: () => true, declares: ['x'] },
          { id: 'zero', guard: (G) => G.x === 1, declares: ['x'], defaults: d(0) },
          { id: 'one', guard: (G) => !('x' in G) || G.x === 0, declares: ['x'], defaults: d(1) },
          { id: 'two', guard: (G) => G.x === 2, declares: ['x'], defaults: d(2) },
        ];
  declareFragments(root, frags);
  prime(root, {});
  return { root, rules: [] };
}

/**
 * Provenance checks against the committed state (host = root). An automatic write is
 * "not wanted by the committed shape" when (default) no committed-on fragment carries
 * that value as its default for the child, or (injectTo) the committed source emit is
 * absent or maps to another value.
 */
function provenance(root, rules) {
  const auto = lastSettle.autoAtCommit;
  const on = new Set(activeIds(root));
  const offAuto = auto.filter((e) => {
    const name = e.path.slice(1);
    if (e.kind === 'default') {
      const carriers = root.fragments.filter((f) => f.defaults !== null && Object.hasOwn(f.defaults, name) && f.defaults[name] === e.value);
      return carriers.some((f) => on.has(f.id)) === false;
    }
    const r = rules.find((x) => x.to.name === name);
    const src = r === undefined ? undefined : valueOf(r.from);
    return src === undefined || r.map(src) !== e.value;
  });
  const wantedMissing = [];
  root.fragments.forEach((f, i) => {
    if (root.fragOn[i] !== 1 || f.defaults === null) return;
    for (const k of Object.keys(f.defaults)) if (rawTree(root.index.get(k)) === undefined) wantedMissing.push(`${f.id}:${k}`);
  });
  const injectMismatch = [];
  for (const r of rules) {
    const e = valueOf(r.from);
    if (e !== undefined && r.to.raw !== r.map(e)) injectMismatch.push(`${r.to.name} raw=${J(r.to.raw)} map(src)=${J(r.map(e))}`);
  }
  return { autoAtCommit: auto, autoWriteWhoseFragmentIsOff: offAuto.map((e) => `${e.path}=${J(e.value)}`), wantedDefaultMissing: wantedMissing, injectToOutOfDate: injectMismatch };
}

function probeP4() {
  setTrace(true);
  const one = (label, build) => {
    const { root, rules } = build();
    emitLine(label, { ...st(root), budgetWhich: lastSettle.budgetWhich, budgetCommit: lastSettle.budgetCommit, retractions: lastSettle.retracted.length, ...provenance(root, rules) });
  };
  one('X16', () => x16(true, true));
  one('X16_noDefault', () => x16(false, true));
  one('X16_noAuto', () => x16(false, false));
  one('N1', () => nSchema('N1', true));
  one('N1_noDefault', () => nSchema('N1', false));
  one('N9', () => nSchema('N9', true));
  one('N9_noDefault', () => nSchema('N9', false));
  setTrace(false);
}

// ---------------------------------------------------------------- P5 D-32 extras order
function p5Tree() {
  const root = object('root');
  attach(root, leaf('a'));
  return root;
}
const keysOf = (root) => Object.keys(valueOf(root) ?? {});
const canon = (o) => JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]]));

function probeP5() {
  const seq = () => {
    const root = p5Tree();
    prime(root, { z: 1, a: 2, m: 3 });
    const k1 = keysOf(root);
    setValue(root, { q: 4 }, 'Merge');
    const k2 = keysOf(root);
    setValue(root, { z: 9 }, 'Merge');
    const k3 = keysOf(root);
    return { load_z1_a2_m3: k1, merge_q4: k2, merge_z9_existingExtra: k3, finalEmit: valueOf(root) };
  };
  const s1 = seq();
  const s1again = seq();
  emitLine('sequence', { ...s1, sameSequenceTwiceSameOrder: JSON.stringify(s1) === JSON.stringify(s1again) });
  const hist = (steps) => {
    const root = p5Tree();
    prime(root, steps[0]);
    for (const s of steps.slice(1)) {
      if (s.removeKey !== undefined) removeKey(root, s.removeKey);
      else setValue(root, s, 'Merge');
    }
    return { emitKeys: keysOf(root), rawCanon: canon(rawTree(root)) };
  };
  const pairs = {
    mergeOrder: [
      [{ a: 2 }, { z: 1 }, { m: 3 }],
      [{ a: 2 }, { m: 3 }, { z: 1 }],
    ],
    removeThenReAdd: [
      [{ z: 1, a: 2, m: 3 }],
      [{ z: 1, a: 2, m: 3 }, { removeKey: 'z' }, { z: 1 }],
    ],
    callerObjectOrder: [[{ z: 1, a: 2, m: 3 }], [{ m: 3, a: 2, z: 1 }]],
  };
  for (const [label, [h1, h2]] of Object.entries(pairs)) {
    const r1 = hist(h1);
    const r2 = hist(h2);
    emitLine(`pair_${label}`, { h1: r1.emitKeys, h2: r2.emitKeys, sameRaw: r1.rawCanon === r2.rawCanon, sameEmitOrder: JSON.stringify(r1.emitKeys) === JSON.stringify(r2.emitKeys) });
  }
  {
    const root = p5Tree();
    prime(root, { k: 1, a: 2, 10: 1, 2: 1 });
    emitLine('integerLikeKeys', { loadedAs: "{k:1, a:2, '10':1, '2':1}", emitKeys: keysOf(root) });
  }
}

function runChild(probe, cfgJson) {
  const cfg = JSON.parse(cfgJson);
  const { base, label, ...sw } = cfg;
  setSwitches({ ...(base === 'OLD' ? OLD_SWITCHES : NEW_SWITCHES), ...sw });
  CUR = { probe, cfg: label };
  emitLine('switches', { ...SWITCHES });
  ({ P1: probeP1, P2: probeP2, P3: probeP3, P4: probeP4, P5: probeP5 })[probe]();
}

// ================================================================ driver side

const CONFIGS = {
  P1: [
    ...['edge', 'level'].flatMap((m) =>
      ['fire', 'skip', 'fill'].flatMap((le) => ['value', 'write'].map((cmp) => ({ label: `${m}/${le}/${cmp}`, DERIVED_MODE: m, LOAD_EDGE: le, EDGE_COMPARE: cmp }))),
    ),
    { label: 'edge/fire/value/FINAL_SHAPE=off', DERIVED_MODE: 'edge', FINAL_SHAPE: false },
    { label: 'level/fire/value/FINAL_SHAPE=off', DERIVED_MODE: 'level', FINAL_SHAPE: false },
  ],
  P2: ['fire', 'skip', 'fill', 'ref'].map((le) => ({ label: le, LOAD_EDGE: le })),
  P3: [
    ...['first', 'last'].map((w) => ({ label: `NEW/${w}`, DEFAULT_WINNER: w })),
    ...['first', 'last'].map((w) => ({ label: `NEW+ORDER_HINT/${w}`, DEFAULT_WINNER: w, ORDER_HINT: true })),
    ...['first', 'last'].map((w) => ({ label: `OLD/${w}`, base: 'OLD', DEFAULT_WINNER: w })),
  ],
  P4: [
    ...['lastRound', 'base'].flatMap((c) => [25, 24].map((cap) => ({ label: `${c}/cap${cap}`, COMMIT_ON_BUDGET: c, ROUND_CAP: cap }))),
    { label: 'OLD(v4c)/cap25', base: 'OLD' },
  ],
  P5: ['insertion', 'sorted'].map((o) => ({ label: o, EXTRAS_ORDER: o })),
};

function runDriver() {
  const lines = [];
  const results = {};
  for (const [probe, cfgs] of Object.entries(CONFIGS)) {
    results[probe] = {};
    for (const cfg of cfgs) {
      const stdout = execFileSync(process.execPath, [SELF, 'child', probe, JSON.stringify(cfg)], { encoding: 'utf8' });
      results[probe][cfg.label] = {};
      for (const line of stdout.split('\n')) {
        if (!line.startsWith('R8 ')) continue;
        lines.push(line);
        const o = JSON.parse(line.slice(3));
        results[probe][cfg.label][o.case] = o.result;
      }
    }
  }
  const out = ['# r8 output — every R8 line comes from a fresh node process per (probe, cfg); SUMMARY lines are derived by the driver.', ''];
  const sum = (probe, kase, obj) => out.push(`SUMMARY ${JSON.stringify({ probe, case: kase, ...obj })}`);
  for (const probe of Object.keys(CONFIGS)) {
    out.push(`## ${probe}`);
    for (const l of lines) if (l.includes(`"probe":"${probe}"`) && l.includes('"case":"switches"') === false) out.push(l);
    out.push('');
  }
  // P1 summaries
  for (const [label, r] of Object.entries(results.P1)) {
    sum('P1', label, {
      i_afterEdit: r.i.afterUserEditD.emit.d,
      i_refreshD: r.i.afterUserEditD.refreshD,
      i_afterA2: r.i.afterA2.d,
      ii_afterSameA1: r.ii.afterSameA1.d,
      iii: r.iii,
      iii_batchEqualsSeq: r.iii.seq_a2_dMine === r.iii.batch_a2_dMine,
      iv_active: [r.iv.load_a1.active, r.iv.load_a1_dMine.active],
      iv_rawA1: r.iv.load_a1.raw,
      fn_sameFinal: JSON.stringify(r.fn.H1_dMine_then_a2.emit) === JSON.stringify(r.fn.H2_a2_then_dMine.emit),
      idem: r.idem.idempotent,
    });
  }
  // P2 summaries
  for (const [label, r] of Object.entries(results.P2)) {
    const idem = Object.fromEntries(Object.entries(r.idem).map(([k, v]) => [k, v.idempotent]));
    const rep = Object.fromEntries(Object.entries(r.replace).map(([k, v]) => [k, v.after.tgt ?? '<absent>']));
    sum('P2', label, { idempotent: idem, replaceTgt: rep });
  }
  // P3 summaries
  for (const [label, r] of Object.entries(results.P3)) {
    const eq = {};
    for (const [k, v] of Object.entries(r)) {
      if (k === 'switches') continue;
      if ('seq' in v) {
        eq[`${k}.seq`] = v.seq.equalsOracle;
        eq[`${k}.batch`] = v.batch.equalsOracle;
      } else if ('batch' in v) eq[`${k}.batch`] = v.batch.equalsOracle;
      else eq[k] = v.equalsOracle;
    }
    sum('P3', label, { equalsOracle: eq });
  }
  // P4 summaries
  for (const [label, r] of Object.entries(results.P4)) {
    for (const k of ['X16', 'N1', 'N9']) {
      const x = r[k];
      const nd = r[`${k}_noDefault`];
      const na = r.X16_noAuto;
      sum('P4', `${label}/${k}`, {
        raw: x.raw,
        active: x.active,
        emit: x.emit,
        status: x.status,
        budgetCommit: x.budgetCommit,
        offFragmentAutoWrite: x.autoWriteWhoseFragmentIsOff,
        wantedDefaultMissing: x.wantedDefaultMissing,
        injectToOutOfDate: x.injectToOutOfDate,
        equalsNoDefaultSchema: JSON.stringify([x.raw, x.active, x.emit]) === JSON.stringify([nd.raw, nd.active, nd.emit]),
        ...(k === 'X16' ? { equalsNoAutoSchema: JSON.stringify([x.raw, x.active, x.emit]) === JSON.stringify([na.raw, na.active, na.emit]) } : {}),
      });
    }
  }
  // P5 summaries
  for (const [label, r] of Object.entries(results.P5)) {
    sum('P5', label, {
      sequence: [r.sequence.load_z1_a2_m3, r.sequence.merge_q4, r.sequence.merge_z9_existingExtra],
      pureInSequence: r.sequence.sameSequenceTwiceSameOrder,
      sameRawDifferentOrder: Object.fromEntries(['mergeOrder', 'removeThenReAdd', 'callerObjectOrder'].map((p) => [p, r[`pair_${p}`].sameRaw && !r[`pair_${p}`].sameEmitOrder])),
      integerLikeKeys: r.integerLikeKeys.emitKeys,
    });
  }
  writeFileSync(new URL('./r8-output.txt', import.meta.url), `${out.join('\n')}\n`);
  console.log(out.filter((l) => l.startsWith('SUMMARY')).join('\n'));
}

if (process.argv[2] === 'child') runChild(process.argv[3], process.argv[4]);
else runDriver();
