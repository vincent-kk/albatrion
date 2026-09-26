/**
 * onChange-per-entry timing, ONE case per process (harness.mjs method:
 * calibrated batch, 2 s warm-up, 11 samples, median with p25-p75 spread).
 *
 *   node onchange-entry/measure.mjs <case> <v4|v4c>
 *
 * Cases (flat 1,000-leaf tree, root.onChange counting):
 *   keystroke  one `write` on f500, no listener               (entry overhead)
 *   feedback   one `write` on f500; a listener on f500 writes f501 -> 2 waves
 *   seq3       three un-batched `write`s (f1, f2, f3)          (C-8)
 *   batch3     the same three inside batch(fn)                 (C-8)
 * Prints `##RESULT##` JSON rows with the per-op onChange / validation counts.
 */
import { measure, report } from '../harness.mjs';

const CASE = process.argv[2];
const LOOP = process.argv[3] ?? 'v4c';
const L = await import(`../proto/loop-${LOOP}.mjs`);
const { buildFlat } = await import(`../proto/build-${LOOP}.mjs`);
const { batch, counters, resetCounters, subscribe, write } = L;

const N_FLAT = 1000;
const root = buildFlat(N_FLAT);
const f500 = root.index.get('f500');
const f501 = root.index.get('f501');
const f1 = root.index.get('f1');
const f2 = root.index.get('f2');
const f3 = root.index.get('f3');

let onChange = 0;
let validations = 0;
root.onChange = () => onChange++;
if ('onValidate' in root) root.onValidate = () => validations++;

const ops = {
  keystroke: (i) => {
    write(f500, `k${i & 1023}`);
    return onChange;
  },
  feedback: (i) => {
    write(f500, `k${i & 1023}`);
    return onChange;
  },
  seq3: (i) => {
    write(f1, `a${i & 1023}`);
    write(f2, `b${i & 1023}`);
    write(f3, `c${i & 1023}`);
    return onChange;
  },
  batch3: (i) => {
    batch(root, () => {
      write(f1, `a${i & 1023}`);
      write(f2, `b${i & 1023}`);
      write(f3, `c${i & 1023}`);
    });
    return onChange;
  },
};

if (!ops[CASE]) {
  process.stderr.write(`unknown case: ${CASE}\navailable: ${Object.keys(ops).join(', ')}\n`);
  process.exit(2);
}
if (CASE === 'feedback') subscribe(f500, (payload) => write(f501, `d:${payload.current}`));

/** Per-op counts: run the op 8 times with fresh counters and divide. */
const REPS = 8;
resetCounters();
onChange = 0;
validations = 0;
for (let i = 0; i < REPS; i++) ops[CASE](i + 5000);
const perOp = {
  onChange: onChange / REPS,
  validations: 'onValidate' in root ? validations / REPS : null,
  settles: counters.settles / REPS,
  waves: counters.waves / REPS,
  entries: 'entries' in counters ? counters.entries / REPS : null,
};

const r = measure({ name: `${CASE} (${LOOP})`, op: ops[CASE] });
report(r, { case: CASE, loop: LOOP, perOp });
