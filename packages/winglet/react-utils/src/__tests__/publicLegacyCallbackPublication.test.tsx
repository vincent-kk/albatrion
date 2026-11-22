import { useLayoutEffect } from 'react';

import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { useHandle } from '../index';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useInsertionEffect: undefined,
}));

it('can expose the prior callback to a child layout effect on the legacy React path', () => {
  const observed: string[] = [];
  let handle: (() => string) | undefined;
  function Child({ change }: { change: string }) {
    useLayoutEffect(() => {
      if (handle) observed.push(handle());
    }, [change]);
    return null;
  }
  function Parent({ value }: { value: string }) {
    handle = useHandle(() => value);
    return <Child change={value} />;
  }

  const view = render(<Parent value="old" />);
  view.rerender(<Parent value="new" />);
  expect(observed).toEqual(['old', 'old']);
  expect(handle?.()).toBe('new');
});
