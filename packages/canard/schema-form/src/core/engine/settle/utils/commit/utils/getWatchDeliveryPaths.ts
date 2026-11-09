import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../../record';
import { readValidatedControls } from '../../../../utils/controls/readValidatedControls';
import { getStateDependencyPlan } from '../../controls/getStateDependencyPlan';

/**
 * Resolve the final effective watch list against this live occurrence.
 * @param node - Live node whose effective schema declares watch paths
 * @returns Resolved paths, including the context sentinel when watched
 */
export const getWatchDeliveryPaths = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly string[] => {
  const schema = node.schema.schema;
  const watch = readValidatedControls(schema)?.watch;
  if (!isArray(watch)) return EMPTY_ARRAY;
  const paths: string[] = [];
  for (const path of watch)
    paths.push(
      getStateDependencyPlan(node.runtime, node.path, path, node).path,
    );
  return paths;
};
