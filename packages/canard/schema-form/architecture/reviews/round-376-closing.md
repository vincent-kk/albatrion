# 376라운드 — 닫기 (나감 정리 결함 PR #402 병합 ba0b36c88; 편집자 결정 둘)

2026-10-15. P-08 조사 중 fixy08이 찾은 나감 정리 결함을 별도 PR로 고쳐 닫는다. 결함은 둘이며 같은 파일·같은 원인 계열이라 한 PR에 넣었다(원장 관리자 결정). 구현은 374라운드 지시 전에 잡은 Claude 작업자가 했고, 변이 확인·전체 게이트(unit·render·react18·production·storybook·시나리오·플러그인·documents)·agy 검증(결함 없음) 뒤 원장 관리자가 squash 병합했다(ba0b36c88). 같은 라운드에서 fairy08의 읽기 전용 대조(배열 조각의 파생 규칙)를 받아 결정 대기열 60을 닫고 CONTROLS-077을 보충한다.

## 편집자 결정

- **376C-01 (소멸 때 보류 나감의 정리는 노드 동일성으로 — NODE-044 결함 둘의 기록과 고침).**
  - 【추론】 소멸 때 보류 나감의 정리는 경로 접두가 아니라 노드 동일성으로 한다. 배열 remove가 뒤 아이템을 소멸한 아이템의 경로로 옮기고 그 안의 게이트 필드가 같은 커밋에서 나가면, 옛 판정(finalizePerished의 경로 접두 비교)은 소멸 노드의 옛 경로와 같은 경로를 가진 이동 노드의 나감까지 지워 그 필드가 떼어지지 않은 채 남았고, 소멸한 아이템 안의 보류 나감은 이미 아이템 children을 떠나 owned 걷기가 닿지 않아 detached 거짓·active 참으로 남았다. 둘 다 NODE-044(최종 형상을 떠난 노드는 자손과 함께 떼어진다)의 위반이고 #389 이전부터 있던 결함이다. 고침은 보류 나감 노드의 parent 사슬을 소멸 노드 집합과 대조해 소멸 아래의 나감만 빼고 그것을 소멸 자손처럼 떼어내며(active 거짓, 게이트 등록 해제, 배달 없음, 잠복 포착 없음), 소멸 경로로 옮겨 온 다른 아이템의 나감은 나감으로 처리해 그 값이 insert의 나감처럼 inactiveValues에 든다. 결함을 고정하던 시험 기대 하나를 NODE-044로 바꿨고 그 밖의 기존 기대 변경은 없다. 설계 원칙 변경은 없다(SETTLE-001, NODE-051, NODE-044).
- **376C-02 (CONTROLS-077 보충 — 배열 아이템은 조각의 직계 자식; 대기열 60 닫음).**
  - 【추론】 조각이 items·additionalItems·prefixItems로 선언한 아이템도 그 조각이 직접 선언한 호스트의 직계 자식이다(373라운드 소유자 답). 따라서 조각의 값 키(default·unsetValue·unsetOnInactive·derived·resetInteraction)와 상태 키는 한 스키마 items·additionalItems 아이템과 튜플 자리에 모두 아이템마다 따로 걸리고, 식은 호스트에서 한 번 평가해 같은 값을 아이템 모두에 쓴다. 조각의 injectTo는 청사진 오류라 대상이 아니다(29C-04). 소유 판정은 선언 경로가 /properties/·/prefixItems/ 뒤에 오거나 /items·/additionalItems로 끝나거나 그 뒤에 /가 오는 조각 경로를 소유자로 보는 도우미 하나로 getControlLayers·buildFeatureNodeIndex·getDeriveRuleTable이 함께 한다. 구현 누락은 둘로 나눠 고친다: 값·상태 키(items 조각 층 PR)와 파생 규칙 표(규칙 대상을 이름으로 하나만 돌려주는 getRuleTargets와 그 호출부를 아이템 전체로 넓히는 별도 PR). 결정 대기열 60은 소유자 물음이 아니라 이 보충으로 답이 난 결함이라 닫는다(fairy08의 읽기 전용 대조). 라운드 상한 25(SETTLE-004)는 그대로다.

## 남은 것

fixy08: items 조각 층 PR(agy 검증 뒤 열림) → 파생 규칙 PR(codex 구현) → L2b(P-08 재구현·P1 가드·18C 재측정·H10 결론·P-139 벤치 GC 격리). fairy08: 파생 규칙 PR의 기대 변경을 CONTROLS-077·CONTROLS-073으로 대조. 결정 대기열 54·58은 열려 있다.

다음 라운드 번호는 377이다.
