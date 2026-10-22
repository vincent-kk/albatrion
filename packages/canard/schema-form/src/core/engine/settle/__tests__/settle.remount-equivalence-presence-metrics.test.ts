import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createAncestorScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createAncestorScenes';
import { checkCoreScene } from '@/schema-form/core/__tests__/remount-equivalence/helpers/checkCoreScene';

import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import * as settlement from '../utils/settlement/createSettlementContext';

const previousMode = gateWheelEvaluation.mode;
afterEach(() => {
  vi.restoreAllMocks();
  gateWheelEvaluation.mode = previousMode;
});

it('the ancestor lattice reaches recorded rechecks and wheel promotion', async () => {
  gateWheelEvaluation.mode = 'record';
  const contexts: ReturnType<typeof settlement.createSettlementContext>[] = [];
  const create = settlement.createSettlementContext;
  vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
    (...args) => {
      const context = create(...args);
      contexts.push(context);
      return context;
    },
  );
  const missing = [];
  const expectations = {
    'gap-ancestor-sibling-d0-c2-active': false,
    'gap-ancestor-sibling-d0-c2-visible': false,
    'gap-ancestor-sibling-d0-c4-active': false,
    'gap-ancestor-sibling-d0-c4-visible': false,
    'gap-ancestor-sibling-d2-c2-active': true,
    'gap-ancestor-sibling-d2-c2-visible': true,
    'gap-ancestor-sibling-d2-c4-active': true,
    'gap-ancestor-sibling-d2-c4-visible': true,
    'gap-ancestor-cousin-d0-c2-active': false,
    'gap-ancestor-cousin-d0-c2-visible': false,
    'gap-ancestor-cousin-d0-c4-active': false,
    'gap-ancestor-cousin-d0-c4-visible': false,
    'gap-ancestor-cousin-d2-c2-active': true,
    'gap-ancestor-cousin-d2-c2-visible': true,
    'gap-ancestor-cousin-d2-c4-active': true,
    'gap-ancestor-cousin-d2-c4-visible': true,
  };
  expect(createAncestorScenes().map(({ id }) => id)).toEqual(
    Object.keys(expectations),
  );
  for (const scene of createAncestorScenes()) {
    contexts.length = 0;
    const mismatches = await checkCoreScene(scene);
    const rechecks = contexts.reduce(
      (total, context) =>
        total + (context.presenceMetrics?.ancestorRechecks ?? 0),
      0,
    );
    const wheels = contexts.reduce(
      (total, context) =>
        total + (context.presenceMetrics?.ancestorWheels ?? 0),
      0,
    );
    console.log(
      'REMOUNT_PRESENCE_REACH',
      JSON.stringify({ scene: scene.id, rechecks, wheels }),
    );
    const needsRecheck = expectations[scene.id as keyof typeof expectations];
    if (
      (needsRecheck ? rechecks <= 0 : rechecks !== 0) ||
      wheels <= 0 ||
      mismatches.length
    )
      missing.push({ scene: scene.id, rechecks, wheels, mismatches });
  }
  expect(missing).toEqual([]);
}, 120000);

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
