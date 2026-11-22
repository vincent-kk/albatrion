import { Activity, forwardRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Portal, isReactComponent, remainOnlyReactComponent, withUploader } from '../../index';

const Counter = ({ label }: { label: string }) => {
  const [count, setCount] = useState(0);
  return (
    <button data-testid={`counter-${label}`} onClick={() => setCount((c) => c + 1)}>
      {label}:{count}
    </button>
  );
};

describe('r2-periphery: Portal under React 19 Activity', () => {
  it('control: raw createPortal content keeps its state across Activity hide and show', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    let setMode: (m: 'visible' | 'hidden') => void = () => {};
    const Page = () => {
      const [mode, set] = useState<'visible' | 'hidden'>('visible');
      setMode = set;
      return <Activity mode={mode}>{createPortal(<Counter label="c" />, host)}</Activity>;
    };
    render(<Page />);
    fireEvent.click(screen.getByTestId('counter-c'));
    fireEvent.click(screen.getByTestId('counter-c'));
    await act(async () => setMode('hidden'));
    await act(async () => setMode('visible'));
    expect(screen.getByTestId('counter-c').textContent).toBe('c:2');
  });

  it('portal content keeps its state across Activity hide and show (like createPortal does)', async () => {
    let setMode: (m: 'visible' | 'hidden') => void = () => {};
    const Page = Portal.with(() => {
      const [mode, set] = useState<'visible' | 'hidden'>('visible');
      setMode = set;
      return (
        <div>
          <Activity mode={mode}>
            <Portal>
              <Counter label="a" />
            </Portal>
          </Activity>
          <Portal.Anchor />
        </div>
      );
    });
    render(<Page />);
    await act(async () => {});
    fireEvent.click(screen.getByTestId('counter-a'));
    fireEvent.click(screen.getByTestId('counter-a'));
    expect(screen.getByTestId('counter-a').textContent).toBe('a:2');
    await act(async () => setMode('hidden'));
    await act(async () => setMode('visible'));
    expect(screen.getByTestId('counter-a').textContent).toBe('a:2');
  });

  it('a hidden-then-shown Portal keeps its registration order (docs: registration order)', async () => {
    let setMode: (m: 'visible' | 'hidden') => void = () => {};
    const Page = Portal.with(() => {
      const [mode, set] = useState<'visible' | 'hidden'>('visible');
      setMode = set;
      return (
        <div>
          <Activity mode={mode}>
            <Portal>
              <span data-testid="first">first</span>
            </Portal>
          </Activity>
          <Portal>
            <span data-testid="second">second</span>
          </Portal>
          <Portal.Anchor data-testid="anchor" />
        </div>
      );
    });
    render(<Page />);
    await act(async () => {});
    const order = () =>
      Array.from(screen.getByTestId('anchor').querySelectorAll('span')).map(
        (s) => s.textContent,
      );
    expect(order()).toEqual(['first', 'second']);
    await act(async () => setMode('hidden'));
    await act(async () => setMode('visible'));
    expect(order()).toEqual(['first', 'second']);
  });
});

describe('r2-periphery: documented behavior that the code contradicts', () => {
  it('portal-system.md: a fresh children element re-registers and remounts the portalled subtree', async () => {
    let rerender: () => void = () => {};
    const Page = Portal.with(() => {
      const [, setTick] = useState(0);
      rerender = () => setTick((t) => t + 1);
      return (
        <div>
          <Portal>
            <Counter label="r" />
          </Portal>
          <Portal.Anchor />
        </div>
      );
    });
    render(<Page />);
    await act(async () => {});
    fireEvent.click(screen.getByTestId('counter-r'));
    await act(async () => rerender());
    // Docs say state is discarded on re-registration.
    expect(screen.getByTestId('counter-r').textContent).toBe('r:0');
  });

  it('SPECIFICATION Filter: isReactComponent(forwardRef(...)) is false and remainOnlyReactComponent drops it', () => {
    const Fwd = forwardRef<HTMLDivElement>((_, ref) => <div ref={ref} />);
    expect(isReactComponent(Fwd)).toBe(false);
    expect(Object.keys(remainOnlyReactComponent({ Fwd }))).toEqual([]);
  });
});

describe('r2-periphery: withUploader', () => {
  it('one click on the wrapped component fires an ancestor onClick once', () => {
    const Button = (props: { onClick?: (e?: MouseEvent) => void; children?: any }) => (
      <button data-testid="btn" onClick={() => props.onClick?.()}>
        {props.children}
      </button>
    );
    const UploadButton = withUploader(Button);
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <UploadButton onChange={() => {}}>upload</UploadButton>
      </div>,
    );
    fireEvent.click(screen.getByTestId('btn'));
    expect(parentClick).toHaveBeenCalledTimes(1);
  });
});
