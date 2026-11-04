import type { CoreObservationEnv } from '../../../types';

/** Running rAF loop and its evidence. */
export interface CoreFrameObservation {
  /** Clock reading at every animation frame callback since start. */
  stamps: number[];
  /** Resolve with the clock reading of the next animation frame; never resolves while frames stall. */
  nextFrame(): Promise<number>;
  /** Total time spent inside the loop's own callbacks. */
  overheadMs(): number;
  /** Stop requesting frames. */
  stop(): void;
}

/**
 * Start a continuous animation-frame loop that stamps the page clock at every frame.
 * @param env - Browser-owned clocks (rAF and now).
 * @returns The observation; the loop runs until `stop`.
 */
export function observeCoreFrames(
  env: CoreObservationEnv,
): CoreFrameObservation {
  const stamps: number[] = [];
  let waiters: ((at: number) => void)[] = [];
  let overhead = 0;
  let stopped = false;
  const tick = () => {
    const at = env.now();
    stamps.push(at);
    const resolved = waiters;
    waiters = [];
    for (const resolve of resolved) resolve(at);
    if (!stopped) env.requestAnimationFrame(tick);
    overhead += env.now() - at;
  };
  env.requestAnimationFrame(tick);
  return {
    stamps,
    nextFrame: () => new Promise((resolve) => waiters.push(resolve)),
    overheadMs: () => overhead,
    stop() {
      stopped = true;
    },
  };
}
