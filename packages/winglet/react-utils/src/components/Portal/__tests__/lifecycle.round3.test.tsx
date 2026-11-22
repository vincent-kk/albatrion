import {
  Activity,
  type ReactNode,
  StrictMode,
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
