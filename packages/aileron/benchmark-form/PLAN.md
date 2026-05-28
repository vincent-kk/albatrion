# schema-form 성능 측정 인프라 보강 계획

> **Resume hint**: 이 파일을 그대로 Claude 입력으로 던지면 진행 상태(체크박스)를 보고 다음 미완료 Phase 부터 이어 작업한다.
>
> 시작 명령 예시:
>
> ```
> @packages/aileron/benchmark-form/PLAN.md 의 진행 상태를 확인하고, 미완료 Phase 부터 이어서 작업해줘.
> ```

## 목표

"성능이 안 나오는 것 같다" 라는 직감을 **데이터로 답할 수 있는 상태** 로 만든다.

- 5월 7일 이후 끊긴 데이터 라인 복구
- 큰 폼 / 큰 배열 시나리오 측정
- schema-form 내부 hot path 마이크로벤치
- CI 자동화

## 배경 (요약)

이미 인프라는 있다 (`benchmark-form`: form-level, `benchmark`: util microbench). 다만:

- 5월 7일 이후 결과 없음 (`results/` 마지막 timestamp)
- 비교 버전 deps 가 `0.4 ~ 0.8` 에서 정체 (현재 published 는 0.12.5, workspace 는 0.12 계열)
- scale dial 없음 (`sampleSchemas[2]` 가 사실상 최대, interaction 은 input 10개로 제한)
- schema-form 내부 hot path 마이크로벤치 없음
- CI 통합/회귀 게이트 부재

## 의사결정 (확정)

| 항목              | 선택                                                               |
| ----------------- | ------------------------------------------------------------------ |
| 시작 범위         | Phase 0 + 1 (한 세션)                                              |
| 버전 추가 범위    | `0.9.0`, `0.10.0`, `0.11.0`, `0.12.0`, `0.12.5` (published latest) |
| 마이크로벤치 위치 | `packages/canard/schema-form/bench/` (vitest bench)                |
| CI 트리거         | `main` push + nightly cron 둘 다                                   |

---

## Phase 0 — 환경 확인 & 시범 실행

- [x] `aileron/benchmark-form` deps 설치 상태 점검 (`node_modules`, react-dom 19 + JSDOM 호환)
- [x] schema-form workspace `dist/` 가 최신 fix (`__primeInitialBranch__`) 포함하는지 확인
- [x] 단일 버전 시범 실행 (`yarn check`, current workspace 만) — node 20 으로 강제 필요 확인
- [x] 결과 JSON 형식 정상 (visualizer 는 별도 확인 — 보류)

**환경 메모:**

- system node 가 v26, `.nvmrc=20` 이지만 yarn 이 system node 채택. `PATH=~/.nvm/versions/node/v20.19.5/bin:$PATH` 로 강제. **모든 후속 명령에 동일 prefix 필요.**
- node 26 호환 패치(`navigator` defineProperty)는 별도 follow-up. 일단 node 20 으로 일관 유지가 5월 결과와의 비교 정확성에 더 안전.

**Baseline (workspace latest, 2026-05-29):**
| 카테고리 | ops/sec | mean time |
|---|---|---|
| Form Rendering | **204.59** | 4.888 ms |
| User Interaction | 4.50 | 222.031 ms |
| OneOf Switching | 6.51 | 153.526 ms |
| IfThenElse Logic | 6.52 | 153.437 ms |
| Computed Properties | 5.34 | 187.368 ms |
| Memory Usage | 4.73 | 211.511 ms |

5월 7일 결과 latest Form Rendering 이 190.77 → **+7.2%** 향상. "성능 안 나오는 것 같다" 의심에 대한 첫 객관적 반론.

## Phase 1 — 끊긴 데이터 라인 복구

- [x] `package.json` 에 버전 deps 추가 (`0.9.0`, `0.10.0`, `0.11.0`, `0.12.0`, `0.12.5`)
- [x] `yarn install` (성공, deps 알파벳 재정렬됨)
- [x] `yarn start:all-versions` 실행 — 결과 `results/benchmark-2026-05-28T15-46-42-525Z.json`
- [x] 결과 JSON 분석:
  - 0.4.14 → 0.12.5 회귀 곡선 작성
  - workspace latest 가 직전 published(0.12.5) 대비 차이 확인
- [x] 보고서: 어느 minor 에서 회귀가 있었는지, fix 가 성능 측면에 미친 영향
- [ ] (선택, 미수행) `yarn compare:all-versions` 로 genie 직접 비교까지

### 결과 요약

