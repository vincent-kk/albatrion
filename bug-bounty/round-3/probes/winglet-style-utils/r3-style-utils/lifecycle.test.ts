import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const flush = () => vi.advanceTimersByTime(20);
const styleTexts = (scope: string) =>
  Array.from(document.querySelectorAll(`style.${scope}`)).map(
    (element) => element.textContent ?? '',
  );

type Api = typeof import('../../index');
const loadCopy = async (): Promise<Api> => {
  vi.resetModules();
  return import('../../index');
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  document.head.innerHTML = '';
});

describe('destroy while an injection is pending (LC2)', () => {
  it('destroyScope between add and the flush, then a new factory, injects only the new CSS', async () => {
    const { destroyScope, styleManagerFactory } = await loadCopy();
    styleManagerFactory('lcpending')('x', '.old { color: red; }');
    destroyScope('lcpending');
    styleManagerFactory('lcpending')('x', '.new { color: blue; }');
    flush();
    expect(styleTexts('lcpending')).toEqual(['.lcpending .new{color:blue}']);
    destroyScope('lcpending');
  });

  it('destroyScope from a frame callback queued before the flush cancels that flush', async () => {
    const { destroyScope, styleManagerFactory } = await loadCopy();
    const add = styleManagerFactory('lcframe');
    requestAnimationFrame(() => {
      destroyScope('lcframe');
      styleManagerFactory('lcframe')('x', '.again { color: blue; }');
    });
    add('x', '.first { color: red; }');
    flush();
    flush();
    expect(styleTexts('lcframe')).toEqual(['.lcframe .again{color:blue}']);
    destroyScope('lcframe');
  });

  it('a cleanup called twice and a remove of an unknown id leave other styles intact', async () => {
    const { destroyScope, styleManagerFactory } = await loadCopy();
    const add = styleManagerFactory('lccleanup');
    const removeA = add('a', '.a { color: red; }');
    add('b', '.b { color: blue; }');
    flush();
    removeA();
    removeA();
    flush();
    expect(styleTexts('lccleanup')).toEqual(['.lccleanup .b{color:blue}']);
    destroyScope('lccleanup');
  });
});

describe('two copies of the package on one page (EQ3)', () => {
  it('each copy owns its own registry, as the module-level registry documents', async () => {
    const first = await loadCopy();
    const second = await loadCopy();
    expect(first.styleManagerFactory).not.toBe(second.styleManagerFactory);
    first.styleManagerFactory('lccopies')('x', '.a { color: red; }');
    second.styleManagerFactory('lccopies')('x', '.a { color: blue; }');
    flush();
    expect(styleTexts('lccopies')).toEqual([
      '.lccopies .a{color:red}',
      '.lccopies .a{color:blue}',
    ]);
    second.destroyScope('lccopies');
    expect(styleTexts('lccopies')).toEqual(['.lccopies .a{color:red}']);
    first.destroyScope('lccopies');
    expect(styleTexts('lccopies')).toEqual([]);
  });
});
