import { afterEach, expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import * as selection from '../utils/compute/childSelection/selectEntryStep';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';

const previousMode = gateSelectionTable.mode;
afterEach(() => {
  gateSelectionTable.mode = previousMode;
  vi.restoreAllMocks();
});

it.each(['off', 'table'] as const)(
  'H1 %s bounds selection work independently of 1000 static siblings',
  (mode) => {
    gateSelectionTable.mode = mode;
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
      const schema = pad?.schema;
      const step = vi.spyOn(selection, 'selectEntryStep');
      root.find('/kind')!.setValue('b');
      counts.push(step.mock.calls.length);
      step.mockRestore();
      expect(root.find('/a')).toBeNull();
      expect(root.find('/b')!.value).toBe('b');
      if (pad) {
        expect(root.find('/pad_0')).toBe(pad);
        expect(pad.schema).toBe(schema);
        expect(pad.value).toBe(0);
      }
    }
    expect(counts.every((count) => count <= 24), JSON.stringify(counts)).toBe(
      true,
    );
  },
);
