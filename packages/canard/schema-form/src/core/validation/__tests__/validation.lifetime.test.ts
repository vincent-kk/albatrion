import { describe, expect, it, vi } from 'vitest';

import { releaseValidationRoot, retainValidationRoot } from '../index';
import type { Validator } from '../type';
import type { BlueprintSchema } from '../../blueprint';

// filid:contract validation-lifetime
describe('validator registration lifetime', () => {
  it('VALIDATE-021 VALIDATE-045 18C-56 retains at most eight released roots', () => {
    const registered = new Set<string>();
    const compile = vi.fn((schema: BlueprintSchema) => {
      if (typeof schema === 'object' && schema !== null && typeof schema.$id === 'string')
        registered.add(schema.$id);
      return () => null;
    });
    const release = vi.fn((schema: BlueprintSchema) => {
      if (typeof schema === 'object' && schema !== null && typeof schema.$id === 'string')
        registered.delete(schema.$id);
    });
    const validator: Validator = { compile, compileGuard: () => () => true, release };
    const roots = Array.from({ length: 1000 }, (_, index) => ({ $id: `urn:root:${index}` }));
    for (const root of roots) {
      retainValidationRoot(validator, root);
      releaseValidationRoot(validator, root);
      expect(registered.size).toBeLessThanOrEqual(8);
    }
    const recent = roots[roots.length - 1];
    const before = compile.mock.calls.length;
    retainValidationRoot(validator, recent);
    expect(compile).toHaveBeenCalledTimes(before);
    releaseValidationRoot(validator, recent);
  });
});
