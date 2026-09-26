/**
 * Correctness gate for the prototype. Every measurement run asserts these
 * first — a fast loop that emits the wrong tree measures nothing.
 */
import {
  attach,
  batch,
  counters,
  declareFragments,
  flush,
  leaf,
  object,
  prime,
  resetCounters,
  valueOf,
  write,
} from './loop.mjs';
import { ajv, buildFlat, compileGuards } from './build.mjs';

let failures = 0;
const ok = (cond, label, detail) => {
  if (cond) return;
  failures++;
  process.stderr.write(`  FAIL ${label}${detail ? ` — ${detail}` : ''}\n`);
};

/** C1: a write leaves every untouched sibling's memo reference identical. */
function siblingsKeepReferences() {
  const root = buildFlat(200);
  const before = root.children.map((c) => c.memo);
  const rootBefore = root.memo;
  write(root.index.get('f100'), 'typed');
  flush(root);
  let moved = 0;
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].memo !== before[i]) moved++;
  }
  ok(moved === 1, 'C1 untouched siblings keep memo references', `${moved} moved`);
  ok(root.memo !== rootBefore, 'C1 root memo reference moved');
  ok(valueOf(root).f100 === 'typed', 'C1 root emits the written value');
}

/** C2: the root memo reference moves iff something emitted actually changed. */
function rootMovesOnlyOnEmittedChange() {
  const root = buildFlat(50);
  const f10 = root.index.get('f10');
  const before = root.memo;
  write(f10, 'v10');
  flush(root);
  ok(root.memo === before, 'C2 identical rewrite keeps the root reference');

  write(f10, 'v10-changed');
  flush(root);
  ok(root.memo !== before, 'C2 a real change moves the root reference');

  const after = root.memo;
  write(f10, '');
  flush(root);
  ok(root.memo !== after, 'C2 emptying a field moves the root reference');
  ok(!('f10' in valueOf(root)), 'C2 omitEmpty drops the empty leaf');
}

/** C3: deactivating and reactivating a fragment restores the raw value. */
function deactivateReactivateRestores() {
  const root = object('');
  attach(root, leaf('d', 'off'));
  root.index.get('d').raw = 'off';
  attach(root, leaf('c'));
  const guard = ajv.compile({
    type: 'object',
    properties: { d: { const: 'on' } },
    required: ['d'],
  });
  declareFragments(root, [{ guard, declares: ['c'] }]);
  prime(root);
  ok(valueOf(root).c === undefined, 'C3 inactive child is not emitted');

  write(root.index.get('d'), 'on');
  flush(root);
  const c = root.index.get('c');
  ok(c.active === true, 'C3 guard activates the child');
  write(c, 'user typed this');
  flush(root);
  ok(valueOf(root).c === 'user typed this', 'C3 active child emits');

  write(root.index.get('d'), 'off');
  flush(root);
  ok(c.active === false, 'C3 guard deactivates the child');
  ok(valueOf(root).c === undefined, 'C3 inactive child leaves emission');
  ok(c.raw === 'user typed this', 'C3 raw survives deactivation');

  write(root.index.get('d'), 'on');
  flush(root);
  ok(valueOf(root).c === 'user typed this', 'C3 reactivation restores the raw');
}

/** C4: the oscillating schema hits the cap and leaves the committed tree as-is. */
function oscillationHitsTheCap() {
  const root = object('');
  attach(root, leaf('keep'));
  root.index.get('keep').raw = 'untouched';
  attach(root, leaf('x', 1));
  // if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } } }
  const guard = ajv.compile({ not: { required: ['x'] } });
  declareFragments(root, [{ guard, declares: ['x'] }]);

  let threw = false;
  try {
    prime(root);
  } catch (e) {
    threw = true;
    ok(/did not settle/.test(e.message), 'C4 throws the cycle error', e.message);
  }
  ok(threw, 'C4 oscillating guard hits the pass cap');
  ok(root.dirty === false, 'C4 dirty flags are cleared after the throw');

  const root2 = object('');
  attach(root2, leaf('keep'));
  root2.index.get('keep').raw = 'committed';
  attach(root2, leaf('x', 1));
  prime(root2);
  const committed = root2.memo;
  declareFragments(root2, [{ guard, declares: ['x'] }]);
  let threw2 = false;
  try {
    write(root2.index.get('keep'), 'new');
    flush(root2);
  } catch {
    threw2 = true;
  }
  ok(threw2, 'C4 a write into an oscillating tree throws synchronously');
  ok(root2.memo === committed, 'C4 the committed tree is left unchanged');
  ok(root2.index.get('keep').raw === 'committed', 'C4 the staged write is dropped');
}

/** C5: a batch of N writes settles once; N unbatched writes settle N times. */
function batchSettlesOnce() {
  const root = buildFlat(100);
  resetCounters();
  batch(root, () => {
    for (let i = 0; i < 50; i++) write(root.index.get(`f${i}`), `b${i}`);
  });
  ok(counters.settles === 1, 'C5 batch settles once', `${counters.settles}`);
  const batchPasses = counters.passes;

  resetCounters();
  for (let i = 0; i < 50; i++) {
    write(root.index.get(`f${i}`), `u${i}`);
    flush(root);
  }
  ok(counters.settles === 50, 'C5 unbatched settles per write', `${counters.settles}`);
  ok(
    counters.passes > batchPasses,
    'C5 batching collapses passes',
    `${batchPasses} vs ${counters.passes}`,
  );
}

/** C6: a guard flip toggles exactly the fields its fragment declares. */
function fragmentFlipScope() {
  const { predicates } = compileGuards(8);
  const root = object('');
  for (let i = 0; i < 8; i++) {
    const d = leaf(`d${i}`);
    d.raw = 'off';
    attach(root, d);
  }
  const fragments = [];
  for (let i = 0; i < 8; i++) {
    const declares = [`c${i}_0`, `c${i}_1`, `c${i}_2`];
    for (const name of declares) attach(root, leaf(name, `def_${name}`));
    fragments.push({ guard: predicates[i], declares });
  }
  declareFragments(root, fragments);
  prime(root);
  ok(Object.keys(valueOf(root)).length === 8, 'C6 only discriminators emit initially');

  write(root.index.get('d3'), 'on');
  const changed = flush(root);
  const emitted = valueOf(root);
  ok(emitted.c3_0 === 'def_c3_0', 'C6 activation injects the default');
  ok(emitted.c2_0 === undefined, 'C6 a neighbouring fragment stays off');
  ok(Object.keys(emitted).length === 11, 'C6 exactly three fields appeared');
  const leaves = changed.filter((n) => n.kind === 'leaf').length;
  ok(leaves === 4, 'C6 changed set is the discriminator plus three fields', `${leaves}`);
}

/** Run every check; returns the failure count. */
export function selfCheck() {
  process.stderr.write('self-checks:\n');
  siblingsKeepReferences();
  rootMovesOnlyOnEmittedChange();
  deactivateReactivateRestores();
  oscillationHitsTheCap();
  batchSettlesOnce();
  fragmentFlipScope();
  process.stderr.write(
    failures === 0 ? '  all self-checks passed\n' : `  ${failures} FAILURES\n`,
  );
  return failures;
}

if (process.argv[1]?.endsWith('selfcheck.mjs')) {
  process.exit(selfCheck() === 0 ? 0 : 1);
}
