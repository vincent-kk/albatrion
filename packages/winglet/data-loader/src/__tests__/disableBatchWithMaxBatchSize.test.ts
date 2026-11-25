import { expect, it } from 'vitest';

import { DataLoader, type DataLoaderOptions } from '../index';

it('accepts disableBatch together with maxBatchSize in the type and lets disableBatch win', async () => {
  const options: DataLoaderOptions<number, number> = {
    maxBatchSize: 5,
    disableBatch: true,
  };
  const batches: number[][] = [];
  const loader = new DataLoader<number, number>(async (keys) => {
    batches.push([...keys]);
    return [...keys];
  }, options);

  await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);

  expect(batches).toEqual([[1], [2], [3]]);
});
