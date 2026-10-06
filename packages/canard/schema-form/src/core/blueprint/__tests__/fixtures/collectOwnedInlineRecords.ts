import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint, BlueprintChildEntry } from '../../type';

/** A unique internal record and its directly owned membership containers. */
export interface OwnedInlineRecord {
  record: Record<string, unknown>;
  shared: boolean;
  arrays: { field: string; value: object }[];
}

/** Closed membership vocabulary; authored schema and gate conditions are opaque. */
const FIELDS = [
  'order',
  'gates',
  'declarations',
  'childEntries',
  'declares',
  'overlays',
  'inheritedOverlays',
  'children',
  'prefixItems',
  'fields',
  'expressions',
  'nodes',
  'fragments',
  'dependencies',
  'appliesWhen',
  'evaluationReads',
  'values',
];
/** Only these memberships lead to other analysis records. */
const RECORD_FIELDS = [
  'gates',
  'declarations',
  'childEntries',
  'prefixItems',
  'expressions',
  'nodes',
  'fragments',
  'appliesWhen',
];

/**
 * Collect every record once, including gate owners and compiled expressions.
 * @param analysis - Completed finite blueprint whose authored values stay opaque.
 * @param slots - Lazy entries created after mounting.
 * @returns Distinct records with owned arrays; shared metadata is marked separately.
 */
export const collectOwnedInlineRecords = (
  analysis: Blueprint,
  slots: readonly BlueprintChildEntry[] = [],
): OwnedInlineRecord[] => {
  const pending: object[] = [analysis, ...slots];
  const seen = new Set<object>();
  const result: OwnedInlineRecord[] = [];
  for (let index = 0; index < pending.length; index++) {
    const current = pending[index];
    if (seen.has(current)) continue;
    seen.add(current);
    const record = current as Record<string, unknown>;
    const shared =
      record.kind === 'active' ||
      record.kind === 'if' ||
      record.kind === 'discriminator' ||
      ('propertyName' in record && 'values' in record);
    const arrays: OwnedInlineRecord['arrays'] = [];
    for (const field of FIELDS) {
      const value = record[field];
      if (isArray(value)) {
        arrays.push({ field, value });
        if (RECORD_FIELDS.includes(field))
          for (const child of value)
            if (child && typeof child === 'object') pending.push(child);
      } else if (
        field === 'dependencies' &&
        value &&
        typeof value === 'object'
      ) {
        const dictionary = value as Record<string, object>;
        result.push({
          record: dictionary,
          shared: false,
          arrays: Object.keys(dictionary).map((key) => ({
            field: key,
            value: dictionary[key],
          })),
        });
      }
    }
    if (record.item && typeof record.item === 'object')
      pending.push(record.item);
    if (record.capabilities && typeof record.capabilities === 'object')
      pending.push(record.capabilities);
    if (record.node && typeof record.node === 'object')
      pending.push(record.node);
    if (
      record.kind === 'discriminator' &&
      record.condition &&
      typeof record.condition === 'object'
    )
      pending.push(record.condition);
    result.push({ record, shared, arrays });
  }
  return result;
};
