import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { escapeMdxProse } from '../lib/escapeMdxProse';

describe('escapeMdxProse', () => {
  it('renders an inline link tag without a label as the target in a code span', () => {
    assert.equal(escapeMdxProse('See {@link gcd} for details.'), 'See `gcd` for details.');
    assert.equal(escapeMdxProse('See {@linkcode gcd}.'), 'See `gcd`.');
    assert.equal(escapeMdxProse('See {@linkplain gcd}.'), 'See `gcd`.');
  });

  it('renders the label of an inline link tag, as code only for @linkcode', () => {
    assert.equal(escapeMdxProse('Use {@link gcd | the divisor helper}.'), 'Use the divisor helper.');
    assert.equal(escapeMdxProse('Use {@link gcd the divisor helper}.'), 'Use the divisor helper.');
    assert.equal(escapeMdxProse('Use {@linkcode gcd | greatestCommonDivisor}.'), 'Use `greatestCommonDivisor`.');
  });

  it('escapes braces that remain in prose', () => {
    assert.equal(escapeMdxProse('Returns { ok: true } on success.'), 'Returns \\{ ok: true \\} on success.');
  });

  it('escapes an opening angle bracket that would start a JSX tag', () => {
    assert.equal(escapeMdxProse('Accepts Array<T> values.'), 'Accepts Array&lt;T> values.');
  });

  it('leaves inline code spans untouched', () => {
    assert.equal(escapeMdxProse('Pass `{ a: 1 }` or `{@link x}` or `Array<T>`.'), 'Pass `{ a: 1 }` or `{@link x}` or `Array<T>`.');
  });

  it('leaves fenced code blocks untouched', () => {
    const text = ['Before {x}.', '```ts', 'const a = { b: <T>(v: T) => v };', '{@link y}', '```', 'After {@link z}.'].join('\n');
    assert.equal(
      escapeMdxProse(text),
      ['Before \\{x\\}.', '```ts', 'const a = { b: <T>(v: T) => v };', '{@link y}', '```', 'After `z`.'].join('\n'),
    );
  });
});
