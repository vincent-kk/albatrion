import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';
import { collectRetainedSlotSources } from './collectRetainedSlotSources';

/**
 * Capture array settlement results without comparing runtime object identities.
 * @param root - Committed tree whose live nodes and ordered stores are observed
 * @returns Values, paths, deliveries, revisions, snapshots and retained sources
 */
export const observeArraySettlement = (root: PlainNode): unknown => {
  const nodes: unknown[] = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.pop()!;
    nodes.push({
      path: node.path,
      name: node.name,
      key: node.itemKey,
      count: node.itemCount,
      nextKey: node.nextItemKey,
      raw: node.raw,
      undeclaredValues: node.undeclaredValues,
      value: node.local,
      output: node.emit,
      schema: node.schema.schema,
      isActive: node.isActive,
      isVisible: node.isVisible,
      isReadOnly: node.isReadOnly,
      isDisabled: node.isDisabled,
      isRequired: node.isRequired,
      state: node.interactionState,
      revisions: { ...node.revisionLedger },
      delivery: node.pendingDelivery,
      detached: node.detached,
    });
    for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
      pending.push(node.children![index]);
  }
  const runtime = root.runtime;
  return {
    nodes,
    snapshot: runtime.loadSnapshot,
    commit: runtime.commitNumber,
    diagnostics: runtime.diagnostics,
    globalState: runtime.globalState,
    counts: [...runtime.globalStateCounts],
    deliveryOrder: [...(runtime.deliveries ?? [])].map((node) => node.path),
    latent: collectRetainedSlotSources(root),
    misfits: [...runtime.misfitPaths],
    declarations: [...(runtime.committedDeclarationIds ?? [])],
    rules: [...(runtime.committedRuleValues ?? [])],
    ruleSources: [...(runtime.committedRuleKeysBySource ?? [])],
    ruleTargets: [...(runtime.committedRuleKeysByTarget ?? [])],
    inactive: readFieldNodeInactiveValues(root),
    inactiveMemo: readFieldNodeInactiveValues(root),
    misfitsMemo: [...(runtime.misfitsMemo ?? [])],
    warnings: [...(runtime.warningKeys ?? [])],
    warningRecords: [...(runtime.pendingWarningRecords ?? [])],
  };
};
