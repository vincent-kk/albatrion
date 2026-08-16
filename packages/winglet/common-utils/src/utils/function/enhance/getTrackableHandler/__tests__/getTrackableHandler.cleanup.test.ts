import { describe, expect, it, vi } from 'vitest';

import { getTrackableHandler } from '../getTrackableHandler';
import type { TrackableHandlerOptions } from '../type';

/**
 * afterExecute 가 throw 해도 pending 해제와 구독자 통지가 보장되는지 검증한다.
 * `getTrackableHandler` JSDoc 의 "afterExecute Errors: Propagated after cleanup,
 * but pending state is always reset" 계약에 대한 인시던트 스위트.
 */
describe('getTrackableHandler cleanup guarantees', () => {
  const throwingAfterExecute = (): TrackableHandlerOptions<[], {}> => ({
    afterExecute: () => {
      throw new Error('afterExecute failed');
    },
  });

  it('afterExecute 가 throw 해도 오류를 전파하고 pending 을 해제해야 합니다', async () => {
    const handler = getTrackableHandler(
      async () => 'ok',
      throwingAfterExecute(),
    );

    await expect(handler()).rejects.toThrow('afterExecute failed');

    expect(handler.pending).toBe(false);
  });

  it('afterExecute 가 throw 한 뒤에도 핸들러를 다시 실행할 수 있어야 합니다', async () => {
    const origin = vi.fn().mockResolvedValue('ok');
    const handler = getTrackableHandler(origin, throwingAfterExecute());

    await handler().catch(() => {});
    await handler().catch(() => {});

    expect(origin).toHaveBeenCalledTimes(2);
  });

  it('afterExecute 가 throw 해도 구독자에게 완료가 통지되어야 합니다', async () => {
    const handler = getTrackableHandler(
      async () => 'ok',
      throwingAfterExecute(),
    );
    const listener = vi.fn();
    handler.subscribe(listener);

    await handler().catch(() => {});

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
