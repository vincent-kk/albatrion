import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../../default/validatorPlugin';

describe('VALIDATE-019 release', () => {
  it('removes a root registration and lets the same URI be used again', () => {
    const instance = new Ajv({ strictSchema: false });
    const remove = vi.spyOn(instance, 'removeSchema');
    ajvValidatorPlugin.bind(instance);
    const first = {
      $id: 'https://example.test/reusable',
      $defs: { inner: { $id: 'https://example.test/reusable-inner', type: 'string' } },
      if: { const: 'first' },
    } as unknown as JSONSchema;
    ajvValidatorPlugin.compileGuard(first, '/if');
    ajvValidatorPlugin.release(first);
    expect(remove).toHaveBeenCalledWith(expect.stringContaining('/ajv8/root/'));
    expect(instance.getSchema(first.$id)).toBeUndefined();
    expect(instance.getSchema('https://example.test/reusable-inner')).toBeUndefined();
    const second = { $id: 'https://example.test/reusable', if: { const: 'second' } } as unknown as JSONSchema;
    expect(ajvValidatorPlugin.compileGuard(second, '/if')('second')).toBe(true);
    ajvValidatorPlugin.release(second);
  });
});
