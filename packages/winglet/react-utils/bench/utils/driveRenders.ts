import { renderHook } from '@testing-library/react';

/**
 * Mounts a hook, drives it through a fixed input sequence, and unmounts it.
 *
 * `instances` calls the hook that many times per render. React's per-render machinery
 * costs far more than any hook body here, so a single call per render measures React
 * rather than the hook; repeating the call amortizes that fixed cost across many hook
 * instances and lets the body — and React's own per-hook bookkeeping, which is part of
 * what a `useMemo`-to-`useRef` change moves — show up in the number.
 *
 * @typeParam Input - The type of the value handed to the hook on each render
 * @param hook - The hook to drive; called with one sequence entry per render
 * @param sequence - The inputs to render in order; must hold at least one entry
 * @param instances - How many independent hook instances render per pass (defaults to `INSTANCES`)
 */
export const driveRenders = <Input>(
  hook: (input: Input) => unknown,
  sequence: readonly Input[],
  instances: number = INSTANCES,
): void => {
  const { rerender, unmount } = renderHook(
    ({ input }: { input: Input }) => {
      for (let index = 0; index < instances; index++) hook(input);
    },
    { initialProps: { input: sequence[0] } },
  );
  for (let index = 1, length = sequence.length; index < length; index++)
    rerender({ input: sequence[index] });
  unmount();
};

/** Hook instances per render — high enough that the hook body outweighs React's fixed render cost. */
export const INSTANCES = 100;

/** Renders per benchmark iteration, kept low because each one drives `INSTANCES` hook calls. */
export const RENDERS = 20;
