import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * setImmediate 만 제공하고 clearImmediate 는 제공하지 않는 폴리필 환경에서도
 * scheduler 서브패스가 임포트되어야 한다. 팩토리가 모듈 최상위에서 즉시 실행되므로
 * 여기서 던지면 특정 함수가 아니라 서브패스 전체가 사용 불가가 된다.
 */
describe('scheduler modules with a partial setImmediate polyfill', () => {
  const globalScope = globalThis as unknown as Record<string, unknown>;
  const nativeSetImmediate = globalScope.setImmediate;
  const nativeClearImmediate = globalScope.clearImmediate;

  beforeEach(() => {
    vi.resetModules();
    globalScope.setImmediate = (callback: () => void) =>
      setTimeout(callback, 0);
    delete globalScope.clearImmediate;
  });

  afterEach(() => {
    globalScope.setImmediate = nativeSetImmediate;
    globalScope.clearImmediate = nativeClearImmediate;
    vi.resetModules();
  });

  it('should import scheduleMacrotask without a clearImmediate global', async () => {
    const module = await import('../scheduleMacrotask');

    expect(typeof module.scheduleMacrotask).toBe('function');
    expect(typeof module.cancelMacrotask).toBe('function');
  });

  it('should import scheduleMacrotaskSafe without a clearImmediate global', async () => {
    const module = await import('../scheduleMacrotaskSafe');

    expect(typeof module.scheduleMacrotaskSafe).toBe('function');
    expect(typeof module.cancelMacrotaskSafe).toBe('function');
  });
});
