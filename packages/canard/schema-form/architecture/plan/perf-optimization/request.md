# 최적화 — 성능 최적화 — 개발요청서

> 원장 정본: 게이트와 선은 TEST-027(느린 항목은 이유를 적고 Vincent가 받아들여야 병합)·TEST-072('일정 수준'은 같은 실행에서 옛 판에 견주어 잼)·TEST-073(`guard:check`의 수치), 기준선은 TEST-031·TEST-026, 시나리오는 TEST-032, 원칙은 TEST-029·GOAL-011(G6)·GOAL-050, 비용의 상한은 SETTLE-017, 노드 비용 모델은 NODE-018·NODE-055, 금지된 최적화는 SETTLE-044, 허용된 남는 최적화는 BLUEPRINT-007. 시점은 27라운드 소유자 답(`reviews/round-27-owner-answers.md:11`, TEST-027 보충)이 정했다. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 구현 완료 뒤의 **별도 작업**이다(27라운드 소유자 답: "구현 완료 후, 최적화를 시도할 예정"). 착수는 07 전환이 머지된 뒤다 — 그때 처음으로 새 엔진이 `<Form>`을 섬기고 React·jsdom의 최종 수치(LANDING-067 게이트)가 생긴다. 08(UI 플러그인 넷)은 코어를 건드리지 않으므로 병렬이다. 09 정리·릴리스의 "릴리스 전 벤치 재실행"(LANDING-096)은 이 작업이 끝난 뒤의 코드를 잰다.
- base `feat/schema-form-08-review-and-perf`(330라운드; 작업이 끝나면 `1.0.0-beta`에 squash). 가설 하나에 커밋 하나, 수용한 가설 3~4개마다 PR 하나이고, 전체 게이트는 PR마다 한 번 돈다(결정 대기열 56(344라운드 편집자 가결정, 소유자가 뒤집을 수 있음, `reviews/owner-queue-07.md`)). 브랜치 제안 `perf/schema-form-<묶음>`. 커밋마다 대상 행을 재어 측정이 섞이지 않게 한다.
- 출발점은 [속도 문제 대장](../../verification/performance-issues.md)의 "열림" 행이다. 측정 원본은 [03 성능 기록](../../verification/03-node-and-settle/performance.md)과 [04 성능 기록](../../verification/04-derive-and-controls/performance.md)이며, 05·06·07이 더한 행도 같은 대장에 모인다.

## 목적

동작은 그대로 두고 비용만 줄인다. 대장의 열림 행을 하나씩 "해결"로 옮기거나, 고치지 않을 까닭을 측정으로 확정해 TEST-027의 수용 기록을 완성한다. 두 종류를 가른다:

1. **계약을 어긴 비용** — SETTLE-017·SETTLE-047이 정한 순회 범위(이번 정착의 재계산 목록과 자동 쓰기 기록; 트리 전체는 로드와 전체 교체 쓰기만; 생긴 노드의 채움과 나간·꺼진 조각·잠복 하위 트리의 순회는 SETTLE-017이 범위에서 제외해 허용) 밖의 노드 수에 비례하는 비용(GOAL-011). 수용 대상이 아니라 결함이며 이 작업에서 반드시 고친다. 가드 수·조각 수·재계산 목록의 크기에 예측 가능하게 자라는 비용은 TEST-027의 "통제 가능"이지 위반이 아니다(소유자는 27라운드에 18C-15·67·81의 N·깊이 비례를 받아들였다). 위반인지는 M1이 M0의 수치로 정하며, 오늘 대장의 P-25(같은 참조 규칙 위반, 수용 대상 아님)·P-08(조각 수 F에 대해 O(F²), 미확인)·P-04(잠복 순서의 선형 탐색)는 M1의 우선 검토 후보다. P-03은 06에서 해결되었고(R-17), 차수 탐침만 회귀 신호로 남긴다.
2. **상수·상대 비용** — 계약은 지키되 옛 판보다 느리거나 추정 상한보다 큰 것. P-01·P-02·P-05·P-06·P-07·P-10이 후보다. 고칠지는 측정으로 정하고, 남은 것은 이유를 적어 소유자 수용을 받는다.

## 하지 않는 것

