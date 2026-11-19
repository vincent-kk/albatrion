// RG2 follow-up: the round-2 isEmpty realm probe fails as a known limit that round-2
// common-utils 7 (9b5994c11) documented in README.md only. This checks the Korean README.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import { isEmpty } from '@/common-utils';

const packageRoot = resolve(__dirname, '../../..');
const isEmptyLine = (name: string) =>
  readFileSync(resolve(packageRoot, name), 'utf8')
    .split('\n')
    .find((line) => line.startsWith('- **[`isEmpty`]'));

describe('README-ko_kr.md carries the isEmpty realm limit that README.md states', () => {
  it('control: a populated Map from another realm is reported empty (the documented limit)', () => {
    const foreign = runInNewContext('new Map([["k", 1]])');
    expect(isEmpty(foreign)).toBe(true);
  });

  it('control: the English README line states the realm limit', () => {
    expect(isEmptyLine('README.md')).toContain('current realm');
  });

  it('the Korean README line states the realm limit for Map and Set', () => {
    expect(isEmptyLine('README-ko_kr.md')).toMatch(/realm|렐름|Map/);
  });
});
