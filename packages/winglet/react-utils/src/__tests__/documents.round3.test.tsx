import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { useDebounce } from '../index';

it('round-3 react-utils 6: packaged guidance matches the manifest peer range', () => {
  const manifest = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'));
  const skill = readFileSync(resolve(__dirname, '../../docs/agents/skills/react-utils-skill/SKILL.md'), 'utf8');
  expect(/Peer dependencies: React and React DOM `([^`]+)`/.exec(skill)?.[1]).toBe(manifest.peerDependencies.react);
});

it('round-3 react-utils 4: documented default debounce edges match an ordinary burst', () => {
  vi.useFakeTimers();
  try {
    const text = readFileSync(resolve(__dirname, '../../docs/agents/skills/react-utils-skill/knowledge/hooks.md'), 'utf8');
    const paragraph = text.split('**`useDebounce(callback, deps, ms, options)`')[1]?.split('\n')[0];
    let query = 'a'; const callback = vi.fn();
    const view = renderHook(() => useDebounce(callback, [query], 300));
    query = 'ab'; view.rerender();
    act(() => vi.advanceTimersByTime(1000));
    expect(callback.mock.calls.length).toBe(paragraph?.includes('leading and trailing') ? 2 : 1);
    view.unmount();
  } finally { vi.useRealTimers(); }
});
