import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../blueprint';
import { CONTROL_KEY } from '../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import type { DeclarationLayer } from '../../../types/controls';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import { getFragmentOwnerPaths } from '../../../utils/controls/getFragmentOwnerPaths';

/** Unselected static fallbacks share IDs for the immutable declaration owner. */

/** Return the authored declaration order without a per-occurrence copy. */
const declarationIds = (node: BlueprintNode): readonly number[] => {
  let ids = getHostDerived<'declarationIds', readonly number[]>(
    node,
  ).declarationIds;
  if (!ids) {
    const collected: number[] = [];
    for (let index = 0; index < node.declarations.length; index++)
      collected.push(node.declarations[index].id);
    ids = Object.freeze(collected);
    getHostDerived<'declarationIds', readonly number[]>(node).declarationIds =
      ids;
  }
  return ids;
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
      getCommittedDeclarationKey(current, current.runtime),
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
  const buildOwners = (): ReadonlySet<string> => {
    const paths = new Set<string>();
    for (const declaration of declarations)
      if (nodeIds.includes(declaration.id))
        for (const path of getFragmentOwnerPaths(declaration.schemaPath))
          paths.add(path);
    return paths;
  };
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
      (owners ??= buildOwners()).has(declaration.schemaPath)
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
