import { describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import * as compiler from '../../blueprint/compileBlueprintExpressions/createDynamicFunction';
import { engineModes } from '../../utils/cache/engineModes';
import * as paths from '../../utils/paths/resolveDependencyPath';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as gates from '../utils/gates/evaluateGate';
import * as publication from '../utils/gates/flushPendingGateReads';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createFixedBranchSchema } from './fixtures/childSelection/createFixedBranchSchema';
import { expectedGateSelectionCalls } from './fixtures/expectedGateSelectionCalls';

// filid:contract settle-gate-path-resolution
describe('gate path resolution runtime visits', () => {
  it.each([5, 10, 20, 40])(
    'B=%i reuses pointer resolution with exact mode-specific expression calls',
    (count) => {
      const resolutions = new Array<number>(count).fill(0);
      const evaluations = new Array<number>(count).fill(0);
      const gateVisits = new Array<number>(count).fill(0);
      let currentBranch = -1;
      let total = 0;
      const resolve = paths.resolveDependencyPath;
      vi.spyOn(paths, 'resolveDependencyPath').mockImplementation((...args) => {
        total++;
        if (currentBranch >= 0) resolutions[currentBranch]++;
        return resolve(...args);
      });
      const compile = compiler.createDynamicFunction;
      vi.spyOn(compiler, 'createDynamicFunction').mockImplementation(
        (manager, key, source, boolean) => {
          const evaluate = boolean
            ? compile(manager, key, source, true)
            : compile(manager, key, source, false);
          if (!evaluate) return;
          const branch = /kind_(\d+)/.exec(source ?? '');
          return (dependencies) => {
            if (key === 'active' && branch) evaluations[Number(branch[1])]++;
            return evaluate(dependencies);
          };
        },
      );
      const evaluate = gates.evaluateGate;
      vi.spyOn(gates, 'evaluateGate').mockImplementation((gate, ...args) => {
        const previous = currentBranch;
        const branch = /kind_(\d+)/.exec(String(gate.condition));
        currentBranch = branch ? Number(branch[1]) : -1;
        if (branch) gateVisits[currentBranch]++;
        try {
          return evaluate(gate, ...args);
        } finally {
          currentBranch = previous;
        }
      });
      const flush = publication.flushPendingGateReads;
      vi.spyOn(publication, 'flushPendingGateReads').mockImplementation(
        (template, path, context) => {
          const previous = currentBranch;
          const branch = /payload_(\d+)_/.exec(path);
          currentBranch = branch ? Number(branch[1]) : -1;
          try {
            return flush(template, path, context);
          } finally {
            currentBranch = previous;
          }
        },
      );
      const previousMode = engineModes.gateWheel;
      try {
        engineModes.setMode('gateWheel', 'record');
        const { root } = createTestTree(createFixedBranchSchema(count));
        loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
        for (const [index, kind] of [
          'kind_4',
          'kind_0',
          'kind_4',
          'kind_0',
        ].entries()) {
          resolutions.fill(0);
          evaluations.fill(0);
          gateVisits.fill(0);
          total = 0;
          writeFieldNode(
            root.structure!.kind,
            kind,
            'input',
            WriteOption.Overwrite,
          );
          const expected = expectedGateSelectionCalls(
            engineModes.gateSelection,
            index === 0,
          );
          expect(evaluations).toEqual(
            new Array(count).fill(expected.expressions),
          );
          expect(gateVisits).toEqual(new Array(count).fill(expected.gates));
          for (let branch = 0; branch < count; branch++) {
            if (branch === 0 || branch === 4) continue;
            expect({ branch, resolutions: resolutions[branch] }).toEqual({
              branch,
              resolutions: 0,
            });
          }
          expect(total).toBe(0);
          expect(root.runtime.diagnostics.status).toBe('stable');
        }
      } finally {
        vi.restoreAllMocks();
        engineModes.setMode('gateWheel', previousMode);
      }
    },
  );
});
