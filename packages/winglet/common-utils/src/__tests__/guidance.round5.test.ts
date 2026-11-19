import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, it } from 'vitest';

it('documents own-field limits next to the other built-in subclass limits', () => {
  const source = readFileSync(resolve(__dirname, '../utils/object/clone.ts'), 'utf8');
  const limits = source.split('**Known Limits:**')[1]?.split('*/')[0];
  expect(limits).toMatch(/own (properties|fields)/i);
  expect(limits).toMatch(/Map.*Set.*Date.*RegExp.*Array/);
});

it('the Korean isEmpty guidance retains the English realm restriction', () => {
  const korean = readFileSync(resolve(__dirname, '../../README-ko_kr.md'), 'utf8');
  const line = korean.split('\n').find(line => line.includes('**[`isEmpty`]'));
  expect(line).toMatch(/Map/);
  expect(line).toMatch(/Set/);
  expect(line).toMatch(/realm|렐름/);
});
