import { bench, describe } from 'vitest';

import { useHandle } from '@/react-utils/hooks/useHandle';
import { useOnUnmount } from '@/react-utils/hooks/useOnUnmount';
import { useOnUnmountLayout } from '@/react-utils/hooks/useOnUnmountLayout';
import { useTimeout } from '@/react-utils/hooks/useTimeout';

import { RENDERS, driveRenders } from './utils/driveRenders';

/**
 * Per-render floor of the hooks that keep a handler current through a ref.
 *
 * Each of these writes its argument into a ref on every render so the value read later
 * is the one from the most recent render. That write is the whole cost on the render
 * path — the effect itself never re-runs — so these scenarios measure whether keeping a
 * handler fresh is cheap enough to be the default.
 */

/** A fresh handler per render is the realistic case: an inline arrow is a new function every time. */
const freshHandlers = (): Array<() => void> =>
  Array.from({ length: RENDERS }, (_, index) => () => index);

describe('handler-freshness hooks — 20 renders x 100 instances, new handler each render', () => {
  const handlers = freshHandlers();

  bench('useHandle', () => {
    driveRenders(useHandle, handlers);
  });
  bench('useOnUnmount', () => {
    driveRenders(useOnUnmount, handlers);
  });
  bench('useOnUnmountLayout', () => {
    driveRenders(useOnUnmountLayout, handlers);
  });
  bench('useTimeout (never scheduled)', () => {
    driveRenders((handler: () => void) => useTimeout(handler, 50), handlers);
  });
});

describe('handler-freshness hooks — 20 renders x 100 instances, stable handler', () => {
  const handler = () => undefined;
  const handlers = Array.from({ length: RENDERS }, () => handler);

  bench('useHandle', () => {
    driveRenders(useHandle, handlers);
  });
  bench('useOnUnmount', () => {
    driveRenders(useOnUnmount, handlers);
  });
  bench('useTimeout (never scheduled)', () => {
    driveRenders((each: () => void) => useTimeout(each, 50), handlers);
  });
});
