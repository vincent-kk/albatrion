import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MessageChannelScheduler } from '../MessageChannelScheduler';
import { destroyGlobalScheduler } from '../handler';

/**
 * flush/idle 상태 기계가 스케줄러를 영구 정지시키지 않는지 검증한다.
 * 본 스위트는 두 정지 인시던트로 한정한다 — 일반 동작은 MessageChannelScheduler.test.ts 담당.
 */
describe('MessageChannelScheduler flush lifecycle', () => {
  let scheduler: MessageChannelScheduler;

  /** MessageChannel 메시지가 배달될 만큼의 매크로태스크 경계를 넘긴다. */
  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

  beforeEach(() => {
    (MessageChannelScheduler as any).__instance__ = null;
    destroyGlobalScheduler();
  });

  afterEach(() => {
    if (scheduler && !scheduler.destroyed) scheduler.destroy();
    destroyGlobalScheduler();
  });

  it('마지막 대기 태스크를 취소해도 이후 스케줄이 실행되어야 합니다', async () => {
    scheduler = MessageChannelScheduler.getInstance();
    const executed: string[] = [];

    const taskId = scheduler.schedule(() => executed.push('cancelled'));
    scheduler.cancel(taskId);
    await settle();

    scheduler.schedule(() => executed.push('after'));
    await settle();

    expect(executed).toEqual(['after']);
    expect(scheduler.getPendingCount()).toBe(0);
  });

  it('flush 이후 마이크로태스크에서 등록된 태스크도 실행되어야 합니다', async () => {
    scheduler = MessageChannelScheduler.getInstance();
    const executed: string[] = [];

    scheduler.schedule(() => executed.push('first'));
    await Promise.resolve();
    scheduler.schedule(() => executed.push('second'));
    await settle();

    expect(executed).toEqual(['first', 'second']);
    expect(scheduler.getPendingCount()).toBe(0);
  });

  it('실행 중인 태스크가 등록한 태스크도 이어서 실행되어야 합니다', async () => {
    scheduler = MessageChannelScheduler.getInstance();
    const executed: string[] = [];

    scheduler.schedule(() => {
      executed.push('outer');
      scheduler.schedule(() => executed.push('inner'));
    });
    await settle();

    expect(executed).toEqual(['outer', 'inner']);
    expect(scheduler.getPendingCount()).toBe(0);
  });
});
