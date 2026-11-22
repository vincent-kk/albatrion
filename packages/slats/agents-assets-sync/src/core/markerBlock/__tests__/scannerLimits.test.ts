import { describe, expect, it } from 'vitest';

import { parseBlocks } from '../markerBlock.js';

const block = [
  '<!-- AGENTS-ASSETS-SYNC:START:pkg:rules/a.md -->',
  'hello',
  '<!-- AGENTS-ASSETS-SYNC:END:pkg:rules/a.md -->',
  '',
];

function read(lines: readonly string[]): unknown {
  try {
    return parseBlocks([...lines, ...block].join('\n')).map(
      ({ blockId, body }) => ({ blockId, body }),
    );
  } catch (error) {
    return String(error);
  }
}

describe('AC-MB-MODEL — constructs the scanner does not interpret', () => {
  it.each(['>', '-'])(
    'limit: an inline code span after "%s" is refused like a fence there (self-hunt item 1, 2)',
    (prefix) => {
      const inline = read(['# Notes', '', `${prefix} \`\`\`inline\`\`\``, '']);
      expect(inline).toMatch(
        /document:3: Fences inside blockquotes or list items are not supported/,
      );
      expect(inline).toEqual(read(['# Notes', '', `${prefix} \`\`\`ts`, '']));
    },
  );

  it('limit: a heading that interrupts a list keeps the list indentation like a paragraph does (self-hunt item 2)', () => {
    const fence = ['  ```ts', '  const x = 1;', '  ```', ''];
    const heading = read(['- list item', '# Heading', ...fence]);
    expect(heading).toMatch(
      /document:3: Fences inside blockquotes or list items are not supported/,
    );
    expect(heading).toEqual(read(['- list item', 'more text', ...fence]));
  });

  it('a comment whose only --> sits in backticks is closed like one closed in prose (self-hunt item 4)', () => {
    const inCode = read(['<!-- `-->` still unclosed', '']);
    expect(inCode).toEqual([{ blockId: 'pkg:rules/a.md', body: 'hello\n' }]);
    expect(inCode).toEqual(read(['<!-- plain --> still unclosed', '']));
  });
});
