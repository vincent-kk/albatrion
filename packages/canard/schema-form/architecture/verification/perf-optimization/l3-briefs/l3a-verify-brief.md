# L3-a 검증 brief (읽기 전용)

당신은 검증자입니다. 저장소 안의 어떤 파일도 만들거나 고치지 마십시오. git 상태를 바꾸는 명령(checkout, reset, stash, commit, push, worktree 등)을 실행하지 마십시오. 시험과 측정 러너를 돌려도 되지만 출력은 $TMPDIR 아래에만 두십시오.

## 대상

- PR #418 (저장소 vincent-kk/albatrion, base feat/schema-form-08-review-and-perf). 구현 작업 폴더(읽기 전용): /Users/Vincent/Workspace/albatrion/l3e-direct-ownership
- 검토 범위 diff: 그 폴더에서 `git diff 07e297431..cad821b8d` (DETAIL 셋 +3, 런타임 +4/−13: nextExtras.ts 의 두 복사 루프와 writeObjectKey 의 engine/utils 이동(R100), assembleObject.ts 의 import; 새 시험·fixture +263).
- 구현 brief(계약): /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/8ca6ecf8-6206-4c84-a31b-faf0d38f2409/scratchpad/l3a-brief.md
- 정본 측정 문서: 그 폴더의 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## A2 — extras 복사·재구성"(275~331행)과 "### L3 가설 다섯" 표의 L3-a 행; architecture/reviews/round-400-closing.md 의 400C-02(측정 방법)·400C-03.
- 원장 항목(packages/canard/schema-form/architecture/ledger/*.md): VALUE-002, WRITE-013, SETTLE-042, SETTLE-043.
- FCA 규칙: /Users/Vincent/Workspace/albatrion/.claude/rules/filid_fractal-boundaries.md, filid_code-placement.md, packages/canard/schema-form/CLAUDE.md 의 "Fractal Contracts in This Package".
- 구현자의 측정 결과: 그 폴더의 packages/canard/schema-form/architecture/verification/perf-optimization/l3a-extras-plain-assignment-results.md (미커밋).

## 검증 축 (각각 통과/실패와 path:line 근거)

1. 동치: 두 복사 루프의 일반 대입이 defineProperty 와 관측상 같은가(열거 가능·쓰기 가능·구성 가능 own property, 키 순서, getter/setter 가 없는 평범한 객체 대상). `__proto__` 만 defineProperty 로 가는가. 선언 키 거름·Merge 의 기존 키 보존과 새 키 순서(VALUE-002)·호출자 입력 불변(WRITE-013)·빈 값 처리·sameValue 되살림(SETTLE-043)이 바뀌지 않았는가. result 객체가 `Object.create(null)` 이거나 prototype 이 있는 객체인지에 따라 일반 대입이 상속 setter 를 탈 수 있는 키(`__proto__` 외에 없는지)를 확인하십시오.
2. 경계: writeObjectKey 의 새 위치 src/core/engine/utils/writeObjectKey.ts 가 두 소비자(settle 의 nextExtras, objectBehavior 의 assembleObject)의 최저 공통 fractal 인 engine 의 utils 구획으로 맞는가(filid_code-placement 1절). engine/DETAIL.md 와 두 소비 fractal 의 DETAIL 선언이 규칙이 요구하는 꼴인가. 옛 위치 파일이 지워졌고 다른 소비자가 남아 있지 않은가. 공개 진입점(src/index.ts, engine index)에 새 이름이 새지 않았는가.
3. 시험: __proto__ 불변 시험(packages/canard/schema-form/src/core/engine/settle/utils/input/__tests__/nextExtras.plain-assignment.test.ts 의 "keeps __proto__ as an own data property without changing prototypes (merge=%s)", "copies a previous __proto__ key during Merge", "filters a declared input key")이 실제로 prototype 오염을 잡는 시험인가(예: `Object.prototype` 이 바뀌지 않았고 result 의 own property 로 남는지). 자기 비교 행렬(fixtures/referenceNextExtras.ts)이 사양대로 기대값을 적는가. 기존 시험 기대값 변경 0건인가.
4. 범위: 런타임 +4/−13, 캐시·전역 상태 없음, 공개 API 불변.
5. 측정 판정(가장 중요): 결과 파일 표(38~49행)에서 Node 는 여섯 행 모두 11.8~44.5% 빨라졌고, Bun 은 B0 mount +18.6%·all-keys +2.2~8.9%·one-key −0.3~−1.2% 인데 Bun B1 mount 가 합친 중앙값 −31.7%(0.4132→0.5442 ms; 바퀴별로는 −63.7% 와 +5.1% 로 부호가 다름) 입니다. (가) 원시 표본(.seiri/tasks 아래 또는 결과 파일이 가리키는 JSON)에서 Bun B1 mount 의 두 바퀴 분포를 다시 계산해 이 행이 진짜 악화인지 창 변동인지 판단하십시오. (나) 가능하면 조용한 창에서 같은 러너로 Bun B1 mount 만 두 바퀴 더 재십시오(수정 전 dist 와 수정 후 dist 는 작업 폴더에 있음; 결과 파일이 dist 경로를 적음; 출력은 $TMPDIR). 재측정 수치와 min/max 를 보고에 적으십시오. (다) 판정 기준: 400C-02 대로 창 안의 비율만 유효하며 바퀴별 범위가 0을 걸치면 "차이 없음"으로 읽습니다. Bun B1 mount 가 재측정에서도 일관되게 느리면 그 원인(일반 대입이 Bun 의 객체 모양 전이를 바꾸는지 등)을 추정해 적고 판정을 "통과(조건부)"로 하십시오; 재측정에서 범위가 0을 걸치거나 빨라지면 통과입니다.
6. 커밋·PR 위생: 두 커밋 메시지에 공동 저자·세션 ID·"Claude-Session" 줄이 없는가, 사용자의 법적 이름이 없는가, PR 본문에 규칙 한 문장·측정 표·__proto__ 시험·경계 이동이 있는가.

## 보고 형식

한국어. 맨 위에 "판정: 통과", "판정: 통과(조건부)" 또는 "판정: 실패"와 한 줄 이유. 그 아래 축 1~6 각각 통과/실패와 근거 path:line, 축 5는 재측정 표 포함. 마지막에 "관찰". worker_done 은 --outcome succeeded 로(판정이 실패여도 검증 자체는 성공), 요약 첫 문장에 판정을 넣으십시오. 후속 메시지를 읽을 때는 preamble 의 handle 로 `--terminal` 을 붙인 check 만 쓰고 run-use 나 코디네이터 명령은 실행하지 마십시오.
