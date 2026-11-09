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
