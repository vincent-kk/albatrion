import { SchemaNodeRevisionLedger, markSchemaNodeEvent, SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { readSchemaNodeWatchValues } from '../controls/readSchemaNodeWatchValues';
import { createWatchDeliveryIndex } from './utils/createWatchDeliveryIndex';
import { getWatchDeliveryPaths } from './utils/getWatchDeliveryPaths';

/** Payload immutability follows the module's development build mode. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

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
  const automaticNodes = new Set(context.automaticLog.map((write) => write.node));
  const watchIndex = runtime.deliveryWatchIndex;
  const fullWatchScan = context.exited.size > 0;
  let affectedPaths: Set<string> | undefined;
  if (watchIndex?.allNodes.size && !fullWatchScan) {
    affectedPaths = new Set<string>();
    for (const node of context.entered) affectedPaths.add(node.path);
    for (const node of context.perished)
      affectedPaths.add(snapshots.get(node)?.path ?? node.path);
    for (const change of context.pathChanges) {
      affectedPaths.add(change.previous);
      affectedPaths.add(change.current);
    }
    for (const node of context.changedNodes) {
      const previous = snapshots.get(node);
      if (!previous || previous.local !== node.local || previous.emit !== node.emit)
        affectedPaths.add(node.path);
    }
    for (const node of context.stateDirtyNodes) {
      const previous = snapshots.get(node);
      if (!previous || previous.interactionState !== node.interactionState ||
        previous.active !== node.active || previous.visible !== node.visible ||
        previous.readOnly !== node.readOnly || previous.disabled !== node.disabled)
        affectedPaths.add(node.path);
    }
    // A deleted ancestor's chain was already covered by the surviving descendant.
    for (const path of affectedPaths) {
      let ancestor = path;
      while (ancestor) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
        if (!context.changedRaw.has(ancestor)) affectedPaths.delete(ancestor);
      }
    }
  }
  const candidates = new Set<unknown>();
  for (const node of context.changedNodes) candidates.add(node);
  for (const node of context.entered) candidates.add(node);
  for (const node of context.stateDirtyNodes) candidates.add(node);
  candidates.add(context.root);
  for (const change of context.pathChanges) candidates.add(change.node);
  if (watchIndex) {
    if (fullWatchScan)
      for (const watcher of watchIndex.allNodes) candidates.add(watcher);
    else if (runtime.deliveredContext !== runtime.context)
      for (const watcher of watchIndex.contextNodes) candidates.add(watcher);
    if (affectedPaths)
      for (const path of affectedPaths) watchIndex.affected(path, candidates);
  }
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
      watchIndex?.remove(node);
      continue;
    }
    const previous = snapshots.get(node);
    const watched = readSchemaNodeWatchValues(node);
    if (watched.length) {
      const index = runtime.deliveryWatchIndex ??=
        createWatchDeliveryIndex<Self>();
      index.update(node, getWatchDeliveryPaths(node));
    } else runtime.deliveryWatchIndex?.remove(node);
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
        const source = automaticNodes.has(node) ||
          context.filledNodes.has(node) ? 'automatic' : context.kind;
        mark(node, SchemaNodeEventType.UpdateValue,
          DEVELOPMENT ? Object.freeze(payload) : payload,
          { source });
      }
      if (previous.path !== node.path) {
        const pending = runtime.deliveries?.get(node)?.payload?.[
          SchemaNodeEventType.UpdatePath];
        const oldPath = pending !== null && typeof pending === 'object' ?
          Reflect.get(pending, 'previous') : previous.path;
        const payload = { previous: oldPath, current: node.path };
        mark(node, SchemaNodeEventType.UpdatePath,
          DEVELOPMENT ? Object.freeze(payload) : payload);
      }
      if (previous.children !== node.children)
        mark(node, SchemaNodeEventType.UpdateChildren);
      if (previous.interactionState !== node.interactionState) {
        runtime.stateChanged = true;
        if (!((runtime.queuedNonSettleEvents?.get(node)?.type ?? 0) &
          SchemaNodeEventType.UpdateState))
          mark(node, SchemaNodeEventType.UpdateState);
      }
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
          DEVELOPMENT ? Object.freeze(payload) : payload);
      }
    } else if (context.changedNodes.has(node)) {
      const current = node.behavior.strategy === 'branch' ?
        { local: node.local, emit: node.emit } : node.local;
      const payload = { previous: undefined, current };
      const source = automaticNodes.has(node) ||
        context.filledNodes.has(node) ? 'automatic' : context.kind;
      mark(node, SchemaNodeEventType.UpdateValue,
        DEVELOPMENT ? Object.freeze(payload) : payload,
        { source });
    }
    if (context.kind === 'load' && context.loadScope &&
      (node === context.loadScope || node.path.startsWith(`${context.loadScope.path}/`)))
      mark(node, SchemaNodeEventType.RequestRefresh);
    else if (runtime.refreshTargets?.has(node.path))
      mark(node, SchemaNodeEventType.RequestRefresh);
    if (previous) {
      previous.path = node.path;
      previous.local = node.local;
      previous.emit = node.emit;
      previous.children = node.children;
      previous.active = node.active;
      previous.visible = node.visible;
      previous.readOnly = node.readOnly;
      previous.disabled = node.disabled;
      previous.interactionState = node.interactionState;
      previous.schema = node.schema;
      previous.watchValues = watched;
    } else snapshots.set(node, { path: node.path, local: node.local, emit: node.emit,
      children: node.children, active: node.active, visible: node.visible,
      readOnly: node.readOnly, disabled: node.disabled,
      interactionState: node.interactionState,
      schema: node.schema, watchValues: watched });
  }
  runtime.deliverySnapshots = snapshots;
  const departing = [...context.exited, ...context.perished];
  const seenDeparting = new Set<Self>();
  while (departing.length) {
    const node = departing.pop();
    if (!node || !node.detached || seenDeparting.has(node)) continue;
    seenDeparting.add(node);
    snapshots.delete(node);
    runtime.deliveryWatchIndex?.remove(node);
    runtime.deliveries?.delete(node);
    runtime.queuedEvents?.delete(node);
    runtime.queuedNonSettleEvents?.delete(node);
    runtime.validationErrors?.delete(node);
    runtime.nodeErrors?.delete(node);
    runtime.combinedErrors?.delete(node);
    runtime.validationChangedNodes?.delete(node);
    runtime.validationTargets?.delete(node);
    runtime.validationPendingTargets?.delete(node);
    for (const child of node.children ?? []) departing.push(child);
  }
  if (runtime.deliveredDiagnostics && runtime.deliveredDiagnostics !== runtime.diagnostics)
    mark(context.root, SchemaNodeEventType.UpdateDiagnostics);
  runtime.deliveredDiagnostics = runtime.diagnostics;
  runtime.deliveredContext = runtime.context;
  for (const [candidate, delivery] of runtime.queuedEvents ?? []) {
    if (!isTreeNode(candidate) || candidate.detached) continue;
    const node = candidate;
    const mask = delivery.type;
    node.revisionLedger = new SchemaNodeRevisionLedger(node.revisionLedger, mask);
  }
  runtime.queuedEvents?.clear();
};
