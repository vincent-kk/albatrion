import { drainTicks } from './setup-env';

/**
 * Crosses the fixture settlement barrier using the runtime's event loop.
 * Legacy EventCascadeManager.ts:112,120 schedules a macrotask batch reset and
 * microtask delivery; AbstractNode.ts:1219 defers root change via afterMicrotask.
 * The immediate before the single timer separates synchronous work from its
 * clamped wait; the final immediate drains timer-triggered resets/React work.
 * @returns Completion after microtasks → immediate → timer → immediate
 */
export async function settleUpdates(): Promise<void> {
  await Promise.resolve();
  await drainTicks();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await drainTicks();
}
