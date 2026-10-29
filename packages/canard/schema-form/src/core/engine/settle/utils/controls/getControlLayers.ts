import type { Blueprint, BlueprintNode } from '../../../blueprint';
import type { DeclarationLayer } from '../../../types/controls';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import { getStaticDeclarationIds } from '../../../utils/controls/getStaticDeclarationIds';
import { prepareControlLayers } from './prepareControlLayers';
import { prepareParentControlLayers } from './prepareParentControlLayers';

/** Shape data needed to resolve a declaration for a live or latent occurrence. */
export interface ControlTarget<Self> {
  /** Decoded direct-child name used by controls.fields. */
  readonly name: string;
  /** Absolute occurrence path used by committed declaration IDs. */
  readonly path: string;
  /** Static declarations for this occurrence. */
  readonly blueprintNode: BlueprintNode;
  /** Direct parent whose groups may address this occurrence. */
  readonly parent: Self | null;
  /** Last active declaration choices for the whole tree. */
  readonly runtime: {
    readonly blueprint?: Blueprint;
    committedDeclarationKeys?: WeakMap<
      object,
      { path: string; kind: string; key: string }
    >;
    readonly committedDeclarationIds?: ReadonlyMap<string, readonly number[]>;
  };
}

/** One selected declaration and the host that owns its expression paths. */
export interface ControlLayer<Self> {
  /** Relative specificity of this declaration for its target. */
  readonly layer: DeclarationLayer;
  /** Authored owner used to identify a compiled expression. */
  readonly declarationId: number;
  /** Original control group address retained for expression matching. */
  readonly schemaPath: string;
  /** Values declared by this selected control group. */
  readonly controls: object;
  /** Occurrence that anchors relative expression paths. */
  readonly host: Self;
}

/**
 * Bind prepared groups to current selections without rescanning declarations.
 * @param node - Target whose selected declarations are known
 * @param selectedDeclarationIds - Current selections, falling back to the last commit
 * @param exitOnly - Restrict candidates to authored unsetOnInactive policies
 * @returns Active control groups without evaluating gates or expressions
 */
export const getControlLayers = <Self extends ControlTarget<Self>>(
  node: Self,
  selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>,
  exitOnly = false,
): readonly ControlLayer<Self>[] => {
  const prepared = prepareControlLayers(node.blueprintNode);
  const own = exitOnly ? prepared.node.exit : prepared.node.all;
  const parent = node.parent;
  if (
    exitOnly &&
    !prepared.hasExitControls &&
    (!parent || !prepareControlLayers(parent.blueprintNode).hasExitControls)
  )
    return [];
  const addressed = parent
    ? prepareParentControlLayers(
        parent.blueprintNode,
        node.blueprintNode,
        node.name,
        node.runtime,
      )
    : undefined;
  const inherited = exitOnly ? addressed?.exit : addressed?.all;
  if (!own.length && !inherited?.length) return [];
  const selected = (current: Self): readonly number[] =>
    selectedDeclarationIds.get(current) ??
    getStaticDeclarationIds(current) ??
    current.runtime.committedDeclarationIds?.get(
      getCommittedDeclarationKey(current, current.runtime),
    ) ??
    prepareControlLayers(current.blueprintNode).ids;
  const nodeIds = selected(node);
  const groups: ControlLayer<Self>[] = [];
  for (const group of own)
    if (nodeIds.indexOf(group.declarationId) !== -1)
      groups.push({
        layer: group.layer,
        declarationId: group.declarationId,
        schemaPath: group.schemaPath,
        controls: group.controls,
        host: node,
      });
  if (!parent || !inherited?.length) return groups;
  const parentIds = selected(parent);
  for (const group of inherited) {
    if (parentIds.indexOf(group.declarationId) === -1) continue;
    if (
      group.ownerIds &&
      !group.ownerIds.some((id) => nodeIds.indexOf(id) !== -1)
    )
      continue;
    groups.push({
      layer: group.layer,
      declarationId: group.declarationId,
      schemaPath: group.schemaPath,
      controls: group.controls,
      host: parent,
    });
  }
  return groups;
};
