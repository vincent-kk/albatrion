import { afterEach, expect, it, vi } from 'vitest';

import { pinSlotShipping } from '../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as registration from '../utils/dependencies/registerRecalculation';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';

/** Restore shared verification controls after deliberate invariant violations. */
const previousMode = engineModes.gateSelection;
const previous = {
  violations: gateSelectionTable.violations,
};
afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(gateSelectionTable, previous);
  engineModes.setMode('gateSelection', previousMode);
});

// filid:contract settle-write-epoch-verification
it('verify mode compares epoch members against an independent path shadow', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'string' } },
  });
  dispatchMount(root, { a: 'old' });
  engineModes.setMode('gateSelection', 'verify');
  const before = gateSelectionTable.assertions.S7 ?? 0;
  dispatchSetValue(root, { a: 'new' });
  expect(gateSelectionTable.assertions.S7).toBeGreaterThan(before);
  expect(root.emit).toEqual({ a: 'new' });
});

it('verify mode rejects a missing actual node generation before computation', () => {
  // The injected generation mutation targets one shipping tree's invariant check.
  pinSlotShipping();
  const { root } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'string' } },
  });
  dispatchMount(root, { a: 'old' });
  engineModes.setMode('gateSelection', 'verify');
  const register = registration.registerRecalculation;
  vi.spyOn(registration, 'registerRecalculation').mockImplementation(
    (context) => {
      Reflect.set(root.structure!.a, 'writeEpoch', 0);
      register(context);
    },
  );
  expect(() => dispatchSetValue(root, { a: 'new' })).toThrow(
    'S7 write epoch members differ',
  );
});
