import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as registration from '../utils/dependencies/registerRecalculation';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';

/** Restore shared verification controls after deliberate invariant violations. */
const previous = {
  mode: gateSelectionTable.mode,
  violations: gateSelectionTable.violations,
};
afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(gateSelectionTable, previous);
});

// filid:contract settle-write-epoch-verification
it('verify mode compares epoch members against an independent path shadow', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'string' } },
  });
  dispatchMount(root, { a: 'old' });
  gateSelectionTable.mode = 'verify';
  const before = gateSelectionTable.assertions.S7 ?? 0;
  dispatchSetValue(root, { a: 'new' });
  expect(gateSelectionTable.assertions.S7).toBeGreaterThan(before);
  expect(root.emit).toEqual({ a: 'new' });
});

it('verify mode rejects a missing actual node generation before computation', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'string' } },
  });
  dispatchMount(root, { a: 'old' });
  gateSelectionTable.mode = 'verify';
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
