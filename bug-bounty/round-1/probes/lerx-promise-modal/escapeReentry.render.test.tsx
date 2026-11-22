import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { ModalProvider, confirm, prompt } from '@/promise-modal';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('closes at most one modal when the top prompt cancels itself on Escape', async () => {
  render(<ModalProvider />);
  let lowerResult: boolean | undefined;
  let upperResult: string | undefined | null = 'pending';
  act(() => {
    void confirm({ title: 'lower' }).then((value) => {
      lowerResult = value;
    });
    void prompt<string>({
      title: 'upper',
      Input: ({ value, onChange, onCancel }) => (
        <input
          id="upper-input"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onCancel();
          }}
        />
      ),
    }).then((value) => {
      upperResult = value;
    });
  });
  const input = document.getElementById('upper-input') as HTMLInputElement;
  input.focus();
  await act(async () => {
    fireEvent.keyDown(input, { key: 'Escape' });
  });
  expect(upperResult).toBeNull();
  // One key press: only the top request should be cancelled.
  expect(lowerResult).toBeUndefined();
});
