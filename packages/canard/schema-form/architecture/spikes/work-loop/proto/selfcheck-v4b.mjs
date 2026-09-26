/**
 * Executable scenarios for the loop-v4b rule (round-5 C-1/C-7): an empty
 * value activates no select-guard branch. `node proto/selfcheck-v4b.mjs`
 *
 *  a  X2 (raw-round5-devil.md 부록 A): prime({}) on a select-guard union
 *  b  loaded value follows F6 (round-4 U9: only branch 1 declares c)
 *  c  explicit select(0) on an empty host injects branch 0 defaults (A2)
 *  d  reset() after (c): selection back to none, branch raw erased
 *  e  discriminated union (guard fragments) unchanged by the rule
 *  f  undefined points — recorded as INFO, not asserted
 */
import {
  activeIds,
  attach,
  counters,
  declareFragments,
  leaf,
  NO_SELECTION,
  object,
  prime,
  rawTree,
  reset,
  resetCounters,
  select,
  setValue,
  valueOf,
  write,
} from './loop-v4b.mjs';
import { ajv } from './build-v4.mjs';

let failures = 0;
const out = (s) => process.stdout.write(`${s}\n`);
const J = (v) => (v === undefined ? 'undefined' : JSON.stringify(v));
const check = (cond, label, observed) => {
  if (!cond) failures++;
  out(`  ${cond ? 'PASS' : 'FAIL'} ${label} — observed: ${observed}`);
};
const info = (label, observed) => out(`  INFO ${label}: ${observed}`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const kConst = (k, v) => ajv.compile({ required: [k], properties: { [k]: { const: v } } });
const state = (r) => `emit=${J(valueOf(r))} raw=${J(rawTree(r))} active=${J(activeIds(r))} selection=${r.selection} injections=${counters.injections}`;

/** X2 tree: select-guard union, branch A declares a (default 'A'), branch B declares b (default 'B'). */
function unionAB() {
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  declareFragments(root, [
    { id: 'A', select: 0, declares: ['a'], defaults: { a: 'A' } },
    { id: 'B', select: 1, declares: ['b'], defaults: { b: 'B' } },
  ]);
  return root;
}

/** U9 tree: branch 0 declares a, branch 1 declares c; c has no default. */
function unionAC() {
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('c'));
  declareFragments(root, [
    { id: 'A', select: 0, declares: ['a'], defaults: { a: 'A' } },
    { id: 'C', select: 1, declares: ['c'] },
  ]);
  return root;
}

/** Discriminated union on `kind` (guard fragments); `kindDefault` optional. */
function catDog(kindDefault) {
  const root = object('root');
  attach(root, leaf('kind', kindDefault));
  attach(root, leaf('meow'));
  attach(root, leaf('bark'));
  declareFragments(root, [
    { id: 'union.cat', guard: kConst('kind', 'cat'), declares: ['meow'], defaults: { meow: true } },
    { id: 'union.dog', guard: kConst('kind', 'dog'), declares: ['bark'], defaults: { bark: true } },
  ]);
  return root;
}

function scenarioA() {
  out('a. X2 — empty value on a select-guard union');
  resetCounters();
  const r = prime(unionAB(), {});
  check(activeIds(r).length === 0 && valueOf(r) === undefined && same(rawTree(r), {}) && counters.injections === 0 && r.selection === NO_SELECTION, 'prime({}) -> no branch, emit undefined, no injection', state(r));
  resetCounters();
  const u = prime(unionAB(), undefined);
  check(activeIds(u).length === 0 && valueOf(u) === undefined && counters.injections === 0, 'prime(undefined) -> same as {}', state(u));
}

function scenarioB() {
  out('b. loaded value — F6 picks the branch that declares the most value keys');
  resetCounters();
  const r = prime(unionAC(), { c: 'C' });
  check(same(activeIds(r), ['C']) && same(valueOf(r), { c: 'C' }) && counters.injections === 0, 'prime({c:C}) -> branch C (U9), no injection', state(r));
  resetCounters();
  const t = prime(unionAB(), { a: 1, b: 2 });
  check(same(activeIds(t), ['A']) && same(valueOf(t), { a: 1 }), 'prime({a:1,b:2}) -> tie -> first branch (A3-1-select unchanged)', state(t));
  resetCounters();
  const l = prime(unionAB(), { b: 'loaded' });
  check(same(activeIds(l), ['B']) && same(valueOf(l), { b: 'loaded' }) && counters.injections === 0, 'prime({b:loaded}) -> branch B, its default not injected over the loaded value', state(l));
}

