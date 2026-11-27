import { describe, expect, it } from 'vitest';

import { createValidatorCopy } from '../utils/copy/createValidatorCopy';

describe('validator schema copy', () => {
  it('VALIDATE-034 VALIDATE-050 strips extensions only at schema positions and leaves required intact', () => {
    const authored = {
      type: 'object',
      controls: { active: false },
      options: { virtual: true },
      presentation: { label: 'form' },
      required: ['virtual'],
      properties: {
        virtual: { type: 'string', options: { virtual: true } },
        payload: { const: { controls: { retained: true } } },
      },
      allOf: [
        {
          if: { properties: { virtual: { const: 'on' } } },
          then: { controls: { active: true }, required: ['virtual'] },
        },
      ],
    };
    const copy = createValidatorCopy(authored);
    expect(copy).not.toBe(authored);
    expect(copy).toEqual({
      type: 'object',
      required: ['virtual'],
      properties: {
        virtual: { type: 'string' },
        payload: { const: { controls: { retained: true } } },
      },
      allOf: [
        {
          if: { properties: { virtual: { const: 'on' } } },
          then: { required: ['virtual'] },
        },
      ],
    });
    expect(authored.options.virtual).toBe(true);
    expect(
      typeof copy === 'object' &&
        copy !== null &&
        'required' in copy &&
        copy.required,
    ).not.toBe(authored.required);
  });

  it('VALIDATE-034 strips tuple item schema extensions but preserves enum data', () => {
    const authored = {
      type: 'array',
      items: [
        { type: 'string', options: { virtual: true } },
        {
          enum: [{ controls: { retained: true } }],
          presentation: { label: 'item' },
        },
      ],
    };
    expect(createValidatorCopy(authored)).toEqual({
      type: 'array',
      items: [{ type: 'string' }, { enum: [{ controls: { retained: true } }] }],
    });
  });

  it('VALIDATE-004 strips form groups at every schema keyword position', () => {
    const extended = () => ({
      type: 'string',
      controls: { active: true },
      options: { trim: true },
      presentation: { label: 'form' },
    });
    const authored = {
      $defs: { a: extended() },
      definitions: { a: extended() },
      additionalProperties: extended(),
      not: extended(),
      if: extended(),
      then: extended(),
      else: extended(),
      allOf: [extended()],
      anyOf: [extended()],
      oneOf: [extended()],
      prefixItems: [extended(), extended()],
      items: extended(),
      properties: { a: extended() },
      patternProperties: { '^a': extended() },
      dependentSchemas: { a: extended() },
      propertyNames: extended(),
      contains: extended(),
      additionalItems: extended(),
      unevaluatedProperties: extended(),
      unevaluatedItems: extended(),
      contentSchema: extended(),
      dependencies: { a: extended(), b: ['a'] },
    };
    const stripped = { type: 'string' };
    expect(createValidatorCopy(authored)).toEqual({
      $defs: { a: stripped },
      definitions: { a: stripped },
      additionalProperties: stripped,
      not: stripped,
      if: stripped,
      then: stripped,
      else: stripped,
      allOf: [stripped],
      anyOf: [stripped],
      oneOf: [stripped],
      prefixItems: [stripped, stripped],
      items: stripped,
      properties: { a: stripped },
      patternProperties: { '^a': stripped },
      dependentSchemas: { a: stripped },
      propertyNames: stripped,
      contains: stripped,
      additionalItems: stripped,
      unevaluatedProperties: stripped,
      unevaluatedItems: stripped,
      contentSchema: stripped,
      dependencies: { a: stripped, b: ['a'] },
    });
  });
});
