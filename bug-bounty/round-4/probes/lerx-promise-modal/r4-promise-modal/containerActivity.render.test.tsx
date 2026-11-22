import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ModalProvider,
  type PromptInputProps,
  prompt,
  useInitializeModal,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/** Angle EQ5: the README container and manual-root examples hidden and shown by Activity. */
const Activity = (React as { Activity?: React.ComponentType<any> }).Activity;

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

function Input({ value, onChange }: PromptInputProps<string>) {
  return (
    <input
      aria-label="Value"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function ContainerApp() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  return (
    <ModalProvider root={root}>
      <div ref={setRoot} data-testid="container" />
    </ModalProvider>
  );
}

function ManualApp() {
  const container = useRef<HTMLDivElement>(null);
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  useEffect(() => {
    if (container.current) initialize(container.current);
  }, [initialize]);
  return (
    <>
      <div ref={container} data-testid="container" />
      {portal}
    </>
  );
}

for (const [name, App] of [
  ['ContainerApp', ContainerApp],
  ['ManualApp', ManualApp],
] as const)
  it.skipIf(!Activity)(
    `keeps the prompt and its anchor in the container across an Activity hide (${name})`,
    async () => {
      const Act = Activity!;
      const app = (hidden: boolean) => (
        <Act mode={hidden ? 'hidden' : 'visible'}>
          <App />
        </Act>
      );
      const view = render(app(false));
      let result: string | null | undefined = 'pending';
      act(() => {
        void prompt<string>({ title: 'Container prompt', Input }).then(
          (value) => (result = value),
        );
      });
      fireEvent.change(screen.getByLabelText('Value'), {
        target: { value: 'draft' },
      });
      await act(async () => view.rerender(app(true)));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      await act(async () => view.rerender(app(false)));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      const container = screen.getByTestId('container');
      expect({
        result,
        value: screen.queryByLabelText<HTMLInputElement>('Value')?.value,
        anchorInContainer: !!container.firstElementChild?.id.startsWith(
          'promise-modal-',
        ),
        live: ModalManager.ids.length,
      }).toEqual({
        result: 'pending',
        value: 'draft',
        anchorInContainer: true,
        live: 1,
      });
    },
  );
