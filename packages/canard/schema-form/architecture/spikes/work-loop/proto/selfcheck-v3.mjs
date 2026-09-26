/**
 * Executable scenarios for the round-3 spec claims A3-1..A3-4 and rules A4,
 * A5, A6, A3-5, run against loop-v3. Each scenario prints PASS/FAIL lines with
 * the observed value. `node proto/selfcheck-v3.mjs`
 */
import {
  attach,
  batch,
  counters,
  declareFragments,
  declareInjections,
  flush,
  lastSettle,
  leaf,
  localValueOf,
  object,
  prime,
  resetCounters,
  ROUND_CAP,
  setValue,
  valueOf,
  write,
} from './loop-v3.mjs';
import { ajv } from './build-v3.mjs';

let failures = 0;
const out = (s) => process.stdout.write(`${s}\n`);
const show = (v) => (v === undefined ? 'undefined' : JSON.stringify(v));
const check = (cond, label, observed) => {
  if (!cond) failures++;
  out(`  ${cond ? 'PASS' : 'FAIL'} ${label} — observed: ${observed}`);
};
/** Guard wrapper that records every input it saw (shallow copies). */
const spy = (schema) => {
  const g = ajv.compile(schema);
  const seen = [];
  const guard = (L) => {
    seen.push({ ...L });
    return g(L);
  };
  guard.seen = seen;
  return guard;
};

/** a. S3-b determinism: same raw via four write orders -> identical emit. */
function scenarioA() {
  out('a. S3-b determinism (A3-1)');
  const schema = {
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'string' } },
    allOf: [
      { if: { required: ['a'] }, then: { properties: { b: false } } },
      { if: { required: ['b'] }, then: { properties: { a: false } } },
    ],
  };
  const validate = ajv.compile(schema);
  const build = () => {
    const root = object('');
    attach(root, leaf('a'));
    attach(root, leaf('b'));
    declareFragments(root, [
      { guard: ajv.compile({ required: ['a'] }), prohibits: ['b'] },
      { guard: ajv.compile({ required: ['b'] }), prohibits: ['a'] },
    ]);
    prime(root);
    return root;
  };
  const orders = {
    'a then b': (r) => {
      write(r.index.get('a'), 'x');
      flush(r);
      write(r.index.get('b'), 'y');
      flush(r);
    },
    'b then a': (r) => {
      write(r.index.get('b'), 'y');
      flush(r);
      write(r.index.get('a'), 'x');
      flush(r);
    },
    batch: (r) =>
      batch(r, () => {
        write(r.index.get('a'), 'x');
        write(r.index.get('b'), 'y');
      }),
    load: (r) => {
      setValue(r, { a: 'x', b: 'y' });
      flush(r);
    },
  };
  const emits = {};
  const locals = {};
  for (const [name, run] of Object.entries(orders)) {
    const r = build();
    run(r);
    emits[name] = show(valueOf(r));
    locals[name] = show(localValueOf(r));
  }
  const set = new Set(Object.values(emits));
  check(set.size === 1, 'identical emit across 4 orders', JSON.stringify(emits));
  const canon = (s) => (s === 'undefined' ? s : JSON.stringify(Object.entries(JSON.parse(s)).sort()));
  check(new Set(Object.values(locals).map(canon)).size === 1, 'identical local (as a map) across 4 orders', JSON.stringify(locals));
  check(new Set(Object.values(locals)).size === 1, 'identical local JSON text (key order) across 4 orders', JSON.stringify(locals));
  // Key order without any fragment: is the emit's serialization history-free?
  const plain = () => {
    const r = object('');
    attach(r, leaf('a'));
    attach(r, leaf('b'));
    prime(r);
    return r;
  };
  const p1 = plain();
  write(p1.index.get('a'), 'x');
  flush(p1);
  write(p1.index.get('b'), 'y');
  flush(p1);
  const p2 = plain();
  write(p2.index.get('b'), 'y');
  flush(p2);
  write(p2.index.get('a'), 'x');
  flush(p2);
  check(JSON.stringify(valueOf(p1)) === JSON.stringify(valueOf(p2)), 'no-fragment emit JSON text identical across write orders', `${JSON.stringify(valueOf(p1))} vs ${JSON.stringify(valueOf(p2))}`);
  const r = build();
  orders.load(r);
  const emit = valueOf(r) ?? {};
  const local = localValueOf(r);
  out(`  INFO emit=${show(valueOf(r))} local=${show(local)} raw={a:'x',b:'y'}`);
  out(`  INFO ajv(full schema) on emit ${show(emit)} -> ${validate(emit)}; on raw -> ${validate({ a: 'x', b: 'y' })}`);
}

