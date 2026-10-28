import { afterEach, describe, expect, it, vi } from 'vitest';

import * as segmentGrammar from '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchRemove, dispatchSetValue } from '../../write';
import { DetachedWriteAddress } from '../utils/detached/DetachedWriteAddress';
import { getSlotPathNames } from '../utils/slots/getSlotPathNames';
import { resolveSlotSource } from '../utils/slots/resolveSlotSource';
import { writeSlotPath } from '../utils/slots/writeSlotPath';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

const candidateSchema: BlueprintSchema = {
  type: 'object',
  properties: { kind: { type: 'string' } },
  allOf: [
    {
      controls: { active: './kind === "text"' },
      properties: {
        value: { type: 'string', controls: { unsetOnInactive: false } },
      },
    },
    {
      controls: { active: './kind === "number"' },
      properties: {
        value: {
          type: 'number',
          default: 37,
          controls: { unsetOnInactive: false },
        },
      },
    },
  ],
};

// filid:contract settle-static-pointer-work
describe('slot syntax caches without source caching', () => {
  it('shares literal names while rejecting operator addresses', () => {
    const decoder = vi.spyOn(segmentGrammar, 'parsePointerSegments');
    const runtime = {};
    const path = '/%2A/%2E%2E/%2E/%40/';
    const names = getSlotPathNames(runtime, path);
    expect(names).toEqual(['*', '..', '.', '@', '']);
    expect(decoder).toHaveBeenCalledTimes(1);
    decoder.mockClear();
    expect(getSlotPathNames(runtime, path)).toBe(names);
    expect(decoder).not.toHaveBeenCalled();
    for (const operator of ['*', '..', '.', '@'])
      expect(getSlotPathNames(runtime, `/${operator}`)).toBeUndefined();
  });

  it('reads current kinds and overlays at one prepared address', () => {
    const { root } = createDispatchTree(candidateSchema);
    dispatchMount(root, { kind: 'text', value: 'held' });
    const text = getDispatchNode(root, 'value');
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    const number = getDispatchNode(root, 'value');
    expect(resolveSlotSource(root, '/value', text.blueprintNode).source).toBe(
      text,
    );
    expect(resolveSlotSource(root, '/value', number.blueprintNode).source).toBe(
      number,
    );
    const before = resolveSlotSource(root, '/value', text.blueprintNode);
    const decoder = vi.spyOn(segmentGrammar, 'parsePointerSegments');
    expect(
      writeSlotPath(root, '/value', text.blueprintNode, 'patched', true),
    ).toBe(true);
    const after = resolveSlotSource(root, '/value', text.blueprintNode);
    expect(after.source).toBe(text);
    expect(after.overlay).toBeDefined();
    expect(after.overlay).not.toBe(before.overlay);
    expect(resolveSlotSource(root, '/value', number.blueprintNode).source).toBe(
      number,
    );
    expect(decoder).not.toHaveBeenCalled();
    dispatchSetValue(getDispatchNode(root, 'kind'), 'text');
    const reentered = getDispatchNode(root, 'value');
    expect(reentered).not.toBe(text);
    expect(reentered.raw).toBe('patched');
    expect(text.raw).toBe('held');
    expect(resolveSlotSource(root, '/value', text.blueprintNode).source).toBe(
      reentered,
    );
  });

  it('uses the transferred address after an array removal', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: { rows: { type: 'array', items: candidateSchema } },
    });
    dispatchMount(root, {
      rows: [
        { kind: 'text', value: 'first' },
        { kind: 'text', value: 'second' },
      ],
    });
    const rows = getDispatchNode(root, 'rows');
    const old = getDispatchNode(rows, '1', 'value');
    dispatchSetValue(getDispatchNode(rows, '1', 'kind'), 'number');
    const address = DetachedWriteAddress.read(old);
    expect(address?.path).toBe('/rows/1/value');
    getSlotPathNames(root.runtime, address!.path);
    dispatchRemove(rows, 0);
    expect(DetachedWriteAddress.read(old)).toBe(address);
    expect(address?.path).toBe('/rows/0/value');
    expect(old.path).toBe('/rows/1/value');
    const currentPath = address!.path;
    expect(resolveSlotSource(root, currentPath, old.blueprintNode).source).toBe(
      old,
    );
    const decoder = vi.spyOn(segmentGrammar, 'parsePointerSegments');
    expect(
      writeSlotPath(root, currentPath, old.blueprintNode, 'moved', true),
    ).toBe(true);
    expect(
      resolveSlotSource(root, currentPath, old.blueprintNode).overlay,
    ).toBeDefined();
    expect(decoder).not.toHaveBeenCalled();
    dispatchSetValue(getDispatchNode(rows, '0', 'kind'), 'text');
    expect(getDispatchNode(rows, '0', 'value').raw).toBe('moved');
    expect(old.raw).toBe('second');
  });
});
