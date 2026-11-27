# FormRender 계약

## Requirements

Form.Render는 경로의 필드를 소비자 렌더 함수로 조합하며 폼 상태의 소유권은 추가하지 않습니다.

## API Contracts

children·FieldInput·Wrapper는 mount에 고정합니다. 함수 identity 교체로 subtree를 뜻밖에 재생성하지 않기 위한 경계이며, closure로 잡은 상태도 mount 값을 유지합니다. 변하는 값은 context·내부 hook으로 읽고 의도적 교체에는 key를 사용합니다. `onChange`와 `onFileAttach`는 바인딩이 소유하므로 레이아웃 조각에 전달할 수 없고 내부 처리기를 대체하지 못합니다. 그 밖의 나머지 props는 최신 값을 전달합니다.

## Acceptance Criteria

### render-function — 렌더 함수 위임

렌더 함수는 필드 렌더러 props를 받습니다. 직접 node.setValue를 부르는 것은 명령형 쓰기이므로 입력의 edited 정책을 대신하지 않습니다. 사용자 편집 수명은 전달받은 Input과 [FieldInputBridge](../../../FieldProxy/components/FieldInputBridge/DETAIL.md)에 맡깁니다.

## Boundary Exemptions

### `types/` — 공개 형의 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `RolledFormRenderProps`는 이 조각의 공개 사용 계약이므로 구현 옆에 두고 부모와 패키지 진입점이 이름으로 노출합니다.

## Last Updated

이 조각의 조합·접근성·설정 수명 또는 공개 props 계약이 바뀌면 갱신합니다.
