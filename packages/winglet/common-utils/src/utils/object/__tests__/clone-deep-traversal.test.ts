import { expect, it } from 'vitest';

import { clone } from '../clone';

/** Wrap a value in ordinary containers to reach the iterative copying boundary. */
function wrap(value: any, count: number): any {
  for (let i = 0; i < count; i++) value = { next: value };
  return value;
}

/** Read the original payload through the same container count. */
function unwrap(value: any, count: number): any {
  for (let i = 0; i < count; i++) value = value.next;
  return value;
}

it('clone bounded aliases have the same contents at shallow and deep positions', () => {
  const shared = { child: { value: 1 } };
  const payload = { a: { nested: shared }, b: shared };
  const shallow = clone(payload, 3);
  const deep = unwrap(clone(wrap(payload, 256), 259), 256);
  expect(deep.a.nested.child === shared.child).toBe(
    shallow.a.nested.child === shared.child,
  );
  expect(deep.a.nested).toBe(deep.b);
});

it('clone preserves traversal-time getter observations at its deep boundary', () => {
  /** Create two branches whose enumerable getters share a counter. */
  const createPayload = () => {
    let value = 0;
    const branch = () => ({
      get value() {
        return ++value;
      },
    });
    return { first: branch(), second: branch() };
  };
  const shallow = clone(createPayload());
  const deep = unwrap(clone(wrap(createPayload(), 256)), 256);
  expect(deep).toEqual(shallow);
});

it('control: deep clone preserves cycles and stable comparison', () => {
  const payload: any = { value: 1 };
  payload.self = payload;
  const input = wrap(payload, 400);
  const output = clone(input);
  expect(unwrap(output, 400).self).toBe(unwrap(output, 400));
});
