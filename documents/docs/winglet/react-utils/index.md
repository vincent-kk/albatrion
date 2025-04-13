---
sidebar_position: 1
---

# @winglet/react-utils

`@winglet/react-utils`는 React 애플리케이션 개발에 유용한 유틸리티 함수들의 모음입니다.

## 설치

```bash
npm install @winglet/react-utils
# or
yarn add @winglet/react-utils
```

## 사용법

```javascript
import { hoc, hooks, utils } from '@winglet/react-utils';

// 훅 사용
const size = hooks.useWindowSize();
const snapshot = hooks.useSnapshot(value);

// 유틸리티 사용
const filtered = utils.filter.removeNull([1, null, 2]);
const rendered = utils.render.if(condition, Component);

// HOC 사용
const WithErrorBoundary = hoc.withErrorBoundary(Component);
const WithPortal = hoc.withPortal(Component);
```

## 카테고리

### [훅](./hooks.md)

- `useSnapshot`: 값의 스냅샷을 생성하고 관리
- `useConstant`: 컴포넌트 생명주기 동안 유지되는 상수 생성
- `useVersion`: 주기적으로 실행되는 타이머 훅
- `useHandle`: 이벤트 핸들러 생성 및 관리
- `useOnUnmount`: 컴포넌트 언마운트 시 실행되는 훅
- `useEffectUntil`: 조건이 충족될 때까지 실행되는 effect
- `useLayoutEffectUntil`: 조건이 충족될 때까지 실행되는 layout effect
- `useMemorize`: 메모이제이션된 값 생성
- `useOnMount`: 컴포넌트 마운트 시 실행되는 훅
- `useReference`: ref 생성 및 관리
- `useWindowSize`: 윈도우 크기 관리

### [유틸리티](./utils.md)

- `object`: 객체 조작 유틸리티
- `render`: 렌더링 관련 유틸리티
- `filter`: 필터링 유틸리티

### [HOC](./hoc.md)

- `withPortal`: 포털 기능을 제공하는 HOC
- `withUploader`: 파일 업로드 기능을 제공하는 HOC
- `withErrorBoundary`: 에러 바운더리 기능을 제공하는 HOC
