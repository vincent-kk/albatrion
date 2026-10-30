/** Make mutable, conserved stage evidence for synthetic validator checks; no clocks or product code run. */
export function createStageRecords(scale) {
  return Array.from({ length: 3 }, (_, repeat) => ({
    row: 'fixture',
    pass: 'ledger',
    repeat,
    warmups: 20,
    sampleCount: 100,
    samples: {
      wrapped: Array(100).fill(3 * scale),
      unwrapped: Array(100).fill(2 * scale),
    },
    stages: Array.from({ length: 100 }, () => ({
      primeHost: { selfUs: scale, inclusiveUs: scale, calls: 1 },
      everythingElse: { selfUs: 2 * scale, inclusiveUs: 2 * scale, calls: 1 },
    })),
  }));
}
