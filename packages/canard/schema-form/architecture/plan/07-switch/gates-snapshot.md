# 07 게이트 원장 사본(2026-10-12, G27 닫힘 뒤)

정본은 워크트리의 `.seiri/tasks/schema-form-switch/gates.md`(gitignore)다. 이 사본은 72시간 유휴 삭제에 대비한 기록이며, 정본이 없으면 이 파일을 정본 자리로 복사해 쓴다.

# Gates: schema-form-switch

Plan: ../../../packages/canard/schema-form/architecture/plan/07-switch/execution-plan.md

## U0 — 착수

- [x] G1: 독립 리뷰어(antigravity, 멈추면 Claude verifier)의 `seiri:review-plan`이 이 계획에 `cleared` 판정을 냈고 판정과 반영이 계획 §9에 있다
      EVIDENCE: antigravity session a934a8d0: 1st verdict rework-required (F1–F10, 3 blocking) at a44003ddd; scoped recheck verdict cleared, no new defects, at 94aeaa468. Recorded in execution-plan §9 rows 1–2.

- [x] G2: `PLAN.md` §3의 07 행이 `진행`이고 07 `log.md`가 있다
      CHECK: `grep -qE '^\| 07 \| 전환 \| 진행 \|' packages/canard/schema-form/architecture/PLAN.md && test -f packages/canard/schema-form/architecture/plan/07-switch/log.md && echo BOARD_IN_PROGRESS`
      EXPECT: `BOARD_IN_PROGRESS`
      EVIDENCE: BOARD_IN_PROGRESS

## U1 — 전환 직전 기준선

- [x] G3: 패키지 벤치의 옛 기준선과 렌더 시험 처분표 초안이 전환 직전 커밋 해시와 센 명령을 머리에 적은 채 있다
      CHECK: `(d=packages/canard/schema-form/architecture/verification/07-switch; test -s $d/bench-legacy-baseline.json && grep -q '전환 직전 커밋' $d/render-disposition.md && grep -q 'TEST-005' $d/render-disposition.md) && echo BASELINE_CAPTURED`
      EXPECT: `BASELINE_CAPTURED`
      EVIDENCE: BASELINE_CAPTURED

- [x] G4: 이주 점검표의 행 수가 추출 스크립트가 원장에서 센 `### LANDING-nnn 이주` 머리의 수와 같다
      CHECK: `(cd packages/canard/schema-form/architecture && node verification/07-switch/tools/extract-migration-rows.mjs --check verification/07-switch/migration-check.md) && echo MIGRATION_ROWS_MATCH`
      EXPECT: `MIGRATION_ROWS_MATCH`
      EVIDENCE: MIGRATION_ROWS_MATCH

- [x] G5: 옛 스토리 정리표가 49파일을 들고, benchmark-form이 `@canard/schema-form_0.16.0` 별칭을 가진다
      CHECK: `(test "$(grep -c '\.stories\.tsx' packages/canard/schema-form/architecture/verification/07-switch/story-disposition.md)" -eq 49 && grep -q '"@canard/schema-form_0.16.0"' packages/aileron/benchmark-form/package.json) && echo STORIES_AND_ALIAS_OK`
      EXPECT: `STORIES_AND_ALIAS_OK`
      EVIDENCE: STORIES_AND_ALIAS_OK

## U3 — react-utils(U2 문서 선행의 RU 쪽 판정 포함)

- [x] G6: react-utils `withErrorBoundary`의 `DETAIL.md`를 고친 커밋이 그 모듈의 코드를 고친 첫 커밋보다 앞선다(U3 끝에 판정, PR 머지 전 브랜치 이력)
      CHECK: `(b=$(git merge-base HEAD origin/1.0.0-beta); d=$(git log --reverse --format=%ct $b..HEAD -- packages/winglet/react-utils/src/hoc/withErrorBoundary/DETAIL.md | head -1); c=$(git log --reverse --format=%ct $b..HEAD -- 'packages/winglet/react-utils/src/**/*.tsx' | head -1); test -n "$d" && test -n "$c" && test "$d" -lt "$c") && echo RU_DOCS_FIRST`
      EXPECT: `RU_DOCS_FIRST`
      EVIDENCE: RU_DOCS_FIRST

