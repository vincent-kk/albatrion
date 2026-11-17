import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';
import { checkGuardRootCollection } from './utils/checkGuardRootCollection';

describe('anchored guard root lifetime, Ajv 2019 binding', () => {
  afterEach(() => {
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    vi.restoreAllMocks();
  });

  it.each([true, false])('collects an abandoned anchored root with directGuardCompile=%s', (directGuardCompile) => {
    expect(checkGuardRootCollection(directGuardCompile, '2019', '/if', true)).toBe('GUARD_ROOT_COLLECTED');
  });

  it('release clears an anchor-only guard registration, repeats safely, and allows a recompile', () => {
    ajvValidatorPlugin.bind?.(new Ajv2019({ allErrors: true, strict: false, validateFormats: false }));
    const id = 'https://example.test/ajv7/anchored-lifetime';
    const root = JSON.parse(JSON.stringify({
      $id: id,
      $recursiveAnchor: true,
      type: 'object',
      required: ['ok'],
      if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] },
    })) as JSONSchema;
    const value = { ok: true, next: { ok: true } };
    const compile = vi.spyOn(Ajv2019.prototype, 'compile');
    const verdict = ajvValidatorPlugin.compileGuard(root, '/if')(value);
    const index = compile.mock.calls.findIndex(([schema]) => typeof schema === 'object' && schema !== null && '$ref' in schema);
    const guard = compile.mock.contexts[index];
    if (typeof guard !== 'object' || guard === null) throw new Error('Missing guard instance');
    const registered = () => [Reflect.get(guard, 'refs'), Reflect.get(guard, 'schemas')]
      .some((table) => Object.keys(table).some((name) => name.startsWith(id)));
    expect(registered()).toBe(true);
    ajvValidatorPlugin.release(root);
    expect(registered()).toBe(false);
    expect(() => ajvValidatorPlugin.release(root)).not.toThrow();
    expect(ajvValidatorPlugin.compileGuard(root, '/if')(value)).toBe(verdict);
    ajvValidatorPlugin.release(root);
  });
});
