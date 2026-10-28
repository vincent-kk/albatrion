import { isArray } from '@winglet/common-utils/filter';

import {
  isDescendantPath,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import { getFeatureNodeIndex } from '../../../blueprint';
import {
  FieldNodeEventType,
  FieldNodeRevisionLedger,
  advanceFieldNodeRevision,
  canOmitFieldNodePayload,
  clearFieldNodeChanges,
  markFieldNodeEvent,
} from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { readFieldNodeWatchValues } from '../controls/readFieldNodeWatchValues';
import { commitGlobalState } from './commitGlobalState';
import { createWatchDeliveryIndex } from './utils/createWatchDeliveryIndex';
import { getWatchDeliveryPaths } from './utils/getWatchDeliveryPaths';
import { isSameDeliveryValue } from './utils/isSameDeliveryValue';
import { readSettlementSource } from './utils/readSettlementSource';

/** Candidates without a watch declaration share the same immutable empty value. */
const EMPTY_WATCH_VALUES: readonly unknown[] = Object.freeze([]);

/**
 * Mark one committed delivery set and advance its per-bit revision ledgers.
 * @param context - Final settlement observations and write origin
 * @param visit - Mismatch and refresh work sharing this record visit
 * @returns Nothing; records hold committed baselines and pending deliveries
 */
export const markCommitDeliveries = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  visit?: (node: Self) => void,
): void => {
  const runtime = context.root.runtime;
  runtime.deliveries ??= new Set<Self>();
  const previousTransitions = runtime.revisionTransitions;
  try {
    const refreshTargets = runtime.refreshTargets;
    const loadScope = context.kind === 'load' ? context.loadScope : undefined;
    const automaticNodes = new Set<Self>();
    for (let index = 0; index < context.automaticLog.length; index++)
      automaticNodes.add(context.automaticLog[index].node);
    const watchIndex = runtime.deliveryWatchIndex;
    const watchNodes = getFeatureNodeIndex(runtime.blueprint).watchNodes;
    let affectedPaths: Set<string> | undefined;
    if (watchIndex?.allNodes.size) {
      affectedPaths = runtime.deliveryAffectedPaths ?? new Set<string>();
      for (const node of context.entered) affectedPaths.add(node.path);
      for (const node of context.exited)
        affectedPaths.add(node.deliveryPreviousPath ?? node.path);
      for (const node of context.perished)
        affectedPaths.add(node.deliveryPreviousPath ?? node.path);
      for (const change of context.pathChanges) {
        affectedPaths.add(change.previous);
        affectedPaths.add(change.current);
      }
      // A deleted ancestor's chain was already covered by the surviving descendant.
      for (const path of affectedPaths) {
        let ancestor = path;
        while (ancestor) {
          ancestor = resolvePointer(ancestor, '..');
          if (!context.changedRaw.has(ancestor)) affectedPaths.delete(ancestor);
        }
      }
    }
    const candidates = new Set<unknown>();
    for (const host of context.changedNodes) {
      if (
        host.detached ||
        host.blueprintNode.kind !== 'object' ||
        !host.children
      )
        continue;
      if (
        host.deliveryInitialized &&
        host.deliveryPreviousSchema === undefined &&
        !(host.deliveryChanges & FieldNodeEventType.UpdateChildren)
      )
        continue;
      const schema = host.schema.schema;
      const required = typeof schema === 'object' ? schema.required : undefined;
      for (let index = 0; index < host.children.length; index++) {
        const child = host.children[index];
        if (child.parent !== host || child.blueprintNode.kind === 'virtual')
          continue;
        const next = isArray(required) && required.includes(child.name);
        if (child.required === next) continue;
        child.required = next;
        candidates.add(child);
        if (child.deliveryInitialized)
          markFieldNodeEvent(
            child,
            FieldNodeEventType.UpdateControlledProperties,
          );
      }
    }
    candidates.add(context.root);
    for (const change of context.pathChanges) candidates.add(change.node);
    if (watchIndex) {
      if (runtime.deliveredContext !== runtime.context)
        for (const watcher of watchIndex.contextNodes) candidates.add(watcher);
      if (affectedPaths)
        for (const path of affectedPaths) watchIndex.affected(path, candidates);
    }
    const isTreeNode = (value: unknown): value is Self =>
      value !== null &&
      typeof value === 'object' &&
      Reflect.get(value, 'runtime') === runtime;
    let silentMask = 0;
    const markSilent = (_node: Self, bit: FieldNodeEventType): void => {
      silentMask |= bit;
    };
    let mark: (
      node: Self,
      bit: FieldNodeEventType,
      payload?: unknown,
      options?: unknown,
    ) => void = markFieldNodeEvent;
    for (const node of runtime.revisionNodes ?? []) candidates.add(node);
    if (
      runtime.deliveredDiagnostics &&
      runtime.deliveredDiagnostics !== runtime.diagnostics
    )
      mark(context.root, FieldNodeEventType.UpdateDiagnostics);
    runtime.deliveredDiagnostics = runtime.diagnostics;
    const globalState = commitGlobalState(context);
    const { departing: globalDeparting, loadNodes } = globalState;
    const { entered, changedNodes, stateDirtyNodes } = context;
    const sources: readonly (ReadonlySet<unknown> | undefined)[] = [
      globalDeparting,
      entered,
      changedNodes,
      stateDirtyNodes,
      loadNodes,
      candidates,
    ];
    let sourceIndex = 0;
    let iterator: Iterator<unknown> = globalDeparting.values();
    while (true) {
      const next = iterator.next();
      if (next.done) {
        do sourceIndex++;
        while (sourceIndex < sources.length && !sources[sourceIndex]?.size);
        if (sourceIndex === sources.length) break;
        iterator = sources[sourceIndex]!.values();
        continue;
      }
      const candidate = next.value;
      if (!isTreeNode(candidate)) continue;
      const node = candidate;
      if (
        (sourceIndex > 0 &&
          globalDeparting.size &&
          globalDeparting.has(node)) ||
        (sourceIndex > 1 && entered.size && entered.has(node)) ||
        (sourceIndex > 2 && changedNodes.size && changedNodes.has(node)) ||
        (sourceIndex > 3 &&
          stateDirtyNodes.size &&
          stateDirtyNodes.has(node)) ||
        (sourceIndex > 4 && loadNodes?.size && loadNodes.has(node))
      )
        continue;
      visit?.(node);
      if (sourceIndex < 5) globalState.visit(node);
      if (
        !(sourceIndex >= 1 && sourceIndex <= 3) &&
        sourceIndex !== 5 &&
        !candidates.has(node) &&
        !(entered.size && entered.has(node)) &&
        !(changedNodes.size && changedNodes.has(node)) &&
        !(stateDirtyNodes.size && stateDirtyNodes.has(node))
      ) {
        clearFieldNodeChanges(node);
        continue;
      }
      if (node.detached) {
        clearFieldNodeChanges(node);
        node.deliveryWatchValues = undefined;
        watchIndex?.remove(node);
        continue;
      }
      const initialized = node.deliveryInitialized;
      const changes = node.deliveryChanges;
      const previousWatchValues =
        node.deliveryWatchValues ?? EMPTY_WATCH_VALUES;
      const pending = node.pendingDelivery?.payload;
      const hasWatch = watchNodes.has(node.blueprintNode.id);
      const watched = hasWatch
        ? readFieldNodeWatchValues(node)
        : EMPTY_WATCH_VALUES;
      if (hasWatch) {
        if (watched.length) {
          const index = (runtime.deliveryWatchIndex ??=
            createWatchDeliveryIndex<Self>());
          index.update(node, getWatchDeliveryPaths(node));
        } else runtime.deliveryWatchIndex?.remove(node);
      }
      let watchChanged =
        initialized && watched.length !== previousWatchValues.length;
      for (
        let index = 0;
        initialized && !watchChanged && index < watched.length;
        index++
      )
        if (!isSameDeliveryValue(watched[index], previousWatchValues[index]))
          watchChanged = true;
      const silent = canOmitFieldNodePayload(node);
      mark = silent ? markSilent : markFieldNodeEvent;
      silentMask = 0;
      if (initialized) {
        if (
          changes & FieldNodeEventType.UpdateValue &&
          (!isSameDeliveryValue(node.deliveryPreviousLocal, node.local) ||
            !isSameDeliveryValue(node.deliveryPreviousEmit, node.emit))
        ) {
          if (silent) mark(node, FieldNodeEventType.UpdateValue);
          else {
            const pendingValue = pending?.[FieldNodeEventType.UpdateValue];
            const oldValue =
              pendingValue !== null && typeof pendingValue === 'object'
                ? Reflect.get(pendingValue, 'previous')
                : node.behavior.strategy === 'branch'
                  ? {
                      local: node.deliveryPreviousLocal,
                      emit: node.deliveryPreviousEmit,
                    }
                  : node.deliveryPreviousLocal;
            const current =
              node.behavior.strategy === 'branch'
                ? { local: node.local, emit: node.emit }
                : node.local;
            const payload = { previous: oldValue, current };
            const source =
              automaticNodes.has(node) || context.filledNodes.has(node)
                ? 'automatic'
                : readSettlementSource(context, node.path);
            mark(
              node,
              FieldNodeEventType.UpdateValue,
              process.env.NODE_ENV !== 'production'
                ? Object.freeze(payload)
                : payload,
              { source },
            );
          }
        }
        if (
          changes & FieldNodeEventType.UpdatePath &&
          node.deliveryPreviousPath !== node.path
        ) {
          if (silent) mark(node, FieldNodeEventType.UpdatePath);
          else {
            const pendingPath = pending?.[FieldNodeEventType.UpdatePath];
            const oldPath =
              pendingPath !== null && typeof pendingPath === 'object'
                ? Reflect.get(pendingPath, 'previous')
                : node.deliveryPreviousPath;
            const payload = { previous: oldPath, current: node.path };
            mark(
              node,
              FieldNodeEventType.UpdatePath,
              process.env.NODE_ENV !== 'production'
                ? Object.freeze(payload)
                : payload,
            );
          }
        }
        if (
          changes & FieldNodeEventType.UpdateChildren &&
          node.deliveryPreviousChildren !== node.children
        )
          mark(node, FieldNodeEventType.UpdateChildren);
        if (
          changes & FieldNodeEventType.UpdateState &&
          node.deliveryPreviousState !== node.interactionState
        ) {
          runtime.stateChanged = true;
          if (
            !(
              (node.pendingNonSettleDelivery?.type ?? 0) &
              FieldNodeEventType.UpdateState
            )
          )
            mark(node, FieldNodeEventType.UpdateState);
        }
        if (
          (changes & FieldNodeEventType.UpdateControlledProperties &&
            node.deliveryPreviousComputed !==
              (+node.active |
                (+node.visible << 1) |
                (+node.readOnly << 2) |
                (+node.disabled << 3))) ||
          watchChanged
        )
          mark(node, FieldNodeEventType.UpdateControlledProperties);
        if (
          changes & FieldNodeEventType.UpdateJsonSchema &&
          node.deliveryPreviousSchema !== node.schema
        ) {
          if (silent) mark(node, FieldNodeEventType.UpdateJsonSchema);
          else {
            const pendingSchema =
              pending?.[FieldNodeEventType.UpdateJsonSchema];
            const oldSchema =
              pendingSchema !== null && typeof pendingSchema === 'object'
                ? Reflect.get(pendingSchema, 'previous')
                : node.deliveryPreviousSchema?.schema;
            const payload = {
              previous: oldSchema,
              current: node.schema.schema,
            };
            mark(
              node,
              FieldNodeEventType.UpdateJsonSchema,
              process.env.NODE_ENV !== 'production'
                ? Object.freeze(payload)
                : payload,
            );
          }
        }
      } else if (context.changedNodes.has(node)) {
        if (silent) mark(node, FieldNodeEventType.UpdateValue);
        else {
          const current =
            node.behavior.strategy === 'branch'
              ? { local: node.local, emit: node.emit }
              : node.local;
          const payload = { previous: undefined, current };
          const source =
            automaticNodes.has(node) || context.filledNodes.has(node)
              ? 'automatic'
              : readSettlementSource(context, node.path);
          mark(
            node,
            FieldNodeEventType.UpdateValue,
            process.env.NODE_ENV !== 'production'
              ? Object.freeze(payload)
              : payload,
            { source },
          );
        }
      }
      if (
        loadScope &&
        (node === loadScope || isDescendantPath(node.path, loadScope.path))
      )
        mark(node, FieldNodeEventType.RequestRefresh);
      else if (refreshTargets?.has(node.path))
        mark(node, FieldNodeEventType.RequestRefresh);
      node.deliveryInitialized = true;
      if (hasWatch) node.deliveryWatchValues = watched;
      clearFieldNodeChanges(node);
      if (silentMask) node.pendingRevision |= silentMask;
      if (node.pendingRevision) {
        if (silent)
          advanceFieldNodeRevision(node, node.pendingRevision, silent);
        else
          node.revisionLedger = new FieldNodeRevisionLedger(
            node.revisionLedger,
            node.pendingRevision,
          );
        node.pendingRevision = 0;
      }
    }
    globalState.finish();
    runtime.revisionNodes?.clear();
    const departing: Self[] = [];
    for (const node of context.exited) departing.push(node);
    for (const node of context.perished) departing.push(node);
    const seenDeparting = new Set<Self>();
    while (departing.length) {
      const node = departing.pop();
      if (!node || !node.detached || seenDeparting.has(node)) continue;
      seenDeparting.add(node);
      clearFieldNodeChanges(node);
      node.deliveryWatchValues = undefined;
      node.pendingDelivery = undefined;
      node.pendingRevision = 0;
      node.pendingNonSettleDelivery = undefined;
      runtime.deliveryWatchIndex?.remove(node);
      runtime.deliveries?.delete(node);
      runtime.revisionNodes?.delete(node);
      runtime.queuedNonSettleEvents?.delete(node);
      runtime.validationErrors?.delete(node);
      runtime.nodeErrors?.delete(node);
      if (runtime.externalContributions?.has(node))
        (runtime.pendingExternalErrorNodes ??= new Set()).add(node);
      runtime.combinedErrors?.delete(node);
      runtime.validationChangedNodes?.delete(node);
      runtime.validationTargets?.delete(node);
      runtime.validationPendingTargets?.delete(node);
      const children = node.children;
      for (let index = 0; children && index < children.length; index++)
        departing.push(children[index]);
    }
    runtime.deliveredContext = runtime.context;
    runtime.deliveryAffectedPaths = undefined;
  } finally {
    if (runtime.revisionTransitions !== previousTransitions)
      runtime.revisionTransitions = previousTransitions;
  }
};
