import { afterEach, expect, it } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';
import { StaticFirstLoadCapability } from '../StaticFirstLoadCapability';
import { blueprint } from '../blueprint';
import type { BlueprintCacheEntry } from '../types/blueprint';

/** The actual conditional fixture includes the defaulted discriminator. */
const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', default: 'a' },
    value: { type: 'string' },
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
};
afterEach(() => engineModes.setMode('gateSelection', 'table'));
// filid:contract fixed-first-load-proof
it('T1 stores immutable mount-only evidence without broadening either old proof', () => {
  const cache = new WeakMap<object, BlueprintCacheEntry[]>();
  const result = blueprint(schema, { cache });
  const plan = Reflect.get(result, 'fixedFirstLoadPlan');
  expect(plan).toBeDefined();
  expect(Object.isFrozen(plan)).toBe(true);
  expect(Object.keys(result)).not.toContain('fixedFirstLoadPlan');
  expect(result.capabilities.branchless).toBe(false);
  expect(result.staticFirstLoadEligible).toBe(false);
  expect(StaticFirstLoadCapability.has(result)).toBe(false);
  engineModes.setMode('gateSelection', 'off');
  expect(blueprint(schema, { cache })).toBe(result);
  expect(Reflect.get(result, 'fixedFirstLoadPlan')).toBe(plan);
});
it('T1 leaves the old branchless array route unchanged and without a new plan', () => {
  const result = blueprint({ type: 'array', items: { type: 'string' } });
  expect(result.staticFirstLoadEligible).toBe(true);
  expect(Reflect.get(result, 'fixedFirstLoadPlan')).toBeUndefined();
});
