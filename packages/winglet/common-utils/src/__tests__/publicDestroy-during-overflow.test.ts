import { expect, it, vi } from 'vitest';

import { MessageChannelScheduler } from '../index';

it('rejects work when the overflow callback destroys the scheduler', () => {
  const scheduler = MessageChannelScheduler.getInstance({
    maxPendingTasks: 1,
    onMaxTasksExceeded: () => scheduler.destroy(),
  });
  try {
    const callback = vi.fn();
    scheduler.schedule(callback);
    expect(scheduler.schedule(callback)).toBe(-1);
    expect(scheduler.destroyed).toBe(true);
    expect(scheduler.getPendingCount()).toBe(0);
    expect(callback).not.toHaveBeenCalled();
  } finally {
    scheduler.cancelAll();
    scheduler.destroy();
  }
});
