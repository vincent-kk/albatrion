# CLAUDE.md

`@winglet/react-utils` — React 커스텀 훅, HOC, 유틸리티 라이브러리. Sub-path export 지원.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트 (jsdom)
yarn test --watch      # watch 모드
yarn lint              # ESLint
```

## Sub-path Exports

```typescript
import { useHandle } from '@winglet/react-utils/hook';
import { withPortal, Portal } from '@winglet/react-utils/portal';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { isReactComponent } from '@winglet/react-utils/filter';
```

## Key APIs

**Hooks** (`@winglet/react-utils/hook`):
- `useHandle` — 안정적인 이벤트 핸들러 (schema-form 플러그인에서 주로 사용)
- `useConstant` — 비싼 연산 메모이제이션
- `useMemorize` — 향상된 memoization
- `useEffectUntil` / `useLayoutEffectUntil` — 조건부 effect
- `useWindowSize` — 브라우저 윈도우 크기 추적

**Portal System** (`@winglet/react-utils/portal`):
- `withPortal()` — 포털 컨텍스트 HOC
- `Portal.Anchor` — 포털 렌더링 위치 지정
- `Portal` — anchor 위치에 children 렌더링

**HOCs** (`@winglet/react-utils/hoc`):
- `withErrorBoundary()` — 에러 바운더리 래핑

## Peer Dependencies

React 16-19, React DOM 16-19
