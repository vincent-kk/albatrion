import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import { WriteOption } from '../../../types/value';
import { engineModes } from '../../../utils/cache/engineModes';
import { dispatchSetValue } from '../../../write';
import { observeFixedFirstLoad } from './fixtures/observeFixedFirstLoad';

/** Fixed membership with scalar defaults and both constraint branches. */
const schema: BlueprintSchema = {
  type: 'object',
  properties: {
    kind: { type: 'string', default: 'a' },
    value: { type: 'string', default: 'x' },
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
  else: { properties: { value: { maxLength: 3 } } },
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// filid:contract fixed-first-load-modes
it.each([
  ['on', 'table', 'skip', false, true],
  ['off', 'off', 'record', false, true],
  ['on', 'off', 'skip', false, true],
  ['on', 'verify', 'skip', false, false],
  ['on', 'table', 'shadow', false, false],
  ['on', 'table', 'skip', true, false],
] as const)(
  'T13 predicate=%s selection=%s wheel=%s derive=%s',
  (predicate, selection, wheel, derive, admitted) => {
    engineModes.setMode('gatePredicate', predicate);
    engineModes.setMode('gateSelection', selection);
    engineModes.setMode('gateWheel', wheel);
    engineModes.setMode('deriveShadow', derive);
    try {
      const actual = observeFixedFirstLoad(schema, { dispatch: true });
      const oracle = observeFixedFirstLoad(schema, {
        dispatch: true,
        general: true,
      });
      expect(actual.snapshot()).toEqual(oracle.snapshot());
      expect(actual.prepared).toBe(admitted);
      dispatchSetValue(actual.root.structure!.kind, 'b', WriteOption.Overwrite);
      dispatchSetValue(oracle.root.structure!.kind, 'b', WriteOption.Overwrite);
      expect(actual.snapshot()).toEqual(oracle.snapshot());
    } finally {
      engineModes.setMode('gatePredicate', 'on');
      engineModes.setMode('gateSelection', 'table');
      engineModes.setMode('gateWheel', 'skip');
      engineModes.setMode('deriveShadow', false);
    }
  },
);
