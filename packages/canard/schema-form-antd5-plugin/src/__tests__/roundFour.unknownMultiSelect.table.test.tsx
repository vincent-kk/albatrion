import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it.each(['legacy', 'null', null, { legacy: 'data' }, ['legacy']])(
  'multi select preserves untouched JSON %j until explicitly removed',
  (unknown) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'array',
          items: { type: 'string', enum: ['news', 'sports'] },
        }}
        defaultValue={[unknown, 'sports']}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    expect(ref.current!.getValue()).toEqual([unknown, 'sports']);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    act(() => fireEvent.click(screen.getByTitle('news')));
    expect(ref.current!.getValue()).toEqual([unknown, 'sports', 'news']);
    act(() =>
      fireEvent.click(
        document.querySelector('.ant-select-item-option[title="sports"]')!,
      ),
    );
    expect(ref.current!.getValue()).toEqual([unknown, 'news']);
    const removes = container.querySelectorAll(
      '.ant-select-selection-item-remove',
    );
    expect(removes).toHaveLength(2);
    act(() => fireEvent.click(removes[0]));
    expect(ref.current!.getValue()).toEqual(['news']);
    act(() =>
      fireEvent.click(
        container.querySelector('.ant-select-selection-item-remove')!,
      ),
    );
    expect(ref.current!.getValue()).toEqual([]);
  },
);
