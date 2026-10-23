import { describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as steps from '../utils/compute/childSelection/selectEntryStep';
import * as evaluating from '../utils/gates/evaluateGate';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import * as prePublication from '../utils/gates/verifyTablePrePublication';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';

// filid:contract settle-gate-table-loading-counts
describe('prepared gate tables during the load pass', () => {
  it.each([5, 80])(
    'N=%i retains exact mount evaluation and visit counts',
    (count) => {
      const previousTable = gateSelectionTable.mode;
      const previousWheel = gateWheelEvaluation.mode;
      const observations: unknown[] = [];
      try {
        gateWheelEvaluation.mode = 'skip';
        for (const mode of ['off', 'verify'] as const) {
          gateSelectionTable.mode = mode;
          const { root } = createTestTree(
            gateTableCases[count === 5 ? 0 : 1].schema,
          );
          const evaluate = evaluating.evaluateGate;
          const select = steps.selectEntryStep;
          const verifyPrePublication = prePublication.verifyTablePrePublication;
          let evaluations = 0;
          let visits = 0;
          let prePublications = 0;
          const evaluateSpy = vi
            .spyOn(evaluating, 'evaluateGate')
            .mockImplementation((...args) => {
              evaluations++;
              return evaluate(...args);
            });
          const stepSpy = vi
            .spyOn(steps, 'selectEntryStep')
            .mockImplementation((...args) => {
              visits++;
              return select(...args);
            });
          const prePublicationSpy = vi
            .spyOn(prePublication, 'verifyTablePrePublication')
            .mockImplementation((...args) => {
              prePublications++;
              return verifyPrePublication(...args);
            });
          try {
            loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
          } finally {
            evaluateSpy.mockRestore();
            stepSpy.mockRestore();
            prePublicationSpy.mockRestore();
          }
          observations.push({ mode, count, evaluations, visits });
          expect(prePublications > 0).toBe(mode === 'verify');
          console.log(
            'GATE_TABLE_LOAD_COUNTS',
            JSON.stringify(observations.at(-1)),
          );
          expect({ evaluations, visits }).toEqual(
            mode === 'off'
              ? { evaluations: 20 * count, visits: 5 * (3 * count + 2) }
              : { evaluations: 0, visits: 22 },
          );
          expect(gateSelectionTable.violations).toBe(0);
          expect(root.emit).toEqual({
            common: 'shared',
            kind: 'kind_0',
            payload_0_a: 'a_0',
            payload_0_b: 0,
            payload_0_c: true,
          });
        }
      } finally {
        gateSelectionTable.mode = previousTable;
        gateWheelEvaluation.mode = previousWheel;
      }
    },
  );
});
