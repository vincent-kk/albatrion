import type { ValidatorWorkRow } from '../../stageClosingTypes';

/** Operation fractions are pooled across pages and trigger diagnosis strictly above a 0.20 increase. */
export function readStageClosingFrameDiagnosis(rows: ValidatorWorkRow[]) {
  return rows
    .filter((row) => row.lane === 'F' && row.longFrameFraction !== null)
    .flatMap((row) => {
      const before = rows.find(
        (other) => other.id === row.id && other.lane === 'B',
      );
      if (before?.longFrameFraction == null || row.longFrameFraction === null)
        return [];
      const difference = row.longFrameFraction - before.longFrameFraction;
      const exceeds =
        5 *
          (row.operationsWithLongFrame * before.units -
            before.operationsWithLongFrame * row.units) >
        row.units * before.units;
      return exceeds
        ? [
            {
              id: row.id,
              metric: 'longFrameFraction',
              F: row.longFrameFraction,
              B: before.longFrameFraction,
              difference,
              reason: 'operation-frame-fraction',
            },
          ]
        : [];
    });
}
