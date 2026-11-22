import { FormErrorCode } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('VALIDATE-050 TEST-077 bind refusal', () => {
  it.each([
    [{ coerceTypes: true }, ['coerceTypes']],
    [{ useDefaults: true }, ['useDefaults']],
    [{ removeAdditional: true }, ['removeAdditional']],
    [{ coerceTypes: true, useDefaults: true, removeAdditional: 'all' },
      ['coerceTypes', 'useDefaults', 'removeAdditional']],
  ] as const)('refuses value-changing options before replacing the binding', (options, names) => {
    const original = new Ajv({ allErrors: true, strict: false });
    ajvValidatorPlugin.bind?.(original);
    let thrown: unknown;
    try { ajvValidatorPlugin.bind?.(new Ajv(options)); }
    catch (error) { thrown = error; }
    expect(thrown).toMatchObject({
      group: 'UNHANDLED_ERROR', code: FormErrorCode.ValidatorBindRefused,
      name: 'ValidatorBindRefusedError', details: { options: names },
    });
    const schema = { $id: 'https://example.test/accepted-binding', type: 'string' } as const;
    original.addSchema({ $id: 'https://example.test/supplied', type: 'string' });
    expect(() => ajvValidatorPlugin.compile({ $ref: 'https://example.test/supplied' })).not.toThrow();
    expect(schema).toEqual({ $id: 'https://example.test/accepted-binding', type: 'string' });
  });

  it('exposes synchronous guards and release with a non-mutating instance', () => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false }));
    expect(typeof ajvValidatorPlugin.compileGuard).toBe('function');
    expect(typeof ajvValidatorPlugin.release).toBe('function');
  });

  it('refuses defaults enabled after binding', async () => {
    const instance = new Ajv();
    ajvValidatorPlugin.bind?.(instance);
    const root = {
      type: 'object',
      properties: { count: { type: 'number', default: 1 } },
    } as const;
    const input = {};
    const validate = ajvValidatorPlugin.compile(root);
    await expect(validate(input)).resolves.toBeNull();
    expect(input).toEqual({});

    instance.opts.useDefaults = true;
    expect(() => ajvValidatorPlugin.compile(root)).toThrowError(expect.objectContaining({
      code: FormErrorCode.ValidatorBindRefused,
      details: { options: ['useDefaults'] },
    }));
  });
});
