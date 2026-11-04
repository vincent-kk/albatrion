// Loaded by probeCoreFrames through esbuild into probe.js; frameProbe.html runs it and the driver calls window.__probe.
import { createCoreLongTaskSource } from '../helpers/createCoreLongTaskSource';
import { detectCoreFrameIntervalNominal } from '../helpers/detectCoreFrameIntervalNominal';
import { observeCoreFrames } from '../helpers/observeCoreFrames';
import { observeCoreLongTasks } from '../helpers/observeCoreLongTasks';
import type { CoreLongTaskEntry, CoreObservationEnv } from '../types';
import { medianCoreProbeGaps } from './utils/medianCoreProbeGaps';

/** What the driver checks; every number is in milliseconds. */
export interface CoreFrameProbeResult {
  /** Whether the page is cross-origin isolated, which gives performance.now 5 µs instead of 100 µs resolution. */
  crossOriginIsolated: boolean;
  /** Longest rAF gap while the 80 ms busy loop ran. */
  busyGapMs: number;
  /** maxLongTaskMs of a window around the busy loop. */
  busyMaxLongTaskMs: number | null;
  /** Whether the buffered observer delivered a task that ended before registration (Chromium keeps no longtask buffer, so false is expected); informational. */
  preRegistrationDelivered: boolean;
  /** maxLongTaskMs of a window that starts after that task and must exclude it. */
  preRegistrationMaxLongTaskMs: number | null;
  /** maxLongTaskMs of a window that starts 40 ms into an 80 ms task. */
  straddleMaxLongTaskMs: number | null;
  /** longTaskOverlapMs of that straddling window. */
  straddleOverlapMs: number;
  /** maxLongTaskMs collected by takeRecords right after a busy loop, before any callback could run. */
  lateMaxLongTaskMs: number | null;
  /** Median empty rAF gap over 10 s. */
  idleMedianGapMs: number;
  /** Nominal period detected from the idle median; null means unsupported cadence. */
  frameIntervalNominalMs: number | null;
  /** Raw observer self-time minus the same-run bare-loop floor, in ms/s. */
  idleNetOverheadMsPerSecond: number;
  /** Frame loop callback self-time per second during the idle observation. */
  idleOverheadMsPerSecond: number;
  /** Self-time per second of a bare rAF loop that only re-registers itself: the floor any frame observer pays. */
  idleFloorMsPerSecond: number;
}

/**
 * Block the probe thread with a known Long Task.
 * @param ms - Requested busy duration in milliseconds.
 * @returns Nothing; keeps the current task busy until the page clock reaches its deadline.
 */
const busy = (ms: number) => {
  const until = performance.now() + ms;
  while (performance.now() < until);
};

/** Browser-owned clocks passed to production observers; rAF stamps use the page clock. */
const env: CoreObservationEnv = {
  now: () => performance.now(),
  requestAnimationFrame: (callback) => {
    requestAnimationFrame(() => callback());
  },
  setTimeout: (callback, delayMs) => {
    setTimeout(callback, delayMs);
  },
};

/** Resolve after the browser timer delay in ms; lets queued observer tasks run. */
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

declare global {
  interface Window {
    /** Probe entry called by the Playwright driver. */
    __probe: { run(): Promise<CoreFrameProbeResult> };
  }
}

window.__probe = {
  async run() {
    const earlierStart = performance.now();
    busy(80);
    await sleep(20);
    const seen: CoreLongTaskEntry[] = [];
    const preRegistration = observeCoreLongTasks(
      (deliver) => createCoreLongTaskSource(deliver, seen),
      env,
    );
    const preRegistrationStart = performance.now();
    await sleep(100);
    const preRegistrationSummary = await preRegistration.finish(
      preRegistrationStart,
      performance.now(),
    );
    const preRegistrationDelivered = seen.some(
      (entry) =>
        entry.startTime >= earlierStart - 5 &&
        entry.startTime < preRegistrationStart,
    );

    const frames = observeCoreFrames(env);
    const busyTasks = observeCoreLongTasks(createCoreLongTaskSource, env);
    await frames.nextFrame();
    const busyStart = performance.now();
    busy(80);
    await frames.nextFrame();
    await sleep(50);
    const busySummary = await busyTasks.finish(
      busyStart - 5,
      performance.now(),
    );
    const busyGapMs = Math.max(
      ...frames.stamps.slice(1).map((at, index) => at - frames.stamps[index]),
    );
    frames.stop();

    const straddleTasks = observeCoreLongTasks(createCoreLongTaskSource, env);
    await sleep(20);
    const straddleStart = performance.now();
    busy(80);
    await sleep(50);
    const straddleSummary = await straddleTasks.finish(
      straddleStart + 40,
      performance.now(),
    );

    const lateTasks = observeCoreLongTasks(createCoreLongTaskSource, env);
    await sleep(20);
    const lateStart = performance.now();
    busy(80);
    const lateSummary = await lateTasks.finish(
      lateStart,
      performance.now() + 1,
    );

    const idle = observeCoreFrames(env);
    const idleStart = performance.now();
    await sleep(10000);
    idle.stop();
    const gaps = idle.stamps
      .slice(1)
      .map((at, index) => at - idle.stamps[index]);
    const idleSeconds = (performance.now() - idleStart) / 1000;
    let floor = 0;
    let bare = true;
    const tick = () => {
      const at = performance.now();
      if (bare) requestAnimationFrame(tick);
      floor += performance.now() - at;
    };
    requestAnimationFrame(tick);
    const floorStart = performance.now();
    await sleep(5000);
    bare = false;
    const floorSeconds = (performance.now() - floorStart) / 1000;
    return {
      crossOriginIsolated: window.crossOriginIsolated,
      busyGapMs,
      busyMaxLongTaskMs: busySummary.maxLongTaskMs,
      preRegistrationDelivered,
      preRegistrationMaxLongTaskMs: preRegistrationSummary.maxLongTaskMs,
      straddleMaxLongTaskMs: straddleSummary.maxLongTaskMs,
      straddleOverlapMs: straddleSummary.longTaskOverlapMs,
      lateMaxLongTaskMs: lateSummary.maxLongTaskMs,
      idleMedianGapMs: medianCoreProbeGaps(gaps),
      frameIntervalNominalMs: detectCoreFrameIntervalNominal(
        medianCoreProbeGaps(gaps),
      ),
      idleNetOverheadMsPerSecond:
        idle.overheadMs() / idleSeconds - floor / floorSeconds,
      idleOverheadMsPerSecond: idle.overheadMs() / idleSeconds,
      idleFloorMsPerSecond: floor / floorSeconds,
    };
  },
};
