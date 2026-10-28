import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import { SchemaFormError } from '@/schema-form/errors';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { readRetainedSlotRaw } from '../../__tests__/fixtures/readRetainedSlotRaw';
import { hasRetainedSlotOwnSource } from '../../__tests__/fixtures/readRetainedSlotRaw';
import { getGateRegistry } from '../../utils/gates/getGateRegistry';
import { writeFieldNode } from '../../utils/write/writeFieldNode';
import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';

// filid:contract settle-array-rekey
describe('array path movement', () => {
  it('NODE-051 moves latent sources and registered gates with a live item', () => {
    const { root } = createTestTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          hidden: { type: 'string', controls: { active: '../show' } },
          count: { type: 'number' },
        },
      },
    });
    writeFieldNode(
      root,
      [
        { show: true, hidden: 'visible' },
        { show: false, hidden: 'secret', count: 'wrong' },
      ],
      'callerReplace',
      WriteOption.Overwrite,
    );
    const shifted = root.children![1];
    expect(hasRetainedSlotOwnSource(root, '/1/hidden', 'string')).toBe(true);
    expect(root.runtime.misfitPaths.has('/1/count')).toBe(true);
    expect(arrangeFieldNodeItems(root, { kind: 'remove', index: 0 })).toEqual({
      show: true,
      hidden: 'visible',
    });
    expect(root.children![0]).toBe(shifted);
    expect(shifted.path).toBe('/0');
    expect(hasRetainedSlotOwnSource(root, '/1/hidden', 'string')).toBe(false);
    expect(readRetainedSlotRaw(root, '/0/hidden', 'string')).toBe('secret');
    expect(root.runtime.misfitPaths.has('/1/count')).toBe(false);
    expect(root.runtime.misfitPaths.has('/0/count')).toBe(true);
    expect(
      getGateRegistry(root.runtime).hasRegisteredPathKind('/0', 'object'),
    ).toBe(true);
    expect(
      getGateRegistry(root.runtime).hasRegisteredPathKind('/1', 'object'),
    ).toBe(false);
    writeFieldNode(
      shifted.structure!.show,
      true,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(shifted.structure!.hidden.local).toBe('secret');
  });

  it('NODE-044 ignores writes through popped and removed references', () => {
    const { root } = createTestTree({
      type: 'array',
      items: { type: 'string' },
    });
    writeFieldNode(root, ['a', 'b'], 'callerReplace', WriteOption.Overwrite);
    const popped = root.children![1];
    expect(arrangeFieldNodeItems(root, { kind: 'pop' })).toBe('b');
    writeFieldNode(popped, 'latent', 'callerReplace', WriteOption.Overwrite);
    expect(readRetainedSlotRaw(root, '/1', 'string')).toBeUndefined();
    const removed = root.children![0];
    arrangeFieldNodeItems(root, { kind: 'push', value: 'c' });
    expect(arrangeFieldNodeItems(root, { kind: 'remove', index: 0 })).toBe('a');
    const commit = root.runtime.commitNumber;
    writeFieldNode(removed, 'ignored', 'callerReplace', WriteOption.Overwrite);
    expect(root.runtime.commitNumber).toBe(commit);
    expect(root.local).toEqual(['c']);
    expect(hasRetainedSlotOwnSource(root, '/0', 'string')).toBe(false);
  });

  it('NODE-044 ignores a detached array verb', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '../show' },
          items: { type: 'string' },
        },
      },
    });
    writeFieldNode(
      root,
      { show: true, list: ['a'] },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const former = root.structure!.list;
    writeFieldNode(
      root.structure!.show,
      false,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(former.detached).toBe(true);
    expect(arrangeFieldNodeItems(former, { kind: 'push', value: 'b' })).toBe(1);
    expect(readRetainedSlotRaw(root, '/list', 'array')).toEqual(['a']);
    writeFieldNode(
      root.structure!.show,
      true,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure!.list.local).toEqual(['a']);
    const commit = root.runtime.commitNumber;
    arrangeFieldNodeItems(former, { kind: 'push', value: 'ignored' });
    expect(root.runtime.commitNumber).toBe(commit);
    expect(root.structure!.list.local).toEqual(['a']);
  });

  it('58C-01 GOAL-073 retains the single budget error and does not reuse a spent key', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: ['string', 'boolean'] },
        items: {
          type: 'array',
          default: ['filled'],
          items: { type: 'string' },
        },
      },
      allOf: [
        {
          controls: { active: './a === "0"' },
          properties: { a: { type: 'boolean' } },
        },
        {
          controls: { active: './a !== "0"' },
          properties: { a: { type: 'string' } },
        },
      ],
    });
    let caught: unknown;
    try {
      writeFieldNode(root, { a: 0 }, 'callerReplace', WriteOption.Overwrite);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SchemaFormError);
    if (!(caught instanceof SchemaFormError))
      throw new Error('Missing budget failure');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.BUDGET_EXCEEDED');
    const host = root.structure!.items;
    const spent = host.nextItemKey;
    expect(spent).toBeGreaterThan(0);
    root.runtime.disableAutomaticWrites = true;
    arrangeFieldNodeItems(host, { kind: 'push', value: 'caller' });
    expect(host.children![0].itemKey).toBe(spent);
    expect(host.nextItemKey).toBeGreaterThan(spent);
  });
});
