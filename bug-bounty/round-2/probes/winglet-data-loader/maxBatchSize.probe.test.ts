import { describe, expect, it } from 'vitest';

import { DataLoader } from '../../index';

describe('r2-periphery: maxBatchSize validation', () => {
  it('rejects a non-integer maxBatchSize (docs: must be a positive integer)', () => {
    expect(
      () => new DataLoader(async (k) => k, { maxBatchSize: NaN }),
    ).toThrow();
    expect(
      () => new DataLoader(async (k) => k, { maxBatchSize: 2.5 }),
    ).toThrow();
  });

  it('NaN maxBatchSize: three loads in one tick form one batch or throw', async () => {
    const calls: number[][] = [];
    let loader: DataLoader<number, number> | null = null;
    try {
      loader = new DataLoader<number, number>(
        async (keys) => {
          calls.push([...keys]);
          return keys.map((k) => k);
        },
        { maxBatchSize: NaN },
      );
    } catch {
      return;
    }
    await Promise.all([loader.load(1), loader.load(2), loader.load(3)]);
    expect(calls).toEqual([[1, 2, 3]]);
  });
});
