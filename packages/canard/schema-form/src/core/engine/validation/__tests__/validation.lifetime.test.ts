import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';

import type { Validator } from '../types/validator';
import { readValidationEntry } from '../utils/cache/readValidationEntry';
import { evictValidationRoot } from '../utils/lifetime/evictValidationRoot';
import { recentReleaseList } from '../utils/lifetime/recentReleaseList';
import { releaseValidationRoot } from '../utils/lifetime/releaseValidationRoot';
import { retainValidationRoot } from '../utils/lifetime/retainValidationRoot';

// filid:contract validation-lifetime
describe('validator registration lifetime', () => {
  it('retain without a read never calls compile, release still moves the root to recent', () => {
    const compile = vi.fn(() => () => null);
    const validator: Validator = { compile, compileGuard: () => () => true };
    const root = { type: 'string' };
    retainValidationRoot(validator, root);
    expect(compile).not.toHaveBeenCalled();
    expect(recentReleaseList(validator).counts.get(root)).toBe(1);
    expect(recentReleaseList(validator).recent).not.toContain(root);
    releaseValidationRoot(validator, root);
    expect(compile).not.toHaveBeenCalled();
    expect(recentReleaseList(validator).recent).toContain(root);
  });

  it('a first read preserves every committed consumer until the final release', () => {
    const compile = vi.fn(() => () => null);
    const validator: Validator = { compile, compileGuard: () => () => true };
    const root = { type: 'string' };
    retainValidationRoot(validator, root);
    retainValidationRoot(validator, root);
    readValidationEntry(validator, root);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(recentReleaseList(validator).counts.get(root)).toBe(2);
    expect(recentReleaseList(validator).recent).not.toContain(root);
    releaseValidationRoot(validator, root);
    expect(recentReleaseList(validator).recent).not.toContain(root);
    releaseValidationRoot(validator, root);
    expect(recentReleaseList(validator).recent).toEqual([root]);
  });

  it('VALIDATE-021 VALIDATE-045 18C-56 retains at most eight released roots', () => {
    const registered = new Set<string>();
    const compile = vi.fn((schema: BlueprintSchema) => {
      if (
        typeof schema === 'object' &&
        schema !== null &&
        typeof schema.$id === 'string'
      )
        registered.add(schema.$id);
      return () => null;
    });
    const release = vi.fn((schema: BlueprintSchema) => {
      if (
        typeof schema === 'object' &&
        schema !== null &&
        typeof schema.$id === 'string'
      )
        registered.delete(schema.$id);
    });
    const validator: Validator = {
      compile,
      compileGuard: () => () => true,
      release,
    };
    const roots = Array.from({ length: 1000 }, (_, index) => ({
      $id: `urn:root:${index}`,
    }));
    for (const root of roots) {
      retainValidationRoot(validator, root);
      readValidationEntry(validator, root);
      releaseValidationRoot(validator, root);
      expect(registered.size).toBeLessThanOrEqual(8);
    }
    expect(release).toHaveBeenCalledTimes(roots.length - 8);
    for (let index = 0; index < release.mock.calls.length; index++)
      expect(release.mock.calls[index][0]).toBe(compile.mock.calls[index][0]);
    const recent = roots[roots.length - 1];
    const before = compile.mock.calls.length;
    retainValidationRoot(validator, recent);
    readValidationEntry(validator, recent);
    expect(compile).toHaveBeenCalledTimes(before);
    releaseValidationRoot(validator, recent);
    expect(release).toHaveBeenCalledTimes(roots.length - 8);
  });

  it('VALIDATE-045 skips plugin release for a root without a cache entry', () => {
    const release = vi.fn();
    const validator: Validator = {
      compile: () => () => null,
      compileGuard: () => () => true,
      release,
    };
    evictValidationRoot(validator, { $id: 'urn:never-compiled' });
    expect(release).not.toHaveBeenCalled();
  });
});
