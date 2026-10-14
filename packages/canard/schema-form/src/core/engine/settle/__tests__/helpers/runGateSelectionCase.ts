import type { Blueprint } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { loadFieldNodeAtMount } from '../../utils/load/loadFieldNodeAtMount';
import { writeFieldNode } from '../../utils/write/writeFieldNode';
import type { PlainNode } from '../fixtures/createPlainNode';
import { createTestTree } from '../fixtures/createTestTree';
import type { gateSelectionCases } from '../fixtures/gateSelectionCases';

/**
 * Run one authored history and capture values, shape, delivery order and failures.
 * @param fixture - Fixed verifier boundary and its input history
 * @param configure - Internal mode hook before the first baseline evaluation
 * @returns Deterministic observations immediately after every settlement
 */
export const runGateSelectionCase = (
  fixture: (typeof gateSelectionCases)[number],
  configure: (analysis: Blueprint) => void = () => {},
) => {
  const { root, blueprint, visits } = createTestTree(fixture.schema);
  configure(blueprint);
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
    observations.push({
      nodes,
      failure: failure instanceof Error ? failure.message : failure,
      diagnostics: { ...root.runtime.diagnostics },
      commit: root.runtime.commitNumber,
      globalState: { ...root.runtime.globalState },
      latent: [...root.runtime.latentRaw],
      deliveries: [...(root.runtime.deliveries ?? [])].map((node) => node.path),
      visits: [...visits],
    });
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
