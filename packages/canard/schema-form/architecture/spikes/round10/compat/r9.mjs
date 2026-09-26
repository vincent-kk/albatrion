/** Executable Q8 probes. Run from any directory: node path/to/round9/r9.mjs. */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import * as L from '../proto/loop-v6.mjs';
import { buildSchema, ajv } from '../proto/build-v6.mjs';
const rows = [];
let checks = 0;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
const record = (probe, facts) => rows.push({ probe, ...facts });
const state = root => ({ emit: L.valueOf(root), raw: L.rawTree(root), rounds: L.lastSettle.rounds,
  status: root.settle.status, budgetCommit: L.lastSettle.budgetCommit });
const switches = values => L.setSwitches({ ...L.NEW_SWITCHES, ...values });
const node = (root, name) => root.find('/' + name);
const write = (root, name, value) => L.write(node(root, name), value);
const condition = value => ({ required: ['kind'], properties: { kind: { const: value } } });

// P1: birth fill and presence (undefined alone is missing).
{
  switches({});
  const root = buildSchema({ type: 'object', properties: {
    kind: {}, base: { default: 'D', '&default': () => 'E' },
    absent: {}, empty: { default: 'D' }, nil: { default: 'D' }, zero: { default: 'D' }, no: { default: 'D' },
  }, if: condition('on'), then: { properties: { added: { default: 'A' } } },
  else: { properties: { fallback: { default: 'F' } } },
  }, { kind: 'off', empty: '', nil: null, zero: 0, no: false });
  eq(Object.hasOwn(root, 'selection'), false, 'no selector state');
  eq(Object.hasOwn(L, 'select'), false, 'no selector API');
  eq(node(root, 'base').raw, 'E', 'expression beats default');
  eq(node(root, 'added').raw, undefined, 'inactive fragment does not fill');
  eq(node(root, 'absent').raw, undefined, 'no source remains missing');
  eq(['empty', 'nil', 'zero', 'no'].map(k => node(root, k).raw), ['', null, 0, false], 'present values survive');
  const load = state(root);
  write(root, 'kind', 'on');
  eq(node(root, 'added').raw, 'A', 'activation fills');
  eq(node(root, 'fallback').raw, 'F', 'deactivation retains raw');
  write(root, 'added', undefined);
  write(root, 'base', 'manual');
  eq(node(root, 'added').raw, undefined, 'no refill on later write');
  write(root, 'kind', 'off'); write(root, 'kind', 'on');
  eq(node(root, 'added').raw, 'A', 'a new activation is another birth');
  record('P1-fill', { load, reactivated: state(root) });
}

// P2: clear edge keeps input; a held true condition does not erase later input.
{
  const root = buildSchema({ type: 'object', properties: {
    clear: {}, note: {}, x: { default: 'D', '&clearValue': G => G.clear === true },
  } }, { clear: false });
  write(root, 'clear', true);
  eq(node(root, 'x').raw, undefined, 'clear removes raw');
  eq(node(root, 'x').controls.active && node(root, 'x').controls.visible, true, 'input stays');
  const cleared = state(root);
  write(root, 'note', 'n');
  eq(node(root, 'x').raw, undefined, 'clear does not refill');
  write(root, 'x', 'typed');
  eq(node(root, 'x').raw, 'typed', 'held true is not an edge');
  write(root, 'clear', false); write(root, 'clear', true);
  eq(node(root, 'x').raw, undefined, 'second rising edge clears');
  const secondEdge = state(root);
  const initialTrue = buildSchema({ type: 'object', properties: {
    x: { default: 'D', '&clearValue': true },
  } }, {});
  eq(node(initialTrue, 'x').raw, undefined, 'clear suppresses birth fill in same settle');
  record('P2-clear', { cleared, secondEdge, initialTrue: state(initialTrue) });
}

