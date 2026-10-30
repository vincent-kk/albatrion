import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';

/**
 * Aggregate per-write evidence without mixing mount loads into write denominators.
 * @param {any} evidence - Clock-free row or delivery observation file
 * @param {string[]} labels - Complete expected row or scene identities
 * @returns Rows with closure, round and allocation statistics and explicit missing-write reasons
 */
export function summarizeDiagnostics(evidence, labels) {
  assert.equal(evidence.timed, false);
  return labels.map((label) => {
    const records = evidence.rows.filter(
      (row) => row.label === label && row.kind !== 'load',
    );
    const rounds = records.flatMap((row) => row.rounds);
    assert.ok(
      rounds.every(
        (round) =>
          Number.isInteger(round.changeSetSize) && round.changeSetSize >= 0,
      ),
    );
    const allocations = records.map((record) =>
      [
        ...Object.entries(record.allocations).map(([site, count]) => ({
          site,
          count,
          delivery: false,
        })),
        ...Object.entries(record.deliveryAllocations ?? {}).map(
          ([site, count]) => ({ site, count, delivery: true }),
        ),
      ].reduce(
        (counts, { site, count, delivery }) => {
          const group = delivery
            ? 'delivery'
            : site.includes('/commit/')
              ? 'commit'
              : site.includes('/write/')
                ? 'delivery'
                : site.includes('/compute/') ||
                    site.includes('/gates/') ||
                    site.includes('/dependencies/')
                  ? 'wheel'
                  : 'other';
          counts[group] += Number(count);
          counts[site.endsWith('Map') ? 'maps' : 'sets'] += Number(count);
          return counts;
        },
        { maps: 0, sets: 0, wheel: 0, commit: 0, delivery: 0, other: 0 },
      ),
    );
    const refusalReasons = {};
    for (const record of records)
      for (const reason of record.closure.reasons.filter(
        (reason, index, values) => values.indexOf(reason) === index,
      ))
        refusalReasons[reason] = (refusalReasons[reason] ?? 0) + 1;
    const count = records.length;
    return {
      label,
      writes: count,
      closedWrites: records.filter((row) => row.closure.qualifies).length,
      usefulWrites: records.filter((row) => row.closure.useful).length,
      closedFraction: count
        ? records.filter((row) => row.closure.qualifies).length / count
        : null,
      usefulFraction: count
        ? records.filter((row) => row.closure.useful).length / count
        : null,
      rootScopes: records.filter((row) => row.closure.scope === '').length,
      scopes: records
        .map((row) => row.closure.scope)
        .filter((scope, index, values) => values.indexOf(scope) === index),
      refusalReasons,
      computeCalls: records.map((row) =>
        Object.values(row.computes).reduce(
          (sum, count) => sum + Number(count),
          0,
        ),
      ),
      rounds: rounds.length,
      roundsPerWrite: count ? rounds.length / count : null,
      emptyRounds: rounds.filter((round) => round.changeSetSize === 0).length,
      emptyOpeningRounds: rounds.filter(
        (round) => round.changeSetSize === 0 && round.openedNext,
      ).length,
      emptyTerminalRounds: rounds.filter(
        (round) => round.changeSetSize === 0 && !round.openedNext,
      ).length,
      roundChanges: rounds.map((round) => ({
        host: round.host,
        computeId: round.computeId,
        round: round.round,
        parentRound: round.parentRound,
        changeSetSize: round.changeSetSize,
        openedNext: round.openedNext,
        flags: round.flags,
      })),
      contexts: count ? median(records.map((row) => row.contexts)) : null,
      scratchNew: count ? median(records.map((row) => row.scratchNew)) : null,
      scratchReused: count
        ? median(records.map((row) => row.scratchReused))
        : null,
      allocations: count
        ? Object.fromEntries(
            Object.keys(allocations[0]).map((key) => [
              key,
              median(allocations.map((counts) => counts[key])),
            ]),
          )
        : null,
      ...(count
        ? {}
        : {
            note: 'No non-load writes; mount rows have no write closure denominator.',
          }),
    };
  });
}
