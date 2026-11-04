import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as slotWriter from '../utils/slots/writeSlotPath';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-zero-survivor-discard
it.each([false, true])(
  'drops zero-survivor latent writes with keep declarations=%s',
  (declaredKeep) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '#/open', unsetOnInactive: true },
          items: {
            type: 'object',
            properties: {
              drop: { type: 'number' },
              ...(declaredKeep
                ? {
                    keep: {
                      type: 'number' as const,
                      controls: { unsetOnInactive: false },
                    },
                  }
                : {}),
            },
          },
        },
        kept: {
          type: 'number',
          controls: { active: '#/open', unsetOnInactive: false },
        },
      },
    });
    dispatchMount(root, { open: true, list: [{ drop: 1 }], kept: 2 });
    const item = getDispatchNode(root, 'list', '0');
    const child = getDispatchNode(root, 'list', '0', 'drop');
    const kept = getDispatchNode(root, 'kept');
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    const writer = vi.spyOn(slotWriter, 'writeSlotPath');
    dispatchSetValue(kept, 3);
    expect(writer).not.toHaveBeenCalled();
    writer.mockClear();
    dispatchSetValue(child, 99);
    dispatchSetValue(item, { drop: 100 });
    expect(writer).not.toHaveBeenCalled();
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(getDispatchNode(root, 'list').local).toEqual([]);
    expect(getDispatchNode(root, 'kept').local).toBe(2);
  },
);

it('drops latent writes below a cleared inner array of a kept outer item', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      kept: {
        type: 'number',
        controls: { active: '#/open', unsetOnInactive: false },
      },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: {
          type: 'object',
          properties: {
            keep: { type: 'number', controls: { unsetOnInactive: false } },
            inner: {
              type: 'array',
              items: { type: 'object', properties: { x: { type: 'number' } } },
            },
          },
        },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    kept: 7,
    list: [{ keep: 1, inner: [{ x: 2 }] }],
  });
  const old = getDispatchNode(root, 'list', '0', 'inner', '0', 'x');
  const kept = getDispatchNode(root, 'kept');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const writer = vi.spyOn(slotWriter, 'writeSlotPath');
  dispatchSetValue(kept, 8);
  expect(writer).not.toHaveBeenCalled();
  writer.mockClear();
  dispatchSetValue(old, 9);
  expect(writer).not.toHaveBeenCalled();
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'list').local).toEqual([{ keep: 1 }]);
  expect(getDispatchNode(root, 'kept').local).toBe(7);
});

it('drops latent writes through an already inactive zero-survivor descendant', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      show: { type: 'boolean' },
      kept: {
        type: 'number',
        controls: { active: '#/open', unsetOnInactive: false },
      },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: {
          type: 'object',
          properties: {
            drop: { type: 'number' },
            keep: {
              type: 'number',
              controls: { active: '#/show', unsetOnInactive: false },
            },
          },
        },
      },
    },
  });
  dispatchMount(root, { open: true, show: true, kept: 7, list: [{ drop: 1 }] });
  const old = getDispatchNode(root, 'list', '0', 'keep');
  const kept = getDispatchNode(root, 'kept');
  dispatchSetValue(getDispatchNode(root, 'show'), false);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const writer = vi.spyOn(slotWriter, 'writeSlotPath');
  dispatchSetValue(kept, 8);
  expect(writer).not.toHaveBeenCalled();
  writer.mockClear();
  dispatchSetValue(old, 5);
  expect(writer).not.toHaveBeenCalled();
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'list').local).toEqual([]);
  expect(getDispatchNode(root, 'kept').local).toBe(7);
});
