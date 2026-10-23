# L3-a 구현 brief — 선언 밖 키의 defineProperty 복사를 일반 대입으로

저장소: /Users/Vincent/Workspace/albatrion (yarn 모노레포). 패키지: packages/canard/schema-form (패키지 CLAUDE.md의 명령을 따르십시오). 작업 폴더: /Users/Vincent/Workspace/albatrion/l3e-direct-ownership (이미 있는 Orca 작업 폴더; 본 폴더 /Users/Vincent/Workspace/albatrion 은 건드리지 않습니다).

## 0. 첫 단계: 기준 커밋 맞추기

작업 폴더에서 `git status` 가 깨끗한지 확인하고(미커밋 측정 결과 파일들과 .seiri/tasks 는 그대로 두어도 됨), `git fetch origin feat/schema-form-08-review-and-perf` 뒤 `git checkout -b perf/schema-form-extras-plain-assignment origin/feat/schema-form-08-review-and-perf` 로 새 가지를 만듭니다. 기준 커밋은 07e297431 이어야 합니다(`git log -1 --oneline` 으로 확인해 보고에 적으십시오). 이전 가지 perf/schema-form-array-append-shortcut 은 PR #417 로 병합되었으니 지워도 됩니다. `yarn install` 을 한 번 돌립니다.

## 1. 목표 (가설 L3-a, 정본 문서)

정본은 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## A2 — extras 복사·재구성"(275행부터 331행; 특히 "### A2-2: v1 폐기, v2 묶음 후보")과 "### L3 가설 다섯" 표의 L3-a 행, 그리고 architecture/reviews/round-400-closing.md 의 400C-03 입니다. 먼저 이 세 곳을 끝까지 읽으십시오.

비효율: `src/core/engine/settle/utils/input/nextExtras.ts` 의 두 복사 루프가 선언 밖 값(extras)의 키마다 `defineProperty` 로 씁니다. 측정 v2(문서 A2-2): 두 루프에서 보통 키는 일반 대입으로 쓰고 `__proto__` 만 defineProperty 로 쓰면 선언 키 거름·Merge·빈 값 처리·sameValue 되살림이 유지된 채 모든 정답 관측이 통과했고, Node B0 마운트 −17.1%, Bun B0 마운트 −11.3%·한 키 −3.4%·모든 키 −9.2% 였습니다(Node 한 키·모든 키는 범위가 0을 걸침).

반영할 것: nextExtras 의 두 복사 루프를 `writeObjectKey`(이미 `src/core/engine/behaviors/objectBehavior/utils/keys/writeObjectKey.ts` 에 있음; `__proto__` 는 defineProperty, 그 밖은 일반 대입) 사용으로 바꿉니다. v1(입력 참조 재사용)은 소유자가 폐기했으니 하지 마십시오.

먼저 지킬 조건(L3-a 행 그대로): `__proto__` 보호, 선언 키 거름, Merge(기존 키 보존과 새 키 순서), 키 순서(VALUE-002, SETTLE-042), 호출자 입력 불변(WRITE-013)을 유지합니다. sameValue 되살림(SETTLE-043)은 이번 가설에서 건드리지 않습니다(두 번 비교 제거는 다음 가설 L3-c 이므로 여기서 하지 마십시오).

경계 주의(FCA): nextExtras 는 settle fractal 안이고 writeObjectKey 는 objectBehavior fractal 의 organ(utils/keys) 안입니다. 다른 fractal 의 organ 파일을 직접 import 하는 것은 .claude/rules/filid_fractal-boundaries.md 와 packages/canard/schema-form/CLAUDE.md 가 금합니다. 먼저 현재 저장소에서 settle 이 objectBehavior 의 내부를 어떻게 쓰는지(기존 import 와 각 DETAIL.md 의 선언) 확인하고, 허용된 길이 없으면 writeObjectKey 를 두 소비자의 최저 공통 fractal(아마 src/core/engine 의 utils 구획)로 옮기고 objectBehavior 쪽 import 를 고치며 관련 DETAIL 에 적으십시오. 옮길 때 파일 이름과 함수 이름은 그대로, import 경로만 바뀝니다. 이 이동도 같은 PR 에 넣되 커밋 메시지에 한 줄로 적습니다. 이동 여부와 근거(path:line)를 보고에 적으십시오.

