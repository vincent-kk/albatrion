import { EMPTY_REVISION_LEDGER, markSchemaNodeEvent, SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { readSchemaNodeWatchValues } from '../controls/readSchemaNodeWatchValues';

/**
 * Mark one committed delivery set and advance its per-bit revision ledgers.
 * @param context - Final settlement observations and write origin
 * @returns Nothing; runtime holds pending events and comparison snapshots
 */
export const markCommitDeliveries = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const runtime = context.root.runtime;
  const snapshots = runtime.deliverySnapshots ?? new Map();
  const watchNodes = runtime.deliveryWatchNodes ?? new Set<unknown>();
  const candidates = new Set<unknown>([...context.changedNodes,
    ...context.entered, ...context.stateDirtyNodes, ...watchNodes, context.root]);
  const isTreeNode = (value: unknown): value is Self => value !== null &&
    typeof value === 'object' && Reflect.get(value, 'runtime') === runtime;
  const mark = (node: Self, bit: SchemaNodeEventType,
    payload?: unknown, options?: unknown): void => {
    markSchemaNodeEvent(node, bit, payload, options);
  };
  for (const candidate of candidates) {
    if (!isTreeNode(candidate)) continue;
    const node = candidate;
    if (node.detached) {
      snapshots.delete(node);
      watchNodes.delete(node);
      continue;
    }
    const previous = snapshots.get(node);
    const watched = readSchemaNodeWatchValues(node);
    if (watched.length) watchNodes.add(node);
    else watchNodes.delete(node);
    const watchChanged = previous !== undefined &&
      (watched.length !== previous.watchValues.length ||
        watched.some((value, index) => value !== previous.watchValues[index]));
    if (previous) {
      if (previous.local !== node.local || previous.emit !== node.emit) {
        const pending = runtime.deliveries?.get(node)?.payload?.[
          SchemaNodeEventType.UpdateValue];
        const oldValue = pending !== null && typeof pending === 'object' ?
          Reflect.get(pending, 'previous') : node.behavior.strategy === 'branch' ?
            { local: previous.local, emit: previous.emit } : previous.local;
        const current = node.behavior.strategy === 'branch' ?
          { local: node.local, emit: node.emit } : node.local;
        const payload = { previous: oldValue, current };
        const source = context.automaticLog.some((write) => write.node === node) ||
          context.filledNodes.has(node) ? 'automatic' : context.kind;
        mark(node, SchemaNodeEventType.UpdateValue,
          process.env.NODE_ENV !== 'production' ? Object.freeze(payload) : payload,
          { source });
      }
      if (previous.path !== node.path) {
        const pending = runtime.deliveries?.get(node)?.payload?.[
          SchemaNodeEventType.UpdatePath];
        const oldPath = pending !== null && typeof pending === 'object' ?
          Reflect.get(pending, 'previous') : previous.path;
        const payload = { previous: oldPath, current: node.path };
        mark(node, SchemaNodeEventType.UpdatePath,
          process.env.NODE_ENV !== 'production' ? Object.freeze(payload) : payload);
      }
      if (previous.children !== node.children)
        mark(node, SchemaNodeEventType.UpdateChildren);
      if (previous.state !== node.state)
        mark(node, SchemaNodeEventType.UpdateState);
      if (previous.active !== node.active || previous.visible !== node.visible ||
        previous.readOnly !== node.readOnly || previous.disabled !== node.disabled ||
        watchChanged)
        mark(node, SchemaNodeEventType.UpdateComputedProperties);
      if (previous.schema !== node.schema) {
        const pending = runtime.deliveries?.get(node)?.payload?.[
          SchemaNodeEventType.UpdateJsonSchema];
        const oldSchema = pending !== null && typeof pending === 'object' ?
          Reflect.get(pending, 'previous') : previous.schema.schema;
        const payload = { previous: oldSchema, current: node.schema.schema };
        mark(node, SchemaNodeEventType.UpdateJsonSchema,
          process.env.NODE_ENV !== 'production' ? Object.freeze(payload) : payload);
      }
    } else if (context.changedNodes.has(node)) {
      const current = node.behavior.strategy === 'branch' ?
        { local: node.local, emit: node.emit } : node.local;
      const payload = { previous: undefined, current };
      const source = context.automaticLog.some((write) => write.node === node) ||
        context.filledNodes.has(node) ? 'automatic' : context.kind;
      mark(node, SchemaNodeEventType.UpdateValue,
        process.env.NODE_ENV !== 'production' ? Object.freeze(payload) : payload,
        { source });
    }
    if (context.kind === 'load' && context.loadScope &&
      (node === context.loadScope || node.path.startsWith(`${context.loadScope.path}/`)))
      mark(node, SchemaNodeEventType.RequestRefresh);
    else if (runtime.refreshTargets?.has(node.path))
      mark(node, SchemaNodeEventType.RequestRefresh);
    snapshots.set(node, { path: node.path, local: node.local, emit: node.emit,
      children: node.children, active: node.active, visible: node.visible,
      readOnly: node.readOnly, disabled: node.disabled, state: node.state,
      schema: node.schema, watchValues: watched });
  }
  runtime.deliverySnapshots = snapshots;
  runtime.deliveryWatchNodes = watchNodes;
  for (const node of context.exited) {
    if (!node.detached) continue;
    snapshots.delete(node);
    watchNodes.delete(node);
  }
  if (runtime.deliveredDiagnostics && runtime.deliveredDiagnostics !== runtime.diagnostics)
    mark(context.root, SchemaNodeEventType.UpdateDiagnostics);
  runtime.deliveredDiagnostics = runtime.diagnostics;
  for (const [candidate, delivery] of runtime.queuedEvents ?? []) {
    if (!isTreeNode(candidate) || candidate.detached) continue;
    const node = candidate;
    const mask = delivery.type;
    const ledger: Record<number, number> = node.revisionLedger === EMPTY_REVISION_LEDGER ?
      {} : { ...node.revisionLedger };
    for (let bit = 1; bit <= SchemaNodeEventType.UpdateDiagnostics; bit *= 2)
      if (mask & bit) ledger[bit] = (ledger[bit] ?? 0) + 1;
    node.revisionLedger = ledger;
  }
  runtime.queuedEvents?.clear();
};
