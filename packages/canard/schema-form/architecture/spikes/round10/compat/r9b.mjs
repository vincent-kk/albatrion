/** Spec section 7 corrections. Run directly or through regress/run.mjs. */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import * as L from '../proto/loop-v6.mjs';
import { buildSchema } from '../proto/build-v6.mjs';
const rows = [];
let checks = 0;
let failures = 0;
const eq = (actual, expected, label) => { checks++; assert.deepEqual(actual, expected, label); };
const missing = value => value === undefined ? '<missing>' : value;
const probe = (name, run) => {
  L.setSwitches(L.NEW_SWITCHES);
  try { rows.push({ probe: name, passed: true, ...run() }); }
  catch (error) { failures++; rows.push({ probe: name, passed: false, error: error.message }); }
};
const kindIsOn = { required: ['kind'], properties: { kind: { const: 'on' } } };

probe('a1', () => {
  const root = buildSchema({ type: 'object', properties: { a: {}, b: {} }, allOf: [
    { '&active': G => G.a === 1, properties: { x: { default: 'P' } } },
    { '&active': G => G.b === 1, properties: { x: { default: 'Q' } } },
  ] }, { a: 1 });
  const x = root.find('/x');
  eq(x.raw, 'P', 'a1 initial fill');
  L.write(x, undefined);
  L.write(root.find('/b'), 1);
  eq(x.raw, undefined, 'a1 not refilled: another fragment already held the node');
  // Switching which declaration holds the same node also preserves its lifetime.
  L.batch(root, () => { L.write(root.find('/a'), 0); L.write(root.find('/b'), 1); });
  eq(x.raw, undefined, 'a1 holder replacement is not a birth');
  return { initial: 'P', final: missing(x.raw), result: 'not refilled' };
});

for (const [name, body, unconditional] of [
  ['a2', {}, false], ['a3', null, true], ['a4', { default: 'B' }, false],
]) probe(name, () => {
  const root = buildSchema({ type: 'object', properties: { kind: {}, ...(body === null ? {} : { x: body }) },
    ...(unconditional ? { allOf: [{ properties: { x: { default: 'U' } } }] } : {}),
    if: kindIsOn, then: { properties: { x: { default: 'T' } } },
  }, { kind: 'off' });
  const x = root.find('/x');
  const initial = missing(x.raw);
  eq(x.raw, name === 'a2' ? undefined : name === 'a3' ? 'U' : 'B', name + ' initial value');
  L.write(x, undefined);
  L.write(root.find('/kind'), 'on');
  eq(x.raw, undefined, name + ' not refilled');
  return { initial, final: missing(x.raw), result: 'not refilled' };
});

for (const unit of ['shape', 'raw']) probe('node-gate-' + unit, () => {
  L.setSwitches({ ...L.NEW_SWITCHES, NODE_GATE_UNIT: unit });
  const root = buildSchema({ type: 'object', properties: {
    show: {}, note: {}, x: { '&active': G => G.show === true, default: 'D', '&default': () => 'E' },
  } }, { show: false });
  const x = root.find('/x');
  const load = missing(x.raw);
  eq(x.raw, unit === 'shape' ? undefined : 'E', unit + ' gate-false load');
  eq(L.valueOf(root).x, undefined, 'inactive value is not emitted');
  L.write(x, undefined);
  L.write(root.find('/show'), true);
  const activated = missing(x.raw);
  eq(x.raw, unit === 'shape' ? 'E' : undefined, unit + ' activation fill');
  L.write(x, undefined); L.write(root.find('/note'), 'unrelated');
  eq(x.raw, undefined, 'active node is not refilled');
  L.write(x, 'retained'); L.write(root.find('/show'), false);
  eq(L.rawTree(root).x, 'retained', 'inactive raw stays readable');
  eq(L.valueOf(root).x, undefined, 'inactive raw stays outside emit');
  L.write(root.find('/show'), true);
  eq(x.raw, 'retained', 'activation preserves existing raw');
  return { unit, load, activated, retained: x.raw };
});

probe('node-gate-default-and-subtree', () => {
  const root = buildSchema({ type: 'object', properties: { show: {},
    group: { type: 'object', '&active': G => G.show === true, properties: { x: { default: 'D' } } },
  } }, { show: false });
  eq(root.find('/group/x').raw, undefined, 'inactive ancestor prevents child fill');
  L.write(root.find('/show'), true);
  eq(root.find('/group/x').raw, 'D', 'ancestor activation creates descendant');
  L.write(root.find('/group/x'), undefined);
  L.write(root.find('/show'), false); L.write(root.find('/show'), true);
  eq(root.find('/group/x').raw, 'D', 'later lifetime fills missing descendant again');
  return { value: L.valueOf(root) };
});

