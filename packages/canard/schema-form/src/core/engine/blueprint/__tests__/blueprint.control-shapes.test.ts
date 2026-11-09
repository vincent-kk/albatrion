import { describe, expect, it, vi } from 'vitest';

import { FormErrorCode } from '../../../../errors';
import { blueprint } from '../blueprint';

describe('reserved control value shapes', () => {
  it.each([
    ['active', 0, 'boolean | string'],
    ['visible', null, 'boolean | string'],
    ['readOnly', {}, 'boolean | string'],
    ['disabled', [], 'boolean | string'],
    ['unsetValue', 1, 'boolean | string'],
    ['resetInteraction', () => true, 'boolean | string'],
    ['unsetOnInactive', {}, 'boolean | string'],
    ['derived', true, 'string'],
    ['watch', 1, 'string | string[]'],
    ['watch', ['.', 1], 'string | string[]'],
  ])('rejects %s at the exact control key', (key, value, expected) => {
    const collect = vi.fn();
    expect(() =>
      blueprint({ type: 'string', controls: { [key]: value } }, { collect }),
    ).toThrow(
      expect.objectContaining({ code: FormErrorCode.InvalidControlShape }),
    );
    expect(collect).toHaveBeenCalledWith({
      code: FormErrorCode.InvalidControlShape,
      level: 'error',
      schemaPath: '#/controls/' + key,
      details: { group: 'controls', key, expected },
    });
  });

  it('accepts literals, expressions, scalar and array watch, and arbitrary defaults', () => {
    for (const value of [true, false, 'true', undefined])
      expect(() =>
        blueprint({
          type: 'string',
          controls: {
            active: value,
            visible: value,
            readOnly: value,
            disabled: value,
            unsetValue: value,
            resetInteraction: value,
            unsetOnInactive: value,
            derived: "'value'",
            watch: '.',
            default: { any: [] },
            inactiveValue: () => null,
          },
        }),
      ).not.toThrow();
    expect(() =>
      blueprint({
        type: 'string',
        controls: { watch: ['.'], default: () => 1, inactiveValue: null },
      }),
    ).not.toThrow();
  });

  it('checks the same values inside fields and fragments', () => {
    for (const [schema, schemaPath] of [
      [
        {
          type: 'object',
          controls: { fields: [{ targets: [], controls: { visible: 1 } }] },
        },
        '#/controls/fields/0/controls/visible',
      ],
      [
        { type: 'object', allOf: [{ controls: { visible: 1 } }] },
        '#/allOf/0/controls/visible',
      ],
    ] as const)
      expect(() => blueprint(schema)).toThrow(
        expect.objectContaining({
          code: FormErrorCode.InvalidControlShape,
          details: expect.objectContaining({
            schemaPath,
            group: 'controls',
            key: 'visible',
            expected: 'boolean | string',
          }),
        }),
      );
  });
});
