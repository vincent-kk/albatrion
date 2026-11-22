import { describe, expect, it } from 'vitest';

import { MessageChannelScheduler } from '../index';
import { clearImmediate, destroyGlobalScheduler, setImmediate } from '../index';

const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

describe('a task id from a destroyed scheduler cannot cancel a later task', () => {
  it('clearImmediate with an id issued before destroyGlobalScheduler leaves the new task alone', async () => {
    const ran: string[] = [];
    const staleId = setImmediate(() => ran.push('old'));
    destroyGlobalScheduler();
    setImmediate(() => ran.push('new'));
    const cancelled = clearImmediate(staleId);
    await settle();
    destroyGlobalScheduler();
    expect({ cancelled, ran }).toEqual({ cancelled: false, ran: ['new'] });
  });

  it('cancel on a new instance with an id from a destroyed instance returns false', async () => {
    const ran: string[] = [];
    const first = MessageChannelScheduler.getInstance();
    const staleId = first.schedule(() => ran.push('old'));
    first.destroy();
    const second = MessageChannelScheduler.getInstance();
    second.schedule(() => ran.push('new'));
    const cancelled = second.cancel(staleId);
    await settle();
    second.destroy();
    expect({ cancelled, ran }).toEqual({ cancelled: false, ran: ['new'] });
  });

  it('control: an id cancels its own task', async () => {
    const ran: string[] = [];
    const id = setImmediate(() => ran.push('own'));
    const cancelled = clearImmediate(id);
    await settle();
    destroyGlobalScheduler();
    expect({ cancelled, ran }).toEqual({ cancelled: true, ran: [] });
  });
});