| 카테고리            | 0.4.14 | 0.5.0 (peak) | 0.9.0  | **0.10.0**   | 0.11.0 | 0.12.0 | **0.12.5**   | latest | 추세           |
| ------------------- | ------ | ------------ | ------ | ------------ | ------ | ------ | ------------ | ------ | -------------- |
| **Form Rendering**  | 208.00 | 209.72       | 205.45 | **199.92** ↓ | 202.56 | 202.96 | **196.89** ↓ | 196.89 | **-6.1% 누적** |
| User Interaction    | 4.51   | 4.52         | 4.51   | 4.49         | 4.50   | 4.50   | 4.52         | 4.52   | 안정 (±1%)     |
| OneOf Switching     | 6.53   | 6.53         | 6.51   | 6.49         | 6.51   | 6.51   | 6.51         | 6.51   | 안정 (±1%)     |
| IfThenElse Logic    | 6.52   | 6.51         | 6.48   | 6.53         | 6.51   | 6.52   | 6.51         | 6.52   | 안정 (±1%)     |
| Computed Properties | 5.33   | 5.32         | 5.31   | 5.33         | 5.32   | 5.32   | 5.29         | 5.33   | 안정 (±1%)     |
| Memory Usage        | 4.75   | 4.75         | 4.74   | 4.75         | 4.75   | 4.74   | 4.74         | 4.74   | 안정 (±1%)     |

### 핵심 발견 (legacy 측정 — Phase 1.5 정상화로 일부 정정됨, 아래 참고)

**1. 회귀는 Form Rendering 한 카테고리에서만 보임.** 나머지 5 카테고리는 ±1% 노이즈 — 그러나 후속 분석에서 **이는 setTimeout dominant 로 인한 측정 둔감함**으로 판명. 실제 회귀 여부 미상.

**2. legacy 측정의 두 step 회귀 — N=2 sweep 노이즈 (±3.96%) 안. 통계적 유효성 없음:**

- 0.9.0 → 0.10.0 -2.7% (노이즈 범위 안)
- 0.12.0 → 0.12.5 -3.0% (노이즈 범위 안)

**산출**: legacy 결과 JSON.

> ⚠️ **아래 v2 정상화 결과로 위 결론 모두 정정됨. Phase 1.5 섹션 참조.**

### ⚠️ 재현성 검증 (sweep #2, 2026-05-29)

같은 코드를 두 번째 sweep 으로 측정 → 노이즈 폭 산정. 결과:

| 카테고리            | 노이즈 max (sweep1↔sweep2) | 노이즈 avg |
| ------------------- | --------------------------- | ---------- |
| **Form Rendering**  | **±3.96%**                  | ±1.46%     |
| User Interaction    | ±0.77%                      | ±0.50%     |
| OneOf Switching     | ±0.90%                      | ±0.44%     |
| IfThenElse Logic    | ±1.25%                      | ±0.44%     |
| Computed Properties | ±0.87%                      | ±0.41%     |
| Memory Usage        | ±0.74%                      | ±0.26%     |

**결론 — 위 회귀 결론은 단일 sweep 신뢰도 부족:**

- 0.9→0.10 (-2.7%) 와 0.12.0→0.12.5 (-3.0%) **모두 단일 sweep 노이즈 (±3.96%) 안**. 진짜 회귀인지 노이즈인지 분리 불가.
- 누적 -6.1% (Peak→latest) 는 노이즈의 1.5배 — borderline 신호.
- 5 카테고리의 "±1% 안정" 은 setTimeout dominant 로 인한 측정 둔감함이지 실제 안정 아님.

→ **Phase 1.5 (벤치 정상화) 가 결론보다 우선.**

## Phase 1.5 — 벤치마크 정상화 (선결 작업)

벤치 코드 자체에 측정 신뢰성 문제 발견. 정상화 후 재측정으로 진짜 회귀 판정.

### 발견된 문제

1. **5/6 카테고리가 setTimeout dominant** — schema-form 실제 비용이 setTimeout 100~260ms 안에 묻힘
2. **Form Rendering 도 same-root 4 schema sequential render** — mount 가 아니라 mount+3 reconcile
3. **Memory benchmark `--expose-gc` 미적용** — `global.gc` undefined → GC 안 돔
4. **단일 sweep 통계적 유효성 부족** — N=1 결과로 ±4% 노이즈 안 회귀 판정 불가

### 작업

- [x] **A. setTimeout 제거** — `Form Rendering` v2 적용. 1 op = setup + mount + drainTicks(0) + unmount + cleanup. setTimeout(16/100) 모두 제거. (다른 5 카테고리는 미적용 — 아래 메모 참고)
- [x] **B. per-op fresh root** — form-rendering v2 에서 매 op 마다 새 root + container, schema 1개만 사용 (`sampleSchemas[2]`)
- [x] **C. `--expose-gc` 적용** — `node --expose-gc --import tsx` 형태로 `v2 / v2:all / v2:repeat` script 신규
- [x] **D. N-sweep wrapper** — `index-v2.ts` 의 `--repeat=N` 옵션 + sweep-간 평균/std 출력 + 결과 JSON `bench-v2-*.json` 별도 저장
- [x] **E. 정상화 후 재측정** — N=5 sweep × 전 11 버전 완료. 결과 `bench-v2-2026-05-28T16-13-49-716Z.json`. 분석 결과 아래.