- 원장의 결정을 바꾸는 최적화. 직전 커밋의 활성 집합에서 출발하는 것(SETTLE-044가 기각, P3 형상은 상태의 순수 함수 GOAL-029), 게이트가 읽는 것을 뽑아 건너뛰는 것(BLUEPRINT-007의 기본값), 아이템 노드의 지연 실체화는 NODE-053이 06(PR-5) 벤치 게이트의 실패 처리로만 열어 둔 길(두 모드 시험으로 관찰 결과가 같음을 보인 경우에만)이라, 06의 판정이 그 길을 열지 않았으면 이 작업의 후보가 아니다. 정착 단계의 순서 변경(SETTLE-001, ADR 0007)도 후보가 아니다 — 할 일이 없는 단계를 건너뛰는 것은 GOAL-011의 범위라 다르다. 어떤 최적화가 원장 항목과 부딪히면 코드를 바꾸지 않고 멈춰 새 라운드 항목으로 올린다(PLAN §2의 멈춤 규칙).
- 공개 겉면의 변경. 이름·형·반환형이 바뀌면 최적화가 아니라 설계 변경이다.
- 시험 기대값의 변경. 어떤 PR에서든 시험 파일의 변경은 추가만 허용한다. 기존 단언을 고쳐야 통과한다면 동작이 바뀐 것이고, 그 PR은 되돌린다.
- 측정하지 않은 개선 주장. "성능은 주장하지 않고 측정한다"(TEST-029). 가설 단계의 소실험은 폐기할 복사본에서만 한다(03 성능 기록의 규칙).

## 단계 구성

### M0 측정판 고정 — 기준선 셋과 재현 스크립트

측정 없이는 어떤 묶음도 시작하지 않는다. 한 기계·한 세션에서 세 판을 잰다. 표는 `verification/perf-optimization/baseline.md`에 두고, 원본은 git이 추적하지 않는 실행 디렉터리에 둔다(아래 "측정 실행의 자리"). 표에는 실행 ID와 원본 파일 이름을 적는다.

| 판 | 무엇 | 까닭 |
| --- | --- | --- |
| 옛 판 | v0.16.0(`660dde66f`)의 레거시 어댑터(TEST-031의 고정 커밋) | TEST-027의 "옛 판보다 느린 항목"의 기준. 옛 판 대 새 판의 비교는 `benchmark-form`만 맡고(TEST-026), 옛 배포 판을 고정해 같은 실행에서 나란히 잰다. 옛 판과 같은 실행의 비교는 `benchmark-form`의 `--equivalent` 모드가 한다(아래 행 모음). 패키지 벤치 가운데 `bench/legacy-compare/node-and-settle.bench.ts`의 같은 프로세스 레거시 열은 보조 자료다 |
| 최적화 전 | 루프를 시작하는 커밋(정돈-3과 8단계 구조 정리가 반영된 `feat/schema-form-08-review-and-perf`의 그 시점 HEAD. 해시는 `baseline.md` 머리와 실행 ID에 적는다) | 이 작업이 얼마나 줄였는지의 기준. 묶음마다 이 판과 견준다 |
| 묶음 뒤 | 각 M2 PR의 머지 커밋 | 다음 묶음의 "최적화 전" |

행 모음(독립 스크립트는 Node/V8과 Bun/JSC, NODE-055; vitest 벤치와 `benchmark-form`은 Node). 런타임 판은 측정 세션에서 바꾸지 않고 `env.json`과 표에 적는다. 점검 시점은 Node 26.11.1과 Bun 1.4.3이다. 03·04의 기록은 Node 26.10.0과 Bun 1.4.2이므로, 그 기록의 수치와는 직접 견주지 않는다:

