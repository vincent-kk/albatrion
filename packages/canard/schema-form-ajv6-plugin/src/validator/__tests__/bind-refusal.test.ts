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
  ] as const)('refuses mutating options before replacing the instance', (options, names) => {
    const instance = new Ajv({ allErrors: false });
    ajvValidatorPlugin.bind!(instance);
    let thrown: unknown;
    try { ajvValidatorPlugin.bind!(new Ajv(options)); }
    catch (error) { thrown = error; }
    expect(thrown).toMatchObject({
      group: 'UNHANDLED_ERROR', code: FormErrorCode.ValidatorBindRefused,
      name: 'ValidatorBindRefusedError', details: { options: names },
    });
    const schema = { $id: 'https://example.test/accepted-binding', type: 'string' } as const;
    instance.addSchema({ $id: 'https://example.test/supplied', type: 'string' });
    expect(() => ajvValidatorPlugin.compile({ $ref: 'https://example.test/supplied' })).not.toThrow();
    expect(schema).toEqual({ $id: 'https://example.test/accepted-binding', type: 'string' });
  });

  it('accepts a non-mutating instance and exposes both optional methods', () => {
    expect(() => ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }))).not.toThrow();
    expect(typeof ajvValidatorPlugin.compileGuard).toBe('function');
    expect(typeof ajvValidatorPlugin.release).toBe('function');
  });
});
