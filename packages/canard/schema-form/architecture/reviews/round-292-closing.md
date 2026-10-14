# 292라운드 닫기 — 문서 정합 PR #373 병합(0d17c3080), 정돈-1 편집자 결정 둘, 대기열 51 개설

2026-10-14. 290라운드로 배정된 fairy08이 SPECIFICATION·README·QUICK_REFERENCE·docs/README·스킬 지식 파일·문서 사이트 api-reference(en·ko)를 07 엔진 코드와 줄 단위로 대조해 어긋남 18건(실제로 틀린 12, 빠진 3, 낡은 표현 3)을 고친 PR #373을 열었다. 원장 관리자가 diff를 대조했고(소스 변경은 `ShowError.Touched` 주석 세 줄과 시험 주석 한 곳뿐, 세션 줄·옛 이름 0), 남은 조각 셋(api-reference.mdx, reset()의 첨부 파일·showError 초기화 문장, 시험 주석)을 같은 PR에 넣게 한 뒤 squash 병합했다. 같은 라운드에 정돈-1 진행 중 fixy08이 올린 결정 둘을 편집자 결정으로 적는다.

### 292C-01 PR #373(문서 정합)을 0d17c3080으로 1.0.0-beta에 squash 병합했다 — 동작 변경 없음, 문서 18건과 주석 넷

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 게이트는 fairy08이 돌렸다: documents 빌드 en·ko 성공, prettier 0(바뀐 패키지 파일), 세션 줄·옛 이름·개인 이름 0, verifier 첫 회 FAIL 9건 반영 뒤 PASS. 원장 관리자는 `git diff origin/1.0.0-beta...origin/feat/schema-form-docs-align`으로 `src` 아래 변경이 주석뿐임을 직접 확인했다. 문서만의 변경이라 Claude 세션이 직접 고쳤다(217C-01). 가지는 지웠다.
- 근거: PR #373 본문(18건 표, 코드 근거 path:line); fairy08 보고; 원장 관리자 diff 대조.
- 다음: api-reference.mdx(en·ko)에 남은 옛 엔진 내용(enhancedValue, findAll, node.publish, undefined를 돌려주는 find(), JSONSchemaError[], 함수형 setValue)은 페이지 전체 재작성이라 정돈-4 문서 PR로 넘긴다. 두 파일의 prettier 미정렬(이 PR 전부터)도 그때 함께.

### 292C-02 정돈-1의 편집자 결정 둘 — 공유 보조 함수는 `helpers/error`에 남기고, `types/rolled` 둘은 지우지 않는다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 (1) 남는 포맷터 넷이 공유하는 `createDivider`·`getErrorMessage`는 소비자 소유자 넷(app/plugin, helpers/fieldInputDefinition, helpers/virtualization/VirtualizationManager, blueprint/…/createDynamicFunction)의 최소 공통 fractal이 `src`이므로 `helpers/error`에 남기고 index가 `formatValidationError`와 함께 셋을 내보낸다(fixy08 선택지 1; 복제는 reuse-first 위반, 새 fractal은 과잉). (2) `types/rolled/fieldRenderer.ts`·`form.ts`는 루트 `src/index.ts:84`의 `export type *`로 공개 이름이며 플러그인 넷이 쓰므로 정돈-1에서 삭제를 뺀다(원장 관리자의 전수 검사가 와일드카드 재수출을 놓친 오판, `plan/tidy-structure/request.md` §7). 표면 게이트는 "컴파일러로 열거한 공개 이름·형 문자열 목록이 1.0.0-beta 끝단과 같다"로 강화해 정돈 PR 전부에 적용한다.
- 근거: fixy08 결정 요청 둘(원장 세션 수신); `src/index.ts:84`; antd5 플러그인 `FieldRendererProps` import; plan/tidy-structure/request.md §7.
- 다음: 정돈-1 PR을 기다린다. `.filid/config.json`의 schema-form `zero-peer-file` 면제는 정돈-3에서 지운다.
