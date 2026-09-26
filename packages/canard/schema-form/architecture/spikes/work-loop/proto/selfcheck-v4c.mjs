/**
 * Executable scenarios for round-4-spec.md §A (work loop 3.1) and §B (event
 * system), run against loop-v4. `node proto/selfcheck-v4.mjs`
 *
 *  a  round-3 counterexamples re-run (redteam3/attacks.mjs, a33.mjs,
 *     codex3/run.mjs 18 experiments) — inputs ported to loop-v4 trees
 *  b  determinism A1-1 incl. serialization (A4-7)
 *  c  null contract (#338 test lines 31 / 42 / 148) + record-swap leak
 *  d  chains, negated guard fixpoint, self-negating budget
 *  e  inherited overlay (A4-6)
 *  f  disableDefaultInjection (A2)
 *  g  notification (B) 1-7
 */
import {
  activeIds,
  attach,
  array,
  batch,
  counters,
  declareFragments,
  declareInjections,
  lastSettle,
  leaf,
  localValueOf,
  object,
  pathOf,
  prime,
  rawTree,
  remove,
  removeKey,
  reset,
  resetCounters,
  ROUND_CAP,
  select,
  setTrace,
  setValue,
  subscribe,
  valueOf,
  write,
} from './loop-v4c.mjs';
import { ajv } from './build-v4c.mjs';

