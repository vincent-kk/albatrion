# FallbackComponents

## Requirements

사용자 렌더러가 없어도 기본 HTML로 입력과 오류를 표시할 수 있어야 합니다.

## API Contracts

- 그룹 렌더러는 루트에서는 Input만 렌더하고, 그 아래에서는 노드 그룹에 맞는 래퍼를 제공합니다.
- 입력 컴포넌트의 동작은 전달받은 Input에 맡기며, 배열 항목의 레이블은 숨깁니다.
- 필드 제목 label은 어떤 입력이 선택되었는지 따지지 않고 항상 `htmlFor={path}`와 id `label:${path}`를 둘 다 가지며, branch의 legend도 같은 id를 가집니다. 단일 입력은 `htmlFor`로, 묶음 입력은 컨테이너의 `aria-labelledby`로 이 제목에 연결됩니다(대기열 38, 소유자 결정).

- 대체 렌더러 넷(`FormErrorRenderer`·`FormFieldRenderer`·`FormInputRenderer`·`FormLabelRenderer`)은 `components/`에 있습니다. 뿌리에는 문서, 진입점, 형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### fallback-components-contract — 관찰 가능한 동작

- 루트를 렌더링할 때 불필요한 그룹 래퍼가 붙지 않습니다.
- 기본 렌더러는 플러그인 등록이나 자체 폼 상태 없이, 전달받은 props만으로 동작합니다.

## Last Updated

2026-09-16
