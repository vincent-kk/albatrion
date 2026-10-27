import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { FormWarningCode } from '../../../../../errors';
import { find } from '../../../navigation';
import type { FieldNodeRecord, MisfitRecord } from '../../../record';
import { indexFieldNodeWarning } from '../../../record';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type { SettlementContext } from '../../types/settlement';
import { commitSlotChanges } from '../slots/commitSlotChanges';
import { isSlotEligible } from '../slots/isSlotEligible';
import { compareSlotShadowCommit } from '../verify/compareSlotShadowCommit';
import { collectNonJsonPaths } from './collectNonJsonPaths';
import { commitDeriveRules } from './commitDeriveRules';
import { commitExitPolicyValues } from './commitExitPolicyValues';
import { conversionCandidates } from './conversionCandidates';
import { effectiveType } from './effectiveType';
import { finalizeDeriveTrace } from './finalizeDeriveTrace';
import { isMisfit } from './isMisfit';
import { markCommitDeliveries } from './markCommitDeliveries';
import { receivedType } from './receivedType';
import { snapshotExitedPolicies } from './snapshotExitedPolicies';
import { updateInactiveValuesMemo } from './updateInactiveValuesMemo';
import { readSettlementSource } from './utils/readSettlementSource';

/** Shared frozen empty list for inactive and misfit projections. */
const EMPTY_PATHS: readonly string[] = Object.freeze([]);
/** Shared empty warning batch. */
const EMPTY_WARNINGS: readonly MisfitRecord[] = Object.freeze([]);

/**
 * Publish calculated changes, lamps, memoized paths, and one commit number.
 * @param context - Completed calculation including any deferred failure
 * @returns Nothing; all committed observations live on records and runtime
 */
