# 197라운드 닫기 — batch 고침의 계획 검증이 찾은 잔여 결함 둘(다른 종류의 살아 있는 노드가 있는 경로의 batch 재진입이 잠복 원본을 복원하지 않음; 여러 쓰기 batch 안의 가상 노드 쓰기가 버려짐)은 둘 다 기존 결함이며 리뷰 2라운드 꼬리에 각각 한 커밋으로 넣는다

2026-10-13. reviewer의 계획 검증(opus; 작업 3을 scratchpad 사본에 그대로 적용해 unit+render와 탐침 넷을 비교)이 191C-01 고침이 작동함을 확인하고, 범위 밖 잔여 결함 둘을 찾았다. R1 — 경로에 다른 종류의 살아 있는 노드가 있을 때 batch 재진입이 잠복 원본을 복원하지 않는다: 스키마 k:string, then {value:string} else {value:number}; {k:'a', value:'s'} → /k 'b', root Merge {value:5} → batch(/k 'a', /other 'x')는 고침 전후 모두 "5"를 남김(단일 쓰기는 's' 복원); {k:'a', value:'s'} → batch(/k 'b', /k 'b')는 number 노드에 's'를 남김. 원인: composeBatchValue.ts:15가 root.local에서 시작해 쓰이지 않은 키도 enterSchemaNode.ts:28-38·selectChildren.ts:326-346/455-461에 입력처럼 보인다. 고침 후보: replacePaths가 있으면 분배된 키를 그 경로가 교체 경로 안이거나 위일 때만 쓰기로 센다. reviewer는 이번 라운드의 주장을 같은 종류 재진입으로 좁혔다(enterSchemaNode·selectChildren의 쓰기 판정에 닿으므로). R2 — 여러 쓰기 batch 안의 가상 노드 쓰기가 고침 전후 모두 버려진다: batch(/period ['s1','e1'], /note 'x')는 startDate/endDate를 s0/e0에 남김; composeBatchValue는 'period' 키를 쓰지만 markWrite.ts:139가 가상 자식을 건너뛴다. 회귀 아님. 둘 다 2라운드 계획의 "잔여 결함"에 기록됨. 검증기의 다른 정정(고침 전 실패 집합, 조항 고정 시험 셋, replacePaths의 automatic 필터, 수치, dispatchBatch JSDoc)은 반영됨.

### 197C-01 (1) R1·R2는 둘 다 원장 계약 위반(R1은 LANDING-018·032의 잠복 원본 복원, R2는 NODE-034 가상 노드 쓰기 규칙과 EVENT-013 배치 안 쓰기)이며 기존 결함이지만 복합 동작에서 소비자가 바로 만나는 종류라 2라운드 꼬리에 각각 한 커밋으로 넣는다 — 순서는 기존 목록(batch 고침 → 전달 중 외부 오류 → 모듈 상수 → 노드 귀속 → 입양 → 빈 항목·주석 → 시험 보강) 뒤에 R2(작음: markWrite가 replacePaths 안의 가상 키를 분배) 다음 R1(고침 후보대로 replacePaths가 있을 때 분배된 키의 쓰기 판정을 교체 경로 안·위로 한정; enterSchemaNode·selectChildren의 DETAIL을 먼저); 각각 고침 전 실패 시험(R1 두 경우, R2 한 경우)과 단일 쓰기 대조군; (2) 이번 batch 고침 커밋의 주장은 reviewer가 좁힌 대로 "같은 종류 재진입"으로 두고 커밋 메시지에 R1·R2를 "남은 결함, 뒤 커밋"으로 적는다; (3) fairy07에게 알려 복합 사례 CX-08·CX-16·CX-13의 단계에 다른 종류 재진입과 가상 노드 batch 쓰기를 넣게 한다; (4) 2라운드가 길어지므로 fixy07의 측정 시작은 "batch 관련 커밋(고침·R2·R1)이 모두 올라온 뒤"로 조정한다 — 그 사이 비 batch 항목이 섞여도 측정은 한 번만

- 닫는 항목: LANDING-018(보충), NODE-034(보충)
- 결정:
  - 【추론】 둘 다 고침 후보와 재현이 이미 손에 있고 같은 파일 군이라 지금 고치는 비용이 가장 낮다. 2라운드가 길어지지만 소유자가 복합 동작의 정확성을 우선했다.
- 근거: reviewer의 계획 검증 보고; LANDING-018·032; NODE-034; EVENT-013; 186라운드 소유자 답.
- 다음: 원장 관리자가 reviewer·fairy07·fixy07에 알린다.
