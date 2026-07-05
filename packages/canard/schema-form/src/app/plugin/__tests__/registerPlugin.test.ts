import { beforeEach, describe, expect, it } from 'vitest';

import { PluginManager } from '../PluginManager';
import { registerPlugin } from '../registerPlugin';
import type { SchemaFormPlugin } from '../type';

const plugin: SchemaFormPlugin = {
  formTypeInputDefinitions: [
    {
      test: { type: 'string', format: 'register-plugin-spec' },
      Component: () => null,
    },
  ],
};

describe('registerPlugin', () => {
  beforeEach(() => {
    registerPlugin(null);
  });

  it('동일 플러그인을 재등록하면 무시된다 (멱등성)', () => {
    const base = PluginManager.formTypeInputDefinitions.length;
    registerPlugin(plugin);
    registerPlugin(plugin);
    expect(PluginManager.formTypeInputDefinitions.length).toBe(base + 1);
  });

  it('registerPlugin(null)은 플러그인 상태를 기본값으로 복원한다', () => {
    const base = PluginManager.formTypeInputDefinitions.length;
    registerPlugin({
      ...plugin,
      validator: { compile: () => () => null },
    });
    expect(PluginManager.formTypeInputDefinitions.length).toBe(base + 1);
    expect(PluginManager.validator).toBeDefined();
    registerPlugin(null);
    expect(PluginManager.formTypeInputDefinitions.length).toBe(base);
    expect(PluginManager.validator).toBeUndefined();
  });

  it('reset 후 동일 플러그인을 재등록하면 다시 적용된다', () => {
    const base = PluginManager.formTypeInputDefinitions.length;
    registerPlugin(plugin);
    registerPlugin(null);
    registerPlugin(plugin);
    expect(PluginManager.formTypeInputDefinitions.length).toBe(base + 1);
  });

  it('bind 없이 compile만 가진 validator 플러그인을 등록할 수 있다', () => {
    registerPlugin({ validator: { compile: () => () => null } });
    expect(PluginManager.validator?.compile).toBeTypeOf('function');
    expect(PluginManager.validator?.bind).toBeUndefined();
  });
});