/** b. S3-c chain of 30 dependent fragments, declared forward and reversed. */
function scenarioB() {
  out('b. dependency chain of 30 (A3-2)');
  const N = 30;
  const build = (reverse) => {
    const root = object('');
    for (let i = 0; i <= N; i++) attach(root, leaf(`p${i}`, i === 0 ? undefined : 1));
    const frags = [];
    for (let i = 0; i < N; i++) {
      frags.push({ guard: ajv.compile({ required: [`p${i}`] }), declares: [`p${i + 1}`] });
    }
    if (reverse) frags.reverse();
    declareFragments(root, frags);
    prime(root);
    return root;
  };
  for (const reverse of [false, true]) {
    const root = build(reverse);
    const e0 = valueOf(root);
    resetCounters();
    write(root.index.get('p0'), 1);
    flush(root);
    const e = valueOf(root);
    const keys = Object.keys(e ?? {}).length;
    const allOne = e !== undefined && Array.from({ length: N }, (_, i) => e[`p${i + 1}`] === 1).every(Boolean);
    check(
      allOne && keys === N + 1,
      `${reverse ? 'reverse' : 'forward'} order resolves p1..p${N} from p0`,
      `empty-form emit=${show(e0)}; after p0=1: ${keys} keys, sweeps=${lastSettle.sweeps}, guards=${counters.guards}, re-guards(ignored, option A)=${counters.reguards}, cap=${N + 1}, budgetExceeded=${lastSettle.budgetExceeded}`,
    );
  }
}

/** c. S5 prohibition: a present -> a prohibited, no feedback, one settle. */
function scenarioC() {
  out('c. prohibition fragment (A3 step 5 / S5)');
  const root = object('');
  attach(root, leaf('a'));
  const guard = spy({ required: ['a'] });
  declareFragments(root, [{ guard, prohibits: ['a'] }]);
  prime(root);
  resetCounters();
  guard.seen.length = 0;
  let threw = null;
  try {
    write(root.index.get('a'), 'v');
    flush(root);
  } catch (e) {
    threw = e.message;
  }
  const a = root.index.get('a');
  check(threw === null && counters.settles === 1, 'terminates in one settle', `threw=${threw}, settles=${counters.settles}, sweeps=${lastSettle.sweeps}`);
  check(valueOf(root) === undefined || valueOf(root).a === undefined, 'emit excludes a', show(valueOf(root)));
  check(a.raw === 'v', "a's raw preserved", show(a.raw));
  check(root.fragOn[0] === 1, 'fragment active', `fragOn=${Array.from(root.fragOn)}`);
  check(guard.seen.some((L) => L.a === 'v'), 'guard saw a', JSON.stringify(guard.seen));
  out(`  INFO local (node.value, A8)=${show(localValueOf(root))}; emit (getValue)=${show(valueOf(root))}`);
  const validate = ajv.compile({
    type: 'object',
    properties: { a: { type: 'string' } },
    allOf: [{ if: { required: ['a'] }, then: { properties: { a: false } } }],
  });
  out(`  INFO ajv on emit ${show(valueOf(root) ?? {})} -> ${validate(valueOf(root) ?? {})}; on local -> ${validate(localValueOf(root))}`);
}

/** Build a union host: discriminator `kind` owned by the host, branches cat/dog. */
function unionHost(name) {
  const host = object(name);
  attach(host, leaf('kind'));
  attach(host, leaf('meow'));
  attach(host, leaf('bark'));
  const cat = spy({ required: ['kind'], properties: { kind: { const: 'cat' } } });
  const dog = spy({ required: ['kind'], properties: { kind: { const: 'dog' } } });
  declareFragments(host, [
    { guard: cat, declares: ['meow'], rank: 3 },
    { guard: dog, declares: ['bark'], rank: 3 },
  ]);
  host.spies = { cat, dog };
  return host;
}

