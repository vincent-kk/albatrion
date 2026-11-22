/**
 * Hunter r5-style-react-modal, angles RG1 and RG3: the packaged knowledge
 * docs/agents/skills/react-utils-skill/knowledge/hooks.md:48 says
 * "`useSnapshotReference` is `useSnapshot` before the `.current` read". After the
 * round 4 commit-time publication (.changeset/committed-snapshot-references.md),
 * the two differ during an update render. Imports the package source hooks.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSnapshot } from '../../hooks/useSnapshot';
import { useSnapshotReference } from '../../hooks/useSnapshotReference';

describe('useSnapshotReference against useSnapshot, as the packaged knowledge equates them', () => {
  it('K0 the packaged knowledge still states the equivalence', () => {
    const text = readFileSync(
      resolve(__dirname, '../../../docs/agents/skills/react-utils-skill/knowledge/hooks.md'),
      'utf8',
    );
    expect(text).toContain('`useSnapshotReference` is `useSnapshot` before the `.current` read');
  });

  it('K1 an update render reads the same value through both hooks', () => {
    const seen: Array<{ viaSnapshot: string; viaReference: string }> = [];
    function Card({ data }: { data: { title: string } }) {
      const snapshot = useSnapshot(data);
      const reference = useSnapshotReference(data);
      seen.push({ viaSnapshot: snapshot.title, viaReference: reference.current.title });
      return (
        <p>
          {snapshot.title}|{reference.current.title}
        </p>
      );
    }
    const view = render(<Card data={{ title: 'first' }} />);
    act(() => view.rerender(<Card data={{ title: 'second' }} />));
    expect({ text: view.container.textContent, last: seen[seen.length - 1] }).toEqual({
      text: 'second|second',
      last: { viaSnapshot: 'second', viaReference: 'second' },
    });
  });
});
