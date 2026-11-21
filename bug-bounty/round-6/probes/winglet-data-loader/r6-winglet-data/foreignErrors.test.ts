import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { DataLoader } from '@/data-loader';

it('batch foreign errors reject just like local per-key errors', async () => {
  const error = runInNewContext('new Error("remote fetch failed")');
  const loader = new DataLoader<string, string>(async () => [error]);
  const result = await loader.load('a').then(
    value => ({ status: 'fulfilled', message: (value as unknown as Error).message }),
    reason => ({ status: 'rejected', message: reason.message }),
  );
  expect(result).toEqual({ status: 'rejected', message: 'remote fetch failed' });
});

it('primed foreign errors reject just like local primed errors', async () => {
  const error = runInNewContext('new Error("remote cached failure")');
  const loader = new DataLoader<string, string>(async keys => keys.map(String));
  loader.prime('a', error);
  expect(await loader.load('a').then(() => 'fulfilled', () => 'rejected')).toBe('rejected');
});

it('control: local batch and primed errors reject', async () => {
  const error = new Error('failure');
  const loader = new DataLoader<string, string>(async () => [error]);
  expect(await loader.load('a').then(() => 'fulfilled', () => 'rejected')).toBe('rejected');
  loader.prime('b', error);
  expect(await loader.load('b').then(() => 'fulfilled', () => 'rejected')).toBe('rejected');
});
