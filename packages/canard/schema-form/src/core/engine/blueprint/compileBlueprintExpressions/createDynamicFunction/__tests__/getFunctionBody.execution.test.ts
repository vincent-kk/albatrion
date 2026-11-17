import { expect, it } from 'vitest';
import { getFunctionBody } from '../utils/getFunctionBody';

it.each([
  '{ const f = () => { return 2; }; return f() === 2; }',
  '{ return (\n true\n); }',
  '{ const text = "return 0;"; return text === "return 0;"; }',
])('coerces only the final result of %s', (body) => {
  expect(new Function('dependencies', getFunctionBody(body, true))([])).toBe(true);
});
it('coerces an implicit undefined return to false', () => {
  expect(new Function('dependencies', getFunctionBody('{ const value = 1; }', true))([])).toBe(false);
});
