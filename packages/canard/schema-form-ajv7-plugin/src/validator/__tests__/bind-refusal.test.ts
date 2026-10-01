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
  ] as const)('refuses value-changing options before replacing the binding', (options, names) => {
    const original = new Ajv({ allErrors: true, strict: false });
    const addSchema = vi.spyOn(original, 'addSchema');
    ajvValidatorPlugin.bind?.(original);
    let thrown: unknown;
    try { ajvValidatorPlugin.bind?.(new Ajv(options)); }
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

  it('exposes synchronous guards and release with a non-mutating instance', () => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false }));
    expect(typeof ajvValidatorPlugin.compileGuard).toBe('function');
    expect(typeof ajvValidatorPlugin.release).toBe('function');
  });
});
