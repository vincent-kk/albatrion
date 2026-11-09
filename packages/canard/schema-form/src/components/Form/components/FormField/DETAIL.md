# FormField 계약

## Requirements

Form.Field는 한 경로의 입력·렌더러·감싸개를 조합하고 노드 상태를 별도로 소유하지 않습니다.

## API Contracts

FieldInput·FieldRenderer·Wrapper override는 mount에 고정합니다. 매 render의 새 함수로 입력 subtree가 교체되어 draft·focus를 잃는 일을 막는 수명 경계입니다. 나머지 props는 최신 값을 전달하며, 변하는 closure 값은 context·컴포넌트 내부 hook으로 읽거나 key 교체로 명시적으로 새 인스턴스를 만듭니다.

## Acceptance Criteria

### field-group — 조각 override 수명

Form 전체의 live renderer 설정과 이 조각의 mount 고정 override를 구별합니다. 필드 해석·입력 실행·오류 격리는 [FieldProxy](../../../FieldProxy/DETAIL.md)가 소유하며 이 조각이 형제 Form 조각을 조립하지 않습니다.

## Boundary Exemptions

### `types/` — 공개 형의 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `RolledFormFieldProps`는 이 조각의 공개 사용 계약이므로 구현 옆에 두고 부모와 패키지 진입점이 이름으로 노출합니다.

## Last Updated

이 조각의 조합·접근성·설정 수명 또는 공개 props 계약이 바뀌면 갱신합니다.