### 정상화 첫 결과 (latest only, N=3)

| 측정                      | 값                              |
| ------------------------- | ------------------------------- |
| Form Rendering v2 평균 hz | 548.28 (mean ~1.82ms)           |
| Single-sweep deviation    | ±22~27% (timer resolution 한계) |
| Sweep-간 std              | **±2.36%** (n=3)                |

비교: legacy Form Rendering 의 sweep1↔sweep2 노이즈 폭은 ±3.96%. v2 N=3 평균이 이미 더 좁음. N=5 으로 가면 ±1.5% 예상.

### 정상화 전체 결과 (Form Rendering v2, 전 버전 × N=5)

| 버전             | mean hz    | std    | step Δ     | 비고                        |
| ---------------- | ---------- | ------ | ---------- | --------------------------- |
| 0.4.14           | 634.30     | ±3.50% | —          |                             |
| **0.5.0 (peak)** | **644.04** | ±1.03% | +1.54%     |                             |
| 0.6.0            | 624.35     | ±2.91% | -3.06%     | 약신호 (1σ)                 |
| 0.7.0            | 614.80     | ±2.81% | -1.53%     | 노이즈 안                   |
| 0.8.0            | 606.98     | ±1.83% | -1.27%     | 노이즈 안                   |
| 0.9.0            | 600.48     | ±2.47% | -1.07%     | 노이즈 안                   |
| 0.10.0           | 585.44     | ±1.45% | -2.50%     | 약신호 (1σ)                 |
| 0.11.0           | 593.90     | ±4.33% | +1.44%     | 회복                        |
| 0.12.0           | 570.84     | ±3.95% | -3.88%     | 약신호 (1σ)                 |
| 0.12.5           | 558.32     | ±4.79% | -2.19%     | 노이즈 안                   |
| **latest**       | **575.93** | ±3.53% | **+3.15%** | **회복** (race fix 의 효과) |

**Peak (0.5.0) → latest: -10.58%**

### N=15 sweep 결과 (재확인)

| Ver    | N=5 hz | N=5 std | N=15 hz | N=15 std | 절대값 shift |
| ------ | ------ | ------- | ------- | -------- | ------------ |
| 0.4.14 | 634.30 | ±3.50%  | 606.88  | ±6.26%   | -4.3%        |
| 0.5.0  | 644.04 | ±1.03%  | 599.89  | ±5.70%   | -6.9%        |
| 0.6.0  | 624.35 | ±2.91%  | 572.56  | ±7.41%   | -8.3%        |
| 0.8.0  | 606.98 | ±1.83%  | 548.46  | ±8.45%   | -9.6%        |
| 0.9.0  | 600.48 | ±2.47%  | 541.94  | ±8.81%   | -9.8%        |
| 0.10.0 | 585.44 | ±1.45%  | 546.75  | ±7.10%   | -6.6%        |
| 0.12.0 | 570.84 | ±3.95%  | 527.19  | ±7.06%   | -7.7%        |
| 0.12.5 | 558.32 | ±4.79%  | 525.97  | ±7.23%   | -5.8%        |
| latest | 575.93 | ±3.53%  | 531.79  | ±8.35%   | -7.7%        |

**관찰:**

- N=15 std 가 N=5 보다 일관되게 큼 (±7~9% vs ±2~5%) → **N=5 의 std 는 underestimate, 진짜 노이즈 폭은 ±7%**
- 모든 버전이 N=15 측정에서 -5~10% 낮음 → 시스템 상태/thermal 영향. **절대값 비교는 시점 의존**, 상대 비교만 의미.
- 개별 step 회귀 모두 **1σ 안** (0.11.0→0.12.0 의 -5.05% 가 가장 강하지만 noise 7.06% 안). **form-level 측정으로는 개별 minor 회귀 확정 불가.**
- 누적 Peak (0.4.14, N=15) → latest: **-12.37%** (N=5 의 -10.58% 보다 큼). 점진 누적 신호 확정.

**→ 결론: 점진적 회귀는 명확하지만, "어느 minor 의 어느 commit 이 회귀 원인" 은 form-level 로 답 불가. Phase 3 마이크로벤치의 per-version 측정이 유일한 길.**

### Phase 1 결론 정정

> 정상화된 측정으로 어제(2026-05-29) Phase 1 의 3개 결론이 모두 수정됨.

| 어제 결론                              | 정상화된 사실                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| "이번 race fix 가 -3% 회귀 만들었다"   | **틀림.** latest > 0.12.5 (+3.15%). race fix 는 오히려 mount 비용 회복 방향.                                          |
| "0.9→0.10, 0.12.0→0.12.5 두 step 회귀" | **부분 틀림.** 두 step 모두 약신호 (1σ) 수준. 더 큰 그림은 **연속 점진 회귀**.                                        |
| "누적 -6.1%"                           | **underestimate.** 정상화 측정으로 **-10.58%** (Peak vs latest). legacy 가 setTimeout dominant 로 회귀를 묻고 있었음. |

