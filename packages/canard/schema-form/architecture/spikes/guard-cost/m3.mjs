/**
 * M3 — skip strategies under one keystroke, with the value held as an immutable
 * tree with structural sharing (ADR 0006).
 *
 *   s0  evaluate every guard
 *   s1  skip when the guard's host object reference is unchanged (ADR 0005 §2)
 *   s2  dependency narrowing on the top-level keys of `if.properties`/`if.required`;
 *       a guard using any other keyword depends on the whole host
 *   s2r s2 with a reverse index (changed key -> dependent guards), to separate
 *       the cost of the skip CHECK from the cost of the skip DECISION
 *
 * Two hosting layouts are measured because they behave oppositely under s1:
 * guards hoisted to the root (the root reference changes on every write) and
 * guards sitting on the sub-object they constrain.
 *
 * Timed cost is the Resolve pass only; the immutable update that produces
 * `next` is measured separately in M4.
 */
import { ajvGuard, environment, measure, pool, writeResult } from './lib.mjs';

const COUNTS = [10, 50, 200];
const FILLERS = 20;
const POOL = 8;

/** Root layout with every guard hosted on the root object itself. */
function makeRootHosted(n) {
  const root = {};
  for (let i = 0; i < FILLERS; i++) root[`f${i}`] = `v${i}`;
  for (let i = 0; i < n; i++) root[`kind_${i}`] = i % 2 === 0 ? 'a' : 'z';
  return root;
}

/** Root layout with each guard hosted on its own sub-object. */
function makeSectionHosted(n) {
  const root = {};
  for (let i = 0; i < FILLERS; i++) root[`f${i}`] = `v${i}`;
  for (let i = 0; i < n; i++) root[`sec_${i}`] = { kind: i % 2 === 0 ? 'a' : 'z', pad: 0 };
  return root;
}

/** Immutable set of a root-level key. */
const setRootKey = (root, key, value) => ({ ...root, [key]: value });

/** Immutable set of a key inside one sub-object. */
const setSectionKey = (root, section, key, value) => ({
  ...root,
  [section]: { ...root[section], [key]: value },
});

/**
 * Build the guard descriptors for one layout.
 * `readHost` maps a root to the object the guard is evaluated against;
 * `keys` are the top-level dependency keys s2 narrows on.
 */
function buildGuards(n, layout) {
  return Array.from({ length: n }, (_, i) => {
    const isRoot = layout === 'root';
    // Key names are captured once: building them per call would measure string
    // concatenation instead of the strategy.
    const hostKey = isRoot ? null : `sec_${i}`;
    const schema = isRoot
      ? { properties: { [`kind_${i}`]: { const: 'a' } }, required: [`kind_${i}`] }
      : { properties: { kind: { const: 'a' } }, required: ['kind'] };
    return {
      fn: ajvGuard(schema),
      readHost: isRoot ? (root) => root : (root) => root[hostKey],
      keys: isRoot ? [`kind_${i}`] : ['kind'],
      hostId: isRoot ? 'root' : hostKey,
      wholeHost: false,
      last: false,
    };
  });
}

const strategies = {
  s0: (guards, prev, next, counter) => {
    let checksum = 0;
    for (let i = 0; i < guards.length; i++) {
      const g = guards[i];
      counter.evaluations++;
      if (g.fn(g.readHost(next))) checksum++;
    }
    return checksum;
  },

  s1: (guards, prev, next, counter) => {
    let checksum = 0;
    for (let i = 0; i < guards.length; i++) {
      const g = guards[i];
      const before = g.readHost(prev);
      const after = g.readHost(next);
      if (before === after) {
        if (g.last) checksum++;
        continue;
      }
      counter.evaluations++;
      const verdict = g.fn(after);
      g.last = verdict;
      if (verdict) checksum++;
    }
    return checksum;
  },

  s2: (guards, prev, next, counter) => {
    let checksum = 0;
    for (let i = 0; i < guards.length; i++) {
      const g = guards[i];
      const before = g.readHost(prev);
      const after = g.readHost(next);
      let changed = false;
      if (before !== after) {
        if (g.wholeHost || before === undefined || after === undefined) {
          changed = true;
        } else {
          for (let k = 0; k < g.keys.length; k++) {
            if (before[g.keys[k]] !== after[g.keys[k]]) {
              changed = true;
              break;
            }
          }
        }
      }
      if (!changed) {
        if (g.last) checksum++;
        continue;
      }
      counter.evaluations++;
      const verdict = g.fn(after);
      g.last = verdict;
      if (verdict) checksum++;
    }
    return checksum;
  },
};

/**
 * s2 over flat parallel arrays instead of per-guard closures and objects.
 * Separates the strategy's inherent cost — a property read under a key known
 * only at runtime — from the overhead of how the guards happen to be stored.
 */
function makeFlatStrategy(guards, layout) {
  const count = guards.length;
  const hostKeys = guards.map((g) => (layout === 'root' ? null : g.hostId));
  const depKeys = guards.map((g) => g.keys[0]);
  const fns = guards.map((g) => g.fn);
  const last = guards.map((g) => g.last);
  return (prev, next, counter) => {
    let checksum = 0;
    for (let i = 0; i < count; i++) {
      const key = hostKeys[i];
      const before = key === null ? prev : prev[key];
      const after = key === null ? next : next[key];
      if (before === after || before[depKeys[i]] === after[depKeys[i]]) {
        if (last[i]) checksum++;
        continue;
      }
      counter.evaluations++;
      const verdict = fns[i](after);
      last[i] = verdict;
      if (verdict) checksum++;
    }
    return checksum;
  };
}