- 독립 스크립트 벤치: B1–B6과 18C-15·67·81은 `bench/legacy-compare/node-and-settle.bench.ts`, TEST-071 행은 `bench/legacy-compare/derive-and-controls.bench.ts`다. 둘은 vitest 벤치가 아니라 패키지 디렉터리에서 `node --import tsx <파일>`과 `bun <파일>`로 따로 돌리는 독립 스크립트이며(03·04 성능 기록의 명령, 경로만 정돈-3 뒤의 것), 이 길로만 두 런타임 수치가 나온다. 이 스크립트는 새 엔진 안의 회귀 감시이며 옛 판 비교는 아니다(TEST-026).
- vitest 벤치 일곱(`vitest.bench.config.ts`의 `benchmark.include`가 이름으로 나열하며, 자리는 `src/core/__benchmarks__/`): `yarn --cwd packages/canard/schema-form bench:baseline`으로 최적화 전 판의 JSON(`bench/.results/baseline.json`)을 남기고, `bench:compare`로 견준다(`bench/README.md`). `bench:compare`는 비교 표를 출력하고 `benchmark.outputJson`에 따라 `bench/.results/latest.json`도 쓰므로, 그 표와 두 JSON을 실행 디렉터리로 복사한다(원본은 `bench/.results/`에 남긴다). Node에서만 돈다.
- `benchmark-form`의 `--equivalent`: 패키지를 빌드한 뒤 `benchmark-form` 디렉터리에서 `node --expose-gc --import tsx src/index.ts --equivalent --mode=core --min-samples=100 --out=<실행 디렉터리>/equivalent-core.json`과 `--mode=render`를 차례로 돈다. 옛 판(0.16.0)과 새 판을 같은 실행에서 재고, 판정은 TEST-073의 선(처리량 평균 15% 넘는 하락과 Welch p<0.05, 표본 100회 이상)이다. `guard:baseline`과 `guard:check`는 쓰지 않는다. 둘은 `latest`만 재서 git이 추적하는 `results/baseline.json`(2026-05-29)과 견주고, `guard:baseline`은 그 파일을 덮어쓴다. 07 뒤라 React·jsdom 경로가 새 엔진이다. 상황은 `fixtures/equivalent`의 고정 쌍이며 TEST-032의 네 상황에 대응한다.
- 대장 탐침(`verification/perf-optimization/`): `probe-gate-siblings.ts`(P-03 회귀 신호, N = 1천·2천·4천·8천), `probe-fragment-toggle.ts`(P-08, 조각 16·32·64·128 토글), `probe-if-host-siblings.ts`(P-09, 비루트 `if` 호스트 형제 1천–8천에서 쓰기 한 번), `bisect-b5.mjs`(P-10, `B5` 커밋 이분). **상태가 미확인·미측정인 행(P-08·P-09·P-10)은 여기서 수치나 원인 분리를 얻어 대장에 적는다.**
- 메모리: `B2`의 노드당 잔존 힙, `benchmark-form`의 `heap-snapshot`·`heap-parse`로 보유 경로 분류(P-07).
- 환경: 기기, OS, Node·Bun 판, 커밋, `NODE_ENV`(독립 스크립트는 `production`을 기본으로 하고, `development`는 필요한 행만), 조용한 창(측정하는 동안 다른 세션이 빌드·시험·벤치를 돌리지 않음), 준비 횟수, 표본 수, 중앙값과 10–90백분위(`benchmark-form` 행은 TEST-026대로 99번째 백분위도)를 표에 함께 적는다(P-11의 흔들림을 재현 조건 고정으로 다룬다).

재현 스크립트는 `verification/perf-optimization/run-baseline.mjs` 하나로 두어, 빌드 뒤의 명령들을 같은 인자로 순서대로 돈다. 결과는 모두 실행 디렉터리에 모은다. `bench/.results/`의 vitest 결과도 그리로 복사한다.

측정 실행의 자리:

- **실행 디렉터리:** `/private/tmp/claude-501/perf-runs/<실행 ID>/`. git 밖이고 작업 폴더 밖이라, 작업 폴더를 지워도 남는다. 영구 기록은 `baseline.md`의 표다.
- **실행 ID:** `<YYYYMMDD>T<HHMM>-<커밋 7자>-<표지>`. 표지는 `before`(루프 시작 커밋), `after-<묶음 또는 PR 번호>`, `final`(M3) 가운데 하나다. 예: `20261014T2300-1a2b3c4-before`.
- **파일 이름:** `<도구>-<대상>-<런타임>-<모드>.<json|txt>`.
  - `env.json`: 기기, OS, `node -v`, `bun -v`, 커밋, `NODE_ENV`, 시작과 끝 시각, 조용한 창을 연 알림의 시각.
  - `standalone-node-and-settle-node-production.txt`, `standalone-node-and-settle-bun-production.txt`, `standalone-derive-and-controls-…`: 독립 스크립트는 표를 stdout으로 내므로 `.txt`다.
  - `vitest-bench-baseline.json`(`bench/.results/baseline.json`의 복사본), `vitest-bench-latest.json`(`bench/.results/latest.json`의 복사본), `vitest-bench-compare.txt`(`bench:compare`가 출력한 표)
  - `equivalent-core.json`(+`-summary.json`), `equivalent-render.json`(+`-summary.json`)
  - `probe-<이름>-<런타임>.json`
  - `heap-<이름>.json`
