import { forwardRef, memo } from 'react';

import { bench, describe } from 'vitest';

import { isReactComponent, remainOnlyReactComponent } from '@/react-utils';

/**
 * Component resolution runs once per field while a schema-form plugin map is read, so
 * its cost scales with the number of fields rather than being amortised.
 */

const Plain = () => null;
const Memoized = memo(Plain);
const Forwarded = forwardRef<HTMLDivElement>(() => null);

const registry = {
  a: Plain,
  b: Memoized,
  c: Forwarded,
  d: 'not a component',
  e: 42,
  f: Plain,
  g: Memoized,
  h: Forwarded,
};

describe('isReactComponent — by input kind', () => {
  bench('function component (first branch)', () => {
    isReactComponent(Plain);
  });
  bench('memo component (second branch)', () => {
    isReactComponent(Memoized);
  });
  bench('forwardRef component (third branch)', () => {
    isReactComponent(Forwarded);
  });
  bench('plain value (falls through every branch)', () => {
    isReactComponent('not a component');
  });
});

describe('remainOnlyReactComponent — 8 entry registry', () => {
  bench('filter a mixed registry', () => {
    remainOnlyReactComponent(registry);
  });
});
