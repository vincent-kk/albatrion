import { describe, expect, it } from 'vitest';

import { blueprint } from '../blueprint';
import type { BlueprintGate, BlueprintSchema } from '../type';

/** A recursive node whose `then` and `then/allOf/0/then` both declare `children`. */
const multi = {
  type: 'object',
  properties: { kind: { type: 'string', enum: ['folder', 'file'] } },
  if: { properties: { kind: { const: 'folder' } }, required: ['kind'] },
  then: {
    properties: {
      children: { type: 'array', items: { $ref: '#/$defs/multi' } },
    },
    allOf: [
      {
        if: { properties: { open: { const: true } }, required: ['open'] },
        then: { properties: { children: { type: 'array', maxItems: 5 } } },
      },
    ],
  },
  else: { properties: { size: { type: 'integer', minimum: 0 } } },
};

/** Gates bound to the `children` edge that re-enters the template under `/children/*`. */
const nestedChildrenGates = (): BlueprintGate[] => {
  const schema: BlueprintSchema = { $defs: { multi }, $ref: '#/$defs/multi' };
  const item = blueprint(schema).nodes.find(
    (node) => node.path === '/children/*',
  );
  const entry = item?.childEntries.find((child) => child.name === 'children');
  return entry
    ? entry.declarations.flatMap((declaration) => declaration.gates)
    : [];
};

describe('gates of an edge that re-enters a recursive template (211C-01 B)', () => {
  it('rebinds the template if gate to its own host beside the referring input gates', () => {
    const gates = nestedChildrenGates();
    expect(gates.length).toBeGreaterThan(0);
    expect(
      gates.every(
        (gate) => gate.hostPath === '' || gate.hostPath === '/children/*',
      ),
    ).toBe(true);
    expect(
      gates.some(
        (gate) =>
          gate.hostPath === '/children/*' && !gate.schemaPath.includes('allOf'),
      ),
    ).toBe(true);
  });

  it('keeps the gate of a second input that shares the recursive template', () => {
    const gates = nestedChildrenGates();
    expect(
      gates.some(
        (gate) =>
          gate.hostPath === '/children/*' &&
          gate.schemaPath.includes('allOf/0'),
      ),
    ).toBe(true);
  });
});