// P3: validator alone interprets if; form never scores pure union branches.
for (const keyword of ['oneOf', 'anyOf']) {
  for (const withElse of [true, false]) {
    const branches = ['a', 'b'].map(kind => ({ if: condition(kind),
      then: { properties: { [kind]: { default: kind.toUpperCase() } }, required: [kind] },
      ...(withElse ? { else: false } : {}) }));
    const schema = { type: 'object', properties: { kind: {} }, [keyword]: branches };
    const root = buildSchema(schema, { kind: 'a' }, { dev: true });
    eq(L.valueOf(root), { kind: 'a', a: 'A' }, 'same form shape with or without else:false');
    eq(root.warnings.length, withElse ? 0 : 2, 'warning count');
    eq(branches.every(b => Object.hasOwn(b, 'else')), withElse, 'schema is not repaired');
    const validate = ajv.compile(schema);
    const validation = [{ kind: 'a', a: 'A' }, { kind: 'a' }, { kind: 'z' }].map(v => validate(v));
    eq(validation, withElse ? [true, false, false] : keyword === 'oneOf' ? [false, true, false] : [true, true, true], 'vacuous branch validation');
    record('P3-branches', { keyword, withElse, warnings: root.warnings, validation, ...state(root) });
  }
  const pure = buildSchema({ type: 'object', [keyword]: [
    { properties: { a: { const: 'a', default: 'A' } } },
    { properties: { b: { enum: ['b'], default: 'B' } } },
  ] }, {});
  eq(L.valueOf(pure), { a: 'A', b: 'B' }, 'const/enum do not control UI');
  record('P3-pure', { keyword, active: L.activeIds(pure), ...state(pure) });
}

// P4: root, Form, fragment, direct-child and local scopes under both combiners.
for (const combine of ['and-or', 'nearest']) {
  switches({ CONTROL_COMBINE: combine });
  const root = buildSchema({ type: 'object', readOnly: true,
    '&children': { x: { '&readOnly': true, '&disabled': true, '&visible': false },
      y: { '&active': false }, group: { '&readOnly': true } },
    properties: { on: {}, y: { default: 'Y', '&active': true },
      group: { type: 'object', properties: { nested: { default: 'N', '&readOnly': false } } } },
    allOf: [{ '&active': G => G.on === true, '&readOnly': true, '&visible': false,
      properties: { x: { default: 'X', '&readOnly': false, '&disabled': false, '&visible': true },
        z: { default: 'Z' } } }],
  }, { on: true }, { form: { disabled: true } });
  const x = node(root, 'x'), y = node(root, 'y'), z = node(root, 'z');
  eq(x.controls, combine === 'and-or' ? { active: true, visible: false, readOnly: true, disabled: true }
    : { active: true, visible: true, readOnly: false, disabled: false }, 'scope combination');
  eq(y.controls.active, combine === 'nearest', 'active AND versus nearest');
  eq(z.controls.visible, false, 'fragment control covers every declaration');
  eq(L.valueOf(root).z, 'Z', 'visible false still emits');
  eq(L.valueOf(root).y, combine === 'nearest' ? 'Y' : undefined, 'active false only projects away');
  eq(node(root, 'y').raw, combine === 'nearest' ? 'Y' : undefined, 'shape gate prevents inactive load fill');
  const before = { x: { ...x.controls }, y: { ...y.controls }, z: { ...z.controls },
    nested: { ...root.find('/group/nested').controls }, ...state(root) };
  write(root, 'on', false);
  eq(L.valueOf(root).x, undefined, 'fragment gate hides even nearest local true');
  eq(x.raw, 'X', 'fragment off does not erase');
  record('P4-controls', { combine, before, after: state(root) });
}

