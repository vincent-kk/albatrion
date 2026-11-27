import { useState } from 'react';

import { fireEvent, render } from '@testing-library/react';
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
