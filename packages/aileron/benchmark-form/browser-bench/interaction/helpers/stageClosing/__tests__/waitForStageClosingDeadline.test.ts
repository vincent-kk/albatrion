import { expect, it } from 'vitest';

import { waitForStageClosingDeadline } from '../waitForStageClosingDeadline';

it('rechecks a submillisecond-early timer before allowing the next operation', async () => {
  let clock = 0;
  const delays: number[] = [];
  await waitForStageClosingDeadline(
    1000,
    () => clock,
    async (delay) => {
      delays.push(delay);
      clock += delays.length === 1 ? delay - 0.3 : delay;
    },
  );
  expect(clock).toBeGreaterThanOrEqual(1000);
  expect(delays).toEqual([1000, 1]);
});
it('returns immediately after an operation already exceeded its slot', async () => {
  let sleeps = 0;
  await waitForStageClosingDeadline(
    1000,
    () => 1001,
    async () => {
      sleeps++;
    },
  );
  expect(sleeps).toBe(0);
});
