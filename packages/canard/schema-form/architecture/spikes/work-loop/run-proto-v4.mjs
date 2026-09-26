/**
 * v4 scenario runner, ONE case per process (same method as run-proto-v3.mjs).
 *
 *   node run-proto-v4.mjs <case>
 *
 * In v4 every `write`/`setValue` outside `batch` settles AND notifies
 * synchronously, so the timed op is the whole keystroke path (B2).
 * Prints `##RESULT##` JSON lines on stdout and a readable line on stderr.
 */
import { measure, report } from './harness.mjs';
import { batch, counters, resetCounters, setValue, subscribe, write } from './proto/loop-v4.mjs';
import { buildConditional, buildFlat, buildItems, compileGuards, itemsValue } from './proto/build-v4.mjs';

const CASE = process.argv[2];
const N_FLAT = 1000;
const N_FLAT_SMALL = 600;
const N_ITEMS = 10000;
const ITEM_FIELDS = 5;
const N_FRAG = 200;

/** Run `fn` once with counters zeroed and return the per-operation counts. */
function countOnce(fn) {
  resetCounters();
  fn();
  return { ...counters };
}

function keystroke(name, root, target) {
  const counts = countOnce(() => write(target, 'probe'));
  const r = measure({
    name,
    op: (i) => {
      write(target, `k${i & 1023}`);
      return root.emit;
    },
  });
  report(r, { case: CASE, counts, loop: 'v4' });
}

function flip(name, root, d) {
  const counts = countOnce(() => write(d, 'on'));
  const countsOff = countOnce(() => write(d, 'off'));
  const r = measure({
    name,
    op: (i) => {
      write(d, i & 1 ? 'on' : 'off');
      return root.emit;
    },
  });
  report(r, { case: CASE, counts, countsOff, loop: 'v4' });
}

/** Subscribe a no-op listener to every node of the subtree; returns the count. */
function subscribeAll(node, sink) {
  let n = 1;
  subscribe(node, sink);
  if (node.children !== null) for (const c of node.children) n += subscribeAll(c, sink);
  return n;
}

const cases = {
  's1-same'() {
    const root = buildFlat(N_FLAT);
    keystroke('S1a write same field (flat 1000)', root, root.index.get('f500'));
  },
  's3a-small'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    keystroke('S3a-small write unrelated field (600 + 200 fragments)', root, root.index.get('f500'));
  },
  's3b-small'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    flip('S3b-small flip one discriminator (600 + 200 fragments)', root, root.index.get('d7'));
  },
  's4-items'() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    const values = Array.from({ length: 4 }, (_, s) => itemsValue(N_ITEMS, ITEM_FIELDS, s));
    const counts = countOnce(() => setValue(root, values[0]));
    const r = measure({
      name: 'S4b bulk write whole root (10000 x 5)',
      op: (i) => {
        setValue(root, values[i & 3]);
        return root.emit;
      },
      samples: 9,
    });
    report(r, { case: CASE, counts, loop: 'v4' });
  },
  's5-batch'() {
    const root = buildFlat(N_FLAT);
    const targets = root.children;
    const counts = countOnce(() => batch(root, () => { for (let k = 0; k < N_FLAT; k++) write(targets[k], `p${k}`); }));
    const r = measure({
      name: 'S5a 1000 writes, ONE batch (flat 1000)',
      op: (i) => {
        batch(root, () => { for (let k = 0; k < N_FLAT; k++) write(targets[k], `b${i & 7}_${k}`); });
        return root.emit;
      },
    });
    report(r, { case: CASE, counts, loop: 'v4' });
  },
  /** N1: keystroke with 1,000 subscribed leaves + root; only one changes. */
  n1() {
    const root = buildFlat(N_FLAT);
    let sink = 0;
    const listeners = subscribeAll(root, () => sink++);
    root.onChange = () => sink++;
    const counts = countOnce(() => write(root.index.get('f500'), 'probe'));
    const r = measure({
      name: 'N1 keystroke, 1000 subscribed nodes (settle + notify)',
      op: (i) => {
        write(root.index.get('f500'), `k${i & 1023}`);
        return sink;
      },
    });
    report(r, { case: CASE, counts, listeners, loop: 'v4' });
  },
  /** N2: root write 10,000 x 5 with a subscriber on every node. */
  n2() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    let sink = 0;
    const listeners = subscribeAll(root, () => sink++);
    root.onChange = () => sink++;
    const values = Array.from({ length: 4 }, (_, s) => itemsValue(N_ITEMS, ITEM_FIELDS, s));
    const counts = countOnce(() => setValue(root, values[0]));
    const r = measure({
      name: 'N2 root write 10000 x 5, subscriber on every node',
      op: (i) => {
        setValue(root, values[i & 3]);
        return sink;
      },
      samples: 9,
    });
    report(r, { case: CASE, counts, listeners, loop: 'v4' });
  },
};

if (!cases[CASE]) {
  process.stderr.write(`unknown case: ${CASE}\navailable: ${Object.keys(cases).join(', ')}\n`);
  process.exit(2);
}
cases[CASE]();
