import {
  Activity,
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { describe, expect, it } from 'vitest';

import { Portal } from '../index';

const Value = createContext('outside');
const Destination = createContext<HTMLDivElement | null>(null);
const NativePortal = ({ children }: PropsWithChildren) => {
  const destination = useContext(Destination);
  return destination ? createPortal(children, destination) : null;
};
const Read = () => {
  const value = useContext(Value);
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {value}:{count}
    </button>
  );
};
const exercise = async (native: boolean) => {
  const events: string[] = [];
  const Content = native ? NativePortal : Portal;
  const Tree = ({
    hidden,
    anchor,
    version,
  }: {
    hidden: boolean;
    anchor: boolean;
    version: number;
  }) => (
    <div onClick={() => events.push('page')}>
      <Value.Provider value="source">
        <section onClick={() => events.push('source')}>
          <Activity mode={hidden ? 'hidden' : 'visible'}>
            <Content>
              <Read />
            </Content>
          </Activity>
        </section>
      </Value.Provider>
      <Content>
        <span>second</span>
      </Content>
      <Content>
        <span>third</span>
      </Content>
      {anchor &&
        (native ? (
          <NativeAnchor key={version} />
        ) : (
          <Portal.Anchor key={version} data-testid="anchor" />
        ))}
    </div>
  );
  const NativeAnchor = () => {
    const setAnchor = useContext(SetDestination);
    return <div data-testid="anchor" ref={setAnchor} />;
  };
  const NativeScope = ({ children }: PropsWithChildren) => {
    const [destination, setDestination] = useState<HTMLDivElement | null>(null);
    return (
      <Destination.Provider value={destination}>
        <SetDestination.Provider value={setDestination}>
          {children}
        </SetDestination.Provider>
      </Destination.Provider>
    );
  };
  const Scope = native
    ? NativeScope
    : Portal.with(({ children }: PropsWithChildren) => <>{children}</>);
  const tree = (hidden = false, anchor = true, version = 0) => (
    <div onClick={() => events.push('above')}>
      <Scope>
        <Tree hidden={hidden} anchor={anchor} version={version} />
      </Scope>
    </div>
  );
  const view = render(tree(false, false));
  const absent = view.container.querySelectorAll('button,span').length;
  view.rerender(tree());
  const button = view.getByRole('button');
  fireEvent.click(button);
  fireEvent.click(button);
  const before = Array.from(
    view.getByTestId('anchor').children,
    (child) => child.textContent,
  );
  const bubbling = [...events];
  await act(async () => view.rerender(tree(true)));
  await act(async () => view.rerender(tree()));
  const afterActivity = Array.from(
    view.getByTestId('anchor').children,
    (child) => child.textContent,
  );
  const oldAnchor = view.getByTestId('anchor');
  view.rerender(tree(false, true, 1));
  const replaced = oldAnchor !== view.getByTestId('anchor');
  const afterReplacement = Array.from(
    view.getByTestId('anchor').children,
    (child) => child.textContent,
  );
  view.unmount();
  return {
    absent,
    before,
    bubbling,
    afterActivity,
    replaced,
    afterReplacement,
  };
};
const SetDestination = createContext<(node: HTMLDivElement | null) => void>(
  () => {},
);

describe('round-2 react-utils 1: native portal ancestry and lifecycle', () => {
  it('matches context, bubbling, DOM order, late/replaced anchors and Activity', async () => {
    expect(await exercise(false)).toEqual(await exercise(true));
  });
});
