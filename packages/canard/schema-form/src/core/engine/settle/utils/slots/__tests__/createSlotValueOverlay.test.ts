import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../../../types/value';
import { dispatchMount, dispatchSetValue } from '../../../../write';
import { getDispatchNode } from '../../../__tests__/fixtures/getDispatchNode';
import { getSettlementScratch } from '../../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { cloneFromSlot } from '../cloneFromSlot';
import { createSlotValueOverlay } from '../createSlotValueOverlay';
import { getRetainedChildEntry } from '../getRetainedChildEntry';
import { materializeInactiveSlotValues } from '../materializeInactiveSlotValues';

it('matches an inactive merge while cloning only the patched source channels', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: { n: { type: 'number' }, text: { type: 'string' } },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    group: { n: 1, text: 'kept', extraA: 'a' },
  });
  const source = getDispatchNode(root, 'group');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const entry = getRetainedChildEntry(root, source.name, source.blueprintNode);
  if (!entry) throw new Error('Expected binding');
  const patch = createSlotValueOverlay(
    source.blueprintNode,
    { n: '7', extraB: 'b' },
    source,
    undefined,
    false,
  );
  dispatchSetValue(source, { n: '7', extraB: 'b' }, WriteOption.Merge);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  root.inactiveSlots = new Map([[entry, source]]);
  root.inactiveSlotOverlays = new Map([[entry, patch.overlay]]);
  expect(materializeInactiveSlotValues(root)).toEqual([
    { path: '/group/n', value: 7 },
    { path: '/group/text', value: 'kept' },
  ]);
  const scratch = getSettlementScratch(runtime);
  const context = createSettlementContext(
    root,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  try {
    const clone = cloneFromSlot(root, entry, source, context);
    expect(getDispatchNode(clone, 'n').raw).toBe(7);
    expect(getDispatchNode(clone, 'text').raw).toBe('kept');
    expect(clone.undeclaredValues).toEqual({ extraA: 'a', extraB: 'b' });
    expect(getDispatchNode(source, 'n').raw).toBe(1);
    expect(source.undeclaredValues).toEqual({ extraA: 'a' });
  } finally {
    releaseSettlementScratch(scratch);
  }
});

it('removes unwritten old channels on a whole replacement overlay', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: { n: { type: 'number' }, text: { type: 'string' } },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    group: { n: 1, text: 'removed', extra: 7 },
  });
  const source = getDispatchNode(root, 'group');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const entry = getRetainedChildEntry(root, source.name, source.blueprintNode);
  if (!entry) throw new Error('Expected binding');
  const patch = createSlotValueOverlay(
    source.blueprintNode,
    { n: 9 },
    source,
    undefined,
    true,
  );
  root.inactiveSlots = new Map([[entry, source]]);
  root.inactiveSlotOverlays = new Map([[entry, patch.overlay]]);
  const scratch = getSettlementScratch(runtime);
  const context = createSettlementContext(
    root,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  try {
    const clone = cloneFromSlot(root, entry, source, context);
    expect(getDispatchNode(clone, 'n').raw).toBe(9);
    expect(getDispatchNode(clone, 'text').raw).toBeUndefined();
    expect(clone.undeclaredValues).toBeUndefined();
    expect(getDispatchNode(source, 'text').raw).toBe('removed');
  } finally {
    releaseSettlementScratch(scratch);
  }
});
