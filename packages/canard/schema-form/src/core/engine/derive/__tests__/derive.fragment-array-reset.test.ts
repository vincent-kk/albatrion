import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FieldNodeState } from '@/schema-form/core/engine/types/state';

import { createFragmentArrayTree } from './fixtures/createFragmentArrayTree';

/** Dirty and touched flags used to observe resetInteraction's public result. */
const INTERACTION = {
  [FieldNodeState.Dirty]: true,
  [FieldNodeState.Touched]: true,
};
/** Cleared flags expected only on declared targets. */
const CLEARED = {
  [FieldNodeState.Dirty]: false,
  [FieldNodeState.Touched]: false,
};

// filid:contract derive-fragment-array-reset
describe('CONTROLS-077 fragment resetInteraction array targets', () => {
  it('resets every single-schema item on its own edge', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree('resetInteraction');
    for (const child of list.children ?? []) child.setState(INTERACTION);
    root.find('/trigger')?.setValue(true);
    for (const child of list.children ?? [])
      expect(child.state).toMatchObject(CLEARED);
    root.find('/list/1')?.setState(INTERACTION);
    root.find('/source')?.setValue('B');
    expect(root.find('/list/1')?.state).toMatchObject(INTERACTION);
  });

  it('resets every additionalItems occurrence alongside its declared tuple slot', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'resetInteraction',
      { items: [{ type: 'string' }], additionalItems: { type: 'string' } },
      { items: [{ type: 'string' }], additionalItems: { type: 'string' } },
    );
    for (const child of list.children ?? []) child.setState(INTERACTION);
    root.find('/trigger')?.setValue(true);
    expect(root.find('/list/0')?.state).toMatchObject(CLEARED);
    expect(root.find('/list/1')?.state).toMatchObject(CLEARED);
    expect(root.find('/list/2')?.state).toMatchObject(CLEARED);
  });

  it('resets legacy tuple slots without resetting additionalItems', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'resetInteraction',
      { items: [{ type: 'string' }, { type: 'string' }] },
      {
        items: [{ type: 'string' }, { type: 'string' }],
        additionalItems: { type: 'string' },
      },
    );
    for (const child of list.children ?? []) child.setState(INTERACTION);
    root.find('/trigger')?.setValue(true);
    expect(root.find('/list/0')?.state).toMatchObject(CLEARED);
    expect(root.find('/list/1')?.state).toMatchObject(CLEARED);
    expect(root.find('/list/2')?.state).toMatchObject(INTERACTION);
  });

  it('keeps prefixItems resets inside the positional boundary', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list } = createFragmentArrayTree(
      'resetInteraction',
      { prefixItems: [{ type: 'string' }, { type: 'string' }] },
      {
        prefixItems: [{ type: 'string' }, { type: 'string' }],
        items: { type: 'string' },
      },
    );
    for (const child of list.children ?? []) child.setState(INTERACTION);
    root.find('/trigger')?.setValue(true);
    expect(root.find('/list/0')?.state).toMatchObject(CLEARED);
    expect(root.find('/list/1')?.state).toMatchObject(CLEARED);
    expect(root.find('/list/2')?.state).toMatchObject(INTERACTION);
  });

  it('resets nested array items under only the triggering host', () => {
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
                controls: { resetInteraction: '../clear' },
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
    root.setSubtreeState(INTERACTION);
    root.find('/1/clear')?.setValue(true);
    expect(root.find('/0/list/0')?.state).toMatchObject(INTERACTION);
    expect(root.find('/0/list/1')?.state).toMatchObject(INTERACTION);
    expect(root.find('/1/list/0')?.state).toMatchObject(CLEARED);
    expect(root.find('/1/list/1')?.state).toMatchObject(CLEARED);
  });

  it('push binds a new item edge without replaying existing true edges', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('resetInteraction');
    root.find('/trigger')?.setValue(true);
    for (const child of list.children ?? []) child.setState(INTERACTION);
    list.push('new');
    expect(runtime.committedRuleValues?.size).toBe(4);
    expect(root.find('/list/3')?.state).toMatchObject(CLEARED);
    for (const index of [0, 1, 2])
      expect(root.find('/list/' + index)?.state).toMatchObject(INTERACTION);
  });

  it('remove unbinds the retired item before another reset edge', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('resetInteraction');
    /** Retained reference used to observe a removed item after detachment. */
    const retired = root.find('/list/1');
    for (const child of list.children ?? []) child.setState(INTERACTION);
    list.remove(1);
    expect(runtime.committedRuleValues?.size).toBe(2);
    root.find('/trigger')?.setValue(true);
    expect(root.find('/list/0')?.state).toMatchObject(CLEARED);
    expect(root.find('/list/1')?.state).toMatchObject(CLEARED);
    expect(retired?.state).toMatchObject(INTERACTION);
  });

  it('does not reset while the declaring fragment is off', () => {
    /** Mounted tree and public operations for this rule scenario. */
    const { root, list, runtime } = createFragmentArrayTree('resetInteraction');
    for (const child of list.children ?? []) child.setState(INTERACTION);
    root.find('/enabled')?.setValue(false);
    root.find('/trigger')?.setValue(true);
    for (const child of list.children ?? [])
      expect(child.state).toMatchObject(INTERACTION);
    expect(runtime.committedRuleValues?.size).toBe(0);
    root.find('/enabled')?.setValue(true);
    root.find('/trigger')?.setValue(false);
    root.find('/trigger')?.setValue(true);
    for (const child of list.children ?? [])
      expect(child.state).toMatchObject(CLEARED);
  });
});
