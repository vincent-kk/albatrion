# ADR 0009 — 성능 예산과 벤치마크 계획

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| GOAL-023 | 편집자 결정(3–5라운드 기록, `reviews/round-1.md:28` 측정, `adr/0009-performance-budget-and-benchmarks.md:53`) | 5 |
| TEST-013 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:154`), 소유자 답(`reviews/round-16-owner-answers.md:13` 답 7), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; `:160`의 파서 변환 시험을 대체) | 18 |
| TEST-026 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:216`) | 16 |
| TEST-027 | 소유자 답(`reviews/round-16-owner-answers.md:12` 답 6), 편집자 결정(16라운드 도출, '통제 가능'의 뜻, `09-landing-and-test-strategy.md:223`) | 16 |
| TEST-028 | 소유자 답(`00-goals.md:150` G6) | 1(ADR 0009 본문) |
| TEST-029 | 원리(`00-goals.md:77` G6), 소유자 답(`00-goals.md:150` G6) | 1(ADR 0009 본문) |
| TEST-030 | 편집자 결정(11라운드 5차 주, `adr/0009-performance-budget-and-benchmarks.md:3`) | 11 |
| TEST-031 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:64`), 편집자 결정(16라운드, `09-landing-and-test-strategy.md:222`) | 16 |
| TEST-032 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:71`), 편집자 결정(14라운드, `adr/0009-performance-budget-and-benchmarks.md:82`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-15·18C-67·18C-81) | 18 |
| TEST-033 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:86`) | 1 |
| TEST-034 | 편집자 결정(1라운드 ADR 0009 본문의 관찰, `adr/0009-performance-budget-and-benchmarks.md:16`) | 1 |
| TEST-035 | 편집자 결정(1라운드 ADR 0009 본문, `adr/0009-performance-budget-and-benchmarks.md:35`) | 1 |
| TEST-036 | 편집자 결정(1라운드 측정 기록, `reviews/round-1.md:19`) | 1 |
| TEST-037 | 편집자 결정(2라운드 측정 기록, `reviews/round-2.md:18`) | 2 |
| TEST-062 | 편집자 결정(1라운드 ADR 0009 본문의 관찰, `adr/0009-performance-budget-and-benchmarks.md:104`) | 1 |
| TEST-065 | 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(17라운드, 18라운드 안건으로 이관, `reviews/round-18-agenda.md:67`) | 18 |
| VALIDATE-027 | 편집자 결정(1라운드, `adr/0004-validator-plugin-compile-guard.md:44` R18), 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:13` 반영 칸; 답을 가로 읽음) | 18 |

## 결정

### 00-goals-and-values.md §1.8 목표 사이의 긴장

- **목표 G3(의미는 위임한다) ↔ G6.**(GOAL-023) 가드를 검증기에 위임하면 호출 비용이 생기고, 폼이 `if`의 내부를 읽지 않으면 의존 경로를 모른다(GOAL-023). 측정(TEST-036): 루트에 걸린 가드 200개를 키 입력마다 전부 돌려도 7.9 µs이고, "가드가 걸린 객체의 참조가 그대로면 건너뛴다"는 루트 가드에 효과가 없다(GOAL-023). 유효한 것은 변경 경로 → 가드의 역색인뿐이며, 이것도 측정이 필요를 보일 때만 넣는다(GOAL-023).
- **G5 ↔ G6.**(GOAL-024) 동기 작업 루프는 쓰기 한 번의 작업량을 늘릴 수 있다(GOAL-024). 해소: 건너뛰기가 설계의 일부다 — 참조가 그대로인 가드, dirty 표시가 없는 서브트리, 의존 값이 그대로인 표현식(GOAL-024).
- **G5 ↔ G7.**(GOAL-024) 이벤트가 내부 상태를 움직이지 않게 되는 것은 척추를 없애는 것이 아니다(GOAL-024). 구독·시그널링·`revision`은 남고, 바뀌는 것은 "내부 로직은 이벤트를 구독하지 않는다" 하나다(GOAL-024).
- **G2 ↔ G1.**(GOAL-024) 표현 층이 값을 지울 수 있다(`&active`)(GOAL-024). 판정은 방출 값에 대해 내려지므로 계약은 깨지지 않지만, 그 결과 값이 invalid가 되는 것은 작성자의 책임이다(GOAL-024).

`00-goals.md`의 `&키`·`control` 표기는 `controls.키` 그룹 표기로 바뀌었고, 조각 식의 기준점은 호스트(`./x`)가 되었으며, 맨 폼 전용 키는 `options`·`presentation` 그룹으로 옮겨졌다(GOAL-024).

### 05-validation-and-errors.md §1.8 내장 대안과 성능 책임

플러그인으로 허용하되 성능 예산은 AJV를 기준으로 잡는다(VALIDATE-027, TEST-073).

인터프리터형 검증기는 같은 작업이 약 70배 느리고 호스트 객체의 폭에 비례한다(`@cfworker/json-schema`: 가드 200개에 578 µs, 아이템 10,000개를 훑는 `contains` 가드 하나에 4.5 ms)(VALIDATE-027). `@cfworker/json-schema`는 내장 후보가 아니라 플러그인 구현체 후보 가운데 하나가 된다(VALIDATE-027). 검증기의 성능은 폼이 관여할 문제가 아니므로 폼은 아무 장치도 더하지 않는다(역색인 없음, `if` 내용 불관여 유지)(VALIDATE-027). 예산은 AJV 기준으로 적고, 인터프리터형은 "동작하되 성능은 플러그인의 몫"으로 문서화한다(VALIDATE-027).

- **작은 검증기를 내장하고 플러그인이 있으면 그것을 쓰는 안을 채택하지 않는다.**(VALIDATE-028) 같은 개념에 평가기가 둘이면 서로 다른 답을 낼 수 있다(VALIDATE-028). 현재 구조에서 이미 확인된 문제다(`requiredFactory`와 표현식 컴파일러, `01-current-structure.md` §3)(VALIDATE-028).
- **AJV를 내장하지 않는다.**(VALIDATE-028) 번들이 커지고 플러그인 분리의 장점이 없어진다(소유자의 판단)(VALIDATE-028).

ADR 0010은 분기 관행 문서다(외부 조사 항목 아님)(VALIDATE-030).

### 07-landing-and-tests.md §2.3 기존 시험과 렌더 하니스의 처분

234파일을 넷으로 가른다(TEST-013).
(TEST-013, WRITE-052, TEST-068)

