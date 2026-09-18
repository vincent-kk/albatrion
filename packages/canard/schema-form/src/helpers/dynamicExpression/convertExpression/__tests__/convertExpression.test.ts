// filid:contract convert-expression-contract
import { expect, it } from 'vitest';

import { convertExpression } from '../convertExpression';

it('preserves JSON escaping in scalar and array literals', () => {
  const text = '한글😀"\\\n\ud800';
  expect(convertExpression({ name: text })).toBe(
    `(../name)===${JSON.stringify(text)}`,
  );
  expect(convertExpression({ name: [text, 'x'] })).toBe(
    `${JSON.stringify([text, 'x'])}.includes((../name))`,
  );
});

it('preserves empty conditions, booleans and inverse operators', () => {
  expect(convertExpression({})).toBe(null);
  expect(convertExpression({ active: true })).toBe('(../active)===true');
  expect(convertExpression({ active: false }, true)).toBe(
    '(../active)!==false',
  );
  expect(convertExpression({ name: ['x'] }, true)).toBe(
    '!["x"].includes((../name))',
  );
});
