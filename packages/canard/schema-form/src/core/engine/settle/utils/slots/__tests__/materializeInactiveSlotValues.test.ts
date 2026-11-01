import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../../../write';
import { getDispatchNode } from '../../../__tests__/fixtures/getDispatchNode';
import { createExitSlotOverlay } from '../createExitSlotOverlay';
import { getRetainedChildEntry } from '../getRetainedChildEntry';
import { materializeInactiveSlotValues } from '../materializeInactiveSlotValues';

it('matches the latent publication while preserving a detached host own view', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          childOpen: { type: 'boolean' },
          leaf: { type: 'string' },
          hidden: { type: 'string', controls: { active: '../childOpen' } },
          list: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    group: { childOpen: true, leaf: 'kept', hidden: 'hidden', list: ['item'] },
  });
  const group = getDispatchNode(root, 'group');
  const hidden = getDispatchNode(group, 'hidden');
  dispatchSetValue(getDispatchNode(group, 'childOpen'), false);
  const hiddenEntry = getRetainedChildEntry(
    group,
    hidden.name,
    hidden.blueprintNode,
  );
  const groupEntry = getRetainedChildEntry(
    root,
    group.name,
    group.blueprintNode,
  );
  if (!hiddenEntry || !groupEntry) throw new Error('Expected bindings');
  group.inactiveSlots = new Map([[hiddenEntry, hidden]]);
  root.inactiveSlotChildren = new Map([['group', group]]);
  const held = materializeInactiveSlotValues(group);
  expect(materializeInactiveSlotValues(root)).toEqual([
    { path: '/group/hidden', value: 'hidden' },
  ]);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  root.inactiveSlots = new Map([[groupEntry, group]]);
  root.inactiveSlotChildren.clear();
  root.inactiveValuesDirty = true;
  const values = materializeInactiveSlotValues(root);
  expect(values).toEqual([
    { path: '/group/childOpen', value: false },
    { path: '/group/leaf', value: 'kept' },
    { path: '/group/hidden', value: 'hidden' },
    { path: '/group/list', value: ['item'] },
  ]);
  expect(values.find((entry) => entry.path === hidden.path)).toBe(held[0]);
  expect(materializeInactiveSlotValues(root)).toBe(values);
  expect(materializeInactiveSlotValues(group)).toBe(held);
  expect(values.every(Object.isFrozen)).toBe(true);
});

it('represents inherited clearing as an overlay while leaving the source unchanged', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open', unsetOnInactive: true },
        properties: {
          drop: { type: 'string' },
          keep: { type: 'string', controls: { unsetOnInactive: false } },
        },
      },
    },
  });
  dispatchMount(root, {
    open: true,
    group: { drop: 'drop', keep: 'keep', extra: 7 },
  });
  const group = getDispatchNode(root, 'group');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const entry = getRetainedChildEntry(root, group.name, group.blueprintNode);
  if (!entry) throw new Error('Expected binding');
  const result = createExitSlotOverlay(group, false, true);
  expect(result.retain).toBe(true);
  root.inactiveSlots = new Map([[entry, group]]);
  if (result.overlay)
    root.inactiveSlotOverlays = new Map([[entry, result.overlay]]);
  expect(materializeInactiveSlotValues(root)).toEqual([
    { path: '/group/keep', value: 'keep' },
  ]);
  expect(materializeInactiveSlotValues(root)).toEqual([
    { path: '/group/keep', value: 'keep' },
  ]);
  expect(group.undeclaredValues).toEqual({ extra: 7 });
  expect(getDispatchNode(group, 'drop').raw).toBe('drop');
});