| 부류 | 기준 | 대표 | 규모 |
| --- | --- | --- | --- |
| 그대로 산다 | 순수 함수이거나 타입 사상, 새 엔진에 시그니처와 뜻이 그대로, 타이머 없음, LANDING-004–LANDING-046, LANDING-145, LANDING-048, LANDING-049, LANDING-149의 어느 행에도 안 걸림. 단위가 옮겨 가면 시험도 함께 옮긴다 | `helpers/jsonPointer/utils/__tests__/*`, 식 정규식 시험(옮김), 잎 교차 시험(먼저 승 관련과 `intersectEnum`·`intersectConst`·`validateRange`의 throw 단언 제외. 이 셋의 throw 단언은 '버리고 새로 쓴다'로(공집합 표시를 단언한다). `intersectConst.test.ts:40-58`의 참조 비교 단언과 `intersectPattern.test.ts:6-14`의 전방 탐색 단언도 '그대로 산다'에서 빠진다), `ArrayNode/utils/__tests__`, `InferSchemaNode.type.test.ts` | 약 30 |
| 표면만 고친다 | 모든 단언의 기대값이 08 규칙에서 그대로 나오고 이름만 바뀐다(`computed` → `controls`, `normalizedValue` → `outputValue`, `FormGroup` → `FormTypeGroupRenderer`, `JSONSchemaError` → `ValidationIssue`). 단언마다 LANDING-004–LANDING-046, LANDING-145, LANDING-048, LANDING-049, LANDING-149와 대조한다 | 조합·옛 키 없는 렌더 시나리오 17파일(`array.mutation-identity`, `controlled-interaction`, `default-value`, `formType-resolution`, `state-management`, `validation.errors` 등). 반례: `terminal-mode`의 "터미널 아래 `find`가 터미널을 돌려준다"는 LANDING-020에 걸려 재작성. 이 17파일도 스키마와 단계는 데이터 모듈로 옮기고, 단언은 이름만 바꿔 e2e의 추가 단언으로 둔다(16라운드 답 7로 확정) | 약 25 |
| 버리고 새로 쓴다 | 기대값이 LANDING-004–LANDING-046, LANDING-145, LANDING-048, LANDING-049, LANDING-149 이주 행(분기 자동 감지, `oneOfIndex`, `schemaPath`, 복원, 주입 순환 차단, 루트 전역, 먼저 승, 마이크로태스크 타이밍)이나 삭제될 내부를 단언한다. 노드마다 타입에 맞는 parse를 두고 뜻이 그대로인 변환만 남긴다. **상황 목록은 자산으로 옮긴다**(TEST-008의 데이터 모듈로) | `core/__tests__` 87파일 가운데 옛 표면 52·타이머 의존 78, `oneOfSchemaPath`, `AbstractNode.injectTo`, `core/parsers/__tests__`, 렌더 시나리오 `composition.*`·`computed.*` | 약 150 |
| 미분류 | 위 세 부류의 기준으로 아직 가르지 않은 것. PR-0의 처분 목록에서 파일마다 가른다 | — | 약 29 |
| 새로 있어야 한다 | 설계의 새 장치마다 시험이 없다 | TEST-014, TEST-069, TEST-016–TEST-020 | — |

소유자(18라운드 S1): "S1. node 는 각자의 타입에 맞는 parse 함수를 가져야 합니다. 지금처럼요."(TEST-013)

실제 React 렌더(`act`, `userEvent`, StrictMode, 재마운트 계측)이고 447건이 통과하므로 e2e 층의 뼈대로 쓴다(TEST-021).
고칠 것 다섯: `setupValidatorPlugin`에 동기 `compileGuard`와 루트 등록, `caughtErrors`가 창 이벤트만 잡으므로 주인 없는 오류 싱크와 `onError` 관찰용 도우미(REACT-007, ERROR-088, ERROR-089), `reset`의 뜻(WRITE-042, 16라운드 스웜 수렴(편집자 결정): 호출 안의 동기 로드와 커밋 재대조), `flushOnMount: false`(26회)의 "초기 스냅숏" 뜻이 동기 정착에서 사라지는 것, 돌려주는 핸들을 `container`에 등록해 화면 어댑터가 찾게 하는 것(TEST-011)(TEST-021).

(TEST-021)

| 두 단계 테스트 하네스 | `__tests__/renderForm.tsx:63-66`(13개 파일) | 생성이 곧 첫 정착이다 | 단일 단계 단언(제약 T-5(두 단계 단언 — 동기 단계와 정착 단계), F23) |

### 07-landing-and-tests.md §2.10 성능 측정 원칙과 기준선

어떤 동작의 비용은 폼의 크기가 아니라 그 동작이 바꾼 것의 크기에 비례한다(TEST-029). 성능은 주장하지 않고 측정한다(TEST-029). 기존 구현이 기준선이고, 예산과 시나리오는 설계의 일부다(TEST-029). 소유자(16라운드 답 10): "에. 최소생성, 메모리안정, 캐싱을 통한 속도 및 재생성 방지가 고속성 원칙에 포함됩니다."(TEST-029). 소유자(16라운드 덧붙인 말): "최초부터 이 form의 목적은 모바일에서도 실행가능한 수준의 안정성과 경제성이라서요"(TEST-029).

ADR 0006(값의 소유), 0007(작업 루프), 0011(노드를 필요할 때 만들기)의 구체 형태는 성능 위험을 안고 있다(TEST-033). 본 구현에 앞서 **버릴 것을 전제로 한 스파이크**로 위험 지점만 잰다: 넓은 객체·긴 배열에서의 불변 갱신 비용, 쓰기당 가드 호출 비용, 작업 루프 한 회의 비용(TEST-033). 스파이크의 결과가 그 ADR들의 미결을 닫는 근거가 된다(TEST-033).

