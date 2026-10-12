# 215라운드 닫기 — 07c PR #357(14커밋, 100파일, head af87c25f6 over 0fef82171)을 원장 관리자가 직접 검증해 feat/schema-form-07b-1에 squash-merge(1daf55be4); 판정 세션 32b 시작; 07b 문서 정합의 발견 셋 처리

2026-10-13. fairy07이 07c를 0fef82171 위로 rebase(13커밋, 충돌 0, 백업 backup/07c-before-0fef)하고 결함 A·B 발견 시나리오를 보통 회귀 사례로 뒤집어(af87c25f6: composite.batch-push-into-closing-branch·composite.recursive-nested-gate, 목록 compositeRegressionScenarios, 스토리 Composite/Regressions; batch-push에 "같은 값의 전체 쓰기" 단계 추가; G9 it.fails 유지) 전체 게이트 뒤 PR #357을 열었다. fairy07의 게이트(af87c25f6): vitest 전체 4,087 통과·todo 1·실패 0(storybook 239: 열 그룹 213 + 복합 24 + 회귀 2; e2e 668), 두 패키지 typecheck·lint, 시나리오 45; 실제 창 복합 26 중 24 PASS(CX-04·CX-11은 CDP 전용으로 dev에서 실행 안 됨, headless 게이트 통과). 첫 게이트에서 고친 것: CX-10 degraded 단계를 핸들 batch로 바꾼 뒤 jsdom 실행기가 예산 초과 오류를 잡지 않아 복합 e2e 실행기에 스토리 실행기와 같은 처리.

원장 관리자 직접 검증(verifier 스폰은 거부 상태라 직접): gh 메타(MERGEABLE, base 07b-1, 0fef82171이 조상); diff 범위 — src는 시험 디렉터리 밖 변경 0, 변경은 시나리오 패키지·stories·e2e뿐; 남은 it.fails는 G9 검증 파동(features-events-consumer)과 G1 소유자 질문(features-values) 둘뿐; 본문의 그룹별 수치·결함 넷·질문 둘·IME 판정 반영 확인; 실제 창 기록 /tmp/claude-501/07c-composite visual.json 27건 중 24 PASS·FAIL 둘이 CX-04·CX-11로 보고와 일치; 워크트리 stories-07c에서 직접 재실행 — unit+render 429파일 3,165 통과·todo 1(70.7초), react18 102파일 663 통과(66.2초; act 경고 20줄은 복합 꼬리의 stderr 소음), storybook 239 + production 20을 더하면 4,087로 본문과 일치. 한계: 제 샌드박스는 headless Chromium을 띄우지 못해(mach port bootstrap 거부) 스토리북 프로젝트는 fairy07의 게이트로 갈음; 변이 탐침은 fairy07 워크트리의 src 편집이 분류기에 거부되어 직접 하지 못함 — 대체 증거는 두 회귀 사례가 고침 전 it.fails로 실패하다 고침 뒤 통과하는 것과 reviewer의 고치기 전 실패 시험(fa0ab1f9b 5/7, de7f56499 2/5+2/2), fairy07의 변이 탐침 8/8.

squash 커밋 1daf55be4(제목 "test(schema-form): 07c feature catalog and composite stories (#357)", 본문은 요약·게이트 수치; co-author·세션 ID 없음). 07b-1 head: b4de69370 → 1daf55be4.

07b 문서 정합(fixy07, scratchpad 사본 14파일 약 140곳, 옛 문법 0건, verifier 대조 중) 발견 셋: (1) src/types/jsonSchema.ts:244,253이 object 스키마에 최상위 `virtual?: VirtualSchemaProperties`를 아직 선언 — 런타임·시나리오는 options.virtual(NODE-032); (2) README·명세의 플러그인 인터페이스 이름이 옛 이름(FormGroup 등, 현행은 FormTypeGroupRenderer 등 src/app/plugin/type.ts:113); (3) "순환 injectTo는 조용히 막힘" 서술이 derive/DETAIL.md(라운드 상한·에지 소비)와 맞는지 verifier 확인 중.

