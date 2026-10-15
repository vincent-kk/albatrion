import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { createFragmentArrayTree } from '../../__tests__/fixtures/createFragmentArrayTree';

// filid:contract derive-fragment-array-unset
describe('CONTROLS-077 fragment unsetValue array targets', () => {
  it('clears every single-schema item on the false-to-true edge', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree('unsetValue');
    root.find('/trigger')?.setValue(true);
    expect(list.value).toEqual([null, null, null]);
    for (const child of list.children ?? [])
      expect(child.value).toBeUndefined();
    root.find('/list/1')?.setValue('manual');
    expect(list.value).toEqual([null, 'manual', null]);
  });

  it('clears every additionalItems occurrence alongside its declared tuple slot', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'unsetValue',
      { items: [{ type: 'string' }], additionalItems: { type: 'string' } },
      { items: [{ type: 'string' }], additionalItems: { type: 'string' } },
    );
    root.find('/trigger')?.setValue(true);
    expect(list.value).toEqual([null, null, null]);
  });

  it('clears legacy tuple slots without clearing additionalItems', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'unsetValue',
      { items: [{ type: 'string' }, { type: 'string' }] },
      {
        items: [{ type: 'string' }, { type: 'string' }],
        additionalItems: { type: 'string' },
      },
    );
    root.find('/trigger')?.setValue(true);
    expect(list.value).toEqual([null, null, 'c']);
  });

  it('keeps prefixItems clearing inside the positional boundary', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'unsetValue',
      { prefixItems: [{ type: 'string' }, { type: 'string' }] },
      {
        prefixItems: [{ type: 'string' }, { type: 'string' }],
        items: { type: 'string' },
      },
    );
    root.find('/trigger')?.setValue(true);
    expect(list.value).toEqual([null, null, 'c']);
  });

  it('clears nested array items only under the host whose expression turns true', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root } = makeFieldNodeTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clear: { type: 'boolean' },
          list: {
            type: 'array',
            allOf: [
              {
                items: { type: 'string' },
                controls: { unsetValue: '../clear' },
              },
            ],
          },
        },
      },
    });
    root.setValue([
      { clear: false, list: ['a', 'b'] },
      { clear: false, list: ['c', 'd'] },
    ]);
    root.find('/1/clear')?.setValue(true);
    expect(root.find('/0/list')?.value).toEqual(['a', 'b']);
    expect(root.find('/1/list')?.value).toEqual([null, null]);
  });

  it('push consumes a new true edge without replaying existing item edges', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('unsetValue');
    root.find('/trigger')?.setValue(true);
    root.find('/list/0')?.setValue('manual');
    list.push('new');
    expect(list.value).toEqual(['manual', null, null, null]);
    expect(runtime.committedRuleValues?.size).toBe(4);
  });

  it('remove prunes the retired edge before the next true transition', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('unsetValue');
    /** Retained reference used to observe a removed item after detachment. */
    const retired = root.find('/list/1');
    /** Last committed value that a detached item must retain. */
    const retiredValue = retired?.value;
    list.remove(1);
    expect(runtime.committedRuleValues?.size).toBe(2);
    root.find('/trigger')?.setValue(true);
    expect(list.value).toEqual([null, null]);
    expect(retired?.value).toBe(retiredValue);
  });

  it('keeps values while the declaring fragment is off', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('unsetValue');
    root.find('/enabled')?.setValue(false);
    root.find('/trigger')?.setValue(true);
    expect(list.value).toEqual(['a', 'b', 'c']);
    expect(runtime.committedRuleValues?.size).toBe(0);
    root.find('/enabled')?.setValue(true);
    root.find('/trigger')?.setValue(false);
    root.find('/trigger')?.setValue(true);
    expect(list.value).toEqual([null, null, null]);
  });
});
