import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { StyleManager } from '../StyleManager';

// CSSStyleSheet 모킹 (JSDOM은 이를 지원하지 않음)
const mockCSSStyleSheet = () => {
  if (typeof CSSStyleSheet === 'undefined') {
    (global as any).CSSStyleSheet = class {
      private rules: string = '';

      replaceSync(text: string) {
        this.rules = text;
      }

      get cssRules() {
        return this.rules;
      }
    };
  }
};

// adoptedStyleSheets 모킹
const mockAdoptedStyleSheets = () => {
  if (!('adoptedStyleSheets' in document)) {
    let adoptedSheets: CSSStyleSheet[] = [];
    Object.defineProperty(document, 'adoptedStyleSheets', {
      get() {
        return adoptedSheets;
      },
      set(sheets) {
        adoptedSheets = sheets;
      },
      configurable: true,
    });
  }
};

describe('StyleManager', () => {
  beforeEach(() => {
    // 테스트 환경 초기화
    mockCSSStyleSheet();
    mockAdoptedStyleSheets();

    // 기존 스타일 정리
    document.head.innerHTML = '';
    document.adoptedStyleSheets = [];

    // StyleManager 인스턴스 캐시 초기화
    (StyleManager as any).__SHEETS__.clear();
  });

  describe('일반 DOM 환경', () => {
    test('동일한 scopeId에 대해 싱글톤 인스턴스를 반환해야 함', () => {
      const manager1 = StyleManager.get('test-scope');
      const manager2 = StyleManager.get('test-scope');

      expect(manager1).toBe(manager2);
    });

    test('스타일을 추가하고 DOM에 적용되어야 함', () => {
      const manager = StyleManager.get('test-scope');
      vi.useFakeTimers();
      manager.add(
        'button-style',
        `
        .btn { color: blue; }
        .btn:hover { color: red; }
      `,
      );

      // requestAnimationFrame 강제 실행
      vi.runAllTimers();

      // CSSStyleSheet를 지원하는 경우
      if ('replaceSync' in CSSStyleSheet.prototype) {
        expect(document.adoptedStyleSheets.length).toBe(1);
      } else {
        // 폴백: style 엘리먼트 확인
        const styleEl = document.querySelector('style.test-scope');
        expect(styleEl).toBeTruthy();
        expect(styleEl?.textContent).toContain('.test-scope .btn');
      }
    });

    test('스타일 제거가 정상 동작해야 함', () => {
      const manager = StyleManager.get('test-scope');
      vi.useFakeTimers();
      manager.add('style1', '.class1 { color: red; }');
      manager.add('style2', '.class2 { color: blue; }');
      vi.runAllTimers();

      manager.remove('style1');
      vi.runAllTimers();

      const styleContent = getAppliedStyles(manager);
      expect(styleContent).not.toContain('.class1');
      expect(styleContent).toContain('.test-scope');
    });

    test('destroy()가 모든 리소스를 정리해야 함', () => {
      vi.useFakeTimers();
      const manager = StyleManager.get('test-scope');
      manager.add('style', '.test { color: red; }');
      vi.runAllTimers();

      manager.destroy();

      // 레지스트리에서 제거 확인
      const newManager = StyleManager.get('test-scope');
      expect(newManager).not.toBe(manager);

      // DOM에서 스타일 제거 확인
      if ('adoptedStyleSheets' in document) {
        expect(document.adoptedStyleSheets.length).toBe(0);
      } else {
        const styleEl = (document as Document).querySelector(
          'style.test-scope',
        );
        expect(styleEl).toBeFalsy();
      }
    });

    test('CSS 스코핑이 올바르게 동작해야 함', () => {
      const manager = StyleManager.get('test-scope');
      vi.useFakeTimers();
      manager.add(
        'scoped',
        `
        .btn { color: blue; }
        @media (max-width: 768px) {
          .btn { color: red; }
        }
        :root { --color: green; }
      `,
      );
      vi.runAllTimers();

      const styleContent = getAppliedStyles(manager);

      // 일반 셀렉터는 스코프가 추가됨
      expect(styleContent).toContain('.test-scope .btn');

      // @media는 스코프 없이 유지
      expect(styleContent).toContain('@media');

      // :root는 스코프 없이 유지
      expect(styleContent).toContain(':root');
    });
  });

  describe('Shadow DOM 환경', () => {
    let shadowHost: HTMLElement;
    let shadowRoot: ShadowRoot;

    beforeEach(() => {
      shadowHost = document.createElement('div');
      document.body.appendChild(shadowHost);
      vi.useFakeTimers();
      // ShadowRoot 모킹 (JSDOM은 Shadow DOM을 완전히 지원하지 않음)
      if (!shadowHost.attachShadow) {
        shadowRoot = {
          appendChild: vi.fn(),
          adoptedStyleSheets: [],
          host: shadowHost,
          mode: 'open' as ShadowRootMode,
        } as any;

        shadowHost.attachShadow = vi.fn(() => shadowRoot);
      } else {
        shadowRoot = shadowHost.attachShadow({ mode: 'open' });
      }

      // adoptedStyleSheets 지원 추가
      if (!('adoptedStyleSheets' in shadowRoot)) {
        let adoptedSheets: CSSStyleSheet[] = [];
        Object.defineProperty(shadowRoot, 'adoptedStyleSheets', {
          get() {
            return adoptedSheets;
          },
          set(sheets) {
            adoptedSheets = sheets;
          },
          configurable: true,
        });
      }
    });

    afterEach(() => {
      shadowHost.remove();
    });

    test('Shadow DOM에서 싱글톤 인스턴스를 반환해야 함', () => {
      const manager1 = StyleManager.get('shadow-scope', { shadowRoot });
      const manager2 = StyleManager.get('shadow-scope', { shadowRoot });

      expect(manager1).toBe(manager2);
    });

    test('다른 Shadow Root는 다른 인스턴스를 가져야 함', () => {
      const otherHost = document.createElement('div');
      const otherShadowRoot = otherHost.attachShadow({ mode: 'open' }) as any;

      const manager1 = StyleManager.get('shadow-scope', { shadowRoot });
      const manager2 = StyleManager.get('shadow-scope', {
        shadowRoot: otherShadowRoot,
      });

      expect(manager1).not.toBe(manager2);
    });

    test('Shadow DOM에서는 CSS 스코핑을 하지 않아야 함', () => {
      const manager = StyleManager.get('shadow-scope', { shadowRoot });
      vi.useFakeTimers();
      manager.add('shadow-style', '.btn { color: blue; }');
      vi.runAllTimers();

      const styleContent = getShadowStyles(shadowRoot);

      // 스코프 접두사가 없어야 함
      expect(styleContent).toContain('.btn{color:blue}');
      expect(styleContent).not.toContain('.shadow-scope');
    });

    test('Shadow DOM에서 destroy()가 정상 동작해야 함', () => {
      const manager = StyleManager.get('shadow-scope', { shadowRoot });
      manager.add('style', '.test { color: red; }');
      vi.runAllTimers();

      const initialStyleCount =
        shadowRoot.adoptedStyleSheets?.length ||
        shadowRoot.querySelectorAll('style').length;
      expect(initialStyleCount).toBeGreaterThan(0);

      manager.destroy();

      const finalStyleCount =
        shadowRoot.adoptedStyleSheets?.length ||
        shadowRoot.querySelectorAll('style').length;
      expect(finalStyleCount).toBe(0);
    });
  });

  describe('성능 및 최적화', () => {
    test('동일한 스타일은 DOM을 업데이트하지 않아야 함', () => {
      const manager = StyleManager.get('perf-scope');
      const css = '.test { color: red; }';
      vi.useFakeTimers();
      manager.add('style1', css);
      vi.runAllTimers();

      // DOM 업데이트 감시
      const updateSpy = vi.spyOn(manager as any, '__applyCSS__');

      // 동일한 스타일 다시 추가
      manager.add('style1', css);
      vi.runAllTimers();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    test('여러 스타일 변경이 배치 처리되어야 함', () => {
      const manager = StyleManager.get('batch-scope');
      const applyCSSSpy = vi.spyOn(manager as any, '__applyCSS__');

      // 연속적인 스타일 추가
      manager.add('style1', '.class1 { color: red; }');
      manager.add('style2', '.class2 { color: blue; }');
      manager.add('style3', '.class3 { color: green; }');

      // requestAnimationFrame 전에는 적용되지 않음
      expect(applyCSSSpy).not.toHaveBeenCalled();

      // 배치 적용
      vi.runAllTimers();

      // 한 번만 DOM 업데이트
      expect(applyCSSSpy).toHaveBeenCalledTimes(1);
    });
  });
});

// 헬퍼 함수들
function getAppliedStyles(manager: StyleManager): string {
  const privateManager = manager as any;

  if (privateManager.__sheet__) {
    return privateManager.__sheet__.cssRules || '';
  }

  const styleEl = document.querySelector(`style.${privateManager.scopeId}`);
  return styleEl?.textContent || '';
}

function getShadowStyles(shadowRoot: ShadowRoot): string {
  if (shadowRoot.adoptedStyleSheets?.length > 0) {
    return (shadowRoot.adoptedStyleSheets[0] as any).cssRules || '';
  }

  const styleEl = shadowRoot.querySelector('style');
  return styleEl?.textContent || '';
}
