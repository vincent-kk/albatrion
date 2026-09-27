// filid:contract PROTO-SETTLE
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSchema } from '../build-v7.mjs';
import { attach, batch, counters, declareDerived, declareInjections, leaf, object, prime, resetCounters, setValue, valueOf, write } from '../loop-v7.mjs';

test('statically declared inactive keys are latent while condition-only keys remain extras', () => {
  const root = buildSchema({ type: 'object', properties: { flag: {} },
    if: { required: ['condition'] }, then: { properties: { child: { default: 'visible' } } },
    oneOf: [{ controls: { active: false }, properties: { latent: {} } }] }, { condition: true, latent: 'hidden' });
  assert.deepEqual(valueOf(root), { child: 'visible', condition: true });
  assert.equal(root.find('/latent').raw, 'hidden');
});

test('equal-rank writes use source document order regardless of rule registration order', () => {
  const root = object('');
  const a = attach(root, leaf('a'));
  const b = attach(root, leaf('b'));
  const target = attach(root, leaf('target'));
  declareInjections(root, [{ from: b, to: target, map: () => 'later' }, { from: a, to: target, map: () => 'earlier' }]);
  prime(root, { a: 1, b: 1 });
  assert.equal(target.raw, 'later');
});

test('a later round cannot replace a higher-ranked write with injection', () => {
  const root = object('');
  const a = attach(root, leaf('a'));
  const b = attach(root, leaf('b'));
  const target = attach(root, leaf('target'));
  declareInjections(root, [{ from: a, to: b, map: value => value + 1 }, { from: b, to: target, map: value => 'I' + value }]);
  declareDerived(root, [{ from: a, to: target, map: value => 'D' + value }]);
  prime(root, { a: 1, b: 1 });
  assert.equal(target.raw, 'D1');
});

test('same-source ties prefer the specific layer and then the later fragment order', () => {
  for (const rules of [
    [{ layer: 2, order: 0, value: 'node' }, { layer: 1, order: 1, value: 'child' }],
    [{ layer: 1, order: 0, value: 'child' }, { layer: 0, order: 1, value: 'fragment' }],
    [{ layer: 1, order: 3, value: 'later' }, { layer: 1, order: 2, value: 'earlier' }],
  ]) {
    const root = object('');
    const source = attach(root, leaf('source'));
    const target = attach(root, leaf('target'));
    declareInjections(root, rules.map(rule => ({ ...rule, from: source, to: target, map: () => rule.value })));
    prime(root, { source: 1 });
    assert.equal(target.raw, rules[0].value);
  }
});

test('leaving nodes clear raw once only when unsetOnInactive requests it', () => {
  const root = buildSchema({ type: 'object', properties: { flag: {}, child: { controls: { active: value => value.flag, unsetOnInactive: true } } } }, { flag: true, child: 'secret' });
  write(root.find('/flag'), false);
  assert.equal(root.find('/child').raw, undefined);
  write(root.find('/flag'), true);
  assert.equal(root.find('/child').raw, undefined);
});

test('an edge rule leaves with its source node instead of firing during exit', () => {
  const root = buildSchema({ type: 'object', properties: { flag: {}, target: {}, source: { controls: { active: value => value.flag, injectTo: { to: '/target', map: value => value } } } } }, { flag: true, source: 'before' });
  assert.equal(root.find('/target').raw, 'before');
  batch(root, () => { write(root.find('/flag'), false); write(root.find('/source'), 'after'); });
  assert.equal(root.find('/target').raw, 'before');
});

test('a write calculates only the changed child and its parent', () => {
  const properties = Object.fromEntries(Array.from({ length: 50 }, (_, index) => ['field' + index, {}]));
  const root = buildSchema({ type: 'object', properties }, {});
  resetCounters();
  write(root.find('/field0'), 'changed');
  assert.equal(counters.visited, 2);
});
