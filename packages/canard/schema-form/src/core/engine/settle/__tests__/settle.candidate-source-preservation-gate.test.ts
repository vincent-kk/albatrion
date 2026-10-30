import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchSetValue } from '../../write';
import { createCandidateSourceRecord } from './fixtures/createCandidateSourceRecord';
import { getDispatchNode } from './fixtures/getDispatchNode';
import {
  hasRetainedSlotOwnSource,
  readRetainedSlotRaw,
} from './fixtures/readRetainedSlotRaw';

it.each([
  { value: 37, keyword: 'items', depth: 1, disabled: false },
  { value: 37, keyword: 'items', depth: 1, disabled: true },
  { value: 37, keyword: 'items', depth: 2, disabled: false },
  { value: 37, keyword: 'items', depth: 2, disabled: true },
  { value: 37, keyword: 'prefixItems', depth: 1, disabled: false },
  { value: 37, keyword: 'prefixItems', depth: 1, disabled: true },
  { value: 37, keyword: 'prefixItems', depth: 2, disabled: false },
  { value: 37, keyword: 'prefixItems', depth: 2, disabled: true },
  { value: 71, keyword: 'items', depth: 1, disabled: false },
  { value: 71, keyword: 'items', depth: 1, disabled: true },
  { value: 71, keyword: 'items', depth: 2, disabled: false },
  { value: 71, keyword: 'items', depth: 2, disabled: true },
  { value: 71, keyword: 'prefixItems', depth: 1, disabled: false },
  { value: 71, keyword: 'prefixItems', depth: 1, disabled: true },
  { value: 71, keyword: 'prefixItems', depth: 2, disabled: false },
  { value: 71, keyword: 'prefixItems', depth: 2, disabled: true },
])(
  'retains $value through $keyword gate exit at depth $depth with automatic writes disabled=$disabled',
  ({ value, keyword, depth, disabled }) => {
    const record = createCandidateSourceRecord(
      depth === 1 ? '../../kind' : '../../../kind',
    );
    const item: BlueprintSchema =
      depth === 1 ? record : { type: 'array', items: record };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        kind: { type: 'string' },
        list: {
          type: 'array',
          controls: { active: '../open' },
          [keyword]: keyword === 'items' ? item : [item],
        },
      },
    });
    const list = depth === 1 ? [{ v: value }] : [[{ v: value }]];
    dispatchMount(root, { open: true, kind: 'number', list });
    dispatchSetValue(getDispatchNode(root, 'kind'), 'none');
    const path = depth === 1 ? '/list/0/v' : '/list/0/0/v';
    expect(readRetainedSlotRaw(root, path, 'number')).toBe(value);
    runtime.disableAutomaticWrites = disabled;
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    expect(readRetainedSlotRaw(root, path, 'number')).toBe(value);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(readRetainedSlotRaw(root, path, 'number')).toBe(value);
    expect(hasRetainedSlotOwnSource(root, path, 'string')).toBe(false);
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    expect(root.emit).toEqual({ open: true, kind: 'number', list });
    expect(runtime.misfitPaths.size).toBe(0);
  },
);
