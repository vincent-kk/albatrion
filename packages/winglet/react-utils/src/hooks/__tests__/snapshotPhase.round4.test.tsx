import {
  type RefObject,
  StrictMode,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import * as React from 'react';

import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSnapshot } from '../useSnapshot';
import { useSnapshotReference } from '../useSnapshotReference';
import { useCommitEffect } from '../utils/useCommitEffect';

describe('round-4 snapshot commit phase', () => {
  it('publishes in useInsertionEffect before layout, including a child reader', async () => {
    expect(useCommitEffect).toBe(React.useInsertionEffect);
    const seen: string[] = [];
    let setValue = (_value: { title: string }) => {};
    const Probe = () => {
      const [value, set] = useState({ title: 'old' });
      setValue = set;
      const snapshot = useSnapshot(value);
      const reference = useSnapshotReference(value);
      if (reference.current.title !== snapshot.title)
        seen.push(
          `render ref ${reference.current.title} return ${snapshot.title}`,
        );
      useLayoutEffect(() => {
        seen.push(`layout ${reference.current.title}`);
      });
      useEffect(() => {
        seen.push(`passive ${reference.current.title}`);
      });
      return <Child reference={reference} />;
    };
    const Child = ({
      reference,
    }: {
      reference: RefObject<{ title: string }>;
    }) => {
      useLayoutEffect(() => {
        seen.push(`child layout ${reference.current.title}`);
      });
      return null;
    };
    render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    );
    seen.length = 0;
    await act(async () => {
      setValue({ title: 'new' });
    });
    expect(seen).toContain('render ref old return new');
    expect(seen).toContain('layout new');
    expect(seen).toContain('child layout new');
    expect(seen).toContain('passive new');
    expect(
      seen.some(
        (entry) =>
          entry.startsWith('layout old') ||
          entry.startsWith('child layout old') ||
          entry.startsWith('passive old'),
      ),
    ).toBe(false);
  });
});
