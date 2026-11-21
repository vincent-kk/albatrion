import { vi } from 'vitest';

/** Provide the native observer API required by Ant6 in the JSDOM environment. */
class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', TestResizeObserver);
