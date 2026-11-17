import type {
  CoreObservationEnv,
  CoreValidationReport,
  CoreValidatorObservation,
} from '../../../../types';

/**
 * Wait for at least one onValidate report, a recorded run, and no pending run.
 * @param observation - Live records and pending runs from the registered validator wrapper.
 * @param reports - Live onValidate reports collected by the fixture.
 * @param env - Browser-owned monotonic clock and timers, independent of animation frames.
 * @returns Resolves immediately when all load evidence exists, otherwise polls for at most 1000 ms.
 * @throws If the report, recorded run, and no-pending condition is unmet at the ceiling.
 */
export async function waitForCoreLoadValidation(
  observation: CoreValidatorObservation,
  reports: readonly CoreValidationReport[],
  env: CoreObservationEnv,
): Promise<void> {
  const deadline = env.now() + 1000;
  for (;;) {
    const remaining = deadline - env.now();
    if (remaining <= 0)
      throw new Error(
        'Core first-key load validation did not settle within 1000 ms',
      );
    if (
      reports.length > 0 &&
      observation.records.some((record) => record.kind === 'run') &&
      observation.pending.size === 0
    )
      return;
    await new Promise<void>((resolve) =>
      env.setTimeout(resolve, Math.min(10, remaining)),
    );
  }
}
