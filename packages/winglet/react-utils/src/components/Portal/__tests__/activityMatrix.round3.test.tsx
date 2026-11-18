import { Activity, StrictMode, useEffect, useState } from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { expect, it } from 'vitest';

import { Portal } from '../index';

it('round-3 react-utils 1: whole, anchor-only and source-only Activity match inline state through hide/show', async () => {
  const Counter = ({ label }: { label: string }) => {
    const [count, set] = useState(0);
    return (
      <button data-label={label} onClick={() => set(count + 1)}>
        {count}
      </button>
    );
  };
  const Page = Portal.with(
    ({ hidden, where }: { hidden: boolean; where: string }) => {
      const source = (
        <>
          <Portal>
            <Counter label="one" />
          </Portal>
          <Portal>
            <Counter label="two" />
          </Portal>
        </>
      );
      const anchor = <Portal.Anchor data-anchor="yes" />;
      return (
        <>
          {where === 'source' ? (
            <Activity mode={hidden ? 'hidden' : 'visible'}>{source}</Activity>
          ) : (
            source
          )}
          {where === 'anchor' ? (
            <Activity mode={hidden ? 'hidden' : 'visible'}>{anchor}</Activity>
          ) : (
            anchor
          )}
          <Counter label="inline" />
        </>
      );
    },
  );
  for (const where of ['whole', 'anchor', 'source'])
    for (const shadow of [false, true])
      for (const strict of [false, true]) {
        const container = document.createElement('div');
        const host = document.createElement('div');
        document.body.appendChild(host);
        if (shadow) host.attachShadow({ mode: 'open' }).appendChild(container);
        else host.appendChild(container);
        const app = (hidden: boolean) => {
          const page = <Page hidden={hidden} where={where} />;
          const content =
            where === 'whole' ? (
              <Activity mode={hidden ? 'hidden' : 'visible'}>{page}</Activity>
            ) : (
              page
            );
          return strict ? <StrictMode>{content}</StrictMode> : content;
        };
        const view = render(app(false), { container });
        for (const button of container.querySelectorAll('button')) {
          fireEvent.click(button);
          fireEvent.click(button);
        }
        await act(async () => view.rerender(app(true)));
        await act(async () => view.rerender(app(false)));
        const values = [...container.querySelectorAll('button')].map(
          (button) => button.textContent,
        );
        expect(values).toEqual([values[2], values[2], values[2]]);
        expect(
          [...container.querySelectorAll('[data-anchor] [data-label]')].map(
            (node) => node.getAttribute('data-label'),
          ),
        ).toEqual(['one', 'two']);
        view.unmount();
        host.remove();
      }
});

it('round-3 react-utils 1: removing a hidden anchor removes its content and a replacement is a fresh destination', async () => {
  const counts = { mounted: 0, removed: 0 };
  const Child = () => {
    useEffect(() => {
      counts.mounted++;
      return () => {
        counts.removed++;
      };
    }, []);
    return <span data-child="yes">child</span>;
  };
  const Page = Portal.with(
    ({
      hidden,
      present,
      id,
    }: {
      hidden: boolean;
      present: boolean;
      id: string;
    }) => (
      <>
        <Portal>
          <Child />
        </Portal>
        <Activity mode={hidden ? 'hidden' : 'visible'}>
          {present && <Portal.Anchor key={id} />}
        </Activity>
      </>
    ),
  );
  const view = render(<Page hidden={false} present id="a" />);
  const original = view.container.querySelector('[data-child]');
  await act(async () => view.rerender(<Page hidden present id="a" />));
  await act(async () => view.rerender(<Page hidden present={false} id="a" />));
  expect(counts.removed).toBe(counts.mounted);
  await act(async () => view.rerender(<Page hidden={false} present id="b" />));
  expect(view.container.querySelector('[data-child]')).not.toBe(original);
  view.unmount();
  expect(counts.removed).toBe(counts.mounted);
});
