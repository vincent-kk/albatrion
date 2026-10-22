import { afterEach, describe, expect, it } from 'vitest';

import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';

import type { BlueprintSchema } from '../../blueprint';
import { dispatchSetValue } from '../../write';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

/** Each history restores both internal controls for subsequent regression files. */
const previousWheelMode = gateWheelEvaluation.mode;
/** Selection modes share the same retained-child projection registration. */
const previousSelectionMode = gateSelectionTable.mode;
afterEach(() => {
  gateWheelEvaluation.mode = previousWheelMode;
  gateSelectionTable.mode = previousSelectionMode;
});

describe.each(['record', 'skip', 'shadow'] as const)(
  'projection presence readers: %s',
  (wheelMode) => {
    it.each(['gap-overlay-empty', 'gap-overlay-trailing'])(
      '%s updates outside readers and restores them when the overlay exits',
      (id) => {
        const scene = createOverlayScenes().find((scene) => scene.id === id)!;
        const schema = scene.schema as BlueprintSchema;
        gateWheelEvaluation.mode = wheelMode;
        for (const selectionMode of ['off', 'table', 'verify'] as const) {
          gateSelectionTable.mode = selectionMode;
          const root = mountPresenceTree(schema, scene.initialValue);
          for (const flag of [true, false]) {
            dispatchSetValue(getDispatchNode(root, 'source', 'flag'), flag);
            const observer = getDispatchNode(root, 'observer');
            const state = getDispatchNode(observer, 'state');
            expect(state.visible).toBe(!flag);
            expect(state.readOnly).toBe(!flag);
            expect(state.disabled).toBe(!flag);
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
