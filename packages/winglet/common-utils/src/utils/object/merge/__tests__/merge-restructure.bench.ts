// Loaded by vitest.bench.config.ts; owner-local *.bench.ts files select performance suites.
import { bench, describe } from 'vitest';

import { merge } from '../merge';
import type { MergeOptions } from '../type';

import { createMergeImplementation } from './merge-restructure/createMergeImplementation';

/** Pre-refactor code is loaded from its immutable source commit, not a hand copy. */
const baseline = createMergeImplementation('f7eef9ed9');
/** The candidate uses the baseline's compiler and module-loading path. */
const candidate = createMergeImplementation('workspace');
/** Fixed nested fixture reused by both implementations in the same process. */
const source = {
  settings: {
    theme: { color: 'blue', spacing: { small: 4, large: 16 } },
    flags: { a: true, b: false },
  },
  fields: [
    { name: 'a', rules: { min: 1 } },
    { name: 'b', rules: { max: 9 } },
  ],
  tags: ['new', 'overlay'],
};
/** Earlier values are freshly allocated identically for both mutable benchmarks. */
const createTarget = () => ({
  settings: {
    theme: { color: 'red', spacing: { small: 2, medium: 8 } },
    flags: { c: true },
  },
  fields: [{ name: 'old', rules: { required: true } }],
  tags: ['existing'],
});
/** Explicit schema-group policies exercise the unchanged options recursion. */
const options: MergeOptions = {
  immutable: true,
  preserveReferences: true,
  arrayStrategy: 'replace',
  isAtomic: () => false,
};
/** Index-wise merging exercises propagation through nested arrays and objects. */
const indexOptions: MergeOptions = { ...options, arrayStrategy: 'merge' };
/** Long enough for the designated harness to collect at least 100 samples. */
const sampling = {
  time: 1000,
  iterations: 100,
  warmupTime: 300,
  warmupIterations: 100,
};

for (const policy of [undefined, options, indexOptions]) {
  const expected = JSON.stringify(merge(createTarget(), source, policy));
  if (
    JSON.stringify(candidate(createTarget(), source, policy)) !== expected ||
    JSON.stringify(baseline(createTarget(), source, policy)) !== expected
  )
    throw new Error(
      'Loaded benchmark implementation differs from the package API',
    );
}

describe('merge restructure — nested default', () => {
  bench(
    'before f7eef9ed9',
    () => {
      baseline(createTarget(), source);
    },
    sampling,
  );
  bench(
    'after independent recursion',
    () => {
      candidate(createTarget(), source);
    },
    sampling,
  );
});

describe('merge restructure — nested explicit policies', () => {
  bench(
    'before f7eef9ed9',
    () => {
      baseline(createTarget(), source, options);
    },
    sampling,
  );
  bench(
    'after independent recursion',
    () => {
      candidate(createTarget(), source, options);
    },
    sampling,
  );
});

describe('merge restructure — nested explicit index policy', () => {
  bench(
    'before f7eef9ed9',
    () => {
      baseline(createTarget(), source, indexOptions);
    },
    sampling,
  );
  bench(
    'after independent recursion',
    () => {
      candidate(createTarget(), source, indexOptions);
    },
    sampling,
  );
});