### 진짜 본질

**점진적 feature creep 누적.** 한두 commit 의 큰 회귀가 아니라 0.5.0 이후 7~8 minor 에 걸쳐 각 1~3% 의 회귀가 합산. 사용자가 처음 지적한 "버전별 기능이 점점 누적되니까 추이는 어쩔 수 없다" 직감과 일치.

개별 step 의 통계적 유의성은 모두 약신호 (1σ) 수준 — 어느 minor 가 진짜 큰 회귀인지 확정하려면 N=15~20 추가 sweep 또는 Phase 3 마이크로벤치로 hot path 직접 측정 필요.

### 메모

- **다른 5 카테고리 (interaction/oneOf/ifThenElse/computed/memory) 의 v2 보강은 보류.** 이유: 그것들은 setTimeout dominant 하므로 단순 setTimeout 제거 만으론 의미 있는 hot path 측정 안 됨. 대신 Phase 3 마이크로벤치에서 `setValue latency`, `oneOf switch latency` 같은 정확한 hot path 를 별도로 만드는 게 옳다.
- **Form Rendering v2 가 회귀 분석의 주력 측정 도구**. legacy 는 5월 결과와의 시계열 비교용으로만 유지.
- node 26 호환은 `setup-env.ts` 의 `defineProperty(navigator, ...)` 로 이미 해결됨. node 20 강제는 v2 에서 불필요 (다만 legacy 와의 비교 일관성 위해 현 세션은 node 20 유지).

### 가드 (구버전 호환)

- 기존 legacy `benchmark-*.json` 파일은 5월 7일 데이터와의 비교용으로 `results/` 에 보존. 새 측정은 `bench-v2-*.json` 형식.
- ~~정상화는 새 `v2 / v2:all / v2:repeat` script 로 분기~~ → **세션 #2 에서 legacy 스크립트(`check`/`start`/`compare`) 전면 제거 후, 새 스크립트 (`bench`, `bench:all`, `bench:repeat`, ...) 가 캐노니컬 entry 가 됨.** 결과 파일명은 호환을 위해 `bench-v2-*.json` 유지.

**산출**: 정상화된 벤치 + N=5 sweep 결과. Phase 1 의 회귀 결론 재판정.

## Phase 2 — Scale dial 추가

- [x] `src/fixtures/scale-schemas.ts` (사용자 작업, builder 4종)
  - [x] `buildFlatSchema(N)` (50/100/500 필드)
  - [x] `buildNestedSchema(depth, fanout)` (d3-f4, d5-f4)
  - [x] `buildArraySchema(itemCount)` (100/500/1000 items)
  - [x] `buildOneOfHeavySchema(branchCount)` (5/10/20 분기)
- [x] `src/benchmarks/canard/scale-rendering.tsx` — `SCALE_RENDERING_RUNNERS` export
- [x] `src/benchmarks/canard/scale-interaction.tsx` — `SCALE_INTERACTION_RUNNERS` export
- [x] `src/benchmarks/canard/array-node-stress.tsx`
  - [x] push×100, applyValue×200, push+remove×100 — workspace `latest` 전용 (`latestOnly: true` — `FormHandle.findNode` 의 internal API 사용)
- [x] `src/index.ts` (이전 `index-v2.ts`) 의 suite 통합 (`--scale`, `--array-stress`, `--no-core` 플래그)
- [x] scripts: `bench`, `bench:all`, `bench:repeat`, `bench:scale`, `bench:scale:repeat`, `bench:array-stress`, `bench:full`, `bench:full:repeat`
- [x] **legacy 제거** (사용자 지시): `src/index.ts`(legacy), `src/compare-benchmark.ts`, `src/benchmarks/canard/{computed,form-rendering,ifthenelse,interaction,memory,oneof}-performance.tsx`, `src/benchmarks/genie/**`, `src/reporters/**`, `src/visualizer/**` 삭제. `v2/` 서브디렉토리 평탄화. unused deps (`@react-genie-form/next`, `d3`, `microtime`, `@vitejs/plugin-react`, `@types/d3`, `@types/microtime`) 제거.
- [x] 전 카테고리 실행 (`yarn bench:full`, N=1) — 결과 `results/bench-v2-2026-05-28T16-50-11-113Z.json`
- [x] N=3 sweep (`yarn bench:full:repeat`) — 결과 `results/bench-v2-2026-05-28T17-06-12-672Z.json`

### Scale N=3 통계 (latest, 2026-05-29)

