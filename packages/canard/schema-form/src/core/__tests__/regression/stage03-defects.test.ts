import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../SchemaNode';
import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('stage 03 ledger adjudication regressions', () => {
  const selfNegatingGate = () => makeSchemaNodeTree({ type: 'object',
    if: { not: { required: ['x'] } }, then: { properties: {
      x: { type: 'number', default: 1 },
    }, required: ['x'] },
  }, { ifPredicate: () => input => input !== null && typeof input === 'object' &&
    !('x' in input) }).root;

  const expectSelfNegatingBudget = () => {
    const root = selfNegatingGate();
    expect(() => root.setValue({})).toThrow();
    expect(root.raw).toBeUndefined();
    expect(root.outputValue).toEqual({});
    expect(root.find('/x')?.raw).toBeUndefined();
    expect(root.diagnostics).toMatchObject({ status: 'degraded', cause: 'budget',
      exceededBudget: 'hostWheel', iterations: 2, commit: expect.any(Number) });
  };

  it('selfcheck-v5.mjs:220 commits Source B after a self-negating shape cycle in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    try { expectSelfNegatingBudget(); } finally { vi.unstubAllEnvs(); }
  });

  it('selfcheck-v5.mjs:227 throws after that commit in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    try { expectSelfNegatingBudget(); } finally { vi.unstubAllEnvs(); }
  });

  it('selfcheck-v5.mjs:399 revives only the edited child after a wrong-kind host write', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      host: { type: 'object', properties: {
        a: { type: 'string' }, b: { type: 'string', default: 'BD' },
      } },
    } });
    root.setValue({ host: { a: 'A', b: 'B', x: 'EXTRA' } });
    root.find('/host')?.setValue(17);
    root.find('/host/a')?.setValue('A2');
    expect(root.outputValue).toEqual({ host: { a: 'A2' } });
    expect(root.find('/host/b')?.raw).toBeUndefined();
  });

  it('selfcheck-v5.mjs:571 promotes a null host on a child input without refilling', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      target: { type: ['object', 'null'], properties: {
        note: { type: 'string' }, reason: { type: 'string', default: 'because' },
      } },
    } });
    root.setValue({ target: { note: 'typed', reason: 'edited' } });
    root.setValue({ target: null });
    root.find('/target/note')?.setValue('again');
    expect(root.outputValue).toEqual({ target: { note: 'again' } });
  });

  it('selfcheck-v5.mjs:599 fills a newly returning branch after null and child edits', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      target: { type: ['object', 'null'], properties: {
        kind: { type: 'string', default: 'a' },
        note: { type: 'string', default: 'N' },
      }, oneOf: [
        { properties: { aValue: { type: 'string' } },
          controls: { active: './kind === "a"' } },
        { properties: { bValue: { type: 'string', default: 'B' } },
          controls: { active: './kind === "b"' } },
      ] },
    } });
    root.setValue({ target: { kind: 'b', note: 'seeded', bValue: 'x' } });
    root.setValue({ target: null });
    root.find('/target/note')?.setValue('typed');
    root.find('/target/kind')?.setValue('a');
    root.find('/target/kind')?.setValue('b');
    expect(root.outputValue).toEqual({ target: {
      kind: 'b', note: 'typed', bValue: 'B',
    } });
  });

  it('selfcheck-v5.mjs:485 does not fill on a first non-load null write', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      kind: { type: 'string', default: 'cat' },
    }, allOf: [{ controls: { active: './kind === "cat"' }, properties: {
      meow: { type: 'boolean', default: true },
    } }] });
    root.setValue(null);
    expect(root.raw).toBeNull();
    expect(root.find('/kind')?.raw).toBeUndefined();
    expect(root.outputValue).toBeNull();
  });

  it('r8-port.mjs:392 preserves extras order across Merge writes', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'number' },
    } });
    root.setValue({ z: 1, a: 2, m: 3 });
    root.setValue({ q: 4 }, SetValueOption.Merge);
    expect(Object.keys(root.outputValue ?? {})).toEqual(['a', 'z', 'm', 'q']);
    root.setValue({ z: 9 }, SetValueOption.Merge);
    expect(Object.keys(root.outputValue ?? {})).toEqual(['a', 'z', 'm', 'q']);
  });

  it('selfcheck-v5.mjs:623 commits Source B after a mutual host gate cycle', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', allOf: [
      { if: {}, then: { properties: { y: { type: 'number' } } } },
      { if: {}, then: { properties: { x: { type: 'number' } } } },
    ] }, { ifPredicate: gate => input => gate.schemaPath.includes('allOf/0')
      ? input !== null && typeof input === 'object' && !('x' in input)
      : input !== null && typeof input === 'object' && 'y' in input });
    expect(() => root.setValue({ x: 1, y: 1 })).toThrow();
    expect(root.raw).toBeUndefined();
    expect(root.find('/x')?.raw).toBe(1);
    expect(root.find('/y')?.raw).toBe(1);
    expect(root.diagnostics).toMatchObject({ status: 'degraded', cause: 'budget',
      exceededBudget: 'hostWheel', commit: expect.any(Number) });
  });
});
