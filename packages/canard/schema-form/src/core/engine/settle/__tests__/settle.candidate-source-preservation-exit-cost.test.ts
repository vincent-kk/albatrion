import { expect, it, vi } from 'vitest';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as ownership from '../utils/transition/selectCandidateOwnedLatent';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each([
  { slots: 1, filters: 15 },
  { slots: 32, filters: 77 },
])(
  'keeps base ownership-selector and filter cost for $slots suppressed single-kind exits with unrelated candidates',
  ({ slots, filters }) => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
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
    expect(selectorCalls).toBe(slots);
    expect(filterCalls).toBeLessThanOrEqual(filters);
    expect(root.emit).toEqual({
      open: false,
      list: new Array(slots).fill(null),
    });
    expect(root.local).toEqual(root.emit);
    expect(runtime.latentRaw.size).toBe(slots);
    const inactive = [];
    for (let index = 0; index < slots; index++) {
      const path = '/list/' + index;
      const key = JSON.stringify([path, 'string']);
      expect(runtime.latentRaw.get(key)).toBe('kept');
      expect(runtime.latentRawMetadata?.get(key)?.path).toBe(path);
      inactive.push({ path, value: 'kept' });
    }
    expect(runtime.inactiveValuesMemo.get('')).toEqual(inactive);
    dispatchSetValue(open, true);
    expect(root.emit).toEqual({ open: true, list: values });
  },
);

it.each([{ slots: 1 }, { slots: 32 }])(
  'reuses candidate ownership for $slots suppressed candidate-slot exits',
  ({ slots }) => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
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
    expect(selectorCalls).toBe(slots);
    expect(ownsSources).toBe(true);
    expect(root.emit).toEqual({
      open: false,
      list: new Array(slots).fill(null),
    });
    expect(root.local).toEqual(root.emit);
    expect(runtime.latentRaw.size).toBe(slots);
    for (let index = 0; index < slots; index++)
      expect(
        runtime.latentRaw.get(JSON.stringify(['/list/' + index, 'string'])),
      ).toBe('kept');
    dispatchSetValue(open, true);
    expect(root.emit).toEqual({ open: true, list: values });
  },
);
