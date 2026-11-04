# 정돈-1 브리프 — 죽은 포맷터 삭제, nodeFromJSONSchema 하향, 미사용 형 삭제 (fixy08 → codex)

> 2026-10-14, 원장 관리자(노르덴컨트롤). 근거: `request.md` §2(F4·F8), 289라운드 결정 D1·D2(`../../reviews/round-289-owner-answers.md`). 진행 방식은 217C-01: fixy08이 seiri 계획과 codex 브리프를 쓰고 `/cennad:codex`로 보내며, 검증은 fixy08이 직접(전체 시험·typecheck·lint·build·verifier) 돌린다. 동작 불변 PR이다.

## 1. 자리

- 워크트리 `{repo}`, 브랜치 `feat/schema-form-tidy-1`, base `1.0.0-beta`(3dea8b550 이후 최신). PR base도 `1.0.0-beta`, squash 병합은 원장 관리자가 한다.
- 패키지 `packages/canard/schema-form`. `src/__legacy__`는 건드리지 않는다(09에서 지움).
- codex는 `.claude/`, settings, `architecture/`를 건드리지 않는다. 커밋에 세션 ID·co-author를 넣지 않는다.

## 2. 할 일 (문서가 코드보다 먼저: 각 fractal의 DETAIL을 같은 PR의 첫 커밋에서 고친다)

### 2.1 F4 — `src/helpers/error` 정리

- `src/helpers/error/formatErrorMessage/`의 포맷터 31개 중 제품 소비자가 있는 넷만 남긴다: `formatRegisterPluginError`, `formatFieldInputMapError`, `formatCreateDynamicFunctionError`, `formatVirtualizationDisabledWarning`. 나머지 27개 파일과 그 시험 11개(`formatErrorMessage/__tests__/`에서 삭제 대상만)를 지운다. 제품 소비자 판정은 "`src` 안 시험·스토리·벤치가 아닌 파일 또는 다른 패키지가 import"이며, 삭제 전에 `grep -rn <이름> packages --include=*.ts --include=*.tsx | grep -v __legacy__ | grep -v __tests__`로 각 이름을 한 번 더 확인하고 결과를 PR 본문에 적는다.
- 남는 넷은 각자의 유일한 소비자 곁으로 옮긴다(filid code-placement §1: 소비자 하나면 그 소유자의 organ). 소비자는 각각 `src/app/plugin/registerPlugin.ts`, `src/helpers/fieldInputDefinition/utils/pathExactMatchFnFactory.ts`, `src/core/engine/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts`, `src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts`다. 목적지는 각 소유 fractal의 `utils/` 아래(이미 `utils/`가 있으면 거기, 없으면 만든다). 포맷터의 시험이 있으면 함께 옮긴다.
- `src/helpers/error`에는 `formatValidationError/`만 남는다. `helpers/error/index.ts`는 `formatValidationError` 하나만 내보내고, `INTENT.md`·`DETAIL.md`를 새 범위로 고친다(`formatErrorMessage` 하위 fractal의 문서는 디렉터리와 함께 사라진다). `helpers/error`가 fractal로 남을 가치가 없으면(하나짜리) `formatValidationError`를 `helpers/error/formatValidationError.ts`로 올리고 fractal 하나로 합친다 — 판단은 fixy08이 하고 PR 본문에 적는다.

### 2.2 F8·D2 — `nodeFromJSONSchema` 하향

- `src/core/surface/nodeFromJSONSchema.ts`를 `src/core/surface/utils/nodeFromJSONSchema.ts`로 옮긴다(`utils/`가 있으면 거기). `src/core/surface/index.ts`와 `src/core/index.ts`에서 export를 **지운다**. 제품 소비자가 없고 시험·벤치·aileron 벤치마크만 쓰기 때문이다(소유자 결정 D2: 공개하지 않고 뿌리에서 내림).
- 소비자 경로 고침: `bench/*.bench.ts` 7개와 `packages/aileron/benchmark/src/targets/find/data.ts`는 파일 경로로 직접 import(`@/schema-form/core/surface/utils/nodeFromJSONSchema`). `src/core/surface/DETAIL.md`의 기존 시험·벤치 면제 선언에 이 파일을 더한다(이유: 벤치는 `src` 밖이라 진입점 없이 내부를 읽는다).
- 시험 14파일: `core` 하위 트리 안의 시험(`src/core/__tests__/*`, `src/core/engine/blueprint/__tests__/*`)은 파일 경로로 직접 import. `core` 밖의 셋(`src/components/Field/FieldInputSlot/__tests__/trackerCounts.test.tsx`, `src/fieldInputs/__tests__/array-memo.test.tsx`, `src/hooks/__tests__/useChildFieldErrors.binding.test.tsx`)은 이번에는 파일 경로로 직접 import하고 PR 본문에 "정돈-2(F6)에서 자리 재검토"로 적는다. `src/__tests__/switchSurface.type-test.ts`는 공개 표면 시험이므로 `nodeFromJSONSchema`가 더 이상 core index에 없다는 단언으로 바꾼다.
- 문서: `docs/en/SPECIFICATION.md`와 `docs/ko/SPECIFICATION.md`의 "Node Initialization" 절은 fairy08이 대체 문안을 준다(`Form`과 `RootNodeContext`로 노드를 얻는 예). fairy08의 문안이 오면 그대로 넣는다. `packages/canard/schema-form/CLAUDE.md:51`의 `nodeFromJSONSchema` 언급은 소유자 승인이 필요한 파일이므로 **손대지 않고** PR 본문에 "원장 관리자가 승인 뒤 고침"으로 적는다.

