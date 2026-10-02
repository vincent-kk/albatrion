import type { SchemaNodeRecord } from '../../../../../record';
import type { DeriveState } from '../../../type';
import { getCommittedDeclarationKey } from '../../../../../utils/getCommittedDeclarationKey';

/**
 * Read the active declarations for a live occurrence across settlement calls.
 * @param node - Live source or target whose kind distinguishes its baseline
 * @param state - Current selections with last-commit fallback on untouched nodes
 * @returns Selected IDs, or all authored IDs before an occurrence has a commit
 */
export const getSelectedDeclarationIds = <Self extends SchemaNodeRecord<Self>>(
  node: Self, state: DeriveState<Self>,
): readonly number[] => state.selectedDeclarationIds.get(node) ??
  node.runtime.committedDeclarationIds?.get(getCommittedDeclarationKey(node)) ??
  node.blueprintNode.declarations.map((declaration) => declaration.id);