- **하니스는 `@aileron/benchmark-form`이다.**(TEST-026) 이미 npm alias로 옛 판 다섯(`@canard/schema-form_0.9.0` … `_0.12.5`)과 워크스페이스 판을 나란히 설치해 비교하고 있고, `render-trace.tsx`가 경로별 렌더 커밋 수를 센다(TEST-026). 새 항목만 더한다(TEST-026).
- **기준점은 같은 폼이다.**(TEST-026) 스키마 문법이 호환되지 않으므로 `fixtures/equivalent/<이름>.ts`에 옛 문법과 새 문법의 쌍을 두고, 쌍마다 두 판의 `<Form>`이 같은 상호작용 열 뒤에 같은 `[data-path]` 집합을 그리는지(`renderForm`의 `renderedPaths()`와 같은 선택자 `[data-path]:not([data-deferred])`를 `@aileron/benchmark-form` 안에서 판마다 쓴다(TEST-026). `data-path`를 그리지 않는 0.9.0은 이 대조에서 뺀다)를 시험이 단언한다(다르면 벤치가 아니라 시험이 실패한다)(TEST-026). 상호작용 열도 쌍에 같이 둔다(TEST-026).
- **둘로 나눠 잰다.**(TEST-026) 코어(`node` 환경, 트리 생성·값 갱신·정착 시간)와 렌더(React 19, `<React.Profiler>`의 커밋 수와 `actualDuration`, `render-trace`의 번짐)(TEST-026).
- **조건.**(TEST-026) 워밍업 10회 이상, 표본 100회 이상, 평균 대신 중앙값과 99번째 백분위, `node --expose-gc`로 표본 사이 명시적 수집(TEST-026). 결과는 `results/`에 날짜와 커밋으로 남긴다(TEST-026).
- **패키지 벤치 일곱**(`bench/*.bench.ts`: `branch-strategy-init`, `compute-recalculate`, `event-cascade`, `find-node`, `nodeFromJSONSchema`, `object-pending-read`, `render-delay`)은 새 엔진의 대응물로 다시 쓴다(TEST-026). 이름은 새 fractal을 따른다(`blueprint`, `settle`, `dispatch`, `find`, `load`)(TEST-026). 옛 엔진에서 마지막 기준선을 `bench:baseline`으로 남긴다(TEST-026, TEST-031). 이름이 바뀌므로 옛 판 대 새 판의 비교는 `@aileron/benchmark-form`만 맡고, 패키지 벤치는 새 엔진 안의 회귀 감시로 쓴다(TEST-026). 지속 통합 작업 흐름 `.github/workflows/performance-benchmarks.yml`의 과다 렌더 단언과 회귀 검사는 PR-7에서 새 기준선으로 갱신한다(TEST-026).

**5차 주(2026-09-23).**(TEST-030) (1) begin/complete 두 패스와 선택 가드는 사라졌다(정착은 출발점 고정, 한 패스)(TEST-030, FRAGMENT-010, SETTLE-018, SETTLE-003). (2) 분기 선택기와 `selection` 칸은 없다(TEST-030, FRAGMENT-010). (3) 역색인은 기각되었다(TEST-030, VALIDATE-032). (4) `controls.discriminator`는 분기별 `controls.active` 식(`===` 비교)을 만든다 — "판별식 직접 비교를 넣지 않음"은 옛 결정이다(TEST-030, FRAGMENT-008). (5) "dirty 목록"은 재계산 목록이다(TEST-030, SETTLE-002). (6) `&if`는 `controls.active`에 흡수되었다(TEST-030, TEST-035, LANDING-006). (7) 코어에 글로벌 잠금이 없어 루트 키의 특수 조회가 사라진다(TEST-030, CONTROLS-045). 나감의 비움(선택, 기본 꺼짐)은 전이 단계의 자동 쓰기라 켠 폼에서만 비용이 든다(TEST-030, WRITE-037, SETTLE-005).

기존 시험의 처분은 기존 234파일 가운데 그대로 사는 약 30파일과 표면만 고치는 약 25파일의 단언을 남기고, 기존 구현의 성능은 기준선이 된다(TEST-031, TEST-013).

- 코어를 건드리기 전에 재설계 시작 시점(`master` `660dde66f`, v0.16.0)에서 패키지 내 벤치와 `benchmark-form`의 scale 벤치를 돌려 기준선을 잡는다(TEST-031).
- `bench/.results/`는 git 추적 대상이 아니므로 기준선은 **커밋을 고정해 재현할 수 있게** 둔다(TEST-031). `benchmark-form`은 이미 과거 배포 버전을 고정해 같이 재는 구조이므로, 재설계 직전 버전을 "legacy" 어댑터로 고정해 새 구현과 같은 실행에서 나란히 잰다(TEST-031). 기계와 시점이 달라도 비교가 성립한다(TEST-031).

새 불변식이 오라클이 된다(TEST-031). 예산의 수치는 기존 `guard:check`의 선이다(TEST-031, TEST-073). 기존 구현의 기준선(패키지 벤치 일곱, `benchmark-form`의 scale 벤치)과 비교한다(TEST-031). 기준선은 있다: 패키지 벤치 일곱(`bench/.results/baseline.json`)과 `benchmark-form`의 scale 벤치(`results/baseline.json`), 재실행 수치가 기록과 정합(2026-09-23)(TEST-031).

다음은 기록이다(TEST-034).

- **패키지 내 벤치** — `bench/*.bench.ts` 7개, `vitest bench`(node 환경, JSDOM 없음)(TEST-034). `bench:baseline`이 `bench/.results/baseline.json`을 쓰고 `bench:compare`가 그것과 비교한다(`package.json:47-50`)(TEST-034). `bench/.results/`는 git 추적 대상이 아니다(TEST-034).

| 파일 | 재는 것 |
| ---- | ------- |
| `nodeFromJSONSchema.bench.ts` | 스키마 → 노드 트리 생성 (flat / nested / oneOf / computed) |
| `branch-strategy-init.bench.ts` | oneOf 분기 초기화 비용 (2×3 … 10×10, 중첩 깊이 3/5) |
| `event-cascade.bench.ts` | `setValue` → 캐스케이드 (20필드 배치 쓰기, derived 체인, oneOf 토글) |
| `find-node.bench.ts` | `find()` 탐색 (깊이 3/7/12, 팬아웃 10/50) |
| `compute-recalculate.bench.ts` | `ComputedPropertiesManager.recalculate()` |
| `object-pending-read.bench.ts` | 자식 커밋이 대기 중일 때 부모 객체 읽기 비용 |
| `render-delay.bench.ts` | 버전 간 마운트 회귀 감시 (필드 5 / 25 / 150) |

- **라이브러리 간 비교** — `packages/aileron/benchmark-form`(TEST-034). `@canard/schema-form`(워크스페이스 + 고정 버전 0.9.0–0.12.5)을 `@rjsf/core`, `react-hook-form`, `formik`, `@tanstack/react-form`과 같은 하니스(마운트 / 키 입력 / 프로그램적 `setValue`)로 비교한다(TEST-034). 공정성을 위해 문자열 필드만 있는 평면 스키마를 쓴다(TEST-034). schema-form 전용 기능은 "scale" 벤치(flat 50/100/500, nested, array 100/500/1000, oneOf 5/10/20)와 `array-node-stress`(push / applyValue / remove)가 따로 잰다(TEST-034). 통계적 회귀 게이트(`guard:baseline` / `guard:check`)가 있다(TEST-034).
- **모바일 성능 보고서** — `docs/ko/MOBILE_PERFORMANCE_REPORT.md`(v0.10.6)(TEST-034). 문서화된 안전 임계: 필드 50개 미만, 배열 아이템 30개 미만, computed 의존 20개 미만, 중첩 깊이 8 미만, oneOf 분기당 필드 20개 미만(TEST-034).

