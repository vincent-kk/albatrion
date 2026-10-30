# B1 게이트 판정 통일 독립 검토 의견서 (Part 2: 측정 보고서, 도구 변경, 문서)

- **검토 커밋 범위**: `925c97019..d28bc800b` (base: `4f2001dcd`, merge-base: `a8e61d155`, head: `d28bc800b`, 제품 후보: `38e405d6b`)
- **작업 트리**: `/Users/Vincent/Workspace/albatrion/branch-switch-b1` (수정 없음, 읽기 전용)
- **대상 패키지**: `packages/canard/schema-form`
- **대상 브랜치**: `perf/schema-form-b1-gate-predicate` -> `feat/schema-form-branch-switch`
- **저장소 소유자**: Vincent
- **검토자**: Antigravity (독립 읽기 전용 검토자)
- **일자**: 2026-10-27
- **참조**: Part 1 (코드, 동등성, 시험) 판정 PASS (`/private/tmp/claude-501/perf-runs/453-reviews/pr-b1-part1-antigravity.md`)

---

## 1. 종합 판정표

| 항목 | 판정(PASS/FAIL/주의) | 근거(path:line) |
| :--- | :---: | :--- |
| **제품 소스 불변 (Product Code Frozen)** | **PASS** | `git diff 925c97019..d28bc800b -- packages/canard/schema-form/src` 출력 0건.<br>`git diff 38e405d6b..d28bc800b -- packages/canard/schema-form/src` 출력 0건으로 제품 코드는 Part 1 대상 커밋 `38e405d6b` 상태로 완전 불변. |
| **측정 도구 변경 완결성 및 프로토콜 일치** | **PASS** | `architecture/verification/design-optimization/tools/README.md:278-349`.<br>A B A B … 역할별 10개 프로세스 교대, 20예열/100표본, A(앞5)·A′(뒤5)·B(전체10), 폭(다)=`max(\|A−A′\|, rangeA, rangeA′)`, 0.16.1 레거시 레인 B/A 비율의 17개 호환행 중앙값(0.95~1.05) 품질 판정, TEST-073 Welch 10쌍(전체/앞5/뒤5) 코디네이터 프로토콜 정확히 규정. |
| **기존 도구 기본 동작 보존** | **PASS** | `tools/measure.mjs` diff 0건.<br>`helpers/prepareEngines.mjs:4-12`에서 `currentBundle = path.join(packageDir, 'dist/index.node.mjs')` 기본값 제공으로 기존 비교대 호출 불변.<br>`helpers/setupOperation.mjs:11-14`는 `row.operation === 'subscription'` 분기만 추가하여 기존 동작 영향 없음. |
| **도구 검증 하네스 및 스모크 자가검증** | **PASS** | `helpers/checkAlternatingDevice.mjs:1-248` 실행 결과 `ALTERNATING_MATH_OK`, `ALTERNATING_LEGACY_QUALITY_OK`, `ALTERNATING_CONTRACT_OK syntax=53 rows=21 control-abort=20` 통과.<br>정식 실행 디렉터리(`.../20261027T1306-e0e5121-b1r3/pair`)에 대해 순서(A/B교대), 420개 고유 PID, 100표본 수, 번들 SHA256 일치 검증 통과 (`ALTERNATING_ARTIFACT_OK rows=21 processes=420`). |
| **결과 문서 이력 보존 완전성** | **PASS** | `architecture/verification/branch-switch/b1-results.md`.<br>후보 1 실패 창 (11:04 UTC, `:5-143`), 후보 2 순차 창 실패 (11:37 UTC, `:144-256`), OS 부하 독립/워커 진단 (`:257-343`), 1차 승인 교대창 품질 무효 (12:39 UTC, ratio 1.182, `:344-385`), 0.16.1 레인 품질 재승인 정식 창 (13:10–13:19 UTC, `:387-496`) 전부 누락 없이 보존됨. |
| **원자료 대조: 레거시 레인 품질 지표** | **PASS** | `pair/results.json:quality` 및 `judgement.json:quality`.<br>호환 17행의 0.16.1 레인 B전체10/A전체10 중앙값 = `1.0098695765433172` (PR 본문 및 문서 `1.009869577`), 0.95~1.05 허용선 내 통과. currentOnly 4행 N/A 제외 처리 일치. |
| **원자료 대조: 쓰기당 시간 및 상대선** | **PASS** | `pair/results.json:rows` 및 `judgement.json:fixedLines`.<br>쓰기당 B active `252.406` µs, if `303.854` µs (상한 `317.647` µs 이하), discriminator `162.083` µs (상한 `265.027` µs 이하).<br>if: A 592.708, A′ 577.333, B 303.854, 폭(다) 85.583/2=42.792 µs -> 폭 밖 개선.<br>discriminator: A 429.604, A′ 444.770, B 162.083, 폭(다) 77.833/2=38.917 µs -> 폭 밖 개선.<br>switch-oneOf-80: A 193.875, A′ 246.980, B 252.406, 폭(다) 220.542/2=110.271 µs -> A+폭(304.146) 이하로 폭 밖 악화 없음 (폭 안). |
| **원자료 대조: TEST-073 무회귀 검증** | **PASS** | `test073-all-exit.json:code=0`, `test073-all.log`, `test073-first.log`, `test073-last.log`.<br>21개 전 행에 걸쳐 전체 10쌍(0 reg / 3 imp), 앞 5쌍(0 reg / 2 imp), 뒤 5쌍(0 reg / 3 imp) 모두 회귀 0건. |
| **원자료 대조: 호출 횟수 및 불일치 바퀴** | **PASS** | `judgement.json:stages`.<br>쓰기당 evaluateGate: if 80, discriminator 0, active 0.<br>selectChildren: 3행 모두 1.<br>frame 불일치: 3개 프로세스 모두 0. |
| **원자료 대조: 힙 잔존 메모리 (B2)** | **PASS** | `judgement.json:heap`.<br>Node B 중앙 `1439.096` B/node ≤ A 최대 `1889.560` B/node (고정 관문 통과).<br>Bun B 중앙 `2233.988` B/node > A 최대 `2224.774` B/node (+9.214 B/node, 보고 대상이며 관문 미달 아님을 명시). |
| **원자료 대조: ratio-of-ratios 보조 지표** | **PASS** | `pair/results.json:rows`.<br>`single-flat-1000` (current 0.959157 / legacy 1.027739 = 0.933268), `mount-oneOf-80` (1.008244), `mount-flat-1000` (0.973677) 등 원자료 계산값과 일치. |
| **원자료 대조: CPU 사전/사후 점검 정숙성** | **PASS** | `quiet-window.json:heavy` = `[]`, `window-end.json:processes.heavy` = `[]`, `window-end.json:invalid` = `false`. 시작/종료 5초 CPU 표본 모두 고부하 프로세스 없음. |
| **PR 본문 체크리스트 완전성** | **PASS** | `packages/canard/schema-form/architecture/plan/branch-switch/verification.md` 게이트 항목 전체가 `b1-pr-body.md`에 실증적으로 작성됨.<br>빌드/검증 로그(877파일 5447통과), 시험 diff(add-only +978 -0), 배달 비교 차이 0(72장면), 공개 d.ts/표면 차이 0, 섀도우 검증, 속도/메모리 비용 문장, 원장 항목 명시, Bun 힙 보고 처리, 창 전개 과정 및 TEST-088 소유자 승인 경과가 정직하게 기술됨. |
| **문서 규율: DETAIL.md 현행 사양 및 비용 모델** | **PASS** | 변경된 `core/engine/DETAIL.md:11-13`, `blueprint/DETAIL.md:5-7`, `compileBlueprintExpressions/DETAIL.md:8`, `settle/DETAIL.md:25-33, 306-313` 모두 현행 사양, 불변식, 복잡도 비용 모델만 서술하며 과거 이력 표현 없음. |
| **프랙탈 구조 및 미사용 export 배제** | **PASS** | 신규 디렉터리 `utils/gates/predicates/` 및 `utils/compute/childSelection/utils/`에 `index.ts` 없음. 소유자 서브트리에서만 직접 임포트됨.<br>커밋 `6bb918d0f`에서 `summarizeAlternating.mjs`의 내부 `median` 함수의 불필요한 export를 제거하여 미사용 export 0건 준수. |

