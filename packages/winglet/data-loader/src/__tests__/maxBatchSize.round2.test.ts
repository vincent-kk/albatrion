import { describe, expect, it } from 'vitest';
import { DataLoader } from '../index';

describe('round-2 data-loader 1: positive integral batch limits', () => {
  it.each([NaN, 2.5, 0.5, -Infinity, 0, -1])('rejects %s at construction', maxBatchSize => {
    expect(() => new DataLoader(async keys => keys, { maxBatchSize })).toThrow('must be a positive integer');
  });
  it.each([1, 2, Infinity])('accepts %s and respects the limit', async maxBatchSize => {
    const calls: number[][] = [];
    const loader = new DataLoader<number, number>(async keys => { calls.push([...keys]); return keys; }, { maxBatchSize });
    expect(await Promise.all([loader.load(1), loader.load(2), loader.load(3)])).toEqual([1, 2, 3]);
    expect(calls.every(batch => batch.length <= maxBatchSize)).toBe(true);
  });
  it('keeps disableBatch precedence over unused maxBatchSize', async () => {
    const loader = new DataLoader<number, number>(async keys => keys, { disableBatch: true, maxBatchSize: NaN });
    expect(await loader.load(1)).toBe(1);
  });
});
