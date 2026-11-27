import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { DataLoader } from '../index';

it.each(['docs/en/SPECIFICATION.md','docs/ko/SPECIFICATION.md'])('%s supplies its TTL cache through the real cache option', async file => {
  const document = readFileSync(resolve(__dirname,'../..',file),'utf8');
  const key = /\b(cacheMap|cache): new TtlMap/.exec(document)?.[1] ?? 'missing';
  class ObservedCache<K,V> extends Map<K,V> {
    getCount = 0; setCount = 0;
    override get(key: K) { this.getCount++; return super.get(key); }
    override set(key: K,value: V) { this.setCount++; return super.set(key,value); }
  }
  const cache = new ObservedCache<number,Promise<number>>();
  const options = {name:'ttl',[key]:cache,batchScheduler:(task:()=>void)=>queueMicrotask(task)};
  const loader = new DataLoader<number,number>(async keys=>keys,options);
  await loader.load(1);
  expect([cache.getCount,cache.setCount]).toEqual([1,1]);
});

it('the documented per-key isolation pattern points to the retry policy and clearing permits retry', async () => {
  const root = resolve(__dirname,'../../docs/agents/skills/data-loader-skill/knowledge');
  const pattern = readFileSync(resolve(root,'advanced-patterns.md'),'utf8');
  const policy = readFileSync(resolve(root,'batching-and-caching.md'),'utf8');
  expect(pattern).toContain('(batching-and-caching.md#per-key-errors-stay-cached)');
  expect(policy).toContain('## Per-Key Errors Stay Cached');
  let failed = true;
  const loader = new DataLoader<string,number>(async keys=>keys.map(()=>failed?new Error('transient'):1));
  await expect(loader.load('key')).rejects.toThrow('transient');
  failed = false;
  await expect(loader.load('key')).rejects.toThrow('transient');
  const reference = new DataLoader<string,number>(async keys=>keys.map(()=>1));
  expect(await loader.clear('key').load('key')).toBe(await reference.load('key'));
});
