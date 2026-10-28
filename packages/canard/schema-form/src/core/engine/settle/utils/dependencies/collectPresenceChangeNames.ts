import { hasOwnProperty } from '@winglet/common-utils/lib';

import { formatSegment } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import type { SettlementContext } from '../../types/settlement';
import type { PreparedStaticHost } from '../compute/childSelection/utils/prepareStaticHost';

/**
 * Compare the dynamic selection delta when static occurrence witnesses remain valid.
 * @param host - Live branch whose current child selection is finalized
 * @param previous - Preceding round's immutable identity map
 * @param context - Settlement-local membership witnesses and host lifecycle changes
 * @returns Escaped names in departure/replacement order followed by arrival order.
 * Unproven, nullified, or entering/departing hosts retain the original full scans.
 */
export const collectPresenceChangeNames = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  previous: Readonly<Record<string, Self>>,
  context: SettlementContext<Self>,
): string[] => {
  const structure = host.structure ?? {};
  const witness = context.presenceSelections?.get(host);
  const prepared = witness
    ? getHostDerived<'preparedStaticHost', PreparedStaticHost<Self>>(host)
        .preparedStaticHost
    : undefined;
  const bounded =
    witness?.structure === previous &&
    prepared?.selectedStructure === structure &&
    context.preparedStaticHosts?.has(host) &&
    host.raw !== null &&
    !context.entered.has(host) &&
    !context.exited.has(host) &&
    !context.perished.has(host) &&
    !context.revived.has(host);
  const names: string[] = [];
  if (bounded) {
    for (const name of witness.names)
      if (
        !hasOwnProperty(structure, name) ||
        previous[name] !== structure[name]
      )
        names.push(formatSegment(name));
    for (const name of prepared.dynamicNames)
      if (!hasOwnProperty(previous, name)) names.push(formatSegment(name));
    context.presenceSelections!.set(host, {
      structure,
      names: prepared.dynamicNames,
    });
  } else {
    for (const name in previous)
      if (
        !hasOwnProperty(structure, name) ||
        previous[name] !== structure[name]
      )
        names.push(formatSegment(name));
    for (const name in structure)
      if (!hasOwnProperty(previous, name)) names.push(formatSegment(name));
  }
  return names;
};
