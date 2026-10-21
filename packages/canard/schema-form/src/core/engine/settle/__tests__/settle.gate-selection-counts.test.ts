import { describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import * as compiler from '../../blueprint/compileBlueprintExpressions/createDynamicFunction';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-gate-selection-counts
describe('baseline fixed-width branch-axis characterization', () => {
  it.each([5, 10, 20, 40])(
    'B=%i distinguishes first payload fill from prepared transitions',
    (count) => {
      let evaluations = 0;
      const compile = compiler.createDynamicFunction;
      const compiling = vi
        .spyOn(compiler, 'createDynamicFunction')
        .mockImplementation((manager, key, source, boolean) => {
          const evaluate = boolean
            ? compile(manager, key, source, true)
            : compile(manager, key, source, false);
          if (!evaluate) return;
          return (dependencies: unknown[]) => {
            if (key === 'active') evaluations++;
            return evaluate(dependencies);
          };
        });
      const previousMode = gateWheelEvaluation.mode;
      const previousSelectionMode = gateSelectionTable.mode;
      try {
        gateWheelEvaluation.mode = 'record';
        gateSelectionTable.mode = 'table';
        const schema = {
          type: 'object',
          properties: {
            common: { type: 'string', default: 'shared' },
            kind: { type: 'string', default: 'kind_0' },
          },
          oneOf: Array.from({ length: count }, (_, index) => ({
            controls: { active: `./kind === 'kind_${index}'` },
            properties: {
              [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
              [`payload_${index}_b`]: { type: 'number', default: index },
              [`payload_${index}_c`]: {
                type: 'boolean',
                default: index % 2 === 0,
              },
            },
          })),
        } as const;
        const { root } = createTestTree(schema);
        loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
        const transitions = [
          { kind: 'kind_4', calls: 0 },
          { kind: 'kind_0', calls: 0 },
          { kind: 'kind_4', calls: 0 },
          { kind: 'kind_0', calls: 0 },
        ];
        for (const transition of transitions) {
          evaluations = 0;
          writeFieldNode(
            root.structure!.kind,
            transition.kind,
            'input',
            WriteOption.Overwrite,
          );
          expect(evaluations).toBe(transition.calls);
          expect(root.children).toHaveLength(5);
          expect(root.runtime.diagnostics.status).toBe('stable');
          expect(Buffer.byteLength(JSON.stringify(root.emit))).toBe(90);
        }
      } finally {
        compiling.mockRestore();
        gateWheelEvaluation.mode = previousMode;
        gateSelectionTable.mode = previousSelectionMode;
      }
    },
  );
});
