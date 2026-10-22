import { encodeValue } from '../../encodeValue';
import type { ObservationDifference, ObservationMask } from '../../types';

/**
 * Collect ordered content differences and consume only predeclared predictions.
 * @param updated - Committed updated channel.
 * @param fresh - Independently mounted channel.
 * @param path - JSON Pointer into the observation.
 * @param masks - Predictions created before comparison.
 * @param differences - Destination for every unmasked difference.
 * @param applied - Counter of masks that actually covered a difference.
 * @param present - Own-key presence on each side.
 * @returns Nothing; output destinations retain the evidence.
 */
export function collectDifferences(
  updated: unknown,
  fresh: unknown,
  path: string,
  masks: readonly ObservationMask[],
  differences: ObservationDifference[],
  applied: Partial<Record<ObservationMask['category'], number>>,
  present: readonly [boolean, boolean] = [true, true],
): void {
  const equal =
    present[0] === present[1] &&
    JSON.stringify(encodeValue(updated)) === JSON.stringify(encodeValue(fresh));
  if (equal) return;
  const mask = masks.find((candidate) => candidate.path === path);
  if (
    mask &&
    JSON.stringify(encodeValue(fresh)) ===
      JSON.stringify(encodeValue(mask.fresh))
  ) {
    applied[mask.category] = (applied[mask.category] ?? 0) + 1;
    return;
  }
  if (
    present[0] !== present[1] ||
    updated === null ||
    fresh === null ||
    typeof updated !== 'object' ||
    typeof fresh !== 'object' ||
    Array.isArray(updated) !== Array.isArray(fresh)
  ) {
    differences.push({
      path,
      updated: present[0] ? updated : ['missing'],
      fresh: present[1] ? fresh : ['missing'],
    });
    return;
  }
  const leftKeys = Object.keys(updated);
  const rightKeys = Object.keys(fresh);
  if (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => rightKeys.includes(key)) &&
    leftKeys.some((key, index) => key !== rightKeys[index])
  )
    differences.push({
      path: `${path}/[[key-order]]`,
      updated: leftKeys,
      fresh: rightKeys,
    });
  if (
    Array.isArray(updated) &&
    Array.isArray(fresh) &&
    updated.length !== fresh.length
  )
    differences.push({
      path: `${path}/length`,
      updated: updated.length,
      fresh: fresh.length,
    });
  for (const key of [
    ...leftKeys,
    ...rightKeys.filter((key) => !leftKeys.includes(key)),
  ]) {
    const escaped = key.replace(/~/g, '~0').replace(/\//g, '~1');
    collectDifferences(
      Reflect.get(updated, key),
      Reflect.get(fresh, key),
      `${path}/${escaped}`,
      masks,
      differences,
      applied,
      [
        Object.prototype.hasOwnProperty.call(updated, key),
        Object.prototype.hasOwnProperty.call(fresh, key),
      ],
    );
  }
}