- [x] G7: react-utils 시험·형이 초록이고 `.changeset/`에 `@winglet/react-utils` `minor` 파일이 있다
      CHECK: `(cd packages/winglet/react-utils && npx vitest run --reporter=dot && npx tsc --noEmit -p tsconfig.json) && grep -lq "'@winglet/react-utils': minor" .changeset/*.md && echo RU_GREEN_WITH_CHANGESET`
      EXPECT: `RU_GREEN_WITH_CHANGESET`
      EVIDENCE: RU_GREEN_WITH_CHANGESET

## U4 — core 통로

- [x] G9: core 통로 시험 태그(REACT-009, WRITE-083, 69C-05, WRITE-045, WRITE-046, REACT-003, REACT-024)가 core 시험 파일에 모두 있고 그 시험들이 초록이다
      CHECK: `(for id in REACT-009 WRITE-083 69C-05 WRITE-045 WRITE-046 REACT-003 REACT-024; do grep -rq --include='*.test.ts' --include='*.spec.ts' -- "$id" packages/canard/schema-form/src/core || exit 1; done; cd packages/canard/schema-form && npx vitest run --project unit --reporter=dot src/core -t "REACT-009|WRITE-083|69C-05|WRITE-045|WRITE-046|REACT-003|REACT-024") && echo CORE_CHANNELS_GREEN`
      EXPECT: `CORE_CHANNELS_GREEN`
      EVIDENCE: CORE_CHANNELS_GREEN

- [x] G10: 02–06의 core 시험 전체가 초록이다
      CHECK: `(cd packages/canard/schema-form && npx vitest run --project unit --reporter=dot src/core) && echo CORE_ALL_GREEN`
      EXPECT: `CORE_ALL_GREEN`
      EVIDENCE: CORE_ALL_GREEN

- [x] G11: 의존 방향 시험이 `SchemaNode/utils/binding`을 단언하고 초록이다
      CHECK: `(grep -q 'binding' packages/canard/schema-form/src/core/__tests__/dependencyDirection.test.ts && cd packages/canard/schema-form && npx vitest run --project unit --reporter=dot src/core/__tests__/dependencyDirection.test.ts) && echo BINDING_DIRECTION_OK`
      EXPECT: `BINDING_DIRECTION_OK`
      EVIDENCE: BINDING_DIRECTION_OK

## U5–U8 — 전환 묶음(U2 문서 선행의 렌더 쪽 판정 포함)

- [x] G8: 렌더 계층의 문서 선행 커밋(`src/providers/DETAIL.md`)이 렌더 계층 코드를 고친 첫 커밋보다 앞선다(U6 끝에 판정)
      CHECK: `(b=$(git merge-base HEAD origin/1.0.0-beta); d=$(git log --reverse --format=%ct $b..HEAD -- packages/canard/schema-form/src/providers/DETAIL.md | head -1); c=$(git log --reverse --format=%ct $b..HEAD -- 'packages/canard/schema-form/src/providers/**/*.tsx' 'packages/canard/schema-form/src/components/**/*.tsx' | head -1); test -n "$d" && test -n "$c" && test "$d" -lt "$c") && echo RENDER_DOCS_FIRST`
      EXPECT: `RENDER_DOCS_FIRST`
      EVIDENCE: RENDER_DOCS_FIRST

- [x] G12: `src/core/index.ts`·`nodeFromJSONSchema.ts`·`src/index.ts`가 레거시를 가리키지 않고, `core/types/node.ts`·`constructor.ts`가 없으며, 패키지 소스(레거시 제외)에 `FormTypeRenderer` 칸 선언이 0이다
      CHECK: `(p=packages/canard/schema-form/src; ! grep -n '__legacy__' $p/core/index.ts $p/core/nodeFromJSONSchema.ts $p/index.ts && test ! -e $p/core/types/node.ts && test ! -e $p/core/types/constructor.ts && ! grep -rnE --include='*.ts' --include='*.tsx' '(^|[^A-Za-z])FormTypeRenderer[?]?:' $p --exclude-dir=__legacy__) && echo ENTRY_SWITCHED`
      EXPECT: `ENTRY_SWITCHED`
      EVIDENCE: ENTRY_SWITCHED

