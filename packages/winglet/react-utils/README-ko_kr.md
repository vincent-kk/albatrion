# @winglet/react-utils

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()

---

## 개요

`@winglet/react-utils`는 React 애플리케이션 개발 시 자주 사용되는 유틸리티 함수, 훅(hooks), 고차 컴포넌트(HOC)를 제공하는 라이브러리입니다. 이 패키지는 컴포넌트의 재사용성을 높이고, React의 기본 기능을 확장하여 더 효율적인 개발 경험을 제공합니다.

주요 기능으로는 커스텀 훅, 에러 바운더리, 포털 지원, 컴포넌트 타입 체킹 등이 포함되어 있습니다.

---

## 설치 방법

```bash
# npm 사용
npm install @winglet/react-utils

# yarn 사용
yarn add @winglet/react-utils
```

---

## Sub-path Imports

이 패키지는 sub-path import를 지원하여 더 세분화된 가져오기를 가능하게 하고 번들 크기를 최적화합니다. 전체 패키지를 가져오지 않고 특정 모듈을 직접 가져올 수 있습니다:

```typescript
// 메인 내보내기
import { useConstant, useWindowSize } from '@winglet/react-utils';
// 필터 유틸리티 (React 컴포넌트 타입 검사)
import { isReactComponent, isReactElement } from '@winglet/react-utils/filter';
// 고차 컴포넌트
import { withErrorBoundary, withUploader } from '@winglet/react-utils/hoc';
// 커스텀 훅
import { useMemorize, useOnMount } from '@winglet/react-utils/hook';
// 객체 유틸리티
import { extractProps, mergeRefs } from '@winglet/react-utils/object';
// Portal 컴포넌트
import { Portal } from '@winglet/react-utils/portal';
// 렌더링 유틸리티
import { renderComponent } from '@winglet/react-utils/render';
```

### 사용 가능한 Sub-path

package.json의 exports 설정을 기반으로 합니다:

- `@winglet/react-utils` - 메인 내보내기 (훅과 컴포넌트)
- `@winglet/react-utils/hook` - 커스텀 React 훅 (useConstant, useWindowSize, useOnMount 등)
- `@winglet/react-utils/hoc` - 고차 컴포넌트 (withErrorBoundary, withUploader)
- `@winglet/react-utils/portal` - Portal 컴포넌트 및 유틸리티 (Portal 컴포넌트)
- `@winglet/react-utils/filter` - React 컴포넌트 타입 검사 유틸리티 (isReactComponent, isReactElement 등)
- `@winglet/react-utils/object` - React 전용 객체 유틸리티 (extractProps, mergeRefs)
- `@winglet/react-utils/render` - 컴포넌트 렌더링 유틸리티 (renderComponent)
- `@winglet/react-utils/style-manager` - 스타일 관리 유틸리티 (styleManagerFactory, destroyScope)

---

## 호환성 안내

이 패키지는 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

**지원 환경:**

- Node.js 14.0.0 이상
- 모던 브라우저 (ES2020 지원)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

**대상 패키지**

- `@winglet/react-utils`
- `@winglet/common-utils`

---

## 주요 기능

### 훅(Hooks)

React 기능을 확장하는 다양한 커스텀 훅을 제공합니다.

#### 상태 관리 및 참조

- [`useConstant`](./src/hooks/useConstant.ts) - 컴포넌트 생명주기 동안 변하지 않는 상수 값을 제공합니다.
- [`useMemorize`](./src/hooks/useMemorize.ts) - useMemo와 유사하지만 더 직관적인 사용법을 제공합니다.
- [`useReference`](./src/hooks/useReference.ts) - 참조 객체를 관리합니다.
- [`useSnapshot`](./src/hooks/useSnapshot.ts) - 값의 스냅샷을 생성하고 관리합니다.
- [`useVersion`](./src/hooks/useVersion.ts) - 컴포넌트의 버전 상태를 관리합니다.

#### 생명주기 관리

- [`useOnMount`](./src/hooks/useOnMount.ts) - 컴포넌트가 마운트될 때 호출되는 훅입니다.
- [`useOnUnmount`](./src/hooks/useOnUnmount.ts) - 컴포넌트가 언마운트될 때 호출되는 훅입니다.
- [`useEffectUntil`](./src/hooks/useEffectUntil.ts) - 조건이 충족될 때까지 useEffect를 실행합니다.
- [`useLayoutEffectUntil`](./src/hooks/useLayoutEffectUntil.ts) - 조건이 충족될 때까지 useLayoutEffect를 실행합니다.

#### 유틸리티 훅

- [`useWindowSize`](./src/hooks/useWindowSize.ts) - 브라우저 창의 크기를 추적합니다.
- [`useHandle`](./src/hooks/useHandle.ts) - 함수 핸들러를 관리합니다.
- [`useRestProperties`](./src/hooks/useRestProperties.ts) - 객체에서 특정 속성을 제외한 나머지를 관리합니다.

### 컴포넌트

- [`Portal`](./src/components/Portal/index.ts) - 컴포넌트를 포털 컨텍스트로 감싸는 기능을 제공하는 컴포넌트입니다.

### 고차 컴포넌트(HOC)

컴포넌트를 기능적으로 확장하는 HOC를 제공합니다.

- [`withErrorBoundary`](./src/hoc/withErrorBoundary/withErrorBoundary.tsx) - 컴포넌트에 에러 바운더리를 추가합니다.
- [`withUploader`](./src/hoc/withUploader/index.ts) - 파일 업로드 기능을 컴포넌트에 추가합니다.

### 유틸리티 함수

React 컴포넌트 작업을 위한 다양한 유틸리티 함수를 제공합니다.

#### 컴포넌트 타입 체크

