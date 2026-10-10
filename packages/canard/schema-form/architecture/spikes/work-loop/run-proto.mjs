/**
 * Prototype scenario runner. ONE case per process — round-1 §2 read a 1.1 us
 * write as 119.6 us when several sizes shared a process.
 *
 *   node run-proto.mjs <case>
 *
 * Prints `##RESULT##` JSON lines on stdout and a readable line on stderr.
 */
import { measure, report } from './harness.mjs';
import {
  batch,
  counters,
  flush,
  resetCounters,
  valueOf,
  write,
} from './proto/loop.mjs';
import {
  buildConditional,
  buildFlat,
  buildItems,
  compileGuards,
  flatValue,
  itemsValue,
  lazyGuards,
} from './proto/build.mjs';

const CASE = process.argv[2];
const N_FLAT = 1000;
const N_ITEMS = 10000;
const ITEM_FIELDS = 5;
const N_FRAG = 200;

/**
 * Hydrate a tree from a whole JSON value: stage one write per leaf.
 * An object node with children owns no value of its own (ADR 0006), so a
 * root-level write is distributed to the leaves.
 */
function applyValue(node, value) {
  if (node.kind === 'leaf') {
    write(node, value);
    return;
  }
  if (node.kind === 'object') {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      applyValue(child, value === undefined ? undefined : value[child.name]);
    }
    return;
  }
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    applyValue(children[i], value === undefined ? undefined : value[i]);
  }
}

/** Run `fn` once with counters zeroed and return the per-operation counts. */
function countOnce(fn) {
  resetCounters();
  fn();
  return {
    visited: counters.visited,
    guards: counters.guards,
    memos: counters.memos,
    shares: counters.shares,
    normalizes: counters.normalizes,
    passes: counters.passes,
  };
}

/** Guard-scenario base width that keeps the emitted object under V8's cliff. */
const N_FLAT_SMALL = 600;