function scenarioC() {
  out('c. explicit selection on an empty host');
  resetCounters();
  const r = prime(unionAB(), {});
  select(r, 0);
  check(same(activeIds(r), ['A']) && same(valueOf(r), { a: 'A' }) && counters.injections === 1, 'select(0) on {} -> branch A on, default a=A injected (OFF->ON, A2)', state(r));
  select(r, 1);
  check(same(activeIds(r), ['B']) && same(valueOf(r), { b: 'B' }) && same(rawTree(r), { a: 'A', b: 'B' }) && counters.injections === 2, 'select(1) -> branch B on, b=B injected; a raw kept (hidden)', state(r));
  select(r, NO_SELECTION);
  check(activeIds(r).length === 0 && valueOf(r) === undefined && same(rawTree(r), { a: 'A', b: 'B' }), 'select(NO_SELECTION) -> no branch, emit undefined, raw untouched', state(r));
  return r;
}

function scenarioD() {
  out('d. reset() after an explicit selection');
  resetCounters();
  const r = prime(unionAB(), {});
  select(r, 0);
  reset(r);
  check(r.selection === NO_SELECTION && activeIds(r).length === 0 && valueOf(r) === undefined && same(rawTree(r), {}), 'reset() -> selection none, branch raw erased (full replacement), emit undefined', state(r));
  const l = prime(unionAB(), { b: 'loaded' });
  select(l, 0);
  reset(l);
  check(same(activeIds(l), ['B']) && same(valueOf(l), { b: 'loaded' }), 'reset() on a loaded host -> initial F6 selection restored (B), loaded value back', state(l));
  const s = prime(unionAB(), {});
  select(s, 0);
  setValue(s, {});
  check(s.selection === NO_SELECTION && activeIds(s).length === 0 && valueOf(s) === undefined, 'setValue({}) after select(0) -> full replacement clears the selection too', state(s));
}

function scenarioE() {
  out('e. discriminated union (guard fragments) unchanged');
  resetCounters();
  const e = prime(catDog(undefined), {});
  check(activeIds(e).length === 0 && valueOf(e) === undefined && counters.injections === 0, 'kind without default: {} -> no branch, no injection (D-8)', state(e));
  const c = prime(catDog(undefined), { kind: 'cat' });
  check(same(activeIds(c), ['union.cat']) && same(valueOf(c), { kind: 'cat', meow: true }), '{kind:cat} -> cat, meow default injected', state(c));
  const d = prime(catDog('cat'), {});
  check(same(activeIds(d), ['union.cat']) && same(valueOf(d), { kind: 'cat', meow: true }), 'kind default cat (schema-declared): {} -> cat as in selfcheck-v4 A3-3 (unchanged)', state(d));
}

function scenarioF() {
  out('f. undefined points — "host has at least one raw value" (INFO only)');
  resetCounters();
  const x = prime(unionAB(), { zzz: 1 });
  info('prime({zzz:1}) extra key only', state(x));
  const root = object('root');
  attach(root, leaf('id'));
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  declareFragments(root, [
    { id: 'A', select: 0, declares: ['a'], defaults: { a: 'A' } },
    { id: 'B', select: 1, declares: ['b'], defaults: { b: 'B' } },
  ]);
  resetCounters();
  prime(root, { id: 5 });
  info('prime({id:5}) unconditional child only', state(root));
  resetCounters();
  const n = prime(unionAB(), null);
  info('prime(null) non-object host', state(n));
  resetCounters();
  const w = prime(unionAB(), {});
  write(w.index.get('a'), 'typed');
  info('write(a,"typed") on an empty host without selecting (partial write keeps selection none)', state(w));
  resetCounters();
  const m = prime(unionAB(), {});
  setValue(m, { a: 'merged' }, 'Merge');
  info('setValue({a:merged},Merge) on an empty host (Merge does not recompute selection)', state(m));
  resetCounters();
  const o = prime(unionAB(), {});
  setValue(o, { a: 'over' });
  info('setValue({a:over}) Overwrite on an empty host (full replacement -> F6)', state(o));
}

export function selfCheck() {
  failures = 0;
  scenarioA();
  scenarioB();
  scenarioC();
  scenarioD();
  scenarioE();
  scenarioF();
  out(failures === 0 ? 'all v4b scenarios passed' : `${failures} FAILURES`);
  return failures;
}

if (process.argv[1]?.endsWith('selfcheck-v4b.mjs')) {
  process.exit(selfCheck() === 0 ? 0 : 1);
}
