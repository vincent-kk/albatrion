import {
  JSONPointer as $,
  bindPointerTemplate,
  isDescendantPath,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { PropertyDeclaration, SchemaFragment } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';

/** Selected declarations and conditional branches for one live data host. */
interface HostActivity {
  /** Direct IDs preserve host-overlay evidence. */
  ids: Set<number>;
  /** Child declarations retain branch evidence when the host has no overlay. */
  branches: Set<string>;
}

/**
 * Index committed branch evidence lazily within each issue's live occurrence.
 * @param root - Live tree whose committed declarations and template metadata agree.
 * @returns A per-pass predicate that ignores detached records and never evaluates gates.
 */
export const createUnionBranchActivity = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): ((fragment: SchemaFragment, node: Self) => boolean) => {
  const declarations = new Map<number, PropertyDeclaration>();
  const hosts = new Map<Self, HostActivity>();
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
    let activity = hosts.get(host);
    if (!activity) {
      if (!declarations.size)
        for (const template of runtime.blueprint.nodes) {
          for (const declaration of template.declarations)
            declarations.set(declaration.id, declaration);
          for (const entry of template.childEntries)
            for (const declaration of entry.declarations)
              declarations.set(declaration.id, declaration);
        }
      activity = { ids: new Set(), branches: new Set() };
      const pending = [host];
      while (pending.length) {
        const current = pending.pop()!;
        pending.push(...(current.children ?? []));
        for (const id of committed.get(
          getCommittedDeclarationKey(current, runtime),
        ) ?? []) {
          if (current === host) activity.ids.add(id);
          const declaration = declarations.get(id);
          if (!declaration) continue;
          for (const gate of declaration.gates) {
            let templatePath = declaration.path;
            if (
              templatePath !== gate.hostPath &&
              !isDescendantPath(templatePath, gate.hostPath)
            )
              continue;
            let owner: Self | null = current;
            while (owner && templatePath !== gate.hostPath) {
              templatePath = resolvePointer(templatePath, $.Parent);
              owner = owner.parent;
            }
            if (owner === host) activity.branches.add(gate.schemaPath);
          }
        }
      }
      hosts.set(host, activity);
    }
    return (
      activity.branches.has(fragment.schemaPath) ||
      fragment.declares.some((id) => activity.ids.has(id)) ||
      fragment.overlays.some((id) => activity.ids.has(id))
    );
  };
};
