import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode } from '../../../blueprint';
import { CONTROL_KEY } from '../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import type {
  PreparedControlGroups,
  PreparedControlIndex,
  PreparedControlLayer,
} from './preparedControlLayers';

/** Templates with no own controls share their empty candidate lists. */
const EMPTY_GROUPS: PreparedControlGroups = Object.freeze({
  all: [],
  exit: [],
});

/**
 * Prepare sparse control metadata once per immutable template in the engine cache.
 * @param node - Template whose authored declarations never change
 * @returns Groups, fragment ownership, and fields targets without gate results
 */
export const prepareControlLayers = (
  node: BlueprintNode,
): PreparedControlIndex => {
  const record = getHostDerived<'controlLayerIndex', PreparedControlIndex>(
    node,
  );
  if (record.controlLayerIndex) return record.controlLayerIndex;
  const ids: number[] = [];
  const groups: PreparedControlLayer[] = [];
  const fragments = new Map<string, PreparedControlLayer[]>();
  const fields = new Map<string, PreparedControlLayer[]>();
  let order = 0;
  let hasExitControls = false;
  for (const declaration of node.declarations) {
    ids.push(declaration.id);
    if (!declaration.schema || typeof declaration.schema !== 'object') continue;
    const controls: unknown = Reflect.get(
      declaration.schema,
      SCHEMA_GROUP.controls,
    );
    if (!controls || typeof controls !== 'object' || isArray(controls))
      continue;
    hasExitControls ||= hasOwnProperty(controls, CONTROL_KEY.unsetOnInactive);
    const group: PreparedControlLayer = {
      layer: declaration.scope === 'node' ? 'node' : 'fragment',
      declarationId: declaration.id,
      schemaPath: appendSegment(declaration.schemaPath, 'controls'),
      controls,
      order: order++,
    };
    if (declaration.scope === 'node') groups.push(group);
    else {
      let atPath = fragments.get(declaration.schemaPath);
      if (!atPath) fragments.set(declaration.schemaPath, (atPath = []));
      atPath.push(group);
    }
    const items: unknown = Reflect.get(controls, CONTROL_KEY.fields);
    if (!isArray(items)) continue;
    for (let index = 0; index < items.length; index++) {
      const item: unknown = items[index];
      if (!item || typeof item !== 'object') continue;
      const targets: unknown = Reflect.get(item, 'targets');
      if (!isArray(targets)) continue;
      const itemControls: unknown = Reflect.get(item, SCHEMA_GROUP.controls);
      if (
        !itemControls ||
        typeof itemControls !== 'object' ||
        isArray(itemControls)
      )
        continue;
      const field: PreparedControlLayer = {
        layer: 'fields',
        declarationId: declaration.id,
        schemaPath: appendSegment(
          appendSegment(
            appendSegment(
              appendSegment(declaration.schemaPath, 'controls'),
              'fields',
            ),
            index,
          ),
          'controls',
        ),
        controls: itemControls,
        order: order++,
      };
      hasExitControls ||= hasOwnProperty(
        itemControls,
        CONTROL_KEY.unsetOnInactive,
      );
      for (const target of targets) {
        if (typeof target !== 'string') continue;
        let addressed = fields.get(target);
        if (!addressed) fields.set(target, (addressed = []));
        if (addressed[addressed.length - 1] !== field) addressed.push(field);
      }
    }
  }
  return (record.controlLayerIndex = {
    hasExitControls,
    ids: Object.freeze(ids),
    node: groups.length
      ? {
          all: groups,
          exit: groups.filter((group) =>
            hasOwnProperty(group.controls, CONTROL_KEY.unsetOnInactive),
          ),
        }
      : EMPTY_GROUPS,
    fragments: fragments.size ? fragments : emptyReadonlyMap,
    fields: fields.size ? fields : emptyReadonlyMap,
  });
};
