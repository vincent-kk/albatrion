import { expect, it } from 'vitest';

import {
  findBlockBody,
  parseBlocks,
  removeBlock,
  upsertBlock,
} from '../markerBlock.js';

it.each([
  ['```', '```', 0, '\n'],
  ['```', '````', 3, '\n'],
  ['````', '`````', 0, '\n'],
  ['~~~', '~~~', 3, '\n'],
  ['~~~~', '~~~~~', 0, '\n'],
  ['~~~', '~~~~', 0, '\r\n'],
  ['```', '````', 3, '\r\n'],
  ['~~~~', '~~~~', 3, '\r\n'],
] as const)(
  'fenced %s example stays literal through all transformations',
  (open, close, indent, eol) => {
    const id = '@example/kit:rules/r.md';
    const block = upsertBlock('', id, 'example\n').replace(/\n/g, eol);
    const fence = `${' '.repeat(indent)}${open}markdown${eol}${block}${' '.repeat(indent)}${close}${eol}`;
    expect(parseBlocks(fence)).toEqual([]);
    const managed = upsertBlock(fence, id, 'real\n');
    expect(managed.startsWith(fence)).toBe(true);
    expect(findBlockBody(managed, id)).toBe(
      findBlockBody(upsertBlock('', id, 'real\n'), id),
    );
    expect(removeBlock(managed, id)).toBe(fence);
  },
);

it('a fenced END marker inside a live rule is literal just like a different marker id', () => {
  const id = '@example/kit:rules/r.md';
  const quoted = `\n~~~\n<!-- AGENTS-ASSETS-SYNC:END:${id} -->\n~~~\n`;
  const control = quoted.replace(`END:${id}`, 'END:other:rules/x.md');
  const body = findBlockBody(upsertBlock('', id, quoted), id);
  expect(body).toBe(quoted);
  expect(body?.length).toBeGreaterThan(0);
  expect(parseBlocks(upsertBlock('', id, quoted)).length).toBe(
    parseBlocks(upsertBlock('', id, control)).length,
  );
});