- **쓰지 않는 자리:** `packages/aileron/benchmark-form/results/`(git이 추적하는 파일이 섞여 있다), `verification/perf-optimization/baseline/`(원본을 저장소에 넣지 않는다).

### M1 분류와 우선순위 — 소유자 확인 한 번

M0의 수치로 대장의 열림 행마다 네 칸을 채운다.

| 칸 | 값 | 어떻게 정하는가 |
| --- | --- | --- |
| 계약 | 위반 / 준수 | SETTLE-017·SETTLE-047의 순회 범위(생긴 노드의 채움과 나간·꺼진 조각·잠복 하위 트리의 순회는 제외해 허용) 밖 노드 수에 비례하면 위반(GOAL-011). 가드·조각·재계산 목록의 크기에 예측 가능하게 자라는 것은 "통제 가능"(TEST-027)이라 준수다. 위반은 순위와 무관하게 고친다 |
| 차수 | 이차 / 선형 / 상수 | M0 탐침의 N 배율 |
| 체감 가중 | 높음 / 낮음 | React·jsdom 경로(`--equivalent --mode=render` 행)에서 보이는 차이로 정한다. 코어 전용 행의 차이는 소유자 추정(옛 엔진에서 React 95 대 JS 코어 5, `reviews/round-27-owner-answers.md:9`)대로 작게 나타날 수 있으므로, 코어 수치만으로 순위를 올리지 않는다 |
| 위험 | 원장 접촉 / 없음 | 고치는 길이 원장 항목의 결정 문장과 닿는가. 닿으면 라운드가 먼저다 |

산출은 우선순위표 하나와 묶음 배정(M2)이다. **소유자가 순서와 범위를 한 번 확인한다.** 이 확인은 TEST-027의 수용과 다른 것이며, "어디까지 고칠 것인가"의 범위 결정이다. 결정 대기열 55(344라운드 편집자 가결정, 소유자가 뒤집을 수 있음, `reviews/owner-queue-07.md`): 밤의 루프는 이 확인을 기다리지 않고 M2의 상위 묶음으로 바로 나아가며, `adr-and-axes.md`의 "축이 금하는 후보"(동작 변경·공개 겉면을 포함한 여섯)에 드는 후보만 멈추고 기록한다. 원장과 닿는 후보는 이와 별도로 각 PR 순서의 8단계를 따른다.

### M2 묶음별 최적화 — 가설마다 커밋, 수용한 가설 3~4개마다 PR

제안 순서(M1이 바꿀 수 있다):

| 묶음 | 대상 | 가설(대장의 후보) | 끝났다는 것 |
| --- | --- | --- | --- |
| L1 이차·선형 탐색 비용 | P-08, P-04 (P-03은 해결 R-17, 차수 탐침만 유지) | `selectChildren`의 노드당 한 번 재구성·조립, `getControlLayers`의 청사진당 Set·Map, 청사진 템플릿마다 자식 순서 색인 | N 배율이 선형 이하(1천→8천에서 시간 비 ≤ 8의 작은 상수 배). 계약 위반 0 |
| L2 상수 비용 | P-01, P-10, P-09 | 청사진마다 "controls 없음" 표지를 캐시해 할 일이 없는 상태 키 단계를 건너뜀(GOAL-011 "계산할 필요가 없는 것은 계산하지 않는다"; 단계의 순서는 바꾸지 않음); `B5`의 남은 +0.7 µs는 이분으로 원인을 분리한 뒤; P-09는 M0 수치를 보고 판단 | `B5`·`B6`가 같은 세션의 최적화 전 판보다 측정 오차 밖으로 개선되고, 03 기록(Node 26.10.0 기준 `B5` 처리량 약 66,000회/s, 약 4.1 µs/입력; `B6` 약 25 ms, Bun 1.4.2 약 20 ms)은 방향을 보는 참고로만 쓰거나, 남은 차이의 원인이 적힘 |
| L3 비교·할당·메모리 | P-02, P-05, P-07 | 객체 키 열거 비용 분리와 지름길, 분배 기록의 호스트당 할당 줄이기, 힙 보유 경로 분류 뒤 노드 레코드 다이어트 | TEST-071 통째 교체 객체 행이 선 안(시간 비 2.375× 이상) 또는 열거 비용이 분리되어 수용 이유로 적힘. `B2`가 NODE-018 상한에 가까워지거나 보유 경로가 항목별로 적힘 |
| L4 런타임 교차 | P-06, P-12, P-11 | 두 런타임의 CPU·할당 프로파일 대조, JSC 맵·IC 계측, 측정 절차 고정 | Bun이 Node보다 느린 행의 원인이 코드인지 런타임인지 갈림. 코드면 고치고 런타임이면 수용 이유 |

