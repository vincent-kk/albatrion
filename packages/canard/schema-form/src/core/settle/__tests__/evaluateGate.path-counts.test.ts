import { describe, expect, it, vi } from 'vitest';

import * as compiler from '../../blueprint/utils/expressions/createDynamicFunction';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as gates from '../utils/gates/evaluateGate';
import * as publication from '../utils/gates/flushPendingGateReads';
import * as paths from '../utils/paths/resolveDependencyPath';
import { createTestTree } from './fixtures/createTestTree';
import { createFixedBranchSchema } from './helpers/childSelection/createFixedBranchSchema';

// filid:contract settle-gate-path-resolution
describe('gate path resolution runtime visits', () => {
  it.each([5, 10, 20, 40])('B=%i resolves each pointer once while evaluating every condition', count => {
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
    vi.spyOn(compiler, 'createDynamicFunction').mockImplementation((manager, key, source, boolean) => {
      const evaluate = boolean ? compile(manager, key, source, true) : compile(manager, key, source, false);
      if (!evaluate) return;
      const branch = /kind_(\d+)/.exec(source ?? '');
      return dependencies => {
        if (key === 'active' && branch) evaluations[Number(branch[1])]++;
        return evaluate(dependencies);
      };
    });
    const evaluate = gates.evaluateGate;
    vi.spyOn(gates, 'evaluateGate').mockImplementation((gate, ...args) => {
      const previous = currentBranch;
      const branch = /kind_(\d+)/.exec(String(gate.condition));
      currentBranch = branch ? Number(branch[1]) : -1;
      if (branch) gateVisits[currentBranch]++;
      try { return evaluate(gate, ...args); }
      finally { currentBranch = previous; }
    });
    const flush = publication.flushPendingGateReads;
    vi.spyOn(publication, 'flushPendingGateReads').mockImplementation((template, path, context) => {
      const previous = currentBranch;
      const branch = /payload_(\d+)_/.exec(path);
      currentBranch = branch ? Number(branch[1]) : -1;
      try { return flush(template, path, context); }
      finally { currentBranch = previous; }
    });
    try {
      const { root } = createTestTree(createFixedBranchSchema(count));
      loadSchemaNodeAtMount(root, { kind: 'kind_0' }, SetValueOption.Overwrite);
      for (const [index, kind] of ['kind_4', 'kind_0', 'kind_4', 'kind_0'].entries()) {
        resolutions.fill(0); evaluations.fill(0); gateVisits.fill(0); total = 0;
        writeSchemaNode(root.structure!.kind, kind, 'input', SetValueOption.Overwrite);
        expect(evaluations).toEqual(new Array(count).fill(index === 0 ? 16 : 8));
        expect(evaluations).toEqual(gateVisits);
        for (let branch = 0; branch < count; branch++) {
          if (branch === 0 || branch === 4) continue;
          expect({ branch, resolutions: resolutions[branch] }).toEqual({ branch, resolutions: 0 });
        }
        expect(total).toBe(0);
        expect(root.runtime.diagnostics.status).toBe('stable');
      }
    } finally { vi.restoreAllMocks(); }
  });
});
