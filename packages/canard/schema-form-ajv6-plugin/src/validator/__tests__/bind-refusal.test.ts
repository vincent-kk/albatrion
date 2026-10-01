import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

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
    const addSchema = vi.spyOn(instance, 'addSchema');
    ajvValidatorPlugin.bind!(instance);
    let thrown: unknown;
    try { ajvValidatorPlugin.bind!(new Ajv(options)); }
    catch (error) { thrown = error; }
    expect(thrown).toMatchObject({
      group: 'UNHANDLED_ERROR', code: 'VALIDATOR_BIND_REFUSED',
      name: 'ValidatorBindRefusedError', details: { options: names },
    });
    const schema = { type: 'string' } as const;
    ajvValidatorPlugin.compile(schema);
    expect(addSchema).toHaveBeenCalled();
    expect(schema).toEqual({ type: 'string' });
  });

  it('accepts a non-mutating instance and exposes both optional methods', () => {
    expect(() => ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }))).not.toThrow();
    expect(typeof ajvValidatorPlugin.compileGuard).toBe('function');
    expect(typeof ajvValidatorPlugin.release).toBe('function');
  });
});