각 PR의 순서:

1. **가설과 예측.** 바꿀 함수, 예측하는 크기(µs 또는 배율), 닿는 원장 항목을 PR 본문 머리에 적는다.
2. **소실험.** 폐기할 복사본에서 경로를 생략하거나 바꿔 가설을 확인한다. 제품 코드에는 들어가지 않는다.
3. **구현.** 저장소 `seiri_*`·filid 규칙대로. 변경은 그 가설의 함수에 그친다.
4. **커밋마다 확인.** typecheck, 그 가설의 함수에 닿는 시험, 대상 행 측정. 전후 표는 커밋 메시지에 적는다. 대상 행이 예측한 방향으로 측정 오차 밖으로 개선되지 않으면 그 커밋을 되돌린다(결정 대기열 56(344라운드 편집자 가결정, 소유자가 뒤집을 수 있음, `reviews/owner-queue-07.md`)).
5. **PR마다 동작 불변 확인과 측정.** 수용한 가설 3~4개를 PR 하나로 묶어 전체 게이트를 한 번 돈다: 전체 시험(옛 시험·코어 시나리오·렌더·storybook) 초록과 시험 파일의 변경은 추가만, 그리고 같은 기계에서 `bench:compare`와 독립 스크립트 표(최적화 전 판 대비), `--equivalent`(옛 판 대비). `--equivalent`의 어떤 행도 TEST-073의 선(처리량 평균 15% 넘는 하락과 Welch p<0.05)을 넘지 않으며, 넘으면 TEST-027의 절차(이유를 적고 소유자 수용)를 밟는다. 패키지 벤치의 다른 행이 최적화 전 판보다 측정 오차 밖으로 나빠지지 않는다는 기준은 이 계획의 규칙이며 원장 항목이 아니다. `B2` 메모리는 나빠지지 않는다.
6. **비용 적기.** 변경이 드는 속도와 메모리 비용을 PR 본문에 적는다(패키지 `CLAUDE.md`의 설계 가치).
7. **대장 갱신.** 열림 행을 "해결"로 옮기고 크기와 커밋을 적는다. 고치지 않기로 했으면 "열림"에 까닭과 수치를 적는다.
8. **원장.** 고치는 길이 원장 결정과 닿았으면(위험 칸) 코드보다 먼저 라운드 항목이 들어가고, 그 PR은 라운드가 닫힌 뒤 머지한다.

### M3 종합 재측정과 수용 — 09로 넘기는 것

- 모든 묶음 뒤 M0와 같은 명령으로 세 판(옛 판·최적화 전·최적화 뒤)을 다시 재어 대조표를 만든다.
- 남은 느린 행마다 이유와 수치를 적고 **소유자가 받아들인다(TEST-027)**. 수용은 `reviews/round-NN-owner-answers.md` 행으로 받아 TEST-027·관련 항목에 보충으로 적는다(27라운드의 절차).
- NODE-055의 B1–B6 합격선을 다시 판정한다. 대장의 열림은 "해결"이거나 "소유자 수용"이어야 하고 "미확인"·"미측정"·"측정 과제"는 남지 않는다.
- 09의 "릴리스 전 벤치 재실행"(LANDING-096)은 이 대조표의 "최적화 뒤" 판을 다시 재는 일이 된다. 번들 크기(TEST-075)와 모바일 재측정(TEST-074)은 09가 한다.

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

| 부딪히는 코드 | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `src/core/engine/settle/utils/compute/selectChildren.ts`, `src/core/engine/settle/utils/compute/publishStateKeys.ts`, `src/core/engine/settle/utils/controls/getControlLayers.ts`, `src/core/engine/settle/utils/latent/getLatentOrder.ts`, `src/core/engine/settle/utils/write/registerRecalculation.ts`, 값 모델 쓰기 경로, `src/core/engine/utils/compute/sameValue.ts`(정돈-3이 settle과 derive의 공통 organ으로 올림) — 대장의 "위치" 칸 | 공개 겉면 전부, 시험 전부, `bench/legacy-compare/*.bench.ts`와 `src/**/__benchmarks__/*.bench.ts`의 기존 행 | 없음. 재현 스크립트와 탐침은 `verification/perf-optimization/` 아래에 둔다(07의 `measure-*.mjs`와 같은 자리이며 제품 코드가 아니다) |

