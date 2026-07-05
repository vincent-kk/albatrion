import { StrictMode } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alert, confirm, prompt } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

const anchorCount = () =>
  document.querySelectorAll('[id^="promise-modal-"]').length;

describe('bootstrap lifecycle (real rendering)', () => {
  afterEach(() => {
    cleanup();
    ModalManager.reset();
  });

  it('마운트 후 alert(): 모달이 렌더되고 Confirm 클릭 시 resolve되어야 함', async () => {
    render(<BootstrapProvider>{null}</BootstrapProvider>);

    let promiseHandler!: Promise<void>;
    act(() => {
      promiseHandler = alert({ title: 'Mounted Alert' });
    });

    const confirmButton = await screen.findByText('Confirm');
    expect(screen.getByText('Mounted Alert')).toBeDefined();

    fireEvent.click(confirmButton);
    await expect(promiseHandler).resolves.toBeUndefined();
  });

  it('마운트 전 alert(): 마운트 후 표시되고 동일한 promise가 resolve되어야 함', async () => {
    const promiseHandler = alert({ title: 'Queued Alert' });
    expect(ModalManager.prerender.length).toBe(1);

    render(<BootstrapProvider>{null}</BootstrapProvider>);

    const confirmButton = await screen.findByText('Confirm');
    expect(screen.getByText('Queued Alert')).toBeDefined();

    fireEvent.click(confirmButton);
    await expect(promiseHandler).resolves.toBeUndefined();
  });

  it('unmount 후 재마운트해도 모달 시스템이 복구되어야 함', async () => {
    const first = render(<BootstrapProvider>{null}</BootstrapProvider>);
    expect(ModalManager.anchored).toBe(true);

    first.unmount();
    expect(ModalManager.anchored).toBe(false);
    expect(anchorCount()).toBe(0);

    render(<BootstrapProvider>{null}</BootstrapProvider>);
    expect(ModalManager.anchored).toBe(true);

    let promiseHandler!: Promise<boolean>;
    act(() => {
      promiseHandler = confirm({ title: 'Remounted Confirm' });
    });

    fireEvent.click(await screen.findByText('Confirm'));
    await expect(promiseHandler).resolves.toBe(true);
  });

  it('StrictMode(개발 환경 이중 마운트)에서도 앵커가 1개만 남고 정상 동작해야 함', async () => {
    render(
      <StrictMode>
        <BootstrapProvider>{null}</BootstrapProvider>
      </StrictMode>,
    );
    expect(anchorCount()).toBe(1);

    let promiseHandler!: Promise<void>;
    act(() => {
      promiseHandler = alert({ title: 'Strict Alert' });
    });

    fireEvent.click(await screen.findByText('Confirm'));
    await expect(promiseHandler).resolves.toBeUndefined();
  });

  it('prompt: 입력 후 Confirm 시 입력값으로 resolve되어야 함', async () => {
    render(<BootstrapProvider>{null}</BootstrapProvider>);

    let promiseHandler!: Promise<string | null>;
    act(() => {
      promiseHandler = prompt<string>({
        title: 'Name Prompt',
        Input: ({ value, onChange }) => (
          <input
            aria-label="name-input"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
          />
        ),
        defaultValue: '',
      });
    });

    fireEvent.change(await screen.findByLabelText('name-input'), {
      target: { value: 'Vincent' },
    });
    fireEvent.click(screen.getByText('Confirm'));

    // PromptInner defers onConfirm by a frame; settle inside act to cover the
    // state updates it triggers.
    await act(async () => {
      await expect(promiseHandler).resolves.toBe('Vincent');
    });
  });

  it('prompt: Cancel 클릭 시 null로 resolve되어야 함', async () => {
    render(<BootstrapProvider>{null}</BootstrapProvider>);

    let promiseHandler!: Promise<string | null>;
    act(() => {
      promiseHandler = prompt<string>({
        title: 'Cancelable Prompt',
        Input: ({ value, onChange }) => (
          <input
            aria-label="cancel-input"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
          />
        ),
      });
    });

    fireEvent.click(await screen.findByText('Cancel'));
    await expect(promiseHandler).resolves.toBe(null);
  });

  it('빈 값(falsy)에서도 disabled 검증이 호출되어 Confirm 버튼이 비활성화되어야 함', async () => {
    render(<BootstrapProvider>{null}</BootstrapProvider>);

    act(() => {
      void prompt<string>({
        title: 'Validated Prompt',
        Input: ({ value, onChange }) => (
          <input
            aria-label="validated-input"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
          />
        ),
        disabled: (value) => !value,
      });
    });

    const confirmButton = await screen.findByText<HTMLButtonElement>('Confirm');
    expect(confirmButton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('validated-input'), {
      target: { value: 'x' },
    });
    await waitFor(() =>
      expect(screen.getByText<HTMLButtonElement>('Confirm').disabled).toBe(
        false,
      ),
    );
  });
});
