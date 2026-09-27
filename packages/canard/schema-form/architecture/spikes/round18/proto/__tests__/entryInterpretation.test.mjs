// filid:contract PROTO-ENTRY
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSchema } from '../build-v7.mjs';
import { lastSettle, setValue, write } from '../loop-v7.mjs';

test('the static first interpretation never depends on the previous branch', () => {
  const schema = { type: 'object', properties: { kind: { type: 'string' }, a: { type: ['string', 'number'] } },
    if: { properties: { kind: { const: 'num' } } }, then: { properties: { a: { type: 'number' } } } };
  for (const previous of ['num', 'text']) {
    const root = buildSchema(schema, { kind: previous, a: 'before' });
    setValue(root, { kind: 'num', a: '42' });
    assert.equal(root.find('/a').raw, 42);
    assert.equal(root.find('/a').typeMismatch, false);
  }
});

test('reinterpreting uses the caller input instead of a prior conversion result', () => {
  const schema = { type: 'object', properties: { kind: { type: 'string' }, a: { type: ['string', 'boolean'] } },
    if: { properties: { kind: { const: 'flag' } } }, then: { properties: { a: { type: 'boolean' } } }, else: { properties: { a: { type: 'string' } } } };
  for (const previous of ['flag', 'text']) {
    const root = buildSchema(schema, { kind: previous, a: 'before' });
    setValue(root, { kind: 'flag', a: 0 });
    assert.equal(root.find('/a').raw, false);
    assert.equal(root.find('/a').typeMismatch, false);
  }
  assert.equal(buildSchema(schema, { kind: 'flag', a: 0 }).find('/a').raw, false);
});

test('a gate-only change updates mismatch without retroactive coercion', () => {
  const root = buildSchema({ type: 'object', properties: { kind: { type: 'string' }, a: { type: ['string', 'number'] } },
    if: { properties: { kind: { const: 'num' } } }, then: { properties: { a: { type: 'number' } } } }, { kind: 'text', a: '42' });
  write(root.find('/kind'), 'num');
  assert.equal(root.find('/a').raw, '42');
  assert.equal(root.find('/a').typeMismatch, true);
});

test('transition feedback converges to the last effective interpretation', () => {
  const root = buildSchema({ type: 'object', properties: { a: { type: ['string', 'boolean'] } },
    if: { properties: { a: { type: 'number' } } }, then: { properties: { a: { type: 'boolean' } } }, else: { properties: { a: { type: 'string' } } } }, { a: 0 });
  assert.equal(root.find('/a').raw, '0');
  assert.equal(root.find('/a').typeMismatch, false);
  assert.equal(root.diagnostics.status, 'stable');
});

test('unbounded feedback commits only the static interpretation in original B', () => {
  const root = buildSchema({ type: 'object', properties: { a: { type: ['string', 'boolean'] } },
    if: { properties: { a: { type: 'string' } } }, then: { properties: { a: { type: 'boolean' } } }, else: { properties: { a: { type: 'string' } } } }, { a: 0 });
  assert.equal(root.find('/a').raw, 0);
  assert.equal(root.find('/a').typeMismatch, true);
  assert.equal(root.diagnostics.status, 'degraded');
  assert.ok(lastSettle.transitionRounds <= 3);
});
