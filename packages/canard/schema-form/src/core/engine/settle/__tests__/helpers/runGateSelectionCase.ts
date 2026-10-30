import type { Blueprint } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../../loadFieldNodeAtMount';
import { resetFieldNodeForm } from '../../utils/reset/resetFieldNodeForm';
import { resetFieldNodeSubtree } from '../../utils/reset/resetFieldNodeSubtree';
import { writeFieldNode } from '../../utils/write/writeFieldNode';
import { collectRetainedSlotSources } from '../fixtures/collectRetainedSlotSources';
import type { gateSelectionCases } from '../fixtures/gateSelectionCases';

/**
 * Run one authored history and capture values, shape, delivery order and failures.
 * @param fixture - Fixed verifier boundary and its input history
 * @param configure - Internal mode hook before the first baseline evaluation
 * @param observe - Optional extra observation of the root, recorded as `extra` after every settlement
 * @param snapshot - Optional checkpoint copier before later settlements can mutate retained payloads
 * @returns Deterministic observations immediately after every settlement
 */
export const runGateSelectionCase = (
  fixture: (typeof gateSelectionCases)[number],
  configure: (analysis: Blueprint) => void = () => {},
  observe?: (root: PlainNode) => unknown,
  snapshot?: (observation: unknown) => unknown,
) => {
  const { root, visits } = createTestTree(
    fixture.schema,
    undefined,
    {},
    configure,
  );
  root.runtime.context = { gate: () => true };
  const observations: unknown[] = [];
  const capture = (failure: unknown): void => {
    const nodes: unknown[] = [];
    const pending: PlainNode[] = [root];
    while (pending.length) {
      const node = pending.pop()!;
      nodes.push({
        path: node.path,
        kind: node.blueprintNode.kind,
        schema: node.schema,
        raw: node.raw,
        undeclaredValues: node.undeclaredValues,
        local: node.local,
        emit: node.emit,
        active: node.active,
        visible: node.visible,
        disabled: node.disabled,
        revisions: node.revisionLedger,
        pendingRevision: node.pendingRevision,
        delivery: node.pendingDelivery,
        deliveryChanges: node.deliveryChanges,
      });
      const children = node.children ?? [];
      for (let index = children.length - 1; index >= 0; index--)
        if (children[index].parent === node) pending.push(children[index]);
    }
    const observation = {
      nodes,
      failure: failure instanceof Error ? failure.message : failure,
      diagnostics: { ...root.runtime.diagnostics },
      commit: root.runtime.commitNumber,
      globalState: { ...root.runtime.globalState },
      latent: collectRetainedSlotSources(root),
      deliveries: [...(root.runtime.deliveries ?? [])].map((node) => node.path),
      visits: [...visits],
      ...(observe ? { extra: observe(root) } : {}),
    };
    observations.push(snapshot ? snapshot(observation) : observation);
  };
  let failure: unknown;
  try {
    loadFieldNodeAtMount(root, fixture.input, WriteOption.Overwrite);
  } catch (cause) {
    failure = cause;
  }
  capture(failure);
  for (const write of fixture.writes) {
    if (write.context) root.runtime.context = write.context;
    let target = root;
    for (const segment of write.path?.slice(1).split('/') ?? [])
      target =
        target.structure![segment.replace(/~1/g, '/').replace(/~0/g, '~')];
    failure = undefined;
    try {
      if (write.reset === 'form')
        resetFieldNodeForm(root, write.value, WriteOption.Overwrite);
      else if (write.reset === 'subtree')
        resetFieldNodeSubtree(target, WriteOption.Overwrite);
      else
        writeFieldNode(
          target,
          write.value,
          write.merge ? 'callerPartial' : 'callerReplace',
          write.merge ? WriteOption.Merge : WriteOption.Overwrite,
        );
    } catch (cause) {
      failure = cause;
    }
    capture(failure);
  }
  return observations;
};