for (const keyword of ['oneOf', 'anyOf']) probe('union-hint-' + keyword, () => {
  const schema = { type: 'object', [keyword]: [
    { properties: { kind: { const: 'a' }, x: {} } },
    { properties: { kind: { const: 'b' }, y: {} } },
  ] };
  const root = buildSchema(schema, { kind: 'b', y: 1 });
  const kind = root.find('/kind');
  eq(kind.raw, 'b', 'union keeps loaded b');
  eq(L.activeIds(root).length, 2, 'both pure branches exist');
  eq(kind.effectiveSchema, { branchConstraintsOmitted: true }, 'shared pure union omits branch constraints');
  eq(Object.hasOwn(kind.effectiveSchema, 'const'), false, 'no const:a hint for b');
  eq(schema[keyword][0].properties.kind.const, 'a', 'authored declaration stays unchanged');
  return { value: kind.raw, effectiveSchema: kind.effectiveSchema, active: L.activeIds(root) };
});

L.setSwitches(L.NEW_SWITCHES);
probe('final-shape-after-derived', () => {
  const root = buildSchema({ type: 'object', properties: {
    seed: {}, on: { '&derived': { from: '/seed', map: () => 0 } },
  }, allOf: [{ '&active': G => G.on === 1, properties: { x: { default: 'P' } } }] }, { seed: 1, on: 1 });
  eq(root.find('/x').shapePresent, false, 'derived removes x from final shape');
  eq(root.find('/x').raw, undefined, 'no intermediate fill survives final shape');
  eq(L.rawTree(root), { seed: 1, on: 0, x: undefined }, 'only converged values are committed');
  eq(L.valueOf(root), { seed: 1, on: 0 }, 'emit agrees with final shape');
  eq(L.lastSettle.birthsAtCommit.includes('/x'), false, 'x is not a confirmed birth');
  return { raw: L.rawTree(root), emit: L.valueOf(root), shapePresent: root.find('/x').shapePresent,
    births: L.lastSettle.birthsAtCommit, status: root.settle.status };
});

probe('final-shape-after-fill-dependency', () => {
  const root = buildSchema({ type: 'object', properties: {
    seed: { default: 1 }, on: { '&derived': { from: '/seed', map: value => value === 1 ? 0 : 1 } },
  }, allOf: [{ '&active': G => G.on === 1, properties: { x: { default: 'P' } } }] }, { on: 1 });
  eq(root.find('/x').shapePresent, false, 'fill dependency removes x from final shape');
  eq(root.find('/x').raw, undefined, 'provisional fill is absent at commit');
  eq(L.rawTree(root), { seed: 1, on: 0, x: undefined }, 'filled source still drives derived');
  eq(L.lastSettle.birthsAtCommit.includes('/x'), false, 'retracted candidate is not a birth');
  return { raw: L.rawTree(root), shapePresent: root.find('/x').shapePresent,
    births: L.lastSettle.birthsAtCommit, status: root.settle.status };
});

probe('final-shape-preserves-caller-raw', () => {
  const root = buildSchema({ type: 'object', properties: {
    seed: {}, on: { '&derived': { from: '/seed', map: () => 0 } },
  }, allOf: [{ '&active': G => G.on === 1, properties: { x: { default: 'P' } } }] }, { seed: 1, on: 1, x: 'caller' });
  eq(root.find('/x').raw, 'caller', 'final shape does not erase caller raw');
  eq(root.find('/x').shapePresent, false, 'caller x is inactive');
  eq(L.valueOf(root).x, undefined, 'caller raw is not emitted while inactive');
  return { raw: L.rawTree(root), emit: L.valueOf(root), shapePresent: root.find('/x').shapePresent };
});

probe('final-shape-feedback-budget', () => {
  L.setSwitches({ ...L.NEW_SWITCHES, ROUND_CAP: 8 });
  const root = buildSchema({ type: 'object', properties: { t: {} }, allOf: [
    { '&active': G => G.t === undefined, properties: {
      c: { default: 'C', '&injectTo': { to: '/t', map: value => value === undefined ? undefined : 'from-' + value } },
    } },
  ] }, {});
  eq(root.settle.status, 'budget-exceeded', 'contradictory fill feedback cannot stabilize');
  eq(root.find('/c').raw, undefined, 'base commit contains no provisional fill');
  eq(root.find('/t').raw, undefined, 'base commit contains no provisional injection');
  eq(L.lastSettle.birthsAtCommit, [], 'budget outcome does not confirm any birth');
  return { raw: L.rawTree(root), status: root.settle.status, rounds: L.lastSettle.rounds,
    births: L.lastSettle.birthsAtCommit, budgetCommit: L.lastSettle.budgetCommit };
});

L.setSwitches(L.NEW_SWITCHES);

rows.push({ summary: { checks, probes: rows.length, failures, passed: failures === 0 } });
const output = rows.map(row => JSON.stringify(row)).join('\n') + '\n';
if (process.argv.includes('--check-only') === false) writeFileSync(new URL('./r9b-output.txt', import.meta.url), output);
console.log(output.trimEnd());
process.exitCode = failures ? 1 : 0;
