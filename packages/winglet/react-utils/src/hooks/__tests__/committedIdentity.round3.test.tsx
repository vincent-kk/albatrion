import { render } from '@testing-library/react';
import { expect, it } from 'vitest';

import { useCommittedReference } from '../utils/useCommittedReference';

it('round-3 react-utils 2: an unchanged callback causes no commit publication work', () => {
  const first = () => 1;
  const second = () => 2;
  let current = first;
  const writes: Array<() => number> = [];
  const reference = {
    get current() { return current; },
    set current(value: () => number) { writes.push(value); current = value; },
  };
  const Probe = ({ callback }: { callback: () => number }) => {
    useCommittedReference(reference, callback);
    return null;
  };
  const view = render(<Probe callback={first} />);
  const afterMount = writes.slice();
  view.rerender(<Probe callback={first} />);
  expect(writes).toEqual(afterMount);
  view.rerender(<Probe callback={second} />);
  expect(writes).toEqual([...afterMount, second]);
  view.unmount();
});
