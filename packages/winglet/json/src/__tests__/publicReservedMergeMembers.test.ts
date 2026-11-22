import { describe, expect, it } from 'vitest';

import { difference, mergePatch } from '../index';

describe('round-2 json 4: reserved member round trips', () => {
  it.each(['__proto__', 'constructor', 'prototype'])(
    'round trips %s like ordinary data',
    (key) => {
      const ordinary = mergePatch({}, difference({}, { item: { x: 1 } }));
      const result = mergePatch({}, difference({}, { [key]: { x: 1 } }));
      expect(Object.getOwnPropertyDescriptor(result, key)?.value).toEqual(
        Object.getOwnPropertyDescriptor(ordinary, 'item')?.value,
      );
      expect(Object.getPrototypeOf(result)).toBe(
        Object.getPrototypeOf(ordinary),
      );
      expect(
        mergePatch(
          { [key]: 1, a: 1 },
          difference({ [key]: 1, a: 1 }, { a: 1 }),
        ),
      ).toEqual(
        mergePatch({ item: 1, a: 1 }, difference({ item: 1, a: 1 }, { a: 1 })),
      );
    },
  );
});
