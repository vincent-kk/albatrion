import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRuntime } from '../../../../../record';
import { HostLatent } from '../../../latentStore/HostLatent';
import { isMisfit } from '../../isMisfit';
import { compareInactiveOrder } from './compareInactiveOrder';

/**
 * Select this path's first enumerable latent kind in document order.
 * @param runtime - Source values, metadata and their existing exact-path index
 * @param path - Absent public occurrence to reconsider
 * @returns Its winning existing pair key, value and metadata, or undefined
 */
export const readInactiveCandidate = <Self>(
  runtime: FieldNodeRuntime<Self>,
  path: string,
) => {
  let chosen:
    | { key: string; value: unknown; order: readonly number[] }
    | undefined;
  for (const key of runtime.latentRaw.pathIndex.at(path)) {
    const info = runtime.latentRawMetadata?.get(key);
    if (!info) continue;
    const template = info.blueprintNode;
    const source = runtime.latentRaw.get(key);
    const value =
      template.strategy === 'terminal'
        ? source
        : source instanceof HostLatent &&
            source.raw !== undefined &&
            ((template.kind === 'array' && isArray(source.raw)) ||
              isMisfit(source.raw, template.schemaType, template.nullable))
          ? source.raw
          : undefined;
    if (value === undefined) continue;
    if (!chosen || compareInactiveOrder(info.order, chosen.order) < 0)
      chosen = { key, value, order: info.order };
  }
  return chosen;
};
