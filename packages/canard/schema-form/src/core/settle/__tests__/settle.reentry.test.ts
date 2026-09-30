import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-transition
describe('final-shape exits', () => {
  const schema = (unsetOnInactive: boolean) => ({ type: 'object', properties: {
    t: { type: 'boolean' },
    a: { type: 'number', default: 1, controls: { active: '../t === true' } },
    c: { type: 'number', default: 2, controls: { active: '../a === 1' } },
    g: { type: 'object', controls: {
      active: '../a !== 1 || ../c === 2', unsetOnInactive,
    }, properties: { leaf: { type: 'string' } } },
  } });

  for (const unsetOnInactive of [false, true])
    it(`SETTLE-005 keeps a reopened node when unset is ${unsetOnInactive}`, () => {
      const { root } = createTestTree(schema(unsetOnInactive));
      loadSchemaNodeAtMount(root, { g: { leaf: 'keep' } }, SetValueOption.Overwrite);
      const g = root.structure?.g;
      if (!g) throw new Error('Expected g in the previous commit');
      writeSchemaNode(root.structure!.t, true, 'input', SetValueOption.Overwrite);
      expect(root.structure?.g).toBe(g);
      expect(g.detached).toBe(false);
      expect(g.raw).toEqual({ leaf: 'keep' });
      expect(root.raw).toMatchObject({ g: { leaf: 'keep' } });
    });

  it('SETTLE-011 keeps the previous g instance after Source B restores the final shape', () => {
    const base = schema(true);
    const { root } = createTestTree({ ...base, properties: {
      ...base.properties, x: { type: ['string', 'boolean'] },
    }, allOf: [
      { controls: { active: './x === "0"' },
        properties: { x: { type: 'boolean' } } },
      { controls: { active: './x !== "0"' },
        properties: { x: { type: 'string' } } },
    ] });
    loadSchemaNodeAtMount(root, { g: { leaf: 'keep' }, x: 'steady' },
      SetValueOption.Overwrite);
    const g = root.structure?.g;
    if (!g) throw new Error('Expected g in the previous commit');
    expect(() => writeSchemaNode(root, { t: true, g: { leaf: 'keep' }, x: 0 },
      'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget' });
    expect(root.structure?.g).toBe(g);
    expect(g.detached).toBe(false);
    expect(g.raw).toEqual({ leaf: 'keep' });
    expect(root.raw).toMatchObject({ g: { leaf: 'keep' } });
  });
});
