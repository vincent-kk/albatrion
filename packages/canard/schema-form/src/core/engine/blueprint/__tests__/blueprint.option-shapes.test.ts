import { describe, expect, it, vi } from 'vitest';

import { FormErrorCode } from '../../../../errors';
import { blueprint } from '../blueprint';

describe('reserved option value shapes', () => {
  it.each([
    ['terminal', 'true', 'boolean'],
    ['omitEmpty', 0, 'boolean'],
    ['omitTrailing', null, 'boolean'],
    ['trim', {}, 'boolean'],
    ['propertyOrder', 'a', 'string[]'],
    ['propertyOrder', ['a', 1], 'string[]'],
    ['propertyOrder', Array(1), 'string[]'],
  ])('rejects %s=%j at its authored key', (key, value, expected) => {
    const collect = vi.fn();
    expect(() =>
      blueprint(
        {
          type: 'object',
          properties: {
            a: { type: 'object', options: { [key]: value } },
          },
        },
        { collect },
      ),
    ).toThrow(
      expect.objectContaining({ code: FormErrorCode.InvalidControlShape }),
    );
    expect(collect).toHaveBeenCalledWith({
      code: FormErrorCode.InvalidControlShape,
      level: 'error',
      schemaPath: '#/properties/a/options/' + key,
      details: { group: 'options', key, expected },
    });
  });

  it('accepts both booleans, undefined, and all string property names', () => {
    for (const value of [true, false, undefined])
      expect(() =>
        blueprint({
          type: 'object',
          options: {
            terminal: value,
            omitEmpty: value,
            omitTrailing: value,
            trim: value,
            propertyOrder: ['', '*', 'a', 'a'],
          },
        }),
      ).not.toThrow();
  });

  it('checks options on fragments and virtual node declarations', () => {
    expect(() =>
      blueprint({ type: 'object', allOf: [{ options: { trim: 'yes' } }] }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.InvalidControlShape,
        details: expect.objectContaining({
          schemaPath: '#/allOf/0/options/trim',
        }),
      }),
    );
    expect(() =>
      blueprint({
        type: 'object',
        properties: { a: { type: 'string' } },
        options: {
          virtual: {
            group: { fields: ['a'], options: { omitEmpty: 0 } },
          },
        },
      }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.InvalidControlShape,
        details: expect.objectContaining({
          schemaPath: '#/options/virtual/group/options/omitEmpty',
        }),
      }),
    );
  });
});