---

## 2. 세부 검토 증거 및 계산 검증

### 2.1 도구 변경 (`925c97019..d28bc800b`) 및 무간섭성 검증
1. **제품 소스 트리 불변성**:
   - `git diff 925c97019..d28bc800b -- packages/canard/schema-form/src` 실행 결과 변경 사항 없음.
   - 제품 커밋 `38e405d6b` 대비 `d28bc800b`의 `src/` 변경 역시 0건으로 확인.
2. **소유자 승인 교대 측정 도구 (`alternate.mjs` 외)**:
   - `alternate.mjs`: 로컬에 복사된 독립 A/B 번들을 프로세스마다 새로 기동하며 `A0 B0 A1 B1 ... A9 B9` 순서로 교대 실행.
   - `readAlternatingConfig.mjs`: 정식 창 파라미터(`--runs=10`, `--warmups=20`, `--samples=100`, `--quiet-since`) 고정 강제.
   - `executeAlternatingRows.mjs`: 21개 시간 행 실행 중 `quality === 'legacy'`일 때 21개 행을 모두 완료한 뒤 사후 품질을 평가(`summarizeAlternating.mjs`)하도록 지원.
3. **기존 장치와의 무간섭성**:
   - `prepareEngines.mjs`: 4번째 인자 `currentBundle`의 기본값이 기존 `dist/index.node.mjs`로 지정되어 기존 `measure.mjs` 호출 형태를 100% 호환.
   - `setupOperation.mjs`: `subscription` 연산에 대한 분기만 추가되어 기존 분기/일반 픽스처 셋업 동작을 전혀 변경하지 않음.
   - `measure.mjs` 및 기존 paired measurement 도구들은 수정되지 않음.
