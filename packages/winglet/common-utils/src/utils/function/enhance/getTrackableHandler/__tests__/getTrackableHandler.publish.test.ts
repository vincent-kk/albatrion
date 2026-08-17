import { describe, expect, it, vi } from 'vitest';

import { getTrackableHandler } from '../getTrackableHandler';

/**
 * stateManager.update 는 구독자에게 변경을 알려야 한다 — 문서의 재시도·서킷브레이커
 * 예제가 훅 실행 창 밖에서 상태를 갱신하는 패턴이다.
 */
describe('getTrackableHandler state notification', () => {
  it('should notify subscribers when the state is updated outside a hook window', async () => {
    let capturedUpdate:
      | ((next: Record<string, unknown>) => void)
      | undefined;
    const handler = getTrackableHandler(async () => 'ok', {
      initialState: { attempt: 0 },
      beforeExecute: (_, stateManager) => {
        capturedUpdate = stateManager.update as typeof capturedUpdate;
      },
    });
    await handler();

    const listener = vi.fn();
    handler.subscribe(listener);
    capturedUpdate?.({ attempt: 42 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(handler.state).toEqual({ attempt: 42 });
  });
});

describe('getTrackableHandler notification when a hook throws', () => {
  it('should notify subscribers of a state change made before beforeExecute threw', async () => {
    const handler = getTrackableHandler(async () => 'ok', {
      initialState: { attempt: 0 },
      beforeExecute: (_, stateManager) => {
        stateManager.update({ attempt: 1 });
        throw new Error('circuit open');
      },
    });
    const listener = vi.fn();
    handler.subscribe(listener);

    await expect(handler()).rejects.toThrow('circuit open');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(handler.state).toEqual({ attempt: 1 });
  });
});
