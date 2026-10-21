import { describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as steps from '../utils/compute/childSelection/selectEntryStep';
import * as roots from '../utils/compute/selectNodeSchema';
import * as evaluating from '../utils/gates/evaluateGate';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';

// filid:contract settle-gate-table-selection
describe('untimed attribution at the fixed-width first switch', () => {
  it('N=80 has exact old and new child, root and step counts', () => {
    const selectionMode = gateSelectionTable.mode;
    const wheelMode = gateWheelEvaluation.mode;
    const observations: unknown[] = [];
    try {
      gateWheelEvaluation.mode = 'skip';
      for (const mode of ['off', 'table'] as const) {
        gateSelectionTable.mode = mode;
        const { root } = createTestTree(gateTableCases[1].schema);
        loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
        let rootPhase = false;
        let rootEvaluations = 0;
        let childEvaluations = 0;
        let stepVisits = 0;
        const selectRoot = roots.selectNodeSchema;
        const evaluate = evaluating.evaluateGate;
        const select = steps.selectEntryStep;
        const rootSpy = vi
          .spyOn(roots, 'selectNodeSchema')
          .mockImplementation((...args) => {
            rootPhase = true;
            try {
              return selectRoot(...args);
            } finally {
              rootPhase = false;
            }
          });
        const evaluateSpy = vi
          .spyOn(evaluating, 'evaluateGate')
          .mockImplementation((...args) => {
            if (rootPhase) rootEvaluations++;
            else childEvaluations++;
            return evaluate(...args);
          });
        const stepSpy = vi
          .spyOn(steps, 'selectEntryStep')
          .mockImplementation((...args) => {
            stepVisits++;
            return select(...args);
          });
        try {
          writeFieldNode(
            root.structure!.kind,
            'kind_79',
            'input',
            WriteOption.Overwrite,
          );
        } finally {
          rootSpy.mockRestore();
          evaluateSpy.mockRestore();
          stepSpy.mockRestore();
        }
        const counts = { mode, rootEvaluations, childEvaluations, stepVisits };
        expect(counts).toEqual(
          mode === 'off'
            ? {
                mode,
                rootEvaluations: 160,
                childEvaluations: 480,
                stepVisits: 484,
              }
            : { mode, rootEvaluations: 0, childEvaluations: 0, stepVisits: 16 },
        );
        observations.push(counts);
      }
      console.log('GATE_TABLE_COUNTS', JSON.stringify(observations));
    } finally {
      gateSelectionTable.mode = selectionMode;
      gateWheelEvaluation.mode = wheelMode;
    }
  });
});
