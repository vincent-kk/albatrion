import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm, prompt } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

let leaveResult: boolean | undefined;

function Editor({ shortcut }: { shortcut: string }) {
  return (
    <ModalProvider>
      <input
        id="editor"
        onKeyDown={(event) => {
          if (event.key === shortcut)
            void confirm({ title: 'Leave the editor?' }).then((value) => {
              leaveResult = value;
            });
        }}
      />
    </ModalProvider>
  );
}

it('opening a confirm from Escape stays pending equivalently to an Enter shortcut', async () => {
  const outcomes = [];
  for (const shortcut of ['Enter', 'Escape']) {
    leaveResult = undefined;
    render(<Editor shortcut={shortcut} />);
    const editor = document.querySelector<HTMLInputElement>('#editor')!;
    editor.focus();
    await act(async () => fireEvent.keyDown(editor, { key: shortcut }));
    outcomes.push({
      count: ModalManager.ids.length,
      settled: ModalManager.node(ModalManager.ids[0])?.settled,
      result: leaveResult,
    });
    cleanup();
    ModalManager.reset();
  }
  expect(outcomes[0]).toEqual({ count: 1, settled: false, result: undefined });
  expect(outcomes[1]).toEqual(outcomes[0]);
});

it('keeps a discard confirmation opened from a prompt Escape handler pending', async () => {
  render(<ModalProvider />);
  let promptResult: string | null | undefined = 'pending';
  let discardResult: boolean | undefined;
  act(() => {
    void prompt<string>({
      title: 'Note',
      defaultValue: '',
      Input: ({ value, onChange, onCancel }) => (
        <input
          id="note"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return;
            void confirm({ title: 'Discard the note?' }).then((discard) => {
              discardResult = discard;
              if (discard) onCancel();
            });
          }}
        />
      ),
    }).then((value) => {
      promptResult = value;
    });
  });
  const note = document.querySelector<HTMLInputElement>('#note')!;
  note.focus();
  await act(async () => {
    fireEvent.change(note, { target: { value: 'draft' } });
  });
  await act(async () => {
    fireEvent.keyDown(note, { key: 'Escape' });
  });
  // The confirmation did not exist when Escape was pressed; it must reach the user.
  expect(discardResult).toBeUndefined();
  expect(promptResult).toBe('pending');
});