- [`isReactComponent`](./src/utils/filter/isReactComponent.ts) - 객체가 React 컴포넌트인지 확인합니다.
- [`isReactElement`](./src/utils/filter/isReactElement.ts) - 객체가 React 엘리먼트인지 확인합니다.
- [`isClassComponent`](./src/utils/filter/isClassComponent.ts) - 객체가 클래스 컴포넌트인지 확인합니다.
- [`isFunctionComponent`](./src/utils/filter/isFunctionComponent.ts) - 객체가 함수형 컴포넌트인지 확인합니다.
- [`isMemoComponent`](./src/utils/filter/isMemoComponent.ts) - 객체가 메모이제이션된 컴포넌트인지 확인합니다.

#### 렌더링 유틸리티

- [`renderComponent`](./src/utils/render/renderComponent.tsx) - 다양한 타입의 컴포넌트를 적절히 렌더링합니다.

#### 스타일 관리

- [`styleManagerFactory`](./src/utils/styleManager/styleManagerFactory.ts) - 스타일 관리 유틸리티를 생성합니다.
- [`destroyScope`](./src/utils/styleManager/destroyScope.ts) - 정의한 스타일을 제거합니다.
- [`dataCondition`](./src/utils/styleManager/utils/dataCondition.ts) - 불리언 조건을 React 호환 가능한 속성 값으로 변환합니다. (truthy -> true, falsy -> undefined)
- [`dataAttributes`](./src/utils/styleManager/utils/dataAttributes.ts) - 불리언 값의 레코드에서 데이터 속성을 생성합니다. (truthy -> true, falsy -> undefined)
- [`compressCss`](./src/utils/styleManager/utils/compressCss.ts) - CSS 문자열을 압축합니다.

---

## 사용 예제

### 커스텀 훅 사용하기

#### useConstant

불필요한 재계산을 방지하고 컴포넌트 생명주기 동안 일정한 값을 유지합니다.

```tsx
import { useConstant } from '@winglet/react-utils';

const MyComponent = () => {
  // 복잡한 계산이 필요한 값을 한 번만 생성합니다
  const complexValue = useConstant(() => {
    return performExpensiveCalculation();
  });

  // 또는 직접 값을 전달할 수도 있습니다
  const fixedValue = useConstant(42);

  return <div>{complexValue}</div>;
};
```

#### useWindowSize

브라우저 창 크기에 반응하는 반응형 컴포넌트를 쉽게 만들 수 있습니다.

```tsx
import { useWindowSize } from '@winglet/react-utils';

const ResponsiveComponent = () => {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>
        현재 화면 크기: {width} x {height}
      </p>
      {width < 768 ? <MobileView /> : <DesktopView />}
    </div>
  );
};
```

### HOC 사용하기

#### withErrorBoundary

컴포넌트에 에러 바운더리를 추가하여 오류가 발생해도 애플리케이션이 중단되지 않도록 합니다.

```tsx
import { withErrorBoundary } from '@winglet/react-utils';

const ErrorFallback = () => <div>오류가 발생했습니다.</div>;

const RiskyComponent = () => {
  // 에러가 발생할 수 있는 코드
  if (Math.random() > 0.5) {
    throw new Error('Random error');
  }
  return <div>정상 작동중</div>;
};

// 에러 바운더리로 감싸진 안전한 컴포넌트
const SafeComponent = withErrorBoundary(RiskyComponent, <ErrorFallback />);

// 사용
const App = () => <SafeComponent />;
```

#### Portal

컴포넌트 내용을 DOM 트리의 다른 위치에 렌더링할 수 있습니다.
이 기능은 sticky header를 구현할때 유용합니다.

```tsx
import { Portal } from '@winglet/react-utils';

const ModalComponent = Portal.with(() => {
  return (
    <div>
      <Portal.Anchor className={styles.header} />
      <Portal>
        <h1>메인 콘텐츠</h1>
        <div className="description">
          이 내용은 모두 `Portal.Anchor` 내부에 랜더링됩니다.
        </div>
      </Portal>
    </div>
  );
});
```

### 유틸리티 함수 사용하기

#### 컴포넌트 타입 체크

```tsx
import { isReactComponent, isReactElement } from '@winglet/react-utils';

const validateUI = (ui) => {
  if (isReactComponent(ui)) {
    // 컴포넌트 처리 로직
    return <ui {...props} />;
  } else if (isReactElement(ui)) {
    // 이미 렌더링된 엘리먼트 처리 로직
    return ui;
  } else {
    // 기본 UI 반환
    return <DefaultUI />;
  }
};
```

#### renderComponent

다양한 형태의 React 컴포넌트를 일관되게 렌더링합니다.

```tsx
import { renderComponent } from '@winglet/react-utils';

// 컴포넌트 타입
const Button = (props) => <button {...props}>{props.children}</button>;

// 사용 예제
const App = () => {
  // 컴포넌트 타입 렌더링
  const buttonA = renderComponent(Button, {
    onClick: () => alert('A'),
    children: 'Button A',
  });

  // 이미 생성된 엘리먼트 렌더링
  const buttonB = renderComponent(
    <Button onClick={() => alert('B')}>Button B</Button>,
  );

  // 조건부 렌더링
  const maybeButton = renderComponent(condition ? Button : null, {
    children: 'Conditional',
  });

  return (
    <div>
      {buttonA}
      {buttonB}
      {maybeButton}
    </div>
  );
};
```

---

## 개발 환경 설정

```bash
# 저장소 클론
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# 의존성 설치
nvm use && yarn install && yarn run:all build

# 개발 빌드
yarn reactUtils build

# 테스트 실행
yarn reactUtils test
```

---

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트에 관한 문의나 제안이 있으시면 이슈를 생성해주세요.
