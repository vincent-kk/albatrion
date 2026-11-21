import { expect, it, vi } from 'vitest';

import { getScopedPluginManager } from '../utils/getScopedPluginManager';
import { registerPlugin } from '../utils/registerPlugin';

it('round-3: compatible module copies share the same explicit scope and deduplication', async () => {
  const scope = Symbol('application');
  const formatter = () => 'scoped';
  const plugin = { formatError: formatter };
  registerPlugin(plugin, { scope });
  vi.resetModules();
  const copy = {
    ...(await import('../utils/registerPlugin')),
    ...(await import('../utils/getScopedPluginManager')),
  };
  expect(copy.getScopedPluginManager(scope).formatError).toBe(formatter);
  copy.registerPlugin(plugin, { scope });
  copy.registerPlugin(null, { scope });
  expect(getScopedPluginManager(scope).formatError).not.toBe(formatter);
  registerPlugin(plugin, { scope });
  expect(copy.getScopedPluginManager(scope).formatError).toBe(formatter);
  registerPlugin(null, { scope });
});
