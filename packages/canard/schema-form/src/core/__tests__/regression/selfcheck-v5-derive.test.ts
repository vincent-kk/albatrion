import { describe, expect, it, vi } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('selfcheck-v5 derive regression', () => {
  it('selfcheck-v5.mjs:274 ERROR-070 A4a commits caller raw after 25 feedback rounds', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      t: { type: 'number', controls: {
        injectTo: (value: unknown) => ({ '../u': Number(value) + 1 }),
      } },
      u: { type: 'number', controls: {
        injectTo: (value: unknown) => ({ '../t': Number(value) + 1 }),
      } },
    } });
    expect(() => root.setValue({ t: 0, u: 0 })).toThrow();
    expect(root.outputValue).toEqual({ t: 0, u: 0 });
    expect(root.diagnostics).toMatchObject({ status: 'degraded',
      exceededBudget: 'derive', iterations: 25 });
  });

  it('selfcheck-v5.mjs:285 FRAGMENT-050 29C-01 A4b keeps the birth-edge write after c retracts', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      t: { type: 'string' },
    }, allOf: [{ controls: { active: './t === undefined' }, properties: {
      c: { type: 'string', default: 'C', controls: {
        injectTo: (value: unknown) => ({ '../t': `from-${value}` }),
      } },
    } }] });
    root.setValue({});
    expect(root.outputValue).toEqual({ t: 'from-undefined' });
    expect(root.find('/c')).toBeNull();
    expect(root.diagnostics.status).toBe('stable');
  });

  it('selfcheck-v5.mjs:297 A4c unchanged source preserves a partial host edit', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      src: { type: 'string', controls: { injectTo: () => ({ '../host': 17 }) } },
      host: { type: 'object', properties: {
        a: { type: 'string' }, b: { type: 'string', default: 'BD' },
      } },
    } }, { snapshot: { src: 'go', host: { a: 'A', b: 'B' } } });
    root.resetSubtree();
    expect(root.find('/host/b')?.raw).toBe('BD');
    root.find('/host/a')?.setValue('A2');
    expect(root.outputValue).toEqual({ src: 'go', host: { a: 'A2', b: 'BD' } });
  });

  it('selfcheck-v5.mjs:493 A4-cap same-value source write costs one round', () => {
    const injectTo = vi.fn((value: unknown) => ({
      '../n': Math.min(30, Number(value) + 1),
    }));
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      n: { type: 'number', controls: { injectTo } },
    } });
    (Reflect.get(root, 'runtime') as { disableAutomaticWrites: boolean })
      .disableAutomaticWrites = true;
    root.setValue({ n: 0 });
    (Reflect.get(root, 'runtime') as { disableAutomaticWrites: boolean })
      .disableAutomaticWrites = false;
    injectTo.mockClear();
    root.find('/n')?.setValue(0);
    expect(root.outputValue).toEqual({ n: 0 });
    expect(injectTo).not.toHaveBeenCalled();
    expect(root.diagnostics.status).toBe('stable');
  });

  it('selfcheck-v5.mjs:504 VALUE-032 A6-automatic leaves a null host null', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      src: { type: 'string', controls: {
        injectTo: (value: unknown) => ({ '../host/note': `auto-${value}` }),
      } },
      host: { type: ['object', 'null'], properties: {
        note: { type: 'string' }, draft: { type: 'string' },
      } },
    } });
    root.setValue({ src: 'a', host: { note: 'typed' } });
    root.find('/host')?.setValue(null);
    root.find('/src')?.setValue('b');
    expect(root.find('/host')?.raw).toBeNull();
    expect(root.outputValue).toEqual({ src: 'b' });
  });

  const suppressedTree = (disabled: boolean) => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      id: { type: 'number' }, status: { type: 'string', default: 'pending' },
      kind: { type: 'string' },
    }, allOf: [{ controls: { active: './kind === "k"' }, properties: {
      x: { type: 'string', default: 'X' },
    } }] });
    (Reflect.get(root, 'runtime') as { disableAutomaticWrites: boolean })
      .disableAutomaticWrites = disabled;
    root.setValue({ id: 101 });
    return root;
  };

  it('selfcheck-v5.mjs:651 WRITE-015 suppresses default on a sparse load', () => {
    expect(suppressedTree(true).outputValue).toEqual({ id: 101 });
  });
  it('selfcheck-v5.mjs:653 WRITE-015 Form suppression persists on user activation', () => {
    const root = suppressedTree(true);
    root.find('/kind')?.setValue('k');
    expect(root.outputValue).toEqual({ id: 101, kind: 'k' });
  });
  it('selfcheck-v5.mjs:655 WRITE-015 ordinary load fills status', () => {
    expect(suppressedTree(false).outputValue).toEqual({ id: 101, status: 'pending' });
  });
  it('selfcheck-v5.mjs:657 WRITE-015 later suppressed root replacement injects nothing', () => {
    const root = suppressedTree(true);
    root.setValue({ id: 5, kind: 'k' });
    expect(root.outputValue).toEqual({ id: 5, kind: 'k' });
  });
});
