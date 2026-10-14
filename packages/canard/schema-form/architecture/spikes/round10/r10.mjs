/** Fixed policy matrix. Run `node r10.mjs`; writes only round10 results. */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { isDeepStrictEqual as equal } from 'node:util';
import * as L from './proto/loop-v6.mjs';
import { buildSchema } from './proto/build-v6.mjs';
const rows = [];
let checks = 0;
const check = (condition, message) => { checks++; assert.ok(condition, message); };
const encode = value => value === undefined ? { missing: true } : { value };
const targetValue = (root, path) => root.find(path).raw;
const dimensions = {
  CLEAR_PRIORITY: ['clear-wins', 'clear-loses'],
  WRITE_CONFLICT: ['inject-wins', 'derived-wins', 'declaration-order'],
  LOSER_FATE: ['dropped', 'requeued'],
  EDGE_CONSUMED_ON_LOSS: [true, false],
  LOAD_EDGE_CLEAR: ['rising', 'held'],
};
const configurations = Object.entries(dimensions).reduce((all, [key, values]) =>
  all.flatMap(row => values.map(value => ({ ...row, [key]: value }))), [{}]);
const baseline = { ...L.NEW_SWITCHES, EXPERIMENT: true, ROUND_CAP: 25 };

function schemaFor(probe, reverse = false) {
  const inject = { '&injectTo': { to: '/t', map: value => value === undefined ? undefined : 'I:' + value } };
  const derived = { '&derived': { from: '/b', map: value => value === undefined ? undefined : 'D:' + value } };
  const clear = { '&clearValue': G => G.flag === true };
  if (probe === 'P1' || probe === 'P7') return { type: 'object', properties: Object.fromEntries(
    reverse ? [['t', derived], ['b', {}], ['a', inject]] : [['a', inject], ['b', {}], ['t', derived]]) };
  if (probe === 'P2') return { type: 'object', properties: { b: {}, flag: {}, t: { ...derived, ...clear } } };
  if (probe === 'P3') return { type: 'object', properties: { a: inject, flag: {}, t: clear } };
  if (probe === 'P4') return { type: 'object', properties: {
    a: { '&injectTo': { to: '/t', map: v => v === undefined ? undefined : 'A:' + v } },
    c: { '&injectTo': { to: '/t', map: v => v === undefined ? undefined : 'C:' + v } },
    t: { '&injectTo': { to: '/u', map: v => v === undefined ? undefined : 'U:' + v } }, u: {}, note: {},
  } };
  if (probe === 'P5' || probe === 'P6') return { type: 'object', properties: { flag: {}, x: clear } };
  return { type: 'object', properties: {
    a: { '&injectTo': { to: '/t', map: v => v === undefined ? undefined : v + 1 } },
    t: { ...clear, '&injectTo': { to: '/a', map: v => v === undefined ? undefined : v + 1 } }, flag: {},
  } };
}

function capture(root, context, step, phase, callers) {
  const trace = L.experimentTrace(root);
  const budget = root.settle.status === 'budget-exceeded';
  const losses = [];
  for (const offer of trace.offers) {
    if (equal(encode(targetValue(root, offer.target)), offer.value)) continue;
    let reason = null;
    if (budget) reason = 'budget-base';
    else if (offer.superseded) reason = 'newer-source-edge';
    else if (offer.dropped) reason = 'documented-loser-drop';
    else if (offer.appliedRound !== null && trace.offers.some(other => other.target === offer.target &&
      other.appliedRound !== null && other.appliedRound > offer.appliedRound)) reason = 'later-round-write';
    losses.push({ origin: 'author', offer: offer.id, target: offer.target, expected: offer.value, reason,
      silent: reason === null });
  }
  for (const [name, value] of Object.entries(callers)) {
    const path = '/' + name;
    if (!root.find(path) || equal(encode(targetValue(root, path)), encode(value))) continue;
    const overriding = trace.offers.find(offer => offer.target === path && offer.appliedRound !== null);
    const reason = budget ? 'budget-base' : overriding ? 'reserved-author-write' : null;
    losses.push({ origin: 'caller', target: path, expected: encode(value), reason, silent: reason === null });
  }
  const row = { id: `${context.configId}/${context.probe}/${context.variant}/${context.schedule}/${step}`,
    ...context, step, phase, rounds: L.lastSettle.rounds, status: root.settle.status,
    budgetCommit: L.lastSettle.budgetCommit,
    raw: Object.fromEntries(context.targets.map(path => [path, encode(targetValue(root, path))])),
    batchVsSequential: null, declarationOrderDifferent: null,
    silentWriteLosses: losses.filter(loss => loss.silent).length,
    explainedWriteLosses: losses.filter(loss => !loss.silent).length, losses, ...trace };
  rows.push(row);
  if (context.probe === 'P6') check(root.find('/x').raw === 'v', row.id + ': suppression preserves x');
  if (context.probe === 'P5') check(root.find('/x').raw ===
    (step === 'load' || context.switches.LOAD_EDGE_CLEAR === 'rising' ? undefined : 'v'), row.id + ': clear load semantics');
  return row;
}