## 레거시 (LANDING-159·205)

없다. 레거시 삭제는 09다.

## 착수 전 확인

- 07이 `1.0.0-beta`에 머지되어 있고 LANDING-067의 React·jsdom 측정값이 `verification/07-switch/`에 있다.
- 05·06·07이 대장에 더한 열림 행이 있으면 M1의 표에 들어간다.
- `benchmark-form`에 v0.16.0(`660dde66f`) 레거시 어댑터가 있다(TEST-031). 07이 더했다: 별칭 `@canard/schema-form_0.16.0`(배포 tgz), `src/utils/loadCoreBenchmark.ts`의 `'0.16.0'` 분기, `--equivalent` 모드. 확인됨(2026-10-14).
- M1의 우선순위표가 나왔다. 소유자 확인은 기다리지 않는다(결정 대기열 55(344라운드 편집자 가결정, 소유자가 뒤집을 수 있음, `reviews/owner-queue-07.md`)). 축이 금하는 후보는 멈추고 기록한다.

## 산출물과 완료 기준

- [ ] M0: `verification/perf-optimization/baseline.md`(실행 ID와 원본 파일 목록 포함), 재현 스크립트와 탐침(`verification/perf-optimization/`), 미확인·미측정 행(P-08·P-09·P-10)의 수치
- [ ] M1: 우선순위표(계약·차수·체감·위험 네 칸). 소유자 확인은 결정 대기열 55의 가결정 동안 기다리지 않는다
- [ ] M2: 묶음 PR마다 가설·예측·측정·비용이 적힌 본문, 전체 시험 초록, 시험 파일 변경은 추가만, 대장 행 갱신
- [ ] 계약 위반 행 0(M1이 위반으로 분류한 행 전부가 "해결")
- [ ] M3: 세 판 대조표, 남은 느린 행의 이유와 소유자 수용(TEST-027), NODE-055 재판정, 대장의 열림은 "해결" 또는 "소유자 수용"만(미확인·미측정·측정 과제 0)
- [ ] `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- seiri: 최적화도 동작 변경 PR이 아니라 "동작 보존 리팩터"다. 특성화 시험(기존 시험 전체)이 오라클이고, 새 시험은 비용의 차수를 고정하는 벤치 행이다. 한 파일 한 함수, 보조 함수는 한 층 아래로.
- filid: 바꾼 fractal의 `DETAIL.md`에 비용 모델(어떤 입력에 비례하는가)을 코드보다 먼저 적는다. 스캔은 PR 경계에서 한 번.

## 원장 항목 색인

- BLUEPRINT-007 게이트가 읽는 것은 뽑지 않는다 — 전부 다시 평가, 건너뛰기가 필요한 경우와 남는 최적화
- GOAL-011 G6 정밀한 고속 제어 — 비용은 변경에 비례한다
- GOAL-029 P3 형상은 상태의 순수 함수
- GOAL-050 다섯 가치 — 고속성(최소 생성·메모리 안정·캐싱)
- LANDING-067 PR-7 전환 — React·jsdom 최종 평가의 자리
- LANDING-096 보정 PR-8 — 릴리스 전 벤치 재실행
- NODE-018 비용(추정) — 노드마다 객체 하나, 행 아홉, 숨은 클래스, 벤치 여섯
- NODE-053 아이템 노드는 모두 실체화한다
- NODE-055 노드 구조 벤치 B1–B6의 합격선
- SETTLE-017 비용의 상한(G6)
- SETTLE-044 직전 커밋의 활성 집합에서 출발하는 최적화는 채택하지 않는다
- TEST-026 옛 판과 새 판의 속도 비교 — 하니스 benchmark-form
- TEST-027 벤치 게이트 — 느린 항목은 이유를 적고 Vincent가 받아들여야 병합
- TEST-029 원칙(G6) — 비용은 바꾼 것의 크기에 비례, 성능은 주장하지 않고 측정
- TEST-031 기존 구현이 기준선 — 커밋을 고정해 재현 가능하게
- TEST-032 벤치 시나리오 — G6의 네 상황과 새 구조 고유·메모리·14라운드 행
- TEST-071 PR-3 벤치 회귀 — `injectTo` 1만 원소의 비교 비용
- TEST-072 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다
- TEST-073 예산의 수치는 기존 `guard:check`
- TEST-074 안전 임계를 목표 배율로 올려 적지 않는다
- TEST-075 번들 크기 예산
