import { afterEach, describe, expect, it, vi } from 'vitest';

import { FormErrorCode } from '@/schema-form/errors';

import { blueprint } from '../blueprint';
import type { BlueprintSchema } from '../types/schema';
import * as shapeValidation from '../validateShape';

afterEach(() => vi.restoreAllMocks());

// filid:contract shape-validation-skip
describe('shape validation follows template recursion evidence', () => {
  it.each([
    {
      name: 'flat',
      schema: { type: 'object', properties: { value: { type: 'number' } } },
    },
    {
      name: 'nested',
      schema: {
        type: 'object',
        properties: {
          child: { type: 'object', properties: { value: { type: 'string' } } },
        },
      },
    },
    {
      name: 'oneOf',
      schema: {
        type: 'object',
        oneOf: [{ properties: { value: { type: 'number' } } }],
      },
    },
    {
      name: 'virtual field',
      schema: {
        type: 'object',
        properties: { value: { type: 'number' } },
        options: { virtual: { group: { fields: ['value'] } } },
      },
    },
    {
      name: 'sibling reference',
      schema: {
        type: 'object',
        properties: {
          first: { type: 'string' },
          second: { $ref: '#/properties/first' },
        },
      },
    },
  ])('skips validation for $name', ({ schema }) => {
    const validate = vi.spyOn(shapeValidation, 'validateShape');
    blueprint(schema as BlueprintSchema);
    expect(validate).not.toHaveBeenCalled();
  });

  it('validates ungated root recursion once and preserves its error', () => {
    const validate = vi.spyOn(shapeValidation, 'validateShape');
    expect(() =>
      blueprint({ type: 'object', properties: { next: { $ref: '#' } } }),
    ).toThrow(
      expect.objectContaining({ code: FormErrorCode.RecursiveShapeUnbounded }),
    );
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('validates recursion through a oneOf branch once', () => {
    const validate = vi.spyOn(shapeValidation, 'validateShape');
    expect(() =>
      blueprint({
        type: 'object',
        oneOf: [
          {
            controls: { active: './enabled' },
            properties: { next: { $ref: '#' } },
          },
        ],
      }),
    ).not.toThrow();
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('validates array-item recursion once although shape traversal cuts arrays', () => {
    const validate = vi.spyOn(shapeValidation, 'validateShape');
    const result = blueprint({
      type: 'object',
      properties: { children: { type: 'array', items: { $ref: '#' } } },
    });
    expect(result.root.childEntries[0].node.item).toBe(result.root);
    expect(validate).toHaveBeenCalledTimes(1);
  });
});
