import { expect, it } from 'vitest';

import { hashContent } from '../../hash/index.js';
import { blockBodyMatches, upsertBlock } from '../markerBlock.js';
import { normalizeModel } from './helpers/normalizeModel.js';
import { readModelBlocks } from './helpers/readModelBlocks.js';

it('matches the canonical writer-body model for 5000 seeded source and target pairs', () => {
  let seed = 0x5c0a7;
  const random = (limit: number) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed >>> 8) % limit;
  };
  for (let sequence = 0; sequence < 5000; sequence++) {
    const initialSeed = seed;
    const source =
      ['', '\uFEFF', '\xEF\xBB\xBF'][random(3)] +
      [
        '',
        'text',
        'text\n',
        'text\n\n',
        '\xE9\r\nline',
        '\xB0\xA1\r',
        '~~~\r\ncode\r\n~~~',
        '\xEF\xBB\xBFplain',
      ][random(8)];
    const normalized = normalizeModel(source);
    const canonical = normalized.endsWith('\n')
      ? normalized
      : normalized + '\n';
    const label = `seed=${initialSeed}, sequence=${sequence}`;
    const written = readModelBlocks(
      upsertBlock('', 'pkg:rules/a.md', source),
    )[0]?.body;
    expect(written, label).toBe(canonical);
    const body = [canonical, canonical + '\n', '', 'edited\n'][
      random(4)
    ].replace(/\n/g, ['\n', '\r\n', '\r'][random(3)]);
    const expected = normalizeModel(body, false) === canonical;
    expect(
      blockBodyMatches(
        body,
        hashContent(Buffer.from(normalized, 'latin1')),
        'latin1',
      ),
      label,
    ).toBe(expected);
  }
});
