import { afterEach, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import * as directSelection from '../../utils/compute/childSelection/getDirectChildSelectionPlan';
import * as gateSelection from '../../utils/compute/childSelection/getGateSelectionTable';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as staticLoader from '../utils/staticFirst/loadStaticFirstTree';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-static-gate-selection-preparation
it('reaches the static loader without preparing a branchless blueprint', () => {
  const { root, blueprint } = createTestTree({
    type: 'object',
    properties: { value: { type: 'string', default: 'literal' } },
  });
  const loading = vi.spyOn(staticLoader, 'loadStaticFirstTree');
  const tables = vi.spyOn(gateSelection, 'getGateSelectionTable');
  const builds = vi.spyOn(directSelection.DIRECT_CHILD_SELECTION_PLANS, 'set');
  loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
  expect(loading).toHaveBeenCalledOnce();
  expect(tables).not.toHaveBeenCalled();
  expect(builds).not.toHaveBeenCalled();
  expect(directSelection.DIRECT_CHILD_SELECTION_PLANS.has(blueprint.root)).toBe(
    false,
  );
});
