import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildFieldNodeTree, mountFieldNode } from '@/schema-form/core/surface';

import { DirtyPathSet } from '../utils/scratch/DirtyPathSet';
import { observeDirtyPostOrderWrites } from './fixtures/observeDirtyPostOrderWrites';

afterEach(() => vi.restoreAllMocks());

describe('gate-less write dirty indexing', () => {
  it('keeps the general index during a gated write', () => {
    const root = buildFieldNodeTree({
      jsonSchema: {
        type: 'object',
        properties: {
          toggle: { type: 'boolean', default: false },
          head: {
            type: 'string',
            default: 'h',
            controls: { active: '../toggle === true' },
          },
        },
      },
      validationMode: 0,
    });
    mountFieldNode(root, undefined, undefined, { deferValidation: false });
    const begin = vi.spyOn(DirtyPathSet.prototype, 'beginPostOrder');
    root.find('/toggle')!.setValue(true);
    expect(begin).not.toHaveBeenCalled();
    expect(root.value).toEqual({ toggle: true, head: 'h' });
  });

  it('starts post-order indexing before adding the first path of a nested root write', () => {
    const root = buildFieldNodeTree({
      jsonSchema: {
        type: 'object',
        properties: {
          a: {
            type: 'object',
            properties: { b: { type: 'string', default: 'before' } },
          },
        },
      },
      validationMode: 0,
    });
    mountFieldNode(root, undefined, undefined, { deferValidation: false });
    const begin = vi.spyOn(DirtyPathSet.prototype, 'beginPostOrder');
    const add = vi.spyOn(DirtyPathSet.prototype, 'add');
    root.setValue({ a: { b: 'after' } });
    expect(add.mock.calls.length).toBeGreaterThan(0);
    expect(begin.mock.invocationCallOrder[0]).toBeLessThan(
      add.mock.invocationCallOrder[0],
    );
    expect(root.value).toEqual({ a: { b: 'after' } });
  });
});

// Characterization snapshots of the pre-change engine at 47ad92cf3.
// These three common eleven-step histories differ from the diagnosis's
// nested/derived/array eleven-write probe, which is checked separately.
describe('pre-change listener delivery characterization', () => {
  it.each(['flat-100', 'nested-d4', 'oneOf-10'] as const)(
    'preserves %s delivery order, payload kinds and final values',
    async (fixture) => {
      const record = await observeDirtyPostOrderWrites(fixture);
      await expect(JSON.stringify(record, null, 2) + '\n').toMatchFileSnapshot(
        `./fixtures/dirty-postorder-${fixture}.json`,
      );
    },
  );
});
