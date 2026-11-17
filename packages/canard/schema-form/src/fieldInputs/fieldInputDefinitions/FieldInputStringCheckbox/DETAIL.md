# FieldInputStringCheckbox 계약

## Requirements

문자열 enum 배열을 편집하며, 어긋난 외부 값 때문에 입력 전체가 렌더 실패하지 않게 합니다.

## API Contracts

- 공통 무효 표시와 값 보존 정책은 [상위 계약](../../DETAIL.md)에 둡니다.
- 선택지 id는 경로와 색인으로 만들고 label의 htmlFor와 일치시킵니다. 값에 공백이 올 수 있으므로 값 자체를 id로 사용하지 않습니다. 이 규약은 radio도 공유합니다.
- 선택지 묶음은 `role="group"`과 필드 제목의 `label:${path}`를 가리키는 `aria-labelledby`를 사용합니다. 개별 선택지 라벨과 묶음의 필드 이름을 혼동하지 않게 합니다.

## Acceptance Criteria

### CONTROLS-081 — 입력 힌트와 props의 설정 위치를 유지합니다

- 선택은 Hint의 `inputType`을 사용하고 라벨 alias는 전달된 입력 props로 소비합니다. 공개 위치는 [presentation 계약](../../../types/DETAIL.md)에 두며 맨 키나 options에서 다시 읽지 않습니다.

### checkbox-ids — 선택지의 고유한 연결

- 같은 필드의 선택지는 서로 다른 id를 가지며 각 label은 자기 선택지에 연결됩니다. 문자열화한 값이 id의 안정성을 결정하지 않습니다.

### checkbox-guard — 어긋난 값을 렌더에서 수리하지 않습니다

- 배열 아닌 기본값은 아무 항목도 체크하지 않고 노드 값은 그대로 둡니다. 체크 조작 때만 배열을 새로 쓰므로, 문자열 펼침이나 비배열 순회 때문에 입력이 사라지지 않습니다.
- 어긋난 값의 표지는 묶음에 전달합니다. 이 가드는 Form의 정상화된 입력만 가정하지 않고 직접 렌더된 입력도 보호합니다.

## Last Updated

선택지 연결·묶음 이름·표현 설정의 위치 또는 비배열 값의 편집 경계가 바뀔 때 갱신합니다.
