import type { SchemaNodeRecord, TypeMismatchRecord } from '../../../record';
import { NON_JSON_WHOLE_VALUE, TYPE_MISMATCH, warnDevelopmentIssue } from '../../../../helpers/warning';
import type { SettlementContext } from '../../type';
import { collectNonJsonPaths } from './collectNonJsonPaths';
import { conversionCandidates } from './conversionCandidates';
import { effectiveType } from './effectiveType';
import { isTypeMismatch } from './isTypeMismatch';
import { receivedType } from './receivedType';

/** Shared frozen empty list for inactive and mismatch projections. */
const EMPTY_PATHS: readonly string[] = Object.freeze([]);
/** Shared frozen empty list for inactive values. */
const EMPTY_VALUES: readonly { path: string; value: unknown }[] = Object.freeze([]);
/** Shared empty warning batch. */
const EMPTY_WARNINGS: readonly TypeMismatchRecord[] = Object.freeze([]);

/**
 * Publish calculated changes, lamps, memoized paths, and one commit number.
 * @param context - Completed calculation including any deferred failure
 * @returns Nothing; all committed observations live on records and runtime
 */
export const commitSettlement = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const runtime = context.root.runtime;
  const commit = (runtime.commitNumber ?? 0) + 1;
  runtime.commitNumber = commit;
  const declarations = runtime.committedDeclarationIds ?? new Map();
  runtime.committedDeclarationIds = declarations;
  for (const [node, ids] of context.selectedDeclarationIds)
    if (!node.detached)
      declarations.set(JSON.stringify([node.path, node.blueprintNode.kind]), ids);
  let warnings: TypeMismatchRecord[] | undefined;
  for (const node of context.changedNodes) {
    node.revision++;
    if (node.detached || node.blueprintNode.kind === 'virtual') continue;
    const effective = effectiveType(node);
    const mismatch = isTypeMismatch(node.raw, effective, node.nullable);
    const wasOn = runtime.typeMismatchPaths.has(node.path);
    if (mismatch) runtime.typeMismatchPaths.add(node.path);
    else runtime.typeMismatchPaths.delete(node.path);
    if (mismatch && !wasOn) {
      const candidates = conversionCandidates(node, effective);
      const ambiguous = candidates.length > 1;
      const warning: TypeMismatchRecord = {
        level: 'warning', code: TYPE_MISMATCH, path: node.path,
        expected: { schemaType: node.schemaType, nullable: node.nullable, effective },
        received: receivedType(node.raw),
        reason: ambiguous ? 'ambiguous' : 'unconvertible',
        ...(ambiguous ? { candidates } : {}),
        source: context.kind === 'load' && context.entered.has(node) ? 'load' :
          context.changedRaw.has(node.path) ? context.kind : 'gate',
      };
      if (!warnings) warnings = [];
      warnings.push(warning);
      warnDevelopmentIssue({ code: TYPE_MISMATCH,
        message: `Type mismatch at ${node.path} (commit ${commit})`,
        details: { path: node.path, expected: warning.expected,
          received: warning.received, reason: warning.reason,
          ...(warning.candidates ? { candidates: warning.candidates } : {}),
          source: warning.source },
      });
    }
    if (process.env.NODE_ENV !== 'production' &&
      node.behavior.strategy === 'terminal' && node.raw !== null &&
      typeof node.raw === 'object' && context.changedRaw.has(node.path)) {
      const innerPaths = collectNonJsonPaths(node.raw, node.path);
      if (innerPaths.length)
        warnDevelopmentIssue({ code: NON_JSON_WHOLE_VALUE,
          message: `Whole value at ${node.path} contains non-JSON data`,
          details: { path: node.path, innerPaths },
        });
    }
  }
  runtime.typeMismatchRecords = warnings ? Object.freeze(warnings) : EMPTY_WARNINGS;
  const refreshTargets = runtime.refreshTargets ?? new Set<string>();
  refreshTargets.clear();
  if (context.kind !== 'load')
    for (const path of context.changedRaw)
      if (path !== context.target.path) refreshTargets.add(path);
  runtime.refreshTargets = refreshTargets;
  const mismatchMemo = runtime.typeMismatchesMemo ??
    new Map<string, { commit: number; paths: readonly string[] }>();
  mismatchMemo.clear();
  if (runtime.typeMismatchPaths.size === 0)
    mismatchMemo.set('', { commit, paths: EMPTY_PATHS });
  else {
    const allPaths = [...runtime.typeMismatchPaths].sort();
    mismatchMemo.set('', { commit, paths: Object.freeze(allPaths) });
    for (const path of allPaths) {
      let ancestor = path;
      while (ancestor) {
        const paths = allPaths.filter((candidate) =>
          candidate === ancestor || candidate.startsWith(`${ancestor}/`));
        mismatchMemo.set(ancestor, { commit, paths: Object.freeze(paths) });
        ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
      }
    }
  }
  runtime.typeMismatchesMemo = mismatchMemo;
  runtime.inactiveValuesMemo.clear();
  if (runtime.latentRaw.size === 0)
    runtime.inactiveValuesMemo.set('', EMPTY_VALUES);
  else {
    const inactive = [...runtime.latentRaw].flatMap(([key, value]) => {
      const identity: unknown = JSON.parse(key);
      return Array.isArray(identity) && typeof identity[0] === 'string'
        ? [{ path: identity[0], value }] : [];
    }).sort((left, right) => left.path.localeCompare(right.path));
    runtime.inactiveValuesMemo.set('', inactive.length ? Object.freeze(inactive.map(
      (entry) => Object.freeze(entry))) : EMPTY_VALUES);
    const inactiveHosts: string[] = [];
    for (const entry of inactive) {
      let ancestor = entry.path;
      while (ancestor) {
        if (!inactiveHosts.includes(ancestor)) inactiveHosts.push(ancestor);
        ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
      }
    }
    for (const host of inactiveHosts)
      runtime.inactiveValuesMemo.set(host, Object.freeze(inactive.filter((entry) =>
        entry.path === host || entry.path.startsWith(`${host}/`))));
  }
  if (context.failure && runtime.diagnostics.status !== 'degraded')
    runtime.diagnostics = { status: 'degraded', cause: context.cause,
      ...(context.cause === 'budget' ? { exceededBudget: context.exceededBudget,
        iterations: context.iterations } : {}),
      commit };
};
