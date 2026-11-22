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

it.each([true, false])('collects an abandoned /if guard root with directGuardCompile=%s', (directGuardCompile) => {
  expect(checkGuardRootCollection(directGuardCompile, 'default', '/if')).toBe('GUARD_ROOT_COLLECTED');
});

it('release permits replacing an already compiled direct root', () => {
  ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true }));
  const root = { type: 'string' } as const;
  const first = ajvValidatorPlugin.compileGuard(root, '');
  ajvValidatorPlugin.release(root);
  const second = ajvValidatorPlugin.compileGuard({ type: 'number' }, '');
  expect([first('ok'), first(2), second('ok'), second(2)]).toEqual([true, false, false, true]);
});
