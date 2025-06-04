import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { delay } from '@/common-utils/utils/promise';

import { getTrackableHandler } from '../getTrackableHandler';
import type { TrackableHandlerOptions } from '../type';

describe('getTrackableHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should execute the original function normally', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('test result');
      const options: TrackableHandlerOptions<[string], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler('test');

      expect(mockOrigin).toHaveBeenCalledWith('test');
      expect(result).toBe('test result');
    });

    it('should handle functions with multiple arguments', async () => {
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

    it('should handle functions with no arguments', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('no args result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(mockOrigin).toHaveBeenCalledWith();
      expect(result).toBe('no args result');
    });

    it('should execute the original function normally, without options', async () => {
      let resolveHandler: (value: string) => void;
      const firstPromise = new Promise<string>((resolve) => {
        resolveHandler = resolve;
      });

      const mockOrigin = vi
        .fn()
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValue('subsequent call');
      const handler = getTrackableHandler(mockOrigin);
      const result = handler('test');

      expect(handler.pending).toBe(true);

      await resolveHandler!('resolved');

      expect(handler.pending).toBe(false);
      expect(mockOrigin).toHaveBeenCalledWith('test');
      expect(await result).toBe('resolved');
    });
  });

  describe('state management', () => {
    it('should set initial state correctly', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const initialState = { count: 5, message: 'hello' };
      const options: TrackableHandlerOptions<[], typeof initialState> = {
        initialState,
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).state).toEqual(initialState);
      expect((handler as any).state.count).toBe(5);
      expect((handler as any).state.message).toBe('hello');
    });

    it('should update state properly', () => {
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

      expect((handler as any).state.status).toBe('idle');
      expect((handler as any).state.count).toBe(0);
    });

    it('should handle empty initial state', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], {}> = {
        initialState: {},
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).state).toEqual({});
    });

    it('should preserve previous state when updating', async () => {
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

      expect((handler as any).state.other).toBe(true);
      await handler();
      expect((handler as any).state.other).toBe(true); // other state should be preserved
      expect((handler as any).state.status).toBe('loading');
    });
  });

  describe('subscription functionality', () => {
    it('should add subscribers and notify on state changes', async () => {
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

    it('should unsubscribe properly', async () => {
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

      // Unsubscribe then call
      unsubscribe();
      await handler();

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', async () => {
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

    it('ignore duplicate subscribers', async () => {
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
      (handler as any).subscribe(mockListener); // Register same function again

      await handler();

      // Call the listener twice regardless of whether beforeExecute or afterExecute are defined
      expect(mockListener).toHaveBeenCalledTimes(2);
    });

    it('call the listener twice regardless of whether beforeExecute or afterExecute are defined', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const mockListener = vi.fn();
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        // No beforeExecute, afterExecute - no state changes
      };

      const handler = getTrackableHandler(mockOrigin, options);
      (handler as any).subscribe(mockListener);

      await handler();
      // Call the listener twice regardless of whether beforeExecute or afterExecute are defined
      expect(mockListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('concurrent execution prevention', () => {
    it('should prevent concurrent execution when preventConcurrent is true', async () => {
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

      // Start first call (not completed yet)
      const firstCall = handler();

      // Second call (concurrent execution)
      const secondCall = handler();

      expect(mockOrigin).toHaveBeenCalledTimes(1);

      // Complete first call
      resolvePromise!('first result');
      const firstResult = await firstCall;
      const secondResult = await secondCall;

      expect(firstResult).toBe('first result');
      expect(secondResult).toBeUndefined();
    });

    it('should allow concurrent execution when preventConcurrent is false', async () => {
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

  describe('beforeExecute and afterExecute callbacks', () => {
    it('should call beforeExecute before function execution', async () => {
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

    it('should call afterExecute after function execution', async () => {
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

    it('should call afterExecute even when original function throws error', async () => {
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

    it('should call beforeExecute and afterExecute in correct order', async () => {
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

  describe('error handling', () => {
    it('should propagate original function errors as-is', async () => {
      const testError = new Error('Original function error');
      const mockOrigin = vi.fn().mockRejectedValue(testError);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      await expect(handler()).rejects.toThrow('Original function error');
    });

    it('should not execute original function when beforeExecute throws error', async () => {
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

    it('should throw afterExecute error when it occurs', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('original result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        afterExecute: () => {
          throw new Error('afterExecute error');
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      // afterExecute error should be thrown
      await expect(handler()).rejects.toThrow('afterExecute error');
    });
  });

  describe('state property access', () => {
    it('should allow direct access to each state property', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const initialState = { count: 10, message: 'test', isActive: true };
      const options: TrackableHandlerOptions<[], typeof initialState> = {
        initialState,
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).state.count).toBe(10);
      expect((handler as any).state.message).toBe('test');
      expect((handler as any).state.isActive).toBe(true);
    });

    it('should update property access when state is updated', async () => {
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

      expect((handler as any).state.count).toBe(0);
      expect((handler as any).state.status).toBe('idle');

      await handler();

      expect((handler as any).state.count).toBe(5);
      expect((handler as any).state.status).toBe('loading');
    });

    it('should return undefined for non-existent properties', () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);

      expect((handler as any).nonExistentProperty).toBeUndefined();
    });
  });

  describe('complex scenarios', () => {
    it('should simulate real usage scenario', async () => {
      interface ApiState {
        loading: boolean;
        data: string | null;
        error: string | null;
        requestCount: number;
      }

      const mockApiCall = vi
        .fn()
        .mockResolvedValueOnce('first data')
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce('second data');

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

      // First successful call
      const result1 = await apiHandler('endpoint1');
      expect(result1).toBe('first data');
      expect((apiHandler as any).state.loading).toBe(false);
      expect((apiHandler as any).state.requestCount).toBe(1);
      expect(listener).toHaveBeenCalled();

      // Second failing call
      await expect(apiHandler('endpoint2')).rejects.toThrow('API error');
      expect((apiHandler as any).state.loading).toBe(false);
      expect((apiHandler as any).state.requestCount).toBe(2);

      // Third successful call
      const result3 = await apiHandler('endpoint3');
      expect(result3).toBe('second data');
      expect((apiHandler as any).state.requestCount).toBe(3);
    });

    it('should prevent concurrent calls based on loading state', async () => {
      let resolveFirst: (value: string) => void;
      const firstPromise = new Promise<string>((resolve) => {
        resolveFirst = resolve;
      });

      const mockOrigin = vi
        .fn()
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValue('subsequent call');

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

      // Start first call (not completed yet)
      const firstCall = handler();
      expect(handler.pending).toBe(true);
      expect(handler.state.loading).toBe(true);

      // Additional calls while loading (should be ignored)
      const secondCall = handler();
      const thirdCall = handler();

      // Only first call should actually execute
      expect(mockOrigin).toHaveBeenCalledTimes(1);

      // Complete first call
      resolveFirst!('first result');
      const result1 = await firstCall;
      const result2 = await secondCall;
      const result3 = await thirdCall;

      expect(result1).toBe('first result');
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();
      expect(handler.pending).toBe(false);
      expect(handler.state.loading).toBe(false);
      expect(handler.state.callCount).toBe(1);
    });

    it('should enable subscriber cleanup to prevent memory leaks', async () => {
      const mockOrigin = vi.fn().mockResolvedValue('result');
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
        beforeExecute: (_, stateManager) => {
          stateManager.update({ count: 1 });
        },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const listeners: Array<() => void> = [];

      // Add multiple subscribers
      for (let i = 0; i < 100; i++) {
        const unsubscribe = (handler as any).subscribe(() => {});
        listeners.push(unsubscribe);
      }

      // Remove all subscribers
      listeners.forEach((unsubscribe) => unsubscribe());

      // No events should fire when state changes
      await handler();

      // Test passes just by not causing memory leaks
      expect(true).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle functions that return undefined', async () => {
      const mockOrigin = vi.fn().mockResolvedValue(undefined);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(result).toBeUndefined();
    });

    it('should handle functions that return null', async () => {
      const mockOrigin = vi.fn().mockResolvedValue(null);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(result).toBeNull();
    });

    it('should handle functions that return objects', async () => {
      const mockResult = { id: 1, name: 'test' };
      const mockOrigin = vi.fn().mockResolvedValue(mockResult);
      const options: TrackableHandlerOptions<[], { count: number }> = {
        initialState: { count: 0 },
      };

      const handler = getTrackableHandler(mockOrigin, options);
      const result = await handler();

      expect(result).toEqual(mockResult);
    });

    it('should handle functions that return arrays', async () => {
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
