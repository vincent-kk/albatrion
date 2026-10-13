# 231라운드 닫기 — 230라운드 소유자 답의 배분: 07b-2 PR(fixy07·codex; CLAUDE.md 절, 플러그인 잔여 넷, 시험 타이밍 둘)과 문서 사이트 PR(fairy07); 대기열 19·22·23 닫힘; 9·26은 설명 뒤 결정

2026-10-13. 230라운드의 일곱 답을 배분한다. 217C-01 정책(계획은 Claude 세션, 구현은 codex, 검증은 Claude 세션)과 220C-01의 닫힌 범위는 그대로이며, 소유자가 승인한 항목만 새 범위다.

### 231C-01 (1) 07b-2 PR — fixy07이 feat/schema-form-switch(b1da5e771) 위에 브랜치 feat/schema-form-07b-2를 만들고 세 커밋으로 진행한다: ① 패키지 CLAUDE.md "Computed Properties" 절을 controls.* 작성 표면으로 갱신(대기열 10, 소유자 직접 승인 230라운드; CLAUDE.md 변경은 이 절에 한정), ② 플러그인 입력 설정 자리 잔여 넷을 216C-04와 같은 규칙으로 정리(대기열 20: mui Slider의 맨 `lazy`와 NullHandling 스토리의 맨 `marks`, antd Switch 둘의 `options.alias`, 플러그인 스토리의 맨 `FormTypeInput` → `presentation.FormTypeInput`, DateFormat의 `date-time` input type), ③ 시험 타이밍 둘(대기열 25·27: ImeComposition을 제한 시간 있는 대기로, global-errors.timing의 단발 벽시계 비교를 반복 중앙값으로) — 각 커밋은 seiri 계획 → codex 구현 → 직접 검증(시험·typecheck·lint; 플러그인 넷은 바뀐 플러그인의 build) → verifier 순이고, 제품 런타임 동작 변경은 없어야 한다(②는 스토리·플러그인 형·입력 설정 자리만); (2) 문서 사이트 PR — fairy07이 feat/schema-form-switch 위 브랜치 docs/schema-form-authoring-syntax에서 documents/docs/canard/schema-form/의 core-concepts.mdx:149, examples/index.mdx:280, examples/role-based-access.mdx:10과 ko i18n 사본의 옛 작성 문법을 패키지 README·명세의 현행 문법으로 치환(대기열 17); 코드 변경 없음, 치환 전후 비교표를 PR 본문에; (3) 대기열 19는 닫힘(옛 키는 모르는 키로 검증기에 넘기는 현행 유지, CONTROLS-078), 22는 닫힘(변경 없음; 소유자가 물은 프로덕션 React의 호출 횟수는 원장 관리자가 fixy07의 val-207 조사로 확인해 보고), 23은 조건부 닫힘(형 추론 방해나 단언 강제 사례가 보고되면 다시 올림); (4) 대기열 9(내장 입력의 영역 밖 값 표시)와 26(ajv6·7 가드 포인터의 `#` 접두 퍼센트 인코딩)은 소유자가 설명을 요구해 원장 관리자가 설명한 뒤 결정을 받는다; (5) 두 PR 모두 비차단 발견은 대기열로, 머지는 원장 관리자 검증 뒤 소유자 허가로

- 닫는 항목: LANDING-204(보충), CONTROLS-081(보충)
- 결정:
  - 【추론】 승인된 다섯 변경은 모두 패키지 안의 문서·스토리·플러그인 형·시험이라 한 PR로 묶어도 검증 비용이 작고, 문서 사이트는 패키지 밖이라 따로 둔다.
- 근거: 230라운드 소유자 답; 217C-01; 216C-04; 220C-01.
- 다음: fixy07·fairy07에 배정 전달.
