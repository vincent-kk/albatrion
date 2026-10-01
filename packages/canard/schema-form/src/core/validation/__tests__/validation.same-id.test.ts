import { describe, expect, it, vi } from 'vitest';

import { adoptSchemaNodeChain, dispatchMount, dispatchValidate } from '../../dispatch';
import { createDispatchTree } from '../../dispatch/__tests__/fixtures/createDispatchTree';
import { releaseValidationRoot, retainValidationRoot } from '../index';
import type { Validator } from '../type';

// filid:contract validation-lifetime
describe('same schema id trees', () => {
  it('VALIDATE-045 releases an unmounted same-id root before compiling its replacement', () => {
    const first = { $id: 'urn:replaced', type: 'string' };
    const second = { $id: 'urn:replaced', type: 'number' };
    const compile = vi.fn(() => () => null);
    const release = vi.fn();
    const validator: Validator = { compile, compileGuard: () => () => true, release };
    retainValidationRoot(validator, first);
    releaseValidationRoot(validator, first);
    expect(release).not.toHaveBeenCalled();

    retainValidationRoot(validator, second);
    expect(release).toHaveBeenCalledExactlyOnceWith(first);
    expect(compile).toHaveBeenCalledTimes(2);
    expect(release.mock.invocationCallOrder[0])
      .toBeLessThan(compile.mock.invocationCallOrder[1]);
  });

  it('VALIDATE-046 ERROR-201 keeps the older tree when a new root fails compilation', async () => {
    const first = { $id: 'urn:shared', type: 'string' };
    const second = { $id: 'urn:shared', type: 'number' };
    const validator: Validator = {
      compile: (copy) => {
        if (typeof copy === 'object' && copy !== null && copy.type === 'number')
          throw new Error('schema with key already exists');
        return () => null;
      }, compileGuard: () => () => true,
    };
    const oldTree = createDispatchTree(first, undefined, validator);
    dispatchMount(oldTree.root, 'kept');
    retainValidationRoot(validator, first);
    const newTree = createDispatchTree(second, undefined, validator);
    dispatchMount(newTree.root, 42);
    await expect(dispatchValidate(newTree.root)).rejects.toMatchObject({
      details: { reason: 'duplicateSchemaId', $id: 'urn:shared' },
    });
    expect(oldTree.root.emit).toBe('kept');
    expect(await dispatchValidate(oldTree.root)).toEqual([]);
  });

  it('31C-03 does not call an unrelated compile exception a duplicate-id collision', async () => {
    const first = { $id: 'urn:shared-other', type: 'string' };
    const second = { $id: 'urn:shared-other', type: 'number' };
    const validator: Validator = { compile: (copy) => {
      if (typeof copy === 'object' && copy !== null && copy.type === 'number')
        throw new Error('unsupported keyword');
      return () => null;
    }, compileGuard: () => () => true };
    retainValidationRoot(validator, first);
    const { root } = createDispatchTree(second, undefined, validator);
    await expect(dispatchValidate(root)).rejects.toMatchObject({
      details: { error: expect.any(Error) },
    });
    try { await dispatchValidate(root); }
    catch (failure) {
      expect(failure).not.toHaveProperty('details.reason');
    }
  });

  it('VALIDATE-046 (iii) keeps the old chain intact when rebuilt-root compilation fails', () => {
    const first = { $id: 'urn:atomic', type: 'string' };
    const second = { $id: 'urn:atomic', type: 'number' };
    const validator: Validator = { compile: (copy) => {
      if (typeof copy === 'object' && copy !== null && copy.type === 'number')
        throw new Error('schema with key already exists');
      return () => null;
    }, compileGuard: () => () => true };
    const previous = createDispatchTree(first, undefined, validator);
    dispatchMount(previous.root, 'retained');
    retainValidationRoot(validator, first);
    const next = createDispatchTree(second, undefined, validator);
    previous.runtime.entryDepth = 1;
    expect(() => adoptSchemaNodeChain(previous.root, next.root)).toThrow(
      'Whole-schema validation could not be compiled');
    expect(previous.runtime.entryDepth).toBe(1);
    expect(previous.runtime.adoptedRoot).toBeUndefined();
    expect(previous.root.emit).toBe('retained');
    expect(next.runtime.chainRoot).toBeUndefined();
  });

  it('VALIDATE-046 (iii) adopts a separately compiled same-id replacement', async () => {
    const first = { $id: 'urn:atomic-success', type: 'string' };
    const second = { $id: 'urn:atomic-success', type: 'number' };
    const validator: Validator = { compile: (copy) =>
      (value) => typeof copy === 'object' && copy !== null &&
        copy.type === typeof value ? null : [{ dataPath: '', message: 'wrong tree' }],
    compileGuard: () => () => true };
    const previous = createDispatchTree(first, undefined, validator);
    dispatchMount(previous.root, 'old');
    retainValidationRoot(validator, first);
    const next = createDispatchTree(second, undefined, validator);
    dispatchMount(next.root, 5);
    previous.runtime.entryDepth = 1;
    adoptSchemaNodeChain(previous.root, next.root);
    expect(previous.runtime.adoptedRoot).toBe(next.root);
    expect(await dispatchValidate(previous.root)).toEqual([]);
    expect(await dispatchValidate(next.root)).toEqual([]);
  });
});