- [x] G13: 레거시 밖의 패키지 소스에서 `__legacy__`를 가리키는 import가 0이고, 경계 린트가 `src/core/**` 전체를 덮으며, lint가 초록이다
      CHECK: `(! grep -rnE --include='*.ts' --include='*.tsx' "from ['\"][^'\"]*__legacy__" packages/canard/schema-form/src --exclude-dir=__legacy__ && grep -q "'src/core/\*\*/\*.{ts,tsx}'" packages/canard/schema-form/eslint.config.js && cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}") && echo LEGACY_IMPORTS_ZERO`
      EXPECT: `LEGACY_IMPORTS_ZERO`
      EVIDENCE: LEGACY_IMPORTS_ZERO

- [x] G13b: 레거시와 새 코드가 양방향으로 서로를 가져오지 않는다(74라운드 소유자 답, LANDING-159 규칙 2 폐기)
      CHECK: `(cd packages/canard/schema-form && node architecture/verification/07-switch/tools/check-legacy-isolation.mjs && npx eslint "src/__legacy__/**/*.{ts,tsx}") && echo LEGACY_BOTH_WAYS_ZERO`
      EXPECT: `LEGACY_BOTH_WAYS_ZERO`
      EVIDENCE: LEGACY_BOTH_WAYS_ZERO (2026-10-11, worktree HEAD 78841d697; CHECK run verbatim, recorded by hand because the gates tool reads the main checkout)

- [x] G14: 바인딩 계약 다섯과 렌더 계층의 일(REACT-007·009·011·012, LANDING-075, REACT-024)의 태그가 렌더 시험에 모두 있고, `render` 프로젝트 전체가 초록이다
      CHECK: `(for id in REACT-007 REACT-009 REACT-011 REACT-012 LANDING-075 REACT-024; do grep -rq --include='*.test.tsx' -- "$id" packages/canard/schema-form/src || exit 1; done; cd packages/canard/schema-form && npx vitest run --project render --reporter=dot) && echo RENDER_GREEN_WITH_CONTRACTS`
      EXPECT: `RENDER_GREEN_WITH_CONTRACTS`
      EVIDENCE: RENDER_GREEN_WITH_CONTRACTS

- [x] G15: 패키지 `tsc`가 초록이고 공개 형 시험의 태그(SURFACE-059, NODE-058, EVENT-073)가 시험 파일에 있으며 그 시험들이 초록이다
      CHECK: `(for id in SURFACE-059 NODE-058 EVENT-073; do grep -rq --include='*.test.ts' --include='*.test.tsx' --include='*.type-test.ts' -- "$id" packages/canard/schema-form/src || exit 1; done; cd packages/canard/schema-form && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json && npx vitest run --project unit --project render --reporter=dot -t "SURFACE-059|NODE-058|EVENT-073") && echo PUBLIC_TYPES_OK`
      EXPECT: `PUBLIC_TYPES_OK`
      EVIDENCE: PUBLIC_TYPES_OK

- [x] G16: 입력 계약·기본 union 입력·입력 판정·빈 `ChildNodeComponents` 경고의 태그(REACT-027·028·033, ERROR-202)가 렌더 시험에 있고 초록이며, `FormTypeInputProps`의 `value`·`onChange` 문서 주석이 REACT-027의 계약(초안은 입력이 듦, 빈 칸 `undefined`, 비우기는 nullable이면 `null`)을 적는다(LANDING-150)
      CHECK: `(for id in REACT-027 REACT-028 REACT-033 ERROR-202; do grep -rq --include='*.test.tsx' -- "$id" packages/canard/schema-form/src || exit 1; done; c=$(sed -n '/Current value/,/onFileAttach handler/p' packages/canard/schema-form/src/types/formTypeInput.ts); echo "$c" | grep -qi 'draft' && echo "$c" | grep -q 'undefined' && echo "$c" | grep -q 'nullable' && cd packages/canard/schema-form && npx vitest run --project render --reporter=dot -t "REACT-027|REACT-028|REACT-033|ERROR-202") && echo INPUT_CONTRACTS_GREEN`
      EXPECT: `INPUT_CONTRACTS_GREEN`
      EVIDENCE: INPUT_CONTRACTS_GREEN

