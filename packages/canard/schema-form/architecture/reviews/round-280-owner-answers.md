# 280라운드 — Vincent의 답 (대기열 38은 접근성 문제이되 자유도를 지킨다: 라벨은 입력 선출을 알 수 없으니 추측하지 않는다; alias 자리는 문제없음)

2026-10-14. PR #370(07d)의 verifier가 38 구현(스키마 모양으로 묶음 판정)과 실제 입력 선출이 어긋나는 결함을 찾아 원장 관리자가 "선출된 정의에 내부 표식" 고침을 보냈고, 소유자에게 뜻을 설명하자 소유자가 방향을 바꿨다. 또 `presentation.FieldInputProps.alias` 자리를 물었다가 자신이 옮긴 것을 확인했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 대기열 38 | 묶음 판정과 입력 선출의 어긋남을 어떻게 볼지 | "아하.... 1번은 접근성의 문제로 봐야할까? 가능하면 자유도를 해치길 원치는 않는데... 이게 input이랑 라벨을 그리는 곳이 다르다보니까 말이야.. 그리고 실제 상황에서는 사람들이 FieldInput과 FieldRenderer 를 커스텀해서 쓸테니까 사용방식에 따라 올바름 매칭을 하도록 하는게 좋지 않을까 싶기도 하네. 라벨 그리릴땐 인풋이 선출됬는지 알 수가 없으니까" | 원장 관리자 결정: 라벨은 묶음 여부를 추측하지 않는다. 제목 label은 항상 `htmlFor={path}`와 `id="${path}-label"`을 가지며, 내장 checkbox·radio 묶음은 `role="group" aria-labelledby="${path}-label"`로 제목을 가리킨다. 묶음 필드의 htmlFor가 가리키는 요소가 없는 것은 받아들인다. 사용자 정의 FieldInput·FieldRenderer는 같은 규약으로 스스로 맞춘다(README에 규약 명시). fieldInputGroup 판정 helper는 지운다. fixy07에게 보냄 |
| alias 자리 | `presentation.FieldInputProps.alias`가 맞는 자리인지 | "2번은 내가 수정했었구나 그럼 문제없어." | 변경 없음 |

다음 라운드 번호는 281이다.
