// filid:contract PROTO-RULE-A
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { convert, interpret, isMember } from '../loop-v7.mjs';

test('every source-kind and target-kind cell follows the closed conversion table', () => {
  const targets = ['string', 'number', 'integer', 'boolean', 'object', 'array'];
  const cases = [
    [undefined, [undefined, undefined, undefined, undefined, undefined, undefined]],
    [null, [undefined, undefined, undefined, undefined, undefined, undefined]],
    [{}, [undefined, undefined, undefined, undefined, undefined, undefined]],
    [[], [undefined, undefined, undefined, undefined, undefined, undefined]],
    [false, ['false', undefined, undefined, undefined, undefined, undefined]],
    [true, ['true', undefined, undefined, undefined, undefined, undefined]],
    [0, ['0', undefined, undefined, false, undefined, undefined]],
    [1, ['1', undefined, undefined, true, undefined, undefined]],
    [1.5, ['1.5', undefined, undefined, undefined, undefined, undefined]],
    ['1', [undefined, 1, 1, undefined, undefined, undefined]],
    ['1.5', [undefined, 1.5, undefined, undefined, undefined, undefined]],
    ['true', [undefined, undefined, undefined, true, undefined, undefined]],
    ['false', [undefined, undefined, undefined, false, undefined, undefined]],
  ];
  for (const [value, expected] of cases)
    for (let index = 0; index < targets.length; index++)
      assert.equal(convert(value, targets[index]), expected[index]);
});

test('membership preserves non-safe integers while conversion requires safe integers', () => {
  assert.equal(isMember(1e16, 'integer'), true);
  assert.equal(convert('1e16', 'integer'), undefined);
  assert.equal(convert('1.0', 'integer'), 1);
  assert.equal(convert('1e2', 'integer'), 100);
  assert.equal(convert(1.5, 'integer'), undefined);
  assert.equal(isMember(Infinity, 'number'), false);
  assert.equal(isMember(NaN, 'number'), false);
});

test('number conversion uses complete JSON notation and safe integer spellings', () => {
  for (const value of ['01', '1e400', '9007199254740993', '', '1x', true, null, {}, []]) assert.equal(convert(value, 'number'), undefined);
  assert.equal(convert(' 1.5 ', 'number'), 1.5);
  assert.equal(convert('-1e2', 'number'), -100);
  assert.equal(convert('9007199254740993.0', 'number'), 9007199254740992);
});

test('boolean and string conversions use the closed scalar table', () => {
  for (const value of ['true', 1]) assert.equal(convert(value, 'boolean'), true);
  for (const value of ['false', 0, -0]) assert.equal(convert(value, 'boolean'), false);
  for (const value of [' true', '1', 2, {}, [], null]) assert.equal(convert(value, 'boolean'), undefined);
  assert.equal(convert(-0, 'string'), '0');
  assert.equal(convert(false, 'string'), 'false');
  for (const value of [NaN, Infinity, null, {}, []]) assert.equal(convert(value, 'string'), undefined);
});

test('object and array values preserve identity and never parse or stringify', () => {
  const object = {};
  const array = [];
  assert.equal(interpret(object, { kinds: ['object'], nullable: false }), object);
  assert.equal(interpret(array, { kinds: ['array'], nullable: false }), array);
  assert.equal(convert('{}', 'object'), undefined);
  assert.equal(convert('[]', 'array'), undefined);
  assert.equal(interpret(null, { kinds: ['number'], nullable: false }), null);
  assert.equal(interpret(undefined, { kinds: ['number'], nullable: false }), undefined);
});

test('the twelve ambiguous combinations preserve their numeric input', () => {
  let cases = 0;
  for (const extra of [[], ['object'], ['array'], ['object', 'array']]) {
    for (const value of [0, -0, 1]) {
      assert.ok(Object.is(interpret(value, { kinds: ['string', 'boolean', ...extra], nullable: false }), value));
      cases++;
    }
  }
  assert.equal(cases, 12);
  assert.equal(interpret('2', { kinds: ['integer', 'number', 'boolean'], nullable: false }), 2);
});

test('all allowed-kind subsets preserve order independence and idempotence', () => {
  const kinds = ['string', 'number', 'integer', 'boolean', 'object', 'array'];
  const values = [undefined, null, '', '0', '1', '2', 'true', 'false', ' 2 ', '01', '1e400', '1.5', '1e16', '9007199254740993', 0, -0, 1, 2, 1.5, 1e16, NaN, Infinity, -Infinity, true, false, {}, [], { a: 1 }, [1]];
  let comparisons = 0;
  for (let mask = 1; mask < 64; mask++) {
    const selected = kinds.filter((_, index) => mask & 1 << index);
    for (const nullable of [false, true]) for (const value of values) {
      const spec = { kinds: selected, nullable };
      const result = interpret(value, spec);
      assert.ok(Object.is(interpret(value, { kinds: [...selected].reverse(), nullable }), result));
      assert.ok(Object.is(interpret(result, spec), result));
      comparisons += 2;
    }
  }
  assert.equal(comparisons, 7308);
});
