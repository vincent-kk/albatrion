import { afterEach, expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { engineModes } from '../../utils/cache/engineModes';
import * as selection from '../utils/compute/childSelection/selectEntryStep';

const previousMode = engineModes.gateSelection;
afterEach(() => {
  engineModes.setMode('gateSelection', previousMode);
  vi.restoreAllMocks();
});

it.each(['off', 'table'] as const)(
  'H1 %s bounds selection work independently of 1000 static siblings',
  (mode) => {
    engineModes.setMode('gateSelection', mode);
    const counts: number[] = [];
    for (const siblings of [0, 100, 1000]) {
      const { root } = makeFieldNodeTree({
        type: 'object',
        properties: {
          kind: { type: 'string' },
          ...Object.fromEntries(
            Array.from({ length: siblings }, (_, index) => [
              `pad_${index}`,
              { type: 'number', default: index },
            ]),
          ),
        },
        oneOf: ['a', 'b'].map((kind) => ({
          controls: { active: `./kind === '${kind}'` },
          properties: { [kind]: { type: 'string', default: kind } },
        })),
      });
      root.setValue({ kind: 'a' });
      const pad = root.find('/pad_0');
      const schema = pad?.jsonSchema;
      const step = vi.spyOn(selection, 'selectEntryStep');
      root.find('/kind')!.setValue('b');
      counts.push(step.mock.calls.length);
      step.mockRestore();
      expect(root.find('/a')).toBeNull();
      expect(root.find('/b')!.value).toBe('b');
      if (pad) {
        expect(root.find('/pad_0')).toBe(pad);
        expect(pad.jsonSchema).toBe(schema);
        expect(pad.value).toBe(0);
      }
    }
    expect(
      counts.every((count) => count <= 24),
      JSON.stringify(counts),
    ).toBe(true);
  },
);

it('keeps gated overlays dynamic and computes a dirty static child before later gates', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      source: { type: 'number', controls: { derived: '../flag ? 2 : 0' } },
      shared: { type: 'string' },
    },
    allOf: [
      {
        controls: { active: './source === 2' },
        properties: {
          shared: { minLength: 4 },
          entered: { type: 'number', default: 7 },
        },
      },
    ],
  });
  root.setValue({ flag: false, shared: 'text' });
  const shared = root.find('/shared')!;
  const source = root.find('/source')!;
  expect(root.find('/entered')).toBeNull();
  root.find('/flag')!.setValue(true);
  expect(root.find('/source')).toBe(source);
  expect(source.value).toBe(2);
  expect(root.find('/shared')).toBe(shared);
  expect(shared.jsonSchema).toMatchObject({ minLength: 4 });
  expect(root.find('/entered')!.value).toBe(7);
  root.find('/flag')!.setValue(false);
  expect(source.value).toBe(0);
  expect(root.find('/entered')).toBeNull();
  expect(shared.jsonSchema).not.toHaveProperty('minLength');
});
