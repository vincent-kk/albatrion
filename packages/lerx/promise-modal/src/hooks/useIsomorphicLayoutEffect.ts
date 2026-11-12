import { useEffect, useLayoutEffect } from 'react';

/**
 * Uses the runtime's DOM availability to preserve browser layout timing without SSR warnings.
 * Accepts React effect callbacks and dependency lists; without a DOM React defers the
 * effect until client rendering, so module import and server rendering stay effect-free.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' && typeof document !== 'undefined'
    ? useLayoutEffect
    : useEffect;
