import { expect, it } from 'vitest';

import { mergeHintGroup } from '../utils/merge/mergeHintGroup';

it('preserves a non-plain options payload even when it owns a virtual key', () => {
  class Choices {
    virtual = ['consumer data'];
  }
  for (const options of [
    new Choices(),
    Object.assign(['choice'], { virtual: 'consumer data' }),
  ])
    expect(mergeHintGroup(undefined, options, true)).toBe(options);
});

it('still removes virtual declarations from plain options without losing custom keys', () => {
  const custom = { data: 1 };
  expect(
    mergeHintGroup(
      undefined,
      { virtual: { group: { fields: ['a'] } }, custom },
      true,
    ),
  ).toEqual({ custom });
});
