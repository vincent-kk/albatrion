import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FieldNodeState } from '@/schema-form/core/engine/types/state';

import { createFragmentArrayTree } from '../../__tests__/fixtures/createFragmentArrayTree';

// filid:contract derive-fragment-array-derived
describe('CONTROLS-077 fragment derived array targets', () => {
  it('writes the host result to every single-schema item', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree('derived');
    expect(list.value).toEqual(['A', 'A', 'A']);
    root.find('/source')?.setValue('B');
    expect(list.value).toEqual(['B', 'B', 'B']);
  });

  it('targets every additionalItems occurrence alongside its declared tuple slot', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'derived',
      { items: [{ type: 'string' }], additionalItems: { type: 'string' } },
      { items: [{ type: 'string' }], additionalItems: { type: 'string' } },
    );
    expect(list.value).toEqual(['A', 'A', 'A']);
    root.find('/source')?.setValue('B');
    expect(list.value).toEqual(['B', 'B', 'B']);
  });

  it('targets legacy tuple slots without crossing into additionalItems', () => {
    /** Public array occurrence addressed by the fragment. */
    const { list } = createFragmentArrayTree(
      'derived',
      { items: [{ type: 'string' }, { type: 'string' }] },
      {
        items: [{ type: 'string' }, { type: 'string' }],
        additionalItems: { type: 'string' },
      },
    );
    expect(list.value).toEqual(['A', 'A', 'c']);
  });

  it('keeps prefixItems ownership inside its positional boundary', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'derived',
      { prefixItems: [{ type: 'string' }, { type: 'string' }] },
      {
        prefixItems: [{ type: 'string' }, { type: 'string' }],
        items: { type: 'string' },
      },
    );
    root.find('/source')?.setValue('B');
    expect(list.value).toEqual(['B', 'B', 'c']);
  });

  it('rebinds the host expression independently in nested arrays', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root } = makeFieldNodeTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          list: {
            type: 'array',
            allOf: [
              { items: { type: 'string' }, controls: { derived: '../source' } },
            ],
          },
        },
      },
    });
    root.setValue([
      { source: 'A', list: ['a', 'b'] },
      { source: 'B', list: ['c', 'd'] },
    ]);
    expect(root.find('/0/list')?.value).toEqual(['A', 'A']);
    expect(root.find('/1/list')?.value).toEqual(['B', 'B']);
    root.find('/1/source')?.setValue('C');
    expect(root.find('/0/list')?.value).toEqual(['A', 'A']);
    expect(root.find('/1/list')?.value).toEqual(['C', 'C']);
  });

  it('push binds only the new item edge when the host value is unchanged', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('derived');
    root.find('/list/0')?.setValue('manual');
    list.push('new');
    expect(list.value).toEqual(['manual', 'A', 'A', 'A']);
    expect(runtime.committedRuleValues?.size).toBe(4);
  });

  it('remove unbinds the retired item and rekeys all surviving targets', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('derived');
    /** Retained reference used to observe a removed item after detachment. */
    const retired = root.find('/list/1');
    /** Last committed value that a detached item must retain. */
    const retiredValue = retired?.value;
    /** Committed item identities before removal and survivor rekeying. */
    const oldKeys = [...(runtime.committedRuleValues?.keys() ?? [])];
    list.remove(1);
    expect(runtime.committedRuleValues?.size).toBe(2);
    expect(
      oldKeys.filter((key) => runtime.committedRuleValues?.has(key)),
    ).toHaveLength(1);
    root.find('/source')?.setValue('B');
    expect(list.value).toEqual(['B', 'B']);
    expect(retired?.value).toBe(retiredValue);
  });

  it('stops writing while the fragment is off and resumes on selection', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('derived');
    root.find('/enabled')?.setValue(false);
    expect(runtime.committedRuleValues?.size).toBe(0);
    root.find('/source')?.setValue('B');
    expect(list.value).toEqual(['A', 'A', 'A']);
    for (const child of list.children ?? [])
      child.setState({
        [FieldNodeState.Dirty]: true,
        [FieldNodeState.Touched]: true,
      });
    /** Shared identities must survive selection without taking a new edge. */
    const retained = [...(list.children ?? [])];
    root.find('/enabled')?.setValue(true);
    expect(list.children).toEqual(retained);
    expect(list.value).toEqual(['A', 'A', 'A']);
    expect(runtime.committedRuleValues?.size).toBe(3);
    expect(runtime.settlementTrace).toBeDefined();
    expect(
      runtime.settlementTrace?.rounds
        .flat()
        .filter((entry) => entry.kind === 'derived'),
    ).toEqual([]);
    for (const child of list.children ?? [])
      expect(child.state).toMatchObject({
        [FieldNodeState.Dirty]: true,
        [FieldNodeState.Touched]: true,
      });
    root.find('/source')?.setValue('C');
    expect(list.value).toEqual(['C', 'C', 'C']);
  });

  it('FRAGMENT-050 derives a new item added in the same commit that selects the fragment', () => {
    /** Stable base items remain mounted while the fragment is deselected. */
    const { root, list, runtime } = createFragmentArrayTree('derived');
    root.find('/enabled')?.setValue(false);
    root.find('/source')?.setValue('B');
    root.batch(() => {
      root.find('/enabled')?.setValue(true);
      list.push('new');
    });
    expect(list.value).toEqual(['A', 'A', 'A', 'B']);
    expect(root.find('/list/3')?.value).toBe('B');
    expect(runtime.committedRuleValues?.size).toBe(4);
    expect(
      runtime.settlementTrace?.rounds
        .flat()
        .filter(
          (entry) => entry.kind === 'derived' && entry.result === 'applied',
        )
        .map((entry) => entry.targetPath),
    ).toEqual(['/list/3']);
  });

  it('CONTROLS-077 keeps each item node own derived rule above competing fragments', () => {
    /** Distinct host and item expressions compete for every item target. */
    const { root, list } = createFragmentArrayTree(
      'derived',
      { items: { type: 'string' } },
      {
        items: {
          type: 'string',
          controls: { derived: '../../source + "-node"' },
        },
      },
    );
    expect(list.value).toEqual(['A-node', 'A-node', 'A-node']);
    root.find('/source')?.setValue('B');
    for (const child of list.children ?? []) expect(child.value).toBe('B-node');
  });

  it('CONTROLS-077 lets the later array fragment win on every shared item target', () => {
    /** Both fragments declare every item and read the same changing source. */
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        list: {
          type: 'array',
          allOf: [
            {
              items: { type: 'string' },
              controls: { derived: '../source + "-first"' },
            },
            {
              items: { type: 'string' },
              controls: { derived: '../source + "-last"' },
            },
          ],
        },
      },
    });
    root.setValue({ source: 'A', list: ['a', 'b', 'c'] });
    expect(root.find('/list')?.value).toEqual(['A-last', 'A-last', 'A-last']);
    root.find('/source')?.setValue('B');
    for (const index of [0, 1, 2])
      expect(root.find('/list/' + index)?.value).toBe('B-last');
  });
});