- [x] G17: 렌더 시험 처분표의 모든 행에 처분과 새 자리가 있다(빈 표 칸 0, `TBD` 0)
      CHECK: `(f=packages/canard/schema-form/architecture/verification/07-switch/render-disposition.md; grep -q '산다' $f && ! grep -q 'TBD' $f && ! grep -nE '\|[[:space:]]*\|' $f) && echo DISPOSITION_COMPLETE`
      EXPECT: `DISPOSITION_COMPLETE`
      EVIDENCE: DISPOSITION_COMPLETE

- [x] G17b: 옛 스토리 처분표의 모든 행에 처분과 새 자리가 있다(77C-01)
      CHECK: `(f=packages/canard/schema-form/architecture/verification/07-switch/story-disposition.md; ! grep -q 'TBD' $f && ! grep -nE '\|[[:space:]]*\|' $f && test "$(grep -c '\.stories\.tsx' $f)" -ge 49) && echo STORY_DISPOSITION_COMPLETE`
      EXPECT: `STORY_DISPOSITION_COMPLETE`
      EVIDENCE: STORY_DISPOSITION_COMPLETE (2026-10-11, worktree HEAD 78841d697; CHECK run verbatim, recorded by hand because the gates tool reads the main checkout)

- [x] G19b: U9 끝에 옛 평면 스토리 파일이 남지 않고, Storybook·tsconfig의 임시 제외 항목도 없다(77C-01)
      CHECK: `(p=packages/canard/schema-form; test -z "$(find $p/stories -maxdepth 1 -name '*.stories.tsx')" && ! grep -rn '77C-01' $p/tsconfig.json $p/.storybook) && echo OLD_STORIES_GONE`
      EXPECT: `OLD_STORIES_GONE`
      EVIDENCE: OLD_STORIES_GONE (2026-10-11, worktree HEAD 78841d697; CHECK run verbatim, recorded by hand because the gates tool reads the main checkout)

## U9 — e2e·스토리·스파이크

- [x] G18: `src/__tests__/e2e/` 파일마다 시험이 15건 이하이고 e2e가 초록이며, `log.md`의 스파이크 사례표에 빈 칸이 없다
      CHECK: `(d=packages/canard/schema-form/src/__tests__/e2e; ls $d/*.test.tsx >/dev/null || exit 1; for f in $d/*.test.tsx; do n=$(grep -cE '^[[:space:]]*(it|test)(\.[a-z]+)?\(' $f); test $n -le 15 || exit 1; done; s=$(sed -n '/^## 5\. 스파이크 사례표/,/^## 6\./p' packages/canard/schema-form/architecture/plan/07-switch/log.md); echo "$s" | grep -q 'spikes/' && ! echo "$s" | grep -qE '\|[[:space:]]*\||TBD' && cd packages/canard/schema-form && npx vitest run --project render --reporter=dot src/__tests__/e2e) && echo E2E_OK`
      EXPECT: `E2E_OK`
      EVIDENCE: E2E_OK

- [x] G19: 옛 스토리가 storybook 글롭에서 빠지고(넓은 `stories/**` 글롭 없음) `stories/scenarios/`의 시나리오 스토리가 있다
      CHECK: `(m=packages/canard/schema-form/.storybook/main.ts; ls packages/canard/schema-form/stories/scenarios/*.stories.tsx >/dev/null && grep -q 'stories/scenarios' $m && ! grep -qF '../stories/**/*.stories' $m) && echo STORIES_SWITCHED`
      EXPECT: `STORIES_SWITCHED`
      EVIDENCE: STORIES_SWITCHED

## U10 — 이주 점검

- [x] G20: 이주 점검표의 모든 행에 처분이 있고, (나) 처분은 시험 이름을 인용하며, (가)·(나)가 인용한 시험 이름이 저장소의 시험 파일에 있다
      CHECK: `(cd packages/canard/schema-form/architecture && node verification/07-switch/tools/extract-migration-rows.mjs --check-complete verification/07-switch/migration-check.md) && echo MIGRATION_CHECK_COMPLETE`
      EXPECT: `MIGRATION_CHECK_COMPLETE`
      EVIDENCE: MIGRATION_CHECK_COMPLETE

- [x] G21: 채움 시점 이주 행 셋의 태그(LANDING-200·201·202)가 이주 대조 시험에 있고 이주 대조 시험 전체가 초록이다
      CHECK: `(for id in LANDING-200 LANDING-201 LANDING-202; do grep -rq --include='*.test.tsx' -- "$id" packages/canard/schema-form/src/__tests__ || exit 1; done; cd packages/canard/schema-form && npx vitest run --project render --reporter=dot src/__tests__/migration) && echo MIGRATION_TESTS_GREEN`
      EXPECT: `MIGRATION_TESTS_GREEN`
      EVIDENCE: MIGRATION_TESTS_GREEN

