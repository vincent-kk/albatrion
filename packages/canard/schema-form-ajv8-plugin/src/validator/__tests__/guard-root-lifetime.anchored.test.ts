import type { JSONSchema } from '@canard/schema-form';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkGuardRootCollection } from './utils/checkGuardRootCollection';
import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';

describe.each([
  { dialect: '2019', plugin: plugin2019, Constructor: Ajv2019, anchor: { $recursiveAnchor: true }, reference: { $recursiveRef: '#' } },
  { dialect: '2020', plugin: plugin2020, Constructor: Ajv2020, anchor: { $dynamicAnchor: 'node' }, reference: { $dynamicRef: '#node' } },
] as const)('anchored guard root lifetime $dialect', ({ dialect, plugin, Constructor, anchor, reference }) => {
  afterEach(() => {
    plugin.configure({ directGuardCompile: true });
    vi.restoreAllMocks();
  });

  it.each([true, false])('collects an abandoned anchored root with directGuardCompile=%s', (directGuardCompile) => {
    expect(checkGuardRootCollection(directGuardCompile, dialect, '/if', true)).toBe('GUARD_ROOT_COLLECTED');
  });

  it('release clears an anchor-only guard registration, repeats safely, and allows a recompile', () => {
    plugin.bind(new Constructor({ strict: false }));
    const id = `https://example.test/ajv8/${dialect}/anchored-lifetime`;
    const root = JSON.parse(JSON.stringify({
      $id: id,
      ...anchor,
      type: 'object',
      required: ['ok'],
      if: { properties: { next: reference }, required: ['next'] },
    })) as JSONSchema;
    const value = { ok: true, next: { ok: true } };
    const compile = vi.spyOn(Constructor.prototype, 'compile');
    const verdict = plugin.compileGuard(root, '/if')(value);
    const index = compile.mock.calls.findIndex(([schema]) => typeof schema === 'object' && schema !== null && '$ref' in schema);
    const guard = compile.mock.contexts[index];
    if (typeof guard !== 'object' || guard === null) throw new Error('Missing guard instance');
    const registered = () => [Reflect.get(guard, 'refs'), Reflect.get(guard, 'schemas')]
      .some((table) => Object.keys(table).some((name) => name.startsWith(id)));
    expect(registered()).toBe(true);
    plugin.release(root);
    expect(registered()).toBe(false);
    expect(() => plugin.release(root)).not.toThrow();
    expect(plugin.compileGuard(root, '/if')(value)).toBe(verdict);
    plugin.release(root);
  });
});
