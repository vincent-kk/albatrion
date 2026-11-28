import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { dispatchMount } from '@/schema-form/core/engine/write';

import { readFrameBindings } from '../utils/gates/frames/readFrameBindings';
import { getGateRegistry } from '../utils/gates/getGateRegistry';

/*
 * What gate binding retains after loading 1,000 rows: gate registrations, registered references,
 * canonical decisions and the nodes holding frame bindings.
 */

type Node = DispatchTestNode;

const mount = (schema: BlueprintSchema, value: unknown): Node => {
  const { root, runtime } = createDispatchTree(
    schema,
    value,
    createTestValidator(),
  );
  runtime.validationMode = ValidationMode.None;
  dispatchMount(root, value, undefined, { deferValidation: true });
  return root;
};

const laneIf: BlueprintSchema = {
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: { kind: { type: 'string' } },
        if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
        then: { minProperties: 2 },
      },
    },
  },
};
const gatedRows: BlueprintSchema = {
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    other: { type: 'boolean' },
    note: { type: 'string' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: { kind: { type: 'string' }, v: { type: 'string' } },
        if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
        then: { minProperties: 2 },
      },
    },
  },
  allOf: [
    {
      controls: { active: './flag === true' },
      properties: {
        rows: { items: { properties: { v: { minLength: 2 } } } },
      },
    },
    {
      controls: { active: './other === true' },
      properties: { note: { minLength: 2 } },
    },
  ],
};

/** Registered references and canonical decisions, read structurally from the gate registry. */
const readRegistryCounts = (root: Node) => {
  const registry: unknown = getGateRegistry(root.runtime);
  const byPath: unknown =
    registry && typeof registry === 'object'
      ? Reflect.get(registry, 'byPath')
      : undefined;
  let references = 0;
  if (byPath instanceof Map)
    for (const registration of byPath.values()) {
      const occurrences: unknown = Reflect.get(registration, 'occurrences');
      if (Array.isArray(occurrences)) references += occurrences.length;
    }
  const canonical: unknown =
    registry && typeof registry === 'object'
      ? Reflect.get(registry, 'canonical')
      : undefined;
  return {
    registrations: byPath instanceof Map ? byPath.size : 0,
    references,
    decisions: canonical instanceof Map ? canonical.size : 'n/a',
  };
};

/** Nodes holding a non-empty frame binding map, and the bindings they hold. */
const readFrameCounts = (root: Node) => {
  let nodes = 0;
  let bindings = 0;
  const visit = (node: Node) => {
    const map: unknown = readFrameBindings(node);
    if (map instanceof Map && map.size > 0) {
      nodes++;
      bindings += map.size;
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return { nodes, bindings };
};

describe('retained gate bindings per 1,000 rows', () => {
  it.each([
    [
      'gated rows',
      gatedRows,
      {
        flag: true,
        rows: Array.from({ length: 1000 }, () => ({ kind: 'a', v: 'x' })),
      },
      {
        registry: { registrations: 3005, references: 4004, decisions: 1002 },
        frames: { nodes: 2002, bindings: 2002 },
      },
    ],
    [
      'if lane',
      laneIf,
      { rows: Array.from({ length: 1000 }, () => ({ kind: 'a' })) },
      {
        registry: { registrations: 2002, references: 2000, decisions: 1000 },
        frames: { nodes: 0, bindings: 0 },
      },
    ],
  ] as const)(
    '%s: registrations, references, decisions and frame bindings after load',
    (_, schema, value, expected) => {
      const root = mount(schema, value);
      expect({
        registry: readRegistryCounts(root),
        frames: readFrameCounts(root),
      }).toEqual(expected);
    },
  );
});
