import { plugin as ajv6 } from '@canard/schema-form-ajv6-plugin';
import { plugin as ajv7 } from '@canard/schema-form-ajv7-plugin';
import { plugin as ajv8 } from '@canard/schema-form-ajv8-plugin';
import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import type { JSONSchema } from '@/schema-form/types';

import type { Validator } from '../types/validator';
import { readValidationEntry } from '../utils/cache/readValidationEntry';
import { releaseValidationRoot } from '../utils/lifetime/releaseValidationRoot';
import { retainValidationRoot } from '../utils/lifetime/retainValidationRoot';
import { assertValidationRootReady } from '../utils/run/assertValidationRootReady';

it.each([
  ['ajv6', ajv6.validator],
  ['ajv7', ajv7.validator],
  ['ajv8', ajv8.validator],
] as const)(
  'DR-3 reuses the shipped copy after compile failure and prior compileGuard (%s)',
  async (name, shipped) => {
    const compile = vi.fn((copy: JSONSchema) => {
      const validate = shipped.compile(copy);
      if (copy.title === 'replacement' && !failed) {
        failed = true;
        throw new Error('duplicate schema registration probe');
      }
      return validate;
    });
    let failed = false;
    const compileGuard = shipped.compileGuard;
    if (!compileGuard) throw new Error('Shipped plugin omitted compileGuard');
    const validator: Validator = {
      compile,
      compileGuard,
      release: shipped.release,
    };
    const first = { $id: `urn:dr3-plugin-retry:${name}`, type: 'object' };
    const second = {
      ...first,
      title: 'replacement',
      if: { properties: { flag: { const: true } } },
    };
    retainValidationRoot(validator, first);
    readValidationEntry(validator, first);
    const entry = readValidationEntry(validator, second);
    expect(entry.failure).toBeInstanceOf(Error);
    const guard = validator.compileGuard(entry.copy, '/if');
    entry.guards.set('/if', { guard });
    expect(guard({ flag: true })).toBe(true);
    expect(guard({ flag: false })).toBe(false);
    releaseValidationRoot(validator, first);
    const tree = createDispatchTree(second, undefined, validator);
    const validate = assertValidationRootReady(tree.root);
    if (!validate) throw new Error('Retry omitted whole-schema validator');
    expect(await validate({ flag: false })).toBeNull();
    expect(compile.mock.calls[2][0]).toBe(entry.copy);
    expect(entry.guards.get('/if')?.guard).toBe(guard);
    expect(guard({ flag: false })).toBe(false);
    validator.release?.(entry.copy);
  },
);
