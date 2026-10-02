import { SchemaNodeRevisionLedger, markSchemaNodeEvent, SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { getFeatureNodeIndex } from '../../../blueprint';
import type { SettlementContext } from '../../type';
import { readSchemaNodeWatchValues } from '../controls/readSchemaNodeWatchValues';
import { createWatchDeliveryIndex } from './utils/createWatchDeliveryIndex';
import { commitGlobalState } from './commitGlobalState';
import { getWatchDeliveryPaths } from './utils/getWatchDeliveryPaths';

/** Payload immutability follows the module's development build mode. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/** Candidates without a watch declaration share the same immutable empty value. */
const EMPTY_WATCH_VALUES: readonly unknown[] = Object.freeze([]);

/**
 * Mark one committed delivery set and advance its per-bit revision ledgers.
 * @param context - Final settlement observations and write origin
 * @param visit - Mismatch and refresh work sharing this record visit
 * @returns Nothing; records hold committed baselines and pending deliveries
 */
export const markCommitDeliveries = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
  visit?: (node: Self) => void,
): void => {
  const runtime = context.root.runtime;
  const refreshTargets = runtime.refreshTargets;
  const loadScope = context.kind === 'load' ? context.loadScope : undefined;
  const loadPrefix = loadScope ? `${loadScope.path}/` : '';
  const automaticNodes = new Set(context.automaticLog.map((write) => write.node));
  const watchIndex = runtime.deliveryWatchIndex;
  const watchNodes = getFeatureNodeIndex(runtime.blueprint).watchNodes;
  const fullWatchScan = context.exited.size > 0;
  let affectedPaths: Set<string> | undefined;
  if (watchIndex?.allNodes.size && !fullWatchScan) {
    affectedPaths = new Set<string>();
    for (const node of context.entered) affectedPaths.add(node.path);
    for (const node of context.perished)
      affectedPaths.add(node.deliveryBaseline?.path ?? node.path);
    for (const change of context.pathChanges) {
      affectedPaths.add(change.previous);
      affectedPaths.add(change.current);
    }
    for (const node of context.changedNodes) {
      const previous = node.deliveryBaseline;
      if (!previous || previous.local !== node.local || previous.emit !== node.emit)
        affectedPaths.add(node.path);
    }
    for (const node of context.stateDirtyNodes) {
      const previous = node.deliveryBaseline;
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
  for (const node of runtime.revisionNodes ?? []) candidates.add(node);
  if (runtime.deliveredDiagnostics && runtime.deliveredDiagnostics !== runtime.diagnostics)
    mark(context.root, SchemaNodeEventType.UpdateDiagnostics);
  runtime.deliveredDiagnostics = runtime.diagnostics;
  const globalState = commitGlobalState(context);
  const ordered = new Set<unknown>(globalState.nodes);
  for (const node of candidates) ordered.add(node);
  for (const candidate of ordered) {
    if (!isTreeNode(candidate)) continue;
    const node = candidate;
    visit?.(node);
    globalState.visit(node);
    if (!candidates.has(node)) continue;
    if (node.detached) {
      node.deliveryBaseline = undefined;
      watchIndex?.remove(node);
      continue;
    }
    const previous = node.deliveryBaseline;
    const pending = node.pendingDelivery?.payload;
    const hasWatch = watchNodes.has(node.blueprintNode.id);
    const watched = hasWatch ? readSchemaNodeWatchValues(node) : EMPTY_WATCH_VALUES;
    if (hasWatch) {
      if (watched.length) {
        const index = runtime.deliveryWatchIndex ??=
          createWatchDeliveryIndex<Self>();
        index.update(node, getWatchDeliveryPaths(node));
      } else runtime.deliveryWatchIndex?.remove(node);
    }
    const watchChanged = previous !== undefined &&
      (watched.length !== previous.watchValues.length ||
        watched.some((value, index) => value !== previous.watchValues[index]));
    if (previous) {
      if (previous.local !== node.local || previous.emit !== node.emit) {
        const pendingValue = pending?.[SchemaNodeEventType.UpdateValue];
        const oldValue = pendingValue !== null && typeof pendingValue === 'object' ?
          Reflect.get(pendingValue, 'previous') : node.behavior.strategy === 'branch' ?
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
        const pendingPath = pending?.[SchemaNodeEventType.UpdatePath];
        const oldPath = pendingPath !== null && typeof pendingPath === 'object' ?
          Reflect.get(pendingPath, 'previous') : previous.path;
        const payload = { previous: oldPath, current: node.path };
        mark(node, SchemaNodeEventType.UpdatePath,
          DEVELOPMENT ? Object.freeze(payload) : payload);
      }
      if (previous.children !== node.children)
        mark(node, SchemaNodeEventType.UpdateChildren);
      if (previous.interactionState !== node.interactionState) {
        runtime.stateChanged = true;
        if (!((node.pendingNonSettleDelivery?.type ?? 0) &
          SchemaNodeEventType.UpdateState))
          mark(node, SchemaNodeEventType.UpdateState);
      }
      if (previous.active !== node.active || previous.visible !== node.visible ||
        previous.readOnly !== node.readOnly || previous.disabled !== node.disabled ||
        watchChanged)
        mark(node, SchemaNodeEventType.UpdateComputedProperties);
      if (previous.schema !== node.schema) {
        const pendingSchema = pending?.[SchemaNodeEventType.UpdateJsonSchema];
        const oldSchema = pendingSchema !== null && typeof pendingSchema === 'object' ?
          Reflect.get(pendingSchema, 'previous') : previous.schema.schema;
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
    if (loadScope && (node === loadScope || node.path.startsWith(loadPrefix)))
      mark(node, SchemaNodeEventType.RequestRefresh);
    else if (refreshTargets?.has(node.path))
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
    } else node.deliveryBaseline = { path: node.path, local: node.local, emit: node.emit,
      children: node.children, active: node.active, visible: node.visible,
      readOnly: node.readOnly, disabled: node.disabled,
      interactionState: node.interactionState,
      schema: node.schema, watchValues: watched };
    if (node.pendingRevision) {
      node.revisionLedger = new SchemaNodeRevisionLedger(node.revisionLedger, node.pendingRevision);
      node.pendingRevision = 0;
    }
  }
  globalState.finish();
  runtime.revisionNodes?.clear();
  const departing = [...context.exited, ...context.perished];
  const seenDeparting = new Set<Self>();
  while (departing.length) {
    const node = departing.pop();
    if (!node || !node.detached || seenDeparting.has(node)) continue;
    seenDeparting.add(node);
    node.deliveryBaseline = undefined;
    node.pendingDelivery = undefined;
    node.pendingRevision = 0;
    node.pendingNonSettleDelivery = undefined;
    runtime.deliveryWatchIndex?.remove(node);
    runtime.deliveries?.delete(node);
    runtime.revisionNodes?.delete(node);
    runtime.queuedNonSettleEvents?.delete(node);
    runtime.validationErrors?.delete(node);
    runtime.nodeErrors?.delete(node);
    runtime.combinedErrors?.delete(node);
    runtime.validationChangedNodes?.delete(node);
    runtime.validationTargets?.delete(node);
    runtime.validationPendingTargets?.delete(node);
    for (const child of node.children ?? []) departing.push(child);
  }
  runtime.deliveredContext = runtime.context;
};
