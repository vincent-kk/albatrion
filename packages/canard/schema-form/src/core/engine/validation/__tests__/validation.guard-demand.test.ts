import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { blueprint } from '../../blueprint';
import type { BlueprintSchema } from '../../blueprint';
import type { Validator } from '../types/validator';
import { readValidationEntry } from '../utils/cache/readValidationEntry';
import { readFieldNodeGuard } from '../utils/guard/readFieldNodeGuard';
import { releaseValidationRoot } from '../utils/lifetime/releaseValidationRoot';
import { retainValidationRoot } from '../utils/lifetime/retainValidationRoot';
import { assertValidationRootReady } from '../utils/run/assertValidationRootReady';

it('G red guard reads cache their predicate without whole compilation', () => {
  const schema = { type: 'object', if: {}, then: { type: 'object' } };
  const analysis = blueprint(schema);
  const gate = analysis.root.declarations
    .flatMap((entry) => entry.gates)
    .find((entry) => entry.kind === 'if');
  if (!gate) throw new Error('Expected an if gate');
  const compile = vi.fn(() => () => null);
  const compileGuard = vi.fn(() => () => true);
  const validator: Validator = { compile, compileGuard };
  const runtime = { blueprint: analysis, validator };
  const guard = readFieldNodeGuard(runtime, gate);
  expect(guard?.({})).toBe(true);
  expect(readFieldNodeGuard(runtime, gate)).toBe(guard);
  expect(compileGuard).toHaveBeenCalledTimes(1);
  expect(compile).not.toHaveBeenCalled();
});

it('G red same-id root released between guard settle and first whole demand is evicted', () => {
  const registered = new Map<string, BlueprintSchema>();
  const compile = vi.fn((copy: BlueprintSchema) => {
    const id = typeof copy === 'object' && copy !== null ? copy.$id : undefined;
    if (typeof id === 'string') {
      const existing = registered.get(id);
      if (existing && existing !== copy)
        throw new Error('schema with key already exists');
      registered.set(id, copy);
    }
    return () => null;
  });
  const release = vi.fn((copy: BlueprintSchema) => {
    const id = typeof copy === 'object' && copy !== null ? copy.$id : undefined;
    if (typeof id === 'string' && registered.get(id) === copy)
      registered.delete(id);
  });
  const validator: Validator = {
    compile,
    compileGuard: () => () => true,
    release,
  };
  const first = { $id: 'urn:g-deferred-release', type: 'object' };
  const second = { ...first, if: {}, then: { type: 'object' } };
  retainValidationRoot(validator, first);
  const previous = createDispatchTree(first, undefined, validator);
  expect(assertValidationRootReady(previous.root)?.({})).toBeNull();
  const firstCopy = readValidationEntry(validator, first).copy;
  const next = createDispatchTree(second, undefined, validator);
  retainValidationRoot(validator, second);
  const gate = next.runtime.blueprint.root.declarations
    .flatMap((entry) => entry.gates)
    .find((entry) => entry.kind === 'if');
  if (!gate) throw new Error('Expected an if gate');
  expect(readFieldNodeGuard(next.runtime, gate)?.({})).toBe(true);
  expect(compile).toHaveBeenCalledTimes(1);
  releaseValidationRoot(validator, first);
  expect(release).not.toHaveBeenCalled();
  expect(assertValidationRootReady(next.root)?.({})).toBeNull();
  expect(compile).toHaveBeenCalledTimes(2);
  expect(release).toHaveBeenCalledExactlyOnceWith(firstCopy);
  releaseValidationRoot(validator, second);
});
