# 219라운드 닫기 — codex 복구(Codex CLI 버전 전환이 원인; 탐침 14·13초 성공) 뒤 세 세션은 진행 중인 작업을 직접 마무리하고 다음 작업부터 codex 위임; ajv 플러그인 PR #358을 원장 관리자가 직접 검증해 squash-merge(dc6a2e79f); reviewer 다음 배정 둘

2026-10-13. 소유자가 Codex CLI 버전 전환이 원인이라고 알려 원장 관리자가 탐침: `pwd && codex --version && /private/tmp 쓰기` 14초 성공(codex-cli 0.162.1), project_root=/private/tmp/claude-501/ajv-validator로 `pwd && git status` 13초 성공. 세 세션에 "절반 넘게 직접 했으면 끝까지, 아니면 codex로 되돌림"을 보냈고 셋 다 절반을 넘겨 직접 마무리(fixy07 ④: DETAIL·고치기 전 실패 시험 G1 빨강(core 2, e2e 4)·구현 대부분 끝, dispatchValidate 한 곳과 검증 남음; reviewer: 이주 커밋까지 PR #358에 올림; fairy07: 입력 17개 구현·시험 17파일(고치기 전 실패 확인, 지금 초록; mui Uri는 0.16.0부터 prop이 먼저라 처음부터 초록)·스토리 6·버전 4·README 8·DETAIL 끝, 서식·게이트·검증·커밋·PR 남음). 다음 작업부터 codex(새 세션, project_root=워크트리).

PR #358(reviewer; base 07b-1 1d5fa5db3, head 60389cde3, 네 커밋: 104c7afbb 세 플러그인을 현행 공개 형으로 이주 — ajv6/7 validatorPlugin compile 반환 주석 제거(readonly 수용), ajv8 createGuardCompiler 프로브 캐스트 `as unknown as`(불리언 하위 스키마는 공개 JSONSchema 형이 못 담음, 이유 한 줄), 스토리 NodeState → SchemaNodeState·CustomFormTypeRenderer → FormTypeGroupRenderer·readonly ValidationIssue[], StoryLayout errors?: readonly unknown[], typecheck 9 → 0 ×3; 25862d5d9 ajv8 createValidator(default/2019/2020); b0722a29e ajv7; 60389cde3 ajv6 — verifier FAIL 반영분 포함). reviewer 수치: ajv8 327·ajv7 129·ajv6 124, tsc·eslint 0, prettier, verifier probe 15/15, G1~G6; agy 문서·원장 대조(세션 409a86e3) 불일치 없음(README 셋 영·한의 createValidator 문장이 LANDING-036·192·구현과 일치, "렌더 밖에서 한 번" 권장은 RootNodeContextProvider.tsx:50-65로 뒷받침, ajv8 CLAUDE.md 줄 일치). 실행 편차: codex 2회 시간 초과 → 직접 구현. 원장 관리자 직접 검증: 변경 파일이 세 플러그인 밖 0, 커밋 메시지에 세션 ID·co-author 0, 워크트리에서 ajv8 327·ajv7 129·ajv6 124 통과, typecheck 셋 0. squash 커밋 dc6a2e79f; 07b-1 head 1daf55be4 → … → dc6a2e79f. 원격 브랜치 feat/ajv-create-validator 삭제.

기존 결함 둘(reviewer 보고, PR 범위 밖): (1) ajv6 같은 $id 두 루트 중 둘째의 하위 포인터 가드 `refVal1 is not a function`(루트 포인터 ''는 정상); (2) 세 플러그인 `yarn build`의 buildTypes가 기준 커밋부터 exit 1 — tsconfig.declarations.json의 lib가 낮아 ajv8 getRejectedKey.ts:34의 `.at`이 TS2550(.d.ts는 생성됨).

### 219C-01 (1) codex 복구를 확인하고 218C-01의 대체 규칙은 진행 중 작업에만 적용한다 — 셋 다 절반을 넘겨 직접 마무리하고 실행 편차에 적으며, 다음 작업부터 codex 위임(새 세션, project_root=워크트리); 소유자 대기열 21은 "복구됨(CLI 버전 전환)"으로 닫는다; (2) #358은 검증대로 받아 squash-merge했다(dc6a2e79f); reviewer는 워크트리·로컬 브랜치를 정리; (3) reviewer 다음 배정(한 PR, codex): ajv6 하위 포인터 가드 결함 — debugger 원인 먼저, 고치기 전 실패 시험(ajv7·8 대조군 포함); 세 플러그인 declarations tsconfig의 lib — 다른 패키지 선례를 따라 올리고 `yarn workspace <pkg> build` 빨강 → 초록; (4) fixy07·fairy07은 push·PR 전에 dc6a2e79f 위로 rebase

- 닫는 항목: LANDING-036(보충), PROCESS-060(보충)
- 결정:
  - 【추론】 도구가 돌아왔으면 정책은 바로 복귀하되, 절반 넘게 끝난 일을 되돌려 다시 시키는 것은 품질에도 시간에도 손해다. 빌드가 기준 커밋부터 깨져 있는 것은 PR 범위 밖이어도 지금 고쳐야 할 결함이다.
- 근거: 소유자의 원인 확인; 원장 관리자 탐침 둘; 세 세션 보고; 직접 검증 결과; 217C-01·218C-01.

## 덧붙임 (2026-10-13, reviewer 정정: buildTypes 실패는 저장소 결함이 아님)

reviewer 정정: 219C-01 (3)의 둘째 항목(buildTypes exit 1, TS2550)은 저장소 결함이 아니라 호출 방식 문제 — `node ../../aileron/script/build/buildTypes.mjs`를 직접 불렀고 그 스크립트의 `execSync('tsc -p …')`가 PATH의 Homebrew 전역 tsc 6.0.2(/opt/homebrew/bin/tsc)를 써서 저장소의 TypeScript 5.9.2 대신 돌며 `.at`에 TS2550을 냄. 저장소 명령 `yarn workspace @canard/schema-form-ajv8-plugin build`(yarn이 node_modules/.bin을 PATH 앞에 둠)는 dc6a2e79f 워크트리에서 rolldown·tsc·tsc-alias 통과, `npx tsc -p tsconfig.declarations.json`도 세 플러그인 0 오류; tsconfig.declarations.json은 antd5·코어와 같은 모양. 따라서 둘째 항목은 고칠 것이 없어 PR 범위에서 뺀다(ajv6/7 `yarn build`는 debugger의 임시 probe 파일이 끝난 뒤 한 번 더 확인). 첫째 항목(ajv6 가드 결함)은 새 워크트리 /private/tmp/claude-501/ajv-fix(dc6a2e79f, 브랜치 feat/ajv-guard-and-build-fix)에서 debugger 진단 중. 이전 워크트리·로컬 브랜치 정리됨. 원장 관리자: 정정을 받고 219C-01 (3)을 첫째 항목만으로 읽는다 — 교훈 한 줄: 빌드 스크립트는 항상 저장소 명령(`yarn workspace <pkg> build`)으로 부른다.

## 덧붙임 2 (2026-10-13, ajv6 가드 결함의 진단과 결정)

debugger 진단(reviewer): 같은 $id 결함이 아님 — 포인터 '/type'은 스키마가 아니라 문자열 "number"를 가리키고 ajv 6.12.6이 비스키마 값으로의 $ref를 잘못 컴파일. 경로: schema-form-ajv6-plugin/src/validator/createGuardCompiler.ts:32가 `{ $ref: rootId + '#/type' }`을 컴파일 → resolveGuardSchema.ts:16-17이 객체·불리언이 아닌 대상에 undefined를 돌려 직접 경로를 건너뛰고 $ref 경로로 → ajv6 lib/compile/resolve.js:52 inlineRef("number")가 checkNoRef(165)에서 문자열을 통과시켜 원시 문자열 반환 → lib/compile/index.js:202 replaceLocalRef가 "number"를 refVal[1]에 넣고 223-224에서 객체·불리언이 아니면 컴파일된 함수로 취급 → 생성 코드가 refVal1(...)을 호출해 `refVal1 is not a function`(createGuardCompiler.ts:36). $id 없는 루트·'/properties/v/type'도 같고 순수 ajv6에서도 재현; ''는 루트 객체라 정상. 같은 $id 두 루트의 분리 자체는 정상('/properties/v'로 각 루트의 가드가 올바르게 구분됨). 대조군의 진실: ajv7·ajv8은 문자열을 빈 스키마로 컴파일해 모든 입력에 true(두 모드·두 루트) — 세 플러그인 모두 비스키마 포인터를 조용히 받고 ajv6만 실행 시 throw. 코어가 넘기는 포인터는 청사진 게이트의 스키마 위치라 정상 경로에서는 나오지 않을 것으로 보이나 계약 질문.

### 219C-02 (a)를 택한다 — 세 플러그인의 createGuardCompiler는 resolveGuardSchema가 undefined면 compileGuard 시점에 던진다: 공개 API 입력 검증은 신뢰 경계라 사변이 아니고, 비스키마 포인터를 "늘 true"로 받는 것은 게이트가 늘 열리는 더 나쁜 실패다. 오류 모양은 32C-02 선례(플러그인이 가진 @winglet/common-utils BaseError, 그룹 'UNHANDLED_ERROR', 자기 코드 'GUARD_POINTER_NOT_SCHEMA', details { root, pointer }, 코어 클래스 사칭 없음), 메시지 "guard pointer does not locate a schema: <pointer>". 시험: 각 플러그인에 비스키마 포인터 거부(두 모드; 고치기 전 ajv6은 refVal 오류·ajv7/8은 true → 둘 다 실패)와 같은 $id 두 루트의 스키마 하위 포인터 분리 대조군. 조건: 계획에 "코어가 넘기는 게이트 포인터는 항상 스키마 위치"를 청사진 게이트의 pointer 생성 지점(path:line)으로 확인해 적는다. 계획 → review-plan → codex → verifier → PR → 07b-1; 버전은 #358의 0.17.0 그대로

- 닫는 항목: VALIDATE-015(보충), VALIDATE-017(보충)
- 결정:
  - 【추론】 플러그인 계약 `compileGuard(root, pointer)`의 pointer는 스키마 위치를 뜻하므로, 스키마가 아닌 곳을 가리키는 호출은 계약 위반이고 세 플러그인이 같은 방식으로 거부해야 호출자 버그가 보인다.
- 근거: reviewer의 debugger 진단; VALIDATE-015·017; 32C-02(플러그인 오류 모양); seiri 재사용 규칙(신뢰 경계의 검증).
