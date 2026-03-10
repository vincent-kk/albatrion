# CLAUDE.md

`@winglet/style-utils` — 스코프 CSS 주입, CSS 압축, className 유틸리티. 런타임 의존성 없음, framework-agnostic.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트 (jsdom)
yarn lint              # ESLint
```

## Sub-path Exports

```typescript
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';
import { cx, cxLite, compressCss } from '@winglet/style-utils/util';
```

## Key APIs

**StyleManager** — 스코프 CSS 싱글톤 관리:
```typescript
const addStyle = styleManagerFactory('my-scope');
const removeStyles = addStyle('style-id', css);   // cleanup 함수 반환
destroyScope('my-scope');                          // 전체 scope 정리
// Shadow DOM: styleManagerFactory('scope', { shadowRoot: el.shadowRoot })
```

**ClassName**:
```typescript
cx('base', { active: isActive }, ['a', 'b'])   // 객체/배열 지원
cxLite('base', isActive && 'active', size)      // 경량 버전
```

## Key Details

- **CSS 스코핑**: `.scopeId .selector` 자동 prefix (`@rules`, `:root`, `:host` 제외)
- **DOM API**: `adoptedStyleSheets` (모던) / `<style>` 요소 (레거시) 자동 선택
- **배치 업데이트**: `requestAnimationFrame` 기반 DOM 업데이트 최적화
- **메모리**: `destroy()` 호출 시 AnimationFrame 취소, DOM 제거, 캐시 초기화
