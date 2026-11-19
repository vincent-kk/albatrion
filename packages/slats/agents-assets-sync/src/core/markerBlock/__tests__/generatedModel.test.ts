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
    const eol = random(2) ? '\r\n' : '\n';
    const fence = (random(2) ? '`' : '~').repeat(3 + random(8));
    const id = 'pkg:rules/a.md';
    const start = `<!-- AGENTS-ASSETS-SYNC:START:${id} -->`;
    const end = `<!-- AGENTS-ASSETS-SYNC:END:${id} -->`;
    const example = `${fence}md${eol}${start}${eol}${end}${eol}${fence}${eol}`;
    const comment = `<!--${eol}${start}${eol}${end}${eol}-->${eol}`;
    const prefix = (random(2) ? '\uFEFF' : '') + example + comment;
    const source = (random(2) ? '\uFEFF' : '') + `${fence}md${eol}code${eol}${fence}${eol}`;
    const body = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const count = 1 + random(4);
    const blocks = Array.from({ length: count }, (_, index) => ({
      blockId: index && random(2) ? `${id}-${index}` : id,
      body: `body ${index}${eol}`,
    }));
    const written = prefix + blocks.map((block) =>
      `<!-- AGENTS-ASSETS-SYNC:START:${block.blockId} -->${eol}${block.body}<!-- AGENTS-ASSETS-SYNC:END:${block.blockId} -->${eol}`,
    ).join('');
    const label = `seed=${initialSeed}, sequence=${sequence}`;
    expect(parseBlocks(written).map(({ blockId, body }) => ({ blockId, body })), label).toEqual(blocks);
    const applied = upsertBlock(written, id, source);
    expect(upsertBlock(applied, id, source), label).toBe(applied);
    expect(parseBlocks(applied).filter((block) => block.blockId === id).map((block) => block.body), label).toEqual([body]);
    expect(applied.startsWith(prefix), label).toBe(true);
  }
});

it('refuses every generated ambiguous boundary rather than returning partial knowledge', () => {
  const id = 'pkg:rules/a.md';
  const start = `<!-- AGENTS-ASSETS-SYNC:START:${id} -->`;
  const end = `<!-- AGENTS-ASSETS-SYNC:END:${id} -->`;
  const invalid = [start, end, `${start}\n${start}\n${end}`, `${start}\n<!--\n${end}`, `${start}\n${end.replace('END:', 'END')}`, `${start}\n~~~\n${end}\n~~~`];
  for (let index = 0; index < 3000; index++) {
    const document = `${index % 2 ? '\uFEFF' : ''}# user\n${invalid[index % invalid.length]}\n`.replace(/\n/g, index % 3 ? '\n' : '\r\n');
    expect(() => parseBlocks(document), `seed=5, sequence=${index}`).toThrow(/:\d+:/);
    expect(() => upsertBlock(document, 'pkg:rules/b.md', 'new\n'), `sequence=${index}`).toThrow(/:\d+:/);
  }
});