function scheduled(configId, switches, probe, variant = 'forward') {
  for (const schedule of ['batch', 'left-right', 'right-left']) {
    L.setSwitches({ ...baseline, ...switches });
    const left = probe === 'P2' || probe === 'P3' ? 'flag' : 'a';
    const right = probe === 'P3' ? 'a' : probe === 'P4' ? 'c' : 'b';
    const initial = probe === 'P2' ? { b: 1, flag: false, t: 'orig' } :
      probe === 'P3' ? { a: 1, flag: false, t: 'orig' } :
        probe === 'P4' ? { a: 1, c: 1, t: 'orig', u: 'orig-u' } : { a: 1, b: 1, t: 'orig' };
    const root = buildSchema(schemaFor(probe, variant === 'reverse'), initial);
    const context = { configId, switches, probe, variant, schedule,
      targets: probe === 'P4' ? ['/t', '/u'] : ['/t'] };
    capture(root, context, 'load', null, initial);
    const changes = { [left]: left === 'flag' ? true : 2, [right]: 2 };
    if (schedule === 'batch') {
      L.batch(root, () => { for (const [key, value] of Object.entries(changes)) L.write(root.find('/' + key), value); });
      capture(root, context, 'pair', 'pair', changes);
    } else {
      const keys = schedule === 'left-right' ? [left, right] : [right, left];
      L.write(root.find('/' + keys[0]), changes[keys[0]]);
      capture(root, context, 'first', null, { [keys[0]]: changes[keys[0]] });
      L.write(root.find('/' + keys[1]), changes[keys[1]]);
      capture(root, context, 'pair', 'pair', { [keys[1]]: changes[keys[1]] });
    }
    if (probe === 'P4') {
      L.write(root.find('/c'), 3);
      capture(root, context, 'c-next', 'c-next', { c: 3 });
      L.write(root.find('/note'), 'idle');
      capture(root, context, 'idle', 'idle', { note: 'idle' });
    }
  }
}

for (const [index, switches] of configurations.entries()) {
  const configId = 'C' + String(index).padStart(2, '0');
  for (const probe of ['P1', 'P2', 'P3', 'P4']) scheduled(configId, switches, probe);
  for (const variant of ['forward', 'reverse']) scheduled(configId, switches, 'P7', variant);
  for (const probe of ['P5', 'P6']) {
    if (probe === 'P6' && switches.LOAD_EDGE_CLEAR !== 'rising') continue;
    L.setSwitches({ ...baseline, ...switches });
    const initial = { flag: true, x: 'v' };
    const options = { disableAutomaticWrites: probe === 'P6' };
    const root = buildSchema(schemaFor(probe), initial, options);
    const context = { configId, switches, probe, variant: 'forward', schedule: 'load-reset-replace', targets: ['/x'] };
    capture(root, context, 'load', null, initial);
    L.reset(root, options);
    capture(root, context, 'reset', null, initial);
    L.setValue(root, { ...initial }, options);
    capture(root, context, 'replace', null, initial);
  }
  L.setSwitches({ ...baseline, ...switches });
  const root = buildSchema(schemaFor('P8'), { a: 0, t: 0, flag: true });
  const context = { configId, switches, probe: 'P8', variant: 'forward', schedule: 'feedback', targets: ['/a', '/t'] };
  capture(root, context, 'load', null, { a: 0, t: 0, flag: true });
  L.batch(root, () => { L.write(root.find('/flag'), false); L.write(root.find('/a'), 2); L.write(root.find('/t'), 2); });
  capture(root, context, 'feedback', null, { a: 2, t: 2, flag: false });
}