## U11 — React 18·브라우저

- [x] G22: `react18` 프로젝트가 초록이고, EVENT-070 이펙트 되먹임 사례의 태그가 시험 파일에 있으며 두 판에서 초록이다
      CHECK: `{ (grep -rq --include='*.test.tsx' -- 'EVENT-070' packages/canard/schema-form/src packages/canard/schema-form/architecture/spikes/events || exit 1; cd packages/canard/schema-form && npx vitest run --project react18 --reporter=dot && npx vitest run --project react18 --project render --reporter=dot -t "EVENT-070") && echo REACT18_GREEN; } 2>&1 | tail -3`
      NOTE: 2026-10-07 — 전체 출력이 48 KB를 넘어 도구가 결과를 파일로 빼면 원장 훅이 표지를 보지 못한다. CHECK 전체를 묶어 끝 세 줄만 남김(표지는 성공 때만 찍히므로 판정 조건은 같음)
      EXPECT: `REACT18_GREEN`
      EVIDENCE: REACT18_GREEN

- [ ] G23: storybook 브라우저 프로젝트가 초록이고 브라우저 게이트 보고서가 네 게이트(EVENT-065, REACT-027, REACT-028, 18C-73)의 결과 행을 든다
      CHECK: `(f=packages/canard/schema-form/architecture/verification/07-switch/browser-gates.md; for id in EVENT-065 REACT-027 REACT-028 18C-73; do grep -q -- "$id" $f || exit 1; done; cd packages/canard/schema-form && npx vitest run --project storybook --reporter=dot) && echo BROWSER_GATES_GREEN`
      EXPECT: `BROWSER_GATES_GREEN`
      EVIDENCE: pending

## U12 — UI 플러그인

- [x] G24: UI 플러그인 넷의 `src`에서 `node.group`과 `FormTypeRenderer` 칸 선언이 0이고, 이름 이주 뒤 `node.strategy`를 쓴다(빌드 초록은 G29의 단독 호출로)
      CHECK: `(cd packages/canard && ! grep -rnE 'node\.group([^A-Za-z]|$)|(^|[^A-Za-z])FormTypeRenderer[?]?:' schema-form-antd5-plugin/src schema-form-antd6-plugin/src schema-form-antd-mobile-plugin/src schema-form-mui-plugin/src && grep -rq 'node\.strategy' schema-form-antd5-plugin/src && grep -rq 'node\.strategy' schema-form-antd6-plugin/src && grep -rq 'node\.strategy' schema-form-antd-mobile-plugin/src && grep -rq 'node\.strategy' schema-form-mui-plugin/src) && echo PLUGIN_NAMES_MIGRATED`
      NOTE: 2026-10-03 — 원래 CHECK는 `$ps`의 단어 나눔에 기대어 zsh에서 경로 넷이 한 인자로 넘어갔다. 경로를 풀어 적어 셸과 무관하게 함(판정 조건은 같음)
      EXPECT: `PLUGIN_NAMES_MIGRATED`
      EVIDENCE: PLUGIN_NAMES_MIGRATED

## U13 — 벤치·번들

- [x] G25: benchmark-form의 `fixtures/equivalent` 쌍이 두 판에서 같은 `[data-path]` 집합을 그린다는 시험이 있고 초록이다
      CHECK: `(ls packages/aileron/benchmark-form/fixtures/equivalent/*.ts >/dev/null && cd packages/aileron/benchmark-form && npx vitest run --reporter=dot equivalent) && echo EQUIVALENT_PATHS_OK`
      EXPECT: `EQUIVALENT_PATHS_OK`
      EVIDENCE: EQUIVALENT_PATHS_OK

