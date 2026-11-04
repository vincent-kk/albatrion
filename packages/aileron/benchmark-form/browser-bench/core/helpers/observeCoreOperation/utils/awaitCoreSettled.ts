import type { CoreObservationEnv } from '../../../types';
import type { CoreFrameObservation } from './observeCoreFrames';

/** Settle inputs: the operation's own conditions and its activity counter. */
export interface CoreSettleConditions {
  /** Whether the driver is done, the last value is validated and shown, and no run is in flight. */
  holds(): boolean;
  /** Monotonic count of validator starts plus marker changes; a change restarts the quiet wait. */
  activity(): number;
}

/** Delay in ms used to poll the conditions while frames may be stalled. */
const POLL_MS = 50;
/** Quiet period that ends the window when two frames do not arrive first. */
const QUIET_MS = 250;

/** Resolve after a timer. */
const sleep = (env: CoreObservationEnv, delayMs: number) =>
  new Promise<void>((resolve) => env.setTimeout(resolve, delayMs));

/**
 * Wait until the conditions hold and then stay quiet for two frames or 250 ms, whichever comes first.
 * @param conditions - Operation-specific settle conditions.
 * @param env - Browser-owned clocks.
 * @param frames - Running frame loop used for the frame-based waits.
 * @param cap - Rejects at the independent sample cap; raced against every wait.
 * @returns Clock reading at the end of the clean quiet period.
 */
export async function awaitCoreSettled(
  conditions: CoreSettleConditions,
  env: CoreObservationEnv,
  frames: CoreFrameObservation,
  cap: Promise<never>,
): Promise<number> {
  for (;;) {
    while (!conditions.holds())
      await Promise.race([frames.nextFrame(), sleep(env, POLL_MS), cap]);
    const before = conditions.activity();
    await Promise.race([
      frames.nextFrame().then(() => frames.nextFrame()),
      sleep(env, QUIET_MS),
      cap,
    ]);
    if (conditions.activity() === before && conditions.holds())
      return env.now();
  }
}