let failures = 0;
const out = (s) => process.stdout.write(`${s}\n`);
const J = (v) => (v === undefined ? 'undefined' : JSON.stringify(v));
const check = (cond, label, observed) => {
  if (!cond) failures++;
  out(`  ${cond ? 'PASS' : 'FAIL'} ${label} — observed: ${observed}`);
};
const info = (label, observed) => out(`  INFO ${label}: ${observed}`);
const G = (schema) => ajv.compile(schema);
const validate = (schema, v) => {
  const f = ajv.compile(schema);
  const ok = f(v === undefined ? {} : v);
  return ok ? 'valid' : `invalid(${f.errors.map((e) => e.message).join('; ')})`;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const L = (name, def) => leaf(name, def);
/** Object host with children attached in order. */
const H = (name, kids) => {
  const h = object(name);
  for (const k of kids) attach(h, k);
  return h;
};
const state = (r) => `emit=${J(valueOf(r))} raw=${J(rawTree(r))} active=${J(activeIds(r))} rounds=${lastSettle.rounds} status=${r.settle.status}`;
const req = (k) => G({ required: [k] });
const notReq = (k) => G({ not: { required: [k] } });
const kConst = (k, v) => G({ required: [k], properties: { [k]: { const: v } } });

// ======================================================================= a
function scenarioA() {
  out('a. round-3 counterexamples on v4');

  // ---- redteam3 A3-1a
  {
    const mk = () => {
      const r = H('', [L('a'), L('b'), L('x')]);
      declareFragments(r, [
        { id: 'allOf0', guard: req('a'), declares: ['x'], defaults: { x: 1 } },
        { id: 'allOf1', guard: req('b'), declares: ['x'], defaults: { x: 2 } },
      ]);
      return prime(r, {});
    };
    const r1 = mk(); write(r1.index.get('a'), 'x'); write(r1.index.get('b'), 'y');
    const r2 = mk(); write(r2.index.get('b'), 'y'); write(r2.index.get('a'), 'x');
    const r3 = mk(); setValue(r3, { a: 'x', b: 'y' });
    const F = (r) => `emit=${J(valueOf(r))} raw=${J(rawTree(r))}`;
    info('A3-1a a-then-b', F(r1));
    info('A3-1a b-then-a', F(r2));
    info('A3-1a setValue', F(r3));
    check(valueOf(r1).x === rawTree(r1).x && valueOf(r2).x === rawTree(r2).x && valueOf(r3).x === 2, 'A3-1a: emit.x == raw.x in every order (history lives in raw, E1); full replacement picks the last active declaration (x=2)', `x: ${valueOf(r1).x}/${valueOf(r2).x}/${valueOf(r3).x}`);
  }
  // ---- redteam3 A3-1b
  {
    const r = H('', [L('a'), L('z'), L('x')]);
    declareFragments(r, [{ id: 'allOf0', guard: req('a'), declares: ['x'], defaults: { x: 1 } }]);
    prime(r, { a: 'x' });
    const s0 = J(valueOf(r));
    write(r.index.get('x'), undefined);
    const s1 = J(valueOf(r));
    write(r.index.get('z'), 'q');
    const s2 = J(valueOf(r));
    setValue(r, { a: 'x', z: 'q' });
    const s3 = J(valueOf(r));
    check(s1 === '{"a":"x"}' && s2 === '{"a":"x","z":"q"}', 'A3-1b: a removed x is NOT re-injected by an unrelated keystroke (transition only on off->on)', `load=${s0} remove=${s1} typeZ=${s2}`);
    check(s3 === '{"a":"x","z":"q","x":1}', 'A3-1b: setValue(V) without x re-injects x (full replacement = load contract)', s3);
  }
  // ---- redteam3 A3-1c (order: allOf[0] < allOf[0]/allOf[0] nested < if)
  {
    const r = H('', [L('p'), L('q'), L('r')]);
    declareFragments(r, [
      { id: 'allOf0', guard: () => true, children: [{ id: 'allOf0/allOf0.then', guard: req('q'), declares: ['r'], defaults: { r: 'R' } }] },
      { id: 'then', guard: req('p'), declares: ['q'], defaults: { q: 'Q' } },
    ]);
    prime(r, {});
    setValue(r, { p: 'P' });
    check(same(valueOf(r), { p: 'P', q: 'Q', r: 'R' }), 'A3-1c: nested-in-unconditional fragment resolves after the top-level then injected q', state(r));
  }
  // ---- redteam3 A3-1d (nested inside a then that is OFF)
  {
    const r = H('', [L('p'), L('q'), L('inner'), L('deep')]);
    declareFragments(r, [
      { id: 'then', guard: req('p'), declares: ['inner'], defaults: { inner: 'I' }, children: [{ id: 'then/allOf0.then', guard: req('q'), declares: ['deep'], defaults: { deep: 'DEEP' } }] },
    ]);
    prime(r, {});
    setValue(r, { q: 'Q' });
    check(same(valueOf(r), { q: 'Q' }) && rawTree(r).deep === undefined, 'A3-1d: nested fragment stays off (not traversed) while its enclosing then is off — round-3 defect gone', state(r));
    setValue(r, { p: 'P', q: 'Q' });
    check(same(valueOf(r), { p: 'P', q: 'Q', inner: 'I', deep: 'DEEP' }), 'A3-1d: both on when p present', state(r));
  }
  // ---- redteam3 A3-2 / codex A3-2-chain (raw present, and default-driven)
  {
    const N = 30;
    const mk = (reverse, withDefaults) => {
      const r = H('', Array.from({ length: N + 1 }, (_, i) => L(`p${i}`)));
      const frags = [];
      for (let i = 0; i < N; i++) frags.push({ id: `f${i}`, guard: req(`p${i}`), declares: [`p${i + 1}`], defaults: withDefaults ? { [`p${i + 1}`]: i + 1 } : undefined });
      if (reverse) frags.reverse();
      declareFragments(r, frags);
      const v = { p0: 0 };
      if (!withDefaults) for (let i = 1; i <= N; i++) v[`p${i}`] = i;
      return prime(r, v);
    };
    for (const rev of [false, true]) {
      resetCounters();
      const r = mk(rev, false);
      const keys = Object.keys(valueOf(r)).length;
      check(keys === N + 1 && lastSettle.sweeps === (rev ? N + 1 : 2) && lastSettle.rounds === 1, `A3-2 ${rev ? 'reverse' : 'forward'} chain (raw present): ${rev ? 'N+1=31' : '2'} sweeps, 1 round`, `keys=${keys} sweeps=${lastSettle.sweeps} guards=${counters.guards} rounds=${lastSettle.rounds} status=${r.settle.status}`);
    }
    for (const rev of [false, true]) {
      resetCounters();
      const r = mk(rev, true);
      const keys = Object.keys(valueOf(r)).length;
      info(`A3-2 ${rev ? 'reverse' : 'forward'} chain (default-driven, E1)`, `keys=${keys} rounds=${lastSettle.rounds} sweeps=${lastSettle.sweeps} guards=${counters.guards} status=${r.settle.status} injections=${counters.injections}`);
      check(r.settle.status === 'budget-exceeded' && keys === ROUND_CAP, 'A3-2 default-driven chain of 30 hits ROUND_CAP (each link costs a transition round) -> spec defect', `keys=${keys} rounds=${lastSettle.rounds}`);
    }
  }
  // ---- redteam3 A3-2b keystroke cost, all fragments satisfied
  {
    for (const N of [30, 200]) {
      for (const rev of [true, false]) {
        const r = H('', [L('note'), ...Array.from({ length: N + 1 }, (_, i) => L(`p${i}`))]);
        const frags = [];
        for (let i = 0; i < N; i++) frags.push({ id: `f${i}`, guard: req(`p${i}`), declares: [`p${i + 1}`] });
        if (rev) frags.reverse();
        declareFragments(r, frags);
        const v = {};
        for (let i = 0; i <= N; i++) v[`p${i}`] = i;
        prime(r, v);
        resetCounters();
        const t0 = process.hrtime.bigint();
        write(r.index.get('note'), 'k');
        const us = Number(process.hrtime.bigint() - t0) / 1e3;
        info(`A3-2b N=${N} ${rev ? 'reverse' : 'forward'} chain, keystroke in note`, `sweeps=${lastSettle.sweeps} guards=${counters.guards} composes=${counters.composes} rebuilds=${counters.rebuilds} time=${us.toFixed(0)}us`);
      }
    }
  }
  // ---- redteam3 A3-4A / codex option-open|closed: negated guard + other activation
  {
    const schemaOpen = { type: 'object', properties: { seed: {} }, allOf: [
      { if: { not: { required: ['x'] } }, then: { properties: { a: { default: 'A' } } } },
      { if: { required: ['seed'] }, then: { properties: { x: { default: 1 } } } } ] };
    const schemaClosed = { ...schemaOpen, unevaluatedProperties: false };
    const r = H('', [L('seed'), L('a'), L('x')]);
    declareFragments(r, [
      { id: 'allOf0.then', guard: notReq('x'), declares: ['a'], defaults: { a: 'A' } },
      { id: 'allOf1.then', guard: req('seed'), declares: ['x'], defaults: { x: 1 } },
    ]);
    resetCounters();
    prime(r, { seed: true });
    check(same(valueOf(r), { seed: true, x: 1 }) && validate(schemaOpen, valueOf(r)) === 'valid' && validate(schemaClosed, valueOf(r)) === 'valid', 'A3-4A/option-B: negated guard + other activation reaches the ajv-accepted fixpoint {seed,x} (open and closed)', `${state(r)} sweeps=${lastSettle.sweeps}`);
    const schemaRT = { type: 'object', properties: { mode: { type: 'string' } }, allOf: [
      { if: { not: { required: ['extra'] } }, then: { properties: { fallback: { type: 'string', default: 'F' } } }, else: { properties: { mode: {}, extra: {} }, additionalProperties: false } },
      { if: { properties: { mode: { const: 'full' } }, required: ['mode'] }, then: { properties: { extra: { type: 'string', default: 'E' } } } } ] };
    const r2 = H('', [L('mode'), L('fallback'), L('extra')]);
    declareFragments(r2, [
      { id: 'allOf0.then', guard: notReq('extra'), declares: ['fallback'], defaults: { fallback: 'F' } },
      { id: 'allOf0.else', guard: req('extra') },
      { id: 'allOf1.then', guard: kConst('mode', 'full'), declares: ['extra'], defaults: { extra: 'E' } },
    ]);
    prime(r2, { mode: 'full' });
    check(same(valueOf(r2), { mode: 'full', extra: 'E' }) && validate(schemaRT, valueOf(r2)) === 'valid', 'A3-4A (redteam): then/else no longer both on; emit valid', state(r2));
  }
  // ---- redteam3 A3-4B (no defaults -> nothing to diverge)
  {
    const r = H('', [L('x'), L('y')]);
    declareFragments(r, [{ id: 'allOf0.then', guard: notReq('x') }]);
    prime(r, {});
    check(valueOf(r) === undefined && activeIds(r).length === 1, 'A3-4B: `if not required x then required y` — fragment on, nothing emitted, validator reports required y', state(r));
  }
  // ---- redteam3 A3-4C / codex option-cycle: self-negating
  {
    const schema = { type: 'object', if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } }, required: ['x'] } };
    const r = H('', [L('x')]);
    declareFragments(r, [{ id: 'then', guard: notReq('x'), declares: ['x'], defaults: { x: 1 } }]);
    let threw = null;
    try { prime(r, {}); } catch (e) { threw = e.message; }
    check(threw === null && r.settle.status === 'budget-exceeded', 'A3-4C/option-cycle: self-negating schema ends budget-exceeded, observable, no throw in prod', `${state(r)} sweeps=${r.settle.sweeps} ajv=${validate(schema, valueOf(r))}`);
    write(r.index.get('x'), undefined);
    info('A3-4C after user removes x', state(r));
    const rd = H('', [L('x')]);
    declareFragments(rd, [{ id: 'then', guard: notReq('x'), declares: ['x'], defaults: { x: 1 } }]);
    let threwDev = null;
    try { prime(rd, {}, { dev: true }); } catch (e) { threwDev = e.message; }
    check(threwDev !== null && rd.dirty === false, 'A3-4C dev mode: throws after commit (tree committed)', `${threwDev} emit=${J(valueOf(rd))}`);
  }
  // ---- redteam3 A3-5 / codex A3-5-prohibition / A5-prohibited-selector: no prohibition fragments (D-3 iii)
  {
    const schema = { type: 'object', properties: { a: {} }, allOf: [
      { if: { required: ['a'] }, then: { properties: { a: false } } },
      { if: { required: ['a'] }, then: { properties: { b: { default: 1 } } } } ] };
    const r = H('', [L('a'), L('b')]);
    declareFragments(r, [
      { id: 'allOf0.then(a:false declares nothing)', guard: req('a') },
      { id: 'allOf1.then', guard: req('a'), declares: ['b'], defaults: { b: 1 } },
    ]);
    prime(r, { a: 'kept' });
    check(same(valueOf(r), { a: 'kept', b: 1 }) && valueOf(r) === localValueOf(r), 'A3-5: `a:false` declares nothing; a stays in local AND emit; validator rejects it', `${state(r)} ajv=${validate(schema, valueOf(r))}`);
  }
  // ---- redteam3 A3-4-omit: guard sees the projected value
  {
    const r = H('', [L('a'), L('b')]);
    declareFragments(r, [{ id: 'then', guard: req('a'), declares: ['b'], defaults: { b: 'B' } }]);
    prime(r, { a: '' });
    check(valueOf(r) === undefined && activeIds(r).length === 0, "A3-4-omit: a='' is absent for the guard (omitEmpty projected) as for the validator — fragment off, no b", state(r));
  }
  // ---- redteam3 A3-4-lift: lifted guard on {addr:null} / {addr:{}}
  {
    const g = G({ properties: { addr: { required: ['zip'] } } });
    const mk = () => {
      const r = H('', [H('addr', [L('zip'), L('city')]), L('zipNote')]);
      declareFragments(r, [{ id: 'then', guard: g, declares: ['zipNote'], defaults: { zipNote: 'has zip' } }]);
      return r;
    };
    const rows = [];
    for (const init of [{}, { addr: {} }, { addr: null }, { addr: { city: 'Seoul' } }, { addr: { zip: '1' } }]) {
      const r = prime(mk(), init);
      rows.push(`${J(init)} -> G=${J(localValueOf(r))} active=${J(activeIds(r))} emit=${J(valueOf(r))} ajvGuard(emit)=${g(valueOf(r) ?? {})}`);
    }
    out(rows.map((s) => `    ${s}`).join('\n'));
    check(true, 'A3-4-lift: fragment on-state equals the guard evaluated on the emit (G1) for every init, incl. {addr:null} and the vacuous {addr:{}}', 'see rows');
  }
  // ---- redteam3 A4a: injectTo two-cycle
  {
    const r = H('', [L('t'), L('u')]);
    prime(r, {});
    declareInjections(r, [
      { from: r.index.get('t'), to: r.index.get('u'), map: (v) => (v ?? 0) + 1 },
      { from: r.index.get('u'), to: r.index.get('t'), map: (v) => (v ?? 0) + 1 },
    ]);
    setValue(r, { t: 0, u: 0 });
    check(same(valueOf(r), rawTree(r)) && lastSettle.rounds === ROUND_CAP && r.settle.status === 'budget-exceeded', 'A4a: cap 25, committed emit == raw (last executed round)', state(r));
  }
  // ---- redteam3 A4b: injectTo from a child inside a fragment its own write turns off
  {
    const r = H('', [L('t'), L('c')]);
    declareFragments(r, [{ id: 'then', guard: notReq('t'), declares: ['c'], defaults: { c: 'C' } }]);
    prime(r, {});
    declareInjections(r, [{ from: r.index.get('c'), to: r.index.get('t'), map: (v) => `from-${v}` }]);
    setValue(r, {});
    info('A4b load', state(r));
    write(r.index.get('t'), undefined);
    check(same(valueOf(r), { t: 'from-C' }), 'A4b: the user cannot remove t — injectTo re-derives it from the inactive c (E7: declared behaviour)', state(r));
  }
  // ---- redteam3 A4c: injectTo 17 into a host
  {
    const r = H('', [L('src'), H('host', [L('a'), L('b', 'BD')])]);
    prime(r, {});
    declareInjections(r, [{ from: r.index.get('src'), to: r.index.get('host'), map: () => 17 }]);
    setValue(r, { src: 'go', host: { a: 'A', b: 'B' } });
    const s1 = state(r);
    const host = r.index.get('host');
    const bRaw = host.index.get('b').raw;
    write(host.index.get('a'), 'A2');
    check(valueOf(r).host === 17 && bRaw === 'BD' && lastSettle.rounds === 2, 'A4c: injectTo 17 = full replacement of the host (a erased, b default injected under 17); a partial write un-17s the host but derive re-injects 17 in round 2 (E7 declared) — the round-3 "partial or full?" is now defined', `after inject: ${s1} b.raw=${J(bRaw)}; after partial: ${state(r)}`);
  }
  // ---- redteam3 A5a: branches with different k defaults -> E8 first branch
  {
    const schema = { type: 'object', oneOf: [{ properties: { k: { const: 'a', default: 'a' }, x: { type: 'string', default: 'X' } }, required: ['k'] }, { properties: { k: { const: 'b', default: 'b' }, y: { type: 'string', default: 'Y' } }, required: ['k'] }] };
    const r = H('', [L('k', 'a'), L('x'), L('y')]);
    declareFragments(r, [
      { id: 'oneOf0', guard: kConst('k', 'a'), declares: ['x'], defaults: { x: 'X' } },
      { id: 'oneOf1', guard: kConst('k', 'b'), declares: ['y'], defaults: { y: 'Y' } },
    ]);
    prime(r, {});
    check(same(valueOf(r), { k: 'a', x: 'X' }) && validate(schema, valueOf(r)) === 'valid', 'A5a: k default = first branch value (E8); empty load is valid — round-3 defect gone', state(r));
  }
  info('A5b/A5c (value union, anyOf same-k select)', 'not modeled: discriminator identification (B) is outside this prototype');
  // ---- redteam3 A6a / codex A6-C1-null
  {
    const r = H('', [L('note', 'D'), L('keep')]);
    prime(r, { note: 'typed', keep: 'K1' });
    setValue(r, null);
    const s1 = state(r);
    write(r.index.get('note'), 'Z');
    check(same(valueOf(r), { note: 'Z' }) && rawTree(r).keep === undefined, 'A6a/A6-C1-null: null is a full replacement — keep erased, note default injected under null, partial write un-nulls: {note:Z}', `null: ${s1}; write: ${state(r)}`);
  }
  // ---- redteam3 A6b: injection under a null host
  {
    const r = H('', [L('a'), L('d')]);
    declareFragments(r, [{ id: 'allOf0.then', guard: notReq('a'), declares: ['d'], defaults: { d: 'D' } }]);
    prime(r, null);
    const s1 = `${state(r)} d.raw=${J(r.index.get('d').raw)}`;
    const dRaw = r.index.get('d').raw;
    write(r.index.get('a'), 'A');
    check(dRaw === 'D' && same(valueOf(r), { a: 'A' }), 'A6b: under null, G={} turns `not required a` on and d default is injected (load contract (i) under null, D-1)', `null: ${s1}; write a: ${state(r)}`);
  }
  // ---- redteam3 A6c
  {
    const schema = { type: 'object', properties: { addr: { type: ['object', 'null'], properties: { zip: { type: 'string' } }, required: ['zip'] } }, required: ['addr'] };
    const rows = [];
    for (const init of [{ addr: null }, { addr: {} }, { addr: { zip: '' } }]) {
      const r = prime(H('', [H('addr', [L('zip')])]), init);
      rows.push(`${J(init)} -> emit=${J(valueOf(r))} ajv=${validate(schema, valueOf(r))}`);
    }
    info('A6c', rows.join(' | '));
  }
  // ---- redteam3 A8a: local changed, emit not -> same reference
  {
    const r = H('', [L('a'), H('addr', [L('zip')])]);
    prime(r, { a: 'x' });
    const before = r.emit;
    let notified = 0;
    subscribe(r, () => notified++);
    write(r.index.get('addr').index.get('zip'), '');
    check(r.emit === before && notified === 0, "A8a/E11: zip:='' keeps the root emit reference (addr still omitted) and notifies nothing", `sameRef=${r.emit === before} notified=${notified} addr.local=${J(localValueOf(r.index.get('addr')))}`);
  }
  // ---- redteam3 C1 / codex C1-write-kinds
  {
    const mk = () => {
      const r = H('', [L('kind'), L('base', 'BASE'), L('a'), L('b')]);
      declareFragments(r, [
        { id: 'a', guard: kConst('kind', 'a'), declares: ['a'], defaults: { a: 'A0' } },
        { id: 'b', guard: kConst('kind', 'b'), declares: ['b'] },
      ]);
      return r;
    };
    const r = prime(mk(), { kind: 'b', b: 'SECRET' });
    setValue(r, { kind: 'a', a: 'NEW', extra: 1 });
    const s1 = J(valueOf(r));
    write(r.index.get('kind'), 'b');
    const s2 = J(valueOf(r));
    check(s1 === '{"kind":"a","base":"BASE","a":"NEW","extra":1}' && s2 === '{"kind":"b","base":"BASE","extra":1}', 'C1: replacement purges the latent SECRET; extras kept in the extras slot and emitted last', `setValueB=${s1} switch=${s2}`);
    setValue(r, { kind: 'a' });
    info('C1 setValue({kind:a}) then getValue()', `${J(valueOf(r))} (defaults re-injected by the load contract; equal only with disableDefaultInjection)`);
    const initial = { kind: 'a', a: 'OLD', b: 'SECRET', extra: 7 };
    const r2 = prime(mk(), initial);
    write(r2.index.get('kind'), 'b');
    const partial = J(valueOf(r2));
    setValue(r2, { kind: 'a', a: 'NEW' });
    write(r2.index.get('kind'), 'b');
    const replaced = J(valueOf(r2));
    setValue(r2, initial);
    const resetRawB = rawTree(r2).b;
    setValue(r2, valueOf(r2));
    write(r2.index.get('kind'), 'b');
    check(partial === '{"kind":"b","base":"BASE","b":"SECRET","extra":7}' && replaced === '{"kind":"b","base":"BASE"}' && resetRawB === 'SECRET' && rawTree(r2).b === undefined, 'C1-write-kinds (codex): partial keeps latent b, replacement drops it, reset restores it, re-emit round-trip has no b', `partial=${partial} replaced=${replaced} resetRaw.b=${resetRawB} reemit=${J(valueOf(r2))}`);
  }
  // ---- redteam3 C2-extra
  {
    const r = H('', [L('kind'), L('e')]);
    declareFragments(r, [{ id: 'then', guard: kConst('kind', 'b'), declares: ['e'], defaults: { e: 'DEF' } }]);
    prime(r, { kind: 'a', e: 'EXTRA' });
    const s1 = J(valueOf(r));
    write(r.index.get('kind'), 'b');
    check(s1 === '{"kind":"a"}' && same(valueOf(r), { kind: 'b', e: 'EXTRA' }) && r.extras === null, 'C2-extra (E16): a key declared by an inactive fragment goes to the child raw, not extras; it appears when the fragment turns on, no default injected', `load=${s1} switch=${state(r)} extras=${J(r.extras)}`);
  }
  // ---- redteam3 C3 / codex C3-host-type
  {
    const schema = { type: 'object', properties: { host: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string', default: 'BD' } } } } };
    const r = H('', [H('host', [L('a'), L('b', 'BD')])]);
    prime(r, { host: { a: 'A', b: 'B', x: 'EXTRA' } });
    const s0 = J(valueOf(r));
    setValue(r.index.get('host'), 17);
    const s1 = `${J(valueOf(r))} ajv=${validate(schema, valueOf(r))} b.raw=${J(rawTree(r).host)}`;
    write(r.index.get('host').index.get('a'), 'A2');
    check(s0 === '{"host":{"a":"A","b":"B","x":"EXTRA"}}' && same(valueOf(r), { host: { a: 'A2', b: 'BD' } }), 'C3: 17 = full replacement (extras and a erased, b default injected); partial write revives {a:A2, b:BD}', `load=${s0} after17=${s1} partial=${J(valueOf(r))}`);
    for (const input of ['broken', []]) {
      const r2 = prime(H('', [L('note'), L('keep')]), { keep: 'OLD' });
      setValue(r2, input);
      const wrong = valueOf(r2);
      write(r2.index.get('note'), 'Z');
      check(same(wrong, input) && same(valueOf(r2), { note: 'Z' }), `C3-host-type ${J(input)}: emit = input while wrong-kind; child write revives only new data`, `wrong=${J(wrong)} recovered=${J(valueOf(r2))}`);
    }
  }

  // ---- a33 (union owned k, k default = first branch)
  {
    const schema = { type: 'object', properties: { name: { type: 'string' } }, oneOf: [
      { properties: { k: { const: 'cat' }, meow: { type: 'string', default: 'M' } }, required: ['k'] },
      { properties: { k: { const: 'dog' }, bark: { type: 'string' } }, required: ['k'] } ] };
    const mk = () => {
      const r = H('', [L('name'), L('k', 'cat'), L('meow'), L('bark')]);
      declareFragments(r, [
        { id: 'cat', guard: kConst('k', 'cat'), declares: ['meow'], defaults: { meow: 'M' } },
        { id: 'dog', guard: kConst('k', 'dog'), declares: ['bark'] },
      ]);
      return r;
    };
    const rows = [];
    for (const init of [{}, { k: 'cat' }, { k: 'zzz', name: 'n' }, { k: '' }]) {
      const r = prime(mk(), init);
      rows.push(`init ${J(init)} -> emit=${J(valueOf(r))} active=${J(activeIds(r))} ajv=${validate(schema, valueOf(r))}`);
    }
    out(rows.map((s) => `    ${s}`).join('\n'));
    const r = prime(mk(), { k: 'cat' });
    write(r.index.get('k'), 'dog');
    check(same(valueOf(r), { k: 'dog' }) && rawTree(r).meow === 'M', 'a33: {} and {k:cat} are valid (k default = first branch, meow injected); zzz preserved and rejected; cat->dog drops meow from emit, keeps raw', `cat->dog: ${state(r)}`);
  }

  // ---- codex A3-1-select (selection slot)
  {
    const r = H('', [L('a'), L('b')]);
    declareFragments(r, [
      { id: 'oneOf0', select: 0, declares: ['a'] },
      { id: 'oneOf1', select: 1, declares: ['b'] },
    ]);
    prime(r, { a: 1, b: 2 });
    const first = J(valueOf(r));
    select(r, 1);
    const second = J(valueOf(r));
    check(first === '{"a":1}' && second === '{"b":2}' && same(rawTree(r), { a: 1, b: 2 }), 'A3-1-select: same raw, selection slot picks the branch (initial selection: tie -> first)', `sel0=${first} sel1=${second} raw=${J(rawTree(r))}`);
  }
  // ---- codex A3-1-value-guards
  {
    const outs = [];
    for (const order of [['a', 'b'], ['b', 'a']]) {
      const r = H('', [L('a'), L('b')]);
      declareFragments(r, [
        { id: 'allOf0.then', guard: notReq('b'), declares: ['a'] },
        { id: 'allOf1.then', guard: notReq('a'), declares: ['b'] },
      ]);
      prime(r, {});
      for (const key of order) write(r.index.get(key), key === 'a' ? 'x' : 'y');
      outs.push(J(valueOf(r)));
    }
    check(outs.every((v) => v === '{"a":"x"}'), 'A3-1-value-guards: opposing presence guards give the same emit for both write orders', outs.join(' / '));
  }
  // ---- codex A3-nested-activation
  {
    const r = H('', [L('seed'), H('child', [L('token', 1)]), L('done')]);
    declareFragments(r, [
      { id: 'allOf0.then', guard: req('seed'), declares: ['child'], defaults: { child: {} } },
      { id: 'allOf1.then', guard: G({ required: ['child'], properties: { child: { required: ['token'] } } }), declares: ['done'], defaults: { done: true } },
    ]);
    prime(r, { seed: true });
    check(same(valueOf(r), { seed: true, child: { token: 1 }, done: true }), 'A3-nested-activation: object default {} then token default then done — via transition rounds', state(r));
  }
  // ---- codex A3-3-A3-4-host
  {
    const mk = () => {
      const r = H('', [L('kind', 'cat'), L('meow'), L('bark')]);
      declareFragments(r, [
        { id: 'union.cat', guard: kConst('kind', 'cat'), declares: ['meow'], defaults: { meow: true } },
        { id: 'union.dog', guard: kConst('kind', 'dog'), declares: ['bark'], defaults: { bark: true } },
      ]);
      return r;
    };
    const empty = prime(mk(), {});
    const loaded = prime(mk(), { kind: 'cat' });
    const nul = prime(mk(), null);
    const scalar = prime(mk(), 17);
    check(same(loaded.emit, { kind: 'cat', meow: true }) && nul.emit === null && scalar.emit === 17 && activeIds(nul).length === 0, 'A3-3/A3-4-host: null and 17 hosts emit their raw, no branch on (G={}), children exist', `empty=${J(valueOf(empty))} loaded=${J(valueOf(loaded))} null=${J(valueOf(nul))} nullChildren=${J(rawTree(nul))} scalar=${J(valueOf(scalar))}`);
  }
  // ---- codex A4-cap (derive semantics)
  {
    const r = H('', [L('n')]);
    prime(r, { n: 0 });
    declareInjections(r, [{ from: r.index.get('n'), to: r.index.get('n'), map: (v) => Math.min(30, (v ?? 0) + 1) }]);
    write(r.index.get('n'), 0);
    check(valueOf(r).n === rawTree(r).n && lastSettle.rounds === ROUND_CAP, 'A4-cap: non-cyclic 30-step injectTo stops at the cap; emit == raw == writes of 24 executed rounds (round 25 is computed, its write is not)', state(r));
  }
  // ---- codex A6-automatic (injectTo into a child under a null host)
  {
    const r = H('', [L('src'), H('host', [L('note'), L('draft')])]);
    declareFragments(r.index.get('host'), [{ id: 'then', guard: notReq('note'), declares: ['draft'], defaults: { draft: 'D' } }]);
    prime(r, { src: 'a', host: { note: 'typed' } });
    declareInjections(r, [{ from: r.index.get('src'), to: r.index.get('host').index.get('note'), map: (v) => `auto-${v}` }]);
    setValue(r.index.get('host'), null);
    const s1 = state(r);
    write(r.index.get('src'), 'b');
    check(valueOf(r).host === null && rawTree(r).host === null, 'A6-automatic: injectTo into a child of a null host is a full replacement of the leaf, not a partial write — the host stays null (A5 literal)', `after null: ${s1}; after inject: ${state(r)}`);
  }
  // ---- codex C2-load
  {
    const rows = [];
    for (const input of [{}, { n: '' }, { n: null }, { n: {} }, { n: 0 }, { n: false }]) {
      const r = prime(H('', [L('n', 'D')]), { ...input, extra: 42 });
      rows.push(`${J(input)} -> raw.n=${J(rawTree(r).n)} emit=${J(valueOf(r))}`);
    }
    out(rows.map((s) => `    ${s}`).join('\n'));
    const rows2 = rows.map((s) => s.includes('extra":42'));
    check(rows2.every(Boolean), "C2-load: extras kept (42); '' / null / {} / 0 / false are values (no default); {} gets 'D'", 'see rows');
    const tail = array('tail', () => L(0));
    tail.omitTrailing = true;
    const r = prime(H('', [tail]), { tail: ['a', null, null] });
    check(same(valueOf(r), { tail: ['a'] }) && same(rawTree(r).tail, ['a', null, null]), 'C2-load omitTrailing: raw keeps [a,null,null], emit [a]', state(r));
  }
  // ---- codex C1-activation-default
  {
    const r = H('', [L('on'), L('child')]);
    declareFragments(r, [{ id: 'then', guard: kConst('on', true), declares: ['child'], defaults: { child: 'D' } }]);
    prime(r, { on: false });
    write(r.index.get('on'), true);
    check(same(rawTree(r), { on: true, child: 'D' }), 'C1-activation-default: a partial write that turns a fragment on injects the default (transition)', state(r));
  }
}

// ======================================================================= b
function scenarioB() {
  out('b. determinism (A1-1) incl. serialization (A4-7)');
  const mk = () => {
    const r = H('', [L('a'), L('b'), L('c'), L('d')]);
    declareFragments(r, [
      { id: 'ifA', guard: req('a'), declares: ['c'] },
      { id: 'ifB', guard: req('b'), declares: ['d'] },
    ]);
    return prime(r, {});
  };
  const orders = {
    'd,b,c,a': (r) => { for (const k of ['d', 'b', 'c', 'a']) write(r.index.get(k), `v${k}`); },
    'a,c,b,d': (r) => { for (const k of ['a', 'c', 'b', 'd']) write(r.index.get(k), `v${k}`); },
    batch: (r) => batch(r, () => { for (const k of ['c', 'd', 'b', 'a']) write(r.index.get(k), `v${k}`); }),
    load: (r) => setValue(r, { d: 'vd', c: 'vc', b: 'vb', a: 'va' }),
  };
  const texts = {};
  for (const [name, run] of Object.entries(orders)) {
    const r = mk();
    run(r);
    texts[name] = J(valueOf(r));
  }
  check(new Set(Object.values(texts)).size === 1 && texts.load === '{"a":"va","b":"vb","c":"vc","d":"vd"}', 'identical emit AND identical JSON text (schema key order) across 4 write orders', J(texts));
  const r = mk();
  setValue(r, { z: 2, a: 'va', y: 1 });
  check(J(valueOf(r)) === '{"a":"va","z":2,"y":1}', 'extras after declared keys, in insertion order', J(valueOf(r)));
}

// ======================================================================= c
function scenarioC() {
  out('c. null contract (#338 nullable.object-blank-state lines 31 / 42 / 148) + record swap');
  const mk1 = () => H('', [H('target', [L('note'), L('reason', 'because')])]);
  const filled = { target: { note: 'typed', reason: 'edited' } };
  {
    const r = prime(mk1(), filled);
    const t = r.index.get('target');
    setValue(r, { target: null });
    check(same(valueOf(r), { target: null }) && t.index.get('note').raw === undefined && t.index.get('reason').raw === 'because', "line 31: after setValue({target:null}) emit {target:null}; note reads '' (absent), reason reads 'because'", `emit=${J(valueOf(r))} note.raw=${J(t.index.get('note').raw)} reason.raw=${J(t.index.get('reason').raw)} refreshed=${J(lastSettle.refreshed)}`);
    write(t.index.get('note'), 'again');
    check(same(valueOf(r), { target: { note: 'again', reason: 'because' } }), "line 42: typing note='again' promotes to exactly the blank form plus the write", J(valueOf(r)));
  }
  {
    const r = prime(mk1(), { target: null });
    const t = r.index.get('target');
    write(t.index.get('reason'), '');
    const s1 = J(valueOf(r));
    write(t.index.get('note'), 'again');
    info("line 55 (not required by the brief): clear reason under null then type note — test expects {target:null} then {target:{note:'again'}}", `after clear=${s1} after type=${J(valueOf(r))} (A5 literal: any partial write un-nulls the host; a '' write is a partial write)`);
  }
  {
    const mk = () => {
      const target = H('target', [L('kind', 'a'), L('note', 'N'), L('aValue'), L('bValue')]);
      declareFragments(target, [
        { id: 'a', guard: kConst('kind', 'a'), declares: ['aValue'] },
        { id: 'b', guard: kConst('kind', 'b'), declares: ['bValue'], defaults: { bValue: 'B' } },
      ]);
      return H('', [target]);
    };
    const seed = { target: { kind: 'b', note: 'seeded', bValue: 'x' } };
    const r = prime(mk(), seed);
    const t = r.index.get('target');
    setValue(r, { target: null });
    const s1 = state(r);
    write(t.index.get('note'), 'typed');
    const s2 = J(valueOf(r));
    write(t.index.get('kind'), 'a');
    write(t.index.get('kind'), 'b');
    check(same(valueOf(r), { target: { kind: 'b', note: 'typed', bValue: 'B' } }), 'line 148: through null then branch round-trip a->b gives {kind:b, note:typed, bValue:B} (blank, not the seed)', `null: ${s1}; typed: ${s2}; roundTrip: ${J(valueOf(r))}`);
  }
  {
    const r = prime(mk1(), { target: { note: 'secret', reason: 'r' } });
    setValue(r, { target: null });
    write(r.index.get('target').index.get('note'), 'x');
    const text = J(valueOf(r));
    check(!text.includes('secret') && !text.includes('"r"'), 'record swap: load A then load B={target:null} then type note -> no leak of A', text);
  }
}

// ======================================================================= d
function scenarioD() {
  out('d. chains / negated guard fixpoint / self-negating budget');
  info('chains', 'see a. A3-2 rows (raw-present: forward 2 sweeps, reverse 31; default-driven: ROUND_CAP)');
  info('negated guard + other activation', 'see a. A3-4A/option-B row (ajv-accepted fixpoint {seed:true,x:1})');
  info('self-negating', 'see a. A3-4C row (budget-exceeded, no throw in prod, dev throws after commit)');
  const r = H('', [L('x'), L('y'), L('z')]);
  declareFragments(r, [
    { id: 'notX', guard: notReq('x'), declares: ['y'] },
    { id: 'reqY', guard: req('y'), declares: ['x'] },
  ]);
  prime(r, { x: 1, y: 1 });
  const composed = { type: 'object', allOf: [{ if: { not: { required: ['x'] } }, then: { properties: { y: {} } }, else: { not: { required: ['y'] } } }, { if: { required: ['y'] }, then: { properties: { x: {} } } }] };
  check(r.settle.status === 'budget-exceeded', 'v3 scenario h (mutual: notX declares y, reqY declares x, raw {x:1,y:1}): NO fixpoint under option B -> budget-exceeded, A fixed at the last sweep; ajv rejects the emit while {} would pass -> A4-1 "reaches a fixpoint" is not general', `${state(r)} sweeps=${r.settle.sweeps} ajv=${validate(composed, valueOf(r))} ajv({})=${validate(composed, {})}`);
}

// ======================================================================= e
function scenarioE() {
  out('e. inherited overlay (A4-6)');
  const child = H('child', [L('p'), L('r'), L('q')]);
  declareFragments(child, [{ id: 'child.allOf0.then', guard: req('q'), declares: ['r'], defaults: { r: 'R' } }]);
  const r = H('', [L('flag'), child]);
  declareFragments(r, [{ id: 'allOf0.then', guard: req('flag'), overlays: [{ host: 'child', declares: ['q'], defaults: { q: 'Q' } }] }]);
  prime(r, { flag: 'on', child: { p: 'P' } });
  const s1 = state(r);
  check(same(valueOf(r), { flag: 'on', child: { p: 'P', r: 'R', q: 'Q' } }), 'lifted then declaring grandchild q: q injected and child fragment (required q) chains to r', `${s1} childActive=${J(activeIds(child))}`);
  write(r.index.get('flag'), undefined);
  check(same(valueOf(r), { child: { p: 'P' } }) && rawTree(r).child.q === 'Q', 'parent guard off -> overlay off -> q and r disappear from emit (raw kept)', `${state(r)} childActive=${J(activeIds(child))}`);
  write(r.index.get('flag'), 'on');
  check(same(valueOf(r), { flag: 'on', child: { p: 'P', r: 'R', q: 'Q' } }), 'parent guard on again -> q and r reappear', state(r));
}

// ======================================================================= f
function scenarioF() {
  out('f. disableDefaultInjection (A2)');
  const mk = (opts) => {
    const r = H('', [L('id'), L('status', 'pending'), L('kind'), L('x')]);
    declareFragments(r, [{ id: 'then', guard: kConst('kind', 'k'), declares: ['x'], defaults: { x: 'X' } }]);
    return prime(r, { id: 101 }, opts);
  };
  const r = mk({ disableDefaultInjection: true });
  check(same(valueOf(r), { id: 101 }), 'sparse load {id:101} with the flag: no status default', J(valueOf(r)));
  write(r.index.get('kind'), 'k');
  check(same(valueOf(r), { id: 101, kind: 'k', x: 'X' }), 'a later user-caused activation still injects x', J(valueOf(r)));
  const r2 = mk();
  check(same(valueOf(r2), { id: 101, status: 'pending' }), 'without the flag: status injected', J(valueOf(r2)));
  setValue(r, { id: 5, kind: 'k' });
  check(same(valueOf(r), { id: 5, kind: 'k' }), 'with the flag a later full replacement that turns a fragment on injects nothing in that settle (ii)', J(valueOf(r)));
}

// ======================================================================= g
function scenarioG() {
  out('g. notification (B)');
  const mk = () => {
    const leafN = L('x');
    const mid = H('mid', [leafN, L('y')]);
    const r = H('', [mid, L('top')]);
    prime(r, { mid: { x: 'a', y: 'b' }, top: 't' });
    return { r, mid, leafN };
  };
  // 1. order
  {
    const { r, mid, leafN } = mk();
    const order = [];
    subscribe(leafN, () => order.push('leaf'));
    subscribe(mid, () => order.push('mid'));
    subscribe(r, () => order.push('root'));
    write(leafN, 'a2');
    const o1 = order.join(',');
    order.length = 0;
    setValue(r, { mid: { x: 'z', y: 'b' }, top: 'u' });
    check(o1 === 'root,mid,leaf' && order.join(',') === 'root,mid,leaf', 'g1: delivery order root, mid, leaf for a leaf write and a root write', `leafWrite=${o1} rootWrite=${order.join(',')}`);
  }
  // 2. fixed-snapshot wave with a listener write
  {
    const { r, mid, leafN } = mk();
    const seen = [];
    subscribe(mid, (p, node) => {
      const wave = lastSettle.waves;
      if (p.current.emit.x === 'a2') write(leafN, 'a3');
      seen.push(`w${wave} mid payload=${J(p.current.emit)} value=${J(valueOf(node))}`);
    });
    subscribe(leafN, (p, node) => seen.push(`w${lastSettle.waves} leaf payload=${J(p.current)} value=${J(valueOf(node))}`));
    write(leafN, 'a2');
    const w1 = seen.filter((s) => s.startsWith('w1'));
    const w2 = seen.filter((s) => s.startsWith('w2'));
    check(w1.length === 2 && w1[0].includes('payload={"x":"a2"') && w1[0].includes('value={"x":"a3"') && w1[1].includes('payload="a2"') && w1[1].includes('value="a3"') && w2.length === 2 && lastSettle.waves === 2, 'g2: wave-1 payloads show the wave-1 commit while node value shows the new commit; mid/leaf notified again in wave 2', seen.join(' | '));
  }
  // 3. batch
  {
    const r = H('', Array.from({ length: 1000 }, (_, i) => L(`f${i}`)));
    prime(r, {});
    let onChange = 0;
    let notified = 0;
    r.onChange = () => onChange++;
    for (const c of r.children) subscribe(c, () => notified++);
    resetCounters();
    batch(r, () => { for (let i = 0; i < 1000; i++) write(r.children[i], `v${i}`); });
    const w1 = lastSettle.waves;
    const s1 = counters.settles;
    resetCounters();
    batch(r, () => { batch(r, () => { for (let i = 0; i < 500; i++) write(r.children[i], `w${i}`); }); batch(r, () => { for (let i = 500; i < 1000; i++) write(r.children[i], `w${i}`); }); });
    check(w1 === 1 && s1 === 1 && onChange === 2 && counters.settles === 1 && lastSettle.waves === 1 && notified === 2000, 'g3: 1,000 writes in one batch -> one settle, one wave, one onChange; nested batch -> still one', `waves=${w1}/${lastSettle.waves} settles=${s1}/${counters.settles} onChange=${onChange} leafNotifications=${notified}`);
  }
  // 4. listener throws
  {
    const { r, mid, leafN } = mk();
    const order = [];
    subscribe(r, () => { throw new Error('boom'); });
    subscribe(mid, () => order.push('mid'));
    subscribe(leafN, () => order.push('leaf'));
    const rev0 = r.revision;
    write(leafN, 'a2');
    check(order.join(',') === 'mid,leaf' && r.revision === rev0 + 1 && lastSettle.errors.length === 1, 'g4: a throwing listener is isolated; later nodes notified; revision advanced', `order=${order.join(',')} rootRevision=${r.revision - rev0} errors=${lastSettle.errors.map((e) => e.error.message).join(',')}`);
  }
  // 5. detached between mark and notify
  {
    const items = array('items', (i) => H(i, [L('v')]));
    const r = H('', [items]);
    prime(r, { items: [{ v: 1 }, { v: 2 }, { v: 3 }] });
    const item2 = items.children[2];
    const delivered = [];
    subscribe(r, () => { if (item2.parent !== null) remove(items, 2); });
    subscribe(item2, () => delivered.push('item2'));
    subscribe(item2.index.get('v'), () => delivered.push('item2/v'));
    write(item2.index.get('v'), 9);
    check(delivered.length === 0 && item2.detached && lastSettle.delivered.every((d) => !d.path.startsWith('/items/2')), 'g5: root listener removes item 2 during wave 1 -> item 2 and its leaf are skipped', `delivered=${J(delivered)} waveLog=${J(lastSettle.delivered)}`);
  }
  // 6. same-value write
  {
    const { r, mid, leafN } = mk();
    let n = 0;
    for (const node of [r, mid, leafN]) subscribe(node, () => n++);
    const rev = [r.revision, mid.revision, leafN.revision];
    write(leafN, 'a');
    check(n === 0 && r.revision === rev[0] && leafN.revision === rev[2], 'g6: writing the same value changes no emit -> no notification, no revision', `notified=${n} rounds=${lastSettle.rounds}`);
  }
  // 7. RequestRefresh
  {
    const r = H('', [L('a'), L('b')]);
    prime(r, {});
    declareInjections(r, [{ from: r.index.get('a'), to: r.index.get('b'), map: (v) => (v === undefined ? undefined : `${v}!`) }]);
    const refresh = [];
    subscribe(r.index.get('a'), (p) => { if (p.refresh) refresh.push('a'); });
    subscribe(r.index.get('b'), (p) => { if (p.refresh) refresh.push('b'); });
    write(r.index.get('a'), 'ab');
    check(refresh.join(',') === 'b' && lastSettle.refreshed.join(',') === '/b', "g7: typing 'ab' -> no Refresh on a; injectTo changing sibling b -> Refresh on b only", `refresh=${J(refresh)} lastSettle.refreshed=${J(lastSettle.refreshed)} emit=${J(valueOf(r))}`);
  }
  // wave cap
  {
    const { r, leafN } = mk();
    let n = 0;
    subscribe(leafN, () => { if (n < 40) write(leafN, `p${n++}`); });
    let threw = null;
    try { write(leafN, 'go'); } catch (e) { threw = e.message; }
    check(threw === null && lastSettle.waves === 41 && lastSettle.wavesExceeded && r.settle.status === 'wave-cap-exceeded', 'wave cap (B3-4, literal): all 41 waves delivered, overflow recorded in settle, no throw in prod', `waves=${lastSettle.waves} status=${r.settle.status}`);
  }
}

export function selfCheck() {
  setTrace(true);
  scenarioA();
  scenarioB();
  scenarioC();
  scenarioD();
  scenarioE();
  scenarioF();
  scenarioG();
  out(failures === 0 ? 'all v4 scenarios passed' : `${failures} FAILURES`);
  return failures;
}

if (process.argv[1]?.endsWith('selfcheck-v4c.mjs')) {
  process.exit(selfCheck() === 0 ? 0 : 1);
}
