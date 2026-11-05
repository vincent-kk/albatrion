import { expect, it, vi } from 'vitest';

import { FocusRequest } from '../FocusRequest';

it('follows current load identity until cancellation', () => {
  let current = true;
  const request = new FocusRequest(() => current);
  expect(request.live).toBe(true);
  current = false;
  expect(request.live).toBe(false);
  current = true;
  request.cancel();
  expect(request.live).toBe(false);
});
it('cleans in registration order exactly once, including late registration', () => {
  const request = new FocusRequest(() => true);
  const order: number[] = [];
  request.onCancel(() => order.push(1));
  request.onCancel(() => order.push(2));
  request.cancel();
  request.cancel();
  const late = vi.fn(() => order.push(3));
  request.onCancel(late);
  expect(order).toEqual([1, 2, 3]);
  expect(late).toHaveBeenCalledTimes(1);
});