// P5: own dependency edge and own-value edge compete for the same target.
for (const conflict of ['last', 'first']) {
  for (const order of [['derived', 'injectTo', 'clearValue'], ['injectTo', 'derived', 'clearValue']]) {
    switches({ WRITE_CONFLICT: conflict, DERIVE_ORDER: order });
    const root = buildSchema({ type: 'object', properties: {
      dep: {}, src: { '&injectTo': { to: '/target', map: v => `I:${v}` } },
      target: { '&derived': { from: '/dep', map: v => `D:${v}` } },
    } }, { dep: 1, src: 2 });
    const expected = (conflict === 'last') === (order[0] === 'derived') ? 'I:2' : 'D:1';
    eq(node(root, 'target').raw, expected, 'same-target winner');
    eq(root.settle.status, 'stable', 'losing writer does not oscillate');
    const load = state(root);
    write(root, 'target', 'manual'); write(root, 'dep', 1);
    eq(node(root, 'target').raw, 'manual', 'same-value dependency is not an edge');
    write(root, 'dep', 3);
    eq(node(root, 'target').raw, 'D:3', 'dependency change derives own value');
    record('P5-conflict', { conflict, order, expected, load, changedDependency: state(root) });
  }
}

// P6: per-load suppression covers all reserved writes, including ordinary default.
{
  switches({});
  const schema = { type: 'object', properties: { src: {
    '&injectTo': { to: '/injected', map: v => v * 10 } },
    filled: { default: 'D' }, expression: { '&default': () => 'E' },
    derived: { '&derived': { from: '/src', map: v => v * 2 } },
    injected: {}, clear: {}, erased: { '&clearValue': G => G.clear === true },
    hidden: { '&active': false }, on: {},
  }, allOf: [{ '&active': G => G.on === true, properties: { later: { default: 'L' } } }] };
  const input = { src: 2, derived: 90, injected: 80, erased: 'loaded', clear: true, hidden: 'raw', on: false };
  const root = buildSchema(schema, input, { disableAutomaticWrites: true });
  eq(node(root, 'filled').raw, undefined, 'suppressed default');
  eq(node(root, 'expression').raw, undefined, 'suppressed expression default');
  eq(node(root, 'derived').raw, 90, 'suppressed derived');
  eq(node(root, 'injected').raw, 80, 'suppressed injectTo');
  eq(node(root, 'erased').raw, 'loaded', 'suppressed clear keeps caller data');
  eq(L.valueOf(root).hidden, undefined, 'suppression does not disable projection');
  const load = state(root);
  write(root, 'src', 3); write(root, 'on', true);
  eq(node(root, 'derived').raw, 6, 'runtime derives after suppressed load');
  eq(node(root, 'injected').raw, 30, 'runtime injection resumes');
  eq(node(root, 'later').raw, 'L', 'later activation fills');
  eq(node(root, 'filled').raw, undefined, 'suppressed birth is not retried');
  L.reset(root, { disableAutomaticWrites: false });
  eq(node(root, 'filled').raw, 'D', 'per-load enable overrides Form default');
  eq(node(root, 'erased').raw, 'loaded', 'true held across reset has no rising edge');
  record('P6-suppression', { load, enabledReset: state(root) });
}

// P7: unbounded derived/injectTo feedback, dry-run at cap, B versus last round.
for (const commit of ['base', 'lastRound']) {
  for (const cap of [5, 6, 25]) {
    switches({ COMMIT_ON_BUDGET: commit, ROUND_CAP: cap });
    const root = buildSchema({ type: 'object', properties: {
      a: { '&derived': { from: '/b', map: v => v + 1 }, '&injectTo': { to: '/b', map: v => v + 1 } }, b: {},
    } }, { a: 0, b: 0 });
    eq(root.settle.status, 'budget-exceeded', 'feedback exhausts budget');
    eq(L.lastSettle.rounds, cap, 'exact round budget');
    eq(L.valueOf(root), commit === 'base' ? { a: 0, b: 0 } : { a: cap - 1, b: cap - 1 }, 'committed raw');
    eq(L.valueOf(root), L.rawTree(root), 'emit matches committed raw');
    eq(L.lastSettle.autoAtCommit.length, commit === 'base' ? 0 : 2, 'retained automatic writes');
    record('P7-budget', { commit, cap, auto: L.lastSettle.autoAtCommit, ...state(root) });
  }
}
switches({});
rows.push({ summary: { checks, rows: rows.length, passed: true } });
const output = rows.map(row => JSON.stringify(row)).join('\n') + '\n';
writeFileSync(new URL('./r9-output.txt', import.meta.url), output);
console.log(output.trimEnd());
