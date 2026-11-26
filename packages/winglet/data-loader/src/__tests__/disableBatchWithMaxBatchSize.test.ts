import { expect, it } from 'vitest';

import { DataLoader, type DataLoaderOptions } from '../index';

const loadThreeKeys = async (options: DataLoaderOptions<number, number>) => {
  const batches: number[][] = [];
  const loader = new DataLoader<number, number>(async (keys) => {
    batches.push([...keys]);
    return [...keys];
  }, options);
  await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);
  return batches;
};

it.each<[string, DataLoaderOptions<number, number>, number[][]]>([
  ['{}', {}, [[1, 2, 3]]],
  ['{ maxBatchSize: 2 }', { maxBatchSize: 2 }, [[1, 2], [3]]],
  ['{ disableBatch: true }', { disableBatch: true }, [[1], [2], [3]]],
  [
    '{ disableBatch: false, maxBatchSize: 2 }',
    { disableBatch: false, maxBatchSize: 2 },
    [[1, 2], [3]],
  ],
])('accepts %s as batching options', async (_, options, batches) => {
  expect(await loadThreeKeys(options)).toEqual(batches);
});

it('accepts each batching shape as an inline constructor argument', () => {
  const batchLoader = async (keys: ReadonlyArray<number>) => [...keys];
  const createSplit = (singleKey: boolean) =>
    new DataLoader(
      batchLoader,
      singleKey ? { disableBatch: true } : { maxBatchSize: 2 },
    );
  expect([
    createSplit(true),
    createSplit(false),
    new DataLoader(batchLoader, {}),
    new DataLoader(batchLoader, { maxBatchSize: 2 }),
    new DataLoader(batchLoader, { disableBatch: true }),
    new DataLoader(batchLoader, { disableBatch: false, maxBatchSize: 2 }),
    new DataLoader(batchLoader, {
      disableBatch: true,
      maxBatchSize: undefined,
    }),
  ]).toHaveLength(7);
});

it('rejects maxBatchSize beside disableBatch: true; JavaScript callers get one key per batch', async () => {
  const batches: number[][] = [];
  const loader = new DataLoader(
    async (keys: ReadonlyArray<number>) => {
      batches.push([...keys]);
      return [...keys];
    },
    // @ts-expect-error maxBatchSize is not accepted once disableBatch is true
    { disableBatch: true, maxBatchSize: 2 },
  );
  await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);
  expect(batches).toEqual([[1], [2], [3]]);
});

it('rejects maxBatchSize beside a boolean disableBatch and accepts the split shapes', async () => {
  type Options = DataLoaderOptions<number, number>;
  const settings = (disableBatch: boolean) => ({
    disableBatch,
    maxBatchSize: 2,
  });
  // @ts-expect-error a boolean disableBatch may be true, which rules out maxBatchSize
  const combined = (disableBatch: boolean): Options => settings(disableBatch);
  const split = (disableBatch: boolean): Options =>
    disableBatch ? { disableBatch: true } : { maxBatchSize: 2 };
  const flagOnly = (disableBatch: boolean): Options => ({ disableBatch });

  expect(await loadThreeKeys(combined(true))).toEqual([[1], [2], [3]]);
  expect(await loadThreeKeys(split(true))).toEqual([[1], [2], [3]]);
  expect(await loadThreeKeys(split(false))).toEqual([[1, 2], [3]]);
  expect(await loadThreeKeys(flagOnly(false))).toEqual([[1, 2, 3]]);
});
