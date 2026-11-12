import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';

import { promptHandler } from '../handle/prompt';
import { PromptNode } from '../node/ModalNode/PromptNode';

afterEach(() => ModalManager.reset());
it('preserves undefined on returnOnCancel cancellation', () => {
  const results: unknown[] = [];
  const node = new PromptNode({
    id: 0,
    initiator: '/',
    type: 'prompt',
    Input: () => null,
    returnOnCancel: true,
    handleResolve: (result) => results.push(result),
  });
  node.onClose();
  expect(results).toEqual([undefined]);
});
it('preserves an untouched returnOnCancel value when aborted before mounting', async () => {
  const controller = new AbortController();
  const handled = promptHandler<string>({
    Input: () => null,
    returnOnCancel: true,
    signal: controller.signal,
  });
  controller.abort();
  await expect(handled.promiseHandler).resolves.toBeUndefined();
});
it('preserves undefined through the rendered-node result mapping', async () => {
  ModalManager.anchor();
  ModalManager.openHandler = (modal) => {
    if (modal.type !== 'prompt') throw new Error('Expected prompt');
    return new PromptNode({ ...modal, id: 1, initiator: '/' });
  };
  const handled = promptHandler<string>({ Input: () => null });
  handled.modalNode?.onConfirm();
  await expect(handled.promiseHandler).resolves.toBeUndefined();
});
