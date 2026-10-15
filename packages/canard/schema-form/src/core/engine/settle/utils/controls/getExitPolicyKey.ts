import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { ControlLayer } from './getControlLayers';

/**
 * Address one authored exit expression at its declaring host occurrence.
 * @param group - Control layer retaining its host and source schema address
 * @returns Stable key shared by commit evaluation and later exit reads
 */
export const getExitPolicyKey = (
  group: ControlLayer<{
    path: string;
    blueprintNode: Parameters<typeof getBlueprintNodeIdentity>[0];
  }>,
): string =>
  JSON.stringify([
    group.host.path,
    getBlueprintNodeIdentity(group.host.blueprintNode),
    group.declarationId,
    group.schemaPath + '/unsetOnInactive',
    undefined,
  ]);