const cases = {
  /**
   * The V8 fast-property cliff, isolated. An object with more than 1020 own
   * properties cannot be in fast mode, and every copy of it costs ~100x more.
   * `node run-proto.mjs cliff 1021`
   */
  cliff() {
    const n = Number(process.argv[3] || 1000);
    const names = Array.from({ length: n }, (_, i) => `f${i}`);
    const base = Object.fromEntries(names.map((k, i) => [k, `v${i}`]));
    const r = measure({
      name: `copy ${n}-key object + patch one key`,
      op: (i) => ({ ...base, f1: `x${i & 7}` }),
    });
    report(r, { case: CASE, keys: n });
  },

  /** S1 one key above the cliff: the same keystroke on a 1,100-key object. */
  's1-cliff'() {
    const root = buildFlat(1100);
    const target = root.index.get('f500');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root);
    });
    const r = measure({
      name: 'S1c write same field (flat 1100 — above the cliff)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: 'flat 1100' });
  },

  /** S3a below the cliff: 600 base fields + 200 fragments = 800 emitted keys. */
  's3a-small'() {
    const { predicates, ms } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    const target = root.index.get('f500');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root);
    });
    const r = measure({
      name: 'S3a-small write unrelated field (600 + 200 fragments)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, compileMs: ms, shape: `flat ${N_FLAT_SMALL} + ${N_FRAG} frags` });
  },

  /** S3a below the cliff, with the changed-key -> guard inverted index. */
  's3a-small-index'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates, true);
    const target = root.index.get('f500');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root, { index: true });
    });
    const r = measure({
      name: 'S3a-small + inverted index (600 + 200 fragments)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root, { index: true });
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT_SMALL} + ${N_FRAG} frags` });
  },

  /** S3b below the cliff: flip one discriminator, fragment declares 3 fields. */
  's3b-small'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates);
    const d = root.index.get('d7');
    const counts = countOnce(() => {
      write(d, 'on');
      flush(root);
    });
    write(d, 'off');
    flush(root);
    const r = measure({
      name: 'S3b-small flip one discriminator (600 + 200 fragments)',
      op: (i) => {
        write(d, i & 1 ? 'on' : 'off');
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT_SMALL} + ${N_FRAG} frags` });
  },

  /** S3b below the cliff, with the inverted index. */
  's3b-small-index'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT_SMALL, N_FRAG, predicates, true);
    const d = root.index.get('d7');
    const counts = countOnce(() => {
      write(d, 'on');
      flush(root, { index: true });
    });
    write(d, 'off');
    flush(root, { index: true });
    const r = measure({
      name: 'S3b-small + inverted index (600 + 200 fragments)',
      op: (i) => {
        write(d, i & 1 ? 'on' : 'off');
        flush(root, { index: true });
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT_SMALL} + ${N_FRAG} frags` });
  },

  /** S1 with naive rebuild-from-children instead of structural sharing. */
  's1-rebuild'() {
    const root = buildFlat(N_FLAT);
    const target = root.index.get('f500');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root, { share: false });
    });
    const r = measure({
      name: 'S1 rebuild-from-children, no sharing (flat 1000)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root, { share: false });
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT}` });
  },

  /** S2 with the dirty walk scanning every child instead of a dirty list. */
  's2-scan'() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    const items = root.index.get('items');
    const target = items.children[5000].index.get('f2');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root, { scanDirty: true });
    });
    const r = measure({
      name: 'S2 dirty-flag SCAN instead of dirty list (10000 x 5)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root, { scanDirty: true });
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `array ${N_ITEMS} x ${ITEM_FIELDS}` });
  },

  /** S1a: 1,000 sequential keystrokes into the SAME field of a 1,000-key object. */
  's1-same'() {
    const root = buildFlat(N_FLAT);
    const target = root.index.get('f500');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root);
    });
    const r = measure({
      name: 'S1a write same field (flat 1000)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT}` });
  },

  /** S1b: the same keystroke cost spread over random fields. */
  's1-random'() {
    const root = buildFlat(N_FLAT);
    const targets = root.children;
    const r = measure({
      name: 'S1b write random fields (flat 1000)',
      op: (i) => {
        write(targets[(i * 7919) % N_FLAT], `k${i & 1023}`);
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, shape: `flat ${N_FLAT}` });
  },

  /** S2: one keystroke deep inside a 10,000-item array. */
  's2'() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    const items = root.index.get('items');
    const target = items.children[5000].index.get('f2');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root);
    });
    const r = measure({
      name: 'S2 write /items/5000/f2 (10000 x 5)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `array ${N_ITEMS} x ${ITEM_FIELDS}` });
  },

  /** S3a: type into a field no guard reads, with 200 root-hosted fragments. */
  's3a'() {
    const { predicates, ms } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates);
    const target = root.index.get('f500');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root);
    });
    const r = measure({
      name: 'S3a write unrelated field (1000 + 200 fragments)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, compileMs: ms, shape: `flat ${N_FLAT} + ${N_FRAG} frags` });
  },

  /** S3a with the changed-key -> guard inverted index (round-1 strategy s2r). */
  's3a-index'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates, true);
    const target = root.index.get('f500');
    const counts = countOnce(() => {
      write(target, 'probe');
      flush(root, { index: true });
    });
    const r = measure({
      name: 'S3a + inverted index (1000 + 200 fragments)',
      op: (i) => {
        write(target, `k${i & 1023}`);
        flush(root, { index: true });
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT} + ${N_FRAG} frags` });
  },

  /** S3b: flip one discriminator on and off; its fragment declares 3 fields. */
  's3b'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates);
    const d = root.index.get('d7');
    const counts = countOnce(() => {
      write(d, 'on');
      flush(root);
    });
    write(d, 'off');
    flush(root);
    const r = measure({
      name: 'S3b flip one discriminator (1000 + 200 fragments)',
      op: (i) => {
        write(d, i & 1 ? 'on' : 'off');
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT} + ${N_FRAG} frags` });
  },

  /** S3b with the inverted index. */
  's3b-index'() {
    const { predicates } = compileGuards(N_FRAG);
    const root = buildConditional(N_FLAT, N_FRAG, predicates, true);
    const d = root.index.get('d7');
    const counts = countOnce(() => {
      write(d, 'on');
      flush(root, { index: true });
    });
    write(d, 'off');
    flush(root, { index: true });
    const r = measure({
      name: 'S3b + inverted index (1000 + 200 fragments)',
      op: (i) => {
        write(d, i & 1 ? 'on' : 'off');
        flush(root, { index: true });
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT} + ${N_FRAG} frags` });
  },

  /** S4a: replace the whole root value of the flat 1,000-key shape. */
  's4-flat'() {
    const root = buildFlat(N_FLAT);
    const values = Array.from({ length: 8 }, (_, s) => flatValue(N_FLAT, s));
    const counts = countOnce(() => {
      applyValue(root, values[0]);
      flush(root);
    });
    const r = measure({
      name: 'S4a bulk write whole root (flat 1000)',
      op: (i) => {
        applyValue(root, values[i & 7]);
        flush(root);
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT}` });
  },

  /** S4b: replace the whole root value of the 10,000-item array shape. */
  's4-items'() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    const values = Array.from({ length: 4 }, (_, s) =>
      itemsValue(N_ITEMS, ITEM_FIELDS, s),
    );
    const counts = countOnce(() => {
      applyValue(root, values[0]);
      flush(root);
    });
    const r = measure({
      name: 'S4b bulk write whole root (10000 x 5)',
      op: (i) => {
        applyValue(root, values[i & 3]);
        flush(root);
        return root.memo;
      },
      samples: 9,
    });
    report(r, { case: CASE, counts, shape: `array ${N_ITEMS} x ${ITEM_FIELDS}` });
  },

  /** S5a: 1,000 writes to distinct fields inside ONE batch. */
  's5-batch'() {
    const root = buildFlat(N_FLAT);
    const targets = root.children;
    const counts = countOnce(() => {
      batch(root, () => {
        for (let k = 0; k < N_FLAT; k++) write(targets[k], `p${k}`);
      });
    });
    const r = measure({
      name: 'S5a 1000 writes, ONE batch (flat 1000)',
      op: (i) => {
        batch(root, () => {
          for (let k = 0; k < N_FLAT; k++) write(targets[k], `b${i & 7}_${k}`);
        });
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT}` });
  },

  /** S5b: the same 1,000 writes, each settled on its own. */
  's5-unbatched'() {
    const root = buildFlat(N_FLAT);
    const targets = root.children;
    const counts = countOnce(() => {
      for (let k = 0; k < N_FLAT; k++) {
        write(targets[k], `p${k}`);
        flush(root);
      }
    });
    const r = measure({
      name: 'S5b 1000 writes, 1000 settles (flat 1000)',
      op: (i) => {
        for (let k = 0; k < N_FLAT; k++) {
          write(targets[k], `u${i & 7}_${k}`);
          flush(root);
        }
        return root.memo;
      },
    });
    report(r, { case: CASE, counts, shape: `flat ${N_FLAT}` });
  },

  /** S6a: build + settle the flat 1,000-key tree. */
  's6-flat'() {
    const r = measure({
      name: 'S6a construct flat 1000',
      op: () => buildFlat(N_FLAT).memo,
      samples: 9,
    });
    report(r, { case: CASE, shape: `flat ${N_FLAT}` });
  },

  /** S6b: build + settle the 10,000-item array tree. */
  's6-items'() {
    const r = measure({
      name: 'S6b construct array 10000 x 5',
      op: () => buildItems(N_ITEMS, ITEM_FIELDS).memo,
      samples: 9,
      warmupMs: 2500,
    });
    report(r, { case: CASE, shape: `array ${N_ITEMS} x ${ITEM_FIELDS}` });
  },

  /** S6c: guard compile cost alone, eager, for 200 fragments. */
  's6-compile'() {
    const r = measure({
      name: 'S6c compile 200 AJV guards (eager)',
      op: () => compileGuards(N_FRAG).predicates.length,
      samples: 9,
    });
    report(r, { case: CASE, shape: `${N_FRAG} guards` });
  },

  /** S6d: tree construction with guards already compiled. */
  's6-cond'() {
    const { predicates, ms } = compileGuards(N_FRAG);
    const r = measure({
      name: 'S6d construct 1000 + 200 fragments (guards precompiled)',
      op: () => buildConditional(N_FLAT, N_FRAG, predicates).memo,
      samples: 9,
      warmupMs: 2500,
    });
    report(r, { case: CASE, compileMs: ms, shape: `flat ${N_FLAT} + ${N_FRAG} frags` });
  },

  /** S6e: construction when guards compile on first evaluation. */
  's6-cond-lazy'() {
    const r = measure({
      name: 'S6e construct 1000 + 200 fragments (lazy compile)',
      op: () => buildConditional(N_FLAT, N_FRAG, lazyGuards(N_FRAG)).memo,
      samples: 9,
      warmupMs: 2500,
    });
    report(r, { case: CASE, shape: `flat ${N_FLAT} + ${N_FRAG} frags` });
  },

  /** S7: reads after a commit. In the prototype these are field accesses. */
  's7'() {
    const root = buildItems(N_ITEMS, ITEM_FIELDS);
    const items = root.index.get('items');
    const mid = items.children[5000];
    const leafNode = mid.index.get('f2');
    write(leafNode, 'settled');
    flush(root);

    report(
      measure({ name: 'S7a read root.value', op: () => valueOf(root) }),
      { case: CASE, read: 'root' },
    );
    report(
      measure({ name: 'S7b read mid-level node.value', op: () => valueOf(mid) }),
      { case: CASE, read: 'mid' },
    );
    report(
      measure({ name: 'S7c read leaf.value', op: () => valueOf(leafNode) }),
      { case: CASE, read: 'leaf' },
    );
    const before = root.memo;
    for (let i = 0; i < 1e6; i++) valueOf(root);
    process.stderr.write(
      `  1,000,000 root reads left the reference ${root.memo === before ? 'IDENTICAL' : 'CHANGED'}\n`,
    );
  },
};

if (!cases[CASE]) {
  process.stderr.write(`unknown case: ${CASE}\navailable: ${Object.keys(cases).join(', ')}\n`);
  process.exit(2);
}
// Self-checks run in their OWN process (`node proto/selfcheck.mjs`). Running
// them here makes every call site in the loop polymorphic and read S1 100x
// slow — the per-process isolation trap of `reviews/round-1.md` §2.
cases[CASE]();
