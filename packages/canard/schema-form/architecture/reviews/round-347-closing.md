# 347라운드 — 닫기 (인계 결함 PR #391 병합 42811f452; visitSubtree 문서 PR #390과 속도 계획 개정 PR #392 병합; 편집자 결정 셋)

2026-10-15. 344라운드의 자율 진행 지시에 따라 원장 관리자가 PR 셋을 검토하고 `feat/schema-form-08-review-and-perf`에 squash 병합했다: visitSubtree 공개 문서 #390(6b4934bf9), 속도 계획 개정 #392(d403d1658), 전달 중 인계 결함 수정 #391(42811f452). #391은 346C-07이 후속으로 넘긴 기준 커밋의 결함이며, 검증은 debugger 진단·codex 두 번(1차 실패 → 결함 셋 수정 → 2차 통과)·원장 관리자 verifier(통과, 변이 15개 모두 잡힘, 보완 둘)·축약 게이트와 production 게이트였다.

## 편집자 결정

- **347C-01 (전달 중 인계는 새 런타임에서 사슬을 끝낸다).**
  - 【추론】 리스너나 콜백이 전달 중에 `adoptFieldNodeTree`로 트리를 새 루트에 인계하면, 전달과 사슬 종료는 리스너·콜백마다 활성 루트를 다시 해석해 새 런타임에서 사슬을 끝내고, 사슬이 지나간 모든 런타임(연속 인계 A→B→C의 중간 포함)의 사슬 상태(`chainErrors`·`chainOccurrences`·`chainRoot`·`currentListener`·`onChangeBudget`)를 되돌린다. 중첩 `batch`와 정착 밖 `onStateChange`의 catch는 다시 해석한 런타임에 기록해 예외가 호출자와 보고기에 한 번씩 닿는다. 인계가 없을 때의 진입·종료·전달 순서와 예산 셈은 바뀌지 않는다. 리스너 되먹임 예산은 인계를 가로질러 하나로 센다(26파동에서 멈춤).
- **347C-02 (물러난 루트로의 인계는 거부된다).**
  - 【추론】 `adoptFieldNodeChain`은 상태를 옮기기 전에 두 루트 모두에 쓰기 가능 단언을 걸어, 이미 인계해 물러났거나 폐기된 루트가 어느 쪽에든 있으면 `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE`로 던진다. 물러난 루트는 그 인계가 폐기하므로 A→B 뒤 B→A와 A→B 뒤 다시 A→B가 모두 막히고, 전에는 `adoptedRoot`가 서로를 가리키는 고리가 생겨 `resolveFieldNodeChainRoot`가 멈추지 않았다. NODE-044의 "`DISPOSED_NODE_WRITE`는 재생성 `reset`이 버린 트리의 노드에 대한 쓰기에만 남긴다"는 폐기된 트리로의 인계까지 넓힌다 — 인계도 폐기된 트리에 대한 쓰기이기 때문이다.
- **347C-03 (문서 PR 둘과 후속 기록).**
  - 【추론】 visitSubtree 공개 문서 #390(SPECIFICATION en·ko, README 둘, api-reference en·ko, QUICK_REFERENCE, README 이주 절의 schemaType 한 줄, documents 사이트의 남은 `typeMismatch`를 `misfit`으로)과 속도 계획 개정 #392(확정 대체 25건을 현행 이름으로, 루프의 base는 `feat/schema-form-08-review-and-perf`, 결정 대기열 55·56을 344라운드 편집자 가결정으로 인용, 낡은 bench 스크립트 셋은 경로 둘만 현행으로 고치고 머리에 재실행 불가 사유를 적어 기록의 출처로 보존, 모바일 보고서는 0.10.6 측정임을 표시)을 병합했다. PLAN의 최적화 행 "묶음(M2)마다 PR 하나"는 대기열 56(수용 가설 3~4개마다 PR 하나)으로 고친다. 기록만 하는 후속 둘: 독립 flush에서 인계하는 리스너의 B 쓰기는 B에 새 25파동 예산을 주어 합계가 35까지 갈 수 있다(기준 커밋과 같음); `flushQueuedEvents`가 인계된 런타임에도 거는 재진입 방지는 관찰 가능한 차이가 없어 시험으로 고정하지 않았다.

## 남은 것

fixy08: 묶음 3(blueprint → derive+navigation → settle, PR 셋; settle PR에 FormCore·FormError·FormLabel의 type.ts → types/ 와 settle 저장소 키 mismatches·mismatchMemo → misfits·misfitsMemo). fairy08: 묶음 3 PR마다 INTENT·DETAIL 대조 검토, 셋이 병합된 뒤 속도 계획·bench 스크립트의 최종 경로 PR. 결정 대기열 54–56은 열려 있다.

다음 라운드 번호는 348이다.
