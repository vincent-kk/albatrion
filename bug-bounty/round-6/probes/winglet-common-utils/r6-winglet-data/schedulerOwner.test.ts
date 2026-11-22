import { expect, it } from 'vitest';
import { MessageChannelScheduler } from '@/common-utils';

it('destroy inside overflow cleanup leaves no accepted pending work', async () => {
  const scheduler = MessageChannelScheduler.getInstance({
    maxPendingTasks: 1,
    onMaxTasksExceeded: () => { scheduler.destroy(); },
  });
  let executed = 0;
  scheduler.schedule(() => { executed++; });
  let accepted = -1;
  try { accepted = scheduler.schedule(() => { executed++; }); } catch {}
  await new Promise(resolve => setTimeout(resolve, 20));
  const result = { destroyed: scheduler.destroyed, pending: scheduler.getPendingCount(), accepted: accepted > 0, executed };
  scheduler.cancelAll();
  expect(result).toEqual({ destroyed: true, pending: 0, accepted: false, executed: 0 });
});
