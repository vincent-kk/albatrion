import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('VALIDATE-045 release', () => {
  it('removes the registered root and leaves another root usable', async () => {
    const instance = new Ajv({ allErrors: true });
    const remove = vi.spyOn(instance, 'removeSchema');
    ajvValidatorPlugin.bind!(instance);
    const first = { $id: 'https://example.test/release-a', type: 'string' } as const;
    const second = { $id: 'https://example.test/release-b', type: 'number' } as const;
    ajvValidatorPlugin.compile(first);
    const other = ajvValidatorPlugin.compile(second);
    ajvValidatorPlugin.release!(first);
    expect(remove).toHaveBeenCalled();
    expect((await other(4)) === null).toBe(true);
    expect(ajvValidatorPlugin.compileGuard(second, '')(4)).toBe(true);
  });

  it('allows a released root ID and inner ID to be registered again', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const first = {
      $id: 'https://example.test/reuse.json', type: 'object',
      definitions: { item: { $id: 'inner.json', type: 'string' } },
      properties: { value: { $ref: 'inner.json' } },
    } as const;
    const second = {
      $id: 'https://example.test/reuse.json', type: 'object',
      definitions: { item: { $id: 'inner.json', type: 'number' } },
      properties: { value: { $ref: 'inner.json' } },
    } as const;
    ajvValidatorPlugin.compile(first);
    ajvValidatorPlugin.release(first);
    const validate = ajvValidatorPlugin.compile(second);
    expect((await validate({ value: 4 })) === null).toBe(true);
  });
});