(TEST-035, TEST-030)

| 장치 | 위치 | 새 구조에서 |
| ---- | ---- | ----------- |
| computed가 없는 노드가 공유하는 frozen sentinel | `getComputedPropertiesManager.ts:19-26` | 유지. `controls`의 식이 없는 노드는 표현식 비용이 0이어야 한다 |
| 단순 동등식 분기의 O(1) 인덱스 조회 | `.../getSimpleEquality.ts:16-64` | 사라진다(`&if` 분기 폐지). 가드 평가는 검증기가 한다. 측정 결과 AJV에서는 대체 장치가 필요 없다(50분기의 마지막 일치도 1.25 µs) |
| 지연 합성 값 캐시 `__composed__` | `ObjectNode/.../BranchStrategy.ts:107-110, 304-317` | 필요 없어진다. 방출 값의 메모를 쓰는 곳이 작업 루프 하나이고, 바뀐 자식이 없으면 이전 참조를 그대로 둔다 (VALUE-012, VALUE-013) |
| 이벤트 배치와 병합 | `EventCascadeManager.ts:79-125` | 통지 1회로 대체된다 (EVENT-001) |
| `revision(mask)` 원장 | `EventCascadeManager.ts:159-201` | 유지 |
| `Batch` / `Isolate` 플래그로 대량 쓰기의 커밋 횟수 줄이기 | `core/types/value.ts:26-66` | "표시 N번 → 계산·커밋 1번"으로 대체된다 (SETTLE-001) |
| 할당 없는 `schemaPath` 매칭 | `.../matchesSchemaPath.ts:29-37` | 유지. 에러 배정은 `dataPath`로 하고 `schemaPath`는 꺼진 union 분기를 표시에서 거르는 필터에서만 쓴다 (VALIDATE-043) |
| 렌더 가상화 | `helpers/virtualization/` | 유지. 노드를 필요할 때 만드는 안(NODE-053)과 결합할 수 있다 |
| 자식 컴포넌트 맵의 메모이제이션 | `.../useChildNodeComponents.tsx:52-113` | 유지. 캐시가 언마운트까지 무한히 자라는 문제는 함께 고친다 |

다음은 기록이다(TEST-062). `benchmark-form/PLAN.md`에는 "oneOf 마운트 비용은 분기 수와 무관하다(활성 분기만 초기화)"는 기록이 있다(TEST-062). 구조 추적에서는 "모든 분기의 자식 노드를 생성자에서 전수 생성한다"를 확인했다(TEST-062). 생성은 전수이고 초기화만 지연이라면 둘은 양립한다(TEST-062). 확인하지 않았다(TEST-062).

### 07-landing-and-tests.md §2.11 측정 시나리오와 실험 기록

(TEST-032, TEST-030, SETTLE-045, TEST-069)

| 상황 | 이미 있는 것 | 새로 필요한 것 |
| ---- | ------------ | -------------- |
| 대규모 쓰기 | `array-node-stress`의 applyValue, scale 벤치 | 큰 트리의 루트에 값을 통째로 쓰기 (flat 500, array 1000) |
| 배치 작업 | `event-cascade`의 K-배치 쓰기 | 표시 N번 → 계산·커밋 1번의 비용 |
| 빠른 연속 입력 | 하니스의 키 입력 단계 | **넓은 객체(키 1,000개)와 긴 배열(아이템 10,000개) 안에서의 키 입력** — 불변 갱신의 복사 비용 (VALUE-014의 위험) |
| 화면 전환 | `branch-strategy-init`, oneOf 토글, 마운트 | begin/complete 두 패스와 선택 가드는 사라졌다. 새 모델의 정착 측정은 SETTLE-045·TEST-069의 PR-2 정착 시나리오와 PR-2 벤치를 가리킨다 |
| (새 구조 고유) | — | **가드 평가** — `if`/`then`이 많은 스키마에서 쓰기당 `compileGuard` 호출 수와 시간, 검증기 구현체별(AJV, 인터프리터형) 비교. **1차 측정 완료** — TEST-036 |
| (새 구조 고유) | — | 분석 단계(스키마 → 청사진)의 1회 비용, `$ref`가 많은 스키마 |
| 메모리 | `benchmark-form`의 heap snapshot 도구(내용 미확인) | 노드당 메모리, 노드를 필요할 때 만드는 안(NODE-053)의 효과 |
| (14라운드) | — | 조건부 폼(`if` 20, 필드 200)의 마운트·키 입력·토글 |
| (14라운드) | — | `oneOf` 픽스처를 `controls.discriminator`판과 게이트 없는 판으로 나누어 잰다 |
| (14라운드) | — | 배치 없는 연속 `setValue` M회의 검증 횟수와 시간 |

측정 수치는 유효하나 시나리오 이름은 옛 모델의 것이다(TEST-032, TEST-030).

- 벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다(TEST-032).
- PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다(TEST-032).

- PR: PR-2 벤치(TEST-032).
- 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다(TEST-032).

다음은 기록이다(TEST-036). 수치와 방법은 `reviews/round-1.md` §2에 있다(TEST-036). 결론만 옮긴다(TEST-036).

1. **AJV에서는 가드를 몇 번 부르느냐가 문제가 아니다.**(TEST-036) 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다(TEST-036).
2. **걱정이 현실이 되는 곳은 둘이다**: 인터프리터형 검증기(`@cfworker/json-schema`는 같은 작업에 578 µs, 호스트 객체의 폭에 비례한다)와 컬렉션을 훑는 가드(아이템 10,000개의 `contains` 하나에 AJV 190 µs, 인터프리터 4.5 ms — 키 입력마다)(TEST-036).
3. **"호스트 참조가 그대로면 건너뛴다"는 루트에 걸린 가드에 효과가 없다.**(TEST-036) 읽는 키의 참조를 선형으로 비교하는 것도 AJV에서는 평가 비용과 같다(TEST-036). 효과가 있는 것은 변경 경로 → 가드의 역색인뿐이다(13 ns)(TEST-036).
4. **AJV의 실제 비용은 컴파일이다.**(TEST-036) 가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms(TEST-036). 늦추고, 중복을 없애고, 폼 인스턴스 사이에 공유해야 한다(TEST-036).
5. **불변 갱신의 복사 비용은 문제가 아니다.**(TEST-036) 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs(TEST-036). 현재 구현의 동기 쓰기 경로와 같은 수준이다(TEST-036).
6. 검증은 폼 전체 크기에 비례한다(아이템 10,000 × 6필드에 약 140 µs, 에러가 많으면 더)(TEST-036). 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않고 진입당 요청 1회와 마이크로태스크 합치기로 하며, 빈도 조절은 `OnRequest`다(TEST-036, VALIDATE-049).

