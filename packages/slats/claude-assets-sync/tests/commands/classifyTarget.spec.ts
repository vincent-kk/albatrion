import { describe, expect, it } from 'vitest';

import { classifyTarget } from '../../src/commands/runCli/utils/classifyTarget.js';

describe('classifyTarget', () => {
  // 3 happy-path cases covering the three accepted target shapes.
  it('classifies "@<scope>" (no slash) as a scope alias', () => {
    expect(classifyTarget('@canard')).toEqual({
      kind: 'scope',
      scope: 'canard',
    });
  });

  it('classifies "@<scope>/<name>" as a scoped package', () => {
    expect(classifyTarget('@canard/schema-form')).toEqual({
      kind: 'package',
      name: '@canard/schema-form',
    });
  });

  it('classifies "<name>" (no @, no slash) as an unscoped package', () => {
    expect(classifyTarget('lodash')).toEqual({
      kind: 'package',
      name: 'lodash',
    });
  });

  // 12 edge / negative cases (FCA-AI 3+12 limit).
  it('treats the empty string as invalid', () => {
    expect(classifyTarget('')).toMatchObject({ kind: 'invalid' });
  });

  it('treats a lone "@" as invalid', () => {
    expect(classifyTarget('@')).toMatchObject({ kind: 'invalid' });
  });

  it('treats "@/name" (missing scope) as invalid', () => {
    expect(classifyTarget('@/schema-form')).toMatchObject({ kind: 'invalid' });
  });

  it('treats "@canard/" (missing name) as invalid', () => {
    expect(classifyTarget('@canard/')).toMatchObject({ kind: 'invalid' });
  });

  it('treats a slash in an unscoped value as invalid', () => {
    expect(classifyTarget('foo/bar')).toMatchObject({ kind: 'invalid' });
  });

  it('treats an extra slash ("@canard/a/b") as invalid', () => {
    expect(classifyTarget('@canard/a/b')).toMatchObject({ kind: 'invalid' });
  });

  it('rejects uppercase scope ("@Canard")', () => {
    expect(classifyTarget('@Canard')).toMatchObject({ kind: 'invalid' });
  });

  it('rejects uppercase letters in a scoped package name', () => {
    expect(classifyTarget('@canard/Schema')).toMatchObject({ kind: 'invalid' });
  });

  it('rejects a leading "." in an unscoped package', () => {
    expect(classifyTarget('.hidden')).toMatchObject({ kind: 'invalid' });
  });

  it('rejects a leading "_" in an unscoped package', () => {
    expect(classifyTarget('_private')).toMatchObject({ kind: 'invalid' });
  });

  it('accepts another lowercase scope alias', () => {
    expect(classifyTarget('@winglet')).toEqual({
      kind: 'scope',
      scope: 'winglet',
    });
  });

  it('accepts hyphenated scoped packages', () => {
    expect(classifyTarget('@lerx/promise-modal')).toEqual({
      kind: 'package',
      name: '@lerx/promise-modal',
    });
  });
});
