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
    const instance = new Ajv2019({ allErrors: true, strict: false, validateFormats: false });
    ajvValidatorPlugin.bind?.(instance);
    const id = 'https://example.test/ajv7/anchored-lifetime';
    const root = JSON.parse(JSON.stringify({
      $id: id,
      $recursiveAnchor: true,
      type: 'object',
      required: ['ok'],
      if: { properties: { next: { $recursiveRef: '#' } }, required: ['next'] },
    })) as JSONSchema;
    const value = { ok: true, next: { ok: true } };
    const verdict = ajvValidatorPlugin.compileGuard(root, '/if')(value);
    expect(instance.getSchema(id)).toBeUndefined();
    ajvValidatorPlugin.release(root);
    expect(instance.getSchema(id)).toBeUndefined();
    expect(() => ajvValidatorPlugin.release(root)).not.toThrow();
    expect(ajvValidatorPlugin.compileGuard(root, '/if')(value)).toBe(verdict);
    ajvValidatorPlugin.release(root);
  });
});