### 215C-01 (1) #357은 검증대로 받아 squash-merge했다; fairy07은 워크트리 stories-07c·로컬 브랜치·백업 브랜치·dev 서버를 정리하고 원격 브랜치는 원장 관리자가 지운다; G9 뒤집기는 07b 검증 파동 고침 뒤 작은 PR로; (2) 판정 세션 32b를 지금 시작한다 — fixy07은 W를 1daf55be4로 빨리 감고(문서 정합 커밋이 10분 안에 통과하면 먼저 넣음) HEAD 단언만 맞추며 번들은 재빌드하지 않는다; 두 세션은 끝날 때까지 무거운 실행 금지(시작 전 알림); (3) 발견 (1)은 NODE-032에 따라 최상위 virtual 형을 지우는 것이 맞으나 공개 형 변경이므로 07b src 항목으로 32b 뒤 계획·verifier를 거쳐 fixy07이 처리하되, 형 추론 감사 73건과 0.16.0 문서에 최상위 virtual 사용례가 있으면 소유자 대기열로; (4) 발견 (2)는 LANDING-032가 정한 이름이므로 같은 문서 커밋에서 고친다; (5) 발견 (3)은 verifier 판정대로 derive/DETAIL.md에 맞춘다

- 닫는 항목: TEST-025(보충), SURFACE-053(보충)
- 결정:
  - 【추론】 PR의 코드 범위가 시험·스토리·시나리오뿐이고 수치가 직접 재실행과 맞으며 결함은 모두 상류에서 고쳐졌으므로 머지에 남는 위험은 없다. 최상위 virtual 형은 런타임이 무시하는 자리를 형이 허용하는 함정이라 지워야 하지만 공개 형이므로 계획을 거친다.
- 근거: fairy07의 PR 본문과 보고; 직접 재실행 결과; 198라운드 소유자 답(부속 PR은 검증 뒤 머지, 워크트리 정리); NODE-032; LANDING-032.
- 다음: 원장 관리자가 세 세션에 알렸다.

## 덧붙임 (2026-10-13, 32b 시작 기록; 문서 정합 verifier FAIL 6건)

32b는 21:22:19 UTC 시작(load 2.20, W HEAD 1daf55be4, git 상태 깨끗). 첫 부분 react-main-a 예산 추정 3,698 s + 예비 1,200 s = 4,898 s, 남은 예산 7,100 s. 첫 시작(21:11)은 0.1초 만에 다섯 부분 모두 실패 — run-session-131의 verify-bundles-131이 base·candidate 항목의 revision이 매니페스트 baseRevision과 같기를 요구하는데 32b의 candidate 항목에 자기 커밋(0517e21cf)이 기록돼 있었음(32a는 candidate가 base 위 작업 트리라 둘 다 base로 기록). 커밋된 도구는 고치지 않고 scratchpad의 bundles.json만 고침: 모든 항목 revision을 세션 기준 c04c74fe1로, 실제 빌드 커밋은 sourceRevision으로(번들 파일·SHA-256 불변); verifyBundles131 직접 통과 확인 뒤 재시작; 첫 시도 결과물은 superseded-launch1/ 보존. 원장 관리자 판단: 매니페스트 메타데이터만의 조정이고 번들·해시가 같으므로 판정 값에 영향 없음, 판정 보고에 이 편차를 적는다. 두 세션(reviewer·fairy07)에는 머지 직후 32b 동안 무거운 실행 금지를 이미 알렸다.

문서 정합 verifier FAIL(차단 6건): (1) else 조건 서술 오류, (2) 같은 경로 입력 문장의 "커밋될 때까지" 오류(타이핑은 매 키마다 커밋되고 다른 입력은 Refresh가 닿을 때까지 옛 텍스트 유지 — fixy07의 브리프 탓), (3) setValue 뒤 controls 상태가 늦다는 옛 서술, (4) `'../items.length > 0'` 예시가 items.length 속성을 읽음, (5) rule.md:98의 if/then/else "검증 전용" 문장 누락, (6) 가상 노드를 "조건부·파생 필드"로 설명. 통과: 한국어 일치, 링크, 옛 문법 0건, 덧붙임 2~4. 순환 injectTo는 조용히 막히지 않고 25라운드 상한에서 degraded가 되며 그 쓰기가 던진다(derive/DETAIL). worker가 고치고 verifier가 고친 부분만 재대조; W 커밋은 32b 뒤.
