// Runs only in the verify bundle because it asserts the shadow setup contract.
import { expect, it } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';

it('enables shadow verification through the package test setup', () => {
  expect(engineModes.deriveShadow).toBe(true);
});
