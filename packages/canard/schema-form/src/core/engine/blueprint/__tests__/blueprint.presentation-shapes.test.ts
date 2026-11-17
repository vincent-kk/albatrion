import { describe, expect, it, vi } from 'vitest';

import { FormErrorCode } from '../../../../errors';
import { blueprint } from '../blueprint';

describe('shallow presentation value shapes', () => {
  it.each([
    ['inputType', 1, 'string'],
    ['FieldInput', 'input', 'function | object | null'],
    ['FieldInputProps', null, 'object'],
    ['FieldInputProps', [], 'object'],
    ['FieldRendererProps', 'props', 'object'],
    ['errorMessages', () => ({}), 'object'],
  ])('rejects %s=%j at its authored key', (key, value, expected) => {
    const collect = vi.fn();
    expect(() =>
      blueprint(
        { type: 'string', presentation: { [key]: value } },
        { collect },
      ),
    ).toThrow(
      expect.objectContaining({ code: FormErrorCode.InvalidControlShape }),
    );
    expect(collect).toHaveBeenCalledWith({
      code: FormErrorCode.InvalidControlShape,
      level: 'error',
      schemaPath: '#/presentation/' + key,
      details: { group: 'presentation', key, expected },
    });
  });

  it('does not invoke components or inspect nested payload and unknown keys', () => {
    const component = vi.fn();
    for (const FieldInput of [
      undefined,
      null,
      component,
      { $$typeof: Symbol.for('react.memo') },
      { $$typeof: Symbol.for('react.forward_ref') },
      { $$typeof: Symbol.for('react.lazy') },
    ]) {
      const collect = vi.fn();
      expect(() =>
        blueprint(
          {
            type: 'string',
            presentation: {
              FieldInput,
              inputType: '',
              FieldInputProps: { arbitrary: component },
              FieldRendererProps: { nested: [] },
              errorMessages: { custom: 1 },
              custom: false,
            },
          },
          { collect },
        ),
      ).not.toThrow();
      expect(collect).not.toHaveBeenCalled();
    }
    expect(component).not.toHaveBeenCalled();
  });

  it('checks fragment payloads with their own location', () => {
    expect(() =>
      blueprint({
        type: 'object',
        allOf: [{ presentation: { inputType: false } }],
      }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.InvalidControlShape,
        details: expect.objectContaining({
          schemaPath: '#/allOf/0/presentation/inputType',
        }),
      }),
    );
  });
});
