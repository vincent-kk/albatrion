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
      allOf: [{ if: { properties: { virtual: { const: 'on' } } },
        then: { controls: { active: true }, required: ['virtual'] } }],
    };
    const copy = createValidatorCopy(authored);
    expect(copy).not.toBe(authored);
    expect(copy).toEqual({
      type: 'object', required: ['virtual'],
      properties: {
        virtual: { type: 'string' },
        payload: { const: { controls: { retained: true } } },
      },
      allOf: [{ if: { properties: { virtual: { const: 'on' } } },
        then: { required: ['virtual'] } }],
    });
    expect(authored.options.virtual).toBe(true);
    expect(typeof copy === 'object' && copy !== null && 'required' in copy &&
      copy.required).not.toBe(authored.required);
  });

  it('VALIDATE-034 strips tuple item schema extensions but preserves enum data', () => {
    const authored = { type: 'array', items: [
      { type: 'string', options: { virtual: true } },
      { enum: [{ controls: { retained: true } }],
        presentation: { label: 'item' } },
    ] };
    expect(createValidatorCopy(authored)).toEqual({ type: 'array', items: [
      { type: 'string' },
      { enum: [{ controls: { retained: true } }] },
    ] });
  });
});
