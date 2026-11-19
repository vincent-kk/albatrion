import { expect, it } from 'vitest';

import { parseBlocks, upsertBlock } from '../markerBlock.js';

it('matches the block-list reference model for 4000 seeded documents', () => {
  let seed = 0x5a17;
  const random = (size: number) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed >>> 8) % size;
  };
  for (let sequence = 0; sequence < 4000; sequence++) {
    const initialSeed = seed;
    const eol = ['\r\n', '\n', '\r'][random(3)];
    const fence = (random(2) ? '`' : '~').repeat(
      3 + random(sequence % 100 ? 48 : 4096),
    );
    const indent = ' '.repeat(random(4));
    const close = fence + fence[0].repeat(random(4));
    const id = 'pkg:rules/a.md';
    const start = `<!-- AGENTS-ASSETS-SYNC:START:${id} -->`;
    const end = `<!-- AGENTS-ASSETS-SYNC:END:${id} -->`;
    const example = `${indent}${fence}md${eol}${start}${eol}${end}${eol}${indent}${close}${eol}`;
    const comment = `<!--${eol}${start}${eol}<!--${eol}${end}${eol}`;
    const prefix =
      ['', '\uFEFF', '\xEF\xBB\xBF'][random(3)] +
      example +
      comment +
      'Use `<!--` as inline code.\n<!-- single line -->\n';
    const source =
      ['', '\uFEFF', '\xEF\xBB\xBF'][random(3)] +
      [
        '',
        'hello',
        'plain\n',
        'mixed\r\nline\nend',
        'edge\r\r\nend',
        '\xE9\rbare',
        '\xB0\xA1',
        `${fence}md${eol}code${eol}${fence}${random(2) ? eol : ''}`,
      ][random(8)];
    const body = source
      .replace(/^(?:\uFEFF|\xEF\xBB\xBF)/, '')
      .replace(/\r\n?/g, '\n');
    const count = random(5);
    const blocks = Array.from({ length: count }, (_, index) => ({
      blockId: index && random(2) ? `${id}-${index}` : id,
      body: random(2) ? `body ${index}${eol}` : '',
    }));
    const written =
      prefix +
      blocks
        .map(
          (block) =>
            `<!-- AGENTS-ASSETS-SYNC:START:${block.blockId} -->${eol}${block.body}<!-- AGENTS-ASSETS-SYNC:END:${block.blockId} -->${eol}`,
        )
        .join('');
    const label = `seed=${initialSeed}, sequence=${sequence}`;
    expect(
      parseBlocks(written).map(({ blockId, body }) => ({ blockId, body })),
      label,
    ).toEqual(blocks);
    const applied = upsertBlock(written, id, source);
    expect(upsertBlock(applied, id, source), label).toBe(applied);
    const replacement = {
      blockId: id,
      body: body.endsWith('\n') ? body : body + '\n',
    };
    const first = blocks.findIndex((block) => block.blockId === id);
    const expected = blocks.flatMap((block, index) =>
      block.blockId !== id ? [block] : index === first ? [replacement] : [],
    );
    if (first < 0) expected.push(replacement);
    expect(
      parseBlocks(applied).map(({ blockId, body }) => ({ blockId, body })),
      label,
    ).toEqual(expected);
    expect(applied.startsWith(prefix), label).toBe(true);
  }
});

it('refuses every generated ambiguous boundary rather than returning partial knowledge', () => {
  const id = 'pkg:rules/a.md';
  const start = `<!-- AGENTS-ASSETS-SYNC:START:${id} -->`;
  const end = `<!-- AGENTS-ASSETS-SYNC:END:${id} -->`;
  const invalid = [
    start,
    end,
    `${start}\n${start}\n${end}`,
    `${start}\n<!--\n${end}`,
    `${start}\n${end.replace('END:', 'END')}`,
    `${start}\n~~~\n${end}\n~~~`,
    `${start} `,
    `${end} `,
    '<!-- AGENTS-ASSETS-SYNC:BAD -->',
    '    ```\ncode\n    ```',
    '\t~~~\ncode\n\t~~~',
    '- item\n\n  ```\n  code\n  ```',
    '> ~~~\n> code\n> ~~~',
    '<!-- unclosed',
    '~~~\ncode',
    `${start}\n<!-- AGENTS-ASSETS-SYNC:END:other:r -->`,
    `${start}\n<!-- AGENTS-ASSETS-SYNC:START:other:r -->\n${end}`,
  ];
  for (let index = 0; index < 3000; index++) {
    const document =
      `${index % 2 ? '\uFEFF' : ''}# user\n${invalid[index % invalid.length]}\n`.replace(
        /\n/g,
        index % 3 ? '\n' : '\r\n',
      );
    expect(() => parseBlocks(document), `seed=5, sequence=${index}`).toThrow(
      /:\d+:/,
    );
    expect(
      () => upsertBlock(document, 'pkg:rules/b.md', 'new\n'),
      `sequence=${index}`,
    ).toThrow(/:\d+:/);
  }
});