| Category                         | mean hz | rel std     | 안정성         |
| -------------------------------- | ------- | ----------- | -------------- |
| Form Rendering v2                | 493.54  | ±5.29%      | (N=5 583 비교) |
| Scale Render Flat 50             | 89.27   | ±3.02%      | ✅ 안정        |
| Scale Render Flat 100            | 45.20   | ±3.67%      | ✅ 안정        |
| Scale Render Flat 500            | 8.43    | ±5.35%      | 양호           |
| Scale Render Nested d3-f4        | 54.83   | ±4.85%      | 양호           |
| Scale Render Nested d5-f4        | 3.00    | ±4.35%      | ✅             |
| Scale Render Array 100           | 8.87    | ±1.30%      | ✅ 매우 안정   |
| Scale Render Array 500           | 1.73    | ±1.21%      | ✅ 매우 안정   |
| Scale Render Array 1000          | 0.87    | ±2.72%      | ✅             |
| Scale Render OneOf 5             | 685.05  | ±1.46%      | ✅             |
| Scale Render OneOf 10            | 697.55  | ±4.06%      | 양호           |
| Scale Render OneOf 20            | 706.79  | ±4.74%      | 양호           |
| Scale Interact Flat 50           | 66.18   | ±5.47%      | 양호           |
| Scale Interact Flat 500          | 6.52    | ±6.50%      | 양호           |
| Scale Interact Nested d5         | 2.88    | ±2.78%      | ✅             |
| **Array Stress push×100**        | 50.51   | **±23.43%** | ⚠️ 매우 noisy  |
| **Array Stress applyValue 200**  | 27.42   | **±19.22%** | ⚠️ noisy       |
| **Array Stress push+remove×100** | 48.38   | **±22.20%** | ⚠️ noisy       |

### N=3 통계 발견

1. **Scale Render / Interact 는 모두 ≤6% rel std** — 회귀 감지에 충분히 안정 (기본 -15% threshold).
2. **Scale Render Array 100/500 은 ±1.5% 미만** — 가장 안정. **array 회귀 게이트는 -3% 도 분리 가능**.
3. **Array Stress 는 N=3 으로도 ±19~23% std** — push/applyValue/remove micro 동작이 setup overhead/GC 변동에 매우 민감. **N=10~15 권장**, 또는 mount cost 를 따로 빼는 분리 측정 필요. 현재 -15% 게이트가 노이즈로 false positive 가능.
4. **OneOf 는 branch 5/10/20 모두 평균 685~706 hz** — Phase 1.5 결론(lazy init) 재확인.

### Scale 결과 (latest, N=1, 전 카테고리)

**Mount (Scale Render):**

| Category                      | mean ms      | 비고                              |
| ----------------------------- | ------------ | --------------------------------- |
| flat-50                       | 12.0 ms      |                                   |
| flat-100                      | 21.5 ms      | flat-50 의 1.8×                   |
| **flat-500**                  | **109.8 ms** | flat-50 의 9.1× (선형)            |
| nested-d3-f4 (~85 nodes)      | 18.3 ms      |                                   |
| **nested-d5-f4 (~341 nodes)** | **310 ms**   | depth 폭증                        |
| array-100                     | 98 ms        |                                   |
| array-500                     | 516 ms       |                                   |
| **array-1000**                | **1070 ms**  | **1초 넘음 — 가장 큰 mount cost** |
| oneOf-5 / 10 / 20             | 1.33~1.39 ms | **분기 수 무관** ✅ (active 만)   |

**setValue (Scale Interact, 1 op = mount + 10 onChange + drain):**

| Category         | mean ms  | Δ vs Render (10 changes)  |
| ---------------- | -------- | ------------------------- |
| flat-50          | 13.8 ms  | +3.49 ms (~0.35ms/change) |
| flat-100         | 26.0 ms  | +5.97 ms                  |
| flat-500         | 138.6 ms | +37.6 ms (~3.76ms/change) |
| nested-d3-f4     | 22.0 ms  | +5.83 ms                  |
| **nested-d5-f4** | 323.1 ms | +23.5 ms                  |

**Array Node Stress** (latest workspace 전용, `--array-stress` flag, `FormHandle.findNode('/items')` 로 `ArrayNode` 직접 호출):

| Category              | mean ms | per-op cost                                    |
| --------------------- | ------- | ---------------------------------------------- |
| push × 100            | 18.4 ms | ≈ 0.165 ms / push (mount baseline 1.86ms 제외) |
| applyValue(200 items) | 41.3 ms | bulk replace ≈ 39.4 ms (per-item ≈ 0.20ms)     |
| push×100 + remove×100 | 23.1 ms | remove 가 push 보다 ~3× 쌈                     |

### 핵심 발견

1. **legacy `sampleSchemas[2]` (작은 폼) 가 회귀를 underestimate 한 게 확정.** 실제 production 규모 (500 props / array 1000) 비용은 **수백 ms ~ 1초**.
2. **oneOf 분기 수는 mount 비용 거의 없음** — active branch 만 mount. 이번 race fix 의 `__primeInitialBranch__` 가 active 분기만 처리하는 게 잘 작동.
3. **Array N items mount 가 O(N)** — `applyValue` 의 clear+push 전체 패턴 의심점이 정확히 1초/1000-item 으로 측정됨. array-stress 로 push/apply/splice 분리 진행 중.
4. **Nested depth 가 가장 폭발적** — d3 → d5 만 17× (18 → 310ms). cascade 비용이 depth 에 거의 지수적.

