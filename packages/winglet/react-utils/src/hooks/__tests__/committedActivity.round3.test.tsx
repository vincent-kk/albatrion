import {
  Activity,
  StrictMode,
  Suspense,
  startTransition,
  useState,
} from 'react';

import { act, render } from '@testing-library/react';
import { expect, it } from 'vitest';

import { useHandle } from '../useHandle';
import { useOnUnmount } from '../useOnUnmount';
import { useOnUnmountLayout } from '../useOnUnmountLayout';

it('round-3 react-utils 2: hidden cleanup and handles read the same committed value as before a discarded render', async () => {
  for (const strict of [false, true]) {
    let setValue = (_value: string) => {};
    let handle = () => '';
    const seen: string[] = [];
    const pending = new Promise<void>(() => {});
    const Probe = () => {
      const [value, set] = useState('A');
      setValue = set;
      handle = useHandle(() => value);
      useOnUnmount(() => seen.push(value));
      useOnUnmountLayout(() => seen.push(value));
      if (value === 'B') throw pending;
      return <span>{value}</span>;
    };
    const app = (hidden: boolean) => {
      const content = (
        <Activity mode={hidden ? 'hidden' : 'visible'}>
          <Suspense fallback="loading">
            <Probe />
          </Suspense>
        </Activity>
      );
      return strict ? <StrictMode>{content}</StrictMode> : content;
    };
    const view = render(app(false));
    const committed = handle();
    seen.length = 0;
    await act(async () => {
      startTransition(() => setValue('B'));
    });
    await act(async () => view.rerender(app(true)));
    expect(handle()).toBe(committed);
    expect(seen.every((value) => value === committed)).toBe(true);
    view.unmount();
  }
});
