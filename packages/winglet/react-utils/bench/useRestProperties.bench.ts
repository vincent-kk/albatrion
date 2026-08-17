import { bench, describe } from 'vitest';

import { useRestProperties } from '@/react-utils';

import { RENDERS, driveRenders } from './utils/driveRenders';

/**
 * Per-render cost of the shallow-equality reference gate.
 *
 * The scenarios separate the three paths that behave differently: an unchanged
 * reference (no comparison at all), a fresh reference carrying identical contents
 * (full key walk, previous reference retained), and a genuine change (full key walk,
 * new reference adopted). Width is varied because only the walking paths scale with it.
 */

type Props = Record<string, unknown>;

/** Builds an object with `width` keys, offsetting one value so contents can be made to differ. */
const makeProps = (width: number, offset: number): Props => {
  const props: Props = {};
  for (let index = 0; index < width; index++)
    props[`key${index}`] = index === 0 ? offset : index;
  return props;
};

const stableReference = (width: number): Props[] => {
  const single = makeProps(width, 0);
  return Array.from({ length: RENDERS }, () => single);
};

const equalClones = (width: number): Props[] =>
  Array.from({ length: RENDERS }, () => makeProps(width, 0));

const changingValues = (width: number): Props[] =>
  Array.from({ length: RENDERS }, (_, index) => makeProps(width, index));

const changingShape = (width: number): Props[] =>
  Array.from({ length: RENDERS }, (_, index) =>
    makeProps(width + (index % 2), 0),
  );

describe('useRestProperties — narrow object (5 keys)', () => {
  const stable = stableReference(5);
  const clones = equalClones(5);
  const changing = changingValues(5);
  const reshaping = changingShape(5);

  bench('unchanged reference', () => {
    driveRenders(useRestProperties, stable);
  });
  bench('content-equal clones', () => {
    driveRenders(useRestProperties, clones);
  });
  bench('changing values', () => {
    driveRenders(useRestProperties, changing);
  });
  bench('changing key count', () => {
    driveRenders(useRestProperties, reshaping);
  });
});

describe('useRestProperties — wide object (30 keys)', () => {
  const stable = stableReference(30);
  const clones = equalClones(30);
  const changing = changingValues(30);

  bench('unchanged reference', () => {
    driveRenders(useRestProperties, stable);
  });
  bench('content-equal clones', () => {
    driveRenders(useRestProperties, clones);
  });
  bench('changing values', () => {
    driveRenders(useRestProperties, changing);
  });
});
