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

it.each([true, false])('collects an abandoned /if guard root with directGuardCompile=%s', (directGuardCompile) => {
  expect(checkGuardRootCollection(directGuardCompile, dialect, '/if')).toBe('GUARD_ROOT_COLLECTED');
});

it('release permits replacing an already compiled direct root', () => {
  ajvValidatorPlugin.bind?.(new Constructor({ strict: false }));
  const root = { type: 'string' } as const;
  const first = ajvValidatorPlugin.compileGuard(root, '');
  ajvValidatorPlugin.release(root);
  const second = ajvValidatorPlugin.compileGuard({ type: 'number' }, '');
  expect([first('ok'), first(2), second('ok'), second(2)]).toEqual([true, false, false, true]);
});
});
