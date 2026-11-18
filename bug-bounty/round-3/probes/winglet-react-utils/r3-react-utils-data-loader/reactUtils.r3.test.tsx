import {
  Activity,
  type ReactNode,
  StrictMode,
  Suspense,
  startTransition,
  useState,
} from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Portal, useHandle, useTimeout, withUploader } from '../../index';

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
    expect(await run((node) => node)).toEqual({ portal: '2', inline: '2' });
  });

  it('same under StrictMode', async () => {
    expect(await run((node) => <StrictMode>{node}</StrictMode>)).toEqual({
      portal: '2',
      inline: '2',
    });
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

describe('r3 react-utils: withUploader click containment (DETAIL: only the original click reaches ancestor handlers)', () => {
  const Button = ({
    onClick,
    children,
  }: {
    onClick?: (event?: MouseEvent) => void;
    children?: ReactNode;
  }) => (
    <button data-testid="upload" onClick={onClick as never}>
      {children}
    </button>
  );
  const UploadButton = withUploader(Button);

  const run = (container?: HTMLElement) => {
    const counts = { reactCapture: 0, reactBubble: 0, documentCapture: 0 };
    const onDocumentCapture = () => {
      counts.documentCapture += 1;
    };
    document.addEventListener('click', onDocumentCapture, true);
    const view = render(
      <div
        onClickCapture={() => {
          counts.reactCapture += 1;
        }}
        onClick={() => {
          counts.reactBubble += 1;
        }}
      >
        <UploadButton>Upload</UploadButton>
      </div>,
      container ? { container } : undefined,
    );
    const button = (container ?? document.body).querySelector(
      '[data-testid="upload"]',
    );
    if (!button) throw new Error('missing button');
    fireEvent.click(button);
    document.removeEventListener('click', onDocumentCapture, true);
    view.unmount();
    return counts;
  };

  it('an ancestor onClickCapture runs once per user click (light DOM)', () => {
    expect(run()).toEqual({
      reactCapture: 1,
      reactBubble: 1,
      documentCapture: 1,
    });
  });

  it('same inside a shadow root', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.appendChild(container);
    expect(run(container)).toEqual({
      reactCapture: 1,
      reactBubble: 1,
      documentCapture: 1,
    });
  });
});

describe('r3 react-utils: useTimeout after unmount (JSDoc: "Auto-cleanup: Prevents memory leaks on unmount")', () => {
  it('schedule() called after unmount does not run the callback', async () => {
    vi.useFakeTimers();
    try {
      const callback = vi.fn();
      let controls: ReturnType<typeof useTimeout> | null = null;
      const Probe = () => {
        controls = useTimeout(callback, 50);
        return null;
      };
      const view = render(<Probe />);
      view.unmount();
      // e.g. an awaited request resolves after the user navigated away
      controls!.schedule();
      vi.advanceTimersByTime(100);
      expect({
        calls: callback.mock.calls.length,
        idle: controls!.isIdle(),
      }).toEqual({ calls: 0, idle: true });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('r3 react-utils: useHandle and an uncommitted transition render', () => {
  it('the stable handle reads the committed render, not a suspended transition', async () => {
    let resolveData: () => void = () => undefined;
    const data = new Promise<void>((resolve) => {
      resolveData = resolve;
    });
    let ready = false;
    void data.then(() => {
      ready = true;
    });
    const Gate = ({ value }: { value: string }) => {
      if (value === 'B' && !ready) throw data;
      return <span data-testid="shown">{value}</span>;
    };
    let handle: (() => string) | null = null;
    let setValue: (value: string) => void = () => undefined;
    const App = () => {
      const [value, set] = useState('A');
      setValue = set;
      handle = useHandle(() => value);
      return (
        <Suspense fallback={<span>loading</span>}>
          <Gate value={value} />
        </Suspense>
      );
    };
    const view = render(<App />);
    await act(async () => {
      startTransition(() => setValue('B'));
    });
    const shown = view.getByTestId('shown').textContent;
    const handled = handle!();
    resolveData();
    await act(async () => {
      await data;
    });
    expect({ shown, handled }).toEqual({ shown: 'A', handled: 'A' });
  });
});

describe('r3 react-utils: shipped agent skill states the manifest peer range', () => {
  it('SKILL.md peer sentence matches package.json peerDependencies', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const root = resolve(__dirname, '../../..');
    const manifest = JSON.parse(
      readFileSync(resolve(root, 'package.json'), 'utf8'),
    );
    const skill = readFileSync(
      resolve(root, 'docs/agents/skills/react-utils-skill/SKILL.md'),
      'utf8',
    );
    const stated = /Peer dependencies: React and React DOM `([^`]+)`/.exec(
      skill,
    )?.[1];
    expect(stated).toBe(manifest.peerDependencies.react);
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
