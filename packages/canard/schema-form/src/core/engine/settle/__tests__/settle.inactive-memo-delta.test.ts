import { afterEach, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import * as navigation from '../../navigation';
import { WriteOption } from '../../types/value';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

const prepare = (count: number) => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      flip: { type: 'boolean' },
      changing: {
        type: 'object',
        properties: {
          a: { type: 'string', controls: { active: '#/flip' } },
          b: { type: 'string', controls: { active: '#/flip === false' } },
        },
      },
      quiet: {
        type: 'object',
        properties: {
          hidden: { type: 'string', controls: { active: false } },
        },
      },
      ...Object.fromEntries(
        Array.from({ length: count }, (_, i) => [
          `idle${i}`,
          { type: 'string', controls: { active: false } },
        ]),
      ),
    },
  });
  loadFieldNodeAtMount(
    root,
    {
      flip: true,
      changing: { a: 'A', b: 'B' },
      quiet: { hidden: 'untouched' },
      ...Object.fromEntries(
        Array.from({ length: count }, (_, i) => [`idle${i}`, `v${i}`]),
      ),
    },
    WriteOption.Overwrite,
  );
  return root;
};

it.each([8, 256])(
  'does not find unrelated latent occurrences during a switch with %i dormant entries',
  (count) => {
    const previousMode = engineModes.inactiveValues;
    engineModes.setMode('inactiveValues', 'incremental');
    const root = prepare(count);
    const lookup = vi.spyOn(navigation, 'find');
    try {
      writeFieldNode(
        root.structure!.flip,
        false,
        'input',
        WriteOption.Overwrite,
      );
      const unrelated = lookup.mock.calls.filter(
        ([, path]) => typeof path === 'string' && path.startsWith('/idle'),
      );
      expect(unrelated).toHaveLength(0);
      expect(root.runtime.inactiveValuesMemo.get('/changing')).toEqual([
        { path: '/changing/a', value: 'A' },
      ]);
    } finally {
      engineModes.setMode('inactiveValues', previousMode);
    }
  },
);

it('retains untouched host lists and item objects while publishing frozen ordered changes', () => {
  const root = prepare(8);
  const memo = root.runtime.inactiveValuesMemo;
  const quiet = memo.get('/quiet');
  const before = memo.get('')!;
  const idle = before.find(({ path }) => path === '/idle0');
  for (const next of [false, true, false]) {
    writeFieldNode(root.structure!.flip, next, 'input', WriteOption.Overwrite);
    const list = memo.get('')!;
    expect(memo.get('/quiet')).toBe(quiet);
    expect(list.find(({ path }) => path === '/idle0')).toBe(idle);
    expect(Object.isFrozen(list)).toBe(true);
    expect(list.every(Object.isFrozen)).toBe(true);
    expect(list[0]).toEqual({
      path: next ? '/changing/b' : '/changing/a',
      value: next ? 'B' : 'A',
    });
  }
  expect(before[0]).toEqual({ path: '/changing/b', value: 'B' });
});

it('copies the affected root list once for a multi-entry delta and never copies an untouched host', () => {
  const root = prepare(256);
  const before = root.runtime.inactiveValuesMemo.get('');
  const quiet = root.runtime.inactiveValuesMemo.get('/quiet');
  const slice = vi.spyOn(Array.prototype, 'slice');
  writeFieldNode(root.structure!.flip, false, 'input', WriteOption.Overwrite);
  expect(slice.mock.contexts.filter((list) => list === before)).toHaveLength(1);
  expect(slice.mock.contexts.filter((list) => list === quiet)).toHaveLength(0);
});

it('releases sort positions of removed items even when callers retain an older frozen list', () => {
  const root = prepare(8);
  const before = root.runtime.inactiveValuesMemo.get('')!;
  const removed = before[0];
  expect(root.runtime.inactiveValueOrders!.has(removed)).toBe(true);
  writeFieldNode(root.structure!.flip, false, 'input', WriteOption.Overwrite);
  expect(before[0]).toBe(removed);
  expect(root.runtime.inactiveValueOrders!.has(removed)).toBe(false);
});

it('prunes metadata of unset exits whose raw source was already absent', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      value: {
        type: 'string',
        controls: { active: '../show', unsetOnInactive: true },
      },
      latent: { type: 'string', controls: { active: false } },
    },
  });
  loadFieldNodeAtMount(
    root,
    { show: true, value: 'cleared', latent: 'held' },
    WriteOption.Overwrite,
  );
  writeFieldNode(root.structure!.show, false, 'input', WriteOption.Overwrite);
  expect(
    [...root.runtime.latentRawMetadata!.values()].map(({ path }) => path),
  ).toEqual(['/latent']);
});

it('retains classification when an unset exit leaves no latent source and publication is skipped', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      value: {
        type: 'string',
        controls: { active: '../show', unsetOnInactive: true },
      },
      held: {
        type: 'string',
        default: 'retained',
        controls: { active: '../show === false' },
      },
    },
  });
  loadFieldNodeAtMount(
    root,
    { show: true, value: 'cleared' },
    WriteOption.Overwrite,
  );
  const before = root.runtime.inactiveValuesMemo.get('');
  writeFieldNode(root.structure!.show, false, 'input', WriteOption.Overwrite);
  expect(root.runtime.latentRaw.size).toBe(0);
  expect(
    root.runtime.latentRawMetadata!.has(JSON.stringify(['/value', 'string'])),
  ).toBe(true);
  expect(root.runtime.inactiveValuesMemo.get('')).toBe(before);
  writeFieldNode(root.structure!.show, true, 'input', WriteOption.Overwrite);
  expect(
    root.runtime.latentRawMetadata!.has(JSON.stringify(['/value', 'string'])),
  ).toBe(false);
  expect(root.runtime.inactiveValuesMemo.get('')).toEqual([
    { path: '/held', value: 'retained' },
  ]);
});
