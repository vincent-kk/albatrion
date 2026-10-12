import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../SchemaNode';
import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const clearTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    clear: { type: 'boolean' }, note: { type: 'string' },
    x: { type: 'string', default: 'D', controls: { unsetValue: '../clear === true' } },
  } });
  root.setValue({ clear: false });
  root.find('/clear')?.setValue(true);
  return root;
};

const conflictTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    dep: { type: 'number' },
    src: { type: 'number', controls: {
      injectTo: (value: unknown) => ({ '../target': `I:${value}` }),
    } },
    target: { type: 'string', controls: { derived: '"D:" + ../dep' } },
  } });
  root.setValue({ dep: 1, src: 2 });
  return root;
};

const suppressionTree = () => {
  const initialInput = { src: 2, derived: 90, injected: 80,
    erased: 'loaded', clear: true, hidden: 'raw', on: false };
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    src: { type: 'number', controls: {
      injectTo: (value: unknown) => ({ '../injected': Number(value) * 10 }),
    } },
    filled: { type: 'string', default: 'D' },
    expression: { type: 'string', controls: { default: 'E' } },
    derived: { type: 'number', controls: { derived: '../src * 2' } },
    injected: { type: 'number' }, clear: { type: 'boolean' },
    erased: { type: 'string', controls: { unsetValue: '../clear === true' } },
    hidden: { type: 'string', controls: { active: false } },
    on: { type: 'boolean' },
  }, allOf: [{ controls: { active: './on === true' }, properties: {
    later: { type: 'string', default: 'L' },
  } }] }, { snapshot: initialInput });
  (Reflect.get(root, 'runtime') as { disableAutomaticWrites: boolean })
    .disableAutomaticWrites = true;
  root.setValue(initialInput);
  return root;
};

const budgetTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    a: { type: 'number', controls: {
      derived: '../b + 1',
      injectTo: (value: unknown) => ({ '../b': Number(value) + 1 }),
    } }, b: { type: 'number' },
  } });
  try { root.setValue({ a: 0, b: 0 }); } catch { /* expected budget error */ }
  return root;
};

