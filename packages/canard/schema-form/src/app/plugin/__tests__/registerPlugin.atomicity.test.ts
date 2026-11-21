import { afterEach, expect, it } from 'vitest';

import type { SchemaFormPlugin } from '../type';
import { PluginManager } from '../utils/PluginManager';
import { registerPlugin } from '../utils/registerPlugin';

afterEach(() => {
  registerPlugin(null);
});

const Marked = () => null;

it('a registerPlugin call that throws leaves no part of that plugin applied', () => {
  registerPlugin(null);
  const renderer = PluginManager.FieldRenderer;
  const formatError = PluginManager.formatError;
  const definitions = PluginManager.fieldInputDefinitions;
  const broken = {
    FieldRenderer: Marked,
    formatError: () => 'broken',
    fieldInputDefinitions: [null],
  } as unknown as SchemaFormPlugin;
  expect(() => registerPlugin(broken)).toThrow();
  expect(PluginManager.FieldRenderer).toBe(renderer);
  expect(PluginManager.formatError).toBe(formatError);
  expect(PluginManager.fieldInputDefinitions).toBe(definitions);
});
