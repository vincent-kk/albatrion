import {
  Suspense,
  useState,
} from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { Portal } from '../index';

const Counter = ({ label }: { label: string }) => {
  const [count, setCount] = useState(0);
  return (
    <button data-testid={label} onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
};

const clickTwice = (element: Element | null) => {
  if (!element) throw new Error('missing element');
  fireEvent.click(element);
  fireEvent.click(element);
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('r3 react-utils: Portal anchor inside a re-suspending Suspense boundary', () => {
  let pending: Promise<void> | null = null;
  const Gate = ({ route }: { route: string }) => {
    if (route === 'lazy' && pending) throw pending;
    return <span data-testid="route">{route}</span>;
  };

  it('a Portal source outside the suspended boundary keeps its content state', async () => {
    const Page = Portal.with(({ route }: { route: string }) => (
      <div>
        <Portal>
          <Counter label="modal" />
        </Portal>
        <Suspense fallback={<span data-testid="fallback">loading</span>}>
          <Gate route={route} />
          <Counter label="inlineSuspense" />
          <Portal.Anchor />
        </Suspense>
      </div>
    ));
    const view = render(<Page route="home" />);
    clickTwice(view.getByTestId('modal'));
    clickTwice(view.getByTestId('inlineSuspense'));
    let release: () => void = () => undefined;
    pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = pending;
    await act(async () => view.rerender(<Page route="lazy" />));
    const duringSuspense = view.queryByTestId('fallback') !== null;
    pending = null;
    await act(async () => {
      release();
      await current;
    });
    expect({
      duringSuspense,
      modal: view.queryByTestId('modal')?.textContent ?? null,
    }).toEqual({
      duringSuspense: true,
      modal: view.queryByTestId('inlineSuspense')?.textContent,
    });
  });

  it('control: raw createPortal to a persistent host keeps state across the same suspension', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const Raw = ({ route }: { route: string }) => (
      <div>
        {createPortal(<Counter label="rawModal" />, host)}
        <Suspense fallback={<span>loading</span>}>
          <Gate route={route} />
        </Suspense>
      </div>
    );
    const view = render(<Raw route="home" />);
    clickTwice(host.querySelector('button'));
    let release: () => void = () => undefined;
    pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = pending;
    await act(async () => view.rerender(<Raw route="lazy" />));
    pending = null;
    await act(async () => {
      release();
      await current;
    });
    expect(host.querySelector('button')?.textContent).toBe('2');
  });
});

