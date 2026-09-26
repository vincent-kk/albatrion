/**
 * v3 scenario runner, ONE case per process (same method as run-proto.mjs).
 *
 *   node run-proto-v3.mjs <case>
 *
 * Prints `##RESULT##` JSON lines on stdout and a readable line on stderr.
 */
import { measure, report } from './harness.mjs';
import {
  counters,
  flush,
  resetCounters,
  setValue,
  write,
} from './proto/loop-v3.mjs';
import {
  buildConditional,
  buildFlat,
  buildItems,
  compileGuards,
  itemsValue,
} from './proto/build-v3.mjs';

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

function keystroke(name, root, target, opts) {
  const counts = countOnce(() => {
    write(target, 'probe');
    flush(root, opts);
  });
  const r = measure({
    name,
    op: (i) => {
      write(target, `k${i & 1023}`);
      flush(root, opts);
      return root.emit;
    },
  });
  report(r, { case: CASE, counts, loop: 'v3' });
}

function flip(name, root, d, opts) {
  const counts = countOnce(() => {
    write(d, 'on');
    flush(root, opts);
  });
  const countsOff = countOnce(() => {
    write(d, 'off');
    flush(root, opts);
  });
  const r = measure({
    name,
    op: (i) => {
      write(d, i & 1 ? 'on' : 'off');
      flush(root, opts);
      return root.emit;
    },
  });
  report(r, { case: CASE, counts, countsOff, loop: 'v3' });
}

const cases = {
  's1-same'() {
    const root = buildFlat(N_FLAT);
    keystroke('S1a write same field (flat 1000)', root, root.index.get('f500'));
  },
  's3a'() {
    const { predicates, ms } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates);
    keystroke('S3a write unrelated field (1000 + 200 fragments)', root, root.index.get('f500'));
    process.stderr.write(`  compileMs=${ms.toFixed(1)}\n`);
  },
  's3a-index'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates, true);
    keystroke('S3a + inverted index (1000 + 200 fragments)', root, root.index.get('f500'), { index: true });
  },
  's3b'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates);
    flip('S3b flip one discriminator (1000 + 200 fragments)', root, root.index.get('d7'));
  },
  's3b-index'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates, true);
    flip('S3b + inverted index (1000 + 200 fragments)', root, root.index.get('d7'), { index: true });
  },
  's3a-small'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    keystroke('S3a-small write unrelated field (600 + 200 fragments)', root, root.index.get('f500'));
  },
  's3a-small-index'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates, true);
    keystroke('S3a-small + inverted index (600 + 200 fragments)', root, root.index.get('f500'), { index: true });
  },
  's3b-small'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    flip('S3b-small flip one discriminator (600 + 200 fragments)', root, root.index.get('d7'));
  },
  's4-items'() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    const values = Array.from({ length: 4 }, (_, s) => itemsValue(N_ITEMS, ITEM_FIELDS, s));
    const counts = countOnce(() => {
      setValue(root, values[0]);
      flush(root);
    });
    const r = measure({
      name: 'S4b bulk write whole root (10000 x 5)',
      op: (i) => {
        setValue(root, values[i & 3]);
        flush(root);
        return root.emit;
      },
      samples: 9,
    });
    report(r, { case: CASE, counts, loop: 'v3' });
  },
};

if (!cases[CASE]) {
  process.stderr.write(`unknown case: ${CASE}\navailable: ${Object.keys(cases).join(', ')}\n`);
  process.exit(2);
}
cases[CASE]();
