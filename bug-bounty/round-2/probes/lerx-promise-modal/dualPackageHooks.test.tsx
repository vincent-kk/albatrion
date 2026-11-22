import { createRequire } from 'node:module';

import * as React from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

afterEach(() => {
  cleanup();
});

it('packed ESM and CJS builds resolve to distinct copies that share one runtime', async () => {
  const esm = await import('@lerx/promise-modal');
  const cjs = require('@lerx/promise-modal');
  expect(esm.alert).not.toBe(cjs.alert);
  expect(Object.keys(esm).sort()).toEqual(
    Object.keys(cjs)
      .filter((key) => key !== '__esModule')
      .sort(),
  );
});

it('the CommonJS copy counts modals that the ESM copy opened under the ESM provider', async () => {
  const esm = await import('@lerx/promise-modal');
  const cjs = require('@lerx/promise-modal');
  function Counter() {
    const count = cjs.useActiveModalCount();
    return <span>count {count}</span>;
  }
  render(
    <>
      <esm.ModalProvider />
      <Counter />
    </>,
  );
  let result!: Promise<void>;
  act(() => {
    result = esm.alert({ title: 'Counted' });
  });
  expect(screen.getByText(/count /).textContent).toBe('count 1');
  fireEvent.click(screen.getByText('Confirm'));
  await expect(result).resolves.toBeUndefined();
});

it("content from the CommonJS copy can read its own copy's modal hooks under the ESM provider", async () => {
  const esm = await import('@lerx/promise-modal');
  const cjs = require('@lerx/promise-modal');
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(event.error);
    event.preventDefault();
  };
  window.addEventListener('error', onError);

  function FeatureContent() {
    const { duration } = cjs.useModalDuration();
    return <span>feature duration {String(duration)}</span>;
  }

  class Boundary extends React.Component<
    React.PropsWithChildren,
    { error?: unknown }
  > {
    state: { error?: unknown } = {};
    static getDerivedStateFromError(error: unknown) {
      return { error };
    }
    render() {
      return this.state.error ? (
        <span>boundary: {String((this.state.error as Error).message)}</span>
      ) : (
        this.props.children
      );
    }
  }

  render(
    <Boundary>
      <esm.ModalProvider />
    </Boundary>,
  );
  let result!: Promise<void>;
  act(() => {
    result = cjs.alert({ title: 'Feature bundle', content: FeatureContent });
  });
  window.removeEventListener('error', onError);
  const boundary = screen.queryByText(/boundary:/);
  expect(boundary?.textContent ?? null).toBeNull();
  expect(screen.queryByText(/feature duration/)).not.toBeNull();
  fireEvent.click(screen.getByText('Confirm'));
  await expect(result).resolves.toBeUndefined();
});
