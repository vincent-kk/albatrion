import type { FormScenario } from '../../types';

/** Item count of the large array. */
const itemCount = 1000;

/** A virtualized array of a thousand strings. */
const largeArraySchema = { type: 'object', properties: { items: { type: 'array', items: { type: 'string' } } } };

/** Loaded items "item-0" .. "item-999". */
const largeArrayValue = { items: Array.from({ length: itemCount }, (_, index) => `item-${index}`) };

/** A thousand-item array stays editable at both ends, and verbs keep working at that size. */
export const largeArrayScenario: FormScenario = {
  name: 'scale.large-array',
  description: 'A thousand-item array under virtualization edits its last item, appends and removes like a small one: push adds item 1000, remove(0) shifts every item by one, and the last item keeps its edit. No timing is asserted; the story scrolls to the end and types into the revealed input.',
  schema: largeArraySchema,
  initialValue: largeArrayValue,
  steps: [
    { action: 'batch', steps: [], expect: { values: { '/items/0': 'item-0', '/items/999': 'item-999' } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/items/999', value: 'edited' }], expect: { values: { '/items/999': 'edited' } } },
    { action: 'push', path: '/items', value: 'appended', expect: { values: { '/items/1000': 'appended', '/items/999': 'edited' } } },
    { action: 'remove', path: '/items', index: 0, expect: {
      values: { '/items/0': 'item-1', '/items/998': 'edited', '/items/999': 'appended' }, shape: { '/items/1000': 'absent' },
    } },
  ],
};

/** Text the story types at the end of the revealed last item. */
export const largeArrayTyped = '!';
