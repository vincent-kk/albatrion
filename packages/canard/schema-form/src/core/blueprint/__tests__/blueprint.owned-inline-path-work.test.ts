import { afterEach, expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';

/** Count only the child producer's segment escaping, outside unrelated pointer work. */
const work = vi.hoisted(() => ({ names: [] as string[] }));

vi.mock('@winglet/json/pointer', async (importOriginal) => {
  const original = await importOriginal<typeof import('@winglet/json/pointer')>();
  return {
    ...original,
    escapeSegment: (name: string) => {
      if (new Error().stack?.split('\n')[2]?.includes('populateNodeChildren.ts'))
        work.names.push(name);
      return original.escapeSegment(name);
    },
  };
});

afterEach(() => { work.names = []; });

it('escapes each ungated name once while producing both public paths', () => {
  const result = blueprint({
    type: 'object',
    properties: { 'a/~': { type: 'string' }, 'q"\\\n': { type: 'number' } },
  });
  expect(result.root.childEntries.map(entry => [entry.name, entry.declarations[0].path, entry.declarations[0].schemaPath]))
    .toEqual([
      ['a/~', '/a~1~0', '#/properties/a~1~0'],
      ['q"\\\n', '/q"\\\n', '#/properties/q"\\\n'],
    ]);
  console.log(`107COUNT path-strings fast escaping=${work.names.length} names=2`);
  expect(work.names).toEqual(['a/~', 'q"\\\n']);
});

it('reuses one escaped segment across contributions to the same general-path name', () => {
  const result = blueprint({
    type: 'object',
    properties: { 'a/~': { type: 'string' } },
    allOf: [{ properties: { 'a/~': { minLength: 1 }, second: { type: 'number' } } }],
  });
  expect(result.root.childEntries.map(entry => entry.name)).toEqual(['a/~', 'second']);
  expect(result.root.childEntries[0].declarations[0].path).toBe('/a~1~0');
  expect(result.root.childEntries[0].declarations[0].schemaPath).toBe('#/properties/a~1~0');
  console.log(`107COUNT path-strings general escaping=${work.names.length} names=2`);
  expect(work.names).toEqual(['a/~', 'second']);
});
