import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const derivedTree = () => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    a: { type: 'number' },
    d: { type: 'string', controls: {
      derived: '../a === undefined ? undefined : "f(" + ../a + ")"',
    } },
  } });
  root.setValue({ a: 1 });
  return root;
};

// filid:contract factory-single-path
describe('round8 batch derive ports', () => {
  it('r8-port.mjs:61 P1 iii batch source then manual target settles to f(2)', () => {
    const root = derivedTree();
    root.batch(() => {
      root.find('/a')?.setValue(2);
      root.find('/d')?.setValue('mine');
    });
    expect(root.find('/d')?.value).toBe('f(2)');
  });

  it('r8-port.mjs:61 P1 iii batch manual target then source settles to f(2)', () => {
    const root = derivedTree();
    root.batch(() => {
      root.find('/d')?.setValue('mine');
      root.find('/a')?.setValue(2);
    });
    expect(root.find('/d')?.value).toBe('f(2)');
  });
});
