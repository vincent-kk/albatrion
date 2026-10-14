import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint, BlueprintFeatureNodeIndex } from '../../../../type';

/** Local control groups whose declared values can differ from the default keys. */
const hasStateKeys = (controls: unknown): controls is Record<string, unknown> =>
  controls !== null && typeof controls === 'object' && !isArray(controls) &&
  (Reflect.get(controls, 'visible') !== undefined ||
    Reflect.get(controls, 'readOnly') !== undefined ||
    Reflect.get(controls, 'disabled') !== undefined);

/**
 * Index possible state and watch targets without selecting gates or reading values.
 * @param blueprint - Completed finite graph, including recursive and array templates
 * @returns Static bounds keyed by template identity and parent-addressed child name
 */
export const buildFeatureNodeIndex = (blueprint: Blueprint): BlueprintFeatureNodeIndex => {
  const stateKeyNodes = new Set<number>();
  const stateKeyChildren = new Map<number, Set<string>>();
  const watchNodes = new Set<number>();
  for (const node of blueprint.nodes) {
    const targets = new Set<string>();
    const children = [
      ...node.childEntries,
      ...(node.prefixItems ?? []).map((child, index) =>
        ({ name: String(index), node: child, declarations: child.declarations })),
      ...(node.item ? [{ name: '*', node: node.item,
        declarations: node.item.declarations }] : []),
    ];
    for (const declaration of node.declarations) {
      if (declaration.validationOnly || typeof declaration.schema !== 'object') continue;
      const schema = declaration.schema;
      const controls = schema.controls;
      if (schema.readOnly === true ||
        declaration.scope === 'node' && hasStateKeys(controls)) stateKeyNodes.add(node.id);
      if (!controls || typeof controls !== 'object' || isArray(controls)) continue;
      if (declaration.scope === 'node' && Reflect.get(controls, 'watch') !== undefined)
        watchNodes.add(node.id);
      if (declaration.scope === 'fragment' && hasStateKeys(controls))
        for (const child of children)
          if (child.node.declarations.some((entry) =>
            entry.schemaPath.startsWith(`${declaration.schemaPath}/properties/`) ||
            entry.schemaPath.startsWith(`${declaration.schemaPath}/items/`) ||
            entry.schemaPath.startsWith(`${declaration.schemaPath}/prefixItems/`)))
            targets.add(child.name);
      const groups: unknown = Reflect.get(controls, 'children');
      if (isArray(groups)) for (const group of groups) {
        if (!group || typeof group !== 'object' ||
          !hasStateKeys(Reflect.get(group, 'controls'))) continue;
        const names: unknown = Reflect.get(group, 'targets');
        if (isArray(names)) for (const name of names)
          if (typeof name === 'string') targets.add(name);
      }
    }
    for (const child of children)
      for (const declaration of child.declarations) {
        if (declaration.validationOnly || declaration.scope !== 'node' ||
          typeof declaration.schema !== 'object') continue;
        const controls = declaration.schema.controls;
        if (declaration.schema.readOnly === true || hasStateKeys(controls))
          stateKeyNodes.add(child.node.id);
        if (controls && typeof controls === 'object' &&
          Reflect.get(controls, 'watch') !== undefined) watchNodes.add(child.node.id);
      }
    if (targets.size) stateKeyChildren.set(node.id, targets);
  }
  return { stateKeyNodes, stateKeyChildren, watchNodes };
};
