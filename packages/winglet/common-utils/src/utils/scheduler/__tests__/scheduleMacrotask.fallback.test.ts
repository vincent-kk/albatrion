import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `globalThis.setImmediate` 가 없는 브라우저 형태에서 `scheduleMacrotask` 는
 * MessageChannelScheduler 로 폴백한다. 그 경로가 태스크를 유실하지 않는지 검증한다 —
 * 네이티브 setImmediate 가 있는 Node 기본 실행에서는 이 경로를 전혀 타지 않는다.
 */
describe('scheduleMacrotask — MessageChannel fallback', () => {
  const globalScope = globalThis as unknown as Record<string, unknown>;
  const nativeSetImmediate = globalScope.setImmediate;
  const nativeClearImmediate = globalScope.clearImmediate;

  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

  beforeEach(() => {
    vi.resetModules();
    delete globalScope.setImmediate;
    delete globalScope.clearImmediate;
  });

  afterEach(() => {
    globalScope.setImmediate = nativeSetImmediate;
    globalScope.clearImmediate = nativeClearImmediate;
    vi.resetModules();
  });

  it('flush 이후 마이크로태스크에서 등록된 태스크도 실행되어야 합니다', async () => {
    const { scheduleMacrotask } = await import('../scheduleMacrotask');
    const executed: string[] = [];

    scheduleMacrotask(() => executed.push('first'));
    await Promise.resolve();
    scheduleMacrotask(() => executed.push('second'));
    await settle();

    expect(executed).toEqual(['first', 'second']);
  });

  it('마지막 대기 태스크를 취소해도 이후 스케줄이 실행되어야 합니다', async () => {
    const { scheduleMacrotask, cancelMacrotask } = await import(
      '../scheduleMacrotask'
    );
    const executed: string[] = [];

    cancelMacrotask(scheduleMacrotask(() => executed.push('cancelled')));
    await settle();

    scheduleMacrotask(() => executed.push('after'));
    await settle();

    expect(executed).toEqual(['after']);
  });
});
