# 185라운드 — Vincent의 답 (외부 주입 오류의 자식 노드 지우기·쓰기는 key 식별자 대신 경로로 루트 집계에 반영한다; reviewer가 구현)

2026-10-13. 소유자가 "transformErrors는 외부 주입 error를 처리할 때 sequence를 key로 쓰지 않았나, 원래 그 목적이었는데, 지금 코드는 외부 주입 error를 어떻게 처리하나"라고 물었고 원장 관리자가 대조했다. 0.16.0: errors prop → transformErrors(errors, true)가 ++sequence를 key로 찍음(dist/index.mjs:1164) → 루트·경로별 노드의 setExternalErrors가 저장하며 key를 배열 인덱스로 덮어씀(:2651 `key: i`) → 자식의 clearExternalErrors()가 루트의 __removeExternalErrors__로 루트 집계 목록에서 key가 같은 항목을 지움(:3564-3569; 자식 인덱스와 루트 인덱스를 비교하는 잠재 버그). 즉 sequence는 저장 전에 사라졌고 key의 실제 쓰임은 "자식이 비울 때 루트 집계에서 골라 지우기"였다. 새 엔진: errors prop → applyFormErrors가 dataPath로 묶어 루트에 전체, 경로마다 노드에 묶음, 사라진 경로는 빈 목록(경로가 정체성); 자식의 clearExternalErrors/setExternalErrors는 그 노드의 runtime.nodeErrors만 바꾸고 루트 집계(globalErrors, onValidate)는 node === root일 때만 갱신(`src/core/dispatch/utils/entry/dispatchClearExternalErrors.ts`, `dispatchSetExternalErrors.ts`, `src/core/validation/utils/route/updateSchemaNodeGlobalErrors.ts`). 차이: 자식이 비워도 루트 집계에는 다음 errors prop 변경 때까지 남는다. 원장 관리자 권고: key를 되살리지 않고 경로로 같은 효과(자식 비움 → 루트 목록에서 그 경로 항목 제거, 자식 쓰기 → 그 경로 항목 교체).

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 자식 외부 오류의 루트 전파를 경로로 | key 복원 대 경로 전파 대 현행 유지 | "경로로 같은 효과 내는 쪽으로 리뷰어한테 넘겨줘." (2026-10-13, 원장 세션) | 확정. (1) 자식 노드(루트가 아닌 노드)의 clearExternalErrors()는 루트의 외부 목록에서 dataPath가 그 노드 경로와 같은 항목을 제거하고 globalErrors를 갱신하며 루트에 통지한다; setExternalErrors(errors)는 루트 목록에서 그 경로 항목을 새 목록으로 바꾼다(자리는 끝에 추가, DETAIL에 기재). (2) key 식별자는 되살리지 않는다(178C-01 (2) 유지). (3) applyFormErrors와 중복 갱신이 없게 하고 통지 횟수가 늘지 않아야 한다. (4) reviewer가 PR #354의 별도 커밋으로 구현하며 INTENT·DETAIL을 코드보다 먼저 고친다; 시험 셋(자식 비움 뒤 루트 집계, 자식 쓰기 뒤 교체, errors prop 변경의 기존 동작). (5) 소비자 가시 변화는 0.16.0 동작의 복원이며 소유자가 명시했다. |

다음 라운드 번호는 186이다.
