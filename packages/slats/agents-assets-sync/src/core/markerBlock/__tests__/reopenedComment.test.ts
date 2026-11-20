import { describe, expect, it } from 'vitest';

import { parseBlocks, upsertBlock } from '../markerBlock.js';

const id = 'pkg:rules/a.md';
const start = `<!-- AGENTS-ASSETS-SYNC:START:${id} -->`;
const end = `<!-- AGENTS-ASSETS-SYNC:END:${id} -->`;

function refusal(document: string): string {
  try {
    parseBlocks(document);
  } catch (error) {
    return String(error);
  }
  return 'accepted';
}

describe('AC-MB-MODEL — a comment reopened after --> on its line', () => {
  it('refuses a block whose END only one reading sees, so a forced upsert keeps the prose', () => {
    const document = [start, '<!-- c --> <!-- x', end, 'user prose', end, ''].join(
      '\n',
    );
    expect(refusal(document)).toMatch(
      /document:3: HTML comment reopened after --> on line 2/,
    );
    expect(() => upsertBlock(document, id, 'new\n')).toThrow(/document:3:/);
  });

  it('gives an opener in inline code the same refusal as one in prose (self-hunt items 3 and 5)', () => {
    const inline = refusal(
      ['<!-- ok --> `<!-- inline`', '', start, 'hello', end, ''].join('\n'),
    );
    const prose = refusal(
      ['<!-- ok --> foo <!-- not a comment', '', start, 'hello', end, ''].join(
        '\n',
      ),
    );
    expect(inline).toMatch(/document:3: HTML comment reopened after --> on line 1/);
    expect(prose).toBe(inline);
  });

  it('refuses a fence line inside the disputed span', () => {
    const document = [
      '<!-- a --> <!-- x',
      '```',
      'y -->',
      start,
      'body',
      end,
      '```',
      '```',
      '',
    ].join('\n');
    expect(refusal(document)).toMatch(
      /document:2: HTML comment reopened after --> on line 1/,
    );
  });

  it('refuses a marker after a comment that closes and reopens on a continuation line', () => {
    const document = ['<!--', 'x --> <!-- y', start, end, ''].join('\n');
    expect(refusal(document)).toMatch(
      /document:3: HTML comment reopened after --> on line 2/,
    );
  });

  it('control: accepts a disputed span that holds no marker or fence line', () => {
    const document = [
      '<!-- a --> <!-- x',
      'prose',
      '-->',
      start,
      'body',
      end,
      '',
    ].join('\n');
    expect(parseBlocks(document).map(({ body }) => body)).toEqual(['body\n']);
  });
});
