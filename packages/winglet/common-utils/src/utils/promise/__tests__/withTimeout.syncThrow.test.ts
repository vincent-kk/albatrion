import { describe, expect, it, vi } from 'vitest';

import { withTimeout } from '../withTimeout';

/**
 * 타입상으로는 async 함수만 받지만, 동기적으로 throw 하는 함수가 들어와도
 * 호출자의 오래 사는 signal 에 리스너를 남겨서는 안 된다.
 */
describe('withTimeout when the function throws synchronously', () => {
  it('should not attach an abort listener to the caller signal', () => {
    const controller = new AbortController();
    const addListener = vi.spyOn(controller.signal, 'addEventListener');

    expect(() =>
      withTimeout(
        (() => {
          throw new Error('sync failure');
        }) as never,
        1000,
        { signal: controller.signal },
      ),
    ).toThrow('sync failure');

    expect(addListener).not.toHaveBeenCalled();
  });
});
