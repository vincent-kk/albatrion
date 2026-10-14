# FormError 계약

## Requirements

- 부모 Form의 보조 렌더링 계약(`Form.Error`)과 렌더러 속성 계약(LANDING-035·067)을 구현합니다.

## API Contracts

- `FormError.tsx`는 `memo` 컴포넌트입니다. `<span>`에 `style`·`className`을 두고, 안쪽은 렌더러 문맥의 `FormErrorRenderer`, 없으면 `PluginManager.FormErrorRenderer`로 그린 `FieldProxy`입니다.
- `type.ts`는 `FormErrorProps`(`path`·`style`·`className`)를 정의합니다.

## Acceptance Criteria

### error-renderer — 렌더러 선택

- Form 속성의 렌더러가 플러그인 렌더러보다 우선합니다.

## Last Updated

2026-10-14 — 소유자 구조 변경(Form의 조각을 fractal로 분리).