4. **자가 검증 테스트 (`checkAlternatingDevice.mjs`)**:
   - 도구 구문 검사: 53개 `.mjs` 파일 문법 검사 통과.
   - 정식 실행 결과 검증: `/private/tmp/claude-501/perf-runs/20261027T1306-e0e5121-b1r3/pair` 검증 시 `ALTERNATING_ARTIFACT_OK rows=21 processes=420` 정상 출력 확인.

### 2.2 결과 문서 (`b1-results.md`) 및 정식 원자료 수치 재계산
- **원자료 디렉터리**: `/private/tmp/claude-501/perf-runs/20261027T1306-e0e5121-b1r3`

1. **레거시 레인 품질 지표**:
   - `judgement.json` 및 `pair/results.json` 확인:
     - 호환 17행의 `legacy B(10) / legacy A(10)` 비율 목록:
       `[1.027739, 1.012127, 1.009870, 1.001240, 1.036399, 0.985937, 1.010725, 0.964412, 1.083756, 1.045692, 0.892542, 0.996678, 0.990246, 1.013268, 1.004200, 1.036941, 0.998318]`
     - 17개 비율의 중앙값 = `1.0098695765433172` (약 `1.009869577`). 허용 범위인 `[0.95, 1.05]`에 정확히 안착.
     - `switch-discriminator-80`, `switch-if-80`, `wave-1000`, `single-flat-1000-subscribed` 4개 행은 0.16.1 호환 레인이 없어 N/A로 정상 제외.
2. **핵심 3개 행 쓰기당 시간 및 상대선 판정**:
   - **`switch-if-80`**:
     - A(앞5) = 1185.417 µs/행 (592.708 µs/쓰기)
     - A′(뒤5) = 1154.667 µs/행 (577.333 µs/쓰기)
     - B(전체10) = 607.708 µs/행 (303.854 µs/쓰기)
     - 폭 (다) = 85.583 µs/행 (42.792 µs/쓰기)
     - A 대비 감소: $1185.417 - 85.583 = 1099.834 > 607.708$, A′ 대비 감소: $1154.667 > 607.708$ -> **폭 밖 개선 (improved)**
     - 고정 상대선: $303.854 \le 252.406 \times 1.1 + 40 = 317.647$ µs/쓰기 -> **통과**
   - **`switch-discriminator-80`**:
     - A(앞5) = 859.208 µs/행 (429.604 µs/쓰기)
     - A′(뒤5) = 889.541 µs/행 (444.770 µs/쓰기)
     - B(전체10) = 324.166 µs/행 (162.083 µs/쓰기)
     - 폭 (다) = 77.833 µs/행 (38.917 µs/쓰기)
     - A 대비 감소: $859.208 - 77.833 = 781.375 > 324.166$, A′ 대비 감소: $889.541 > 324.166$ -> **폭 밖 개선 (improved)**
     - 고정 상대선: $162.083 \le 252.406 \times 1.05 = 265.027$ µs/쓰기 -> **통과**
   - **`switch-oneOf-80` (active)**:
     - A(앞5) = 387.750 µs/행 (193.875 µs/쓰기)
     - A′(뒤5) = 493.959 µs/행 (246.980 µs/쓰기)
     - B(전체10) = 504.812 µs/행 (252.406 µs/쓰기)
     - 폭 (다) = 220.542 µs/행 (110.271 µs/쓰기)
     - $B \le A + 폭$ ($504.812 \le 387.750 + 220.542 = 608.292$) -> **폭 밖 악화 없음 (폭 안 / 입증 안 됨)**
