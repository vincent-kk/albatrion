import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

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
 * The bounded path advances this host's settlement witness to the current children-by-name map.
 */
export const collectPresenceChangeNames = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  previous: Readonly<Dictionary<Self>>,
  context: SettlementContext<Self>,
): string[] => {
  const childrenByName = host.childrenByName ?? {};
  const witness = context.presenceSelections?.get(host);
  const prepared = witness
    ? getHostDerived<'preparedStaticHost', PreparedStaticHost<Self>>(host)
        .preparedStaticHost
    : undefined;
  const bounded =
    witness?.childrenByName === previous &&
    prepared?.selectedChildrenByName === childrenByName &&
    context.preparedStaticHosts?.has(host) &&
    host.source !== null &&
    !context.entered.has(host) &&
    !context.exited.has(host) &&
    !context.perished.has(host) &&
    !context.revived.has(host);
  const names: string[] = [];
  if (bounded) {
    for (const name of witness.names)
      if (
        !hasOwnProperty(childrenByName, name) ||
        previous[name] !== childrenByName[name]
      )
        names.push(formatSegment(name));
    for (const name of prepared.dynamicNames)
      if (!hasOwnProperty(previous, name)) names.push(formatSegment(name));
    context.presenceSelections!.set(host, {
      childrenByName,
      names: prepared.dynamicNames,
    });
  } else {
    for (const name in previous)
      if (
        !hasOwnProperty(childrenByName, name) ||
        previous[name] !== childrenByName[name]
      )
        names.push(formatSegment(name));
    for (const name in childrenByName)
      if (!hasOwnProperty(previous, name)) names.push(formatSegment(name));
  }
  return names;
};
