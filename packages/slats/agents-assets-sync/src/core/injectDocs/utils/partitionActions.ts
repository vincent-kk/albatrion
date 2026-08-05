import type { Action } from '../../buildPlan/index.js';

/**
 * Split a plan into the work an applier can run in parallel and the work it
 * must serialise.
 *
 * File copies and deletes are independent, so they go into one pool. Block
 * writes are grouped by the document they land in, because several blocks
 * usually share one `AGENTS.md` and concurrent writers would each persist
 * their own read of it — leaving only the last one's changes.
 *
 * Verdicts that change nothing are dropped. `warn-diverged` is executable
 * only once `force` is granted: the CLI promises `--force` overwrites local
 * edits, and this is where that promise is kept.
 *
 * @param actions - the plan's actions
 * @param force - whether the caller granted `--force`
 * @returns `fileActions` for the pool, `blockGroups` keyed by document path
 */
export function partitionActions(
  actions: readonly Action[],
  force: boolean,
): { fileActions: Action[]; blockGroups: Map<string, Action[]> } {
  const fileActions: Action[] = [];
  const blockGroups = new Map<string, Action[]>();

  for (const action of actions) {
    if (!isExecutable(action, force)) continue;
    if (action.target.kind === 'file') {
      fileActions.push(action);
      continue;
    }
    if (action.target.kind !== 'block') continue;
    const group = blockGroups.get(action.target.fileAbs);
    if (group) group.push(action);
    else blockGroups.set(action.target.fileAbs, [action]);
  }

  return { fileActions, blockGroups };
}

function isExecutable(action: Action, force: boolean): boolean {
  if (action.kind === 'copy' || action.kind === 'delete') return true;
  return action.kind === 'warn-diverged' && force;
}
