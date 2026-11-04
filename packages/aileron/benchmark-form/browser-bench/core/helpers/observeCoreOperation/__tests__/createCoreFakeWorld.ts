import type {
  CoreLongTaskEntry,
  CoreLongTaskSource,
  CoreMarkerObservation,
  CoreObservationEnv,
} from '../../../types';

/** Virtual page clock: frames fire on a fixed grid, timers at absolute times, both only from `step`. */
export interface CoreFakeWorld {
  /** Injected clocks. */
  env: CoreObservationEnv;
  /** Advance the clock synchronously, as a busy segment would. */
  spend(ms: number): void;
  /** Run a callback when the virtual clock reaches an absolute time. */
  schedule(atMs: number, callback: () => void): void;
  /** Stop animation frames from this moment on. */
  stallFrames(): void;
  /** Step virtual events until the promise settles; throws when nothing is scheduled. */
  runUntil<T>(promise: Promise<T>): Promise<T>;
  /** Marker double with a setter that records transitions on the virtual clock. */
  marker: CoreMarkerObservation & { set(state: '0' | '1'): void };
  /** Long Task double: `entries()` is delivered 200 ms after registration, `late()` is returned by takeRecords. */
  longTasks(
    entries: () => CoreLongTaskEntry[],
    late?: () => CoreLongTaskEntry[],
  ): CoreLongTaskSource;
}

/**
 * Build a deterministic stand-in for the browser clocks observers depend on.
 * @param frameMs - Animation frame period of the virtual compositor.
 * @returns Clocks and controls; nothing runs until `runUntil` steps the world.
 */
export function createCoreFakeWorld(frameMs = 16): CoreFakeWorld {
  let now = 0;
  let stalledAt = Infinity;
  const frames: (() => void)[] = [];
  const timers: { at: number; callback: () => void }[] = [];
  const transitions: CoreMarkerObservation['transitions'] = [];
  let markerState: '0' | '1' | null = '0';
  const nextFrameAt = () => {
    if (!frames.length) return Infinity;
    const at = Math.floor(now / frameMs) * frameMs + frameMs;
    return at <= stalledAt ? at : Infinity;
  };
  const step = async () => {
    timers.sort((a, b) => a.at - b.at);
    const frameAt = nextFrameAt();
    const timerAt = timers.length ? timers[0].at : Infinity;
    const at = Math.min(frameAt, timerAt);
    if (!Number.isFinite(at)) return false;
    now = Math.max(now, at);
    if (frameAt <= timerAt) for (const callback of frames.splice(0)) callback();
    else timers.shift()?.callback();
    await new Promise((resolve) => setTimeout(resolve, 0));
    return true;
  };
  return {
    env: {
      now: () => now,
      requestAnimationFrame: (callback) => {
        frames.push(callback);
      },
      setTimeout: (callback, delayMs) => {
        timers.push({ at: now + delayMs, callback });
      },
    },
    spend(ms) {
      now += ms;
    },
    schedule(atMs, callback) {
      timers.push({ at: atMs, callback });
    },
    stallFrames() {
      stalledAt = now;
    },
    async runUntil(promise) {
      let done = false;
      const guarded = promise.then(
        (value) => {
          done = true;
          return value;
        },
        (error: unknown) => {
          done = true;
          throw error;
        },
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
      while (!done)
        if (!(await step()))
          throw new Error('Fake world has nothing left to run at ' + now);
      return guarded;
    },
    marker: {
      transitions,
      state: () => markerState,
      count: () => 1,
      set(state) {
        markerState = state;
        transitions.push({ atMs: now, state });
      },
    },
    longTasks:
      (entries, late = () => []) =>
      (deliver) => {
        timers.push({ at: now + 200, callback: () => deliver(entries()) });
        return { takeRecords: late, disconnect: () => {} };
      },
  };
}
