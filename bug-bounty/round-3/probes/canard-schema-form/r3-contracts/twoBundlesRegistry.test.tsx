import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

/**
 * Two micro-frontends on one page, each bundling its own copy of @canard/schema-form
 * (no Module Federation sharing), each registering its own UI plugin at startup.
 * `vi.resetModules()` gives each "bundle" its own evaluation of the package source,
 * the same way two independently built bundles evaluate their own copy.
 */
const loadBundleCopy = async () => {
  vi.resetModules();
  return import('../../index');
};

const schema = { type: 'object', properties: { name: { type: 'string' } } };
const AppAFieldRenderer = () => <span>app A renderer</span>;
const AppBFieldRenderer = () => <span>app B renderer</span>;

let undo: Array<() => void> = [];
afterEach(() => {
  cleanup();
  for (const step of undo) step();
  undo = [];
});

it('control: a single bundle renders its own registered plugin', async () => {
  const appA = await loadBundleCopy();
  undo.push(() => appA.registerPlugin(null));
  appA.registerPlugin({ FieldRenderer: AppAFieldRenderer });
  render(<appA.Form jsonSchema={schema} />);
  expect(screen.queryAllByText('app A renderer').length).toBeGreaterThan(0);
});

it("app A's form keeps app A's plugin after app B (another bundle on the page) registers its own", async () => {
  const appA = await loadBundleCopy();
  const appB = await loadBundleCopy();
  expect(appA.Form).not.toBe(appB.Form);
  undo.push(
    () => appA.registerPlugin(null),
    () => appB.registerPlugin(null),
  );

  appA.registerPlugin({ FieldRenderer: AppAFieldRenderer });
  appB.registerPlugin({ FieldRenderer: AppBFieldRenderer });

  render(<appA.Form jsonSchema={schema} />);
  expect({
    appA: screen.queryAllByText('app A renderer').length > 0,
    appB: screen.queryAllByText('app B renderer').length > 0,
  }).toEqual({ appA: true, appB: false });
});

it("app A's form keeps app A's validator after app B (another bundle on the page) registers its own", async () => {
  const appA = await loadBundleCopy();
  const appB = await loadBundleCopy();
  undo.push(
    () => appA.registerPlugin(null),
    () => appB.registerPlugin(null),
  );
  const compiledBy: string[] = [];
  const validatorOf = (app: string) => ({
    compile: () => {
      compiledBy.push(app);
      return async () => null;
    },
    compileGuard: () => () => true,
  });

  appA.registerPlugin({ validator: validatorOf('A') });
  appB.registerPlugin({ validator: validatorOf('B') });

  render(<appA.Form jsonSchema={schema} />);
  await vi.waitFor(() => expect(compiledBy.length).toBeGreaterThan(0));
  expect(compiledBy).toEqual(['A']);
});
