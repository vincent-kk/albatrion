# @winglet/style-utils 명세

> 포괄적인 CSS 및 스타일 관리 유틸리티: className 조합, 런타임 CSS 압축, Shadow DOM을 지원하는 스코프 스타일 관리.

## 개요

`@winglet/style-utils`는 런타임 의존성이 없는 framework-agnostic 유틸리티 패키지입니다. 세 가지 관심사를 하나의 tree-shaking 친화적 API로 묶어 제공합니다.

1. **`className` 조합** — 완전 기능의 `cx`와 경량 `cxLite`로 조건부 className 문자열을 생성합니다.
2. **CSS 압축** — `compressCss`로 단일 패스 런타임 최소화를 수행합니다.
3. **스코프 스타일 관리** — `styleManagerFactory`와 `destroyScope`로 `Document` 또는 `ShadowRoot`에 대해 CSS를 주입·갱신·제거하며, 자동 셀렉터 스코핑과 `requestAnimationFrame` 기반 DOM 쓰기 배칭을 제공합니다.

패키지는 ESM과 CJS 빌드를 모두 배포하고, `"sideEffects": false`를 선언하며, 세분화된 사용을 위해 sub-path import를 지원합니다.

---

## 목차

1. [설치](#설치)
2. [빠른 시작](#빠른-시작)
3. [아키텍처](#아키텍처)
4. [핵심 API](#핵심-api)
5. [타입 정의](#타입-정의)
6. [사용 패턴](#사용-패턴)
7. [고급 예제](#고급-예제)
8. [호환성](#호환성)
9. [라이선스](#라이선스)

---

## 설치

```bash
# npm
npm install @winglet/style-utils

# yarn
yarn add @winglet/style-utils

# pnpm
pnpm add @winglet/style-utils
```

### Sub-path Imports

| 진입점 | 노출 심볼 |
|--------|-----------|
| `@winglet/style-utils` | 모든 심볼 |
| `@winglet/style-utils/style-manager` | `styleManagerFactory`, `destroyScope` |
| `@winglet/style-utils/util` | `cx`, `cxLite`, `compressCss` |

---

## 빠른 시작

```typescript
import {
  cx,
  cxLite,
  compressCss,
  styleManagerFactory,
  destroyScope,
} from '@winglet/style-utils';

// 1. className 조합
const className = cx(
  'btn',
  `btn-${variant}`,
  { 'btn-disabled': disabled, 'btn-loading': loading },
);

// 2. 런타임 CSS 압축
const minified = compressCss('.card { padding: 16px; /* note */ }');
// -> '.card{padding:16px}'

// 3. 스코프 스타일 관리
const addStyle = styleManagerFactory('my-component');
const cleanup = addStyle('button', '.btn { color: white; background: blue; }');

// ...나중에
cleanup();                       // 해당 스타일만 제거
destroyScope('my-component');    // 스코프 전체 정리
```

---

## 아키텍처

```
@winglet/style-utils/
├── src/
│   ├── index.ts                        # 전체 배럴
│   ├── utils/
│   │   ├── index.ts                    # /util 배럴
│   │   ├── cx/
│   │   │   ├── cx.ts                   # cx() + getSegment() 헬퍼
│   │   │   ├── cxLite.ts               # cxLite()
│   │   │   ├── type.ts                 # ClassValue, ClassArray, ClassObject
│   │   │   └── index.ts                # 배럴
│   │   └── compressCss/
│   │       ├── compressCss.ts          # 바이트 수준 최소화기
│   │       └── index.ts                # 배럴
│   └── styleManager/
│       ├── index.ts                    # /style-manager 배럴
│       ├── styleManagerFactory.ts      # 커리드 팩토리
│       ├── destroyScope.ts             # 정리 헬퍼
│       └── StyleManager/
│           ├── StyleManager.ts         # 싱글톤 클래스
│           ├── type.ts                 # StyleManagerConfig, StyleRoot
│           └── index.ts                # 배럴
```

### 설계 노트

- **스코프별 싱글톤**: `StyleManager.get(scopeId, config)`는 (shadow root가 주어지면 그 단위로) 스코프당 공유 인스턴스를 반환합니다. 동일한 `scopeId`에 대한 여러 팩토리는 같은 스타일시트를 사용합니다.
- **배칭 쓰기**: `add`와 `remove`는 dirty 플래그만 설정합니다. 단일 `requestAnimationFrame` flush에서 활성 규칙을 모두 결합해 `CSSStyleSheet.replaceSync`(또는 `<style>.textContent` 폴백)로 한 번에 씁니다.
- **셀렉터 스코핑**: `@`-rule과 정확히 `:root` / `:host`인 셀렉터를 제외하면 모든 셀렉터 앞에 `.scopeId `를 붙입니다. Shadow root 모드에서는 prefix를 전혀 추가하지 않습니다.
- **듀얼 DOM 경로**: 모던 브라우저는 `adoptedStyleSheets`를 사용하고, 구형 환경에서는 `document.head`(또는 shadow 모드에서는 shadow root 안)에 `<style>` 요소를 추가합니다.

---

## 핵심 API

### ClassNames

#### `cx(...args: ClassValue[]): string`

조건부로 className을 조합합니다. 문자열, 숫자, 불리언, 객체(truthy 키만), 중첩 배열을 지원합니다.

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `args` | `ClassValue[]` | 가변 개수의 class value 입력 |

**반환값:** 앞뒤 공백 없이 공백으로 구분된 class 문자열.

```typescript
cx('btn', { primary: true, disabled: false }, ['large', condition && 'active']);
// 'btn primary large' (condition이 falsy일 때)
```

#### `cxLite(...args: ClassValue[]): string`

경량 버전: 최상위 truthy 필터링만 수행합니다. 객체나 배열로 재귀하지 않습니다.

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `args` | `ClassValue[]` | 주로 문자열과 숫자 |

**반환값:** 공백으로 구분된 class 문자열.

```typescript
cxLite('btn', isActive && 'active', size && `btn-${size}`);
// 'btn active btn-lg'
```

### CSS 압축

#### `compressCss(css: string): string`

단일 패스 CSS 최소화기입니다. 공백, 블록 주석, `}` 앞의 중복 세미콜론을 제거합니다. 완벽한 압축보다는 처리량을 우선하므로, 중첩 블록 내부의 미세한 꼬리 공백은 남을 수 있습니다.

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `css` | `string` | 소스 CSS |

**반환값:** 최소화된 CSS. 빈 입력은 빈 문자열을 반환합니다.

```typescript
compressCss('.x { color: red; /* keep? no */ background: blue; }');
// '.x{color:red;background:blue}'
```

### 스타일 관리

#### `styleManagerFactory(scopeId, config?)`

```typescript
function styleManagerFactory(
  scopeId: string,
  config?: StyleManagerConfig,
): (styleId: string, cssString: string, compress?: boolean) => () => void;
```

단일 스코프에 바인딩된 커리드 `addStyle` 함수를 반환합니다.

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `scopeId` | `string` | 스코프 식별자이자 CSS 클래스 prefix |
| `config.shadowRoot` | `ShadowRoot?` | 선택적 Shadow DOM 대상 |

**반환되는 `addStyle`:**

| 인자 | 타입 | 설명 |
|------|------|------|
| `styleId` | `string` | 스코프 내 고유 키 |
| `cssString` | `string` | CSS 소스 |
| `compress` | `boolean?` | `cssString`이 이미 최소화된 경우 `true` |

**반환값:** `() => void` — `styleId`를 스코프에서 제거하는 정리 함수.

```typescript
const addStyle = styleManagerFactory('header');
const cleanup = addStyle('title', '.title { font-size: 20px; }');
cleanup();
```

#### `destroyScope(scopeId): void`

```typescript
function destroyScope(scopeId: string): void;
```

`scopeId`에 등록된 document-root `StyleManager`를 해체합니다.

1. 예약된 애니메이션 프레임을 취소합니다.
2. 스코프의 `CSSStyleSheet`를 `document.adoptedStyleSheets`에서 제거합니다(모던 경로).
3. 폴백 `<style>` 요소를 제거합니다(레거시 경로).
4. 캐시된 스타일을 초기화합니다.
5. 레지스트리 항목을 삭제합니다.

Shadow root 키로 관리되는 인스턴스는 `ShadowRoot` 단위로 존재하며 `destroyScope`로 직접 대상으로 삼지 않습니다. 개별 스타일 정리 함수를 호출하거나 shadow root의 가비지 컬렉션에 맡깁니다.

```typescript
destroyScope('header'); // 전체 정리
```

---

## 타입 정의

### `ClassValue`

```typescript
export type ClassObject = { [key: string]: ClassValue };
export type ClassArray = Array<ClassValue>;
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassArray
  | ClassObject;
```

### `StyleManagerConfig`

```typescript
export interface StyleManagerConfig {
  /** 스타일을 부착할 shadow root. 생략 시 document 사용. */
  shadowRoot?: ShadowRoot;
}
```

### `StyleRoot`

```typescript
export type StyleRoot = Document | ShadowRoot;
```

---

## 사용 패턴

### React에서의 조건부 ClassNames

```tsx
import { cx } from '@winglet/style-utils';

export function Button({ variant = 'primary', size, disabled, loading, children }) {
  return (
    <button
      className={cx('btn', `btn-${variant}`, size && `btn-${size}`, {
        'btn-disabled': disabled,
        'btn-loading': loading,
      })}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### 컴포넌트 스코프 스타일

```typescript
import { styleManagerFactory, destroyScope } from '@winglet/style-utils';

const scopeId = 'my-widget';
const addStyle = styleManagerFactory(scopeId);

const removeButton = addStyle('button', `
  .btn { background: #1677ff; color: #fff; padding: 8px 16px; }
  .btn:hover { background: #0f5fcb; }
`);

// 트리의 어딘가에 스코프 클래스를 적용
document.getElementById('widget-root')!.classList.add(scopeId);

// 정리
removeButton();
destroyScope(scopeId);
```

### Shadow DOM 통합

```typescript
class MyCard extends HTMLElement {
  private shadow = this.attachShadow({ mode: 'open' });
  private cleanups: Array<() => void> = [];

  constructor() {
    super();
    const addStyle = styleManagerFactory('my-card', { shadowRoot: this.shadow });
    this.cleanups.push(addStyle('host', ':host { display: block; border-radius: 8px; }'));
    this.cleanups.push(addStyle('content', '.content { padding: 16px; }'));
  }

  connectedCallback() {
    this.shadow.innerHTML = '<div class="content"><slot></slot></div>';
  }

  disconnectedCallback() {
    this.cleanups.forEach((fn) => fn());
  }
}
customElements.define('my-card', MyCard);
```

---

## 고급 예제

### 테마 매니저

```typescript
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';

class ThemeManager {
  private readonly addStyle = styleManagerFactory('theme');
  private removeTheme: (() => void) | null = null;

  applyTheme(mode: 'light' | 'dark') {
    const vars = mode === 'light'
      ? '--bg:#fff; --fg:#111; --primary:#1677ff;'
      : '--bg:#0f0f10; --fg:#f5f5f5; --primary:#4096ff;';
    this.removeTheme?.();
    this.removeTheme = this.addStyle('vars', `:root { ${vars} } body { background: var(--bg); color: var(--fg); }`);
  }

  destroy() {
    this.removeTheme?.();
    destroyScope('theme');
  }
}
```

### 미리 압축된 핫패스

```typescript
import { compressCss, styleManagerFactory } from '@winglet/style-utils';

const CARD_CSS = compressCss(`
  .card { display: flex; flex-direction: column; gap: 1rem; padding: 16px; }
  .card .title { font-size: 1.125rem; font-weight: 600; }
`);

const addStyle = styleManagerFactory('card');
addStyle('base', CARD_CSS, /* compressed */ true);
```

### 배칭된 업데이트

```typescript
const addStyle = styleManagerFactory('dashboard');

// 같은 tick에 이루어진 모든 호출은 다음 프레임에 단일 DOM 쓰기로 합쳐집니다.
const cleanups = [
  addStyle('layout', layoutCss),
  addStyle('typography', typographyCss),
  addStyle('colors', colorsCss),
  addStyle('responsive', responsiveCss),
];
```

---

## 호환성

- **언어**: ECMAScript 2020
- **런타임**: Node.js 14+ (SSR/도구용), ES2020을 지원하는 모던 브라우저
- **사용되는 브라우저 DOM API**: `requestAnimationFrame`, `cancelAnimationFrame`, `CSSStyleSheet.replaceSync`(선택, 폴백 제공), `document.adoptedStyleSheets`(선택), `TextEncoder` / `TextDecoder`(`compressCss`에 사용)

레거시 환경: Babel로 트랜스파일하고 `requestAnimationFrame`과 (필요 시) `TextEncoder` 폴리필을 제공하세요.

---

## 라이선스

MIT License. 전체 내용은 패키지의 `LICENSE` 파일을 참고하세요.
