type Operation = {
  run: () => unknown;
  validate: (value: unknown) => boolean;
  cleanup?: () => void;
};

/** Measures operations and validates every returned value outside the timer. */
export async function measureBatch(count: number, prepare: () => Operation) {
  const operations = Array.from({ length: count }, prepare);
  const results = new Array<unknown>(count);
  try {
    const start = process.hrtime.bigint();
    for (let i = 0; i < count; i++) {
      const value = operations[i].run();
      results[i] = value instanceof Promise ? await value : value;
    }
    const elapsedNs = Number(process.hrtime.bigint() - start);
    if (results.some((value, index) => !operations[index].validate(value)))
      throw new Error('Result validation failed');
    return { elapsedNs, observed: results[results.length - 1] };
  } finally {
    for (const operation of operations) operation.cleanup?.();
  }
}