const groups = new Map();
for (const row of rows.filter(row => row.phase !== null)) {
  const key = [row.configId, row.probe, row.variant, row.phase].join('/');
  const group = groups.get(key) ?? [];
  group.push(row); groups.set(key, group);
}
for (const group of groups.values()) {
  const batch = group.find(row => row.schedule === 'batch');
  const differs = group.some(row => !equal(row.raw, batch.raw) || row.status !== batch.status);
  for (const row of group) row.batchVsSequential = differs;
}

const p7 = rows.filter(row => row.probe === 'P7' && row.step === 'pair');
const firstWinner = row => {
  const first = row.attempts.find(attempt => attempt.round === 1 && attempt.won &&
    row.offers.find(offer => offer.id === attempt.offer).target === '/t');
  return first ? row.offers.find(offer => offer.id === first.offer).kind : null;
};
for (const row of p7) {
  const other = p7.find(other => other.configId === row.configId && other.schedule === row.schedule && other.variant !== row.variant);
  row.declarationOrderDifferent = !equal(row.raw, other.raw) || row.status !== other.status;
  if (row.schedule !== 'batch') continue;
  const expected = row.switches.WRITE_CONFLICT === 'inject-wins' ? 'injectTo' :
    row.switches.WRITE_CONFLICT === 'derived-wins' ? 'derived' : row.variant === 'forward' ? 'derived' : 'injectTo';
  check(firstWinner(row) === expected, row.id + ': P7 first collision follows schema declaration order');
  if (row.switches.WRITE_CONFLICT !== 'declaration-order') check(!row.declarationOrderDifferent, row.id + ': fixed priority ignores schema order');
}

function summarize(selected) {
  return { outcomes: selected.length, budgetExceeded: selected.filter(row => row.status === 'budget-exceeded').length,
    silentWriteLosses: selected.reduce((sum, row) => sum + row.silentWriteLosses, 0),
    explainedWriteLosses: selected.reduce((sum, row) => sum + row.explainedWriteLosses, 0),
    scheduleComparable: selected.filter(row => row.batchVsSequential !== null).length,
    scheduleDependent: selected.filter(row => row.batchVsSequential === true).length,
    declarationComparable: selected.filter(row => row.declarationOrderDifferent !== null).length,
    declarationDependent: selected.filter(row => row.declarationOrderDifferent === true).length,
    orderDependent: selected.filter(row => row.batchVsSequential === true || row.declarationOrderDifferent === true).length };
}
const summary = [{ scope: 'all', combinations: configurations.length, checks, ...summarize(rows) }];
for (const [key, values] of Object.entries(dimensions)) for (const value of values)
  summary.push({ scope: 'switch', key, value, ...summarize(rows.filter(row => row.switches[key] === value)) });
for (const probe of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'])
  summary.push({ scope: 'probe', probe, ...summarize(rows.filter(row => row.probe === probe)) });
const p7Exceptions = p7.filter(row => row.variant === 'forward' && row.schedule === 'batch' &&
  row.switches.WRITE_CONFLICT === 'declaration-order' && !row.declarationOrderDifferent);
summary.push({ scope: 'P7-final-raw-exceptions', rows: p7Exceptions.map(row => row.id), count: p7Exceptions.length,
  reason: 'unconsumed losing inject edge retries after the derived winner, so final raw can coincide while first winners differ' });
const metadata = { schema: 'round10-v1', base: '../round9/proto/loop-v5.mjs', derived: 'proto/loop-v6.mjs',
  defaultSwitches: baseline, dimensions, schedules: { left: 'P1/P4/P7:a; P2/P3:flag', right: 'P1/P2/P7:b; P3:a; P4:c' },
  units: { outcome: 'one committed settle', silentWriteLoss: 'one caller/author offer absent from committed raw without a recorded rule explanation',
    orderDependent: 'one comparable terminal outcome differing in raw or status across schedules or declaration variants' } };
writeFileSync(new URL('./r10-output.txt', import.meta.url), ['META ' + JSON.stringify(metadata),
  ...rows.map(row => 'ROW ' + JSON.stringify(row)), ...summary.map(row => 'SUMMARY ' + JSON.stringify(row))].join('\n') + '\n');
console.log(JSON.stringify({ ...summary[0], p7FinalRawExceptions: p7Exceptions.length }));
