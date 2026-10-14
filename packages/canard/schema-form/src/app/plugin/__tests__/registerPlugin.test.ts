import { beforeEach, describe, expect, it } from 'vitest';

import type { SchemaFormPlugin } from '../type';
import { PluginManager } from '../utils/PluginManager';
import { registerPlugin } from '../utils/registerPlugin';

const plugin: SchemaFormPlugin = {
  fieldInputDefinitions: [
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
    const base = PluginManager.fieldInputDefinitions.length;
    registerPlugin(plugin);
    registerPlugin(plugin);
    expect(PluginManager.fieldInputDefinitions.length).toBe(base + 1);
  });

  it('registerPlugin(null)은 플러그인 상태를 기본값으로 복원한다', () => {
    const base = PluginManager.fieldInputDefinitions.length;
    registerPlugin({
      ...plugin,
      validator: { compile: () => () => null, compileGuard: () => () => true },
    });
    expect(PluginManager.fieldInputDefinitions.length).toBe(base + 1);
    expect(PluginManager.validator).toBeDefined();
    registerPlugin(null);
    expect(PluginManager.fieldInputDefinitions.length).toBe(base);
    expect(PluginManager.validator).toBeUndefined();
  });

  it('reset 후 동일 플러그인을 재등록하면 다시 적용된다', () => {
    const base = PluginManager.fieldInputDefinitions.length;
    registerPlugin(plugin);
    registerPlugin(null);
    registerPlugin(plugin);
    expect(PluginManager.fieldInputDefinitions.length).toBe(base + 1);
  });

  it('VALIDATE-044 bind 없이 compile과 compileGuard를 가진 validator 플러그인을 등록할 수 있다', () => {
    registerPlugin({
      validator: { compile: () => () => null, compileGuard: () => () => true },
    });
    expect(PluginManager.validator?.compile).toBeTypeOf('function');
    expect(PluginManager.validator?.bind).toBeUndefined();
  });

  it('새 구조의 동일 함수는 중복이며 다른 closure는 별개다', () => {
    const base = PluginManager.fieldInputDefinitions.length;
    const component = () => null;
    const make = (Component: typeof component) => ({
      fieldInputDefinitions: [{ test: { type: 'string' as const }, Component }],
    });
    registerPlugin(make(component));
    registerPlugin(make(component));
    expect(PluginManager.fieldInputDefinitions.length).toBe(base + 1);
    registerPlugin(make(() => null));
    expect(PluginManager.fieldInputDefinitions.length).toBe(base + 2);
  });

  it('동일 플러그인의 변경된 함수 참조를 다시 반영한다', () => {
    const first = () => null;
    const second = () => null;
    const mutable = { FormLabelRenderer: first };
    registerPlugin(mutable);
    mutable.FormLabelRenderer = second;
    registerPlugin(mutable);
    expect(PluginManager.FormLabelRenderer).toBe(second);
  });
});
