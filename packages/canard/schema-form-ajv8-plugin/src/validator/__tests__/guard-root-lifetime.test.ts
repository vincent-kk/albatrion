import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ajvValidatorPlugin } from '../../default/validatorPlugin';
import { checkGuardRootCollection } from './utils/checkGuardRootCollection';
import { ajvValidatorPlugin as plugin2019 } from '../../2019/validatorPlugin';
import { ajvValidatorPlugin as plugin2020 } from '../../2020/validatorPlugin';

describe.each([
  { dialect: 'default', plugin: ajvValidatorPlugin, Constructor: Ajv },
  { dialect: '2019', plugin: plugin2019, Constructor: Ajv2019 },
  { dialect: '2020', plugin: plugin2020, Constructor: Ajv2020 },
] as const)('guard root lifetime $dialect', ({ dialect, plugin: ajvValidatorPlugin, Constructor }) => {

afterEach(() => {
  ajvValidatorPlugin.configure({ directGuardCompile: true });
  vi.restoreAllMocks();
});

it.each([true, false])('collects an abandoned root guard with directGuardCompile=%s', (directGuardCompile) => {
  expect(checkGuardRootCollection(directGuardCompile, dialect)).toBe('GUARD_ROOT_COLLECTED');
});

it('release frees a directly compiled original root', () => {
  ajvValidatorPlugin.bind?.(new Constructor({ strict: false }));
  const root = { type: 'string' } as const;
  const compile = vi.spyOn(Constructor.prototype, 'compile');
  expect(ajvValidatorPlugin.compileGuard(root, '')('ok')).toBe(true);
  const index = compile.mock.calls.findIndex(([schema]) => schema === root);
  const guard = compile.mock.contexts[index];
  if (typeof guard !== 'object' || guard === null) throw new Error('Missing guard instance');
  ajvValidatorPlugin.release(root);
  expect(Reflect.get(guard, '_cache').has(root)).toBe(false);
});
});