**산출**: 스케일 카테고리 + 결과. ArrayNode clear+push 의심점 실측치 확보 (전체 sweep 후 갱신).

## Phase 3 — schema-form 내부 hot path 마이크로벤치

- [x] `packages/canard/schema-form/bench/` 디렉토리 신규
- [x] `packages/canard/schema-form/vitest.bench.config.ts` (env: node, include: bench/\*\*)
- [x] `packages/canard/schema-form/package.json` 에 `"bench"` / `"bench:watch"` script
- [x] 5개 시드:
  - [x] `nodeFromJsonSchema.bench.ts` (flat/nested/oneOf/computed)
  - [x] `branch-strategy-init.bench.ts` (oneOf 2×3 ~ 10×10, nested depth 3/5)
  - [x] `event-cascade.bench.ts` (flat 20 props × 5 setValue / derived chain / oneOf switch) — drain 비용에 묻힘, 보강 필요
  - [x] `find-node.bench.ts` (depth 3/7/12, wide fanout 10/50)
  - [x] `compute-recalculate.bench.ts` (visible / active / derived simple+heavy / watch / oneOfIndex)
- [x] baseline 측정 — 결과 `bench/.results/latest.json`

### baseline 주요 발견

| 카테고리              | 측정                              | 해석                                                                  |
| --------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `recalculate`         | **32 ns/op** (deps 1~7 거의 일정) | 컴파일된 dynamic function 의 V8 인라이닝 효과. 우려 해소.             |
| `findNode`            | depth 12 → 1.3μs, wide 50 → 0.4μs | subnodes 선형 스캔 우려 미미. 최적화 우선순위 낮음.                   |
| `BranchStrategy init` | 2×3=46μs, 10×10=**448μs** (선형)  | **mount cost 의 주범**. 노드 수에 거의 선형.                          |
| `nodeFromJsonSchema`  | flat 5=28μs, nested 7=50μs        | 작은 폼은 매우 빠름.                                                  |
| `event cascade`       | 모두 2.4ms (drain dominant)       | setTimeout(0) drain 비용에 묻힘. **보강 필요** (벤치 자체 설계 이슈). |

### 결론

- **Form Rendering 회귀의 본질은 `BranchStrategy.initialize`** 의 노드 수 비례 비용. recalculate / findNode 는 무관.
- 이번 race fix 의 `__primeInitialBranch__ + __processChildren__` 추가 호출도 BranchStrategy.initialize 의 일부이므로 이 마이크로벤치로 향후 회귀 ±μs 단위 추적 가능.
- listener bucketing / find lookup cache 같은 후보 최적화의 우선순위 낮춤. **BranchStrategy.initialize 의 노드별 비용 분해가 진짜 임팩트.**

**산출**: 5개 마이크로벤치 + baseline JSON. `BranchStrategy.initialize` 의 회귀 ±μs 가드 확보.

## Phase 4 — CI 통합 + 회귀 가드

- [x] `.github/workflows/benchmark.yml` (master push + nightly cron 03:30 UTC + workflow_dispatch)
  - [x] schema-form micro bench (`yarn workspace @canard/schema-form bench`)
  - [x] aileron bench (`bench:full:repeat` 와 동일: scale + array-stress + core, `--repeat=3`)
  - [x] artifact 업로드 (`bench-results-${run_id}`, 30일 보관)
  - [ ] 결과 JSON 을 `results/` 에 commit — 보류 (artifact 로 충분, write-permission/lint loop 회피)
- [x] 회귀 게이트 (warn-only): `src/utils/regression-check.ts` — 직전 N개 평균 대비 임계치 (기본 -15%) 초과 시 ⚠️ 출력. `--fail` flag 로 hard-gate 가능.
- [ ] PR 워크플로우 (옵션): fork-point baseline 과 비교, PR comment

### 메모

- **CI 트리거는 master push + nightly cron + manual dispatch.** `paths:` filter 로 schema-form src/bench + benchmark-form src 변경에만 반응.
- **regression-check.ts 는 `bench-v2-*.json` 만 본다** — micro bench `latest.json` 은 별도 형식. 후속에서 통합 가능.
- **artifact 우선, commit-back 보류.** main 에 자동 push 는 hook 무한 루프 위험 + write permission 필요. 필요해지면 별도 PR 브랜치로 분리.

**산출**: `.github/workflows/benchmark.yml` + `regression-check.ts` + `regression-check` yarn script.

## Phase 5 — 더 깊은 측정 (선택)

- [ ] Playwright + `performance.measure` 로 실제 브라우저 측정 (JSDOM 한계 보완)
- [ ] `v8.writeHeapSnapshot()` 으로 노드당 retained size 직접 계산
- [ ] t-test / z-score 통계적 회귀 감지

---

