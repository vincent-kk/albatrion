# stringBehavior 계약

## Requirements

문자열 편집에서는 입력 중 공백도 데이터입니다. 입력마다 자르면 단어 사이 공백을 칠 수 없으므로 trim을 해석과 분리하고 입력 완료 때만 계산합니다.

## API Contracts

제한된 문자열 변환의 표는 [unionBehavior의 WRITE-075](../unionBehavior/DETAIL.md), 공통 행 경계는 [behaviors 계약](../DETAIL.md)을 따릅니다. 포커스 아웃 신호를 보내는 입력 수명은 [FieldInputBridge 계약](../../../../components/FieldProxy/components/FieldInputBridge/DETAIL.md), 결과를 자동 쓰기로 적용하는 경계는 [write 계약](../../write/DETAIL.md)이 소유합니다.

## Acceptance Criteria

### CONTROLS-004 — trim은 정적 선택입니다

trim은 options의 정적 선택을 읽으며 controls 식이나 입력 컴포넌트의 문자열 판정으로 바꾸지 않습니다. 선택과 계산을 행에 두어 React 어댑터가 종류별 데이터 규칙을 갖지 않게 합니다.

### CONTROLS-005 — 입력 완료에서만 공백을 자릅니다

문자열과 union의 문자열 값은 finishInput에서 현재 원본을 기준으로 자른 결과만 제안합니다. trim이 꺼졌거나 문자열이 아니거나 결과가 같으면 undefined를 반환해 쓰기 제안이 없음을 나타냅니다. 빈 문자열 결과는 유효한 제안이므로 없음과 혼동하지 않습니다. 이 계산은 원본·상호작용 상태·오류를 직접 바꾸거나 해석을 다시 호출하지 않습니다.

### string-row — 투영을 입력 변환으로 쓰지 않습니다

omitEmpty로 빈 문자열 방출을 생략해도 편집 원본은 그대로 둡니다. 따라서 빈 문자열을 든 노드와 그 방출 undefined로 새로 로드한 노드의 원본·value는 다를 수 있습니다. 왕복을 맞추려고 투영 시 원본을 비우면 입력 상태와 작성자가 선택한 방출 정책이 섞입니다. 왕복 비교의 정책은 [settle 계약](../../settle/DETAIL.md)이 소유합니다.

## Last Updated

문자열 변환 경계·입력 완료 제안·빈 문자열 투영의 의미가 바뀔 때 갱신합니다.