모바일과 저사양 기기에서는 재지 않았다(TEST-036). 나노초 단위의 측정은 방법에 민감하다 — 같은 인자를 되풀이하면 JIT가 호출을 없애고, 여러 경우를 한 프로세스에서 재면 100배까지 어긋난다(PROCESS-030)(TEST-036).

다음은 기록이다(TEST-037). `reviews/round-2.md` §2에 표가 있고 전문은 `spikes/work-loop/REPORT.txt`다(TEST-037). 요점: 키 입력이 현재 구현보다 두 자릿수 배 싸지고(쓰기 뒤 첫 읽기의 재합성이 사라진다), 구현 선택이 승패를 가른다(메모 복사·패치 대 재구성 104배, dirty 목록 대 플래그 스캔 17배, 역색인 5배)(TEST-037). 재설계가 지는 유일한 지점은 조건부 폼의 생성(가드 컴파일 22 ms)이며 폼 인스턴스 사이의 컴파일 공유가 필요하다(TEST-037). V8의 자기 속성 1,020개 절벽은 현재 구현에도 같게 걸린다(TEST-037).

다음은 기록이다(TEST-059). 파일: `spikes/round9/oneof-if.mjs`, `oneof-if-output.txt`, `REPORT.txt`(TEST-059). 각 분기의 `if`는 `{ properties: { kind: { const } }, required: ['kind'] }`다(TEST-059).

| 배치 | 올바른 값 `{kind:'a', x:'s'}` | 누락 값 `{kind:'a'}` | 어느 조건에도 맞지 않는 값 `{kind:'c'}` | 조건 프로퍼티 없음 `{x:'s'}` |
| --- | --- | --- | --- | --- |
| `oneOf` 분기에 `if/then`만 | 거부 | 통과 | 거부 | 거부 |
| `oneOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `anyOf` 분기에 `if/then`만 | 통과 | 통과 | 통과 | 통과 |
| `anyOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `allOf` 항목에 `if/then`만 | 통과 | 거부 | 통과 | 통과 |
| 최상위 `if/then` 하나 | 통과 | 거부 | 통과 | 통과 |
| 오늘 방식(`const` 판별식) | 통과 | 거부 | 거부 | 거부 |

`if`에서 `required`를 빼면 `else: false`를 붙인 `oneOf`·`anyOf`가 `{x:'s'}`를 통과시키고, 빈 값에서 가드 단독 판정이 모두 참이 된다(검증 §2.3)(TEST-059). 그래서 FRAGMENT-022의 컨벤션이 "`else: false`와 `required` 함께"다(TEST-059).

다음은 기록이다(TEST-060). 8라운드 `loop-v4e.mjs`에서 59개 정확 치환(검증 뒤 수정 포함)으로 파생했고 재생성이 바이트 단위로 같다(TEST-060). 상태 칸은 원본과 `extras`뿐이며, 조각은 `if`(검증기 스텁) 또는 `&active`로 켜지고, 게이트 없는 조각은 무조건이다(TEST-060). 재실행은 `spikes/round9/`에서 `node regress/run.mjs`다(TEST-060).

프로토타입 보고서의 사실(`spikes/round9/REPORT-proto.txt`)(TEST-060). 교차 검증(`reviews/raw-round9-verification.md` §2)은 회귀·프로브의 합계 단언을 재실행해 재현했고, 채움 단위와 같은 대상 충돌은 탐침으로 하나씩 재현했다(TEST-060).

- 이식한 8라운드 회귀 63개 단언이 두 모드에서 모두 통과했다(TEST-060). v4e 자신의 기존 실패 셋 가운데 A4c와 A4-cap은 "같은 값을 다시 써도 에지를 발화하지 않는다"는 규칙으로, A4b는 "최종 형상에 없는 노드의 중간 채움은 남기지 않는다"는 규칙으로 기대가 바뀌어 통과한다(`regress/CHANGES.txt`)(TEST-060).
- Q8 프로브 108개 단언과 경계 26개가 통과했다(TEST-060).
- 로드에서는 `&default`가 `default`를 이겼고, 나중에 켜진 조각의 새 노드도 채워졌다(TEST-060).
- `&unsetValue`는 값을 지우고 입력을 남겼으며, 그 뒤 다시 채워지지 않았다(TEST-060). 자기 삭제로 조건이 거짓이 되어도 삭제를 철회하지 않는다(TEST-060).
- `else: false`가 없는 분기 둘에서 개발 모드 경고 둘이 났다(TEST-060). 게이트 없는 순수 `oneOf`·`anyOf`는 두 분기를 모두 켰다(TEST-060).
- 자식 집합 결합에서 AND/OR와 "가장 가까운 선언이 이김"은 정반대 결과를 냈다(TEST-060).
- `&derived`와 `&injectTo`의 같은 대상 충돌은 대상별로 하나만 적용해 2라운드에 수렴했다(TEST-060). 순위는 스위치다(TEST-060).
- `disableAutomaticWrites`는 채움·`&derived`·`&injectTo`·`&unsetValue`를 모두 막고 로드 값은 그대로 두었으며, 그 뒤 사용자 입력에서는 자동 쓰기가 다시 일어났다(TEST-060). 호출 단위 지정이 Form 속성을 덮었다(TEST-060).
- 비수렴 `&derived`·`&injectTo` 쌍은 라운드 상한 5·6·25 모두에서 예산 초과이고, 원본 B 커밋이면 `{a:0, b:0}`, 마지막 라운드 커밋이면 상한 직전의 값(상한 25에서 `{a:24, b:24}`, 상한 5에서 `{a:4, b:4}`)이다(TEST-060).

