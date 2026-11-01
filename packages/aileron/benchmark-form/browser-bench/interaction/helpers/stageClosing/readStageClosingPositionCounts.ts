import type { SampleResult } from '../summarizeResults';

/** Count actual retained positions per row and lane, including the L rebuild exclusion. */
export function readStageClosingPositionCounts(
  samples: Pick<SampleResult, 'id' | 'lane' | 'index'>[],
) {
  const ids = samples
    .map((s) => s.id)
    .filter((id, index, all) => all.indexOf(id) === index);
  return Object.fromEntries(
    ids.map((id) => {
      const row = samples.filter((s) => s.id === id);
      const counts = {
        L: [0, 0, 0, 0],
        B: [0, 0, 0, 0],
        S: [0, 0, 0, 0],
        F: [0, 0, 0, 0],
      };
      for (const lane of ['L', 'B', 'S', 'F'] as const)
        for (const sample of row.filter((s) => s.lane === lane)) {
          const position = row
            .filter((s) => s.index === sample.index)
            .findIndex((s) => s.lane === lane);
          if (position >= 0) counts[lane][position]++;
        }
      return [id, counts];
    }),
  );
}
