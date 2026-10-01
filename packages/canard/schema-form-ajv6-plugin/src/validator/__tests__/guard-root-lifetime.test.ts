import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';
import { checkGuardRootCollection } from './utils/checkGuardRootCollection';

afterEach(() => {
  ajvValidatorPlugin.configure({ directGuardCompile: true });
  vi.restoreAllMocks();
});

it.each([true, false])('collects an abandoned root guard with directGuardCompile=%s', (directGuardCompile) => {
  expect(checkGuardRootCollection(directGuardCompile)).toBe('GUARD_ROOT_COLLECTED');
});

it('release frees a directly compiled original root', () => {
  ajvValidatorPlugin.bind?.(new Ajv({ format: false }));
  const root = { type: 'string' } as const;
  const compile = vi.spyOn(Ajv.prototype, 'compile');
  expect(ajvValidatorPlugin.compileGuard(root, '')('ok')).toBe(true);
  const index = compile.mock.calls.findIndex(([schema]) => schema === root);
  const guard = compile.mock.contexts[index];
  if (typeof guard !== 'object' || guard === null) throw new Error('Missing guard instance');
  ajvValidatorPlugin.release(root);
  expect(Reflect.get(Reflect.get(guard, '_cache'), '_cache')).not.toHaveProperty(JSON.stringify(root));
});
