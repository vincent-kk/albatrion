import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as ownership from '../utils/transition/selectCandidateOwnedLatent';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { readInactiveValuesAt } from './fixtures/readInactiveValuesAt';
import { readRetainedSlotRaw } from './fixtures/readRetainedSlotRaw';

it.each([
  { slots: 1, filters: 15 },
  { slots: 32, filters: 77 },
])(
  'keeps base ownership-selector and filter cost for $slots suppressed single-kind exits with unrelated candidates',
  ({ slots, filters }) => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          items: { type: 'string', controls: { active: '../../open' } },
        },
      },
      allOf: [
        {
          controls: { active: false },
          properties: { other: { type: 'number' } },
        },
        {
          controls: { active: false },
          properties: { other: { type: 'string' } },
        },
      ],
    });
    const values = new Array<string>(slots).fill('kept');
    dispatchMount(root, { open: true, list: values });
    const list = getDispatchNode(root, 'list');
    expect(root.blueprintNode.hasCandidateDescendants).toBe(true);
    expect(list.blueprintNode.hasCandidateDescendants === true).toBe(false);
    const open = getDispatchNode(root, 'open');
    runtime.disableAutomaticWrites = true;
    const selector = vi.spyOn(ownership, 'selectCandidateOwnedLatent');
    const filter = vi.spyOn(Array.prototype, 'filter');
    let selectorCalls = 0;
    let filterCalls = 0;
    try {
      dispatchSetValue(open, false);
      selectorCalls = selector.mock.calls.length;
      filterCalls = filter.mock.calls.length;
    } finally {
      filter.mockRestore();
      selector.mockRestore();
    }
    expect(selectorCalls).toBe(0);
    expect(filterCalls).toBeLessThanOrEqual(filters);
    expect(root.emit).toEqual({
      open: false,
      list: new Array(slots).fill(null),
    });
    expect(root.local).toEqual(root.emit);
    const inactive = [];
    for (let index = 0; index < slots; index++) {
      const path = '/list/' + index;
      expect(readRetainedSlotRaw(root, path, 'string')).toBe('kept');
      inactive.push({ path, value: 'kept' });
    }
    expect(readInactiveValuesAt(root, '')).toEqual(inactive);
    dispatchSetValue(open, true);
    expect(root.emit).toEqual({ open: true, list: values });
  },
);

it.each([{ slots: 1 }, { slots: 32 }])(
  'reuses candidate ownership for $slots suppressed candidate-slot exits',
  ({ slots }) => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          allOf: [
            { controls: { active: '../open' }, items: { type: 'string' } },
            { controls: { active: false }, items: { type: 'number' } },
          ],
        },
      },
    });
    const values = new Array<string>(slots).fill('kept');
    dispatchMount(root, { open: true, list: values });
    const list = getDispatchNode(root, 'list');
    expect(list.blueprintNode.hasCandidateDescendants).toBe(true);
    const open = getDispatchNode(root, 'open');
    runtime.disableAutomaticWrites = true;
    const selector = vi.spyOn(ownership, 'selectCandidateOwnedLatent');
    let selectorCalls = 0;
    let ownsSources = false;
    try {
      dispatchSetValue(open, false);
      selectorCalls = selector.mock.calls.length;
      ownsSources = selector.mock.results.every(
        (result) =>
          result.type === 'return' && typeof result.value === 'function',
      );
    } finally {
      selector.mockRestore();
    }
    expect(selectorCalls).toBe(0);
    expect(ownsSources).toBe(true);
    expect(root.emit).toEqual({
      open: false,
      list: new Array(slots).fill(null),
    });
    expect(root.local).toEqual(root.emit);
    for (let index = 0; index < slots; index++)
      expect(readRetainedSlotRaw(root, '/list/' + index, 'string')).toBe(
        'kept',
      );
    dispatchSetValue(open, true);
    expect(root.emit).toEqual({ open: true, list: values });
  },
);
