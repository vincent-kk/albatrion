# 204라운드 닫기 — 리뷰 2라운드 완료(head bf05db635, 커밋 9개, 게이트 18개); R3(같은 batch 안의 가상 덮어쓰기 + 다른 종류 분기 전환이 순차 둘과 다른 값을 냄)은 결함이 아니라 GOAL-010·62C-01의 귀결 — batch는 합성 값의 통째 쓰기 하나와 같은 결과를 내며 시험으로 고정한다; fixy07 rebase·측정 시작; 2라운드 전체 독립 검증 시작; reviewer는 개선-38 고찰 문서

2026-10-13. reviewer가 2라운드 완료를 보고했다(175라운드 히스토리에 커밋별 기록). R3: 가상 덮어쓰기로 number startDate에 7을 쓰고 같은 batch에서 string 분기로 전환하면 batch는 startDate '7', 순차 쓰기 둘은 undefined. settle DETAIL "한 경로에 어느 종류든 살아 있으면 그 값은 살아 있는 노드의 원본"은 batch 결과에 가깝다고 reviewer가 보았고 두 경로 모두 바꾸지 않았다.

### 204C-01 (1) 2라운드는 기록대로 받고 독립 검증(원장 관리자 세션 verifier, 518612e36..bf05db635)을 시작한다; (2) R3는 결함이 아니다 — GOAL-010("batch는 쓰기 하나로 센다")과 62C-01("배치 끝의 정착에서 호스트의 표시는 통째 쓰기 하나")대로 batch의 결과는 합성 값 `{startDate: 7, k: 'b'}`를 루트에 한 번 쓴 것과 같아야 하고, 그 단일 통째 쓰기에서 string 노드는 입력 7을 받아 '7'로 해석하므로 batch의 '7'이 계약이며 순차 둘의 undefined는 순차 의미의 귀결로 둘 다 맞다(62C-01이 이미 "batch와 순차가 다를 수 있음"을 명세로 둠); reviewer가 시험 하나로 둘을 나란히 고정하고(batch '7' = 단일 루트 통째 쓰기 '7'; 순차 undefined) settle DETAIL의 batch 문단에 "batch의 값 결과는 합성 값의 통째 쓰기 하나와 같다(GOAL-010·62C-01)"를 한 문장 더한다 — 코드 변경 없음, 2라운드 꼬리 커밋 하나, 독립 검증 범위에 포함; (3) 미검증 둘(batch에서 쓰이지 않은 형제의 writtenInputs/dirtyPaths 기록으로 전달 범위가 다를 수 있음; hasRecursiveExpansion/canReuseArrayChildren의 분배 입력 취급)은 독립 검증의 확인 항목으로 넘긴다 — 전달 범위 차이가 소비자 가시(불필요한 Refresh·onChange)이면 결함; (4) fixy07은 지금 07b-1을 bf05db635(또는 (2)의 꼬리 커밋) 위로 rebase하고 측정(batch 행 방향 확인 → 커밋 2 방향 확인 → 32b)을 시작한다; (5) reviewer는 개선-38 고찰 문서(193라운드 범위)를 쓴다; (6) 07c는 fixy07의 rebase가 끝나면 그 위로 rebase

- 닫는 항목: GOAL-010(보충), NODE-034(보충)
- 결정:
  - 【추론】 R3의 두 결과는 각각 자기 의미(통째 쓰기 하나 / 순차 둘)에 맞고, 원장은 이미 그 차이를 명세로 받아들였다. 시험으로 나란히 고정해 두면 뒤에 누가 "다르다"고 다시 묻지 않는다.
- 근거: reviewer의 2라운드 완료 보고; GOAL-010; 62C-01; settle DETAIL.
- 다음: 원장 관리자가 reviewer·fixy07에 알리고 verifier를 띄운다.
