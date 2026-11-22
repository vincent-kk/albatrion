import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { DataLoader } from '../index';

it('rejects and caches a foreign per-key Error without disturbing successful neighbors', async () => {
  const error: Error = runInNewContext('new TypeError("remote fetch failed")');
  const loader = new DataLoader<string, string>(async (keys) =>
    keys.map((key) => (key === 'bad' ? error : key)),
  );

  const failure = expect(loader.load('bad')).rejects.toBe(error);
  await expect(loader.load('good')).resolves.toBe('good');
  await failure;
  await expect(loader.load('bad')).rejects.toBe(error);
  await expect(loader.loadMany(['bad', 'good'])).resolves.toEqual([
    error,
    'good',
  ]);
});

it('rejects a key primed with a foreign Error', async () => {
  const error: Error = runInNewContext('new Error("remote cached failure")');
  const loader = new DataLoader<string, string>(async (keys) =>
    keys.map(String),
  );
  loader.prime('bad', error);
  await expect(loader.load('bad')).rejects.toBe(error);
});
