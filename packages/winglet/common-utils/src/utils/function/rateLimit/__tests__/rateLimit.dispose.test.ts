import { describe, expect, it, vi } from 'vitest';

import { debounce } from '../debounce';
import { throttle } from '../throttle';

/**
 * 오래 사는 AbortSignal 을 공유하면 abort 가 실제로 일어나기 전까지 리스너가 남아
 * wrapper 를 붙들어 둔다. dispose 는 그 리스너까지 해제한다.
 */
describe('rateLimit dispose', () => {
  it('should remove the abort listener from a shared signal', () => {
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, 'removeEventListener');

    const debounced = debounce(() => {}, 10, { signal: controller.signal });
    const throttled = throttle(() => {}, 10, { signal: controller.signal });

    debounced.dispose();
    throttled.dispose();

    expect(removeListener).toHaveBeenCalledTimes(2);
  });

  it('should cancel a pending call as clear does', () => {
    vi.useFakeTimers();
    const spy = vi.fn();

    const debounced = debounce(spy, 10);
    debounced();
    debounced.dispose();
    vi.advanceTimersByTime(50);

    expect(spy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
