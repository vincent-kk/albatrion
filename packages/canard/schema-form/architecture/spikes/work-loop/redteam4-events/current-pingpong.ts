// @ts-nocheck — throwaway spike outside tsconfig `include`
/**
 * Item 2 against the CURRENT EventCascadeManager (MAX_LOOP_COUNT = 100):
 * two managers whose listeners publish to each other on every delivery.
 *   cd <package dir> && vite-node --config architecture/spikes/work-loop/vite.spike.config.mjs \
 *     architecture/spikes/work-loop/redteam4-events/current-pingpong.ts
 */
import { EventCascadeManager } from '@/schema-form/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager';
import { NodeEventType } from '@/schema-form/core/types';

const uncaught: string[] = [];
process.on('uncaughtException', (e) => uncaught.push(`uncaughtException: ${String(e.message).split('\n')[0]}`));
process.on('unhandledRejection', (e: any) => uncaught.push(`unhandledRejection: ${String(e?.message ?? e).split('\n')[0]}`));

const A = new EventCascadeManager(() => ({ path: '/a', dependencies: ['/b'] }));
const B = new EventCascadeManager(() => ({ path: '/b', dependencies: ['/a'] }));
let calls = 0;
let lastRevA = 0;
let lastRevB = 0;
let caughtInListener: string | null = null;
const write = (m: EventCascadeManager, v: number) => {
  try {
    m.publish(NodeEventType.UpdateValue, v, { previous: v - 1, current: v });
  } catch (e) {
    caughtInListener ??= `caught in listener: ${String(e.message).split('\n')[0]}`;
    throw e;
  }
};
A.subscribe(() => {
  calls++;
  write(B, calls);
});
B.subscribe(() => {
  calls++;
  write(A, calls);
});

let outerCaught: string | null = null;
const t0 = performance.now();
try {
  write(A, 0);
} catch (e) {
  outerCaught = String(e.message).split('\n')[0];
}
await new Promise((r) => setTimeout(r, 5));
lastRevA = A.revision(NodeEventType.UpdateValue);
lastRevB = B.revision(NodeEventType.UpdateValue);
const ms = performance.now() - t0;
console.log(
  '##RESULT## 2-current ' +
    JSON.stringify({
      listenerCalls: calls,
      revA: lastRevA,
      revB: lastRevB,
      outerCaught,
      caughtInListener,
      uncaught: uncaught.slice(0, 2),
      uncaughtCount: uncaught.length,
      ms: +ms.toFixed(1),
    }),
);

// after the macrotask reset, does the ping-pong resume?
calls = 0;
await new Promise((r) => setTimeout(r, 5));
write(A, 0);
await new Promise((r) => setTimeout(r, 5));
console.log('##RESULT## 2-current-after-reset ' + JSON.stringify({ listenerCalls: calls, uncaughtCount: uncaught.length }));
process.exit(0);