// filid:contract factory-single-path
describe('round9 PR-3 derive regression', () => {
  it('r9.mjs:50 unsetValue clears raw on its rising edge', () => {
    expect(clearTree().find('/x')?.raw).toBeUndefined();
  });
  it('r9.mjs:51 unsetValue keeps the input active and visible', () => {
    const x = clearTree().find('/x');
    expect(x?.active).toBe(true);
    expect(Reflect.get(x ?? {}, 'visible')).toBe(true);
  });
  it('r9.mjs:54 an unrelated write does not refill after unsetValue', () => {
    const root = clearTree();
    root.find('/note')?.setValue('n');
    expect(root.find('/x')?.raw).toBeUndefined();
  });
  it('r9.mjs:56 a held true unsetValue is not another edge', () => {
    const root = clearTree();
    root.find('/x')?.setValue('typed');
    expect(root.find('/x')?.raw).toBe('typed');
  });
  it('r9.mjs:58 a second rising edge clears again', () => {
    const root = clearTree();
    root.find('/x')?.setValue('typed');
    root.find('/clear')?.setValue(false);
    root.find('/clear')?.setValue(true);
    expect(root.find('/x')?.raw).toBeUndefined();
  });
  it('r9.mjs:63 unsetValue suppresses a same-settle birth default', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      x: { type: 'string', default: 'D', controls: { unsetValue: 'true' } },
    } });
    root.setValue({});
    expect(root.find('/x')?.raw).toBeUndefined();
  });

  it('r9.mjs:128 SETTLE-004 derived wins over injectTo for the same target', () => {
    expect(conflictTree().find('/target')?.raw).toBe('D:1');
  });
  it('r9.mjs:129 SETTLE-004 losing injection settles without oscillation', () => {
    expect(conflictTree().diagnostics.status).toBe('stable');
  });
  it('r9.mjs:132 SETTLE-004 same-value dependency leaves a manual edit', () => {
    const root = conflictTree();
    root.find('/target')?.setValue('manual');
    root.find('/dep')?.setValue(1);
    expect(root.find('/target')?.raw).toBe('manual');
  });
  it('r9.mjs:134 SETTLE-004 changed dependency derives its own target', () => {
    const root = conflictTree();
    root.find('/target')?.setValue('manual');
    root.find('/dep')?.setValue(3);
    expect(root.find('/target')?.raw).toBe('D:3');
  });

  for (const [title, check] of [
    ['r9.mjs:151 WRITE-015 suppresses ordinary default', (root: ReturnType<typeof suppressionTree>) =>
      expect(root.find('/filled')?.raw).toBeUndefined()],
    ['r9.mjs:152 WRITE-015 suppresses controls.default', (root: ReturnType<typeof suppressionTree>) =>
      expect(root.find('/expression')?.raw).toBeUndefined()],
    ['r9.mjs:153 WRITE-015 preserves caller derived raw', (root: ReturnType<typeof suppressionTree>) =>
      expect(root.find('/derived')?.raw).toBe(90)],
    ['r9.mjs:154 WRITE-015 preserves caller injectTo target', (root: ReturnType<typeof suppressionTree>) =>
      expect(root.find('/injected')?.raw).toBe(80)],
    ['r9.mjs:155 WRITE-015 preserves caller data under unsetValue', (root: ReturnType<typeof suppressionTree>) =>
      expect(root.find('/erased')?.raw).toBe('loaded')],
    ['r9.mjs:156 WRITE-015 still projects inactive nodes out', (root: ReturnType<typeof suppressionTree>) =>
      expect(root.outputValue).not.toHaveProperty('hidden')],
  ] as const) {
    it(title, () => check(suppressionTree()));
  }

  const afterUserWrites = () => {
    const root = suppressionTree();
    root.find('/src')?.setValue(3);
    root.find('/on')?.setValue(true);
    return root;
  };
  it('r9.mjs:159 WRITE-015 Form suppression keeps derived caller raw', () => {
    expect(afterUserWrites().find('/derived')?.raw).toBe(90);
  });
  it('r9.mjs:160 WRITE-015 Form suppression keeps injection target raw', () => {
    expect(afterUserWrites().find('/injected')?.raw).toBe(80);
  });
  it('r9.mjs:161 WRITE-015 Form suppression leaves new node unfilled', () => {
    expect(afterUserWrites().find('/later')?.raw).toBeUndefined();
  });
  it('r9.mjs:162 WRITE-015 suppressed birth is not retried', () => {
    expect(afterUserWrites().find('/filled')?.raw).toBeUndefined();
  });
  it('r9.mjs:164 WRITE-015 per-load enable overrides Form suppression', () => {
    const root = suppressionTree();
    root.resetSubtree(SetValueOption.Overwrite | SetValueOption.EnableAutomaticWrites);
    expect(root.find('/filled')?.raw).toBe('D');
  });
  it('r9.mjs:165 CONTROLS-028 reset load re-evaluates true unsetValue', () => {
    const root = suppressionTree();
    root.resetSubtree(SetValueOption.Overwrite | SetValueOption.EnableAutomaticWrites);
    expect(root.find('/erased')?.raw).toBeUndefined();
  });

  it('r9.mjs:176 ERROR-070 feedback degrades after exhausting budget', () => {
    expect(budgetTree().diagnostics.status).toBe('degraded');
  });
  it('r9.mjs:177 ERROR-070 uses exactly 25 derive rounds', () => {
    expect(budgetTree().diagnostics.iterations).toBe(25);
  });
  it('r9.mjs:178 SETTLE-011 commits the caller base on budget failure', () => {
    expect(budgetTree().outputValue).toEqual({ a: 0, b: 0 });
  });
  it('r9.mjs:179 SETTLE-011 emit agrees with committed raw', () => {
    const root = budgetTree();
    expect(root.outputValue).toEqual({ a: root.find('/a')?.raw, b: root.find('/b')?.raw });
  });
  it('r9.mjs:180 SETTLE-011 retains no automatic feedback writes', () => {
    const root = budgetTree();
    expect([root.find('/a')?.raw, root.find('/b')?.raw]).toEqual([0, 0]);
  });
});
