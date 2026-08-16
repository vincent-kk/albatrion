import { useRef } from 'react';

import { isFunction } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

/**
 * Caches the first truthy value produced for a component instance, retrying while the result stays falsy.
 *
 * A function input is invoked during render and its result is stored; any other input is
 * stored as-is. The stored value is reused on later renders — but only while it is truthy.
 * Whenever the stored value is falsy (`null`, `undefined`, `0`, `''`, `false`, `NaN`) the
 * input is evaluated again on the next render. That retry is the hook's purpose: it suits a
 * value whose prerequisite is not ready yet and which should be captured once it appears.
 *
 * ### What This Hook Is Not
 * - **Not deferred until first access.** The factory runs during the render in which the
 *   hook is called, whether or not the returned value is ever read.
 * - **Not run exactly once.** A factory that keeps returning a falsy value runs on every
 *   render, indefinitely. Reach for `useLazyConstant` when the factory must run once.
 * - **Not a home for falsy results.** A legitimately falsy value can never be cached here.
 *
 * ### Choosing Between the Constant Hooks
 * | Hook                | Function input       | Invocations   | Caches a falsy result |
 * | ------------------- | -------------------- | ------------- | --------------------- |
 * | `useConstant`       | stored, never called | none          | yes                   |
 * | `useLazyConstant`   | called               | exactly once  | yes                   |
 * | `useTruthyConstant` | called               | until truthy  | no                    |
 *
 * @example
 * ```typescript
 * // A singleton created as soon as its prerequisite exists, then kept for good
 * const service = useTruthyConstant(() =>
 *   apiKey ? new AnalyticsService({ apiKey }) : null,
 * );
 * // Returns null and retries on each render until apiKey arrives; caches the instance after.
 * ```
 *
 * @example
 * ```typescript
 * // A direct value is stored on the first render that sees it truthy
 * const firstNonEmptyLabel = useTruthyConstant(label);
 * ```
 *
 * @typeParam Return - The return type when using a function input
 * @typeParam Type - The type of the value when using a direct value input
 * @param input - A value, or a function invoked during render to produce the value
 * @returns The cached truthy value, or the freshly evaluated result while it stays falsy
 *
 * @see useLazyConstant - Runs the factory exactly once, falsy results included
 * @see useConstant - Stores the first value as-is, without invoking functions
 */
export const useTruthyConstant: {
  <Return>(input: Fn<[], Return>): Return;
  <Type>(input: Type): Type;
} = <Return>(input: Fn<[], Return> | Return): Return => {
  const ref = useRef<Return>(undefined);
  if (!ref.current) ref.current = isFunction(input) ? input() : input;
  return ref.current;
};
