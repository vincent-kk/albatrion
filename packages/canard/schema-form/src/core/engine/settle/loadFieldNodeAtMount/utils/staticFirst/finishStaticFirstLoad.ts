import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { FormWarningCode } from '../../../../../../errors';
import { indexFieldNodeWarning } from '../../../../record';
import type { FieldNodeRecord, MisfitRecord } from '../../../../record';
import type { WriteOption } from '../../../../types/value';
import { PathKeyedMap } from '../../../../utils/pathIndex/PathKeyedMap';
import { EMPTY_VALUES } from '../../../utils/detached/emptyDetachedReads';

/** Empty committed projections are shared without a per-load empty output list. */
const EMPTY_WARNINGS: readonly MisfitRecord[] = Object.freeze([]);
const EMPTY_PATHS: readonly string[] = Object.freeze([]);

/**
 * Publish root metadata and reserved warning output after the DFS has completed.
 * @param root - Fully initialized root and finalized revision ledgers
 * @param option - Original mount flags retained in development diagnostics
 * @param warnings - Only actual warning cells, carrying their entry reservation number
 * @returns Nothing; dispatcher owns subsequent delivery and reporter calls
 */
export const finishStaticFirstLoad = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  option: WriteOption,
  warnings?: { order: number; warning: MisfitRecord }[],
): void => {
  const runtime = root.runtime;
  const commit = runtime.commitNumber!;
  if (process.env.NODE_ENV !== 'production')
    runtime.settlementTrace = { entry: { api: 'load', option }, rounds: [] };
  else delete runtime.settlementTrace;
  runtime.refreshTargets ??= new Set();
  runtime.refreshTargets.clear();
  const records: MisfitRecord[] | undefined = warnings ? [] : undefined;
  if (warnings) {
    warnings.sort((left, right) => left.order - right.order);
    for (let index = 0; index < warnings.length; index++) {
      const warning = warnings[index].warning;
      records!.push(warning);
      runtime.misfitPaths.add(warning.path);
      if (!runtime.errorReporter?.hasConsumer()) continue;
      const code = FormWarningCode.Misfit;
      const record = {
        level: 'warning',
        code,
        path: warning.path,
        message:
          'Value does not fit the schema type at ' +
          warning.path +
          ' (commit ' +
          commit +
          ')',
        details: {
          path: warning.path,
          expected: warning.expected,
          received: warning.received,
          reason: warning.reason,
          ...(warning.candidates ? { candidates: warning.candidates } : {}),
          source: warning.source,
        },
      } as const;
      indexFieldNodeWarning(
        runtime,
        JSON.stringify([code, warning.path, commit]),
        warning.path,
        record,
      );
      runtime.chainOccurrences?.push({ kind: 'record', record });
    }
  }
  runtime.misfitRecords = records ? Object.freeze(records) : EMPTY_WARNINGS;
  const memo = (runtime.misfitsMemo ??= new PathKeyedMap('path'));
  memo.clear();
  if (!runtime.misfitPaths.size) memo.set('', { commit, paths: EMPTY_PATHS });
  else {
    const paths = [...runtime.misfitPaths].sort();
    memo.set('', { commit, paths: Object.freeze(paths) });
    const byAncestor = new Map<string, string[]>();
    for (let index = 0; index < paths.length; index++) {
      const path = paths[index];
      let ancestor = path;
      while (ancestor) {
        let children = byAncestor.get(ancestor);
        if (!children) {
          children = [];
          byAncestor.set(ancestor, children);
        }
        children.push(path);
        ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
      }
    }
    for (const [ancestor, children] of byAncestor)
      memo.set(ancestor, { commit, paths: Object.freeze(children) });
  }
  runtime.inactiveValueEntries ??= new PathKeyedMap('pair');
  runtime.inactiveValuesMemo.set('', EMPTY_VALUES);
  runtime.latentRawDirty = false;
  runtime.deliveredDiagnostics = runtime.diagnostics;
  runtime.deliveredContext = runtime.context;
  runtime.deliveryAffectedPaths = undefined;
};
