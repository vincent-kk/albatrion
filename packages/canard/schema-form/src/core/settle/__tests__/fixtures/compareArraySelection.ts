import { expect, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import { dispatchMount, subscribeSchemaNode } from '../../../dispatch';
import { SetValueOption } from '../../../types/value';
import * as selection from '../../utils/compute/selectChildren/utils/canReuseArrayChildren';
import { createTestTree } from './createTestTree';
import type { PlainNode } from './createPlainNode';
import { observeArraySelection } from './observeArraySelection';
import { observeDetachedReads } from './observeDetachedReads';

/**
 * Compare identical public writes with static array selection enabled and disabled.
 * @param schema - Authored declarations shared by independently owned trees
 * @param input - Initial source mounted before the measured history
 * @param steps - Public writes and whether each must use the shortcut
 * @returns Candidate tree after matching values, deliveries, records and departures
 */
export const compareArraySelection = (schema: BlueprintSchema, input: unknown,
  steps: readonly { apply: (root: PlainNode) => unknown; reuse: boolean }[],
): PlainNode => {
  const observations: unknown[][] = [];
  let candidate: PlainNode | undefined;
  for (const generic of [false, true]) {
    const { root } = createTestTree(schema);
    const delivered: unknown[] = [];
    const report = vi.fn();
    root.runtime.validationMode = 0;
    root.runtime.errorReporter = { hasConsumer: () => true, report };
    const listen = (node: PlainNode) => subscribeSchemaNode(node, event => {
      delivered.push({ path: node.path, event });
    });
    listen(root);
    const factory = root.runtime.nodeFactory;
    root.runtime.nodeFactory = (entry, parent, runtime) => {
      const node = factory(entry, parent, runtime);
      listen(node);
      return node;
    };
    dispatchMount(root, input, SetValueOption.Overwrite, { deferValidation: true });
    const history: unknown[] = [];
    const route = vi.spyOn(selection, 'canReuseArrayChildren');
    if (generic) route.mockReturnValue(false);
    try {
      for (const step of steps) {
        delivered.length = 0;
        report.mockClear();
        route.mockClear();
        const former = [...root.children ?? []];
        let result: unknown;
        try { result = step.apply(root); }
        catch (error) { result = error; }
        if (!generic) expect(route.mock.results.some(call => call.value === true))
          .toBe(step.reuse);
        history.push({ result, delivered: [...delivered], records: [...report.mock.calls],
          settlement: observeArraySelection(root),
          departed: observeDetachedReads(root, former) });
      }
    } finally { route.mockRestore(); }
    observations.push(history);
    if (!generic) candidate = root;
  }
  expect(observations[0]).toEqual(observations[1]);
  if (!candidate) throw new Error('Candidate history was not run');
  return candidate;
};