/** d. S2: union-owned discriminator. */
function scenarioD() {
  out('d. union-owned discriminator (A5 / S2)');
  const root = unionHost('');
  prime(root);
  check(root.index.has('kind') && root.index.get('kind').conditional === false, 'kind node exists, unconditional', `conditional=${root.index.get('kind').conditional}`);
  check(valueOf(root) === undefined, 'empty form emit (reading: local {} with no defined key -> omitted -> undefined at root)', `emit=${show(valueOf(root))} local=${show(localValueOf(root))} fragOn=${Array.from(root.fragOn)}`);
  setValue(root, { kind: 'cat', meow: 1 });
  flush(root);
  check(JSON.stringify(valueOf(root)) === JSON.stringify({ kind: 'cat', meow: 1 }), 'load {kind:cat, meow:1} keeps both', show(valueOf(root)));
  write(root.index.get('kind'), 'dog');
  flush(root);
  const e = valueOf(root);
  check(e.kind === 'dog' && e.meow === undefined && !('meow' in e), 'flip to dog drops cat fields from emit', show(e));
  check(root.index.get('meow').raw === 1, 'meow raw preserved', show(root.index.get('meow').raw));
  check(root.index.get('meow').active === false && root.index.get('bark').active === true, 'active flags follow the branch', `meow=${root.index.get('meow').active} bark=${root.index.get('bark').active}`);
}

/** e. S8: nested union host with no value — guards see {} and stay off. */
function scenarioE() {
  out('e. nested empty union (A3-4 / S8)');
  const root = object('');
  attach(root, leaf('title'));
  const pet = attach(root, unionHost('pet'));
  prime(root);
  const on = Array.from(pet.fragOn);
  check(on.every((x) => x === 0), 'no branch of pet active', `fragOn=${on} pet.emit=${show(valueOf(pet))} root.emit=${show(valueOf(root))}`);
  check(pet.spies.cat.seen.every((L) => typeof L === 'object' && L !== null && L.kind === undefined), 'guards saw an object without kind', JSON.stringify(pet.spies.cat.seen));
}

/** f. A6: parent set to null keeps children's raw; emit null meanwhile. */
function scenarioF() {
  out('f. null host (A6 / S7)');
  const root = object('');
  const parent = attach(root, object('parent'));
  attach(parent, leaf('note', 'D'));
  attach(parent, leaf('keep'));
  const cond = spy({ not: { required: ['note'] } });
  attach(parent, leaf('flag', 'F'));
  declareFragments(parent, [{ guard: cond, declares: ['flag'] }]);
  prime(root);
  write(parent.index.get('note'), 'typed');
  write(parent.index.get('keep'), 'K1');
  flush(root);
  out(`  INFO before null: emit=${show(valueOf(root))}`);
  cond.seen.length = 0;
  setValue(parent, null);
  flush(root);
  const note = parent.index.get('note');
  const keep = parent.index.get('keep');
  check(valueOf(parent) === null && valueOf(root).parent === null, 'emit is null while parent is null', `parent.emit=${show(valueOf(parent))} root.emit=${show(valueOf(root))}`);
  check(note.raw === 'typed' && keep.raw === 'K1', "children's raw survived under null", `note=${show(note.raw)} keep=${show(keep.raw)}`);
  check(cond.seen.length > 0 && cond.seen.every((L) => Object.keys(L).length === 0), 'guard evaluated on {} under null', JSON.stringify(cond.seen));
  out(`  INFO under null the "not required note" fragment turned ${parent.fragOn[0] ? 'ON' : 'OFF'}; flag.raw=${show(parent.index.get('flag').raw)} (default injected under null host: ${parent.index.get('flag').raw === 'F'})`);
  setValue(parent, { note: 'Z' });
  flush(root);
  out(`  INFO setValue(parent, {note:'Z'}) (full replacement, C1): emit=${show(valueOf(root))} keep.raw=${show(keep.raw)}`);
  check(JSON.stringify(valueOf(root)) === JSON.stringify({ parent: { note: 'Z' } }) && keep.raw === undefined, 'full replacement erases keep (C1)', show(valueOf(root)));

  const root2 = object('');
  const parent2 = attach(root2, object('parent'));
  attach(parent2, leaf('note', 'D'));
  attach(parent2, leaf('keep'));
  prime(root2);
  write(parent2.index.get('note'), 'typed');
  write(parent2.index.get('keep'), 'K1');
  flush(root2);
  setValue(parent2, null);
  flush(root2);
  write(parent2.index.get('note'), 'Z');
  flush(root2);
  check(JSON.stringify(valueOf(root2)) === JSON.stringify({ parent: { note: 'Z', keep: 'K1' } }), 'partial write under null un-nulls the host and keep returns (C3)', show(valueOf(root2)));
}

