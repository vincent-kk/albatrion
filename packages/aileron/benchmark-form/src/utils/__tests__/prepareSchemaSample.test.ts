import { expect, it } from 'vitest';

import { equivalentFixtures } from '../../../fixtures/equivalent';
import { arrayFixtures } from '../../../fixtures/equivalent/arrays';
import { prepareSchemaSample } from '../prepareSchemaSample';

it('retains warm identity and creates independent cold schema identities', () => {
  const fixture = arrayFixtures[1];
  expect(prepareSchemaSample(fixture, 'warm')).toBe(fixture);
  const first = prepareSchemaSample(fixture, 'cold');
  const second = prepareSchemaSample(fixture, 'cold');
  expect(first.workspace).toEqual(fixture.workspace);
  expect(first.legacy).toEqual(fixture.legacy);
  expect(first.workspace).not.toBe(fixture.workspace);
  expect(first.workspace).not.toBe(second.workspace);
  expect(first.legacy).not.toBe(second.legacy);
  expect(first.interactions).toBe(fixture.interactions);
});

it('labels array cases by their actual initial item count', () => {
  for (const fixture of equivalentFixtures.filter(({ name }) =>
    name.startsWith('array-'),
  )) {
    expect(fixture.initialItems).toBe(
      fixture.workspace.properties!.items.default.length,
    );
    expect(fixture.initialItems).toBe(
      fixture.legacy.properties!.items.default.length,
    );
  }
});
