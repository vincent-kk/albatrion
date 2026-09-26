/** Q8 boundary cases beyond the main comparison matrix. */
import assert from 'node:assert/strict';
import { buildSchema } from '../proto/build-v5.mjs';
import * as L from '../proto/loop-v5.mjs';
let checks = 0;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
L.setSwitches(L.NEW_SWITCHES);
for (const initial of [{}, { x: 'D' }]) {
  const root = buildSchema({ type: 'object', properties: {
    x: { default: 'D', '&clearValue': G => G.x === 'D' },
  } }, initial);
  eq(root.settle.status, 'stable', 'clear event does not retract itself when deletion falsifies its expression');
  eq(root.find('/x').raw, undefined, 'self-dependent clear leaves missing');
}
{
  const root = buildSchema({ type: 'object', properties: { on: {} }, allOf: [{
    '&active': G => G.on === true, properties: {
      group: { type: 'object', properties: { x: { default: 'D' } } },
    },
  }] }, { on: false });
  eq(root.find('/group/x').raw, undefined, 'inactive fragment descendants are not born');
  L.write(root.find('/on'), true);
  eq(root.find('/group/x').raw, 'D', 'activation creates descendants');
}
{
  const root = buildSchema({ type: 'object', properties: {
    clear: {}, group: { type: 'object', '&clearValue': G => G.clear === true,
      properties: { x: { default: 'D' } } },
  } }, { clear: false, group: { x: 'loaded' } });
  L.write(root.find('/clear'), true);
  eq(root.find('/group/x').raw, undefined, 'cleared object descendants are not refilled');
  eq(L.valueOf(root).group, undefined, 'cleared object emits no value');
}
{
  const root = buildSchema({ type: 'object', properties: {
    src: { '&injectTo': { to: '/group', map: () => ({}) } },
    group: { type: 'object', properties: { x: { default: 'D' } } },
  } }, { group: { x: 'loaded' } });
  L.write(root.find('/src'), 'edge');
  eq(root.find('/group/x').raw, undefined, 'automatic overwrite is not a caller load or fragment birth');
}
{
  const root = buildSchema({ type: 'object', properties: { kind: {} }, allOf: [{
    '&readOnly': true, if: { required: ['kind'], properties: { kind: { const: 'yes' } } },
    then: { properties: { a: { default: 'A' } } },
    else: { properties: { b: { default: 'B' } } },
  }] }, { kind: 'no' }, { dev: true });
  eq(L.valueOf(root), { kind: 'no', b: 'B' }, 'allOf false if activates else');
  eq(root.find('/b').controls.readOnly, true, 'outer fragment control reaches nested declaration');
  eq(root.warnings.length, 0, 'allOf does not require else:false');
}
for (const order of [['derived', 'injectTo', 'clearValue'], ['clearValue', 'injectTo', 'derived']]) {
  L.setSwitches({ ...L.NEW_SWITCHES, DERIVE_ORDER: order });
  const root = buildSchema({ type: 'object', properties: {
    src: {}, x: { default: 'D', '&derived': { from: '/src', map: v => v * 2 }, '&clearValue': true },
  } }, { src: 2, x: 'loaded' });
  eq(root.find('/x').raw, order[0] === 'derived' ? undefined : 4, 'stage order includes clearValue');
}
for (const combine of ['and-or', 'nearest']) {
  L.setSwitches({ ...L.NEW_SWITCHES, CONTROL_COMBINE: combine });
  const root = buildSchema({ type: 'object', disabled: true, properties: {
    x: { default: 'plain', '&default': () => 'alias', '&readOnly': true,
      control: { default: () => 'control', readOnly: false, disabled: false } },
  } }, {}, { form: { readOnly: true } });
  eq(root.find('/x').raw, 'control', 'control.default wins over &default and default');
  eq(root.find('/x').controls.readOnly, combine === 'and-or', 'Form readOnly participates');
  eq(root.find('/x').controls.disabled, combine === 'and-or', 'root disabled participates');
}
L.setSwitches(L.NEW_SWITCHES);
{
  const root = L.object('');
  const a = L.attach(root, L.leaf('a'));
  const b = L.attach(root, L.leaf('b'));
  L.declareDerived(root, [{ from: b, to: a, map: v => v + 1 }]);
  L.declareInjections(root, [...root.injections, { from: a, to: b, map: v => v + 1 }]);
  assert.throws(() => L.prime(root, { a: 0, b: 0 }, { dev: true }), /budget exceeded/); checks++;
  eq(L.valueOf(root), { a: 0, b: 0 }, 'dev throws after committing caller-only base');
  eq(root.dirty, false, 'dev failure leaves committed tree');
}
{
  const root = buildSchema({ type: 'object', properties: {
    group: { type: 'object', default: { x: 'parent' }, properties: { x: { default: 'child' } } },
  } }, {});
  eq(L.valueOf(root), { group: { x: 'parent' } }, 'object birth default runs before its child defaults');
}
{
  const schema = { type: 'object', properties: { on: {}, x: { default: 'base' } },
    allOf: [{ '&active': G => G.on === true, properties: { x: { '&default': () => 'fragment' } } }] };
  const root = buildSchema(schema, { on: true });
  eq(root.find('/x').raw, 'fragment', 'active expression default wins over base default');
  L.write(root.find('/x'), undefined);
  L.write(root.find('/on'), false); L.write(root.find('/on'), true);
  eq(root.find('/x').raw, undefined, 'an unconditional node does not become new when an overlay turns on');
}
console.log(JSON.stringify({ edgeCases: checks, passed: true }));
