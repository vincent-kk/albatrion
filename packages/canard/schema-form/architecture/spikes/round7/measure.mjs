/**
 * v4c vs v4d timing, ONE case x variant per process (harness.mjs method: calibrated
 * ~25 ms batch, 2 s warm-up, 11 samples (9 for the 10000-item cases), median).
 *
 *   node measure.mjs <case> <v4c|v4d-old|v4d-new>
 *
 * Cases s1-same, s3a-small, s3b-small, s4-items, s5-batch, n1, n2 are
 * work-loop/run-proto-v4.mjs's; feedback is onchange-entry/measure.mjs's. Added:
 *   s3c-inject  flip d7 where every 'on' injects 3 defaults (the 'off' op clears them in a batch)
 *   inj-key     flat 900 f-leaves + 100 injectTo targets g{i} = m(f{i}) (1000 keys, as S1); keystroke on unrelated f500
 *   inj-src     same tree; keystroke on f0, a source (its rule fires every op)
 * Prints one `##RESULT##` JSON row.
 */
import { measure, report } from '../work-loop/harness.mjs';

const CASE = process.argv[2];
const VARIANT = process.argv[3];
const L = await import(VARIANT === 'v4c' ? '../work-loop/proto/loop-v4c.mjs' : './proto/loop-v4d.mjs');
if (VARIANT === 'v4d-old') L.setSwitches(L.OLD_SWITCHES);
else if (VARIANT === 'v4d-new') L.setSwitches(L.NEW_SWITCHES);
else if (VARIANT !== 'v4c') throw new Error(`unknown variant ${VARIANT}`);
const B = await import(VARIANT === 'v4c' ? '../work-loop/proto/build-v4c.mjs' : './proto/build-v4d.mjs');
const { attach, batch, counters, declareInjections, leaf, object, prime, resetCounters, setValue, subscribe, write } = L;
const { buildConditional, buildFlat, buildItems, compileGuards, itemsValue } = B;

const N_FLAT = 1000;
const N_FLAT_SMALL = 600;
const N_ITEMS = 10000;
const ITEM_FIELDS = 5;
const N_FRAG = 200;
const N_RULES = 100;

function countOnce(fn) {
  resetCounters();
  fn();
  return { ...counters };
}

function run(name, op, prep, samples) {
  const counts = countOnce(() => prep());
  const r = measure({ name, op, samples });
  report(r, { case: CASE, variant: VARIANT, counts });
}

function injTree() {
  const root = object('');
  const value = {};
  for (let i = 0; i < N_FLAT - N_RULES; i++) {
    attach(root, leaf(`f${i}`));
    value[`f${i}`] = `v${i}`;
  }
  const rules = [];
  for (let i = 0; i < N_RULES; i++) {
    const g = attach(root, leaf(`g${i}`));
    rules.push({ from: root.index.get(`f${i}`), to: g, map: (e) => (e === undefined ? undefined : `m:${e}`) });
  }
  declareInjections(root, rules);
  prime(root, value);
  return root;
}

const cases = {
  's1-same'() {
    const root = buildFlat(N_FLAT);
    const t = root.index.get('f500');
    run('S1a write same field (flat 1000)', (i) => (write(t, `k${i & 1023}`), root.emit), () => write(t, 'probe'));
  },
  's3a-small'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    const t = root.index.get('f500');
    run('S3a-small write unrelated field (600 + 200 fragments)', (i) => (write(t, `k${i & 1023}`), root.emit), () => write(t, 'probe'));
  },
  's3b-small'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    const d = root.index.get('d7');
    run('S3b-small flip one discriminator (600 + 200 fragments)', (i) => (write(d, i & 1 ? 'on' : 'off'), root.emit), () => write(d, 'on'));
  },
  's3c-inject'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    const d = root.index.get('d7');
    const kids = ['c7_0', 'c7_1', 'c7_2'].map((n) => root.index.get(n));
    const off = () =>
      batch(root, () => {
        write(d, 'off');
        for (const k of kids) write(k, undefined);
      });
    run('S3c-small flip on = inject 3 defaults (600 + 200 fragments)', (i) => ((i & 1 ? write(d, 'on') : off()), root.emit), () => write(d, 'on'));
  },
  's4-items'() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    const values = Array.from({ length: 4 }, (_, s) => itemsValue(N_ITEMS, ITEM_FIELDS, s));
    run('S4b bulk write whole root (10000 x 5)', (i) => (setValue(root, values[i & 3]), root.emit), () => setValue(root, values[0]), 9);
  },
  's5-batch'() {
    const root = buildFlat(N_FLAT);
    const targets = root.children;
    run(
      'S5a 1000 writes, ONE batch (flat 1000)',
      (i) => (batch(root, () => { for (let k = 0; k < N_FLAT; k++) write(targets[k], `b${i & 7}_${k}`); }), root.emit),
      () => batch(root, () => { for (let k = 0; k < N_FLAT; k++) write(targets[k], `p${k}`); }),
    );
  },
  n1() {
    const root = buildFlat(N_FLAT);
    let sink = 0;
    const all = (n) => { subscribe(n, () => sink++); if (n.children !== null) for (const c of n.children) all(c); };
    all(root);
    root.onChange = () => sink++;
    const t = root.index.get('f500');
    run('N1 keystroke, 1000 subscribed nodes (settle + notify)', (i) => (write(t, `k${i & 1023}`), sink), () => write(t, 'probe'));
  },
  n2() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    let sink = 0;
    const all = (n) => { subscribe(n, () => sink++); if (n.children !== null) for (const c of n.children) all(c); };
    all(root);
    root.onChange = () => sink++;
    const values = Array.from({ length: 4 }, (_, s) => itemsValue(N_ITEMS, ITEM_FIELDS, s));
    run('N2 root write 10000 x 5, subscriber on every node', (i) => (setValue(root, values[i & 3]), sink), () => setValue(root, values[0]), 9);
  },
  feedback() {
    const root = buildFlat(N_FLAT);
    const f500 = root.index.get('f500');
    const f501 = root.index.get('f501');
    let oc = 0;
    root.onChange = () => oc++;
    subscribe(f500, (p) => write(f501, `d:${p.current}`));
    run('feedback: write f500, listener writes f501 (2 waves)', (i) => (write(f500, `k${i & 1023}`), oc), () => write(f500, 'probe'));
  },
  'inj-key'() {
    const root = injTree();
    const t = root.index.get('f500');
    run('inj-key flat 900+100 injectTo, unrelated keystroke', (i) => (write(t, `k${i & 1023}`), root.emit), () => write(t, 'probe'));
  },
  'inj-src'() {
    const root = injTree();
    const t = root.index.get('f0');
    run('inj-src flat 900+100 injectTo, keystroke on a source', (i) => (write(t, `k${i & 1023}`), root.emit), () => write(t, 'probe'));
  },
};

if (!cases[CASE]) {
  process.stderr.write(`unknown case: ${CASE}\navailable: ${Object.keys(cases).join(', ')}\n`);
  process.exit(2);
}
cases[CASE]();