export const commitSettlement = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const runtime = context.root.runtime;
  const development = process.env.NODE_ENV !== 'production';
  if (!isSlotEligible(runtime) && context.exited.size > 0)
    snapshotExitedPolicies(context);
  if (runtime.blueprint.capabilities.hasDerive) commitDeriveRules(context);
  if (runtime.blueprint.capabilities.hasExpressions)
    commitExitPolicyValues(context);
  if (development) {
    if (context.traceRounds?.length) finalizeDeriveTrace(context);
    runtime.settlementTrace = {
      entry: { api: context.entryApi ?? context.kind, option: context.option },
      rounds: context.traceRounds ?? [],
      ...(context.deriveBudgetRules
        ? { budget: context.deriveBudgetRules }
        : {}),
    };
  } else delete runtime.settlementTrace;
  const commit = (runtime.commitNumber ?? 0) + 1;
  runtime.commitNumber = commit;
  if (context.hasGates) {
    const declarations = (runtime.committedDeclarationIds ??= new PathKeyedMap(
      'pair',
    ));
    for (const [node, ids] of context.selectedDeclarationIds)
      if (!node.detached)
        declarations.set(getCommittedDeclarationKey(node, node.runtime), ids);
  }
  if (context.failures?.length && runtime.diagnostics.status !== 'degraded')
    runtime.diagnostics = {
      status: 'degraded',
      cause: context.cause,
      ...(context.exceededBudget
        ? {
            exceededBudget: context.exceededBudget,
            iterations: context.iterations,
          }
        : {}),
      commit,
    };
  const refreshTargets = runtime.refreshTargets ?? new Set<string>();
  refreshTargets.clear();
  const loadScope = context.kind === 'load' ? context.loadScope : undefined;
  const loadPrefix = loadScope ? loadScope.path + '/' : '';
  for (const path of context.changedRaw) {
    if (loadScope && (path === loadScope.path || path.startsWith(loadPrefix)))
      continue;
    if (readSettlementSource(context, path, true) !== 'input')
      refreshTargets.add(path);
  }
  runtime.refreshTargets = refreshTargets;
  let warnings: MisfitRecord[] | undefined;
  let warningTasks: Map<Self, () => void> | undefined;
  markCommitDeliveries(context, (node) => {
    if (!context.changedNodes.has(node) || node.detached) return;
    const schemaType = node.schemaType;
    const effective = effectiveType(node);
    // Only a virtual node lacks a JSON type, and it never misfits.
    if (schemaType === undefined || effective === undefined) return;
    const misfit = isMisfit(node.raw, effective, node.nullable);
    const wasOn = runtime.misfitPaths.has(node.path);
    if (misfit) runtime.misfitPaths.add(node.path);
    else runtime.misfitPaths.delete(node.path);
    if (
      !(misfit && !wasOn) &&
      !(
        development &&
        node.behavior.strategy === 'terminal' &&
        node.raw !== null &&
        typeof node.raw === 'object' &&
        context.changedRaw.has(node.path)
      )
    )
      return;
    (warningTasks ??= new Map()).set(node, () => {
      if (misfit && !wasOn) {
        const candidates = conversionCandidates(node, effective);
        const ambiguous = candidates.length > 1;
        const warning: MisfitRecord = {
          level: 'warning',
          code: FormWarningCode.Misfit,
          path: node.path,
          expected: {
            schemaType,
            nullable: node.nullable,
            effective,
          },
          received: receivedType(node.raw),
          reason: ambiguous ? 'ambiguous' : 'unconvertible',
          ...(ambiguous ? { candidates } : {}),
          source: context.filledNodes.has(node)
            ? 'fill'
            : context.kind === 'load' && context.entered.has(node)
              ? 'load'
              : context.changedRaw.has(node.path)
                ? context.kind
                : 'gate',
        };
        if (!warnings) warnings = [];
        warnings.push(warning);
        if (runtime.errorReporter?.hasConsumer()) {
          const code = FormWarningCode.Misfit;
          const record = {
            level: 'warning',
            code,
            path: node.path,
            message:
              'Value does not fit the schema type at ' +
              node.path +
              ' (commit ' +
              commit +
              ')',
            details: {
              path: node.path,
              expected: warning.expected,
              received: warning.received,
              reason: warning.reason,
              ...(warning.candidates ? { candidates: warning.candidates } : {}),
              source: warning.source,
            },
          } as const;
          indexFieldNodeWarning(
            runtime,
            JSON.stringify([code, node.path, commit]),
            node.path,
            record,
          );
          runtime.chainOccurrences?.push({ kind: 'record', record });
        }
      }
      if (
        development &&
        node.behavior.strategy === 'terminal' &&
        node.raw !== null &&
        typeof node.raw === 'object' &&
        context.changedRaw.has(node.path)
      ) {
        const innerPaths = collectNonJsonPaths(node.raw, node.path);
        if (innerPaths.length) {
          const code = FormWarningCode.NonJsonWholeValue;
          const key = JSON.stringify([code, node.path]);
          if (!runtime.warningKeys?.has(key)) {
            (runtime.warningKeys ??= new Set()).add(key);
            const record = {
              level: 'warning',
              code,
              path: node.path,
              message: `Whole value at ${node.path} contains non-JSON data`,
              details: { path: node.path, innerPaths },
            } as const;
            indexFieldNodeWarning(runtime, key, node.path, record);
            runtime.chainOccurrences?.push({ kind: 'record', record });
          }
        }
      }
    });
  });
  if (warningTasks)
    for (const node of context.changedNodes) warningTasks.get(node)?.();
  runtime.misfitRecords = warnings ? Object.freeze(warnings) : EMPTY_WARNINGS;
  const misfitsMemo =
    runtime.misfitsMemo ??
    new PathKeyedMap<{ commit: number; paths: readonly string[] }>('path');
  const built = runtime.misfitsMemoBuild;
  if (
    built?.memo !== misfitsMemo ||
    built.mutations !== runtime.misfitPaths.mutations ||
    built.size !== misfitsMemo.size
  ) {
    if (runtime.misfitPaths.size === 0) {
      const empty = misfitsMemo.get('');
      if (misfitsMemo.size === 1 && empty?.paths.length === 0)
        empty.commit = commit;
      else {
        misfitsMemo.clear();
        misfitsMemo.set('', { commit, paths: EMPTY_PATHS });
      }
    } else {
      misfitsMemo.clear();
      const allPaths = [...runtime.misfitPaths].sort();
      misfitsMemo.set('', { commit, paths: Object.freeze(allPaths) });
      const byAncestor = new Map<string, string[]>();
      for (let index = 0; index < allPaths.length; index++) {
        const path = allPaths[index];
        let ancestor = path;
        while (ancestor) {
          let paths = byAncestor.get(ancestor);
          if (!paths) {
            paths = [];
            byAncestor.set(ancestor, paths);
          }
          paths.push(path);
          ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
        }
      }
      for (const [ancestor, paths] of byAncestor)
        misfitsMemo.set(ancestor, { commit, paths: Object.freeze(paths) });
    }
    runtime.misfitsMemoBuild = {
      memo: misfitsMemo,
      size: misfitsMemo.size,
      mutations: runtime.misfitPaths.mutations,
    };
  }
  runtime.misfitsMemo = misfitsMemo;
  if (
    runtime.latentRaw.size > 0 &&
    (context.entered.size > 0 || context.exited.size > 0)
  )
    runtime.latentRawDirty = true;
  if (!isSlotEligible(runtime)) updateInactiveValuesMemo(context.root);
  else {
    for (const node of context.entered)
      if (!node.detached) {
        node.inactiveValueMemo = undefined;
        const parent = node.parent;
        if (
          parent &&
          (parent.inactiveSlots?.size || parent.inactiveSlotOverlays?.size)
        )
          (runtime.slotDirtyHosts ??= new Set()).add(parent);
      }
    commitSlotChanges(context.root);
    if (runtime.latentRawDirty || runtime.inactiveValueEntries?.size) {
      if (runtime.latentRawDirty)
        for (const node of context.changedNodes)
          if (!node.detached) node.inactiveValuesDirty = true;
      context.root.inactiveValuesDirty = true;
      const previous = runtime.inactiveValueEntries
        ? [...runtime.inactiveValueEntries.values()]
        : [];
      updateInactiveValuesMemo(context.root);
      const paths = [
        ...previous,
        ...(runtime.inactiveValueEntries?.values() ?? []),
      ];
      for (const retained of paths) {
        let path = retained.entry.path;
        while (true) {
          const host = find(context.root, path);
          if (host) host.inactiveValuesDirty = true;
          if (!path) break;
          path = path.slice(0, path.lastIndexOf('/'));
        }
      }
    }
  }
  compareSlotShadowCommit(context.root);
};
