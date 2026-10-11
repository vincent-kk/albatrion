import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '../index';

afterEach(() => vi.restoreAllMocks());

it('82C-01 patches one object leaf without enumerating its previous siblings', () => {
  const root = nodeFromJSONSchema({ jsonSchema: { type: 'object',
    properties: Object.fromEntries(Array.from({ length: 100 }, (_, index) =>
      [`value${index}`, { type: 'string', default: 'before' }])),
  }, validationMode: 0 });
  const previous = root.value;
  const keys = Object.keys;
  let fullScans = 0;
  vi.spyOn(Object, 'keys').mockImplementation((value) => {
    if (value === previous) fullScans++;
    return keys(value);
  });
  root.find('/value0')!.setValue('after');
  expect(root.value).toEqual({ ...previous, value0: 'after' });
  expect(fullScans).toBe(0);
  const committed = root.value;
  root.find('/value0')!.setValue('after');
  expect(root.value).toBe(committed);
});
