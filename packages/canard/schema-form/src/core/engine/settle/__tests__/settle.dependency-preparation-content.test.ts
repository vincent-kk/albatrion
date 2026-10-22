import { describe, expect, it } from 'vitest';

import { captureDependencyPreparation } from './fixtures/gate-table/captureDependencyPreparation';
import { gateTableLoadingCases } from './fixtures/gate-table/gateTableLoadingCases';

// filid:contract settle-dependency-preparation-content
describe('pre-change dependency index and table preparation', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    'preserves loading fixture %i content, order and object sharing',
    async (index) => {
      const fixture = gateTableLoadingCases[index];
      await expect(
        captureDependencyPreparation(fixture.schema, fixture.input),
      ).toMatchFileSnapshot(
        `./fixtures/gate-table/preparation/loading-${index}.json`,
      );
    },
  );
});
