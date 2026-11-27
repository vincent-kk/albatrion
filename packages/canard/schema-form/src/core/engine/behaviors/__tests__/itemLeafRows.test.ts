import { describe, expect, it } from 'vitest';

import { blueprint } from '@/schema-form/core/engine/blueprint';
import type { BlueprintNode } from '@/schema-form/core/engine/blueprint';

import { BEHAVIORS, isItemLeafBehavior, selectBehavior } from '../behaviors';
import { booleanBehavior, booleanItemLeafBehavior } from '../booleanBehavior';
import { numberBehavior, numberItemLeafBehavior } from '../numberBehavior';
import { stringBehavior, stringItemLeafBehavior } from '../stringBehavior';
import { unionBehavior, unionItemLeafBehavior } from '../unionBehavior';

/** Each item leaf row beside the base row it wraps. */
const PAIRS = [
  [stringItemLeafBehavior, stringBehavior],
  [numberItemLeafBehavior, numberBehavior],
  [booleanItemLeafBehavior, booleanBehavior],
  [unionItemLeafBehavior, unionBehavior],
] as const;

/** Arrays whose item templates cover every selection outcome. */
const ANALYSIS = blueprint({
  type: 'object',
  properties: {
    texts: { type: 'array', items: { type: 'string' } },
    choices: { type: 'array', items: { type: ['string', 'number'] } },
    tuple: { type: 'array', prefixItems: [{ type: 'boolean' }] },
    nullableTexts: { type: 'array', items: { type: ['string', 'null'] } },
    nulls: { type: 'array', items: { type: 'null' } },
    objects: { type: 'array', items: { type: 'object' } },
  },
});

/**
 * Find the first item or tuple template of a root array property.
 * @param name - Root property holding the array
 * @returns The item template, or the first tuple position's template
 */
const readItemTemplate = (name: string): BlueprintNode => {
  const array = ANALYSIS.root.childEntries.find(
    (entry) => entry.name === name,
  )?.node;
  const item = array?.item ?? array?.prefixItems?.[0];
  if (!item) throw new Error(`Expected an item template under ${name}`);
  return item;
};

// filid:contract item-leaf-rows
describe('item leaf rows', () => {
  it('keep the slot order and every slot of their base row except assemble, which one wrapper serves', () => {
    for (const [item, base] of PAIRS) {
      expect(Object.isFrozen(item)).toBe(true);
      expect(Object.keys(item)).toEqual(Object.keys(base));
      for (const slot of Object.keys(base) as (keyof typeof base)[])
        if (slot !== 'assemble') expect(item[slot]).toBe(base[slot]);
      expect(item.assemble).not.toBe(base.assemble);
      expect(item.assemble).toBe(stringItemLeafBehavior.assemble);
    }
  });

  it('are selected only for a statically non-nullable string, number, boolean or union item of an array', () => {
    expect(selectBehavior(readItemTemplate('texts'), true)).toBe(
      stringItemLeafBehavior,
    );
    expect(selectBehavior(readItemTemplate('choices'), true)).toBe(
      unionItemLeafBehavior,
    );
    expect(selectBehavior(readItemTemplate('tuple'), true)).toBe(
      booleanItemLeafBehavior,
    );
    expect(selectBehavior(readItemTemplate('texts'), false)).toBe(
      stringBehavior,
    );
    for (const name of ['nullableTexts', 'nulls', 'objects']) {
      const template = readItemTemplate(name);
      expect(selectBehavior(template, true)).toBe(
        BEHAVIORS[template.kind]?.[template.strategy],
      );
    }
  });

  it('are the only rows the item leaf predicate recognizes', () => {
    for (const [item, base] of PAIRS) {
      expect(isItemLeafBehavior(item)).toBe(true);
      expect(isItemLeafBehavior(base)).toBe(false);
    }
    for (const strategies of Object.values(BEHAVIORS))
      for (const row of Object.values(strategies))
        expect(isItemLeafBehavior(row)).toBe(false);
  });
});
