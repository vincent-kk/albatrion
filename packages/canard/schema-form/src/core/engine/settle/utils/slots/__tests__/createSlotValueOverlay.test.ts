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
  const instance = getDispatchNode(root, 'group');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const entry = getRetainedChildEntry(root, instance.name, instance.blueprintNode);
  if (!entry) throw new Error('Expected binding');
  const patch = createSlotValueOverlay(
    instance.blueprintNode,
    { n: '7', extraB: 'b' },
    instance,
    undefined,
    false,
  );
  dispatchSetValue(instance, { n: '7', extraB: 'b' }, WriteOption.Merge);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  root.inactiveSlots = new Map([[entry, instance]]);
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
    const clone = cloneFromSlot(root, entry, instance, context);
    expect(getDispatchNode(clone, 'n').source).toBe(7);
    expect(getDispatchNode(clone, 'text').source).toBe('kept');
    expect(clone.extras).toEqual({ extraA: 'a', extraB: 'b' });
    expect(getDispatchNode(instance, 'n').source).toBe(1);
    expect(instance.extras).toEqual({ extraA: 'a' });
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
  const instance = getDispatchNode(root, 'group');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const entry = getRetainedChildEntry(root, instance.name, instance.blueprintNode);
  if (!entry) throw new Error('Expected binding');
  const patch = createSlotValueOverlay(
    instance.blueprintNode,
    { n: 9 },
    instance,
    undefined,
    true,
  );
  root.inactiveSlots = new Map([[entry, instance]]);
  root.inactiveSlotOverlays = new Map([[entry, patch.overlay]]);
  const scratch = getSettlementScratch(runtime);
  const context = createSettlementContext(
    root,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  try {
    const clone = cloneFromSlot(root, entry, instance, context);
    expect(getDispatchNode(clone, 'n').source).toBe(9);
    expect(getDispatchNode(clone, 'text').source).toBeUndefined();
    expect(clone.extras).toBeUndefined();
    expect(getDispatchNode(instance, 'text').source).toBe('removed');
  } finally {
    releaseSettlementScratch(scratch);
  }
});
