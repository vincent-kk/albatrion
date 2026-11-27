import { expect, it } from 'vitest';

import { parseBlocks, removeBlock, upsertBlock } from '../markerBlock.js';
import { scanDocument } from '../utils/scanDocument/scanDocument.js';

const ID = '@probe/bom:rules/a.md';
const START = `<!-- AGENTS-ASSETS-SYNC:START:${ID} -->`;
const END = `<!-- AGENTS-ASSETS-SYNC:END:${ID} -->`;

it.each([
  ['unicode-lf', '\uFEFF', '\n'],
  ['unicode-crlf', '\uFEFF', '\r\n'],
  ['bytes-lf', '\xEF\xBB\xBF', '\n'],
  ['bytes-crlf', '\xEF\xBB\xBF', '\r\n'],
] as const)(
  'classifies a closed fence after one leading mark: %s',
  (_, mark, eol) => {
    const text = mark + ['```md', START, 'body', END, '```', ''].join(eol);
    const ordinary = text.slice(mark.length);
    expect(scanDocument(text)).toEqual(scanDocument(ordinary));
    expect(scanDocument(text).issue).toBeUndefined();
    expect(parseBlocks(text)).toEqual([]);
  },
);

it.each(['\uFEFF', '\xEF\xBB\xBF'])(
  'still refuses an open fence after %j',
  (mark) => {
    const text = mark + '```md\nexample\n';
    expect(scanDocument(text).issue).toEqual(
      scanDocument(text.slice(mark.length)).issue,
    );
    expect(scanDocument(text).issue?.line).toBe(1);
    expect(() => upsertBlock(text, ID, '# source\n')).toThrow(
      'Unclosed fenced code block',
    );
  },
);

it.each(['\uFEFF', '\xEF\xBB\xBF'])(
  'preserves %j before a replaced or removed first block',
  (mark) => {
    const text = mark + [START, '# old', END, ''].join('\n');
    expect(parseBlocks(text)).toHaveLength(1);
    const rewritten = upsertBlock(text, ID, '# updated\n');
    expect(rewritten).toBe(mark + [START, '# updated', END, ''].join('\n'));
    expect(removeBlock(text, ID)).toBe(mark);
    expect(upsertBlock(rewritten, ID, '# updated\n')).toBe(rewritten);
  },
);

it('does not discard a mark on a later line', () => {
  const text = ['# user', '\uFEFF```md', START, 'body', END, '```', ''].join(
    '\n',
  );
  expect(scanDocument(text).issue?.line).toBe(6);
});