/**
 * s2 with a reverse index: the write path names the changed keys directly, so
 * only the dependent guards are even looked at.
 */
function makeReverseIndexStrategy(guards, changedKeysFor) {
  const index = new Map();
  guards.forEach((g, i) => {
    for (const key of g.keys) {
      const bucket = index.get(`${g.hostId}/${key}`) ?? [];
      bucket.push(i);
      index.set(`${g.hostId}/${key}`, bucket);
    }
  });
  let active = 0;
  for (const g of guards) if (g.last) active++;
  return (prev, next, counter, writeIndex) => {
    for (const token of changedKeysFor(writeIndex)) {
      const bucket = index.get(token);
      if (bucket === undefined) continue;
      for (const i of bucket) {
        const g = guards[i];
        counter.evaluations++;
        const verdict = g.fn(g.readHost(next));
        if (verdict !== g.last) active += verdict ? 1 : -1;
        g.last = verdict;
      }
    }
    return active;
  };
}

const rows = [];

for (const layout of ['root', 'section']) {
  for (const n of COUNTS) {
    const make = layout === 'root' ? makeRootHosted : makeSectionHosted;

    // One keystroke, two flavours: a field no guard reads, and a discriminator.
    const scenarios = {
      unrelated: () => {
        const prev = make(n);
        return { prev, next: setRootKey(prev, 'f7', 'typed'), tokens: [`root/f7`] };
      },
      // Guard 0 holds 'a', so writing 'z' genuinely changes the value and flips
      // that guard's verdict — writing the value already held would measure nothing.
      discriminator: () => {
        const prev = make(n);
        const next =
          layout === 'root'
            ? setRootKey(prev, 'kind_0', 'z')
            : setSectionKey(prev, 'sec_0', 'kind', 'z');
        return { prev, next, tokens: [layout === 'root' ? 'root/kind_0' : 'sec_0/kind'] };
      },
    };

    for (const [scenario, build] of Object.entries(scenarios)) {
      const pairs = pool(build, POOL);
      const mask = POOL - 1;

      for (const [name, strategy] of Object.entries(strategies)) {
        const guards = buildGuards(n, layout);
        for (const g of guards) g.last = g.fn(g.readHost(pairs[0].prev));

        const counter = { evaluations: 0 };
        const loop = (writes) => {
          let checksum = 0;
          for (let w = 0; w < writes; w++) {
            const pair = pairs[w & mask];
            checksum += strategy(guards, pair.prev, pair.next, counter);
          }
          return checksum;
        };

        const stats = measure(loop);

        // Evaluation count is taken from a clean run, not the timed one.
        for (const g of guards) g.last = g.fn(g.readHost(pairs[0].prev));
        const clean = { evaluations: 0 };
        strategy(guards, pairs[0].prev, pairs[0].next, clean);

        rows.push({
          layout,
          n,
          scenario,
          strategy: name,
          evaluationsPerWrite: clean.evaluations,
          usPerWrite: stats.medianNs / 1000,
          ...stats,
        });
        process.stderr.write(
          `${layout} N=${n} ${scenario} ${name}: ${clean.evaluations} evals, ` +
            `${(stats.medianNs / 1000).toFixed(3)}us\n`,
        );
      }

      // s2 over flat arrays.
      {
        const guards = buildGuards(n, layout);
        for (const g of guards) g.last = g.fn(g.readHost(pairs[0].prev));
        const run = makeFlatStrategy(guards, layout);
        const counter = { evaluations: 0 };
        const stats = measure((writes) => {
          let checksum = 0;
          for (let w = 0; w < writes; w++) {
            const pair = pairs[w & mask];
            checksum += run(pair.prev, pair.next, counter);
          }
          return checksum;
        });
        const cleanGuards = buildGuards(n, layout);
        for (const g of cleanGuards) g.last = g.fn(g.readHost(pairs[0].prev));
        const clean = { evaluations: 0 };
        makeFlatStrategy(cleanGuards, layout)(pairs[0].prev, pairs[0].next, clean);
        rows.push({
          layout,
          n,
          scenario,
          strategy: 's2f (flat arrays)',
          evaluationsPerWrite: clean.evaluations,
          usPerWrite: stats.medianNs / 1000,
          ...stats,
        });
        process.stderr.write(
          `${layout} N=${n} ${scenario} s2f: ${clean.evaluations} evals, ` +
            `${(stats.medianNs / 1000).toFixed(3)}us\n`,
        );
      }

      // s2 with a reverse index.
      {
        const guards = buildGuards(n, layout);
        for (const g of guards) g.last = g.fn(g.readHost(pairs[0].prev));
        const run = makeReverseIndexStrategy(guards, (w) => pairs[w & mask].tokens);
        const counter = { evaluations: 0 };
        const loop = (writes) => {
          let checksum = 0;
          for (let w = 0; w < writes; w++) {
            const pair = pairs[w & mask];
            checksum += run(pair.prev, pair.next, counter, w);
          }
          return checksum;
        };
        const stats = measure(loop);
        const clean = { evaluations: 0 };
        run(pairs[0].prev, pairs[0].next, clean, 0);
        rows.push({
          layout,
          n,
          scenario,
          strategy: 's2r (reverse index)',
          evaluationsPerWrite: clean.evaluations,
          usPerWrite: stats.medianNs / 1000,
          ...stats,
        });
        process.stderr.write(
          `${layout} N=${n} ${scenario} s2r: ${clean.evaluations} evals, ` +
            `${(stats.medianNs / 1000).toFixed(3)}us\n`,
        );
      }
    }
  }
}

console.log(writeResult('m3', { environment: environment(), rows }));
