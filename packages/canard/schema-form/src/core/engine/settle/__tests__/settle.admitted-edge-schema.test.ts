import { afterEach, describe, expect, it, vi } from 'vitest';

import { mergeEffectiveSchema } from '@/schema-form/core/engine/blueprint';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as admitted from '../utils/compute/childSelection/readAdmittedEdgeSchema';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { compareAdmittedEdgeSchema } from './fixtures/compareAdmittedEdgeSchema';
import { gateSelectionCases } from './fixtures/gateSelectionCases';

afterEach(() => vi.restoreAllMocks());

/** Three gated siblings and one ungated sibling under the root. */
const gatedSiblings: BlueprintSchema = {
  type: 'object',
  properties: {
    sw: { type: 'number' },
    a: { type: 'string', controls: { active: '../sw >= 0' } },
    b: { type: 'string', controls: { active: '../sw >= 1' } },
    c: { type: 'string' },
  },
};

/** One name declared by two gated anyOf branches. */
const sharedName = (second: BlueprintSchema): BlueprintSchema => ({
  type: 'object',
  properties: { k: { type: 'number' } },
  anyOf: [
    {
      controls: { active: './k >= 0' },
      properties: { x: { type: 'string', minLength: 1 } },
    },
    { controls: { active: './k >= 1' }, properties: { x: second } },
  ],
});

/** Gated hosts nested three deep; two different edges share the name `leaf`. */
const nestedHosts: BlueprintSchema = {
  type: 'object',
  properties: {
    sw: { type: 'number' },
    outer: {
      type: 'object',
      controls: { active: '../sw >= 0' },
      properties: {
        leaf: { type: 'number', controls: { active: '../../sw >= 0' } },
        inner: {
          type: 'object',
          controls: { active: '../../sw >= 1' },
          properties: {
            leaf: {
              type: 'string',
              maxLength: 3,
              controls: { active: '../../../sw >= 2' },
            },
          },
        },
      },
    },
  },
};

// filid:contract settle-admitted-edge-schema
describe('L2 (d1) GOAL-011 fully admitted edges reuse a constant schema', () => {
  it('matches the declined read over every gate-selection history', () => {
    for (const fixture of gateSelectionCases)
      compareAdmittedEdgeSchema(fixture);
  });

  it('matches with all gates open, some closed and toggled', () => {
    const reads = compareAdmittedEdgeSchema({
      name: 'gated siblings',
      schema: gatedSiblings,
      input: { sw: 1, a: 'A', b: 'B', c: 'C' },
      writes: [
        { path: '/a', value: 'A2' },
        { path: '/sw', value: 0 },
        { path: '/sw', value: -1 },
        { path: '/sw', value: 2 },
        { path: '/b', value: 'B2' },
      ],
    });
    expect(reads.served).toEqual(expect.arrayContaining(['a', 'b']));
    expect(reads.declined).toEqual([]);
  });

  it('matches a shared name without conflict', () => {
    const reads = compareAdmittedEdgeSchema({
      name: 'shared name, same kind',
      schema: sharedName({ type: 'string', maxLength: 5 }),
      input: { k: 0, x: 'v' },
      writes: [
        { path: '/k', value: 1 },
        { path: '/x', value: 'w' },
        { path: '/k', value: 0 },
      ],
    });
    expect(reads.served).toContain('x');
  });

  it('matches a shared name whose admitted declarations conflict', () => {
    compareAdmittedEdgeSchema({
      name: 'shared name, different kinds',
      schema: sharedName({ type: 'number' }),
      input: { k: 0, x: 'v' },
      writes: [
        { path: '/k', value: 1 },
        { path: '/k', value: 0 },
        { path: '/k', value: 1 },
      ],
    });
  });

  it('matches if/then/else branches', () => {
    compareAdmittedEdgeSchema({
      name: 'if/then/else',
      schema: {
        type: 'object',
        properties: { k: { type: 'number' } },
        if: { properties: { k: { const: 1 } }, required: ['k'] },
        then: { properties: { t: { type: 'string', default: 'T' } } },
        else: { properties: { e: { type: 'string', default: 'E' } } },
      },
      input: { k: 1 },
      writes: [
        { path: '/k', value: 2 },
        { path: '/k', value: 1 },
        { path: '/t', value: 'T2' },
      ],
    });
  });

  it('matches nested gated hosts whose different edges share a name', () => {
    const reads = compareAdmittedEdgeSchema({
      name: 'nested gated hosts',
      schema: nestedHosts,
      input: { sw: 2, outer: { leaf: 1, inner: { leaf: 'abc' } } },
      writes: [
        { path: '/sw', value: 1 },
        { path: '/sw', value: 0 },
        { path: '/sw', value: 2 },
        { path: '/outer/leaf', value: 3 },
      ],
    });
    expect(reads.served).toEqual(
      expect.arrayContaining(['outer', 'leaf', 'inner']),
    );
  });

  it('takes the merge path for a partially admitted edge', () => {
    const { root } = createTestTree(sharedName({ type: 'string' }));
    const spy = vi.spyOn(admitted, 'readAdmittedEdgeSchema');
    loadFieldNodeAtMount(root, { k: 0, x: 'v' }, WriteOption.Overwrite);
    expect(spy.mock.calls.map(([entry]) => entry.name)).not.toContain('x');
    writeFieldNode(root.structure!.k, 1, 'input', WriteOption.Overwrite);
    expect(spy.mock.calls.map(([entry]) => entry.name)).toContain('x');
  });

  it('declines a child whose blueprint node belongs to another edge', () => {
    const { blueprint } = createTestTree(gatedSiblings);
    const [, a, b] = blueprint.root.childEntries;
    expect(
      admitted.readAdmittedEdgeSchema(
        a,
        b.node,
        blueprint.isAtomic,
        blueprint.root,
      ),
    ).toBeUndefined();
    expect(
      admitted.readAdmittedEdgeSchema(
        a,
        a.node,
        blueprint.isAtomic,
        blueprint.root,
      )?.schema,
    ).toBe(
      mergeEffectiveSchema(a.node, [a.declarations[0].id], {
        mode: 'runtime',
        isAtomic: blueprint.isAtomic,
      }),
    );
  });

  it('returns the same schema reference across passes and settlements', () => {
    const { root } = createTestTree(gatedSiblings);
    const spy = vi.spyOn(admitted, 'readAdmittedEdgeSchema');
    loadFieldNodeAtMount(
      root,
      { sw: 1, a: 'A', b: 'B', c: 'C' },
      WriteOption.Overwrite,
    );
    const a = root.structure!.a;
    const schema = a.schema;
    writeFieldNode(root.structure!.c, 'C2', 'input', WriteOption.Overwrite);
    writeFieldNode(a, 'A2', 'input', WriteOption.Overwrite);
    expect(a.schema).toBe(schema);
    const served = spy.mock.calls.flatMap(([entry], index) =>
      entry.name === 'a' ? [spy.mock.results[index].value?.schema] : [],
    );
    expect(served.length).toBeGreaterThan(1);
    for (const value of served) expect(value).toBe(schema);
  });
});
