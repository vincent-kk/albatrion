# FormLabel 계약

## Requirements

Form.Label은 입력 선택을 몰라도 접근 가능한 제목을 연결할 수 있어야 합니다.

## API Contracts

절대 path를 받은 label은 htmlFor와 label: 접두 id를 함께 제공합니다. 단일 입력은 path id, 묶음 입력은 aria-labelledby로 같은 제목을 사용합니다. label:는 /로 시작하는 필드 path와 겹치지 않아 형제 속성의 이름 때문에 제목 id가 충돌하지 않습니다. path가 undefined이면 두 속성도 만들지 않으므로 루트 제목이 필요하면 명시적 경로를 전달합니다.

## Acceptance Criteria

### label-ids — 입력 종류에 독립적인 제목

선택한 입력의 종류를 판별하여 label 규약을 바꾸지 않습니다. 기본 렌더러도 같은 규약을 따르며 현재 렌더러 선택은 [FieldRendererContext](../../../../providers/FieldRendererContext/DETAIL.md)가 소유합니다.

## Boundary Exemptions

### `types/` — 공개 형의 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `FormLabelProps`는 이 조각의 공개 사용 계약이므로 구현 옆에 두고 부모와 패키지 진입점이 이름으로 노출합니다.

## Last Updated

이 조각의 조합·접근성·설정 수명 또는 공개 props 계약이 바뀌면 갱신합니다.
