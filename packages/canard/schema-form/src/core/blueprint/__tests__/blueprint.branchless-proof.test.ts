import { describe, expect, it } from 'vitest';

import { blueprint, getFeatureNodeIndex } from '../index';

// filid:contract branchless-proof branchless-features
describe('branchless declaration reach and independent capabilities', () => {
  it('proves absence throughout refs, allOf, items, tuples, inline and virtual declarations', () => {
    const result = blueprint({
      type: 'object',
      $defs: { leaf: { type: 'number' } },
      properties: {
        ref: { $ref: '#/$defs/leaf' },
        array: { type: 'array', items: { type: 'number' } },
        tuple: { type: 'array', prefixItems: [{ type: 'number' }] },
        oldTuple: { type: 'array', items: [{ type: 'number' }],
          additionalItems: { type: 'number' } },
        inline: { type: 'object', properties: { leaf: { type: 'number' } } },
      },
      allOf: [{ properties: { extra: { type: 'number' } } }],
      options: { virtual: { pair: { fields: ['ref', 'extra'] } } },
    });
    expect(Reflect.get(result, 'capabilities')).toEqual({
      branchless: true, hasExpressions: false, hasDerive: false,
      hasWatch: false, hasState: false, hasDependencies: false,
    });
    expect(result.fragments.length).toBeGreaterThan(result.nodes.length);
  });

  it('rejects branchlessness for every hidden branch mechanism and every collection reach', () => {
    const reaches = [
      (child: object) => ({ type: 'object', $defs: { child },
        properties: { value: { $ref: '#/$defs/child' } } }),
      (child: object) => ({ type: 'object', allOf: [child] }),
      (child: object) => ({ type: 'array', items: child }),
      (child: object) => ({ type: 'array', prefixItems: [child] }),
      (child: object) => ({ type: 'array', items: [{ type: 'number' }],
        additionalItems: child }),
      (child: object) => ({ type: 'object', properties: { inline: child } }),
      (child: object) => ({ type: 'object', properties: { a: { type: 'number' } },
        options: { virtual: { pair: { ...child, fields: ['a'] } } } }),
    ];
    const mechanisms = [
      { oneOf: [{}] }, { anyOf: [{}] }, { if: {}, then: {} },
      { controls: { discriminator: 'tag' },
        oneOf: [{ properties: { tag: { type: 'string', const: 'a' } } }] },
      { controls: { active: true } },
    ];
    for (let reach = 0; reach < reaches.length; reach++)
      for (let mechanism = 0; mechanism < mechanisms.length; mechanism++) {
        // Fragment controls have no discriminator namespace; it is reached via an inline declaration.
        const child = reach === 1 && mechanism === 3
          ? { properties: { value: { type: 'object', ...mechanisms[mechanism] } } }
          : { type: 'object', ...mechanisms[mechanism] };
        const result = blueprint(reaches[reach](child));
        expect(Reflect.get(result, 'capabilities').branchless,
          `reach ${reach}, mechanism ${mechanism}`).toBe(false);
      }
  });

  it('keeps children active gates and ignores only positions collection never reaches', () => {
    const controlled = blueprint({ type: 'object',
      properties: { a: { type: 'number' } },
      controls: { children: [{ targets: ['a'], controls: { active: false } }] },
    });
    expect(Reflect.get(controlled, 'capabilities').branchless).toBe(false);
    const ignored = blueprint({ type: 'object',
      $defs: { unused: { type: 'object', if: {} } },
      properties: { terminal: { type: 'object', options: { terminal: true },
        properties: { ignored: { type: 'object', oneOf: [{}] } } } },
    });
    expect(Reflect.get(ignored, 'capabilities').branchless).toBe(true);
  });

  it('retains state/watch indexes when those features have no gates', () => {
    const result = blueprint({ type: 'object', properties: {
      a: { type: 'number', controls: { visible: false, watch: ['/b'] } },
      b: { type: 'number', readOnly: true },
    } });
    const capabilities = Reflect.get(result, 'capabilities');
    expect(capabilities).toMatchObject({ branchless: true, hasState: true,
      hasWatch: true, hasDependencies: true });
    const index = getFeatureNodeIndex(result);
    expect(index.stateKeyNodes.has(result.root.childEntries[0].node.id)).toBe(true);
    expect(index.stateKeyNodes.has(result.root.childEntries[1].node.id)).toBe(true);
    expect(index.watchNodes.has(result.root.childEntries[0].node.id)).toBe(true);
    expect(result.dependencies['/b']).toHaveLength(1);
    expect(getFeatureNodeIndex(result)).toBe(index);
  });

  it('shares immutable empty indexes only for feature-free blueprints', () => {
    const first = blueprint({ type: 'string' });
    const second = blueprint({ type: 'number' });
    const index = getFeatureNodeIndex(first);
    expect(getFeatureNodeIndex(second)).toBe(index);
    expect(Reflect.get(index.stateKeyNodes, 'add')).toBeUndefined();
    expect(Reflect.get(index.stateKeyChildren, 'set')).toBeUndefined();
    expect(Object.isFrozen(index)).toBe(true);
    expect(first.expressions).toBe(second.expressions);
    expect(first.dependencies).toBe(second.dependencies);
    expect(Object.isFrozen(first.dependencies)).toBe(true);
  });
});
