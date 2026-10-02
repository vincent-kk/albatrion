import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint, BlueprintSchema } from '../../../blueprint';

/** One conservative presence decision per immutable analysis. */
const PRESENCE = new WeakMap<Blueprint, boolean>();

/** Recognize local state controls without evaluating literals or expressions. */
const hasStateControls = (controls: unknown): boolean => controls !== null &&
  typeof controls === 'object' && !isArray(controls) &&
  (Reflect.get(controls, 'visible') !== undefined ||
    Reflect.get(controls, 'readOnly') !== undefined ||
    Reflect.get(controls, 'disabled') !== undefined);

/** Include standard readOnly, fragment groups, and parent children groups. */
const hasStateSchema = (schema: BlueprintSchema): boolean => {
  if (!schema || typeof schema !== 'object') return false;
  if (schema.readOnly === true) return true;
  const controls = schema.controls;
  if (hasStateControls(controls)) return true;
  if (!controls || typeof controls !== 'object' || isArray(controls)) return false;
  const children: unknown = Reflect.get(controls, 'children');
  return isArray(children) && children.some((item) => item !== null &&
    typeof item === 'object' && hasStateControls(Reflect.get(item, 'controls')));
};

/**
 * Check whether any authored contribution can change a local state key.
 * @param blueprint - Finite immutable declarations, including reference bindings
 * @returns False only when state-key publication has no declared input
 */
export const declaresStateKeys = (blueprint: Blueprint): boolean => {
  const cached = PRESENCE.get(blueprint);
  if (cached !== undefined) return cached;
  const present = blueprint.nodes.some((node) =>
    node.declarations.some((declaration) => hasStateSchema(declaration.schema)) ||
    node.childEntries.some((entry) => entry.declarations.some((declaration) =>
      hasStateSchema(declaration.schema)))) ||
    blueprint.fragments.some((fragment) => hasStateSchema(fragment.schema));
  PRESENCE.set(blueprint, present);
  return present;
};