## 2. 순서

1. DETAIL 을 코드보다 먼저 고칩니다: settle DETAIL(nextExtras 의 복사 방식을 적은 문장이 있으면 그 문장; 없으면 선언 밖 값 사본 문장에 `__proto__` 는 defineProperty, 그 밖의 키는 일반 대입이라고 한 문장 추가)과, writeObjectKey 를 옮기면 그 소유 fractal 들의 DETAIL. 틀리게 되는 문장만 같은 언어로 고칩니다. INTENT 는 공개 경계가 안 바뀌므로 손대지 않습니다.
2. 코드를 고칩니다.
3. 시험(400C-03 이 요구): (가) `__proto__` 키가 든 선언 밖 값이 prototype 을 오염시키지 않고 own property 로 남음을 고정하는 시험(수정 전·후 모두 통과해야 하는 불변 시험; nextExtras 경로로); (나) Merge 에서 기존 키 보존과 새 키 순서(VALUE-002), 호출자 입력 불변(WRITE-013), 선언 키 거름이 수정 전과 같음을 단언하는 자기 비교 행렬; (다) 빈 값 처리와 sameValue 되살림이 그대로임을 확인하는 사례(전체 배달 기록 비교가 가능하면 그것으로).
4. 게이트: `yarn workspace @canard/schema-form typecheck`, `lint`, `test`, `build` 모두 통과. 기존 시험 기대값 변경 0건.
5. 측정: first-batch 러너의 A2 장면(B0·B1 의 마운트·한 키·모든 키, Node 와 Bun)을 두 바퀴 번갈아 재고 min/max 를 적습니다(수정 전 dist 는 07e297431 빌드). 표는 "런타임 | 장면 | 쓰기 | 수정 전 ms [두 바퀴] | 수정 후 ms [두 바퀴] | 줄어든 %" 꼴. 측정 중 다른 게이트·빌드 금지. 결과 파일은 작업 폴더 architecture/verification/perf-optimization/l3a-extras-plain-assignment-results.md 에 두되 커밋하지 않고 경로만 보고.
6. 커밋 둘: `docs(schema-form): ...`(DETAIL 만), `perf(schema-form): ...`(코드+시험; writeObjectKey 이동이 있으면 메시지에 한 줄). 본문에 "codex 구현" 한 줄. 공동 저자·세션 ID·"Claude-Session" 줄 금지. 사용자의 법적 이름 금지.
7. push 뒤 `gh pr create --repo vincent-kk/albatrion --base feat/schema-form-08-review-and-perf --title "..." --body-file <파일>`. 본문에 규칙 한 문장, 바뀐 파일, 측정 표, `__proto__` 시험, 경계 처리(이동 여부). 병합하지 않습니다.

## 3. 보고 (worker_done)

성공: --outcome succeeded. 요약에 가지 이름, 기준 커밋, 커밋 해시 둘, PR 번호·URL, 게이트 네 개 결과, 측정 표 경로, 바뀐 파일 목록, 기존 시험 기대값 변경 0건, 추가·제거 줄 수(런타임과 시험 따로), writeObjectKey 이동 여부.

중단(계약 문장과 어긋남, 추가 코드가 제거 비효율보다 큼, 측정에서 모든 행이 악화, 정답 관측 실패, 경계 문제를 이동 없이 풀 수도 이동으로 풀 수도 없음): 고치려 들지 말고 --outcome failed 와 근거(path:line, 수치)로 보고. 묻고 싶으면 preamble 의 ask 명령.
