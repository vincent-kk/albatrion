import {
  Activity,
  type ReactNode,
  StrictMode,
  Suspense,
  useState,
} from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';



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

import { Portal } from '../index';

describe('r3 react-utils: Portal scope inside Activity (docs: "Activity hide/show preserves subtree state")', () => {
  const Page = Portal.with(() => (
    <div>
      <Portal>
        <Counter label="portal" />
      </Portal>
      <Counter label="inline" />
      <Portal.Anchor />
    </div>
  ));
  const App = ({ hidden }: { hidden: boolean }) => (
    <Activity mode={hidden ? 'hidden' : 'visible'}>
      <Page />
    </Activity>
  );

  const run = async (wrap: (node: ReactNode) => ReactNode) => {
    const view = render(wrap(<App hidden={false} />));
    clickTwice(view.getByTestId('portal'));
    clickTwice(view.getByTestId('inline'));
    await act(async () => view.rerender(wrap(<App hidden />)));
    await act(async () => view.rerender(wrap(<App hidden={false} />)));
    const result = {
      portal: view.queryByTestId('portal')?.textContent ?? null,
      inline: view.queryByTestId('inline')?.textContent ?? null,
    };
    view.unmount();
    return result;
  };

  it('keeps portal content state when the whole Portal.with scope is hidden and shown', async () => {
    const result = await run((node) => node);
    expect(result.portal).toBe(result.inline);
  });

  it('same under StrictMode', async () => {
    const result = await run((node) => <StrictMode>{node}</StrictMode>);
    expect(result.portal).toBe(result.inline);
  });

  it('control: raw createPortal into a persistent host inside the same Activity keeps state', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const Raw = ({ hidden }: { hidden: boolean }) => (
      <Activity mode={hidden ? 'hidden' : 'visible'}>
        <div>{createPortal(<Counter label="raw" />, host)}</div>
      </Activity>
    );
    const view = render(<Raw hidden={false} />);
    clickTwice(host.querySelector('button'));
    await act(async () => view.rerender(<Raw hidden />));
    await act(async () => view.rerender(<Raw hidden={false} />));
    expect(host.querySelector('button')?.textContent).toBe('2');
  });
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
          <Portal.Anchor />
        </Suspense>
      </div>
    ));
    const view = render(<Page route="home" />);
    clickTwice(view.getByTestId('modal'));
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
    }).toEqual({ duringSuspense: true, modal: '2' });
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

describe('r3 react-utils: Portal inside a shadow root (control)', () => {
  it('renders and bubbles clicks like the light DOM', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.appendChild(container);
    let clicks = 0;
    const Page = Portal.with(() => (
      <div
        onClick={() => {
          clicks += 1;
        }}
      >
        <Portal>
          <Counter label="shadow" />
        </Portal>
        <Portal.Anchor data-testid="anchor" />
      </div>
    ));
    render(<Page />, { container });
    const button = shadow.querySelector('[data-testid="shadow"]');
    clickTwice(button);
    expect({ text: button?.textContent, clicks }).toEqual({
      text: '2',
      clicks: 2,
    });
  });
});
