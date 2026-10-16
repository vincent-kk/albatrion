import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchSetValue } from '../../write';
import { setLatentRaw } from '../utils/latentStore/setLatentRaw';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('removes unreachable stale keys on a degraded candidate exit without suppressed policy writes', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: { tick: { type: 'number' } },
    allOf: [
      {
        controls: { active: '@.gate()' },
        properties: {
          v: {
            type: 'object',
            controls: { unsetOnInactive: true },
            properties: {
              x: { type: 'number', controls: { unsetOnInactive: true } },
            },
          },
        },
      },
      { controls: { active: false }, properties: { v: { type: 'string' } } },
    ],
  });
  runtime.context = { gate: () => true };
  dispatchMount(root, { tick: 0, v: { x: 37 } });
  const leaf = getDispatchNode(root, 'v', 'x');
  const stale = JSON.stringify(['/v/stale', 'number']);
  setLatentRaw(runtime, undefined, stale, true, 99, leaf.blueprintNode, [1, 0]);
  runtime.disableAutomaticWrites = true;
  runtime.context = {
    gate: () => {
      throw new Error('candidate gate');
    },
  };
  expect(() => dispatchSetValue(getDispatchNode(root, 'tick'), 1)).toThrow(
    'Gate evaluation failed',
  );
  expect(runtime.diagnostics.status).toBe('degraded');
  expect(root.emit).toEqual({ tick: 1 });
  expect(root.structure?.v).toBeUndefined();
  expect(runtime.latentRaw.has(stale)).toBe(false);
  expect(runtime.latentRawMetadata?.has(stale) ?? false).toBe(false);
  const retained = JSON.stringify(['/v/x', 'number']);
  expect(runtime.latentRaw.get(retained)).toBe(37);
  expect(runtime.latentRawMetadata?.get(retained)?.exitLayers).toEqual([
    expect.objectContaining({ clear: true }),
  ]);
  expect(runtime.inactiveValuesMemo.get('')).toEqual([
    { path: '/v/x', value: 37 },
  ]);
  runtime.context = { gate: () => true };
  dispatchSetValue(getDispatchNode(root, 'tick'), 2);
  expect(root.emit).toEqual({ tick: 2, v: { x: 37 } });
});

it('preserves reachable explicit-clear descendants when exit writes are suppressed', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'boolean' } },
    allOf: [
      {
        controls: { active: './a' },
        properties: {
          v: {
            type: 'object',
            properties: {
              x: { type: 'number', controls: { unsetOnInactive: true } },
            },
          },
        },
      },
      { controls: { active: false }, properties: { v: { type: 'string' } } },
    ],
  });
  dispatchMount(root, { a: true, v: { x: 37 } });
  runtime.disableAutomaticWrites = true;
  dispatchSetValue(getDispatchNode(root, 'a'), false);
  const key = JSON.stringify(['/v/x', 'number']);
  expect(root.emit).toEqual({ a: false });
  expect(runtime.latentRaw.get(key)).toBe(37);
  expect(runtime.latentRawMetadata?.get(key)?.exitLayers).toEqual([
    expect.objectContaining({ clear: true }),
  ]);
  expect(runtime.inactiveValuesMemo.get('')).toEqual([
    { path: '/v/x', value: 37 },
  ]);
  dispatchSetValue(getDispatchNode(root, 'a'), true);
  expect(root.emit).toEqual({ a: true, v: { x: 37 } });
});

it.each([
  { host: 'object', clear: false, metadata: false },
  { host: 'object', clear: false, metadata: true },
  { host: 'object', clear: true, metadata: false },
  { host: 'object', clear: true, metadata: true },
  { host: 'array', clear: false, metadata: false },
  { host: 'array', clear: false, metadata: true },
  { host: 'array', clear: true, metadata: false },
  { host: 'array', clear: true, metadata: true },
])(
  'removes unreachable $host keys under suppression, clear=$clear metadata=$metadata',
  ({ host, clear, metadata }) => {
    const candidate: BlueprintSchema =
      host === 'object'
        ? {
            type: 'object',
            controls: { unsetOnInactive: clear },
            properties: { x: { type: 'number' } },
          }
        : {
            type: 'array',
            controls: { unsetOnInactive: clear },
            items: { type: 'number' },
          };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'boolean' } },
      allOf: [
        { controls: { active: './a' }, properties: { v: candidate } },
        { controls: { active: false }, properties: { v: { type: 'string' } } },
      ],
    });
    dispatchMount(root, { a: true, v: host === 'object' ? { x: 1 } : [1] });
    const leaf = getDispatchNode(root, 'v', host === 'object' ? 'x' : '0');
    const key = JSON.stringify(['/v/stale', 'number']);
    if (metadata)
      setLatentRaw(
        runtime,
        undefined,
        key,
        true,
        99,
        leaf.blueprintNode,
        [1, 0],
      );
    else runtime.latentRaw.set(key, 99);
    runtime.disableAutomaticWrites = true;
    dispatchSetValue(getDispatchNode(root, 'a'), false);
    expect(root.emit).toEqual({ a: false });
    expect(runtime.latentRaw.has(key)).toBe(false);
    expect(runtime.latentRawMetadata?.has(key) ?? false).toBe(false);
    expect(runtime.inactiveValuesMemo.get('')).toEqual(
      host === 'object'
        ? [{ path: '/v/x', value: 1 }]
        : [{ path: '/v', value: [1] }],
    );
  },
);