교차 검증이 첫 판에서 명세와 어긋나는 곳 셋을 찾았고 같은 codex 세션에서 고쳤다(TEST-060). 채움 단위(본체에만 노드 단위였고 공유 노드와 게이트 없는 `allOf` 항목은 조각 단위로 다시 채움), 노드 게이트(로드 때 꺼진 노드를 채우고 켜질 때 채우지 않음), 게이트 없는 분기의 공유 노드에 첫 선언 스키마를 힌트로 남김(TEST-060). 고치는 과정에서 넷째 빈틈이 재현으로 드러났다(`{seed:1, on:1}`, `REPORT-proto.txt` 325행)(TEST-060). 중간 라운드에 채운 값이 뒤 라운드에서 형상에서 빠진 노드의 원본에 남는 문제로, "생김"을 정착이 수렴한 뒤의 최종 형상으로 판정하고 최종 형상에 없는 노드의 채움 후보는 철회하도록 고쳤다("중간 라운드의 주입은 커밋 전에 버린다"(SETTLE-005)의 실행 확인)(TEST-060). 고친 뒤의 결과는 `spikes/round9/REPORT-proto.txt`의 "5. 검증 뒤 수정" 절과 `spikes/round9/r9b-output.txt`(단언 52개, 탐침 13개, 실패 0)에 있다(TEST-060).

고친 뒤 달라진 회귀 기대는 "이미 있던 노드는 다시 채우지 않는다", "최종 형상에 없는 노드의 중간 채움은 남기지 않는다", "게이트가 거짓인 노드는 생기지 않는다(FRAGMENT-014)"에서 온다(TEST-060). 8라운드 회귀 이식의 바뀐 요약은 17행이다(TEST-060). 7라운드 사례 X16(자기 주입으로 자기 조각을 끄는 스키마)은 에지 모드의 두 구성에서, 이전에 중간 원본 보존으로 `stable`이던 것이 예산 초과가 된다(TEST-060). 레벨 모드는 `t='from-undefined'`로 2라운드에 수렴한다(TEST-060). 에지 모드의 결과는 SETTLE-026(자기 가드를 끄는 자동 쓰기는 예산 초과)과 같은 판정이다(TEST-060).

(TEST-061, GOAL-015)

| 항목 | 질문 | 실험 | 결정 기준 |
| ---- | ---- | ---- | --------- |
| D-15 순환 스키마의 출발점 | `if`가 `x`를 요구하고 `then`이 `x`를 선언하는 부정 없는 순환에서 `{x: 'v'}`를 로드하면 조건부 조각이 꺼진 채 출발해 `x`가 방출에서 빠지고 상태는 `stable`이다. 로드한 유효 값이 조용히 사라진다. 원인은 신호의 부재가 아니라 출발점(SETTLE-029)이다 | 프로토타입 `loop-v4d` 사본에 출발점 스위치 셋을 더한다. `minimal`(지금), `S1`(선언 키가 원본에 있는 조건부 조각을 출발점에 더함), `S2`(최소 고정점 뒤 그런 꺼진 조각을 검증기 가드로 한 번 켜 봄). 사례 E8(자기 순환 `{x:'v'}`), E8b(상호 순환 `{a:1,b:2}`), E9(선언 순서에 따라 다른 고정점에 닿던 사례), E1, E12–E14, X15, X16, 독립 모델 N1·N2·N9. 회귀 전부. 비용은 케이스마다 새 프로세스 5회 | 채택: E8 → `{x:'v'}`, E8b → `{a:1,b:2}`, E9 불변 `{a:1}`, 회귀 0, 바퀴 상한 안, 비용 5회 폭 안. 실패 기준은 회귀, 사용자가 끈 조각이 잠복 원본만으로 되살아남, E9 변화다. 실패하면 최소 출발점 유지, 개발 모드 경고(목표 C2(작성자 실수의 가시성)), 프로덕션 신호는 SURFACE-007의 새 상태 값, WRITE-018과 SETTLE-026 수정. 편집자의 손 계산으로는 S1은 E9를 바꾸고 S2는 유지한다 |

D-15 순환 스키마의 출발점: 2항(조건에 쓰는 프로퍼티는 `properties`에 선언되어야 한다) 아래에서 `if`가 요구하는 `x`를 `then`이 선언하는 스키마는 컨벤션 위반이 되므로 우선순위를 낮춘다(TEST-061, GOAL-035). 실험 명세는 그대로 남긴다(TEST-061). 열린 부분은 "D-15: 컨벤션을 어긴 양의 순환 스키마에서 로드한 값이 알림 없이 빠지고 상태가 `stable`로 남는 것을 받아들이는가."였고, 소유자 답(12-10)은 "받아들입니다"다(TEST-061). 받아들인다(TEST-061). 컨벤션 문서에만 적고 경고 코드는 두지 않는다(TEST-061). A-2의 고지 의무는 이 경우에 적용하지 않는다(답 19가 이긴다)(TEST-061).

다음은 기록이다(TEST-064).

| 시나리오 | 3.1판 | 대조 | 출처 |
| -------- | ----- | ---- | ---- |
| 키 입력, 평면 1,000 | 1.39 µs | 3차안 1.35 µs | `reviews/round-4.md` §2.1 |
| 분기 전환(4라운드 측정 시나리오) | 108 µs | 3차안 89 µs | `reviews/round-4.md` §2.1 |
| 루트 통째 쓰기 10,000 × 5 | 12.0 ms | 현재 217 ms | `reviews/round-4.md` §2.1, `reviews/round-2.md` §2 |
| 조건부 폼 생성 (가드 200개) | 23.0 ms (트리 585 µs + AJV 컴파일 22.4 ms) | 현재 13.4 ms | `reviews/round-2.md` §2 |
| 진입 깊이 카운터 | 측정 스프레드 안 (3–4%) | — | `spikes/work-loop/REPORT-v4c.txt` |

노드별 장부가 루트 통째 쓰기를 3차안보다 58% 늦춘다(TEST-064). 조건부 폼 생성은 재설계가 지는 유일한 지점이다(TEST-064). 조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(TEST-064).

**인터프리터형 검증기를 어느 수준까지 지원하는가.**(TEST-065) 성능 예산을 AJV 기준으로 잡으면 인터프리터형은 "동작하지만 큰 폼에서는 느리다"가 된다(TEST-065). 역색인은 기각되었다(TEST-065, TEST-030). 소유자 답(12-3): "검증기의 성능은 우리가 관여할 문제가 아닙니다만. 뭘 말하는건지요?"(TEST-065).

