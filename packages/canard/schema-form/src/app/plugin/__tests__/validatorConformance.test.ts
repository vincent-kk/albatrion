import { describe, expect, it } from 'vitest';

import type { ValidatorPlugin } from '../../../index';
import type { Validator } from '../../../core/validation';

describe('validator plugin contract', () => {
  it('34C-01 ValidatorPlugin satisfies Validator when compileGuard is provided', () => {
    const plugin = {
      compile: () => () => null,
      compileGuard: () => () => true,
      release: () => undefined,
      dialect: 'draft-07',
    } satisfies ValidatorPlugin;
    const validator: Validator = plugin;
    expect(validator.compileGuard({}, '')(null)).toBe(true);
    expect(validator.dialect).toBe('draft-07');
  });

  it.todo('U7 runs ValidatorPlugin through retainValidationRoot and a core guard read');
});
