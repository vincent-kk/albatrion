import { expect, it, vi } from 'vitest';

import { createDuplicateIdValidator } from '@/schema-form/__tests__/fixtures/createDuplicateIdValidator';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';

import { readValidationEntry } from '../utils/cache/readValidationEntry';
import { releaseValidationRoot } from '../utils/lifetime/releaseValidationRoot';
import { retainValidationRoot } from '../utils/lifetime/retainValidationRoot';
import { assertValidationRootReady } from '../utils/run/assertValidationRootReady';

it('DR-3 B2 retries after the collision ends but waits for a third retained root', () => {
  const { validator, compile, compileGuard } = createDuplicateIdValidator();
  const first = { $id: 'urn:retry', type: 'string' };
  const second = { $id: 'urn:retry', type: 'number' };
  const third = { $id: 'urn:retry', type: 'boolean' };
  retainValidationRoot(validator, first);
  readValidationEntry(validator, first);
  const entry = readValidationEntry(validator, second);
  const guard = compileGuard(entry.copy, '/if');
  entry.guards.set('/if', { guard });
  const tree = createDispatchTree(second, undefined, validator);
  expect(() => assertValidationRootReady(tree.root)).toThrow(
    expect.objectContaining({
      details: expect.objectContaining({ reason: 'duplicateSchemaId' }),
    }),
  );
  const rejection = entry.rejection;
  retainValidationRoot(validator, third);
  releaseValidationRoot(validator, first);
  expect(() => assertValidationRootReady(tree.root)).toThrow(rejection);
  expect(compile).toHaveBeenCalledTimes(2);
  releaseValidationRoot(validator, third);
  expect(assertValidationRootReady(tree.root)).toBeTypeOf('function');
  expect(readValidationEntry(validator, second)).toBe(entry);
  expect(compile.mock.calls[2][0]).toBe(entry.copy);
  expect(entry.guards.get('/if')?.guard).toBe(guard);
  expect(entry.failure).toBeUndefined();
  expect(entry.duplicate).toBeUndefined();
  expect(entry.rejection).toBeUndefined();
  assertValidationRootReady(tree.root);
  expect(compile).toHaveBeenCalledTimes(3);
});

it('DR-3 preserves a failed retry rejection and never retries it twice', () => {
  const double = createDuplicateIdValidator();
  const first = { $id: 'urn:retry-failed', type: 'string' };
  const second = { $id: 'urn:retry-failed', type: 'number' };
  retainValidationRoot(double.validator, first);
  readValidationEntry(double.validator, first);
  const entry = readValidationEntry(double.validator, second);
  const tree = createDispatchTree(second, undefined, double.validator);
  expect(() => assertValidationRootReady(tree.root)).toThrow();
  const original = entry.rejection;
  const failure = entry.failure;
  releaseValidationRoot(double.validator, first);
  double.compile.mockImplementationOnce(() => {
    throw new Error('retry failed');
  });
  expect(() => assertValidationRootReady(tree.root)).toThrow(original);
  expect(double.compile).toHaveBeenCalledTimes(3);
  expect(entry.failure).toBe(failure);
  expect(entry.rejection).toBe(original);
  expect(() => assertValidationRootReady(tree.root)).toThrow(original);
  expect(double.compile).toHaveBeenCalledTimes(3);
});

it('DR-3 removes only duplicate-id guard failures after a successful retry', () => {
  const { validator } = createDuplicateIdValidator();
  const first = { $id: 'urn:retry-guards', type: 'string' };
  const second = { $id: 'urn:retry-guards', type: 'object' };
  retainValidationRoot(validator, first);
  readValidationEntry(validator, first);
  const entry = readValidationEntry(validator, second);
  const unrelated = new Error('unsupported keyword');
  entry.guards.set('/if', {
    failure: new Error('schema with key already exists'),
  });
  entry.guards.set('/allOf/0/if', { failure: unrelated });
  const guard = vi.fn(() => true);
  entry.guards.set('/allOf/1/if', { guard });
  releaseValidationRoot(validator, first);
  const tree = createDispatchTree(second, undefined, validator);
  expect(assertValidationRootReady(tree.root)).toBeTypeOf('function');
  expect(entry.guards.has('/if')).toBe(false);
  expect(entry.guards.get('/allOf/0/if')?.failure).toBe(unrelated);
  expect(entry.guards.get('/allOf/1/if')?.guard).toBe(guard);
});
