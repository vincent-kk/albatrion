import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const nTree = (which: 'N1' | 'N9', withDefault: boolean) => {
  const first = { controls: { active: './x !== 1' }, properties: {
    x: { type: 'number', ...(withDefault ? { default: 1 } : {}) },
  } };
  const gates = which === 'N1' ? [first] : [
    { controls: { active: './x === 1' }, properties: {
      x: { type: 'number', ...(withDefault ? { default: 0 } : {}) },
    } },
    { controls: { active: './x === undefined || ./x === 0' }, properties: {
      x: { type: 'number', ...(withDefault ? { default: 1 } : {}) },
    } },
    { controls: { active: './x === 2' }, properties: {
      x: { type: 'number', ...(withDefault ? { default: 2 } : {}) },
    } },
  ];
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    x: { type: 'number' },
  }, allOf: gates });
  root.setValue({});
  return root;
};

// filid:contract factory-single-path
describe('round8 PR-2 observations promoted to assertions', () => {
  it('r8-port.mjs:271 chooses the last authored active default on a new node', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'boolean' }, b: { type: 'boolean' },
    }, allOf: [
      { controls: { active: './a === true' }, properties: {
        x: { type: 'string', default: 'A' },
      } },
      { controls: { active: './b === true' }, properties: {
        x: { type: 'string', default: 'B' },
      } },
    ] });
    root.setValue({ a: true, b: true });
    expect(root.find('/x')?.raw).toBe('B');
    expect(root.outputValue).toEqual({ a: true, b: true, x: 'B' });
  });

  it('r8-port.mjs:363 VALUE-034 X16 without automatic writes stays empty', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      t: { type: 'string' },
    }, allOf: [{ controls: { active: './t === undefined' }, properties: {
      c: { type: 'string' },
    } }] });
    root.setValue({});
    expect(root.outputValue).toEqual({});
    expect(root.find('/c')?.raw).toBeUndefined();
    expect(root.diagnostics.status).toBe('stable');
  });

  it('r8-port.mjs:364 N1 fills x once despite a gate changed by the fill', () => {
    const root = nTree('N1', true);
    expect(root.find('/x')?.raw).toBe(1);
    expect(root.outputValue).toEqual({ x: 1 });
    expect(root.diagnostics.status).toBe('stable');
  });

  it('r8-port.mjs:365 N1 without a default leaves x missing', () => {
    const root = nTree('N1', false);
    expect(root.find('/x')?.raw).toBeUndefined();
    expect(root.outputValue).toEqual({});
    expect(root.diagnostics.status).toBe('stable');
  });

  it('r8-port.mjs:366 N9 commits the stable x value', () => {
    const root = nTree('N9', true);
    expect(root.find('/x')?.raw).toBe(1);
    expect(root.outputValue).toEqual({ x: 1 });
    expect(root.diagnostics.status).toBe('stable');
  });

  it('r8-port.mjs:367 N9 without defaults leaves x missing', () => {
    const root = nTree('N9', false);
    expect(root.find('/x')?.raw).toBeUndefined();
    expect(root.outputValue).toEqual({});
    expect(root.diagnostics.status).toBe('stable');
  });
});