- [x] G26: `performance.md`가 벤치 표, 번들 크기(minify gzip과 기준 37,023 B, 비압축 gzip과 기준 51,632 B), 타입 검사 시간을 들고, 느린 행마다 소유자 수용의 라운드가 적혀 있다(수용 대기 행은 `수용 대기`로 표시되어 병합 전 0이어야 함). 판정 기준(85C-01, 86C-01, 91라운드 소유자 답): 분기 없는 폼과 식만 있는 폼은 0.16.0 대비 중앙값으로 코어 마운트·갱신 1.5배, React(production profiling) 마운트 1.2배·갱신 1.0배 이내. 분기·조건 폼(oneOf·if/then)은 배율이 아니라 셋 — (1) 전환 비용이 건드리지 않은 분기의 수(5·10·20·40)에 따라 늘지 않음(GOAL-011), (2) 단계별 진단에서 두 번 하는 일과 쓰이지 않는 장부가 없음, (3) 남은 배율의 수치와 단계별 까닭이 기록되어 소유자에게 보임; React 층은 코어 몫을 뺀 렌더·커밋 몫이 옛 판 이하; ajv 몫은 기록만
      CHECK: `(f=packages/canard/schema-form/architecture/verification/07-switch/performance.md; grep -q '37,023' $f && grep -q '51,632' $f && grep -q 'typecheck' $f && grep -q 'benchmark-form' $f && ! grep -q '수용 대기' $f && ! grep -q '재판정 중' $f) && echo PERFORMANCE_REPORTED`
      EXPECT: `PERFORMANCE_REPORTED`
      EVIDENCE: PERFORMANCE_REPORTED (2026-10-12, CHECK run verbatim after round 157: the owner accepted the three array rows at the session-156 final figures, verification/07-switch/profile-156-final.md; array-replace-200 render-side gap carried to 07b item 32; all 24 `재판정 중` marks replaced). History: reopened by round 143 for the three array update rows (array-push-100, array-replace-200, array-push-remove-100); CHECK now also requires no `재판정 중` mark. Previously PERFORMANCE_REPORTED at f8bf0d85b. Array stage 2 fix ① committed at e1d3a8914 (session 154 React ADOPT, core ADOPT; push-100 update-wall −9.208 ms, push-remove-100 −14.396 ms; replace-200 unreached; round 154 closed by the manager at 1.0.0-beta df58ddb25). Fix ② (array child-selection reuse) committed at e9c408980 (session 155 React ADOPT, core ADOPT, 0 regressions; push-remove-100 update-wall −4.046 ms gain, push-100 −2.268 ms below the gain floor; replace-200 unreached; adopted by the manager in 155C-01). Remaining: the final three-row re-measurement (0.16.0 against e9c408980, official procedure, both columns plus the drainTicks comparison column), recorded as round 156.

## Final

