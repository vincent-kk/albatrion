import { expect, vi } from 'vitest';

import * as planning from '../../../utils/compute/selectChildren/utils/getDirectChildSelectionPlan';

/**
 * Observe first successful preparation by its runtime identity, excluding cache reads.
 * @returns Build records; restore mocks after the history completes
 */
export const observeChildSelectionPlans = () => {
  const plans: object[] = [];
  const hosts: object[] = [];
  const original = planning.getDirectChildSelectionPlan;
  vi.spyOn(planning, 'getDirectChildSelectionPlan').mockImplementation((host, blueprint, prepare) => {
    const plan = original(host, blueprint, prepare);
    if (plan && !plans.includes(plan)) {
      expect(prepare).toBe(true);
      plans.push(plan);
      hosts.push(host);
    }
    return plan;
  });
  return { plans, hosts };
};