/** g. A4: injectTo ping-pong that never converges hits the round cap. */
function scenarioG() {
  out('g. injectTo round cap (A4)');
  const root = object('');
  const x = attach(root, leaf('x'));
  const y = attach(root, leaf('y'));
  prime(root);
  declareInjections(root, [
    { from: x, to: y, map: (v) => (v ?? 0) + 1 },
    { from: y, to: x, map: (v) => (v ?? 0) + 1 },
  ]);
  resetCounters();
  let threw = null;
  try {
    write(x, 0);
    flush(root);
  } catch (e) {
    threw = e.message;
  }
  const e = valueOf(root);
  check(threw === null, 'production: no error', `threw=${threw}`);
  check(lastSettle.rounds === ROUND_CAP && lastSettle.budgetExceeded, `stopped at round cap ${ROUND_CAP}`, `rounds=${lastSettle.rounds} budgetExceeded=${lastSettle.budgetExceeded}`);
  check(x.raw !== undefined && root.dirty === false, 'write accepted and committed', `x.raw=${show(x.raw)} y.raw=${show(y.raw)} dirty=${root.dirty}`);
  check(e.x === x.raw && e.y === y.raw, 'tree fixed to the last computed round (emit == raw)', `emit=${show(e)}`);
  let threwDev = null;
  try {
    write(x, 100);
    flush(root, { dev: true });
  } catch (err) {
    threwDev = err.message;
  }
  check(threwDev !== null, 'dev flag: error raised', `${threwDev}`);
  check(valueOf(root).x === x.raw && root.dirty === false, 'dev: tree still committed before the error', `emit=${show(valueOf(root))} x.raw=${show(x.raw)}`);
}

/** h. Monotone option A with a negated guard. */
function scenarioH() {
  out('h. monotone option A with negation (A3 step 4)');
  const root = object('');
  attach(root, leaf('x', 1));
  attach(root, leaf('y', 1));
  const f0 = spy({ not: { required: ['x'] } });
  const f1 = spy({ required: ['y'] });
  declareFragments(root, [
    { guard: f0, declares: ['y'] },
    { guard: f1, declares: ['x'] },
  ]);
  resetCounters();
  prime(root);
  const e = valueOf(root);
  const composed = {
    type: 'object',
    allOf: [
      { if: { not: { required: ['x'] } }, then: { properties: { y: { default: 1 } } } },
      { if: { required: ['y'] }, then: { properties: { x: { default: 1 } } } },
    ],
  };
  const validate = ajv.compile(composed);
  const valid = validate(e ?? {});
  check(true, 'recorded', `emit=${show(e)} sweeps=${lastSettle.sweeps} guards=${counters.guards} re-guards=${counters.reguards} fragOn=${Array.from(root.fragOn)}`);
  out(`  INFO f0 (not required x) saw: ${JSON.stringify(f0.seen)} -> final re-evaluation would be ${f0.seen.length ? ajv.compile({ not: { required: ['x'] } })(e ?? {}) : 'n/a'}`);
  out(`  INFO ajv on composed schema with emit ${show(e)} -> valid=${valid} ${valid ? '(validator does NOT reject the option-A mismatch)' : JSON.stringify(validate.errors)}`);
  const strict = ajv.compile({
    type: 'object',
    allOf: [
      { if: { not: { required: ['x'] } }, then: { properties: { y: { default: 1 } } }, else: { not: { required: ['y'] } } },
      { if: { required: ['y'] }, then: { properties: { x: { default: 1 } } } },
    ],
  });
  out(`  INFO variant with else:{not:{required:['y']}} -> valid=${strict(e ?? {})}`);
}

/** Reference-stability sanity (v2 C1/C2 kept in v3). */
function scenarioRef() {
  out('ref. reference stability kept from v2');
  const root = object('');
  for (let i = 0; i < 200; i++) {
    const n = leaf(`f${i}`);
    n.raw = `v${i}`;
    attach(root, n);
  }
  prime(root);
  const before = root.emit;
  write(root.index.get('f10'), 'v10');
  flush(root);
  check(root.emit === before, 'identical rewrite keeps the root reference', `${root.emit === before}`);
  write(root.index.get('f10'), 'changed');
  flush(root);
  check(root.emit !== before && valueOf(root).f10 === 'changed', 'real change moves the root reference', show(valueOf(root).f10));
  const after = root.emit;
  write(root.index.get('f10'), '');
  flush(root);
  check(!('f10' in valueOf(root)) && root.emit !== after, 'omitEmpty drops the key (no undefined key left)', `${'f10' in valueOf(root)}`);
}

export function selfCheck() {
  scenarioA();
  scenarioB();
  scenarioC();
  scenarioD();
  scenarioE();
  scenarioF();
  scenarioG();
  scenarioH();
  scenarioRef();
  out(failures === 0 ? 'all v3 scenarios passed' : `${failures} FAILURES`);
  return failures;
}

if (process.argv[1]?.endsWith('selfcheck-v3.mjs')) {
  process.exit(selfCheck() === 0 ? 0 : 1);
}
