import { afterEach, expect, it, vi } from 'vitest';

import { parsePointer } from '@/schema-form/helpers/jsonPointer';

import { dispatchSetValue } from '../../../../write';
import { getDispatchNode } from '../../../__tests__/fixtures/getDispatchNode';
import { mountPresenceTree } from '../../../__tests__/helpers/mountPresenceTree';
import { getDependencyIndex } from '../getDependencyIndex';
import { getLivePresenceNode } from '../getLivePresenceNode';

/** Counts every full-pointer decode, including the jsonPointer fractal's own callers. */
const decoder = vi.hoisted(() => vi.fn());

vi.mock(
  '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments',
  async (importOriginal) => {
    const original = await importOriginal<{
      parsePointerSegments: (pointer: string | readonly string[]) => unknown;
    }>();
    return {
      ...original,
      parsePointerSegments: (pointer: string | readonly string[]) => {
        decoder(pointer);
        return original.parsePointerSegments(pointer);
      },
    };
  },
);

afterEach(() => vi.restoreAllMocks());

it('expands retained template syntax against the current array in document order', () => {
  const root = mountPresenceTree(
    {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reader: { type: 'string', controls: { active: '#/flag' } },
            },
          },
        },
      },
    },
    { flag: true, rows: [{ reader: 'A' }, { reader: 'B' }] },
  );
  const index = getDependencyIndex(root.runtime.blueprint);
  const template = index.pathSegments('/rows/*/reader');
  decoder.mockClear();
  parsePointer('/positive-control');
  expect(decoder).toHaveBeenCalledTimes(1);
  decoder.mockClear();
  expect(
    index.affected('/flag', root).filter((path) => path.endsWith('/reader')),
  ).toEqual(['/rows/0/reader', '/rows/1/reader']);
  expect(decoder).not.toHaveBeenCalled();
  dispatchSetValue(getDispatchNode(root, 'rows'), [{ reader: 'C' }]);
  decoder.mockClear();
  expect(
    index.affected('/flag', root).filter((path) => path.endsWith('/reader')),
  ).toEqual(['/rows/0/reader']);
  expect(index.pathSegments('/rows/*/reader')).toBe(template);
  expect(decoder).not.toHaveBeenCalled();
  dispatchSetValue(getDispatchNode(root, 'rows'), [
    { reader: 'D' },
    { reader: 'E' },
    { reader: 'F' },
  ]);
  decoder.mockClear();
  expect(
    index.affected('/flag', root).filter((path) => path.endsWith('/reader')),
  ).toEqual(['/rows/0/reader', '/rows/1/reader', '/rows/2/reader']);
  expect(decoder).not.toHaveBeenCalled();
});

it('reuses folded watched arrays while keeping concrete presence intersections exact', () => {
  const root = mountPresenceTree(
    {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              active: { type: 'boolean' },
              reader: {
                type: 'string',
                controls: { active: '../../0/active === true' },
              },
            },
          },
        },
      },
    },
    {
      rows: [
        { active: true, reader: 'A' },
        { active: true, reader: 'B' },
      ],
    },
  );
  const index = getDependencyIndex(root.runtime.blueprint);
  for (const path of ['/rows/0', '/rows/0/active', '/rows/1', '/rows/1/active'])
    index.pathSegments(path, root.runtime);
  decoder.mockClear();
  for (let repeat = 0; repeat < 2; repeat++) {
    expect(
      index.affectedByPresence('/rows/0', 'active', undefined, {}, root.runtime)
        .outerTemplates,
    ).toContain('/rows/*/reader');
    expect(
      index.affectedByPresence('/rows/1', 'active', undefined, {}, root.runtime)
        .outerTemplates,
    ).not.toContain('/rows/*/reader');
  }
  expect(decoder).not.toHaveBeenCalled();
});

it('keeps canonical numeric wildcard matching distinct from numeric-looking names', () => {
  const root = mountPresenceTree(
    {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              flag: { type: 'boolean' },
              reader: { type: 'string', controls: { active: '../flag' } },
            },
          },
        },
      },
    },
    { rows: [{ flag: true, reader: 'R' }] },
  );
  const index = getDependencyIndex(root.runtime.blueprint);
  expect(index.affected('/rows/0/flag', root)).toContain('/rows/0/reader');
  for (const name of ['01', '-1', '1.0'])
    expect(index.affected(`/rows/${name}/flag`, root)).not.toContain(
      `/rows/${name}/reader`,
    );
});

it('resolves the current literal owner after departure and replacement at the same path', () => {
  const root = mountPresenceTree(
    {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        '*': { type: 'string', controls: { active: '../flag' } },
      },
    },
    { flag: true, '*': 'R' },
  );
  const first = getLivePresenceNode(root, '/%2A');
  expect(first).toBe(getDispatchNode(root, '*'));
  const index = getDependencyIndex(root.runtime.blueprint);
  const syntax = index.pathSegments('/%2A');
  dispatchSetValue(getDispatchNode(root, 'flag'), false);
  expect(getLivePresenceNode(root, '/%2A')).toBeUndefined();
  dispatchSetValue(getDispatchNode(root, 'flag'), true);
  const current = getLivePresenceNode(root, '/%2A');
  expect(current).toBe(getDispatchNode(root, '*'));
  expect(current).not.toBe(first);
  expect(index.pathSegments('/%2A')).toBe(syntax);
});
