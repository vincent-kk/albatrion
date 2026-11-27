import { afterEach, expect, it } from 'vitest';

import type { SchemaFormPlugin } from '../type';
import { PluginManager } from '../utils/PluginManager';
import { registerPlugin } from '../utils/registerPlugin';

const Renderer = () => null;
const validator = { compile: () => () => null, compileGuard: () => () => true };
const formatError = () => 'message';

class Plugin implements SchemaFormPlugin {
  get FieldRenderer() {
    return Renderer;
  }
  get validator() {
    return validator;
  }
  get formatError() {
    return formatError;
  }
}

afterEach(() => registerPlugin(null));

it.each(['plain', 'instance', 'namespace'] as const)(
  'structural %s has the same registered configuration',
  async (kind) => {
    const plugin =
      kind === 'plain'
        ? { FieldRenderer: Renderer, validator, formatError }
        : kind === 'instance'
          ? new Plugin()
          : await import('./fixtures/structuralPlugin.round-four');
    registerPlugin(plugin);
    expect(PluginManager.FieldRenderer).toBe(
      kind === 'namespace' ? plugin.FieldRenderer : Renderer,
    );
    expect(PluginManager.validator).toBe(plugin.validator);
    expect(PluginManager.formatError).toBe(plugin.formatError);
  },
);