- 【추론】 비용 — 청사진 판정: 로드마다 한 번이며, 비 union 칸에도 드는 로드 비용은 선언마다 `type` 파싱 O(원소 ≤ 7)과 마스크 교집합 O(1)이고, 분기 합치기는 O(분기 × 정적 연언 깊이)다; 메모리는 union 칸마다 얼린 배열 하나와 기본 spec 하나, 노드마다 0이다; 구현은 허용 집합 도우미 약 60줄(`extractSchemaInfo`와 `processSchemaType`의 형 부분 대체), 분기 합치기 약 50줄, 조각 공유 확장 약 40줄이다(TEST-078).
- 【추론】 비용 — 유효 목록: 좁히는 게이트가 없으면 0(같은 참조)이고, 게이트 선언을 가진 노드는 유효 스키마 메모가 바뀔 때 O(k)의 교집합 한 번, 경고등 재계산은 O(1)이다; 메모리는 좁혀진 메모 항목마다 작은 배열 하나와 spec 하나다; 구현은 약 40줄(병합표 `type` 행 포함)이다(TEST-078).
- 【추론】 비용 — 두 번 해석: 비용은 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다; 전이 단계 약 20줄이다(TEST-078, WRITE-098).
- 【추론】 비용 — 새 경고 넷(`TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `NON_JSON_WHOLE_VALUE`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `FORM_TYPE_TEST_INVALID`): 개발 모드나 핸들러가 있을 때만 돌며(다만 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다), 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례한다; 메모리는 중복 억제 키이고; 각 30–40줄이다(TEST-078, WRITE-099).
- 【추론】 비용 — 쓰기(`interpret`): 멤버이면 `classBits` 한 번과 AND 한 번으로 O(1)이고, 문자열 해석은 정규식 한 번과 `Number` 한 번이며, 후보를 세기만 하는 무할당 구현이 조건이다; 메모리 0; `parse/` 약 80–100줄, `unionBehavior/` 행 약 40줄이다(TEST-078).
- 【추론】 비용 — 경고등: 원본이나 유효 스키마가 바뀐 노드만 커밋 때 O(1)이고 경고는 켜질 때만 보낸다; 메모리는 얼린 빈 배열 공유; 게터 두 개다(TEST-078).
- 【추론】 비용 — 방출·채움: 추가 비교와 복사가 없고, 메모리와 구현이 0이다(TEST-078).
- 【추론】 비용 — Hint·props: `useMemo` 안에서 필드 하나를 더 읽고(비 union에도 듦), 시험은 정의 수에 선형(오늘과 같음)이다; 메모리 0; 형 셋과 `getHint` 한 줄이다(TEST-078).
- 【추론】 비용 — 기본 union 입력: 키 입력마다 O(k ≤ 6)이고, 유효 목록은 `jsonSchema` 참조가 바뀔 때만 O(k), `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기)다; 메모리는 `useState` 하나와 표시 중인 객체 값마다 출력 문자열 크기의 메모다; 감싸개 약 60–80줄이다(TEST-078).
- 【추론】 비용 — 검증기: 기본 경로 0, `bind` 때 옵션 셋 검사 O(1)이다; 메모리는 스키마 깊은 사본을 (인스턴스, 루트)마다 한 번이다; 플러그인마다 약 10줄, ajv8 설정 세 줄이다(TEST-078).
- 【추론】 비용 — 공개 형: 컴파일 시간은 재지 않았다(모름); `value.ts`·`jsonSchema.ts`·노드 형·props 형 약 90줄과 가드 하나다(TEST-078).
- 【추론】 비용 — 플러그인 이주: 객체 시험 일곱 곳(코어 포함), 함수 시험 여섯 곳, mui 수 입력(빈 칸·초안·정수), 플러그인마다 union 항목 하나(권장)다(TEST-078).

### 07-landing-and-tests.md §2.12 성능 예산과 병합 관문

**게이트(16라운드 답 6으로 확정).**(TEST-027) PR-7 병합 전과 릴리스 전에 돌린다(TEST-027). 옛 판보다 느린 항목이 있으면 이유를 적고 Vincent가 받아들여야 병합한다(TEST-027). 옛 판보다 느린 것(대표적으로 `if`-`then`으로 스키마를 제한 없이 넓히는 문법)은 두 조건을 지킨다(TEST-027). 통제 가능: 비용이 입력 크기(가드 수, 조각 수, 재계산 목록의 크기)에 예측 가능하게 자라고, 가드 컴파일은 작성된 위치당 한 번이며(LANDING-073), 한 정착은 예산 다섯 안에서 끝난다(EVENT-020)(편집자 도출)(TEST-027). 일정 수준: 상한을 두며, 그 상한은 `guard:check`의 선이다(TEST-027, TEST-072). 형태와 선은 TEST-072가 정했고(같은 실행의 옛 판 대비, `guard:check`의 선), Vincent는 선을 넘은 항목을 병합 때 받아들인다(TEST-027, TEST-072). 노드 구조의 벤치 B1–B6(NODE-018)도 이 기준선과 비교한다(TEST-027).

새 구현의 어떤 단계도 예산을 넘는 회귀를 안고 병합하지 않는 것이 기본이며, 이유를 적어 Vincent가 받아들인 회귀만 예외로 병합한다(TEST-027, TEST-072, TEST-073). 기존의 통계적 게이트(`guard:check`)를 쓴다(TEST-027). 18라운드 안건(실행 확인, PR-2): "노드 구조의 벤치(섞인 종류 1만 노드의 읽기 순회, 노드당 힙 바이트, 같은 맵인지, 거대형 자리 수, 입력에서 커밋까지, 생성 시간. V8과 JavaScriptCore)"(TEST-027).

벤치마크를 설계에 넣는 것은 소유자의 요구다 — "기존 설계 방향에서 잡았던 고속 동작이 깨져서 느려질까 봐 걱정이다. 벤치마크를 통해서 성능을 끌어올렸으면 한다. 설계 단계니까 이것도 설계에 넣었으면 한다."(TEST-028). 예산의 수치는 기존 `guard:check`의 선이다(TEST-028, TEST-073).

- PR: PR-3 벤치(회귀 항목)(TEST-071).
- 무엇: 객체 원천 `injectTo`(1만 원소의 터미널 객체·배열)에서 한 원소 쓰기의 비교 비용이 값 크기와 무관한지, 통째 교체가 선형인지 잰다(TEST-071).
- 실패: 값 비교를 되돌리지 않고 지름길 구현을 고친다(TEST-071).

