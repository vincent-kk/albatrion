import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import { bindPointerTemplate } from '@/schema-form/helpers/jsonPointer';

import type { SchemaFragment } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import { collectConditionalTemplates } from './createUnionBranchActivity/collectConditionalTemplates';
import { prepareDeclarationEvidence } from './createUnionBranchActivity/prepareDeclarationEvidence';

/** Selected declarations and conditional branches for one live data host. */
interface HostActivity {
  /** Direct IDs preserve host-overlay evidence. */
  ids: readonly number[];
  /** Child declarations retain branch evidence when the host has no overlay. */
  branches?: Set<string>;
}

/**
 * Index committed branch evidence lazily within each issue's live occurrence.
 * @param root - Live tree whose committed declarations and template metadata agree.
 * @returns A per-pass predicate that ignores detached records and never evaluates gates.
 */
export const createUnionBranchActivity = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): ((fragment: SchemaFragment, node: Self) => boolean) => {
  const hosts = new Map<Self, HostActivity>();
  let preparation:
    | {
        conditional: ReturnType<typeof collectConditionalTemplates>;
        evidence: ReturnType<typeof prepareDeclarationEvidence>;
      }
    | undefined;
  const visited = new Map<Self, readonly number[]>();
  const getActivity = (node: Self): HostActivity => {
    let activity = hosts.get(node);
    if (!activity)
      hosts.set(node, (activity = { ids: visited.get(node) ?? EMPTY_ARRAY }));
    return activity;
  };
  const runtime = root.runtime;
  return (fragment, node) => {
    const committed = runtime.committedDeclarationIds;
    if (!committed?.size) return false;
    let host: Self | null = node;
    while (
      host &&
      host.blueprintNode.path !== fragment.hostPath &&
      bindPointerTemplate(fragment.hostPath, host.path) !== host.path
    )
      host = host.parent;
    if (!host) return false;
    if (!visited.has(host)) {
      preparation ??= {
        conditional: collectConditionalTemplates(runtime.blueprint),
        evidence: prepareDeclarationEvidence(runtime.blueprint),
      };
      const pending = [host];
      while (pending.length) {
        const current = pending.pop()!;
        if (visited.has(current)) continue;
        for (const child of current.children ?? [])
          if (preparation.conditional.has(child.blueprintNode))
            pending.push(child);
        const ids =
          committed.get(getCommittedDeclarationKey(current, runtime)) ??
          EMPTY_ARRAY;
        visited.set(current, ids);
        const activity = hosts.get(current);
        if (activity) activity.ids = ids;
        for (const id of ids) {
          for (const binding of preparation.evidence.get(id) ?? EMPTY_ARRAY) {
            let owner: Self | null = current;
            for (let step = 0; owner && step < binding.distance; step++)
              owner = owner.parent;
            if (owner) {
              const activity = getActivity(owner);
              const branches = (activity.branches ??= new Set());
              branches.add(binding.schemaPath);
            }
          }
        }
      }
    }
    const activity = getActivity(host);
    return (
      activity.branches?.has(fragment.schemaPath) === true ||
      fragment.declares.some((id) => activity.ids.includes(id)) ||
      fragment.overlays.some((id) => activity.ids.includes(id))
    );
  };
};
