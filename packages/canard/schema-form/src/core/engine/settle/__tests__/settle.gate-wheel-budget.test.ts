import { expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import { FormErrorCode } from '@/schema-form/errors';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as budget from '../utils/gates/getGateBudgetCap';
import { writeFieldNode } from '../utils/write/writeFieldNode';

it('P1 retains BudgetExceeded when a changed wheel consumes the complete cap', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      sw: { type: 'number' },
      p: { type: 'number', controls: { active: '../sw >= 0' } },
    },
  });
  loadFieldNodeAtMount(root, { sw: 1 }, WriteOption.Overwrite);
  const previousMode = engineModes.gateWheel;
  engineModes.setMode('gateWheel', 'skip');
  const cap = vi.spyOn(budget, 'getHostWheelBudgetCap').mockReturnValue(1);
  try {
    expect(() =>
      writeFieldNode(root.structure!.sw, 2, 'input', WriteOption.Overwrite),
    ).toThrow(expect.objectContaining({ code: FormErrorCode.BudgetExceeded }));
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      exceededBudget: 'hostWheel',
      iterations: 1,
    });
  } finally {
    cap.mockRestore();
    engineModes.setMode('gateWheel', previousMode);
  }
});
