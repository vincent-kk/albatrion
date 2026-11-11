# FormErrorMessage 계약

## Requirements

Form.ErrorMessage는 경로의 오류 표시를 조합하며 검증·오류 배정·문구 생성을 소유하지 않습니다.

## API Contracts

Form.ErrorMessage는 바깥 span 없이 묶인 ErrorMessage를 항상 그립니다. 빈 문구도 명시적 자리의 루트를 유지하고 style·className은 undefined여도 명시하여 스키마 표현 props가 새지 않게 합니다. 문구와 context는 자기 FieldProxy에서 받아 전달합니다.

오류의 visible·message는 [FieldProxy](../../../FieldProxy/DETAIL.md)의 판단을 따릅니다. 별도 오류 state를 두면 표시 정책과 원시 오류가 갈라지므로 이미 해석한 결과만 렌더러로 전달합니다.

## Acceptance Criteria

### error-renderer — 렌더러 선택

최신 Form·Provider·플러그인의 선택은 [FieldRendererContext](../../../../providers/FieldRendererContext/DETAIL.md)에 맡깁니다. 이 조각에서 순서를 다시 정하거나 자체 오류 표시 조건을 추가하지 않습니다.

### REACT-031 — 잔여 키 오류는 호스트에 표시합니다

rejectedKey 오류를 잔여 키 전용 UI나 존재하지 않는 자식 필드로 옮기지 않고 검증이 배정한 호스트 오류로 표시합니다. not.required도 이 조각에서 재배정하지 않습니다. 배정은 [validation](../../../../core/engine/validation/DETAIL.md), 기본 문구·중복·false schema 번역 확장은 [formatValidationError](../../../../helpers/error/formatValidationError/DETAIL.md)의 계약입니다. 표현을 바꾸려고 판정이나 오류 경로를 바꾸는 일을 막습니다(REACT-026).

## Boundary Exemptions

### `types/` — 공개 형의 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `FormErrorMessageProps`는 이 조각의 공개 사용 계약이므로 구현 옆에 두고 부모와 패키지 진입점이 이름으로 노출합니다.

## Last Updated

이 조각의 조합·접근성·설정 수명 또는 공개 props 계약이 바뀌면 갱신합니다.