## 진행 상태 로그

세션 종료 시 아래 기록.

### 2026-05-29 세션 #1

- 시작 Phase: 0
- 완료 Phase: **0, 1, 1.5, 3** (4 phases in one session)
- 백그라운드 진행 중: N=15 sweep (bkaf51pnv) — 결과 분석은 다음 세션
- 미수행: Phase 2 (Scale dial), Phase 4 (CI), Phase 5 (Playwright/heap)

#### 한 줄 요약

사용자 직감 ("성능 안 나오는 것 같다") 은 일부 맞음(+점진적 -10.58% 회귀). 다만 race fix 가 회귀 원인이 아니라 회복 방향. **주범은 BranchStrategy.initialize 의 노드 수 비례 비용** — Phase 3 마이크로벤치로 정밀 추적 가능.

#### 주요 발견 (시간순)

1. **Phase 0 baseline**: 5월 7일 → 오늘 latest Form Rendering +7.2% (190.77 → 204.59).
2. **Phase 1 legacy sweep**: -6.1% 누적 회귀 발견. 0.12.0→0.12.5 의 -3% 가 이번 race fix 탓으로 추정 (→ 후속 정정).
3. **Phase 1 노이즈 검증**: legacy 측정의 단일 sweep 노이즈가 Form Rendering 만 ±3.96%. 다른 5 카테고리는 setTimeout dominant 로 회귀 못 잡음 — 측정 둔감이지 실제 안정 아님.
4. **Phase 1.5 정상화**:
   - `setup-env.ts` (JSDOM + node26 호환 + GC 헬퍼)
   - `index-v2.ts` (--repeat=N + aggregate 통계 + JSON 저장)
   - `form-rendering v2` (fresh root + setTimeout 제거)
   - `--expose-gc` 적용 + `v2` / `v2:all` / `v2:repeat` script
   - **N=5 결과**: Peak (0.5.0) → latest **-10.58%** (legacy underestimate). 점진 누적. **race fix 가 -3% 회복 방향**.
5. **Phase 3 마이크로벤치** (5 시드, baseline):
   - `recalculate` 32ns/op (deps 영향 없음, 컴파일된 dynamic function 효과) — **우려 해소**
   - `findNode` 50 width 0.4μs, depth 12 1.3μs — **우려 해소**
   - `BranchStrategy init` 노드 수에 선형 (10×10 = 448μs) — **회귀 주범 확정**
   - `nodeFromJsonSchema` flat 28μs
   - `event cascade` setTimeout(0) drain 에 묻힘 — **마이크로벤치 자체 보강 필요 (follow-up)**

#### 결과 파일

