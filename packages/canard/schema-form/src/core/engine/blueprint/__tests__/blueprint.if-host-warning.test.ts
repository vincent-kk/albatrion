import { describe, expect, it, vi } from 'vitest';

import { FormWarningCode } from '../../../../errors';
import { blueprint } from '../blueprint';
import type { BlueprintSchema } from '../types/schema';

/**
 * Collect the `IfOnNonObjectHost` records a blueprint build emits.
 * @param schema - Root schema handed to the blueprint
 * @returns The warning records with the `IfOnNonObjectHost` code, in emission order
 */
const collectIfHostWarnings = (schema: BlueprintSchema): unknown[] => {
  const collect = vi.fn();
  blueprint(schema, { collect });
  return collect.mock.calls
    .map(([record]) => record)
    .filter(({ code }) => code === FormWarningCode.IfOnNonObjectHost);
};

describe('if on a host whose allowed types exclude object', () => {
  it.each([
    {
      label: 'string host',
      host: { type: 'string', if: { minLength: 3 }, then: { title: 'long' } },
      kind: 'string',
    },
    {
      label: "array host at the array's own if",
      host: {
        type: 'array',
        items: { type: 'string' },
        if: { minItems: 2 },
        then: { title: 'many' },
      },
      kind: 'array',
    },
    {
      label: 'null-only host',
      host: { type: 'null', if: { const: null }, then: { title: 'empty' } },
      kind: 'null',
    },
  ])('warns once for the $label', ({ host, kind }) => {
    expect(
      collectIfHostWarnings({ type: 'object', properties: { name: host } }),
    ).toEqual([
      {
        code: FormWarningCode.IfOnNonObjectHost,
        level: 'warning',
        schemaPath: '#/properties/name/if',
        details: { kind },
      },
    ]);
  });

  it.each([
    {
      label: 'union that allows object',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: ['object', 'string'],
            if: { required: ['a'] },
            then: { title: 'has a' },
          },
        },
      },
    },
    {
      label: 'nullable object host',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: ['object', 'null'],
            properties: { a: { type: 'string' } },
            if: { required: ['a'] },
            then: { title: 'has a' },
          },
        },
      },
    },
    {
      label: 'object condition inside array items',
      schema: {
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: {
              type: 'object',
              properties: { a: { type: 'string' } },
              if: { required: ['a'] },
              then: { properties: { b: { type: 'string' } } },
            },
          },
        },
      },
    },
    {
      label: 'object host',
      schema: {
        type: 'object',
        properties: { a: { type: 'string' } },
        if: { required: ['a'] },
        then: { properties: { b: { type: 'string' } } },
      },
    },
    {
      label: 'virtual host',
      schema: {
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
        options: {
          virtual: {
            pair: { fields: ['a', 'b'], if: { required: ['a'] } },
          },
        },
      },
    },
  ])('stays silent for the $label', ({ schema }) => {
    expect(collectIfHostWarnings(schema)).toEqual([]);
  });
});
