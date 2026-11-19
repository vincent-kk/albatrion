import { expect, it } from 'vitest';

import { parseBlocks, upsertBlock } from '../markerBlock.js';

it('accepts trailing horizontal whitespace and refuses indentation across 3000 marker variants', () => {
  for (let sequence = 0; sequence < 3000; sequence++) {
    const id = `pkg:rules/${sequence}.md`;
    const suffix = [' ', '\t', ' \t  '][sequence % 3];
    const eol = ['\n', '\r\n', '\r'][Math.floor(sequence / 3) % 3];
    const start = `<!-- AGENTS-ASSETS-SYNC:START:${id} -->`;
    const end = `<!-- AGENTS-ASSETS-SYNC:END:${id} -->`;
    const document = start + suffix + eol + 'body' + eol + end + suffix + eol;
    expect(
      parseBlocks(document).map(({ blockId, body }) => ({ blockId, body })),
      `seed=7 sequence=${sequence}`,
    ).toEqual([{ blockId: id, body: 'body' + eol }]);
    const written = upsertBlock(document, id, 'new');
    expect(upsertBlock(written, id, 'new')).toBe(written);
    for (const indent of [' ', '\t', '   '])
      expect(() => parseBlocks(indent + document)).toThrow(/:1:/);
    const other = `pkg:rules/other-${sequence}.md`;
    expect(() =>
      parseBlocks(
        start + eol + `<!-- AGENTS-ASSETS-SYNC:START:${other} -->` + eol + end,
      ),
    ).toThrow(/:2:/);
    expect(() =>
      parseBlocks(
        start + eol + `<!-- AGENTS-ASSETS-SYNC:END:${other} -->` + eol + end,
      ),
    ).toThrow(/:2:/);
  }
});
