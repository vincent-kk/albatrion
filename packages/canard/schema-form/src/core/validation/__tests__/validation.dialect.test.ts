import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../dispatch/__tests__/fixtures/createDispatchTree';
import type { Validator } from '../type';

// filid:contract validation-guard
describe('dialect reporting', () => {
  it('ERROR-188 warns at tree creation for a declared mismatch in development', () => {
    const report = vi.fn();
    const validator: Validator = { dialect: 'https://json-schema.org/draft/2020-12/schema',
      compile: () => () => null, compileGuard: () => () => true };
    createDispatchTree({ $schema: 'http://json-schema.org/draft-07/schema#', type: 'string' },
      undefined, validator, { hasConsumer: () => true, report });
    expect(report).toHaveBeenCalledWith(expect.objectContaining({
      code: 'SCHEMA_FORM_WARNING.DIALECT_MISMATCH', level: 'warning',
    }));
  });
  it('VALIDATE-026 emits nothing without either declaration', () => {
    const report = vi.fn();
    const validator: Validator = { compile: () => () => null,
      compileGuard: () => () => true };
    const reporter = { hasConsumer: () => true, report };
    createDispatchTree({ $schema: 'draft-07', type: 'string' },
      undefined, validator, reporter);
    createDispatchTree({ type: 'string' }, undefined,
      { ...validator, dialect: 'draft-07' }, reporter);
    expect(report).not.toHaveBeenCalled();
  });

  it('ERROR-188 emits nothing in production', () => {
    const before = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const report = vi.fn();
      createDispatchTree({ $schema: 'draft-07', type: 'string' }, undefined,
        { dialect: 'draft-2020', compile: () => () => null,
          compileGuard: () => () => true },
        { hasConsumer: () => true, report });
      expect(report).not.toHaveBeenCalled();
    } finally { process.env.NODE_ENV = before; }
  });
});
