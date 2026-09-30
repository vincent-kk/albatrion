import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('round9 edge cases with PR-2 mechanisms', () => {
  const fragmentTree = () => makeSchemaNodeTree({ type: 'object', properties: {
    on: { type: 'boolean' },
  }, allOf: [{ controls: { active: './on === true' }, properties: {
    group: { type: 'object', properties: { x: { type: 'string', default: 'D' } } },
  } }] }).root;

  it('edge-cases.mjs:21 does not birth children of an inactive fragment', () => {
    const root = fragmentTree();
    root.setValue({ on: false });
    expect(root.find('/group/x')).toBeNull();
    expect(root.outputValue).toEqual({ on: false });
  });

  it('edge-cases.mjs:23 births descendants when the fragment activates', () => {
    const root = fragmentTree();
    root.setValue({ on: false });
    root.find('/on')?.setValue(true);
    expect(root.find('/group/x')?.raw).toBe('D');
    expect(root.outputValue).toEqual({ on: true, group: { x: 'D' } });
  });

  const elseTree = () => makeSchemaNodeTree({ type: 'object', properties: {
    kind: { type: 'string' },
  }, allOf: [{ if: {}, then: { properties: { a: { type: 'string', default: 'A' } } },
    else: { properties: { b: { type: 'string', default: 'B' } } } }] }, {
    ifPredicate: () => input => input !== null && typeof input === 'object' &&
      'kind' in input && input.kind === 'yes',
  }).root;

  it('edge-cases.mjs:48 activates the else declaration inside allOf', () => {
    const root = elseTree();
    root.setValue({ kind: 'no' });
    expect(root.outputValue).toEqual({ kind: 'no', b: 'B' });
  });

  it('edge-cases.mjs:50 accepts allOf else without else:false', () => {
    const root = elseTree();
    root.setValue({ kind: 'no' });
    expect(root.diagnostics.status).toBe('stable');
    expect(root.find('/b')?.raw).toBe('B');
  });

  it('edge-cases.mjs:84 fills an object default before its child default', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      group: { type: 'object', default: { x: 'parent' },
        properties: { x: { type: 'string', default: 'child' } } },
    } });
    root.setValue({});
    expect(root.outputValue).toEqual({ group: { x: 'parent' } });
    expect(root.find('/group/x')?.raw).toBe('parent');
  });

  const overlayTree = () => makeSchemaNodeTree({ type: 'object', properties: {
    on: { type: 'boolean' }, x: { type: 'string', default: 'base' },
  }, allOf: [{ controls: { active: './on === true' }, properties: {
    x: { type: 'string', controls: { default: 'fragment' } },
  } }] }).root;

  it('edge-cases.mjs:90 lets an active overlay default beat the base default', () => {
    const root = overlayTree();
    root.setValue({ on: true });
    expect(root.find('/x')?.raw).toBe('fragment');
  });

  it('edge-cases.mjs:93 does not rebirth a base node when its overlay returns', () => {
    const root = overlayTree();
    root.setValue({ on: true });
    root.find('/x')?.setValue(undefined);
    root.find('/on')?.setValue(false);
    root.find('/on')?.setValue(true);
    expect(root.find('/x')?.raw).toBeUndefined();
  });

  it('edge-cases.mjs:65 lets controls.default beat ordinary default', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      x: { type: 'string', default: 'plain', controls: { default: 'control' } },
    } });
    root.setValue({});
    expect(root.find('/x')?.raw).toBe('control');
  });

  it('edge-cases.mjs:65 keeps controls.default priority under a disabled parent', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', disabled: true,
      properties: {
        x: { type: 'string', default: 'plain',
          controls: { default: 'control', disabled: false } },
      } });
    root.setValue({});
    expect(root.find('/x')?.raw).toBe('control');
  });
});
