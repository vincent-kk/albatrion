// Runs only in the verify bundle because it asserts the shadow setup contract.
import { expect, it } from 'vitest';

import { deriveShadowEvaluation } from '../utils/derivation/deriveShadowEvaluation';

it('enables shadow verification through the package test setup', () => {
  expect(deriveShadowEvaluation.enabled).toBe(true);
});
