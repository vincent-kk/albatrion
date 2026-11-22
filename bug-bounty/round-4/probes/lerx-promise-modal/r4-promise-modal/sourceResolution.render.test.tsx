import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';
import { compressCss } from '@winglet/style-utils/util';

import { ModalProvider, alert } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/**
 * Control for the probe-local config: the @winglet code that promise-modal runs
 * must come from packages/winglet/<name>/src, never from a dist build.
 */
afterEach(() => {
  cleanup();
  ModalManager.reset();
});

const wingletFrames = (stack = '') =>
  stack
    .split('\n')
    .filter((line) => line.includes('/packages/winglet/'))
    .map((line) =>
      line.includes('/src/') ? 'src' : line.includes('/dist/') ? 'dist' : line,
    );

it('loads @winglet/common-utils, react-utils and style-utils from source', () => {
  let commonStack: string | undefined;
  map([1], (value) => {
    commonStack = new Error().stack;
    return value;
  });
  let cssStack: string | undefined;
  try {
    compressCss(null as unknown as string);
  } catch (error) {
    cssStack = (error as Error).stack;
  }
  let handleStack: string | undefined;
  function Probe() {
    const handle = useHandle(() => {
      handleStack = new Error().stack;
    });
    return <button onClick={() => handle()}>probe</button>;
  }
  render(<Probe />);
  act(() => screen.getByText('probe').click());
  const frames = {
    common: wingletFrames(commonStack),
    style: wingletFrames(cssStack),
    react: wingletFrames(handleStack),
  };
  expect(frames.common.length).toBeGreaterThan(0);
  expect(frames.style.length).toBeGreaterThan(0);
  expect(frames.react.length).toBeGreaterThan(0);
  expect([...frames.common, ...frames.style, ...frames.react]).not.toContain(
    'dist',
  );
});

it('renders a promise-modal alert through the source-resolved dependencies', () => {
  render(<ModalProvider />);
  act(() => {
    void alert({ title: 'From source' });
  });
  expect(screen.getByText('From source')).toBeTruthy();
});
