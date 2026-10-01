import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('VALIDATE-045 release', () => {
  it('removes one registration while another remains available', async () => {
    const instance = new Ajv({ allErrors: true, strict: false });
    const add = vi.spyOn(instance, 'addSchema');
    const remove = vi.spyOn(instance, 'removeSchema');
    ajvValidatorPlugin.bind?.(instance);
    const first = { $id: 'https://example.test/ajv7/release-a', type: 'string' } as const;
    const second = { $id: 'https://example.test/ajv7/release-b', type: 'number' } as const;
    ajvValidatorPlugin.compile(first);
    ajvValidatorPlugin.compileGuard(first, '');
    expect(add).toHaveBeenCalledTimes(1);
    const other = ajvValidatorPlugin.compile(second);
    ajvValidatorPlugin.release(first);
    expect(remove).toHaveBeenCalledWith(expect.stringContaining('urn:canard:schema-form:ajv7:'));
    expect((await other(4)) === null).toBe(true);
    expect(ajvValidatorPlugin.compileGuard(second, '')(4)).toBe(true);
  });
});