【추론】 안건 §5의 성능 물음은 한 규칙에서 닫는다: 옛 판보다 느린 항목은 이유를 적고 Vincent가 병합 때 받아들인다(TEST-027)(TEST-072). 【추론】 이 규칙이 느림을 항목마다 통제하므로 새 수치를 지어내지 않는다(TEST-072). 【추론】 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다(TEST-026의 하니스, 같은 폼의 쌍)(TEST-072). 【추론】 절대 수치는 두지 않는다(TEST-072). 【추론】 선은 기존 `guard:check`의 규칙이다(TEST-072). 【추론】 옛 판의 표본을 기준으로 넣고, 새 판의 처리량(초당 횟수) 평균이 15% 넘게 떨어지고 Welch p<0.05면 선을 넘는다(`packages/aileron/benchmark-form/src/utils/stat-regression.ts:81-112`, 기본값 `threshold` 15, `alpha` 0.05)(TEST-072). 【추론】 선을 넘은 항목은 TEST-027을 따른다(TEST-072). 【추론】 이유를 적고 Vincent가 받아들여야 병합한다(TEST-072). 【추론】 이것이 '통제 가능하고 일정 수준 안'을 지키는 절차다(TEST-072). 【추론】 1.5배·2배 같은 배율 상한은 따로 두지 않는다(TEST-072). 예: 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms, 1.7배(처리량 −42%)라 선을 넘는다(TEST-072). 이 항목은 TEST-076대로 PR-4의 수용 필요 항목으로 미리 적혀 있다(TEST-072).

【추론】 예산의 수치는 기존 `guard:check`를 그대로 쓴다(TEST-073). 【추론】 처리량 평균이 15% 넘게 떨어지고 Welch p<0.05면 회귀다(`stat-regression.ts:81-112`)(TEST-073). 【추론】 표본은 TEST-026대로 100회 이상이다(TEST-073). 【추론】 키 입력, 마운트, 대규모 쓰기(루트 통째 쓰기), 배치에 똑같이 적용한다(TEST-073). 【추론】 회귀는 TEST-027 절차를 따른다(이유를 적고 Vincent가 받아들여야 병합)(TEST-073). 【추론】 스파이크의 기대 이득은 기대값으로 적으며, 게이트가 아니다(TEST-073). 【추론】 SETTLE-045의 벤치 게이트와 NODE-055의 B1·B5·B6 합격선이 이 선을 쓴다(TEST-073).

기대값: 루트 통째 쓰기(10k×5) 5.72 ms 대 215.7 ms, 배치 1000 368 µs 대 1.71 ms(`spikes/work-loop/REPORT.txt:245-249`), 트리 생성 flat 1,000 452.75 µs 대 4.63 ms, 트리 생성 array 10,000×5 13.15 ms 대 216.73 ms(`:113-114`)(TEST-073). 예: 기준선 `Scale Interact Flat flat-50`은 14.1 ms(처리량 70.8회/초)다(TEST-073). 15.0 ms(+6.4%, 처리량 −5.9%)가 되면 선 안이라 통과한다(TEST-073). 17.0 ms(처리량 −16.9%)가 되고 Welch p<0.05면 회귀다(TEST-073). 선은 처리량 기준 15%이므로, 시간으로는 약 16.6 ms(+17.6%)가 경계다(TEST-073).

【추론】 안전 임계를 목표 배율로 올려 적지 않는다(TEST-074). 【추론】 문서는 잰 사실만 적는다(TEST-074). 【추론】 PR-7 뒤 `MOBILE_PERFORMANCE_REPORT.md`(v0.10.6)와 같은 모바일 조건으로 다시 재고, 잰 임계를 문서에 적는다(TEST-074). 【추론】 병합 게이트가 아니다(TEST-074). 오늘 문서의 임계는 필드 50개 미만, 배열 아이템 30개 미만이다(TEST-034)(TEST-074). 참고 수치(문서의 임계는 아니다): 데스크톱 기준선 `baseline.json`(5회)에서 flat-500 마운트 약 112 ms, array-100 마운트 약 103 ms로 배열이 가장 약하고, 스파이크의 core 구성은 array 10k×5에서 13 ms 대 217 ms다(`spikes/work-loop/REPORT.txt:114`)(TEST-074).

【추론】 측정 방법을 고정한다(TEST-075). 【추론】 ESM 진입(`dist/index.mjs`)을 esbuild로 minify하고 gzip -9 하며, 의존성은 외부로 둔다(TEST-075). 【추론】 기준은 v0.16.0(2026-09-21 빌드)의 37,023 B다(TEST-075). 【추론】 배포되는 minify 없는 gzip(51,632 B)도 함께 보고한다(TEST-075). 【추론】 기준보다 늘면 TEST-027과 같은 기록·수용 규칙을 따른다(TEST-075). 【추론】 이유를 적고 Vincent가 받아들여야 병합한다(TEST-075). 【추론】 비율 상한은 따로 두지 않는다(TEST-075). 【추론】 "현재 gzip 약 44KB"(GOAL-011)는 측정 방법이 적히지 않은 기록이라 기준으로 쓰지 않는다(TEST-075).

【추론】 컴파일에는 따로 수치 예산을 두지 않는다(TEST-076). 【추론】 기준 플러그인(AJV)으로 재는 마운트 벤치는 가드 컴파일을 포함한다(TEST-076). 【추론】 그 컴파일은 따로 한 줄로 보고하고, 그 줄을 폼의 몫(청사진 분석·트리 생성·식 컴파일)과 검증기의 컴파일 몫(`compileGuard`)으로 나눈다(TEST-076). 【추론】 판정은 TEST-072의 선과 TEST-027을 따른다(TEST-076). 【추론】 선을 넘으면 이유를 적고 Vincent가 받아들여야 병합한다(TEST-076). 【추론】 알려진 느림은 미리 적는다(TEST-076). 【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`)(TEST-076). 【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다(TEST-076). 【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다(TEST-076). 【추론】 수치는 PR-4의 실측으로 바꾼다(TEST-076).

## 설계문서

- `design/00-goals-and-values.md` §1.8 (GOAL-023)
- `design/05-validation-and-errors.md` §1.8 (VALIDATE-027)
- `design/07-landing-and-tests.md` §2.3 (TEST-013)
- `design/07-landing-and-tests.md` §2.10 (TEST-029, TEST-033, TEST-026, TEST-030, TEST-031, TEST-034, TEST-035, TEST-062)
- `design/07-landing-and-tests.md` §2.11 (TEST-032, TEST-036, TEST-037, TEST-065)
- `design/07-landing-and-tests.md` §2.12 (TEST-027, TEST-028)
