# PR #474 독립 검토 판정 보고서

- **대상 PR**: #474 (`perf/schema-form-b0-switch-ledger` → `feat/schema-form-branch-switch`)
- **검토 커밋**: `96cb4847af35e45135f4df7b98ea45177d292b88`
- **검토자**: Antigravity (독립 읽기 전용 검토자)
- **작업 공간**: `/Users/Vincent/Workspace/albatrion/branch-switch-b0`
- **저장소 소유자**: Vincent

---

## 검토 항목 및 판정

| 항목 | 판정 | 근거 (path:line) |
| :--- | :---: | :--- |
| **1. 범위 (Scope)** | **PASS** | `git diff --stat`: 변경된 27개 파일 모두 `packages/canard/schema-form/architecture/` 아래 위치.<br>- `packages/canard/schema-form/src/**` 차분 0건<br>- 제품 테스트 파일 차분 0건<br>- `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/checkToolSyntax.mjs:23-28` 검증 통과 |
| **2. 관측 동등성 (Observational Equivalence)** | **PASS** | 신규 분기 행 10개 및 기존 24개 fixture 구조 동등성 검증 완료.<br>- 새 엔진과 0.16.1 페어의 동일 키(`common`, `kind`, `payload_i_{a,b,c}`), 기본값 및 잎 경로 일치: `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/buildBranchFixture.mjs:2-51`<br>- `kind_0 → kind_79 → kind_0` 왕복 2회 쓰기 및 값 단언: `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/setupBranchOperation.mjs:57-88`<br>- `if` 행 validator 누락 시 거부 단언: `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/setupBranchOperation.mjs:24-27`, `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/checkBranchDevice.mjs:58-64`<br>- guard가 pointer당 정확히 1회 컴파일됨을 단언: `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/setupBranchOperation.mjs:29-35, 89-95`<br>- legacy 미지원(discriminator, if)의 단독 판 측정 및 비지원 사유 명시: `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/checkBranchDevice.mjs:65-79`, `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:22-23` |
| **3. 프로토콜 (Protocol)** | **PASS** | 정식 창 기준 및 D4 고정 규칙 준수 확인.<br>- 09:26 UTC mds_stores 부하(116.9%)로 중단 및 정식 표본 0개 보존: `/private/tmp/claude-501/perf-runs/20261027T0928-b8db539-b0/preparation/quiet-precheck-blocked-0926.json:1-10`<br>- 정식 창 5초 CPU 점검(5.155s, 부하 통과), quiet-since `2026-10-27T09:28:40.861Z`: `/private/tmp/claude-501/perf-runs/20261027T0928-b8db539-b0/quiet-window.json:1-5`<br>- 20회 예열, 100표본, 쌍 행 3프로세스(총 30 PID), 단계 행 3프로세스(총 18 PID) 독립 측정: `packages/canard/schema-form/architecture/verification/design-optimization/tools/profile/branch-switch/summarizeLedger.mjs:14-24`<br>- 총합은 실행별 최소값의 중앙값(median of minima), 폭(range) 명시: `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/summarize.mjs:16-28`<br>- 단계별 분해 통계는 실행별 중앙값의 중앙값(median of per-process medians)을 사용하고 명시: `packages/canard/schema-form/architecture/verification/design-optimization/tools/profile/branch-switch/summarizeLedger.mjs:147-151`, `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:20`<br>- 방해 관측 및 재측정 없음: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:14` |
| **4. 장부 정확성 (Ledger Correctness)** | **PASS** | 원자료(`summary.json`)로부터 단계 합, 계측 오버헤드, 세 항 분해 및 잔차 재검산 일치 확인.<br>- 표본 단위(sample-by-sample)에서 self 합산과 측정된 총 시간 일치(`Math.abs(sum - wrapped[i]) < 1e-6` 단언 통과): `packages/canard/schema-form/architecture/verification/design-optimization/tools/profile/branch-switch/summarizeLedger.mjs:110-121`<br>- 계측 오버헤드 1.022~1.245배 측정 및 공개: `/private/tmp/claude-501/perf-runs/20261027T0928-b8db539-b0/summary.json`, `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:66-73`<br>- N=2..160 최소제곱 회귀(floor 21.307 / 169.906, slope 0.202 / 0.872), 잔차(최대 ±53.400 µs), Δ항(64.645 / 219.291) 계산 재현 확인: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:47-60`<br>- 큰 회귀 잔차 및 scratch vs dist 차이(0.496~0.985)에 대한 한계 고지가 명확하여 수치 과신을 방지함: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:325-336, 357` |
| **5. 두 번째 바퀴의 입력 증거 (Second-round Evidence)** | **PASS** | `if` 및 `discriminator` 80분기 쓰기 시 라운드 내 투영 객체 변화 확인.<br>- 루트 포인터 `""`, value, frame 1에서 payload 할당으로 인한 객체 identity 변경(`previousIdentity: 2`, `nextIdentity: 3, 4`, `sameIdentity: false`)이 로그 데이터에 기록됨: `/private/tmp/claude-501/perf-runs/20261027T0928-b8db539-b0/stages/switch-if-80-0.gate-inputs.json:1-39`<br>- 프로세스당 2회 불일치 및 확인 바퀴 유발 원인 서술 일치: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:342-354` |
| **6. 문서화 (Documentation)** | **PASS** | README 및 결과 문서 요구사항 완비.<br>- 도구 README에 신규 행 정의, N, 레거시 쌍 지원 여부 등이 기존 표와 동일한 열 구조로 명시됨: `packages/canard/schema-form/architecture/verification/design-optimization/tools/README.md:191-205`<br>- 환경(commit `0eb03ff3bb54bf06af95271d157aefece1b9bf32`, Node v26.12.1, Apple M1 Max, macOS 27.0.1) 명시: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:7-10`<br>- 원자료 경로(`/private/tmp/claude-501/perf-runs/20261027T0928-b8db539-b0/`) 기록: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:370`<br>- "확실하지 않음" 섹션에서 회귀 한계, scratch/dist 차이, 힙 샘플링 오차 등 충실히 기술: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:355-363` |

---

## 결함 및 개선 사항 (심각도 순)

### 1. [경미 / Low] `checkToolSyntax.mjs`의 작업 디렉터리(cwd) 의존성
- **위치**: `packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/checkToolSyntax.mjs:24`
- **현상**: `execFileSync('git', ['diff', '--name-only', 'b8db53997', ...])` 실행 시 현재 작업 디렉터리가 git 저장소 루트가 아닌 경우 `fatal: bad revision 'b8db53997'` 에러가 발생할 수 있습니다.
- **수정 방안**: `execFileSync` 옵션에 `cwd: new URL('../../../../../../', import.meta.url)`을 명시적으로 전달하거나, `git -C <repoRoot>`를 지정하여 스크립트 실행 위치에 구애받지 않도록 보완하는 것을 권장합니다.

### 2. [참고 / Info] N=2 → 10 → 40 구간의 비단조성(non-monotonicity) 및 잔차
- **위치**: `packages/canard/schema-form/architecture/verification/branch-switch/b0-ledger.md:54-61`
- **현상**: 단계 시작 판에서 N=2(118.250 µs) → N=10(231.062 µs) → N=40(195.146 µs)로 시간이 단조 증가하지 않아 선형 회귀 잔차가 ±53.400 µs로 다소 큽니다.
- **평가**: 워커가 `b0-ledger.md`의 "확실하지 않음" 섹션(line 357)에 "N=2→10→40의 시간이 단조롭지 않으며 floor와 slope를 구조 상수로 과신하지 말 것"을 명확히 명시하였으므로 프로토콜 위반은 아닙니다. 향후 B1/B2 단계에서 재측정 시 JIT 컴파일 안정화 또는 GC 간섭 여부를 추가 격리 관찰할 것을 권장합니다.

---

최종 판정: PASS
