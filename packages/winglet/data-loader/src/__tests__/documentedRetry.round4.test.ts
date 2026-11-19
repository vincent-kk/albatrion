import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { DataLoader } from '../index';

it.each(['README.md', 'README-ko_kr.md'])('round-4 retry guidance: %s', async file => {
  const text = readFileSync(resolve(__dirname, '../..', file), 'utf8');
  const section = text.split(file === 'README.md' ? '### Error Handling and Retry' : '### 에러 처리 및 재시도')[1]?.split('---')[0] ?? '';
  expect(section).not.toContain('return userIds.map(() => error)');
  expect(section).toMatch(/clear\(key\)/);
  let failed = true;
  const loader = new DataLoader<string, string>(async keys => { if (failed) throw Error('temporary'); return keys; });
  await expect(loader.load('key')).rejects.toThrow('temporary');
  failed = false;
  expect(await loader.load('key')).toBe('key');
  const perKey = new DataLoader<string, string>(async keys => keys.map(key => failed ? Error('temporary') : key));
  failed = true;
  await expect(perKey.load('key')).rejects.toThrow('temporary');
  failed = false;
  await expect(perKey.load('key')).rejects.toThrow('temporary');
  expect(await perKey.clear('key').load('key')).toBe(await loader.load('key'));
});
