import { bench, describe } from 'vitest';

import { useSnapshotReference } from '@/react-utils';

import { RENDERS, driveRenders } from './utils/driveRenders';

/**
 * Per-render cost of the deep-comparison snapshot gate.
 *
 * `omit` is measured separately because it is the argument whose handling changed:
 * an array must be converted to a `Set`, and how often that conversion happens is the
 * question. The array form and the pre-built `Set` form are both measured so the
 * conversion cost is visible rather than folded into the comparison.
 */

type Message = {
  id: number;
  author: { id: number; name: string };
  body: string;
  tags: string[];
  timestamp: number;
  sequenceNumber: number;
};

/** Builds a nested message; `revision` shifts the compared content, `volatile` only the omitted fields. */
const makeMessage = (revision: number, volatile: number): Message => ({
  id: revision,
  author: { id: 7, name: 'author' },
  body: `body-${revision}`,
  tags: ['alpha', 'beta', 'gamma'],
  timestamp: volatile,
  sequenceNumber: volatile,
});

const VOLATILE_KEYS: Array<keyof Message> = ['timestamp', 'sequenceNumber'];
const VOLATILE_KEY_SET = new Set(VOLATILE_KEYS);

const stableReference = (): Message[] => {
  const single = makeMessage(0, 0);
  return Array.from({ length: RENDERS }, () => single);
};

const equalClones = (): Message[] =>
  Array.from({ length: RENDERS }, () => makeMessage(0, 0));

const changingContent = (): Message[] =>
  Array.from({ length: RENDERS }, (_, index) => makeMessage(index, index));

/** Only the omitted fields move, so `omit` decides whether the snapshot is retained. */
const changingOmittedOnly = (): Message[] =>
  Array.from({ length: RENDERS }, (_, index) => makeMessage(0, index));

describe('useSnapshotReference — no omit', () => {
  const stable = stableReference();
  const clones = equalClones();
  const changing = changingContent();

  bench('unchanged reference', () => {
    driveRenders(useSnapshotReference, stable);
  });
  bench('content-equal clones', () => {
    driveRenders(useSnapshotReference, clones);
  });
  bench('changing content', () => {
    driveRenders(useSnapshotReference, changing);
  });
});

describe('useSnapshotReference — omit as array', () => {
  const clones = equalClones();
  const volatileOnly = changingOmittedOnly();

  bench('content-equal clones', () => {
    driveRenders(
      (input: Message) => useSnapshotReference(input, VOLATILE_KEYS),
      clones,
    );
  });
  bench('only omitted fields change', () => {
    driveRenders(
      (input: Message) => useSnapshotReference(input, VOLATILE_KEYS),
      volatileOnly,
    );
  });
});

describe('useSnapshotReference — omit as Set', () => {
  const clones = equalClones();

  bench('content-equal clones', () => {
    driveRenders(
      (input: Message) => useSnapshotReference(input, VOLATILE_KEY_SET),
      clones,
    );
  });
});
