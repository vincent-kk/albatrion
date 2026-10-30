import { describe, expect, it } from 'vitest';

import { createPreparedSelectionStructure } from '../utils/compute/childSelection/utils/createPreparedSelectionStructure';
import { readProjectedValue } from '../utils/gates/readProjectedValue';
import { createGateReadFixture } from './fixtures/createGateReadFixture';

// filid:contract settle-projected-structure-read
describe('projected structure reads', () => {
  it.each(['dictionary', 'prepared-view'])(
    'reads a %s without allocating own-key descriptors',
    (shape) => {
      const { root, context, release } = createGateReadFixture(
        { type: 'object', properties: { field: { type: 'string' } } },
        { field: 'kept' },
      );
      let descriptors = 0;
      try {
        const baseline = root.structure!;
        expect(Object.getPrototypeOf(baseline)).toBe(null);
        const target =
          shape === 'dictionary'
            ? baseline
            : createPreparedSelectionStructure(
                baseline,
                baseline,
                [],
                Object.create(baseline),
              );
        root.structure = new Proxy(target, {
          getOwnPropertyDescriptor(target, name) {
            descriptors++;
            return Reflect.getOwnPropertyDescriptor(target, name);
          },
        });
        expect(readProjectedValue(context, '/field')).toBe('kept');
        expect(descriptors).toBe(0);
      } finally {
        release();
      }
    },
  );

  it.each(['constructor', '__proto__', 'toString'])(
    'retains the own node for the prototype name %s',
    (name) => {
      const { context, release } = createGateReadFixture(
        {
          type: 'object',
          properties: Object.fromEntries([[name, { type: 'string' }]]),
        },
        { [name]: 'own' },
      );
      try {
        expect(readProjectedValue(context, '/' + name)).toBe('own');
      } finally {
        release();
      }
    },
  );

  it('rejects an inherited node on an ordinary-prototype structure', () => {
    const { root, context, release } = createGateReadFixture(
      { type: 'object', properties: { field: { type: 'string' } } },
      { field: 'kept' },
    );
    try {
      const ordinary = { ...root.structure };
      Object.setPrototypeOf(ordinary, { inherited: ordinary.field });
      root.structure = ordinary;
      expect(readProjectedValue(context, '/inherited')).toBeUndefined();
      expect(readProjectedValue(context, '/field')).toBe('kept');
    } finally {
      release();
    }
  });

  it('preserves array holes and the array host own-key path', () => {
    const value = new Array(2);
    value[1] = 'second';
    const { root, context, release } = createGateReadFixture(
      { type: 'array', items: { type: 'string' } },
      value,
    );
    let descriptors = 0;
    try {
      root.structure = new Proxy(root.structure!, {
        getOwnPropertyDescriptor(target, name) {
          descriptors++;
          return Reflect.getOwnPropertyDescriptor(target, name);
        },
      });
      expect(readProjectedValue(context, '/0')).toBeUndefined();
      expect(readProjectedValue(context, '/1')).toBe('second');
      expect(descriptors).toBeGreaterThan(0);
    } finally {
      release();
    }
  });
});
