import type { SchemaNodeRecord } from '../../../record';
import { getGateRegistry } from '../gates/getGateRegistry';
import type { GateOccurrence } from '../gates/type';

/**
 * Find gates whose reads move their evaluation to this ancestor host.
 * @param node - Current host in the root descent
 * @returns Distinct bound gates in blueprint document order
 */
export const relocatedGates = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): readonly GateOccurrence[] => getGateRegistry(node.runtime).relocated(node.path);
