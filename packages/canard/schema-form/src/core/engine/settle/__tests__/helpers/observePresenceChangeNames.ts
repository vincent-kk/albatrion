import { expect, vi } from 'vitest';

import { hasOwnProperty } from '@winglet/common-utils/lib';

import { formatSegment } from '@/schema-form/helpers/jsonPointer';

import { getHostDerived } from '../../../utils/cache/derivedRecords';
import * as presence from '../../utils/dependencies/collectPresenceChangeNames';

/** Compare every real collector call with the original full traversal and count fallback evidence. */
export const observePresenceChangeNames = () => {
  const counts = {
    calls: 0,
    bounded: 0,
    missing: 0,
    mismatch: 0,
    null: 0,
    entered: 0,
    exited: 0,
    perished: 0,
    revived: 0,
  };
  const collect = presence.collectPresenceChangeNames;
  vi.spyOn(presence, 'collectPresenceChangeNames').mockImplementation(
    (host, previous, context) => {
      const structure = host.structure ?? {};
      const expected: string[] = [];
      for (const name in previous)
        if (
          !hasOwnProperty(structure, name) ||
          previous[name] !== structure[name]
        )
          expected.push(formatSegment(name));
      for (const name in structure)
        if (!hasOwnProperty(previous, name)) expected.push(formatSegment(name));
      const witness = context.presenceSelections?.get(host);
      const prepared = getHostDerived<
        'preparedStaticHost',
        { selectedStructure: typeof structure }
      >(host).preparedStaticHost;
      counts.calls++;
      if (!witness || !prepared || !context.preparedStaticHosts?.has(host))
        counts.missing++;
      else if (
        witness.structure !== previous ||
        prepared.selectedStructure !== structure
      )
        counts.mismatch++;
      else if (host.raw === null) counts.null++;
      else if (context.entered.has(host)) counts.entered++;
      else if (context.exited.has(host)) counts.exited++;
      else if (context.perished.has(host)) counts.perished++;
      else if (context.revived.has(host)) counts.revived++;
      else counts.bounded++;
      const actual = collect(host, previous, context);
      expect(actual).toEqual(expected);
      return actual;
    },
  );
  return counts;
};