### 2.3 F4 — 미사용 형 둘

- `src/types/rolled/fieldRenderer.ts`, `src/types/rolled/form.ts`를 지우고 `types/rolled/index.ts`·DETAIL에서 뺀다. 지우기 전에 2.1과 같은 grep으로 소비자 0을 확인한다.

## 3. failing-first 신호

- 공개 표면 시험(`src/__tests__/switchSurface.type-test.ts` 또는 같은 자리의 표면 스냅샷)에 "`@/schema-form/core`는 `nodeFromJSONSchema`를 내보내지 않는다", "`helpers/error` index는 `formatValidationError`만 내보낸다"를 먼저 단언해 빨갛게 만든 뒤 구현으로 초록을 만든다.
- 삭제는 특성화 시험이 회귀 신호다: 기존 스위트 전체.

## 4. 게이트 (모두 PR 본문에 수치로)

- `yarn --cwd packages/canard/schema-form typecheck` 0, `lint` 0, `build` 성공, `test:production` 20.
- `yarn --cwd packages/canard/schema-form vitest run --project unit --project render --project react18 --reporter=json --outputFile=$TMPDIR/tidy1.json` — 통과 수는 3870에서 삭제한 시험만큼 준 값이어야 하고 실패 0. 삭제한 시험 수를 본문에 적는다.
- `yarn --cwd packages/canard/schema-form test --run --project storybook --reporter=dot` 251.
- 플러그인 일곱 `yarn --cwd {repo} workspace @canard/schema-form-<ajv6|ajv7|ajv8|antd-mobile|antd5|antd6|mui>-plugin test --run --reporter=dot` 모두 초록.
- 공개 `dist/index.d.ts`가 1.0.0-beta 끝단의 것과 **동일**(diff 0). 옛 이름 게이트 `grep -rlE "SchemaNode|FormTypeInput|FormTypeRenderer" dist | grep -v "^dist/__legacy__"` 빈 출력.
- aileron 벤치마크 패키지 typecheck(`yarn --cwd {repo} workspace @aileron/benchmark typecheck` — 스크립트 이름은 그 패키지 `package.json`에서 확인).
- `bench/` 7파일은 `yarn --cwd packages/canard/schema-form vitest bench --run --config vitest.bench.config.ts <파일 하나>`로 import가 깨지지 않았는지 하나만 돌려 본다(시간이 길면 `--run`에 시간 제한을 두고 import 성공만 확인).
- 측정은 조용한 창에서 순차로 돈다(`global-errors.timing.test.ts`는 동시 부하에서 40 ms 한도를 넘긴다).
- verifier(Claude `verifier` 서브에이전트)에게 diff 전체를 주고 "삭제한 이름 중 제품 소비자가 있는 것이 하나도 없는가, 옮긴 파일의 모든 import가 고쳐졌는가, DETAIL이 코드보다 먼저 바뀌었는가"를 묻는다. 결과를 본문에 붙인다.

## 5. 금지

- `src/index.ts`(루트 공개 표면)는 바꾸지 않는다. 오류 코드·enum 작업(D4)은 이 PR이 아니다.
- 시험의 자기 index 경유 재작성(F1), 잉여 export 삭제(F2), 뿌리 구현 이동(F3)은 정돈-2·3이다. 이 PR에서는 2.1~2.3이 필요로 하는 index 줄만 고친다.
- `git stash` 금지. 커밋 메시지에 세션 ID·co-author 금지. 소유자의 법적 이름을 어디에도 쓰지 않는다.

## 6. 끝

PR 제목 `refactor(schema-form): tidy-1 — drop legacy error formatters, demote nodeFromJSONSchema, remove unused rolled types`. 본문에 §2의 완료 항목, §4 수치, 삭제 목록, 정돈-2 이월 항목. PR 번호와 끝 커밋을 원장 관리자(노르덴컨트롤)에게 보고한다. 병합은 원장 관리자가 한다.
