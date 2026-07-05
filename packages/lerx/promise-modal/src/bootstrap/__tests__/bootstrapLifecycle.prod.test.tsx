import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alert, confirm, prompt } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

/**
 * Production-React lifecycle coverage. act() does not exist in production
 * builds, so this suite drives the real scheduler with plain macrotask
 * flushes and real DOM events (see vitest.prod.config.ts).
 */
const flush = async (rounds = 5) => {
  for (let round = 0; round < rounds; round++)
    await new Promise((resolve) => setTimeout(resolve, 0));
};

const findButton = (label: string) => {
  const buttons = Array.from(document.querySelectorAll('button'));
  return buttons.find((button) => button.textContent === label);
};

const click = (element: HTMLElement) =>
  element.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true }),
  );

describe('bootstrap lifecycle (production React)', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(async () => {
    root?.unmount();
    root = null;
    await flush();
    container.remove();
    ModalManager.reset();
  });

  it('마운트 후 alert(): production 스케줄러에서 렌더·클릭·resolve가 동작해야 함', async () => {
    root = createRoot(container);
    root.render(<BootstrapProvider>{null}</BootstrapProvider>);
    await flush();

    const promiseHandler = alert({ title: 'Prod Alert' });
    await flush();

    expect(document.body.textContent).toContain('Prod Alert');
    const confirmButton = findButton('Confirm');
    expect(confirmButton).toBeDefined();

    click(confirmButton!);
    await expect(promiseHandler).resolves.toBeUndefined();
  });

  it('마운트 전 confirm(): 마운트 후 표시되고 동일 promise가 resolve되어야 함', async () => {
    const promiseHandler = confirm({ title: 'Prod Queued Confirm' });
    expect(ModalManager.prerender.length).toBe(1);

    root = createRoot(container);
    root.render(<BootstrapProvider>{null}</BootstrapProvider>);
    await flush();

    expect(document.body.textContent).toContain('Prod Queued Confirm');
    click(findButton('Confirm')!);
    await expect(promiseHandler).resolves.toBe(true);
  });

  it('unmount 후 재마운트해도 모달 시스템이 복구되어야 함', async () => {
    root = createRoot(container);
    root.render(<BootstrapProvider>{null}</BootstrapProvider>);
    await flush();
    expect(ModalManager.anchored).toBe(true);

    root.unmount();
    root = null;
    await flush();
    expect(ModalManager.anchored).toBe(false);

    root = createRoot(container);
    root.render(<BootstrapProvider>{null}</BootstrapProvider>);
    await flush();
    expect(ModalManager.anchored).toBe(true);

    const promiseHandler = alert({ title: 'Prod Remounted Alert' });
    await flush();
    expect(document.body.textContent).toContain('Prod Remounted Alert');

    click(findButton('Confirm')!);
    await expect(promiseHandler).resolves.toBeUndefined();
  });

  it('prompt 취소: production 환경에서도 null로 resolve되어야 함', async () => {
    root = createRoot(container);
    root.render(<BootstrapProvider>{null}</BootstrapProvider>);
    await flush();

    const promiseHandler = prompt<string>({
      title: 'Prod Prompt',
      Input: ({ value, onChange }) => (
        <input
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        />
      ),
    });
    await flush();

    click(findButton('Cancel')!);
    await expect(promiseHandler).resolves.toBe(null);
  });
});
