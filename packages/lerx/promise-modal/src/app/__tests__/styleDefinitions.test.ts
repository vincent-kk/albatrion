import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '../ModalManager';

const flush = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
afterEach(() => ModalManager.reset());

it('(round-2 promise-modal 1) preserves style definitions across unchanged attaches, replacements, additions and detach', async () => {
  ModalManager.reset();
  const owner = {};
  ModalManager.defineStyleSheet('cache-primary', '.cache-primary{color:red}');
  ModalManager.attach(owner, document.body, () => {});
  await flush();
  const initial = document.head.textContent;
  ModalManager.attach(owner, document.body, () => {});
  await flush();
  expect(document.head.textContent).toBe(initial);
  ModalManager.defineStyleSheet('cache-primary', '.cache-primary{color:blue}');
  ModalManager.defineStyleSheet(
    'cache-secondary',
    '.cache-secondary{color:green}',
  );
  ModalManager.attach(owner, document.body, () => {});
  await flush();
  const updated = document.head.textContent;
  expect(updated).toContain('.cache-primary{color:blue}');
  expect(updated).not.toContain('.cache-primary{color:red}');
  expect(updated).toContain('.cache-secondary{color:green}');
  ModalManager.detach(owner);
  ModalManager.attach(owner, document.body, () => {});
  await flush();
  expect(document.head.textContent).toBe(updated);
});
