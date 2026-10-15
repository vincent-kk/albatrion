import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-gates-conflicts
describe('shared declaration conflicts', () => {
  it.each([
    {
      label: 'A: reordered union members',
      left: ['string', 'number'],
      right: ['number', 'string'],
      conflict: false,
      partial: false,
    },
    {
      label: 'B: nullable and non-nullable string',
      left: ['null', 'string'],
      right: 'string',
      conflict: false,
      partial: false,
    },
    {
      label: 'C: different union folds',
      left: ['string', 'number'],
      right: ['string', 'boolean'],
      conflict: true,
      partial: false,
    },
    {
      label: 'D: different scalar folds',
      left: 'number',
      right: 'string',
      conflict: true,
      partial: false,
    },
    {
      label: 'E: identical string folds',
      left: 'string',
      right: 'string',
      conflict: false,
      partial: false,
    },
    {
      label: 'A with a rejected same-fold declaration',
      left: ['string', 'number'],
      right: ['number', 'string'],
      conflict: false,
      partial: true,
    },
    {
      label: 'B with a rejected same-fold declaration',
      left: ['null', 'string'],
      right: 'string',
      conflict: false,
      partial: true,
    },
  ])('$label', ({ left, right, conflict, partial }) => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: { enabled: { type: 'boolean' } },
      allOf: [
        {
          controls: { active: './enabled' },
          properties: { shared: { type: left } },
        },
        {
          controls: { active: './enabled' },
          properties: { shared: { type: right } },
        },
        ...(partial
          ? [
              {
                controls: { active: 'false' },
                properties: { shared: { type: left } },
              },
            ]
          : []),
      ],
    });
    loadFieldNodeAtMount(root, { enabled: false }, WriteOption.Overwrite);
    expect(root.structure?.shared).toBeUndefined();
    expect(root.runtime.diagnostics.status).toBe('stable');

    let caught: unknown;
    try {
      writeFieldNode(
        root.structure!.enabled,
        true,
        'callerReplace',
        WriteOption.Overwrite,
      );
    } catch (error) {
      caught = error;
    }

    expect(
      root.children?.filter((child) => child.name === 'shared'),
    ).toHaveLength(1);
    expect(root.structure?.shared?.blueprintNode).toBe(
      blueprint.root.childEntries.find((entry) => entry.name === 'shared')
        ?.node,
    );
    expect(root.structure?.enabled?.raw).toBe(true);
    if (conflict) {
      expect(caught).toMatchObject({
        code: 'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT',
        message: 'Active declarations conflict at /shared',
      });
      expect(root.runtime.diagnostics).toMatchObject({
        status: 'degraded',
        cause: 'sharedConflict',
        commit: 2,
      });
    } else {
      expect(caught).toBeUndefined();
      expect(root.runtime.diagnostics.status).toBe('stable');
    }
  });

  it('29C-03 shared conflict commits derive, fill, and unrelated exit clearing', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        first: { type: 'boolean' },
        second: { type: 'boolean' },
        stay: { type: 'boolean' },
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
        filled: {
          type: 'string',
          default: 'F',
          controls: { active: '../first' },
        },
        departed: {
          type: 'string',
          controls: {
            active: '../stay',
            unsetOnInactive: true,
          },
        },
      },
      allOf: [
        {
          controls: { active: './first' },
          properties: {
            shared: { type: 'number' },
          },
        },
        {
          controls: { active: './second' },
          properties: {
            shared: { type: 'string' },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      {
        first: false,
        second: false,
        stay: true,
        source: 'A',
        departed: 'held',
      },
      WriteOption.Overwrite,
    );
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(root.structure?.target?.raw).toBe('A');
    expect(root.structure?.filled).toBeUndefined();
    expect(root.structure?.departed?.raw).toBe('held');

    let caught: unknown;
    try {
      writeFieldNode(
        root,
        { first: true, second: true, stay: false, source: 'B' },
        'callerPartial',
        WriteOption.Merge,
      );
    } catch (error) {
      caught = error;
    }
    expect(caught).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT',
    });
    expect(root.structure?.shared?.blueprintNode.kind).toBe('number');
    expect(root.structure?.target?.raw).toBe('B');
    expect(root.structure?.filled?.raw).toBe('F');
    expect(root.structure?.departed).toBeUndefined();
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/departed', 'string'])),
    ).toBe(false);
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'sharedConflict',
      commit: 2,
    });
  });

  it('26C-05 typeConflict commits the raw source then throws', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        value: { type: 'number' },
      },
      if: {},
      then: { properties: { value: { type: 'string' } } },
    });
    expect(() =>
      writeFieldNode(
        root,
        { enabled: true, value: 3 },
        'callerReplace',
        WriteOption.Overwrite,
      ),
    ).toThrow('Active declarations conflict');
    expect(root.raw).toBeUndefined();
    expect(root.undeclaredValues).toEqual({ enabled: true });
    expect(root.structure?.value?.raw).toBe(3);
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'sharedConflict',
      commit: 1,
    });
  });

  it('26C-05 fold chooses first active kind and reports a gated collision', () => {
    const { root } = createTestTree({
      type: 'object',
      allOf: [
        {
          controls: { active: 'true' },
          properties: { shared: { type: 'number' } },
        },
        {
          controls: { active: 'true' },
          properties: { shared: { type: 'string' } },
        },
      ],
    });
    expect(() =>
      writeFieldNode(
        root,
        { shared: 1 },
        'callerReplace',
        WriteOption.Overwrite,
      ),
    ).toThrow('Active declarations conflict');
    expect(root.structure?.shared?.blueprintNode.kind).toBe('number');
    expect(root.runtime.diagnostics.cause).toBe('sharedConflict');
  });
});
