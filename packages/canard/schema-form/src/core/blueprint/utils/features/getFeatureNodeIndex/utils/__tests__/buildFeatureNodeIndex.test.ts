import { describe, expect, it } from 'vitest';

import { blueprint } from '../../../../../blueprint';
import { buildFeatureNodeIndex } from '../buildFeatureNodeIndex';

describe('static state declaration bounds replacing declaresStateKeys', () => {
  it('includes own visible, disabled and readOnly controls, even false', () => {
    for (const key of ['visible', 'disabled', 'readOnly']) {
      const analysis = blueprint({ type: 'string', controls: { [key]: false } });
      expect(buildFeatureNodeIndex(analysis).stateKeyNodes.has(analysis.root.id)).toBe(true);
    }
  });

  it('addresses parent controls.children by the declared child name', () => {
    const analysis = blueprint({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    }, controls: { children: [{ targets: ['a'], controls: { disabled: true } }] } });
    const index = buildFeatureNodeIndex(analysis);
    expect([...index.stateKeyChildren.get(analysis.root.id)!]).toEqual(['a']);
    expect(index.stateKeyNodes.size).toBe(0);
  });

  it('includes standard readOnly true and excludes false', () => {
    const analysis = blueprint({ type: 'object', properties: {
      a: { type: 'string', readOnly: true }, b: { type: 'string', readOnly: false },
    } });
    const index = buildFeatureNodeIndex(analysis);
    const [a, b] = analysis.root.childEntries;
    expect(index.stateKeyNodes.has(a.node.id)).toBe(true);
    expect(index.stateKeyNodes.has(b.node.id)).toBe(false);
  });

  it('keeps fragment controls on that fragment\'s children', () => {
    const analysis = blueprint({ type: 'object', properties: { outside: { type: 'string' } },
      allOf: [{ controls: { visible: false }, properties: { inside: { type: 'string' } } }] });
    const index = buildFeatureNodeIndex(analysis);
    expect([...index.stateKeyChildren.get(analysis.root.id)!]).toEqual(['inside']);
    expect(index.stateKeyNodes.has(analysis.root.id)).toBe(false);
  });

  it('leaves feature-free declarations and unrelated controls out', () => {
    const analysis = blueprint({ type: 'object', properties: {
      plain: { type: 'string' }, watched: { type: 'string', controls: { watch: ['../plain'] } },
    } });
    const index = buildFeatureNodeIndex(analysis);
    expect(index.stateKeyNodes.size).toBe(0);
    expect(index.stateKeyChildren.size).toBe(0);
  });
});
