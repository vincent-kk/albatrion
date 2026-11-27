import { expect, it } from 'vitest';

import { coreObservability as mirrored } from '../../../scripts/coreObservability.mjs';
import { coreObservability } from '../coreObservability';

it('keeps the script mirror equal to the canonical observability table', () => {
  expect(JSON.parse(JSON.stringify(mirrored))).toEqual(
    JSON.parse(JSON.stringify(coreObservability)),
  );
});
