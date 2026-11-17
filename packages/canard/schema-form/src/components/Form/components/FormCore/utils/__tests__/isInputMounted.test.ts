// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { VirtualizationManager } from '@/schema-form/helpers/virtualization';

import { isInputMounted } from '../isInputMounted';

afterEach(() => vi.unstubAllGlobals());

it('uses actual registered input containers and their first non-disabled focus target', () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  const manager = VirtualizationManager.create(true)!;
  const target = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const first = document.createElement('div');
  first.innerHTML = '<input disabled><button>later</button>';
  const second = document.createElement('div');
  second.innerHTML = '<button>actual input</button>';
  expect(isInputMounted(manager, target)).toBe(false);
  manager.attachInput(first, target);
  expect(isInputMounted(manager, target)).toBe(false);
  manager.attachInput(second, target);
  expect(isInputMounted(manager, target)).toBe(true);
  manager.detachInput(second);
  manager.detachInput(first);
  manager.disconnect();
});

it('recognizes marked targets and rejects aria-disabled targets', () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  const manager = VirtualizationManager.create(true)!;
  const target = nodeFromJSONSchema({ jsonSchema: { type: 'boolean' } });
  const container = document.createElement('div');
  container.innerHTML =
    '<div role="switch" tabindex="0" data-focus-target></div>';
  manager.attachInput(container, target);
  expect(isInputMounted(manager, target)).toBe(true);
  container.firstElementChild!.setAttribute('aria-disabled', 'true');
  expect(isInputMounted(manager, target)).toBe(false);
  container.innerHTML = '<button aria-disabled="true">native</button>';
  expect(isInputMounted(manager, target)).toBe(false);
  container.firstElementChild!.setAttribute('aria-disabled', 'false');
  expect(isInputMounted(manager, target)).toBe(true);
  manager.disconnect();
});
