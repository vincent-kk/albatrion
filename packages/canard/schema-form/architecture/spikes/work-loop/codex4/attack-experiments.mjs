/** Loaded by run.mjs; attacks A2/A4-A8 and ports the three requested nullable assertions. */
import assert from 'node:assert/strict';
import { WorkLoop } from './WorkLoop.mjs';

export function attackExperiments(ajv, record, verdict) {
  {
    const schema = { properties: { on: {} }, if: { required: ['on'], properties: { on: { const: true } } }, then: { properties: { x: { default: 'D' } } } };
    const m = new WorkLoop(schema, ajv).replace({ on: true }); const first = m.settle();
    const cleared = m.write('x', undefined).settle(); m.write('on', false).settle(); const reactivated = m.write('on', true).settle();
    assert.deepEqual(cleared.emit, { on: true }); assert.equal(reactivated.emit.x, 'D');
    const disabled = new WorkLoop(schema, ajv, { disableDefaultInjection: true }).replace({ on: true });
    const load = disabled.settle(), unchanged = disabled.write('on', true).settle(); disabled.write('on', false).settle(); const transition = disabled.write('on', true).settle(), reset = disabled.reset().settle();
    assert.equal(load.emit.x, undefined); assert.equal(unchanged.emit.x, undefined); assert.equal(transition.emit.x, 'D'); assert.equal(reset.emit.x, undefined);
    record('A2-transition-disable', { first: first.emit, cleared: cleared.emit, reactivated: reactivated.emit, disabled: { load: load.emit, sameBranchWrite: unchanged.emit, transition: transition.emit, reset: reset.emit } });
  }
  {
    const schema = { properties: { go: {} }, allOf: [
      { if: { required: ['go'] }, then: { properties: { x: { default: 'first' } } } },
      { if: { required: ['go'] }, then: { properties: { x: { default: 'last' } } } },
    ] };
    const m = new WorkLoop(schema, ajv).replace({ go: true }); const r = m.settle();
    assert.equal(r.emit.x, 'last');
    record('A2-default-conflict', { input: { go: true }, emit: r.emit, rounds: r.rounds.length });
  }
  {
    const schema = { properties: { kind: { default: 'a' } }, if: { required: ['kind'], properties: { kind: { const: 'a' } } }, then: { properties: { x: { default: 'X' } } } };
    const fresh = new WorkLoop(schema, ajv).replace({}).settle();
    const m = new WorkLoop(schema, ajv).replace({ kind: 'a', x: 'old' }); m.settle(); const replaced = m.replace({}).settle();
    assert.deepEqual(fresh.emit, { kind: 'a', x: 'X' }); assert.deepEqual(replaced.emit, { kind: 'a' });
    const eager = new WorkLoop(schema, ajv).replace({ kind: 'a', x: 'old' }); eager.settle(); eager.replace({}); eager.children.kind.raw = 'a'; const eagerResult = eager.settle();
    assert.deepEqual(eagerResult.emit, { kind: 'a', x: 'X' });
    record('A2-load-scheduling', { schema, input: {}, fresh: fresh.emit, previouslyActive: replaced.emit, eagerUnconditionalDefaultBeforeFirstCompute: eagerResult.emit, interpretation: 'model i defaults apply after first shape computation; spec has no explicit i phase in A3; eager alternative is diagnostic' });
  }
  {
    const schema = { properties: { x: { 'x-omitEmpty': true }, tail: { 'x-omitTrailing': true } }, allOf: [
      { if: { required: ['x'] }, then: { properties: { y: { default: 'visible' } } } },
      { if: { properties: { tail: { minItems: 2 } }, required: ['tail'] }, then: { properties: { z: { default: 'long' } } } },
    ] };
    const r = new WorkLoop(schema, ajv).replace({ x: '', tail: ['a', null] }).settle();
    assert.deepEqual(r.emit, { tail: ['a'] });
    record('A4-projected-guards', { input: { x: '', tail: ['a', null] }, local: r.local, emit: r.emit, trace: r.trace });
  }
  {
    const schema = { type: ['object', 'null'], properties: { kind: { default: 'a' } }, if: { required: ['kind'] }, then: { properties: { detail: { default: 'D' } } } };
    const cases = [null, 17].map((input) => { const r = new WorkLoop(schema, ajv).replace(input).settle(); return { input, emit: r.emit, local: r.local, trace: r.trace, ajv: verdict(schema, r.emit) }; });
    assert.equal(cases[0].ajv.valid, true); assert.equal(cases[1].ajv.valid, false); assert(cases.every((c) => c.trace.every((t) => !t.enabled)));
    const guard = ajv.compile(schema.if); assert.equal(guard(null), true); assert.equal(guard({}), false);
    record('A4-host-exception-A5-type', { cases, guardOnNull: guard(null), guardOnEmpty: guard({}) });
  }
  {
    const schema = { properties: { addr: { type: ['object', 'null'], oneOf: [
      { properties: { kind: { const: 'a' }, a: {} } }, { properties: { kind: { const: 'b' }, b: {} } },
    ] } }, if: { required: ['addr'], properties: { addr: { required: ['kind'] } } }, then: { properties: { lifted: { default: true } } } };
    const m = new WorkLoop(schema, ajv).replace({ addr: null }); const nil = m.settle(), blank = m.replace({ addr: {} }).settle();
    assert.deepEqual(nil.emit, { addr: null, lifted: true });
    assert(!nil.children.addr.active.some((id) => id.includes('/union/')));
    assert.equal(blank.children.addr.active.filter((id) => id.includes('/union/')).length, 1);
    record('A4-lifted-null-nested-union', { nullInput: { addr: null }, nullEmit: nil.emit, childActive: nil.children.addr.active, blankEmit: blank.emit, blankActive: blank.children.addr.active, guardOnParent: verdict(schema.if, { addr: null }) });
  }
  {
    const schema = { properties: { on: {}, child: { type: 'object', properties: { own: { default: 'O' } } } }, if: { required: ['on'], properties: { on: { const: true } } }, then: { properties: { child: { properties: { extra: { default: 'E' } } } } } };
    const m = new WorkLoop(schema, ajv).replace({ on: false, child: {} }); const off = m.settle(), on = m.write('on', true).settle(), offAgain = m.write('on', false).settle();
    assert.deepEqual(on.emit, { on: true, child: { own: 'O', extra: 'E' } }); assert.deepEqual(offAgain.emit.child, { own: 'O' }); assert.equal(offAgain.state.children.child.children.extra, 'E');
    record('A4-inherited-overlay', { schema, off: off.emit, on: on.emit, offAgain: offAgain.emit, retained: offAgain.state.children.child });
  }
  {
    const schema = { properties: { child: { type: 'object' } }, if: { not: { required: ['child'], properties: { child: { required: ['x'] } } } }, then: { properties: { child: { properties: { x: { default: 1 } } } } } };
    const r = new WorkLoop(schema, ajv).replace({ child: { x: 1 } }).settle();
    assert.equal(r.settle.status, 'budget-exceeded');
    record('A4-overlay-feedback', { schema, input: { child: { x: 1 } }, emit: r.emit, settle: r.settle, trace: r.trace });
  }
  {
    const schema = { properties: { gate: {} }, if: { properties: { gate: { const: true } }, required: ['gate'] }, then: { if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } } } } };
    const m = new WorkLoop(schema, ajv).replace({ gate: false, x: 1 }); const off = m.settle(), on = m.write('gate', true).settle();
    assert(!off.active.some((x) => x.endsWith('/then/then'))); assert.equal(on.settle.status, 'budget-exceeded');
    record('A4-nested-parent-cap', { off: { emit: off.emit, active: off.active }, on: { emit: on.emit, settle: on.settle } });
  }
  {
    const schema = { type: 'object', properties: { x: false }, not: { required: ['y'] }, additionalProperties: false };
    const m = new WorkLoop(schema, ajv).replace({ x: 1, y: 2 }); const before = m.settle();
    assert.deepEqual(Object.keys(m.children), []); assert.deepEqual(before.emit, { x: 1, y: 2 });
    const errors = verdict(schema, before.emit); m.removeKey('x').settle(); const removed = m.removeKey('y').settle();
    assert.deepEqual(removed.emit, {}); assert.equal(verdict(schema, removed.emit).valid, true);
    record('A8-residual-remove', { input: { x: 1, y: 2 }, extras: before.state.extras, errors, removed: removed.emit });
  }
  {
    const schema = { type: 'object', not: { required: ['a', 'b'] } };
    const input = { a: 1, b: 2 }, result = verdict(schema, input);
    assert.equal(result.valid, false); assert.equal(result.errors[0].instancePath, ''); assert.deepEqual(result.errors[0].params, {});
    assert.equal(verdict(schema, { a: 1 }).valid, true); assert.equal(verdict(schema, { b: 2 }).valid, true);
    record('A8-root-error-ownership', { schema, input, result, removeAValid: true, removeBValid: true, missing: 'Ajv rejects a combination; no unique rejected key is identified' });
  }
  {
    const schema = { type: 'object', properties: { a: {} }, if: { required: ['a'] }, then: { properties: { b: {} } }, unevaluatedProperties: false };
    const r = new WorkLoop(schema, ajv).replace({ b: 'latent', extra: 7 }).settle();
    const validation = verdict(schema, r.emit);
    assert.deepEqual(r.emit, { extra: 7 }); assert.equal(r.state.children.b, 'latent');
    record('A8-latent-versus-extra', { input: { b: 'latent', extra: 7 }, emit: r.emit, raw: r.state, validation, rejectedKeys: validation.errors.map((e) => e.params.unevaluatedProperty).filter(Boolean) });
  }
  {
    const schema = { type: 'object', oneOf: [ { properties: { a: {} } }, { properties: { b: {} } } ] };
    const m = new WorkLoop(schema, ajv, { forceSelection: true }).replace({ b: 2 }); const initial = m.settle(), manual = m.settle({ selected: 0 }), reset = m.reset().settle();
    assert.equal(initial.state.selection, 1); assert.equal(reset.state.selection, 1); assert.deepEqual(reset.emit, { b: 2 });
    const noMatch = { type: 'object', oneOf: [{ required: ['a'], properties: { a: {} } }, { required: ['b'], properties: { b: {} } }] };
    const passing = noMatch.oneOf.map((s) => verdict(s, {}).valid);
    assert.deepEqual(passing, [false, false]);
    record('A7-selection-reset-no-match', { initial: { selection: initial.state.selection, emit: initial.emit }, manual: manual.emit, reset: reset.emit, noMatch: { input: {}, passing, decision: 'undefined by A7; model fallback 0 is not normative' }, oneOfValidation: verdict(schema, reset.emit) });
  }
  {
    const schema = { type: 'object', oneOf: [
      { required: ['kind', 'name'], properties: { kind: { const: 'a' }, name: { type: 'string', minLength: 3 } } },
      { required: ['kind', 'age'], properties: { kind: { const: 'b' }, age: { type: 'number' } } },
    ] };
    const input = { kind: 'a', name: 'x' }; const r = new WorkLoop(schema, ajv).replace(input).settle();
    const validation = verdict(schema, r.emit);
    const routed = validation.errors.map((e) => ({ ...e, target: e.schemaPath.startsWith('#/oneOf') ? '/kind' : e.instancePath }));
    assert(routed.some((e) => e.keyword === 'minLength' && e.target === '/kind'));
    record('A7-error-routing', { input, emit: r.emit, routed, interpretation: 'literal all branch-path errors; narrower const/oneOf-only reading is also possible' });
  }
  {
    const schema = { type: 'object', properties: { target: { type: ['object', 'null'], properties: { note: { type: 'string' }, reason: { type: 'string', default: 'because' } } } } };
    const initial = { target: { note: 'typed', reason: 'edited' } };
    const m = new WorkLoop(schema, ajv).replace(initial); m.settle(); const nil = m.replace({ target: null }).settle();
    const displayed = { note: m.children.target.children.note.raw ?? '', reason: m.children.target.children.reason.raw ?? '' };
    assert.deepEqual(nil.emit, { target: null }); assert.deepEqual(displayed, { note: '', reason: 'because' });
    record('nullable-L31', { initial, replace: { target: null }, emit: nil.emit, displayed, displayAdapter: 'undefined string raw -> empty input', assertion: 'PASS' });
    const promoted = m.write('target/note', 'again').settle();
    assert.deepEqual(promoted.emit, { target: { note: 'again', reason: 'because' } });
    record('nullable-L42', { input: 'target/note=again', emit: promoted.emit, assertion: 'PASS' });
    const noDefaults = new WorkLoop(schema, ajv, { disableDefaultInjection: true }).replace(initial); noDefaults.settle(); noDefaults.replace({ target: null }).settle();
    const disabled = noDefaults.write('target/note', 'again').settle();
    assert.deepEqual(disabled.emit, { target: { note: 'again' } });
    record('nullable-disabled', { emit: disabled.emit, assertion: 'default false prerequisite confirmed' });
    const clearing = new WorkLoop(schema, ajv).replace({ target: null }); clearing.settle();
    const cleared = clearing.write('target/reason', undefined).settle();
    assert.deepEqual(cleared.emit, { target: {} });
    record('nullable-L53-adjacent', { operation: 'clear target/reason -> undefined', actual: cleared.emit, productTestExpected: { target: null }, interpretation: 'clear is a partial write under literal A5' });
  }
  {
    // The product &if expressions are normalized to equivalent kind guards for the promotion/round-trip path.
    const target = { type: ['object', 'null'], properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' }, note: { type: 'string', default: 'N' } }, oneOf: [
      { properties: { kind: { const: 'a' }, aValue: { type: 'string' } } },
      { properties: { kind: { const: 'b' }, bValue: { type: 'string', default: 'B' } } },
    ] };
    const schema = { type: 'object', properties: { target } }, initial = { target: { kind: 'b', note: 'seeded', bValue: 'x' } };
    const m = new WorkLoop(schema, ajv).replace(initial); m.settle(); const nil = m.replace({ target: null }).settle();
    const promoted = m.write('target/note', 'typed').settle(); m.write('target/kind', 'a').settle(); const roundTrip = m.write('target/kind', 'b').settle();
    assert.deepEqual(roundTrip.emit, { target: { kind: 'b', note: 'typed', bValue: 'B' } });
    record('nullable-L148', { initial, nil: { emit: nil.emit, raw: nil.state.children.target }, promoted: promoted.emit, roundTrip: roundTrip.emit, assertion: 'PASS', translation: '&if ./kind === a|b -> normalized kind const guards; no React/&if parser exercised' });
  }
  {
    const decisions = [
      { name: 'typing', committedRaw: 'ab', reported: 'ab' },
      { name: 'inject-other', committedRaw: 'D', reported: 'old' },
      { name: 'blank-adapter', committedRaw: undefined, reported: '' },
      { name: 'unmounted', committedRaw: 'D', hasInput: false },
    ].map((x) => ({ ...x, refresh: x.hasInput === false ? 'undefined' : !Object.is(x.committedRaw, x.reported) }));
    assert.equal(decisions[0].refresh, false); assert.equal(decisions[1].refresh, true); assert.equal(decisions[2].refresh, true);
    record('A6-refresh', { decisions, input: 'external write to a never-mounted node, no reported input value exists', missing: 'snapshot lifetime, equality, absent-input semantics, normalization of clear' });
  }
  {
    const m = new WorkLoop({ properties: { a: {} } }, ajv).replace({ a: 1, extra: 1 }); const before = m.settle(), after = m.write('extra', 2).settle();
    assert.deepEqual(before.state.children, after.state.children); assert.notDeepEqual(before.emit, after.emit);
    record('A1-reference-extras', { before: before.emit, after: after.emit, childRawUnchanged: true, inference: 'immutable snapshot must change host emit reference despite unchanged child emits' });
  }
}
