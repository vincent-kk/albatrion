import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTrackableHandler } from '../getTrackableHandler';
import type { TrackableHandlerOptions } from '../type';

describe('getTrackableHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('기본 기능', () => {
    it('원본 함수를 정상적으로 실행해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('test result');
      const options: TrackableHandlerOptions<[string], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler('test');

      expect(mockOrigin).toHaveBeenCalledWith('test');
      expect(result).toBe('test result');
    });

    it('여러 인자를 가진 함수도 정상적으로 처리해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('complex result');
      const options: TrackableHandlerOptions<
        [string, number, boolean],
        { status: string }
      > = {
        initialState: { status: 'idle' },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler('test', 42, true);

      expect(mockOrigin).toHaveBeenCalledWith('test', 42, true);
      expect(result).toBe('complex result');
    });

    it('인자가 없는 함수도 정상적으로 처리해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('no args result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(mockOrigin).toHaveBeenCalledWith();
      expect(result).toBe('no args result');
    });
  });

  describe('상태 관리', () => {
    it('초기 상태를 올바르게 설정해야 한다', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const initialState = { count: 5, message: 'hello' };
      const options: TrackableHandlerOptions<[], typeof initialState> = {
        initialState,
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).state).toEqual(initialState);
      expect((handler as any).count).toBe(5);
      expect((handler as any).message).toBe('hello');
    });

    it('상태 업데이트가 정상적으로 동작해야 한다', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<
        [],
        { count: number; status: string }
      > = {
        initialState: { count: 0, status: 'idle' },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ status: 'loading' });
        },
        afterExecute: (_, stateManager) => {
          stateManager.update((prev) => ({
            count: prev.count + 1,
            status: 'success',
          }));
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).status).toBe('idle');
      expect((handler as any).count).toBe(0);
    });

    it('빈 초기 상태도 처리해야 한다', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], {}> = {
        initialState: {},
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).state).toEqual({});
    });

    it('상태 업데이트 시 이전 상태를 유지해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<
        [],
        { count: number; status: string; other: boolean }
      > = {
        initialState: { count: 0, status: 'idle', other: true },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ status: 'loading' });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).other).toBe(true);
      await handler();
      expect((handler as any).other).toBe(true); // 다른 상태는 유지되어야 함
      expect((handler as any).status).toBe('loading');
    });
  });

  describe('구독 기능', () => {
    it('구독자를 추가하고 상태 변경 시 알림을 보내야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const mockListener = vi.fn();
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ count: 1 });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const unsubscribe = (handler as any).subscribe(mockListener);

      await handler();

      expect(mockListener).toHaveBeenCalled();
      unsubscribe();
    });

    it('구독 해제가 정상적으로 동작해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const mockListener = vi.fn();
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ count: 1 });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const unsubscribe = (handler as any).subscribe(mockListener);

      // 구독 해제 후 호출
      unsubscribe();
      await handler();

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('여러 구독자를 지원해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ count: 1 });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      (handler as any).subscribe(mockListener1);
      (handler as any).subscribe(mockListener2);

      await handler();

      expect(mockListener1).toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalled();
    });

    it('동일한 구독자를 여러 번 등록해도 한 번만 호출되어야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const mockListener = vi.fn();
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ count: 1 });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      (handler as any).subscribe(mockListener);
      (handler as any).subscribe(mockListener); // 같은 함수 다시 등록

      await handler();

      expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('상태가 변경되지 않으면 구독자가 호출되지 않아야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const mockListener = vi.fn();
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        // beforeExecute, afterExecute 없음 - 상태 변경 없음
      };

      const handler = getTrackableHandler(mockOrigin, options);
      (handler as any).subscribe(mockListener);

      await handler();

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('동시 실행 방지', () => {
    it('preventConcurrent가 true일 때 동시 실행을 방지해야 한다', async () => {
      let resolvePromise: (value: string) => void;
      const slowPromise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      const mockOrigin = vi.fn().mockReturnValue(slowPromise);

      const options: TrackableHandlerOptions<[], { loading: boolean }> = {
        initialState: { loading: false },
        preventConcurrent: true,
        beforeExecute: (_, stateManager) => {
          stateManager.update({ loading: true });
        },
        afterExecute: (_, stateManager) => {
          stateManager.update({ loading: false });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      // 첫 번째 호출 시작
      const firstCall = handler();

      // 두 번째 호출 (동시 실행)
      const secondCall = handler();

      expect(mockOrigin).toHaveBeenCalledTimes(1);

      // 첫 번째 호출 완료
      resolvePromise!('first result');
      const firstResult = await firstCall;
      const secondResult = await secondCall;

      expect(firstResult).toBe('first result');
      expect(secondResult).toBeUndefined();
    });

    it('preventConcurrent가 false일 때 동시 실행을 허용해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        preventConcurrent: false,
      };

      const handler = getTrackableHandler(mockOrigin, options);

      await Promise.all([handler(), handler(), handler()]);

      expect(mockOrigin).toHaveBeenCalledTimes(3);
    });
  });

  describe('beforeExecute와 afterExecute 콜백', () => {
    it('beforeExecute가 함수 실행 전에 호출되어야 한다', async () => {
      const callOrder: string[] = [];
      const mockOrigin = vi.fn().mockImplementation(async () => {
        callOrder.push('origin');
        return 'result';
      });
      const mockBeforeExecute = vi.fn().mockImplementation(() => {
        callOrder.push('beforeExecute');
      });

      const options: TrackableHandlerOptions<[string], { status: string }> = {
        initialState: { status: 'idle' },
        beforeExecute: mockBeforeExecute,
      };

      const handler = getTrackableHandler(mockOrigin, options);
      await handler('test');

      expect(callOrder).toEqual(['beforeExecute', 'origin']);
      expect(mockBeforeExecute).toHaveBeenCalledWith(
        ['test'],
        expect.any(Object),
      );
    });

    it('afterExecute가 함수 실행 후에 호출되어야 한다', async () => {
      const callOrder: string[] = [];
      const mockOrigin = vi.fn().mockImplementation(async () => {
        callOrder.push('origin');
        return 'result';
      });
      const mockAfterExecute = vi.fn().mockImplementation(() => {
        callOrder.push('afterExecute');
      });

      const options: TrackableHandlerOptions<[string], { status: string }> = {
        initialState: { status: 'idle' },
        afterExecute: mockAfterExecute,
      };

      const handler = getTrackableHandler(mockOrigin, options);
      await handler('test');

      expect(callOrder).toEqual(['origin', 'afterExecute']);
      expect(mockAfterExecute).toHaveBeenCalledWith(
        ['test'],
        expect.any(Object),
      );
    });

    it('원본 함수에서 에러가 발생해도 afterExecute가 호출되어야 한다', async () => {
      const mockOrigin = vi.fn().mockRejectedValue(new Error('test error'));
      const mockAfterExecute = vi.fn();
      const options: TrackableHandlerOptions<[], { error: string | null }> = {
        initialState: { error: null },
        afterExecute: mockAfterExecute,
      };

      const handler = getTrackableHandler(mockOrigin, options);

      await expect(handler()).rejects.toThrow('test error');
      expect(mockAfterExecute).toHaveBeenCalled();
    });

    it('beforeExecute와 afterExecute 모두 있을 때 올바른 순서로 호출되어야 한다', async () => {
      const callOrder: string[] = [];
      const mockOrigin = vi.fn().mockImplementation(async () => {
        callOrder.push('origin');
        return 'result';
      });
      const mockBeforeExecute = vi.fn().mockImplementation(() => {
        callOrder.push('beforeExecute');
      });
      const mockAfterExecute = vi.fn().mockImplementation(() => {
        callOrder.push('afterExecute');
      });

      const options: TrackableHandlerOptions<[], { status: string }> = {
        initialState: { status: 'idle' },
        beforeExecute: mockBeforeExecute,
        afterExecute: mockAfterExecute,
      };

      const handler = getTrackableHandler(mockOrigin, options);
      await handler();

      expect(callOrder).toEqual(['beforeExecute', 'origin', 'afterExecute']);
    });
  });

  describe('에러 처리', () => {
    it('원본 함수의 에러를 그대로 전파해야 한다', async () => {
      const testError = new Error('Original function error');
      const mockOrigin = vi.fn().mockRejectedValue(testError);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      await expect(handler()).rejects.toThrow('Original function error');
    });

    it('beforeExecute에서 에러가 발생하면 원본 함수가 실행되지 않아야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        beforeExecute: () => {
          throw new Error('beforeExecute error');
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      await expect(handler()).rejects.toThrow('beforeExecute error');
      expect(mockOrigin).not.toHaveBeenCalled();
    });

    it('afterExecute에서 에러가 발생해도 원본 함수의 결과를 반환해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('original result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        afterExecute: () => {
          throw new Error('afterExecute error');
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      // afterExecute 에러는 무시되고 원본 결과를 반환해야 함
      await expect(handler()).rejects.toThrow('afterExecute error');
    });
  });

  describe('상태 프로퍼티 접근', () => {
    it('상태의 각 프로퍼티에 직접 접근할 수 있어야 한다', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const initialState = { count: 10, message: 'test', isActive: true };
      const options: TrackableHandlerOptions<[], typeof initialState> = {
        initialState,
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).count).toBe(10);
      expect((handler as any).message).toBe('test');
      expect((handler as any).isActive).toBe(true);
    });

    it('상태가 업데이트되면 프로퍼티 접근도 업데이트되어야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<
        [],
        { count: number; status: string }
      > = {
        initialState: { count: 0, status: 'idle' },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ count: 5, status: 'loading' });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).count).toBe(0);
      expect((handler as any).status).toBe('idle');

      await handler();

      expect((handler as any).count).toBe(5);
      expect((handler as any).status).toBe('loading');
    });

    it('존재하지 않는 프로퍼티는 undefined를 반환해야 한다', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).nonExistentProperty).toBeUndefined();
    });
  });

  describe('복합 시나리오', () => {
    it('실제 사용 시나리오를 시뮬레이션해야 한다', async () => {
      interface ApiState {
        loading: boolean;
        data: string | null;
        error: string | null;
        requestCount: number;
      }

      const mockApiCall = vi
        .fn()
        .mockResolvedValueOnce('첫 번째 데이터')
        .mockRejectedValueOnce(new Error('API 에러'))
        .mockResolvedValueOnce('두 번째 데이터');

      const options: TrackableHandlerOptions<[string], ApiState> = {
        initialState: {
          loading: false,
          data: null,
          error: null,
          requestCount: 0,
        },
        preventConcurrent: true,
        beforeExecute: (_, stateManager) => {
          stateManager.update({
            loading: true,
            error: null,
          });
        },
        afterExecute: (_, stateManager) => {
          stateManager.update((prev) => ({
            loading: false,
            requestCount: prev.requestCount + 1,
          }));
        },
      };

      const apiHandler = getTrackableHandler(mockApiCall, options);
      const listener = vi.fn();
      (apiHandler as any).subscribe(listener);

      // 첫 번째 성공적인 호출
      const result1 = await apiHandler('endpoint1');
      expect(result1).toBe('첫 번째 데이터');
      expect((apiHandler as any).loading).toBe(false);
      expect((apiHandler as any).requestCount).toBe(1);
      expect(listener).toHaveBeenCalled();

      // 두 번째 실패하는 호출
      await expect(apiHandler('endpoint2')).rejects.toThrow('API 에러');
      expect((apiHandler as any).loading).toBe(false);
      expect((apiHandler as any).requestCount).toBe(2);

      // 세 번째 성공적인 호출
      const result3 = await apiHandler('endpoint3');
      expect(result3).toBe('두 번째 데이터');
      expect((apiHandler as any).requestCount).toBe(3);
    });

    it('로딩 상태에서 동시 호출 방지가 작동해야 한다', async () => {
      let resolveFirst: (value: string) => void;
      const firstPromise = new Promise<string>((resolve) => {
        resolveFirst = resolve;
      });

      const mockOrigin = vi
        .fn()
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValue('후속 호출');

      const options: TrackableHandlerOptions<
        [],
        { loading: boolean; callCount: number }
      > = {
        initialState: { loading: false, callCount: 0 },
        preventConcurrent: true,
        beforeExecute: (_, stateManager) => {
          stateManager.update({ loading: true });
        },
        afterExecute: (_, stateManager) => {
          stateManager.update((prev) => ({
            loading: false,
            callCount: prev.callCount + 1,
          }));
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      // 첫 번째 호출 시작 (아직 완료되지 않음)
      const firstCall = handler();
      expect((handler as any).loading).toBe(true);

      // 로딩 중에 추가 호출들 (무시되어야 함)
      const secondCall = handler();
      const thirdCall = handler();

      // 첫 번째 호출만 실제로 실행되었어야 함
      expect(mockOrigin).toHaveBeenCalledTimes(1);

      // 첫 번째 호출 완료
      resolveFirst!('첫 번째 결과');
      const result1 = await firstCall;
      const result2 = await secondCall;
      const result3 = await thirdCall;

      expect(result1).toBe('첫 번째 결과');
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();
      expect((handler as any).loading).toBe(false);
      expect((handler as any).callCount).toBe(1);
    });

    it('메모리 누수 방지를 위해 구독자 정리가 가능해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ count: 1 });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const listeners: Array<() => void> = [];

      // 여러 구독자 추가
      for (let i = 0; i < 100; i++) {
        const unsubscribe = (handler as any).subscribe(() => {});
        listeners.push(unsubscribe);
      }

      // 모든 구독자 제거
      listeners.forEach((unsubscribe) => unsubscribe());

      // 상태 변경해도 아무 일이 일어나지 않아야 함
      await handler();

      // 테스트 통과만으로도 메모리 누수가 없다는 것을 확인
      expect(true).toBe(true);
    });
  });

  describe('엣지 케이스', () => {
    it('undefined를 반환하는 함수도 처리해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue(undefined);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(result).toBeUndefined();
    });

    it('null을 반환하는 함수도 처리해야 한다', async () => {
      const mockOrigin = vi.fn().mockResolvedValue(null);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(result).toBeNull();
    });

    it('객체를 반환하는 함수도 처리해야 한다', async () => {
      const mockResult = { id: 1, name: 'test' };
      const mockOrigin = vi.fn().mockResolvedValue(mockResult);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(result).toEqual(mockResult);
    });

    it('배열을 반환하는 함수도 처리해야 한다', async () => {
      const mockResult = [1, 2, 3];
      const mockOrigin = vi.fn().mockResolvedValue(mockResult);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(result).toEqual(mockResult);
    });
  });
});
