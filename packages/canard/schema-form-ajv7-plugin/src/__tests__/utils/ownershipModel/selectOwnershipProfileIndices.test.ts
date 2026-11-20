import { expect, it } from 'vitest';

import { selectOwnershipProfileIndices } from './selectOwnershipProfileIndices';

const signature = (index: number) =>
  JSON.stringify([
    index % 4,
    index % 3,
    index % 7 === 0,
    index % 5 === 0,
    index % 11 === 0,
    index % 13 === 0,
  ]);
it('PR retains every native dialect, host and bootstrap option profile without repeated seeds', () => {
  const complete = Array.from({ length: 128 }, (_, index) => index);
  const selected = Array.from({ length: 16 }, (_, batch) =>
    selectOwnershipProfileIndices(batch, false),
  ).flat();
  expect(new Set(selected.map(signature))).toEqual(
    new Set(complete.map(signature)),
  );
  expect(selected).toHaveLength(58);
  expect(selected).toEqual(expect.arrayContaining([0, 1, 2, 3]));
  for (let batch = 0; batch < 16; batch++)
    expect(selectOwnershipProfileIndices(batch, false).length).toBeGreaterThan(
      0,
    );
});
it('pre-release retains the original 2048 seeds and their batch indices', () => {
  const complete = Array.from({ length: 128 }, (_, index) => index);
  for (let batch = 0; batch < 16; batch++)
    expect(selectOwnershipProfileIndices(batch, true)).toEqual(complete);
});
