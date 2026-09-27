// filid:contract PROTO-OUTPUT
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { array, attach, leaf, object, prime, valueOf, write } from '../loop-v7.mjs';
import { buildSchema } from '../build-v7.mjs';

test('empty object root exposes its empty container', () => {
  const root = object('');
  prime(root, {});
  assert.deepEqual(valueOf(root), {});
});

test('empty array root exposes its empty container', () => {
  const root = array('', index => leaf(index));
  prime(root, []);
  assert.deepEqual(valueOf(root), []);
});

test('empty nested containers omit keys while an opt-out preserves them', () => {
  const root = buildSchema({ type: 'object', properties: { hidden: { type: 'object' }, kept: { type: 'object', options: { omitEmpty: false } } } }, { hidden: {}, kept: {} });
  assert.deepEqual(valueOf(root), { kept: {} });
});

test('empty leaf items retain JSON null positions', () => {
  const root = array('', index => leaf(index));
  prime(root, [undefined, 'x']);
  assert.deepEqual(valueOf(root), [null, 'x']);
});

test('empty branch items retain containers and trailing omission removes only the suffix', () => {
  const root = array('', index => object(index));
  prime(root, [{}, { a: 1 }, {}]);
  assert.deepEqual(valueOf(root), [{}, { a: 1 }, {}]);
  const trailing = array('', index => leaf(index));
  trailing.omitTrailing = true;
  prime(trailing, [undefined, 'x', undefined]);
  assert.deepEqual(valueOf(trailing), [null, 'x']);
});

test('clearing the final root field sends the empty object to onChange', () => {
  const root = object('');
  const child = attach(root, leaf('a'));
  prime(root, { a: 1 });
  let delivered;
  root.onChange = value => { delivered = value; };
  write(child, undefined);
  assert.deepEqual(delivered, {});
});