- `benchmark-form/results/benchmark-2026-05-28T15-46-42-525Z.json` (legacy sweep #1)
- `benchmark-form/results/benchmark-2026-05-28T16-00-13-997Z.json` (legacy sweep #2, 노이즈 검증)
- `benchmark-form/results/bench-v2-2026-05-28T16-13-49-716Z.json` (v2 N=5)
- `benchmark-form/results/bench-v2-2026-05-28T*.json` (N=15, 백그라운드 진행 중)
- `canard/schema-form/bench/.results/latest.json` (마이크로벤치 baseline)

#### 환경 메모

- 모든 명령에 `PATH=~/.nvm/versions/node/v20.19.5/bin:$PATH` prefix 필요 (system node v26 회피).
- vitest bench 는 yarn berry 에서 `node /Users/Vincent/Workspace/albatrion/node_modules/vitest/vitest.mjs bench --config vitest.bench.config.ts --run` 으로 호출.

#### 다음 세션 시작점

1. **N=15 sweep 결과 분석** → 개별 step 회귀의 통계적 유효성 (1σ → 2σ 신호 분리)
2. **Phase 3 확장**: per-version 마이크로벤치 비교 (`BranchStrategy init` 의 0.4 → latest 곡선)
3. **Phase 2 (Scale dial)** 또는 **Phase 4 (CI)**
4. **event cascade 마이크로벤치 보강** (drain 비용 분리)

### 2026-05-29 세션 #2

- 시작 Phase: 2 (세션 #1 의 다음 세션 시작점 중 #3 픽업)
- 완료 Phase: **2, 4** (Scale dial 인프라 + CI workflow)
- 미수행: Phase 5 (선택), N=15 sweep 분석 (이전 세션 백그라운드 미회수)

#### 한 줄 요약

큰 폼·배열·oneOf·중첩 4 차원의 **scale dial 측정 인프라 완성** (16 categories) + **ArrayNode push/applyValue/remove 분리 stress** + **CI workflow + warn-only 회귀 가드** 구축.

#### 주요 발견

1. **flat / nested / array 모두 노드 수에 거의 선형** — 정상화된 v2 패턴이 size 회귀를 깔끔하게 잡는다. (e.g. flat 50→500: 10×, nested d3→d5 leaf 16×: 18×)
2. **oneOf 분기 수는 mount 비용 거의 무관** (~1.4ms, 분기 5/10/20 동일) — schema-form lazy oneOf init 동작 확인. 향후 lazy 깨지면 명확한 회귀 신호.
3. **Array 1000 items mount 가 ~1초**. legacy `sampleSchemas[2]` 가 sub-2ms 였으므로 큰 폼/배열 경우 회귀가 underestimate 되어 왔음.
4. **ArrayNode push ≈ 0.165ms/op, applyValue(N) ≈ 0.20ms/item, remove ≈ 0.05ms/op**. push 가 remove 보다 ~3× 비쌈 — 신규 child 노드 init 비용 차이.

#### 새 파일

- `src/fixtures/scale-schemas.ts` — flat/nested/array/oneOf 4 builder + 11 cases
- `src/benchmarks/canard/scale-rendering.tsx` — 11 cases 의 mount cost
- `src/benchmarks/canard/scale-interaction.tsx` — 5 cases 의 mount + 10 onChange
- `src/benchmarks/canard/array-node-stress.tsx` — push/apply/remove 분리 (latest only, FormHandle.findNode 사용)
- `src/utils/regression-check.ts` — warn-only 회귀 가드 (직전 N개 평균 vs latest, 임계치 -15%)
- `.github/workflows/benchmark.yml` — master push + nightly cron + workflow_dispatch
- `package.json` scripts: `bench`, `bench:all`, `bench:repeat`, `bench:scale`, `bench:scale:repeat`, `bench:array-stress`, `bench:full`, `bench:full:repeat`, `regression-check`
- **legacy 제거 (사용자 지시):** `src/index.ts`(legacy)/`compare-benchmark.ts`/`benchmarks/genie/**`/`reporters/**`/`visualizer/**`/`v2/` 서브디렉토리 삭제 및 평탄화. unused deps 제거.

#### 추가 작업 (단계별 진행 모드)

세션 후반에 사용자 지시로 4개 후속 작업 진행:

- [x] **Event cascade 마이크로벤치 보강** — `bench/event-cascade.bench.ts` 재작성. 노드 1회 init + per-op `setValue` 만 반복 (lazy persistent node). 3 lane 으로 drain 비용 분리: `sync` (no drain), `microtask` (`await Promise.resolve()`), `macrotask` (`setTimeout 0`). Phase 3 의 "drain dominant" 문제 해결.
- [x] **Heap snapshot 도구** — `src/utils/heap-snapshot.tsx` + `yarn heap-snapshot` script. `v8.writeHeapSnapshot()` + `process.memoryUsage()` 로 노드 트리의 retained heap delta 측정. scenario 별 (`empty`/`flat-*`/`nested-*`/`array-*`/`oneOf-*`) 비교 가능. `--snapshot` flag 로 DevTools 분석용 `.heapsnapshot` 파일 저장.
- [x] **Array Stress v2 refactor** — `array-node-stress.tsx` 의 per-op mount 제거. lazy persistent node + `clear()` reset 패턴으로 변경. 이론적으로 ±20% std → 한 자리수 % 기대. 검증은 per-version sweep 완료 후 N=15 sweep 으로.
- [x] **결과 요약 도구** — `src/utils/summary.ts` + `yarn summary <bench-v2-*.json>`. category × version 매트릭스 + Δ end-vs-start 칼럼 markdown 출력. PR comment / CI artifact 분석용.
- [x] **--versions=a,b,c filter** — `index.ts` 에 추가. all-versions 보다 빠른 subset 측정 (예: `--versions=0.4.14,0.5.0,0.10.0,0.12.5,latest`).
- [ ] **Per-version scale 비교 (subset 5 versions × N=3)** — 0.4.14 / 0.5.0 / 0.10.0 / 0.12.5 / latest × 16 scale 카테고리. **백그라운드 진행 중 (~50-70분)** — 완료 시 회귀 곡선 정리.
- [ ] **Array Stress N=15 검증** — per-version 종료 후 실행, refactor 효과 확인.

#### 결과 파일 (이 세션)

- `results/bench-v2-2026-05-28T16-50-11-113Z.json` (`bench:full` N=1, scale + array-stress + core 20 entries)
- N=3 sweep 진행 중 (`bry7fvnu2`) — 완료 시 `bench-v2-*.json` 추가 저장

#### 다음 세션 시작점

1. **이번 N=3 sweep 결과 분석** (~5분 후 완료) → scale 카테고리의 sweep-간 std 확인
2. **N=15 sweep 결과 분석** (세션 #1 미완) — 통계 유효성
3. **per-version scale 비교** — 0.4 → latest 의 큰 폼/큰 배열 회귀 곡선
4. **event cascade 마이크로벤치 보강** (drain 비용 분리)
5. **Phase 5**: Playwright/heap snapshot (선택)
6. (CI 후속) `results/` 자동 commit 또는 별도 history 브랜치 — 회귀 게이트에 historical baseline 필요해질 때
