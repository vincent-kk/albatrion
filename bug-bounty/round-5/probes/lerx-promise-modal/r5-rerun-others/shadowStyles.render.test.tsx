// RG2 follow-up for round-2 promise-modal item 1: the copied probe also demanded document
// styles; this control checks only the item's own symptom (no styles inside the shadow root).
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  document.body.innerHTML = '';
});

it('control: a shadow-root anchor gets the modal styles inside its own shadow tree', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const mount = document.createElement('div');
  shadow.append(mount);
  render(<ModalProvider root={mount} />);
  act(() => {
    void confirm({ title: 'styled?' });
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  const shadowStyles =
    shadow.querySelectorAll('style').length +
    (shadow.adoptedStyleSheets?.length ?? 0);
  const documentStyles =
    document.head.querySelectorAll('style').length +
    (document.adoptedStyleSheets?.length ?? 0);
  expect({ shadowStyles: shadowStyles > 0, documentStyles }).toEqual({
    shadowStyles: true,
    documentStyles: 0,
  });
});
