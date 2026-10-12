import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const controlsTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', readOnly: true,
    controls: { children: [
      { targets: ['x'], controls: {
        readOnly: true, disabled: true, visible: false,
      } },
      { targets: ['y'], controls: { active: false } },
    ] },
    properties: {
      on: { type: 'boolean' },
      y: { type: 'string', default: 'Y', controls: { active: true } },
      group: { type: 'object', properties: {
        nested: { type: 'string', default: 'N', controls: { readOnly: false } },
      } },
    },
    allOf: [{ controls: { active: './on', readOnly: true, visible: false },
      properties: {
        x: { type: 'string', default: 'X', controls: {
          readOnly: false, disabled: false, visible: true,
        } },
        z: { type: 'string', default: 'Z' },
      } }],
  });
  root.setValue({ on: true });
  return root;
};

// filid:contract factory-single-path
describe('round9 P4 controls under the current AND/OR policy', () => {
  it('r9.mjs:104 CONTROLS-082 combines local locks with OR and visibility with AND', () => {
    const x = controlsTree().find('/x');
    expect([x?.active, x?.visible, x?.readOnly, x?.disabled])
      .toEqual([true, false, true, true]);
  });

  it('r9.mjs:106 CONTROLS-082 parent item active false wins over own true', () => {
    expect(controlsTree().find('/y')).toBeNull();
  });

  it('r9.mjs:107 CONTROLS-082 fragment visibility reaches its declaration', () => {
    expect(controlsTree().find('/z')?.visible).toBe(false);
  });

  it('r9.mjs:108 invisible fragment value remains in emitted output', () => {
    expect(controlsTree().outputValue).toHaveProperty('z', 'Z');
  });

  it('r9.mjs:109 CONTROLS-082 inactive item is absent from output', () => {
    expect(controlsTree().outputValue).not.toHaveProperty('y');
  });

  it('r9.mjs:110 CONTROLS-082 inactive item does not receive its default', () => {
    const root = controlsTree();
    expect(root.find('/y')).toBeNull();
    expect(root.inactiveValues).not.toContainEqual({ path: '/y', value: 'Y' });
  });

  it('r9.mjs:114 CONTROLS-082 fragment gate removes x from final shape', () => {
    const root = controlsTree();
    root.find('/on')?.setValue(false);
    expect(root.find('/x')).toBeNull();
    expect(root.outputValue).not.toHaveProperty('x');
  });

  it('r9.mjs:115 WRITE-031 fragment exit retains x by default', () => {
    const root = controlsTree();
    root.find('/on')?.setValue(false);
    root.find('/on')?.setValue(true);
    expect(root.find('/x')?.raw).toBe('X');
  });
});
