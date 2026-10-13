// filid:contract owned-inline-differential
import { describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '../type';
import { captureOwnedInlineObservables } from './fixtures/captureOwnedInlineObservables';
import headFixture from './fixtures/ownedInlineHead.json';

/** Generated on the recorded HEAD before product edits; never refresh from a candidate. */
const baseline: {
  head: string;
  corpus: number;
  edges: number;
  cases: { label: string; schema: BlueprintSchema; captures: unknown[] }[];
} = headFixture as {
  head: string;
  corpus: number;
  edges: number;
  cases: { label: string; schema: BlueprintSchema; captures: unknown[] }[];
};

describe('owned-inline HEAD differential', () => {
  it('preserves all 59 normalized graphs with collection off and on', () => {
    expect(baseline.head).toBe('baf4cacb647ad3de7dbff7c232efddf55b0bc546');
    expect(baseline.corpus).toBe(14);
    expect(baseline.edges).toBe(45);
    expect(baseline.cases).toHaveLength(59);
    for (const sample of baseline.cases) {
      for (let collect = 0; collect < 2; collect++) {
        const schema = structuredClone(sample.schema);
        const before = structuredClone(schema);
        expect(
          captureOwnedInlineObservables(schema, collect === 1),
          `${sample.label}: collect=${collect}`,
        ).toEqual(sample.captures[collect]);
        expect(schema, sample.label).toEqual(before);
      }
    }
  });
});
