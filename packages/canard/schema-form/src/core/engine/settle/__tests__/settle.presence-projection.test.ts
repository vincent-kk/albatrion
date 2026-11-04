import { afterEach, describe, expect, it } from 'vitest';

import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';

import type { BlueprintSchema } from '../../blueprint';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchSetValue } from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

/** Each history restores both internal controls for subsequent regression files. */
const previousWheelMode = engineModes.gateWheel;
/** Selection modes share the same retained-child projection registration. */
const previousSelectionMode = engineModes.gateSelection;
afterEach(() => {
  engineModes.setMode('gateWheel', previousWheelMode);
  engineModes.setMode('gateSelection', previousSelectionMode);
});

describe.each(['record', 'skip', 'shadow'] as const)(
  'projection presence readers: %s',
  (wheelMode) => {
    it.each(['gap-overlay-empty', 'gap-overlay-trailing'])(
      '%s updates outside readers and restores them when the overlay exits',
      (id) => {
        const scene = createOverlayScenes().find((scene) => scene.id === id)!;
        const schema = scene.schema as BlueprintSchema;
        engineModes.setMode('gateWheel', wheelMode);
        for (const selectionMode of ['off', 'table', 'verify'] as const) {
          engineModes.setMode('gateSelection', selectionMode);
          const root = mountPresenceTree(schema, scene.initialValue);
          for (const flag of [true, false]) {
            dispatchSetValue(getDispatchNode(root, 'source', 'flag'), flag);
            const observer = getDispatchNode(root, 'observer');
            const state = getDispatchNode(observer, 'state');
            expect(state.isVisible).toBe(!flag);
            expect(state.isReadOnly).toBe(!flag);
            expect(state.isDisabled).toBe(!flag);
            const gate = getDispatchNode(observer, 'gate');
            expect(gate.structure?.leaf !== undefined).toBe(!flag);
            const fresh = mountPresenceTree(schema, root.emit);
            expect(observePresenceTree(observer)).toEqual(
              observePresenceTree(getDispatchNode(fresh, 'observer')),
            );
          }
        }
      },
    );
  },
);
