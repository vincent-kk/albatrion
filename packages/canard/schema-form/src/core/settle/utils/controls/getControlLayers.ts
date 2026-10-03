import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../blueprint';
import { getCommittedDeclarationKey } from './getCommittedDeclarationKey';

/** Unselected static fallbacks share IDs for the immutable declaration owner. */
const DECLARATION_IDS = new WeakMap<BlueprintNode, readonly number[]>();

/** Return the authored declaration order without a per-occurrence copy. */
const declarationIds = (node: BlueprintNode): readonly number[] => {
  let ids = DECLARATION_IDS.get(node);
  if (!ids) {
    ids = Object.freeze(node.declarations.map((declaration) => declaration.id));
    DECLARATION_IDS.set(node, ids);
  }
  return ids;
};

/** Shape data needed to resolve a declaration for a live or latent occurrence. */
export interface ControlTarget<Self> {
  /** Decoded direct-child name used by controls.children. */
  readonly name: string;
  /** Absolute occurrence path used by committed declaration IDs. */
  readonly path: string;
  /** Static declarations for this occurrence. */
  readonly blueprintNode: BlueprintNode;
  /** Direct parent whose groups may address this occurrence. */
  readonly parent: Self | null;
  /** Last active declaration choices for the whole tree. */
  readonly runtime: { readonly committedDeclarationIds?: ReadonlyMap<string, readonly number[]> };
}

/** One selected declaration and the host that owns its expression paths. */
export interface ControlLayer<Self> {
  /** Relative specificity of this declaration for its target. */
  readonly layer: 'node' | 'children' | 'fragment';
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
 * Collect the node, fragment, and parent-item controls that address one live node.
 * @param node - Final-shape target whose selected declarations are known
 * @param selectedDeclarationIds - Current selections, falling back to the last commit
 * @returns Active control groups without evaluating their state keys
 */
export const getControlLayers = <Self extends ControlTarget<Self>>(
  node: Self, selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>,
): readonly ControlLayer<Self>[] => {
  const selected = (current: Self): readonly number[] =>
    selectedDeclarationIds.get(current) ??
    current.runtime.committedDeclarationIds?.get(getCommittedDeclarationKey(current)) ??
    declarationIds(current.blueprintNode);
  const nodeIds = selected(node);
  const groups: ControlLayer<Self>[] = [];
  for (const declaration of node.blueprintNode.declarations) {
    if (!nodeIds.includes(declaration.id) || declaration.scope !== 'node' ||
      !declaration.schema || typeof declaration.schema !== 'object') continue;
    const controls: unknown = Reflect.get(declaration.schema, 'controls');
    if (controls && typeof controls === 'object' && !isArray(controls))
      groups.push({ layer: 'node', declarationId: declaration.id,
        schemaPath: `${declaration.schemaPath}/controls`, controls,
        host: node });
  }
  const parent = node.parent;
  if (!parent) return groups;
  const parentIds = selected(parent);
  for (const declaration of parent.blueprintNode.declarations) {
    if (!parentIds.includes(declaration.id) || !declaration.schema ||
      typeof declaration.schema !== 'object') continue;
    const controls: unknown = Reflect.get(declaration.schema, 'controls');
    if (!controls || typeof controls !== 'object' || isArray(controls)) continue;
    if (declaration.scope === 'fragment' &&
      node.blueprintNode.declarations.some((child) =>
        nodeIds.includes(child.id) && (
          child.schemaPath.startsWith(`${declaration.schemaPath}/properties/`) ||
          child.schemaPath.startsWith(`${declaration.schemaPath}/items/`) ||
          child.schemaPath.startsWith(`${declaration.schemaPath}/prefixItems/`))))
      groups.push({ layer: 'fragment', declarationId: declaration.id,
        schemaPath: `${declaration.schemaPath}/controls`, controls, host: parent });
    const children: unknown = Reflect.get(controls, 'children');
    if (!isArray(children)) continue;
    for (let index = 0; index < children.length; index++) {
      const item: unknown = children[index];
      if (!item || typeof item !== 'object') continue;
      const targets: unknown = Reflect.get(item, 'targets');
      if (!isArray(targets) || !targets.includes(node.name)) continue;
      const itemControls: unknown = Reflect.get(item, 'controls');
      if (itemControls && typeof itemControls === 'object' && !isArray(itemControls))
        groups.push({ layer: 'children', declarationId: declaration.id,
          schemaPath: `${declaration.schemaPath}/controls/children/${index}/controls`,
          controls: itemControls, host: parent });
    }
  }
  return groups;
};
