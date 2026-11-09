# FormInput 계약

## Requirements

Form.Input은 경로의 입력만 조합하고 입력 채널·오류 경계는 FieldProxy에 맡깁니다.

## API Contracts

직접 전달한 FieldInput은 mount에 고정하여 render마다 새로운 함수로 입력 인스턴스를 잃지 않게 합니다. 변하는 값은 context·입력 내부 hook으로 전달하거나 key로 교체합니다. 나머지 props는 최신 값을 입력에 전달합니다.

## Acceptance Criteria

### input-renderer — 렌더러와 입력의 다른 수명

입력 override가 고정되어 있어도 FormInputRenderer는 [FieldRendererContext](../../../../providers/FieldRendererContext/DETAIL.md)의 최신 선택을 따릅니다. 모든 설정이 고정되거나 모든 설정이 live라고 일반화하지 않습니다.

## Boundary Exemptions

### `types/` — 공개 형의 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `RolledFormInputProps`는 이 조각의 공개 사용 계약이므로 구현 옆에 두고 부모와 패키지 진입점이 이름으로 노출합니다.

## Last Updated

이 조각의 조합·접근성·설정 수명 또는 공개 props 계약이 바뀌면 갱신합니다.