3. **TEST-073 (Welch 통계 검정)**:
   - 전체 10쌍: 0 regression, 3 improvement (`test073-all.log:2`, exit code 0)
   - 앞 5쌍: 0 regression, 2 improvement (`test073-first.log:2`, exit code 0)
   - 뒤 5쌍: 0 regression, 3 improvement (`test073-last.log:2`, exit code 0)
   - 21개 전 행에 대해 회귀 0건 확인.
4. **단계 장부 (Calls & Wheels)**:
   - `switch-if-80`: evaluateGate 80, selectChildren 1, computeNode 5, mismatches [0,0,0]
   - `switch-discriminator-80`: evaluateGate 0, selectChildren 1, computeNode 6, mismatches [0,0,0]
   - `switch-oneOf-80`: evaluateGate 0, selectChildren 1, computeNode 5, mismatches [0,0,0]
5. **잔존 힙 (B2)**:
   - Node 7표본: B 중앙 `1439.096181` B/노드 $\le$ A 최대 `1889.559688` B/노드 -> **통과**
   - Bun 7표본: B 중앙 `2233.988002` B/노드 > A 최대 `2224.773845` B/노드 (차이 `+9.214157` B/노드) -> **보고 대상 명시**
6. **보조 지표 (Ratio of Ratios)**:
   - `single-flat-1000`: currentRatio `0.9591565` / legacyRatio `1.0277395` = `0.933268` (일치)
   - `mount-oneOf-80`: currentRatio `1.0204713` / legacyRatio `1.0121270` = `1.008244` (일치)
7. **CPU 점검**:
   - `quiet-window.json`: `heavy: []`
   - `window-end.json`: `processes.heavy: []`, `invalid: false`

### 2.3 PR 본문 체크리스트 및 문서 규칙 검증
1. **검증 체크리스트 충족**:
   - `b1-pr-body.md`는 `verification.md`의 모든 요구사항(게이트 성공 로그, 시험 add-only diff, 배달 차분 0, d.ts 바이트 동일성, 섀도우 검증 결과, 속도/메모리 트레이드오프 문장, 원장 영향 항목, 독립 검토 파일)을 누락 없이 포함하고 있음.
   - Bun 힙 수치(+9.214 B/노드)가 보고 전용으로 다루어짐이 본문에 명시됨.
   - 후보 1 실패, 후보 2 순차 창 실패, 1차 교대창 품질 무효(1.182), 2차 소유자 재승인 창(1.0098) 전 과정이 진실되게 기록됨.
2. **문서 주석 및 프랙탈 규율**:
   - 변경된 `DETAIL.md` 파일들은 현재 사양과 비용 모델만을 기술하며 과거 이력이나 비교 표현이 없음.
   - `gates/predicates/` 및 `childSelection/utils/` 디렉터리는 오르간 규약을 준수하며 `index.ts`를 두지 않고 해당 서브트리에서만 상대 경로로 임포트됨.
   - 커밋 `6bb918d0f`를 통해 외부 소비자가 없는 `median` export가 내부 함수로 정리됨.

---

## 3. 결함 목록 및 권고사항

- **결함 (Defects)**: **0건 (없음)**
  - 제품 소스 변경 없음 (Part 1 이후 제품 코드 동결 유지).
  - 기존 도구의 기본 동작 변경 없음.
  - 모든 헤드라인 수치가 정식 원자료와 오차 없이 일치함.
  - 문서 내 역사 주석 없음.
- **권고사항 (Advisories)**:
  - Bun 잔존 힙의 B 중앙값 소폭 초과(+9.214 B/노드, +0.41%)는 본 PR의 기각 조건이 아니며 정상적으로 "보고"로 처리되었습니다. 향후 B2-P2 또는 후속 메모리 최적화 단계에서 Bun 환경의 객체 할당/JIT 특성을 지속적으로 모니터링할 것을 권고합니다.
  - PR 본문 체크리스트의 `[ ] 독립 antigravity 코드검토·측정보고검토 및 코디네이터의 PR seam 검사` 항목은 본 검토 완료 후 코디네이터가 최종 PR 생성/승인 시 체크 완료(`[x]`) 처리하면 됩니다.

---

최종 판정: PASS
