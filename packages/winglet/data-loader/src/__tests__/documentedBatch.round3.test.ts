import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { expect, it } from 'vitest';

import { DataLoader } from '../index';

it('the documented one-query example batches like concurrent requests', async () => {
  const source = readFileSync(
    new URL('../DataLoader.ts', import.meta.url),
    'utf8',
  );
  const example = source.match(
    /Basic usage with database queries:[\s\S]*?```typescript([\s\S]*?)\* ```/,
  )?.[1];
  if (!example) throw new Error('The basic query example is missing');
  const code = example.replace(/^\s*\* ?/gm, '');
  const start = code.indexOf('const userLoader');
  if (start < 0) throw new Error('The example no longer constructs its loader');
  const actualBatches: string[][] = [],
    referenceBatches: string[][] = [];
  const actual = await new Script(
    '(async () => {' +
      code.slice(start) +
      '\nreturn [user1, user2, user3];})()',
  ).runInNewContext({
    DataLoader,
    batchLoadUsers: async (keys: ReadonlyArray<string>) => {
      actualBatches.push([...keys]);
      return keys.map((id) => ({ id }));
    },
  });
  const reference = new DataLoader<string, { id: string }>(async (keys) => {
    referenceBatches.push([...keys]);
    return keys.map((id) => ({ id }));
  });
  const expected = await Promise.all(
    ['user-1', 'user-2', 'user-3'].map((id) => reference.load(id)),
  );
  expect(actual).toEqual(expected);
  expect(actualBatches).toEqual(referenceBatches);
});