- [x] G27: 새 컨텍스트 verifier의 `seiri:verify`가 최초 기준선·원장·계획 대비 통과 판정을 냈다
      EVIDENCE: PASS (2026-10-12): phase-4 scoped recheck at HEAD 940b7e792 by a fresh codex high session (cb1e1fea), appended to verification/07-switch/g27-phase4.md, "G27 최종 판정: PASS"; B2 closed by the G32 range cross-check, B3 closed by the fresh G31 facts and boundaries+dag ok (main-session re-run at 940b7e792: ok, 266 passed, 0 failed, snapshot 26c2268d…; the codex-side indeterminate run read a separate facts store). Non-blocking: N2 (fixed scratch path in a count test), N3–N5 as listed in g27-phase4.md. History: 미충족(최종 verify 대기). B1 (14 core type assertions) is resolved under rounds 146, 149 and 150: 11 removed (#1, #2, #5, #6, #10, #14 by zero-JS type fixes in 34b370eed and 62e140d8d with byte-identical bundles; #4, #8, #9, #11, #13 by runtime guards in 0eb8e3ada, verdict session 153 React ADOPT and core ADOPT, 0 regressions, verification/07-switch/g27-runtime-guards-153.md), and 3 kept as reasoned assertions (#3, #7, #12; round 150 principle 3). Earlier third-pass verify (HEAD a76ebf44a, g27-phase3.md): B2, B4, B5, B6, N1 resolved; N2 open (non-blocking). Phase 4 (2026-10-12, HEAD ee3b730c0, codex high, g27-phase4.md): FAIL with 2 blocking, both evidence gaps (B2 G32 range, B3 G31 stale facts), B1 resolved; both gaps refilled on 2026-10-12 (G31, G32 evidence above). Phase-4 scoped recheck: PASS.

- [x] G28: 패키지 lint와 typecheck가 초록이다
      CHECK: `(cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json) && echo LINT_TYPECHECK_OK`
      EXPECT: `LINT_TYPECHECK_OK`
      EVIDENCE: LINT_TYPECHECK_OK

- [x] G29: 패키지 unit·render·react18 전체와 SCN 시험이 초록이다(플러그인 넷의 빌드는 단독 호출 `yarn workspace <플러그인> build` 결과를 `log.md`에 증거로 적는다)
      CHECK: `{ (cd packages/canard/schema-form && npx vitest run --project unit --project render --project react18 --reporter=dot) && (cd packages/aileron/schema-form-scenarios && npx vitest run --config vite.config.ts --reporter=dot) && echo ALL_TESTS_GREEN; } 2>&1 | tail -3`
      NOTE: 2026-10-07 — 전체 출력이 48 KB를 넘어 도구가 결과를 파일로 빼면 원장 훅이 표지를 보지 못한다. CHECK 전체를 묶어 끝 세 줄만 남김(표지는 성공 때만 찍히므로 판정 조건은 같음)
      EXPECT: `ALL_TESTS_GREEN`
      EVIDENCE: ALL_TESTS_GREEN

- [x] G30: 원장 인용 검사의 문제가 0이다
      CHECK: `(cd packages/canard/schema-form/architecture && node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md | tail -1 | grep -q 'problems 0$') && echo LEDGER_LINKS_OK`
      EXPECT: `LEDGER_LINKS_OK`
      EVIDENCE: LEDGER_LINKS_OK

- [x] G31: filid 스캔에서 organ 외부 소비와 순환이 0이다
      EVIDENCE: Re-run 2026-10-12 at HEAD ee3b730c0 (src tree 8b2586417…) after G27 phase 4 B3: facts re-extracted and submitted, 1,108 files accepted, 0 rejected; fractal_inspect validate boundaries+dag status ok, 0 findings, 266 passed, 0 failed, snapshot 26c2268d…; 10 document-contract diagnostics outside this gate (log.md 2026-10-12). Earlier: re-run 2026-10-11 at the rebased tip f8a39d65e (src tree byte-identical to 98227ab19): facts 1,097 files exact, 0 rejected, 0 uncertain; fractal_inspect validate boundaries+dag status ok, 0 findings, 260 passed, snapshot 282ab981… (same as at 78841d697). Six-scope findings outside this gate are pre-existing (log.md 2026-10-11 gate recheck).

- [x] G32: antigravity(멈추면 Claude verifier)의 원장 대 구현 대조에서 차단 지적이 0이다
      EVIDENCE: 2026-10-12 cross-check over the five product commits a76ebf44a..ee3b730c0 (34b370eed, 62e140d8d, 0eb8e3ada, e1d3a8914, e9c408980) after G27 phase 4 B2: antigravity tier high, session e879ebb3, G32 PASS with 0 blocking, public surface unchanged; seven cited ledger headings checked by hand (g32-recheck.md, section 2026-10-12). Earlier: 2026-10-11 ledger-versus-implementation cross-check over the 13 source commits f9ae05d5e..a76ebf44a (src, excluding __legacy__): antigravity tier high, session 13fcda8b, G32 PASS with 0 blocking. All 19 cited ledger headings checked by hand at the cited lines; one cited path (src/types/formType.ts) does not exist but the public-type conclusion holds (src/types diff is error.ts comments only); its CLAUDE.md non-blocking note was already fixed in 78841d697. Recorded in verification/07-switch/g32-recheck.md, section 2026-10-11.

- [x] G33: `PLAN.md` §3의 07 행이 `리뷰`이고 PR 번호 링크를 든다(PR의 base가 `1.0.0-beta`임은 `gh pr view`의 단독 호출 결과를 `log.md`에 적는다)
      CHECK: `grep -qE '^\| 07 \| 전환 \| 리뷰 \| \[#[0-9]+\]' packages/canard/schema-form/architecture/PLAN.md && echo BOARD_IN_REVIEW`
      EXPECT: `BOARD_IN_REVIEW`
      EVIDENCE: BOARD_IN_REVIEW (2026-10-11; PR #354, base 1.0.0-beta per the standalone gh pr view recorded in log.md; CHECK run verbatim, recorded by hand)

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `f9ae05d5ea5e`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
