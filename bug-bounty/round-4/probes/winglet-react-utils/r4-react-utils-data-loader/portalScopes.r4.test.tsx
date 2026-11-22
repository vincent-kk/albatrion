import { Activity, StrictMode, useState } from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Portal } from '../../components/Portal';

afterEach(() => {
  document.body.innerHTML = '';
});

let counterId = 0;
const Counter = ({ label }: { label: string }) => {
  const [count, setCount] = useState(0);
  const id = `${label}-${counterId++}`;
  return (
    <button data-label={label} data-id={id} onClick={() => setCount((c) => c + 1)}>
      {label}:{count}
    </button>
  );
};

const byLabel = (label: string) =>
  document.querySelector(`[data-label="${label}"]`) as HTMLElement | null;

describe('Portal scopes (IN3, watch list: Portal under Activity)', () => {
  it('two sibling scopes render into their own anchors', () => {
    const Scope = Portal.with(({ name }: { name: string }) => (
      <section data-scope={name}>
        <Portal>
          <Counter label={name} />
        </Portal>
        <Portal.Anchor data-anchor={name} />
      </section>
    ));
    render(
      <>
        <Scope name="one" />
        <Scope name="two" />
      </>,
    );
    expect({
      one: byLabel('one')?.parentElement?.getAttribute('data-anchor'),
      two: byLabel('two')?.parentElement?.getAttribute('data-anchor'),
    }).toEqual({ one: 'one', two: 'two' });
  });

  it('a nested scope inside outer portal content keeps state when the outer scope is hidden and shown', async () => {
    const Inner = Portal.with(() => (
      <div>
        <Portal>
          <Counter label="inner" />
        </Portal>
        <Portal.Anchor data-anchor="inner" />
      </div>
    ));
    const Outer = Portal.with(() => (
      <div>
        <Portal>
          <Counter label="outer" />
          <Inner />
        </Portal>
        <Portal.Anchor data-anchor="outer" />
      </div>
    ));
    const App = ({ mode }: { mode: 'visible' | 'hidden' }) => (
      <StrictMode>
        <Activity mode={mode}>
          <Outer />
        </Activity>
      </StrictMode>
    );
    const view = render(<App mode="visible" />);
    fireEvent.click(byLabel('outer')!);
    fireEvent.click(byLabel('inner')!);
    fireEvent.click(byLabel('inner')!);
    view.rerender(<App mode="hidden" />);
    await act(async () => {
      await Promise.resolve();
    });
    view.rerender(<App mode="visible" />);
    await act(async () => {
      await Promise.resolve();
    });
    expect({
      outer: byLabel('outer')?.textContent,
      inner: byLabel('inner')?.textContent,
      innerAnchor: byLabel('inner')?.parentElement?.getAttribute('data-anchor'),
    }).toEqual({ outer: 'outer:1', inner: 'inner:2', innerAnchor: 'inner' });
  });
});
