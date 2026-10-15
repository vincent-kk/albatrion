import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

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
    root.find('/enabled')?.setValue(true);
    root.find('/source')?.setValue('C');
    expect(list.value).toEqual(['C', 'C', 'C']);
  });
});
