# 166라운드 — Vincent의 답 (onValidate 오류 배열은 readonly로 둔다; onStateChange의 state flag는 false도 유효값이므로 undefined·true·false 세 값을 모두 내야 한다; 165C-01의 INTENT 예외는 문제없음)

2026-10-12. 원장 관리자가 형 추론 감사의 소유자 결정 둘(1 onValidate 오류 배열 readonly, 4 onStateChange flag가 readonly true 키 집합)과 편집자 결정 하나(165C-01 INTENT 예외)를 선택지와 함께 올리자 소유자가 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 오류 배열 readonly, state flag의 값 범위, INTENT 예외 | 163C-01 (3)의 두 결정과 165C-01의 보고 | "직접 결정한건 문제없고, 두가지에 대해서인데, error는 readOnly로 해도 되는데, state에 대해서는 false도 유효값이야. undefined이거나 true 이거나 false거나. 그렇지 않나? 네가 판단 못할만한 문제는 아닌데. 어떤것때문에 결정을 미룬거지?" (2026-10-12, 원장 세션) | 확정. (1) 감사 차이 1: onValidate의 오류 배열은 readonly 형을 유지한다(선택지 (가)). (2) 감사 차이 4: onStateChange의 state flag는 undefined·true·false 세 값이 모두 유효하며, 새 판의 "readonly true 키 집합"은 false를 없앤 것이라 옛 판 계약(0.16.0의 optional boolean)에서 후퇴다 — 형은 `boolean | undefined`(readonly는 유지)로 되돌리고, 07b-1이 새 엔진이 flag를 끌 때 false를 쓰는지 키를 지우는지 확인해 런타임도 세 값을 내도록 맞춘다(옛 판 의미와 같게); 고침은 07b 별도 커밋, 핀포인트 검증(시험·d.ts 차분·방향 확인 한 행). (3) 165C-01의 INTENT 예외는 그대로. (4) 원장 관리자의 보고 오류: 4번을 "쓰기를 막는 계약 변경"으로 분류해 소유자에게 미뤘으나 핵심은 값의 범위가 줄어든 것이었다 — 원칙(150라운드 (1))만으로 판단할 수 있던 사안이며, 앞으로 "옛 판이 내던 값을 새 판이 못 내는" 종류의 차이는 편집자 결정으로 되돌린다. |

다음 라운드 번호는 167이다.
