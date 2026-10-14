# 205라운드 닫기 — 07c G7(핸들·레이아웃·합성 API) 완료(41e6e21a3, 스토리 6건, 자동 게이트 196/196, e2e 277/277, 실제 창 6건); fairy07 세션은 verifier뿐 아니라 모든 서브에이전트 실행이 거부돼 자체 변이 탐침으로 대신함; 제품 결함 없음; 07b-1이 2라운드 head 위로 rebase됨(79470890a) — 07c도 그 위로 rebase

2026-10-13. fairy07이 G7을 41e6e21a3으로 커밋했다. 새 거부: G7 목록 작성용 읽기 전용 scout 서브에이전트 실행도 "Auto-Mode Bypass"로 거부돼 fairy07 세션은 모든 종류의 서브에이전트 실행이 막힌 상태(G6부터); 재시도 없이 직접 파일 읽기로 목록을 만들었고 G7 verifier는 띄우지 않았으며(재시도 패턴 회피) 커밋 메시지에 "verifier 미실행: 서브에이전트 실행이 G6부터 종류째 거부됨"을 적고, 대신 자체 변이 탐침(refresh 교체, 같은 스키마 노드 유지, provider readOnly 세 기대를 깨뜨려 스토리·e2e 각 3/3 빨강 뒤 복원)을 돌렸다. 수치: 스토리 6건(Features/HandleLayout: HandleRoundTrip 2(하나는 settle.form-reset-load 재사용), HandleCommands 1, LayoutComposition 1, ProviderLayers 1, PropReplacement 1); 새 시나리오 5; e2e 10사례 2파일; 스토리북 196/196, e2e 277/277, 두 패키지 typecheck·lint, 시나리오 38/38, 실제 창 6/6(/tmp/claude-501/07c-g7). 제품 결함 없음. 메모: (a) 같은 경로의 Form.Input 둘은 타이핑 중 동기화되지 않고 둘째는 초안을 유지 — EVENT-042(타이핑은 Refresh를 내지 않음; Refresh는 비제어 입력 초기화용)와 REACT-027(입력이 초안을 소유)대로 명세로 단언; 레이아웃 작성자가 놀랄 수 있어 소비자 문서에 적을 만함; (b) jsdom의 select()는 포커스를 옮기지 않아 e2e는 선택 범위만, Chromium 스토리는 포커스와 선택을 함께 확인; (c) FeatureStory에 providerProps(G6의 providerDefinitions 대체), layout children override, jsonSchema/defaultValue prop 단계; (d) 리로드 계약 단언: prop 변경만으로는 리로드 없음, reset은 확정된 props를 로드, 같은 스키마는 노드 identity 유지, 다른 스키마는 재구성. 같은 시각 fixy07이 07b-1을 85786e710 위로 rebase해 79470890a로 push했다(175라운드 히스토리).

### 205C-01 (1) G7은 기록대로 받는다; 자체 변이 탐침은 verifier 대체로 적절하며 이후 그룹에서도 같은 방식(서브에이전트 실행 없이 직접 읽기와 변이 탐침)으로 간다; (2) 메모 (a)는 07b 정리 목록 "문서 정합(작성 표면)" 행에 "같은 경로의 입력 둘은 타이핑 중 동기화되지 않음(EVENT-042·REACT-027)" 한 줄을 더해 fixy07이 소비자 문서에 적는다; (b)~(d) 허용; (3) 07c는 지금 07b-1 79470890a 위로 rebase하고(커밋 2의 useTerminalChildren 모양 변경은 스토리에 닿지 않음; 충돌 없을 것) 게이트를 한 번 다시 돌린다(코드가 움직였으므로); (4) `reviews/owner-queue-07.md` 12번을 "서브에이전트 실행 전부"로 갱신; (5) 다음은 G9

- 닫는 항목: TEST-025(보충), EVENT-042(보충)
- 결정:
  - 【추론】 변이 탐침은 verifier가 하던 핵심 검사(적재 하중 확인)를 같은 세션이 직접 한 것이라 증거 등급이 조금 낮지만 PR 전체 독립 검증이 남아 있다. 07b-1에 코드가 들어왔으니 이번 rebase 뒤에는 게이트 재실행이 필요하다.
- 근거: fairy07의 G7 보고; EVENT-042·REACT-027; 203C-01; fixy07의 rebase 보고.
- 다음: 원장 관리자가 fairy07·fixy07에 알린다.

## 덧붙임 (2026-10-13, 07c rebase와 G3 발견 뒤집기)

fairy07이 07c의 일곱 커밋만 `git rebase --onto 79470890a f820a37ee`로 옮겼다(보통 rebase는 옛 07b 커밋을 다시 재생하려다 src/에서 충돌해 중단; src/ 불변). 새 스택: G3 ec1a9e170, G2 ec604fd3a, G1 d60f199ee, G5 07128a343, G4 e402f1c6c, G6 d7b0e6a87, G7 f2191ff7b, 그 위에 G3 뒤집기 커밋. G3의 it.fails 둘이 518612e36으로 통과하게 되어 보통 회귀 사례로 바꿈: e2e는 plain it, 스토리는 !test 태그를 떼고 Features/Composition/BatchRetention 아래로, 시나리오는 compositionFeatureScenarios로 옮겨 composition.batch-keeps-inactive-raw·composition.batched-toggle-keeps-edit로 개명, compositionFindingScenarios 제거, DETAIL 표는 coverage 절로. 새 head 게이트: 스토리북 198/198(196 + 제외됐던 둘), e2e 277/277, 두 패키지 typecheck·lint, 시나리오 37/37(발견 행 하나 사라짐), 실제 창 2/2(/tmp/claude-501/07c-g3-flip). 남은 열린 발견은 G1 소유자 질의(큐 9번)뿐. 다음 G9.
