import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { DataLoader } from '../index';

it.each([
  'documents/docs/winglet/data-loader/index.mdx',
  'documents/i18n/ko/docusaurus-plugin-content-docs/current/winglet/data-loader/index.mdx',
])('round-4 site options are accepted: %s', async file => {
  const page = readFileSync(resolve(__dirname, '../../../../..', file), 'utf8');
  const names = [...page.matchAll(/^\| `([A-Za-z]+)` \|/gm)].map(match => match[1]);
  const known = ['load', 'loadMany', 'clear', 'clearAll', 'prime', 'name', 'cache', 'cacheKeyFn', 'batchScheduler', 'maxBatchSize', 'disableBatch'];
  expect(names.filter(name => !known.includes(name))).toEqual([]);
  const schedulerKey = names.includes('batchScheduler') ? 'batchScheduler' : 'scheduler';
  let scheduled = 0;
  const cache = new Map<number, Promise<number>>();
  const loader = new DataLoader<number, number>(async keys => keys, {
    name: 'example', cache,
    [schedulerKey]: (task: () => void) => { scheduled++; queueMicrotask(task); },
  });
  await loader.load(1);
  expect(scheduled).toBe(1);
  expect(cache.has(1)).toBe(true);
});
