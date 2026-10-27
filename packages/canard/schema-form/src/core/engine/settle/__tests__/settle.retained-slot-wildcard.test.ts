import { expect, it, onTestFinished, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import * as latent from '../utils/latentStore/setLatentRaw';
import { resetFieldNodeForm } from '../utils/reset/resetFieldNodeForm';
import * as capture from '../utils/transition/captureExitedRaw';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('keeps the complete latent path when the root template reaches a literal star', () => {
  const previous = engineModes.slots;
  engineModes.setMode('slots', 'on');
  onTestFinished(() => {
    vi.restoreAllMocks();
    engineModes.setMode('slots', previous);
  });
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          '*': { type: 'object', properties: { x: { type: 'string' } } },
          plain: { type: 'string' },
        },
      },
      sibling: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, {
    open: true,
    group: { '*': { x: 'star' }, plain: 'plain' },
    sibling: 'sibling',
  });
  const serialize = vi.spyOn(capture, 'captureExitedRaw');
  const store = vi.spyOn(latent, 'setLatentRaw');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(root.inactiveSlots).toBeUndefined();
  expect(runtime.blueprint.root.containsLiteralStar).toBe(true);
  expect(runtime.latentRaw.size).toBeGreaterThan(0);
  expect(
    [...runtime.latentRaw.keys()].map((key) => JSON.parse(key)[0]),
  ).toContain('/group/*/x');
  expect(
    [...runtime.latentRaw.keys()].map((key) => JSON.parse(key)[0]),
  ).toContain('/group/plain');
  expect(
    [...runtime.latentRaw.keys()].map((key) => JSON.parse(key)[0]),
  ).toContain('/sibling');
  expect(serialize).toHaveBeenCalled();
  expect(store).toHaveBeenCalled();
});

it.each(['off', 'on', 'verify'] as const)(
  '%s loads and replaces initially inactive mixed sources before ordinary parent entry',
  (mode) => {
    const previous = engineModes.slots;
    engineModes.setMode('slots', mode);
    onTestFinished(() => engineModes.setMode('slots', previous));
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            '*': { type: 'object', properties: { x: { type: 'string' } } },
            plain: { type: 'string' },
          },
        },
      },
    });
    dispatchMount(root, {
      open: false,
      group: { '*': { x: 'loaded' }, plain: 'plain' },
    });
    expect(readFieldNodeInactiveValues(root)).toEqual([
      { path: '/group/*/x', value: 'loaded' },
      { path: '/group/plain', value: 'plain' },
    ]);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(root.emit).toEqual({
      open: true,
      group: { '*': { x: 'loaded' }, plain: 'plain' },
    });
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    resetFieldNodeForm(
      root,
      { open: false, group: { '*': { x: 'replacement' }, plain: 'fresh' } },
      WriteOption.Overwrite,
    );
    expect(readFieldNodeInactiveValues(root)).toEqual([
      { path: '/group/*/x', value: 'replacement' },
      { path: '/group/plain', value: 'fresh' },
    ]);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(root.emit).toEqual({
      open: true,
      group: { '*': { x: 'replacement' }, plain: 'fresh' },
    });
  },
);

it('keeps star-like and escaped-slash names on the ordinary zero-capture path', () => {
  const previous = engineModes.slots;
  engineModes.setMode('slots', 'on');
  onTestFinished(() => {
    vi.restoreAllMocks();
    engineModes.setMode('slots', previous);
  });
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      '*suffix': { type: 'string', controls: { active: '../open' } },
      'slash/*': { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, {
    open: true,
    '*suffix': 'prefix',
    'slash/*': 'escaped',
  });
  const serialize = vi.spyOn(capture, 'captureExitedRaw');
  const store = vi.spyOn(latent, 'setLatentRaw');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(root.inactiveSlots?.size).toBe(2);
  expect(runtime.latentRaw.size).toBe(0);
  expect(serialize).not.toHaveBeenCalled();
  expect(store).not.toHaveBeenCalled();
});
