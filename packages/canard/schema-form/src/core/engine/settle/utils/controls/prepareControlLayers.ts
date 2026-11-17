import { filter as filterArray } from '@winglet/common-utils/array';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode } from '../../../blueprint';
import { CONTROL_KEY } from '../../../constants/controlKey';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { readValidatedControls } from '../../../utils/controls/readValidatedControls';
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
    const controls = readValidatedControls(declaration.schema);
    if (!controls) continue;
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
    const items = controls.fields;
    if (!items) continue;
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (!item) continue;
      const targets = item.targets;
      const itemControls = item.controls;
      if (!itemControls) continue;
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
        if (target === undefined) continue;
        let addressed = fields.get(target);
        if (!addressed) fields.set(target, (addressed = []));
        if (addressed[addressed.length - 1] !== field) addressed.push(field);
      }
    }
  }
  return (record.controlLayerIndex = {
    hasExitControls,
    ids: process.env.NODE_ENV !== 'production' ? Object.freeze(ids) : ids,
    node: groups.length
      ? {
          all: groups,
          exit: filterArray(groups, (group) =>
            hasOwnProperty(group.controls, CONTROL_KEY.unsetOnInactive),
          ),
        }
      : EMPTY_GROUPS,
    fragments: fragments.size ? fragments : emptyReadonlyMap,
    fields: fields.size ? fields : emptyReadonlyMap,
  });
};
