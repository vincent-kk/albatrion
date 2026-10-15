import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../blueprint';
import { CONTROL_KEY } from '../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import type { DeclarationLayer } from '../../../types/controls';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';

/** Unselected static fallbacks share IDs for the immutable declaration owner. */
const DECLARATION_IDS = new WeakMap<BlueprintNode, readonly number[]>();

/** Return the authored declaration order without a per-occurrence copy. */
const declarationIds = (node: BlueprintNode): readonly number[] => {
  let ids = DECLARATION_IDS.get(node);
  if (!ids) {
    const collected: number[] = [];
    for (let index = 0; index < node.declarations.length; index++)
      collected.push(node.declarations[index].id);
    ids = Object.freeze(collected);
    DECLARATION_IDS.set(node, ids);
  }
  return ids;
};

/** Path segments through which a fragment contributes a declaration to a child. */
const OWNER_MARKERS = ['/properties/', '/items/', '/prefixItems/'] as const;

/**
 * Collect the fragment paths that own a selected node declaration.
 * @param declarations - Static declarations of the addressed node
 * @param ids - Selected declaration IDs of that node
 * @returns Every prefix that a selected declaration path continues with an owner marker
 */
const collectOwnerPaths = (
  declarations: BlueprintNode['declarations'],
  ids: readonly number[],
): ReadonlySet<string> => {
  const owners = new Set<string>();
  for (const { id, schemaPath } of declarations)
    if (ids.includes(id))
      for (const marker of OWNER_MARKERS) {
        let at = schemaPath.indexOf(marker);
        for (; at !== -1; at = schemaPath.indexOf(marker, at + 1))
          owners.add(schemaPath.slice(0, at));
      }
  return owners;
};

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
 * Collect the node, fragment, and parent-item controls that address one live node.
 * @param node - Final-shape target whose selected declarations are known
 * @param selectedDeclarationIds - Current selections, falling back to the last commit
 * @returns Active control groups without evaluating their state keys
 */
export const getControlLayers = <Self extends ControlTarget<Self>>(
  node: Self,
  selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>,
): readonly ControlLayer<Self>[] => {
  const selected = (current: Self): readonly number[] =>
    selectedDeclarationIds.get(current) ??
    current.runtime.committedDeclarationIds?.get(
      getCommittedDeclarationKey(current),
    ) ??
    declarationIds(current.blueprintNode);
  const nodeIds = selected(node);
  const groups: ControlLayer<Self>[] = [];
  const declarations = node.blueprintNode.declarations;
  for (let index = 0; index < declarations.length; index++) {
    const declaration = declarations[index];
    if (
      !nodeIds.includes(declaration.id) ||
      declaration.scope !== 'node' ||
      !declaration.schema ||
      typeof declaration.schema !== 'object'
    )
      continue;
    const controls: unknown = Reflect.get(
      declaration.schema,
      SCHEMA_GROUP.controls,
    );
    if (controls && typeof controls === 'object' && !isArray(controls))
      groups.push({
        layer: 'node',
        declarationId: declaration.id,
        schemaPath: declaration.schemaPath + '/controls',
        controls,
        host: node,
      });
  }
  const parent = node.parent;
  if (!parent) return groups;
  const parentIds = selected(parent);
  const parentDeclarations = parent.blueprintNode.declarations;
  let owners: ReadonlySet<string> | undefined;
  for (let index = 0; index < parentDeclarations.length; index++) {
    const declaration = parentDeclarations[index];
    if (
      !parentIds.includes(declaration.id) ||
      !declaration.schema ||
      typeof declaration.schema !== 'object'
    )
      continue;
    const controls: unknown = Reflect.get(
      declaration.schema,
      SCHEMA_GROUP.controls,
    );
    if (!controls || typeof controls !== 'object' || isArray(controls))
      continue;
    if (
      declaration.scope === 'fragment' &&
      (owners ??= collectOwnerPaths(declarations, nodeIds)).has(
        declaration.schemaPath,
      )
    )
      groups.push({
        layer: 'fragment',
        declarationId: declaration.id,
        schemaPath: declaration.schemaPath + '/controls',
        controls,
        host: parent,
      });
    const fields: unknown = Reflect.get(controls, CONTROL_KEY.fields);
    if (!isArray(fields)) continue;
    for (let index = 0; index < fields.length; index++) {
      const item: unknown = fields[index];
      if (!item || typeof item !== 'object') continue;
      const targets: unknown = Reflect.get(item, 'targets');
      if (!isArray(targets) || !targets.includes(node.name)) continue;
      const itemControls: unknown = Reflect.get(item, SCHEMA_GROUP.controls);
      if (
        itemControls &&
        typeof itemControls === 'object' &&
        !isArray(itemControls)
      )
        groups.push({
          layer: 'fields',
          declarationId: declaration.id,
          schemaPath:
            declaration.schemaPath + '/controls/fields/' + index + '/controls',
          controls: itemControls,
          host: parent,
        });
    }
  }
  return groups;
};
