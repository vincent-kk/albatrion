# FormError 계약

## Requirements

- 부모 Form의 보조 렌더링 계약(`Form.Error`)과 렌더러 속성 계약(LANDING-035·067)을 구현합니다.

## API Contracts

- `FormError.tsx`는 `memo` 컴포넌트입니다. `<span>`에 `style`·`className`을 두고, 그 안에 `FieldProxy`를 그립니다. 이때 렌더러 문맥의 `FormErrorRenderer`를 쓰고, 없으면 `PluginManager.FormErrorRenderer`를 씁니다.
- `types/props.ts`는 `FormErrorProps`(`path`·`style`·`className`)를 정의합니다.

## Acceptance Criteria

### error-renderer — 렌더러 선택

- Form 속성으로 넘긴 렌더러가 플러그인 렌더러보다 우선합니다.

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `FormErrorProps`는 이름으로 진입점에 올라 `components/Form/index.ts`를 거쳐 `src/index.ts`가 공개한다. 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

2026-10-14 — 소유자 구조 변경(Form의 조각을 fractal로 분리).
