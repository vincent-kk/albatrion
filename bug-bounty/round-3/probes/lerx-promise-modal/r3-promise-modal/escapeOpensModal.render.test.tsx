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

it.each(['Enter', 'Escape'])(
  'keeps a confirm opened by a page %s shortcut pending after the same press',
  async (shortcut) => {
    leaveResult = undefined;
    render(<Editor shortcut={shortcut} />);
    const editor = document.getElementById('editor') as HTMLInputElement;
    editor.focus();
    await act(async () => {
      fireEvent.keyDown(editor, { key: shortcut });
    });
    // The press started with no modal open; the confirm it opened must stay pending.
    expect(ModalManager.ids.length).toBe(1);
    expect(ModalManager.node(ModalManager.ids[0])?.settled).toBe(false);
    expect(leaveResult).toBeUndefined();
  },
);

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
  const note = document.getElementById('note') as HTMLInputElement;
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
