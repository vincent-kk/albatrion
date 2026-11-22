import { afterEach, expect, it, vi } from 'vitest';

/** Same registry slot the shipped bundles use to share one runtime. */
const key = Symbol.for('@lerx/promise-modal');
const original = Reflect.get(globalThis, key);
const managers: (typeof import('../../app/ModalManager').ModalManager)[] = [];

async function loadManager() {
  vi.resetModules();
  const { ModalManager } = await import('../../app/ModalManager');
  managers.push(ModalManager);
  return ModalManager;
}

const flushFrames = () => new Promise((resolve) => setTimeout(resolve, 50));

const styleCount = () =>
  document.head.querySelectorAll('style').length +
  (document.adoptedStyleSheets?.length ?? 0);

afterEach(() => {
  for (const manager of managers.splice(0)) manager.reset();
  if (original === undefined) Reflect.deleteProperty(globalThis, key);
  else Reflect.set(globalThis, key, original);
  document.head.innerHTML = '';
  vi.restoreAllMocks();
});

it('control: one copy removes its stylesheet on detach', async () => {
  const first = await loadManager();
  first.reset();
  first.defineStyleSheet('probe', '.probe{color:red}');
  const owner = {};
  first.attach(owner, document.body, vi.fn());
  await flushFrames();
  expect(styleCount()).toBe(1);
  first.detach(owner);
  await flushFrames();
  expect(styleCount()).toBe(0);
});

it('removes the shared stylesheet when another compatible copy detaches the owner', async () => {
  const first = await loadManager();
  first.reset();
  const second = await loadManager();
  first.defineStyleSheet('probe', '.probe{color:red}');
  const owner = {};
  first.attach(owner, document.body, vi.fn());
  await flushFrames();
  expect(styleCount()).toBe(1);
  // SPECIFICATION: compatible copies share "style identity" and either copy
  // may release the shared resources.
  second.detach(owner);
  await flushFrames();
  expect(styleCount()).toBe(0);
  // A later owner attaches through the second copy: still exactly one sheet.
  second.attach({}, document.body, vi.fn());
  await flushFrames();
  expect(styleCount()).toBe(1);
});
