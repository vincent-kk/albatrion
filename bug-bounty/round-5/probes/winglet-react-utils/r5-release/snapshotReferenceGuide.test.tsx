import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useSnapshot, useSnapshotReference } from '@winglet/react-utils/hook';

/**
 * r5-release, angle CA2 against the round 4 breaking change
 * `.changeset/committed-snapshot-references.md` (major): useSnapshotReference publishes at
 * commit, so `current` read during an update render is the previous committed snapshot.
 * The packaged guide still teaches the two hooks as the same value
 * (docs/agents/skills/react-utils-skill/knowledge/hooks.md:48).
 * Imports the package by name, which resolves to the `dist` built at the base commit.
 */
const packageDir = resolve(__dirname, '../../..');

const Title = ({ data }: { data: { title: string } }) => {
  const snapshot = useSnapshot(data);
  const reference = useSnapshotReference(data);
  return (
    <span>
      {snapshot.title}|{reference.current.title}
    </span>
  );
};

afterEach(cleanup);

describe('r5-release packaged guide for useSnapshotReference', () => {
  it('the guide still states that useSnapshotReference is useSnapshot before the .current read', () => {
    const guide = readFileSync(
      join(packageDir, 'docs/agents/skills/react-utils-skill/knowledge/hooks.md'),
      'utf8',
    );
    expect(guide).toContain('`useSnapshotReference` is `useSnapshot` before the `.current` read');
  });

  it('as the guide states, .current of useSnapshotReference equals useSnapshot in the same render', () => {
    const view = render(<Title data={{ title: 'first' }} />);
    expect(screen.getByText(/\|/).textContent).toBe('first|first');
    view.rerender(<Title data={{ title: 'second' }} />);
    const [snapshot, reference] = screen.getByText(/\|/).textContent!.split('|');
    expect({ snapshot, reference }).toEqual({ snapshot, reference: snapshot });
  });
});
