# @winglet/style-utils

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![CSS](https://img.shields.io/badge/css-✔-purple.svg)]()
[![Style](https://img.shields.io/badge/style-✔-green.svg)]()

---

## 개요

`@winglet/style-utils`는 자바스크립트/타입스크립트 프로젝트를 위한 포괄적인 CSS 및 스타일 관리 유틸리티 패키지입니다.

이 라이브러리는 className 조작, CSS 압축, 스코프 CSS 기능을 갖춘 범용 스타일 관리를 위한 강력한 도구들을 제공합니다. 프레임워크에 무관하게 설계되었으며, Shadow DOM을 포함한 모든 웹 환경에서 사용할 수 있습니다.

---

## 설치 방법

```bash
# npm 사용
npm install @winglet/style-utils

# yarn 사용
yarn add @winglet/style-utils
```

---

## Sub-path Imports

이 패키지는 sub-path import를 지원하여 더 세분화된 가져오기를 가능하게 하고 번들 크기를 최적화합니다. 전체 패키지를 가져오지 않고 특정 모듈을 직접 가져올 수 있습니다:

```typescript
// 메인 내보내기
import { classNames, cx, compressCss, StyleManager } from '@winglet/style-utils';

// 클래스명 유틸리티
import { classNames, cx } from '@winglet/style-utils/classNames';

// CSS 압축 유틸리티
import { compressCss } from '@winglet/style-utils/compressCss';

// 스타일 관리 유틸리티
import { destroyScope, styleManagerFactory } from '@winglet/style-utils/styleManager';
```

### 사용 가능한 Sub-path

package.json의 exports 설정을 기반으로 합니다:

- `@winglet/style-utils` - 메인 내보내기 (모든 유틸리티)
- `@winglet/style-utils/classNames` - 클래스명 조작 유틸리티 (classNames, cx)
- `@winglet/style-utils/compressCss` - CSS 압축 유틸리티
- `@winglet/style-utils/styleManager` - 스코프 스타일 관리 유틸리티

---

## 호환성 안내

이 패키지는 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

**지원 환경:**

- Node.js 14.0.0 이상
- 모던 브라우저 (ES2020 지원)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## 주요 기능

### 클래스명 관리

#### **[`classNames`](./src/utils/classNames/classNames.ts)**

명시적 인터페이스를 가진 메인 클래스명 유틸리티 함수입니다. 여러 클래스 값을 공백으로 구분된 단일 문자열로 결합하며, 중복 제거, 공백 정규화, 빈 값 필터링을 위한 구성 가능한 옵션을 제공합니다.

#### **[`cx`](./src/utils/classNames/cx.ts)**

가변 인수를 사용하는 편리한 클래스명 유틸리티입니다. 최대한의 편의성을 위해 가변 인수를 받는 classNames의 경량 래퍼입니다.

### CSS 압축

#### **[`compressCss`](./src/utils/compressCss/compressCss.ts)**

불필요한 공백, 주석, 중복 세미콜론을 제거하는 고성능 CSS 압축 유틸리티입니다. 성능과 메모리 사용량에 최적화된 단일 패스 방식을 사용합니다.

### 스타일 관리

#### **[`StyleManager`](./src/utils/styleManager/StyleManager/StyleManager.ts)**

효율적인 스타일 주입과 정리를 제공하는 스코프 CSS 관리 시스템입니다. 일반 DOM과 Shadow DOM 환경을 모두 지원하며, 스타일 충돌을 방지하기 위한 자동 스코핑 기능을 제공합니다.

#### **[`destroyScope`](./src/utils/styleManager/destroyScope.ts)**

특정 StyleManager 스코프를 파괴하고 관련된 모든 스타일을 정리하는 유틸리티 함수입니다.

#### **[`styleManagerFactory`](./src/utils/styleManager/styleManagerFactory.ts)**

일관된 구성으로 StyleManager 인스턴스를 생성하고 관리하는 팩토리 함수입니다.

---

## 사용 예제

### 클래스명 유틸리티 사용하기

```typescript
import { classNames, cx } from '@winglet/style-utils';

// 배열 문법으로 classNames 사용
const classes = classNames(['btn', 'btn-primary', { 'btn-active': isActive }]);
console.log(classes); // → 'btn btn-primary btn-active'

// 가변 인수로 cx 사용 (더 편리함)
const classes2 = cx('btn', 'btn-primary', isActive && 'btn-active');
console.log(classes2); // → 'btn btn-primary btn-active'

// 조건부 클래스와 함께 사용
const buttonClasses = cx(
  'btn',
  `btn-${variant}`,
  size && `btn-${size}`,
  {
    'btn-disabled': disabled,
    'btn-loading': loading
  }
);

// React 컴포넌트 예제
const Button = ({ variant = 'primary', size, disabled, loading, children }) => (
  <button
    className={cx(
      'btn',
      `btn-${variant}`,
      size && `btn-${size}`,
      { 'btn-disabled': disabled, 'btn-loading': loading }
    )}
  >
    {children}
  </button>
);
```

### CSS 압축 사용하기

```typescript
import { compressCss } from '@winglet/style-utils';

const originalCSS = `
  .container {
    color: red;
    background: white;
    /* 이것은 주석입니다 */
    padding: 16px;
  }
  
  .button {
    border: none;
    border-radius: 4px;
  }
`;

const compressed = compressCss(originalCSS);
console.log(compressed);
// → '.container{color:red;background:white;padding:16px}.button{border:none;border-radius:4px}'

// 파일 크기 감소 예제
console.log(`원본: ${originalCSS.length} 바이트`);
console.log(`압축: ${compressed.length} 바이트`);
console.log(
  `감소율: ${((1 - compressed.length / originalCSS.length) * 100).toFixed(1)}%`,
);
```

### 스코프 CSS를 위한 StyleManager 사용하기

```typescript
import { StyleManager } from '@winglet/style-utils';

// 스코프 스타일 매니저 가져오기
const manager = StyleManager.get('my-component');

// 컴포넌트별 스타일 추가
manager.add(
  'button-styles',
  `
  .btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn:hover {
    background: #0056b3;
  }
  
  .btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`,
);

// CSS가 자동으로 다음과 같이 스코핑됩니다:
// [data-scope="my-component"] .btn { ... }
// [data-scope="my-component"] .btn:hover { ... }
// [data-scope="my-component"] .btn:disabled { ... }

// HTML 요소에 스코프 적용
const componentElement = document.getElementById('my-component');
componentElement.dataset.scope = 'my-component';

// 동적으로 더 많은 스타일 추가
manager.add(
  'layout-styles',
  `
  .container {
    display: flex;
    gap: 1rem;
  }
`,
);

// 특정 스타일 제거
manager.remove('layout-styles');

// 컴포넌트가 언마운트될 때 모든 것 정리
manager.destroy();
```

### Shadow DOM과 함께 StyleManager 사용하기

```typescript
import { StyleManager } from '@winglet/style-utils';

// Shadow DOM을 가진 커스텀 엘리먼트 생성
class MyCustomElement extends HTMLElement {
  private shadowRoot: ShadowRoot;
  private styleManager: StyleManager;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });

    // 이 shadow root를 위한 StyleManager 생성
    this.styleManager = StyleManager.get('custom-element', {
      shadowRoot: this.shadowRoot,
    });

    this.setupStyles();
    this.render();
  }

  private setupStyles() {
    this.styleManager.add(
      'host-styles',
      `
      :host {
        display: block;
        font-family: Arial, sans-serif;
      }
    `,
    );

    this.styleManager.add(
      'component-styles',
      `
      .header {
        background: #f5f5f5;
        padding: 1rem;
        border-bottom: 1px solid #ddd;
      }
      
      .content {
        padding: 1rem;
      }
    `,
    );
  }

  private render() {
    this.shadowRoot.innerHTML = `
      <div class="header">
        <h2>커스텀 엘리먼트</h2>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  disconnectedCallback() {
    // 엘리먼트가 제거될 때 스타일 정리
    this.styleManager.destroy();
  }
}

customElements.define('my-custom-element', MyCustomElement);
```

### 동적 테마 관리

```typescript
import { StyleManager } from '@winglet/style-utils';

class ThemeManager {
  private styleManager: StyleManager;

  constructor() {
    this.styleManager = StyleManager.get('theme');
  }

  applyTheme(theme: 'light' | 'dark') {
    const colors =
      theme === 'light'
        ? {
            background: '#ffffff',
            text: '#333333',
            primary: '#007bff',
          }
        : {
            background: '#1a1a1a',
            text: '#ffffff',
            primary: '#0d6efd',
          };

    this.styleManager.add(
      'theme-colors',
      `
      :root {
        --color-background: ${colors.background};
        --color-text: ${colors.text};
        --color-primary: ${colors.primary};
      }
      
      body {
        background-color: var(--color-background);
        color: var(--color-text);
        transition: background-color 0.3s, color 0.3s;
      }
    `,
    );
  }

  addCustomStyles(id: string, css: string) {
    this.styleManager.add(id, css);
  }

  removeCustomStyles(id: string) {
    this.styleManager.remove(id);
  }
}

// 사용법
const themeManager = new ThemeManager();
themeManager.applyTheme('dark');

// body 요소에 스코프 추가
document.body.dataset.scope = 'theme';
```

### 성능 최적화 예제

```typescript
import { StyleManager, compressCss } from '@winglet/style-utils';

// 프로덕션을 위한 CSS 사전 압축
const productionCSS = compressCss(`
  .component {
    /* 개발용 주석과 포맷팅 */
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`);

// 압축된 CSS를 사용하여 압축 단계 건너뛰기
const manager = StyleManager.get('optimized-component');
manager.add('styles', productionCSS, true); // true = 이미 압축됨

// 더 나은 성능을 위한 스타일 업데이트 배치
const manager2 = StyleManager.get('batch-component');

// 이 모든 업데이트는 단일 DOM 업데이트로 배치됩니다
manager2.add('style1', '.class1 { color: red; }');
manager2.add('style2', '.class2 { color: blue; }');
manager2.add('style3', '.class3 { color: green; }');
// DOM 업데이트는 다음 애니메이션 프레임에서 발생
```

---

## API 참조

### ClassNames

#### `classNames(classes: ClassValue[], options?: ClassNamesOptions): string`

여러 클래스 값을 공백으로 구분된 단일 문자열로 결합합니다.

**매개변수:**

- `classes`: 처리할 클래스 값들의 배열
- `options`: 처리를 위한 구성 옵션

**옵션:**

- `removeDuplicates`: 중복 클래스 제거 (기본값: true)
- `normalizeWhitespace`: 공백 정규화 (기본값: true)
- `filterEmpty`: 빈 문자열 제거 (기본값: true)

#### `cx(...args: ClassValue[]): string`

성능 최적화된 기본값을 가진 classNames의 편리한 가변 인수 버전입니다.

### CSS 압축

#### `compressCss(css: string): string`

불필요한 공백과 주석을 제거하여 CSS를 압축합니다.

**매개변수:**

- `css`: 압축할 CSS 문자열

**반환값:** 압축된 CSS 문자열

### 스타일 관리

#### `StyleManager.get(scopeId: string, config?: StyleManagerConfig): StyleManager`

지정된 스코프에 대한 StyleManager 인스턴스를 가져오거나 생성합니다.

**매개변수:**

- `scopeId`: 스타일 스코프의 고유 식별자
- `config`: 선택적 구성 객체

#### `StyleManager.prototype.add(id: string, css: string, compressed?: boolean): void`

스코프에 CSS 스타일을 추가하거나 업데이트합니다.

**매개변수:**

- `id`: 스타일의 고유 식별자
- `css`: 추가할 CSS 문자열
- `compressed`: true이면 압축 건너뛰기 (기본값: false)

#### `StyleManager.prototype.remove(id: string): void`

스코프에서 특정 CSS 스타일을 제거합니다.

#### `StyleManager.prototype.destroy(): void`

StyleManager 인스턴스를 파괴하고 모든 관련 스타일을 제거합니다.

---

## 개발 환경 설정

```bash
# 저장소 클론
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# 의존성 설치
nvm use && yarn install && yarn run:all build

# 개발 빌드
yarn styleUtils build

# 테스트 실행
yarn styleUtils test
```

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 \*\*[`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

이 프로젝트에 관한 질문이나 제안이 있으시면 이슈를 생성해 주세요.
