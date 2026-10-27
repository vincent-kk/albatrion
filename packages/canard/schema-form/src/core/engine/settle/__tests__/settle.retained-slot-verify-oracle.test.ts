import { expect, it, vi } from 'vitest';

import { dispatchMount, dispatchSetValue } from '../../write';
import { compareSlotShadowObservations } from '../utils/verify/compareSlotShadowObservations';
import { prepareSlotShadow } from '../utils/verify/prepareSlotShadow';
import { createSlotVerifyPair } from './fixtures/createSlotVerifyPair';
import { getDispatchNode } from './fixtures/getDispatchNode';

/** A retained value changes lifetime twice while its source survives. */
const SCHEMA = {
  type: 'object',
  properties: {
    open: { type: 'boolean' },
    value: { type: 'string', controls: { active: '../open' } },
  },
} as const;

it('uses fresh off runtime stores and the unchanged latent path as its oracle', () => {
  const { root, shadow, session } = createSlotVerifyPair(SCHEMA);
  expect(root.runtime.slots).toBe('on');
  expect(shadow.runtime.slots).toBe('off');
  expect(root.runtime.latentRaw).not.toBe(shadow.runtime.latentRaw);
  dispatchMount(root, { open: true, value: 'held' });
  dispatchMount(shadow, { open: true, value: 'held' });
  compareSlotShadowObservations(session);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(getDispatchNode(shadow, 'open'), false);
  compareSlotShadowObservations(session);
  expect(root.runtime.latentRaw.size).toBe(0);
  expect(shadow.runtime.latentRaw.size).toBeGreaterThan(0);
  expect(root.inactiveSlots?.size).toBe(1);
  expect(shadow.inactiveSlots).toBeUndefined();
});

it('keeps historical detached reads paired across overlay writes and re-entry', () => {
  const { root, shadow, session } = createSlotVerifyPair(SCHEMA);
  dispatchMount(root, { open: true, value: 'held' });
  dispatchMount(shadow, { open: true, value: 'held' });
  compareSlotShadowObservations(session);
  const old = getDispatchNode(root, 'value');
  const baseline = getDispatchNode(shadow, 'value');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(getDispatchNode(shadow, 'open'), false);
  compareSlotShadowObservations(session);
  dispatchSetValue(old, 'overlay');
  dispatchSetValue(baseline, 'overlay');
  compareSlotShadowObservations(session);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  dispatchSetValue(getDispatchNode(shadow, 'open'), true);
  compareSlotShadowObservations(session);
  expect(getDispatchNode(root, 'value')).not.toBe(old);
  expect(old.raw).toBe('held');
});

it('detects wrong public values independently of the retained clone algorithm', () => {
  const { root, shadow, session } = createSlotVerifyPair(SCHEMA);
  dispatchMount(root, { open: true, value: 'held' });
  dispatchMount(shadow, { open: true, value: 'held' });
  compareSlotShadowObservations(session);
  getDispatchNode(root, 'value').local = 'corrupted';
  expect(() => compareSlotShadowObservations(session)).toThrow(/slot.*shadow/i);
  expect(root.runtime.slotVerification?.differences).toBe(1);
});

it('rejects divergent diagnostics even when values and shapes are unchanged', () => {
  const { root, shadow, session } = createSlotVerifyPair(SCHEMA);
  dispatchMount(root, { open: true, value: 'held' });
  dispatchMount(shadow, { open: true, value: 'held' });
  compareSlotShadowObservations(session);
  root.runtime.diagnostics = {
    status: 'degraded',
    cause: 'expression',
    commit: 1,
  };
  expect(() => compareSlotShadowObservations(session)).toThrow(/diagnostics/);
});

it('rejects an extra delivery candidate payload', () => {
  const { root, shadow, session } = createSlotVerifyPair(SCHEMA);
  dispatchMount(root, { open: true, value: 'held' });
  dispatchMount(shadow, { open: true, value: 'held' });
  compareSlotShadowObservations(session);
  root.pendingDelivery = { type: 4, payload: { 4: 'corrupted' } };
  expect(() => compareSlotShadowObservations(session)).toThrow(
    /pendingDelivery/,
  );
});

it('rejects a per-event revision change with identical public values', () => {
  const { root, shadow, session } = createSlotVerifyPair(SCHEMA);
  dispatchMount(root, { open: true, value: 'held' });
  dispatchMount(shadow, { open: true, value: 'held' });
  compareSlotShadowObservations(session);
  root.revisionLedger = { 4: (root.revisionLedger[4] ?? 0) + 1 };
  expect(() => compareSlotShadowObservations(session)).toThrow(/revision/);
});

it('does not create an oracle or invoke replay on the normal on path', () => {
  const { root } = createSlotVerifyPair(SCHEMA);
  const replay = vi.fn();
  expect(prepareSlotShadow(root, replay)).toBeUndefined();
  expect(replay).not.toHaveBeenCalled();
  expect(root.runtime.slotVerification).toBeUndefined();
});

it('rejects changed references when the latent public value remains stable', () => {
  const { root, shadow, session } = createSlotVerifyPair(SCHEMA);
  dispatchMount(root, { open: true, value: 'held' });
  dispatchMount(shadow, { open: true, value: 'held' });
  compareSlotShadowObservations(session);
  root.local = { open: true, value: 'held' };
  expect(() => compareSlotShadowObservations(session)).toThrow(/reference/);
});
