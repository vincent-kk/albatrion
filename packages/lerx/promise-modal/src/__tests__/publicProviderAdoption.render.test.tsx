import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type ModalFrameProps, ModalProvider, confirm } from '../index';

function Frame({ initiator, visible }: ModalFrameProps) {
  return (
    <output data-testid="request" data-initiator={initiator}>
      {String(visible)}
    </output>
  );
}

/**
 * Builds a frame that names the Provider rendering the request.
 * @param provider Label of the Provider that receives this frame as a prop.
 * @returns A foreground frame reporting that label, its initiator and visibility.
 */
function frameOf(provider: string) {
  return function ProviderFrame({ initiator, visible }: ModalFrameProps) {
    return (
      <output
        data-testid="frame"
        data-provider={provider}
        data-initiator={initiator}
        data-visible={String(visible)}
      />
    );
  };
}
/** Each Provider's frame and fixed route, in registration order. */
const providers = ['owner', 'first', 'second'].map((name) => ({
  name,
  Frame: frameOf(name),
  route: () => ({ pathname: `/${name}` }),
}));

/** A background reporting the initiator it receives. */
function InitiatorBackground({ initiator }: ModalFrameProps) {
  return <output data-testid="background" data-initiator={initiator} />;
}

afterEach(() => vi.restoreAllMocks());

it('adopts the receiving route while keeping the original request initiator', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const request = new AbortController();
  const originalPath = window.location.pathname;
  const app = (shell: boolean, pathname: string) => (
    <>
      {shell && <ModalProvider key="shell" ForegroundComponent={Frame} />}
      <ModalProvider
        key="receiver"
        ForegroundComponent={Frame}
        usePathname={() => ({ pathname })}
      />
    </>
  );
  const view = render(app(true, '/feature'));
  try {
    act(() => {
      void confirm({ title: 'Pending', signal: request.signal });
    });
    expect(screen.getByTestId('request').textContent).toBe('true');
    view.rerender(app(false, '/feature'));
    await act(async () => {});
    expect(screen.getByTestId('request').textContent).toBe('true');
    expect(screen.getByTestId('request').getAttribute('data-initiator')).toBe(
      originalPath,
    );

    view.rerender(app(false, '/elsewhere'));
    expect(screen.getByTestId('request').textContent).toBe('false');
    view.rerender(app(false, '/feature'));
    expect(screen.getByTestId('request').textContent).toBe('true');
  } finally {
    await act(async () => request.abort());
  }
});

it('hands a pending request to waiters in registration order, keeping its initiator', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const request = new AbortController();
  const app = (from: number) => (
    <>
      {providers.slice(from).map(({ name, Frame, route }) => (
        <ModalProvider
          key={name}
          ForegroundComponent={Frame}
          BackgroundComponent={InitiatorBackground}
          usePathname={route}
        />
      ))}
    </>
  );
  const seen = () => ({
    provider: screen.getByTestId('frame').getAttribute('data-provider'),
    visible: screen.getByTestId('frame').getAttribute('data-visible'),
    frameInitiator: screen.getByTestId('frame').getAttribute('data-initiator'),
    backgroundInitiator: screen
      .getByTestId('background')
      .getAttribute('data-initiator'),
  });
  const view = render(app(0));
  let result: boolean | undefined;
  try {
    act(() => {
      void confirm({ title: 'Pending', signal: request.signal }).then(
        (value) => {
          result = value;
        },
      );
    });
    const steps = [seen()];
    view.rerender(app(1));
    await act(async () => {});
    steps.push(seen());
    view.rerender(app(2));
    await act(async () => {});
    steps.push(seen());
    expect(steps).toEqual(
      ['owner', 'first', 'second'].map((provider) => ({
        provider,
        visible: 'true',
        frameInitiator: '/owner',
        backgroundInitiator: '/owner',
      })),
    );
    expect(result).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
  } finally {
    await act(async () => request.abort());
  }
  expect(result).toBe(false);
});

it('cancels visible and route-hidden requests when the last Provider leaves', async () => {
  const app = (pathname: string) => (
    <ModalProvider
      ForegroundComponent={Frame}
      usePathname={() => ({ pathname })}
    />
  );
  const view = render(app('/feature'));
  const results: Record<string, boolean | undefined> = {};
  act(() => {
    void confirm({ title: 'Hidden' }).then((value) => {
      results.hidden = value;
    });
  });
  view.rerender(app('/elsewhere'));
  act(() => {
    void confirm({ title: 'Visible' }).then((value) => {
      results.visible = value;
    });
  });
  expect(
    screen.getAllByTestId('request').map((frame) => frame.textContent),
  ).toEqual(['false', 'true']);
  view.unmount();
  await act(async () => {});
  expect(results).toEqual({ hidden: false, visible: false });
});
