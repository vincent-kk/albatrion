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
    enteredNodes: 0,
    exitedNodes: 0,
    perishedNodes: 0,
    revivedNodes: 0,
  };
  const collect = presence.collectPresenceChangeNames;
  vi.spyOn(presence, 'collectPresenceChangeNames').mockImplementation(
    (host, previous, context) => {
      const childrenByName = host.childrenByName ?? {};
      const expected: string[] = [];
      for (const name in previous)
        if (
          !hasOwnProperty(childrenByName, name) ||
          previous[name] !== childrenByName[name]
        )
          expected.push(formatSegment(name));
      for (const name in childrenByName)
        if (!hasOwnProperty(previous, name)) expected.push(formatSegment(name));
      const witness = context.presenceSelections?.get(host);
      const prepared = getHostDerived<
        'preparedStaticHost',
        { selectedChildrenByName: typeof childrenByName }
      >(host).preparedStaticHost;
      counts.calls++;
      if (!witness || !prepared || !context.preparedStaticHosts?.has(host))
        counts.missing++;
      else if (
        witness.childrenByName !== previous ||
        prepared.selectedChildrenByName !== childrenByName
      )
        counts.mismatch++;
      else if (host.source === null) counts.null++;
      else if (context.enteredNodes.has(host)) counts.enteredNodes++;
      else if (context.exitedNodes.has(host)) counts.exitedNodes++;
      else if (context.perishedNodes.has(host)) counts.perishedNodes++;
      else if (context.revivedNodes.has(host)) counts.revivedNodes++;
      else counts.bounded++;
      const actual = collect(host, previous, context);
      expect(actual).toEqual(expected);
      return actual;
    },
  );
  return counts;
};
