import { expect, it } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';

import { readValidationEntry } from '../utils/cache/readValidationEntry';
import { recentReleaseList } from '../utils/lifetime/recentReleaseList';
import { releaseValidationRoot } from '../utils/lifetime/releaseValidationRoot';
import { retainValidationRoot } from '../utils/lifetime/retainValidationRoot';
import { runFieldNodeValidation } from '../utils/run/runFieldNodeValidation';

it('DR-1 leaves committed counts unchanged and releases its pin after a verdict', async () => {
  let resolve: () => void = () => {};
  const validator = {
    compile: () => () =>
      new Promise<[]>((done) => {
        resolve = () => done([]);
      }),
    compileGuard: () => () => true,
  };
  const schema = { type: 'string' };
  retainValidationRoot(validator, schema);
  const { root } = createDispatchTree(schema, undefined, validator);
  const ledger = recentReleaseList(validator);
  const count = ledger.counts.get(schema);
  const pending = runFieldNodeValidation(root);
  expect(ledger.counts.get(schema)).toBe(count);
  resolve();
  await expect(pending).resolves.toEqual([]);
  expect(ledger.counts.get(schema)).toBe(count);
});

it('DR-1 validates without creating a lifetime for an absent validator', async () => {
  const { root } = createDispatchTree({ type: 'string' });
  await expect(runFieldNodeValidation(root)).resolves.toBeNull();
});

it('DR-1 keeps all pinned overflow candidates until a later eviction point', async () => {
  const resolves: (() => void)[] = [];
  const released: unknown[] = [];
  const validator = {
    compile: () => () =>
      new Promise<[]>((done) => {
        resolves.push(() => done([]));
      }),
    compileGuard: () => () => true,
    release: (copy: unknown) => {
      released.push(copy);
    },
  };
  const roots = Array.from({ length: 12 }, (_, index) => ({
    type: 'string',
    title: `pin-${index}`,
  }));
  const pending = roots.map((schema) => {
    retainValidationRoot(validator, schema);
    const { root } = createDispatchTree(schema, undefined, validator);
    const run = runFieldNodeValidation(root);
    releaseValidationRoot(validator, schema);
    return run;
  });
  const ledger = recentReleaseList(validator);
  expect.soft(released).toHaveLength(0);
  expect.soft(ledger.recent).toHaveLength(12);
  for (const resolve of resolves) resolve();
  await Promise.all(pending);
  expect.soft(released).toHaveLength(0);
  const next = { type: 'number' };
  readValidationEntry(validator, next);
  expect(ledger.recent).toHaveLength(8);
  expect(released).toHaveLength(5);
});
