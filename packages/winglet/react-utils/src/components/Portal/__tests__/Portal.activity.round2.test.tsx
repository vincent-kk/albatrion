import { Activity, useState } from 'react';
import { createPortal } from 'react-dom';
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Portal } from '../index';

const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
};
const Library = Portal.with(({ hidden }: { hidden: boolean }) => <>
  <Activity mode={hidden ? 'hidden' : 'visible'}><Portal><Counter /></Portal></Activity>
  <Portal><span>second</span></Portal><Portal.Anchor data-testid="anchor" />
</>);
const Raw = ({ hidden, host }: { hidden: boolean; host: Element }) => <>
  <Activity mode={hidden ? 'hidden' : 'visible'}>{createPortal(<Counter />, host)}</Activity>
  {createPortal(<span>second</span>, host)}
</>;
describe('round-2 react-utils 1: Activity equivalence', () => {
  it('retains the same state and DOM order as a native portal after hide/show', async () => {
    const run = async (library: boolean) => {
      const host = document.createElement('div'); document.body.appendChild(host);
      const view = render(library ? <Library hidden={false} /> : <Raw hidden={false} host={host} />);
      const anchor = library ? view.getByTestId('anchor') : host;
      const button = anchor.querySelector('button');
      if (!button) throw new Error('Missing counter');
      fireEvent.click(button); fireEvent.click(button);
      await act(async () => view.rerender(library ? <Library hidden /> : <Raw hidden host={host} />));
      await act(async () => view.rerender(library ? <Library hidden={false} /> : <Raw hidden={false} host={host} />));
      const result = Array.from(anchor.children, child => child.textContent);
      view.unmount(); host.remove(); return result;
    };
    expect(await run(true)).toEqual(await run(false));
  });
});
