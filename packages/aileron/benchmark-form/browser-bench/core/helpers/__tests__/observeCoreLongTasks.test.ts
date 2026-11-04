import { expect, it } from 'vitest';

import { observeCoreLongTasks } from '../observeCoreLongTasks';
import { createCoreFakeWorld } from '../observeCoreOperation/__tests__/createCoreFakeWorld';

it('drains an entry that only becomes available in the next macrotask', async () => {
  const world = createCoreFakeWorld();
  let available = false;
  world.schedule(world.env.now(), () => {
    available = true;
  });
  const observer = observeCoreLongTasks(
    () => ({
      takeRecords: () => (available ? [{ startTime: 0, duration: 80 }] : []),
      disconnect: () => {},
    }),
    world.env,
  );
  const summary = await world.runUntil(observer.finish(0, 80));
  expect(summary.maxLongTaskMs).toBe(80);
  expect(summary.longTaskOverlapMs).toBe(80);
});
