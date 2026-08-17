# winglet 유틸리티 품질 개선 계획 (common-utils / json / react-utils)

> **Resume hint**: 이 파일을 그대로 Claude 입력으로 던지면 진행 상태(체크박스)를 보고 미완료 Phase 부터 이어 작업한다.
>
> ```
> @packages/winglet/PLAN.md 의 진행 상태를 확인하고, 미완료 Phase 부터 이어서 작업해줘.
> ```

## 진행 상태 (2026-08-17)

Phase 0~6 를 순차 실행했다. **작업 이력·검증 결과·계획 대비 편차는 `PROGRESS.md` 가 정본이다** — 이 파일은 사양, 그쪽이 이력이다.

| Phase                | 상태                              |
| -------------------- | --------------------------------- |
| 0 벤치 인프라        | 완료                              |
| 1 도달 가능 HIGH     | 완료 (4/4)                        |
| 2 보안 HIGH          | 완료 (3/3)                        |
| 3 나머지 HIGH·비효율 | 완료 (7/7, 일부 항목 보류 — 아래) |
| 4 타입               | 완료                              |
| 5 문서·공개 표면     | 완료                              |
| 6 벤치 확충          | 완료                              |
| 7 성능 회수          | **진행 중 (1/5)**                 |

### 별도 작업으로 남긴 항목

의도적으로 남겼다. 각각 "반쪽 수정이 오히려 위험" 하거나 **선행 결정이 필요한** 것들이다.

| 항목                                       | 남긴 이유                                                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #12 throttle 최소 간격                     | 감사의 제안(실행 시점 `previous` 갱신 + `>=`)만으로는 간격이 보장되지 않는다. 쿨다운 중 호출을 창 끝으로 미루는 스케줄링 모델 재설계가 필요하고, 타이밍 민감 유틸에 기존 동작 테스트 9건이 걸려 있다 |
| json H-3 difference 숫자키 누락            | `getArrayBasePath` 가 경로 문자열만 보고 배열을 단정한다. target 실조회로 바꾸려면 최상위 `''` base path 처리까지 얽혀 difference 의 경로 해석을 다시 설계해야 한다                                  |
| json H-8 JSONPath 방언 불일치              | `getJSONPath`(`$` 접두사·인용) 와 `convertJsonPathToPointer`(둘 다 없음) 중 **어느 표기법을 정본으로 삼을지가 먼저다** — 공개 API 두 개의 계약 결정                                                  |
| json M-1 RFC 6902 배열 move/copy           | 삽입이 아니라 덮어쓰기이고 move 원본 제거가 splice 가 아닌 delete. RFC 정합은 breaking 이며 `isCircularMoveReference`(L-10) 과 함께 봐야 한다                                                        |
| json M-6 difference 가 constructor 키 유실 | `setValue` 의 `isForbiddenKey` 가 데이터 조립 경로에서 무음 유실로 작동한다. 보호 정책 통일(L-7)과 묶여야 한다                                                                                       |
| json M-8·M-10·M-12·M-13                    | 방언·이름 계약 결정 선행(H-8 과 같은 묶음)                                                                                                                                                           |
| react M4 ErrorBoundary 복구 경로           | `resetKeys`/`onError` 는 가산적 API 설계라 별도 판단이 낫다                                                                                                                                          |
| react M8 withUploader prop 개명            | `onChange` → `onFileChange` 는 breaking prop 변경이라 소비처 조율이 필요하다                                                                                                                         |

### 감사 항목 중 "버그 아님" 으로 재분류

| 항목                                             | 근거                                                                                                                                                            |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| clone M2 maxDepth                                | 기존 테스트가 `maxDepth=N` → N 레벨 복제를 8개 단언으로 고정하고 코드가 그대로 구현한다. JSDoc 예제만 한 칸 어긋나 있었다 — **문서를 정정**                     |
| react L13 renderComponent falsy                  | 기존 테스트가 `renderComponent('not a component') === null` 을 고정한다. 이 함수는 노드가 아니라 컴포넌트/엘리먼트만 렌더하므로 `0`·`''` 드롭은 일관된 동작이다 |
| common-utils H3 serializeWithFullSortedKeys 순환 | JSDoc 이 "Will cause infinite loops (not handled)" 로 **이미 한계를 선언**하고 있었다. 계약 위반이 아니라 DoS 표면 제거를 위한 개선으로 처리                    |

---

## 목표

`@winglet/common-utils`, `@winglet/json`, `@winglet/react-utils` 세 유틸리티 패키지를
(1) 벤치마크로 성능을 회귀 추적 가능한 상태로 만들고,
(2) 감사에서 발견된 내재 버그·오동작·부작용을 fail-first 로 수정하며,
(3) 타입 추론/내부 타입 정의를 개선하되,
(4) 계약이 바뀌는 유틸은 별도 리스트로 관리하고 모노레포 사용처 회귀를 먼저 검토한 뒤에만 손댄다.

### 감사 근거 (2026-08-16, 4개 병렬 감사 에이전트 전수 검토)

| 범위                                                                   | 파일    | 방식                              | 상세                         |
| ---------------------------------------------------------------------- | ------- | --------------------------------- | ---------------------------- |
| common-utils 핵심(object/array/convert/libs/errors/constant)           | 67/67   | `dist` 실행 재현 + `tsc --strict` | HIGH 10, MEDIUM 20, LOW 다수 |
| common-utils 광역(filter/math/function/promise/scheduler/hash/console) | 101/101 | esbuild 번들 실행 + TS 5.9.2 실측 | HIGH 11, MEDIUM 15, LOW 26   |
| json 전체                                                              | 55/55   | esbuild 번들 실행 재현            | HIGH 8, MEDIUM 14, LOW 10    |
| react-utils 전체                                                       | 51/51   | vitest/jsdom probe(React 19)      | HIGH 3, MEDIUM 5, LOW 13     |

원본 상세 보고서는 세션 스크래치패드에 보존:
`report-cu-core.md`, `report-cu-wide.md`, `report-json.md`, `report-react.md`, `usage-matrix.md`.
본 계획의 모든 `파일:줄` 은 그 보고서의 재현 시나리오와 1:1 대응한다.

**구조적 배경 — 왜 테스트가 이 버그들을 못 잡았나**: common-utils 광역 62개 테스트 파일 480개가 전부 통과하지만 아래 확정 버그 중 하나도 잡지 못했다. 원인은 다수 테스트가 "구현이 내놓은 값 자체"를 기대값으로 삼는 자기참조 구조라는 점이다(예: `murmur3.test.ts` 에 레퍼런스 벡터 0개). 따라서 각 수정의 fail-first 테스트는 **독립적으로 도출한 기대값**(RFC, 레퍼런스 구현, 수학적 정의)을 기준으로 삼는다.

---

## 전역 제약 (모든 Phase·Task 가 상속)

- **패키지 매니저**: yarn 전용(npm 금지). 실행: `yarn workspace @winglet/<pkg> <cmd>` 또는 루트 숏컷 `yarn commonUtils|json|reactUtils <cmd>`.
- **검증 명령**(각 패키지): `test`=`yarn run -T vitest`, `typecheck`=`tsc --noEmit -p tsconfig.json`, `lint`=`eslint "src/**/*.{ts,tsx}"`, `build`=`rolldown -c && yarn build:types`.
- **성능은 1급 지표**(memory: performance-is-a-first-class-metric): 조기 종료 게이트·캐시·수동 루프를 "단순화"로 제거 금지. 성능을 깎는 변경은 벤치 전후 측정으로 정당화되지 않으면 기각.
- **버그 수정 = fail-first**(seiri_test-validity §1): 수정 전 코드에서 테스트가 그 버그의 증상으로 실패함을 관찰한 뒤 수정. 리팩터는 기존 테스트 무수정 통과 + 사전 characterization.
- **타입 수정은 선언부에서**(Workspace CLAUDE.md): 호출부 `as never`/`as any` 억제 금지. 기존 `as` 억제는 제거 대상.
- **주석 정책**(memory: comment-policy-inline-ban + seiri_code-comments): JSDoc 위주, inline `//` 은 코드가 말할 수 없는 것만 최소한. 주석은 현재 스펙만 진술(history 금지). Claude 컴포넌트 파일은 영어.
- **계약 변경(breaking)**: 아래 §계약 변경 마스터 리스트에 없는 항목을 breaking 으로 만들지 말 것. 리스트의 항목도 회귀 매트릭스 검토 완료 전에는 착수 금지.
- **테스트 케이스 상한**(filid_verification-records §2): spec-document 15 / test-record 32 per file. 초과 시 동작·인시던트 기준으로 분할.
- **문서 선행**(filid_code-placement §5): 공개 계약(시그니처/동작)이 바뀌는 수정은 해당 유틸 JSDoc 을 코드보다 먼저 갱신.
- **커밋**: co-author 금지. Phase 단위로 커밋하되 사용자 지시 시에만.

---

## 계약 변경 마스터 리스트 + 회귀 매트릭스

> 사용자 요구: "작업 전후 계약이 바뀌는 경우 별도 리스트업 + 패키지 내 사용처 파악 + 회귀 검토". 아래는 grep 실측 기반 사용처와 회귀 판정이다. **모노레포 소비처가 없거나 문서만 바꾸는 항목은 회귀 위험 낮음으로 분류하되, 있는 항목은 해당 Task 에서 소비처 테스트를 반드시 포함한다.**

### A급 — 실제 소비처가 있어 회귀 검토 필수

| ID         | 유틸                                        | 계약 변화                                                          | 소비처(grep 실측)                                                                                                                                               | 회귀 판정 & 조치                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **H10**    | `hasOwnProperty` (common-utils)             | 반환 가드 `key is never` → `key is keyof T`                        | schema-form 4곳, json-schema 1곳, json 6곳, common-utils 내부 6곳 (총 12+ 파일)                                                                                 | **타입 표면화 위험(최고)**. `never` 라서 통과하던 가드 블록 내 잘못된 key 사용이 타입 에러로 드러날 수 있음. **조치**: 수정 후 소비 3개 패키지(common-utils/json/json-schema/schema-form) 전부 `typecheck` 통과 확인. 실패 시 각 호출부를 선언부 관점에서 정정(호출부 `as` 금지).                            |
| **H5**     | `equals`/`stableEquals` omit (common-utils) | omit 키를 개수 검사 전에 제외 → 비대칭 키셋에서 반환값 변화        | `equals(_,_,omit)` 실사용 2곳: schema-form `ValidationErrorManager.ts:104`(RECURSIVE_ERROR_OMITTED_KEYS), react-utils `useSnapshotReference.ts:69`(omitKeysRef) | **동작 회귀 가능**. 두 소비처는 omit 키를 뺀 동등성으로 "변화 없음" 을 판정 → 캐시/재렌더 스킵. 수정 후 두 값이 지금과 달라지는 입력을 characterization 테스트로 고정하고, 소비처 관점 회귀 테스트(ValidationErrorManager 오류 갱신, useSnapshotReference 스냅샷 유지) 추가.                                 |
| **H6**     | `equals` 내장 객체 (common-utils)           | Date/RegExp/Map/Set 를 `true`(현재) → 값/참조 비교(`false` 가능)   | equals 소비: schema-form ObjectNode/ArrayNode/ValidationErrorManager/intersectEnum, json difference·applyPatch 핸들러, react-utils useSnapshotReference         | **저위험이나 확인 필수**. 소비처가 equals 에 Date/RegExp 를 넘기는지 확인 → 대부분 plain value/error 객체라 저위험 추정. 수정 후 소비 패키지 전체 `test` 통과로 검증. 넘기는 경로 발견 시 그 케이스를 회귀 테스트로.                                                                                         |
| **#1/#13** | `gcd`/`lcm` (common-utils)                  | NaN/Infinity 입력에서 무한 루프 → `NaN` 반환, 지수표기 소수 정확화 | schema-form `intersectMultipleOf.ts:22` 가 유한성 가드 없이 `lcm(baseMultiple, sourceMultiple)` 호출                                                            | **compatible(계약 이행) + 도달 가능 HIGH**. 현재는 `multipleOf`=Infinity/NaN 스키마가 브라우저 탭을 멈춤. 수정은 무한 루프를 유한 반환으로 바꾸는 것이라 정상 입력 계약 불변. **조치**: `intersectMultipleOf` 에도 호출측 유한성 가드 추가(신뢰 경계이므로 방어적 검증 정당) + schema-form `test` 통과 확인. |
| **#3/#4**  | `MessageChannelScheduler` (common-utils)    | 정지 버그 수정으로 취소/재스케줄 후 정상 동작 복원                 | schema-form `promiseAfterMicrotask.ts:4`(브라우저서 이 스케줄러 경유), data-loader 간접                                                                         | **compatible + 도달 가능 HIGH**. promise 체인서 연속 `scheduleMacrotask` 시 second promise 미해결. 수정은 유실을 없애는 방향이라 정상 경로 계약 불변. **조치**: 브라우저 형태(setImmediate 제거) 회귀 테스트 + schema-form ArrayNode BranchStrategy 통합 테스트 통과.                                        |

### B급 — breaking 이나 프로덕션 소비처 없음(benchmark/테스트만) → 위험 낮음, 수정 자유

| ID                   | 유틸                                                                                       | 계약 변화                                                 | 소비처                                                                                                                                            | 판정                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| #2/#5/#6             | `Murmur3` (common-utils/hash)                                                              | DataView 오프셋·finalization·꼬리 부호 수정 → 해시값 변화 | 저장소 내 프로덕션 0건(promise-modal 은 polynomialHash 사용)                                                                                      | 해시값 breaking 이나 내부 소비 없음. **선결정 필요**: 레퍼런스 호환(Math.imul 교정) vs 고유 알고리즘 개명 — §Phase 3 에서 결정. |
| #7                   | `polynomialHash(_, length<7)` (common-utils/hash)                                          | `slice(0,n)`→`slice(-n)` 로 저비트 보존                   | promise-modal `ModalManager.ts:24` 는 기본값(7)만 사용 → 무영향                                                                                   | length<7 인자 소비처 없음. 수정 자유.                                                                                           |
| M-1                  | `applyPatch` 배열 move/copy (json)                                                         | 덮어쓰기→splice 삽입, delete→splice(구멍 제거)            | 프로덕션 소비처 0(benchmark만)                                                                                                                    | RFC 6902 정합 방향. 위험 낮음.                                                                                                  |
| M-3                  | `getValue` protectPrototype (json)                                                         | `__proto__`/`constructor` 읽기 차단 옵션                  | getValue 광역 소비하나 `__proto__` 읽기 의존 경로 없음                                                                                            | 위험 낮음. minor 릴리스.                                                                                                        |
| M-7                  | `getJSONPointer` 루트 반환 `'/'`→`''` (json)                                               | RFC 6901 정합                                             | 외부 소비처 0(grep 무결과)                                                                                                                        | 위험 낮음.                                                                                                                      |
| H8/M18/M20/H7        | `stableSerialize` 다수 (common-utils)                                                      | memo/구조/omit 정렬/원시 태깅                             | schema-form `registerPlugin.ts` 1곳                                                                                                               | 단일 소비처. 플러그인 식별 캐시 용도 확인 후 회귀 테스트 1개로 커버.                                                            |
| M8                   | `stableEquals` Map/Set (common-utils)                                                      | 내용 비교 추가                                            | 프로덕션 0(benchmark만)                                                                                                                           | 위험 낮음.                                                                                                                      |
| M7/M9/#8/#15/#18/L-6 | `at`/`cacheMapFactory`/`isFalsy`/`getTrackableHandler`/`scheduleMacrotask`/`getValue` 타입 | 타입 정밀화                                               | at/cacheMapFactory 프로덕션 0, isFalsy→schema-form(객체라 미도달), getTrackableHandler→Form.tsx(옵션 무), scheduleMacrotask→InjectionGuardManager | 대부분 현재 미도달. 수정 후 소비 패키지 typecheck 로 검증.                                                                      |

### C급 — 문서/JSDoc 만 수정(코드 계약 불변) → 회귀 없음

`merge` 배열 병합(H9, 문서가 틀림), `serializeWithFullSortedKeys` 정렬 주장(M19), `isEmpty` Map/Set(#19), `isArrayLike` 문자열(#20), `round` 정밀도(#22), `Murmur3` 레퍼런스 주장(택1 시), 각종 JSDoc 자기모순(#24/#25/M-11) 등. 코드 미변경 시 회귀 없음.

---

## Phase 0 — 벤치마크 인프라 (common-utils, json)

**Deliverable**: 두 패키지에 react-utils 와 동형인 벤치 하니스가 서고, `yarn <pkg> bench` 가 돈다. 벤치 _대상_ 구현은 Phase 3(비효율)에서 채우되, 인프라와 최소 1개 스모크 벤치는 여기서 완성.

react-utils 선례(그대로 미러링):
`bench/*.bench.ts` + `vitest.bench.config.ts`(환경만 교체) + package.json `bench`/`bench:baseline`/`bench:compare`/`bench:watch` + `bench/.results/` gitignore.

### Task 0.1 — common-utils 벤치 하니스

- [ ] `packages/winglet/common-utils/vitest.bench.config.ts` 신규
  - react-utils 것 복사, **환경 `node`**(DOM 불필요), alias `@/common-utils`→`./src`, `include: ['bench/**/*.bench.ts']`, `benchmark.outputJson: 'bench/.results/latest.json'`.
- [ ] `packages/winglet/common-utils/package.json` 에 스크립트 4종 추가(react-utils 와 동일 형태):
      `bench`, `bench:baseline`(`--outputJson bench/.results/baseline.json`), `bench:compare`(`--compare bench/.results/baseline.json`), `bench:watch`.
- [ ] `.gitignore` 에 `bench/.results/` (없으면 패키지 `.gitignore` 생성 또는 루트 확인).
- [ ] 스모크 벤치 `bench/clone.bench.ts` 1개(Phase 3 목록의 1순위) — `clone` vs `cloneLite` vs `structuredClone`, depth-4/width-4 입력. 실행되어 결과 JSON 이 생성되면 인프라 검증 완료.
- **검증**: `yarn commonUtils bench` 가 결과를 출력하고 `bench/.results/latest.json` 생성.

### Task 0.2 — json 벤치 하니스

- [ ] `packages/winglet/json/vitest.bench.config.ts` 신규(환경 `node`, alias `@/json`→`./src`).
- [ ] `packages/winglet/json/package.json` 스크립트 4종.
- [ ] `.gitignore` 에 `bench/.results/`.
- [ ] 스모크 벤치 `bench/compare.bench.ts` 1개(Phase 3 1순위) — `compare` 무변경/1%/50% 변경 밀도, 크기 100/1k 노드.
- **검증**: `yarn json bench` 가 결과 출력.

> react-utils 는 이미 bench 하니스 보유. 추가 벤치는 Phase 3 에서.

---

## Phase 1 — 도달 가능 HIGH (사용자 대면 hang/데이터 유실) · 최우선

각 Task: characterization/fail-first 테스트를 먼저 red 로 관찰 → 수정 → green + 소비처 회귀. 계약 판정은 §마스터 리스트 참조.

### Task 1.1 — gcd/lcm 무한 루프 + 지수표기 소수 (common-utils #1, #13) 〔A급 회귀〕

- 파일: `src/utils/math/gcd.ts:60-76`(진입), `:78-86`(uclidGcd), `:68-69`(소수 자릿수), `lcm.ts:64`.
- fix: 진입부 `if (!Number.isFinite(left) || !Number.isFinite(right)) return NaN;`; `uclidGcd` 루프 `while (right !== 0 && right === right)`; 소수 자릿수 산출을 `toExponential`/지수부 고려로 교체(지수표기서 0자리 오인 제거).
- fail-first: `gcd(NaN,5)`/`gcd(Infinity,5)`/`lcm(NaN,5)` 가 3초 내 유한 반환(수정 전엔 timeout), `gcd(1e-7,2e-7)===1e-7`(수정 전 0).
- 회귀: `intersectMultipleOf.ts` 에 호출측 유한성 가드 추가(`Number.isFinite` 아니면 해당 constraint 무시) + schema-form `intersectNumberSchema.test.ts` 에 비유한 multipleOf 케이스 추가 → schema-form `test` 통과.

### Task 1.2 — MessageChannelScheduler 정지 2종 (common-utils #3, #4) 〔A급 회귀〕

- 파일: `src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts:186-189,221-224,282`.
- fix: `__flushBatch__` 조기 반환 시에도 `__idle__=true`; 스냅샷 대신 핸들러가 "현재 대기 전체" 소비하도록(또는 미소비 배치 추적 플래그 분리). idle 복원 책임을 flush 진입 한 곳으로 일원화.
- fail-first: (a) `setImmediate`→`clearImmediate` 로 큐 비운 뒤 재-`schedule` 이 실행됨(수정 전 pendingCount 고착). (b) 브라우저 형태(globalThis.setImmediate 삭제)에서 flush 직후 마이크로태스크 `schedule` 이 resolve 됨(수정 전 NEVER RESOLVES). 두 테스트를 `test.skip` 이 아닌 실제 skip-reason 없이 red 확인.
- 회귀: schema-form `promiseAfterMicrotask` 연속 호출 통합 테스트, ArrayNode BranchStrategy 통과.

### Task 1.3 — getTrackableHandler pending 영구 고착 (common-utils #9) 〔B급, Form.tsx 잠재〕

- 파일: `src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:417-422`.
- fix: `finally { try { afterExecute?.(args, stateManager); } finally { pending = false; publish(); } }` — 정리를 훅 예외와 독립. (JSDoc:281 이 이미 약속한 동작 = 계약 이행.)
- fail-first: `afterExecute` 가 throw 하면 이후 `handler.pending===false` 이고 다음 호출이 실행됨(수정 전 pending 영구 true, preventConcurrent 로 봉인).
- 회귀: `update()` 미알림(#14)·차단 반환 타입(#15)은 Phase 2/4 에서 함께.

### Task 1.4 — Portal 리마운트 + anchor 교체 (react-utils H1+H2) 〔B급, 동시 수정 필수〕

- 파일: `src/components/Portal/Portal.tsx:103-108`, `src/components/Portal/context/PortalContextProvider.tsx:103-107,120-128`.
- **H1·H2 는 서로를 가리므로 반드시 함께 수정**(H1 만 고치면 리렌더 유발원이 사라져 H2 표면화).
- fix: Portal 인스턴스 id 를 `useLazyConstant(() => getRandomString(36))` 로 고정 + `register(id, element)` upsert; provider 의 anchor 를 `ref.current` 읽기 대신 `useState`+callback ref 로 승격(render 중 ref 읽기 금지 해소).
- fail-first: 포털 내부 컴포넌트 mount/unmount 카운터가 부모 3회 리렌더 후 `{mounts:1,unmounts:0}` 유지(수정 전 `{4,3}`); anchor `key="a"`→`"b"` 교체 후 콘텐츠가 새 anchor 에 존재(수정 전 DOM 에서 소실). — `withPortal.test.tsx` 는 현재 Portal/Anchor 를 전혀 렌더하지 않으므로 신규 test-record 필요.
- 계약: internal(공개 시그니처 불변).

---

## Phase 2 — 보안 HIGH (prototype pollution / DoS)

### Task 2.1 — merge prototype pollution (common-utils H1) 〔30 소비처, compatible〕

- 파일: `src/utils/object/merge.ts:319-332`(키 순회 + 대입).
- fix: 순회 키가 `__proto__`/`constructor`/`prototype` 이면 skip(또는 `Object.defineProperty` 대입). 30개 소비처 감안 라이브러리측 방어.
- fail-first: `merge({}, JSON.parse('{"__proto__":{"x":1}}'))` 후 `({}).x===undefined`(수정 전 오염). — JSON.parse 로 own `__proto__` 생성이 핵심(리터럴은 setter).
- 계약: compatible(정상 병합 결과 불변). 소비 패키지 `test` 통과로 확인.

### Task 2.2 — 순환 참조 무한 루프 3종 (common-utils H2/H3, json H-6) 〔compatible〕

- 파일: `src/utils/object/hasUndefined.ts:243-260`, `serializeWithFullSortedKeys.ts:286-296`; json `getJSONPointer.ts:42-66`, `getJSONPath.ts:60-94`.
- fix: 각 DFS 에 `WeakSet` 방문 추적(재방문 skip). json 은 최대 깊이/노드 상한 옵션도 검토.
- fail-first: `a.self=a` 순환에서 각 함수가 유한 시간 반환(수정 전 exit 124/OOM). `hasUndefined` 는 JSDoc:179-183 이 "handled safely" 라 주장하므로 그 예제를 순환+무-undefined 로 강화.
- 계약: compatible. hasUndefined 는 소비처 0(수정 위험 최소).

### Task 2.3 — json 프로토타입 오염 우회 + copy 참조 공유 (json H-2, H-7) 〔B급〕

- 파일: `applyPatch/applySinglePatch.ts:111`, `applyPatch/utils/handleObject.ts:112`·`handleArray.ts:170`, `manipulator/utils/getValueByPointer.ts:11-15`.
- fix: (H-2) `move`/`copy` 의 `from` 경로도 `isPrototypeModification` 검사 + `getValueByPointer` 에 금지키 가드(protectPrototype 연동) + get 값이 내장 프로토타입인지 확인. (H-7) `copy` 분기 `cloneLite(getValue(...))`(move 는 원본 제거라 불필요).
- fail-first: `applyPatch({}, [{op:'copy',from:'/__proto__',path:'/y'},{op:'add',path:'/y/PWN',value:1}])` 후 `({}).PWN===undefined`; `copy` 후 대상 변형이 원본에 전파 안 됨.
- 계약: compatible. copy 참조 수정 후 `isCircularMoveReference` 의 copy 과잉 제한(L-10) 제거 가능.

---

## Phase 3 — 나머지 HIGH 버그 + 비효율 (벤치 게이트)

> 비효율 항목은 Phase 0 벤치로 전후 측정. 성능 개선이 수치로 확인되지 않으면 보류.

### Task 3.1 — clone 계열 (common-utils H4, M2, M3, LOW)

- H4 Buffer 메모리 공유(`clone.ts:271`): `Buffer.from(value)`. fail-first: clone 후 원본 불변.
- M3 공유 참조 중복제거(`clone.ts:245-276`): 각 내장 분기 반환 전 `cache.set`. fail-first: `clone({a:d,b:d}).a===.b`.
- **M2 maxDepth off-by-one 〔결정: JSDoc 이 정본 — 코드 수정〕**(`clone.ts:224`): 가드를 `depth > limit` 로 바꿔 `maxDepth=N` 이 N 단계 깊이까지 복제하도록 정합. 근거: "2단계까지 복제" 가 직관에 부합하고, `clone(value, maxDepth)` 로 2번째 인자를 넘기는 실사용처가 저장소에 0건(grep 실측)이라 어느 방향이든 회귀가 없으므로 직관적 동작을 택한다. fail-first: `clone(deep, 2).level1.level2 !== deep.level1.level2`(수정 전 동일 참조).
- LOW: RegExp `groups` 복사, Map/Set 서브클래스 보존, DataView 부분 뷰 낭비 — 묶어서.

### Task 3.2 — equals/stableEquals (common-utils H5, H6, M8, M11, M14) 〔H5·H6 A급〕

- H5 omit 개수 검사(`equals.ts:300`, `stableEquals.ts:380`): omit 제외 후 개수 비교. **A급 회귀**(ValidationErrorManager, useSnapshotReference).
- H6 내장 객체 동등(`equals.ts:296-312`): 비배열/비plain 은 `left===right` 폴백(문서와 일치). **A급 회귀**.
- M8 stableEquals Map/Set/ArrayBuffer 분기 + 비대칭 타입 즉시 false.
- M11 `countObjectKey(right)`→`Object.keys(right).length`(핫패스 7.5배). 벤치 전후.
- M14 visited 부기 지연. 벤치 전후.
- fail-first 각각: 보고서 재현 시나리오. **주의**: 이 Task 는 계약 A급이라 characterization 테스트로 현재 동작 고정 → 수정 → 소비처 회귀 순.

### Task 3.3 — serialize 계열 (common-utils H7, H8, M1, M18, M19, M20) 〔H7/H8 B급 단일소비처〕

- H7 memo 무효화/omit 오염(`stableSerialize.ts:346-349`): omit 식별자를 캐시 키에 포함, 가변 입력이면 memo 호출 단위 한정.
- **H8 비-plain 값 처리 〔결정: 결정적 안정 키〕**(`:348`): 순환 plain object 의 마커는 구조적 값(조상 깊이/경로 인덱스)으로 바꾸고, Map/Set/class 인스턴스/함수에는 **WeakMap 기반 인스턴스 안정 id** 를 부여해 "같은 입력 → 항상 같은 출력" 을 보장한다. 구조 동일성(서로 다른 인스턴스의 동등 판정)까지는 지원하지 않으며 그 한계를 JSDoc 에 명시한다. 근거: 현재 `counterFactory` 단조 카운터가 최종 결과로 남아 호출마다 다른 문자열이 나오고, `registerPlugin.ts:203` 이 plugin 객체(함수 포함 가능)를 캐시 키로 직렬화하므로 캐시가 실질 무력화 상태다. fail-first: 같은 객체를 두 번 직렬화하면 동일 문자열(수정 전 `"7@"`/`"8@"` 로 상이).
- M1 빈 문자열 키 잘림(`serializeObject.ts:231-237`): `while ((key=keys.pop())!==undefined)`.
- M18/M20 원시 타입 태깅/omit 정렬. M19 정렬 주장 정합.
- 회귀: schema-form `registerPlugin` 캐시 용도 회귀 테스트 1개.

### Task 3.4 — array 유틸 (common-utils M4, M5, M6, M13, M16, LOW)

- M4 groupBy 상속키 TypeError(`groupBy.ts:129-134`): `Object.create(null)`.
- M5 transformKeys/Values `__proto__` 손실: `Object.create(null)`.
- M6 at 소수 인덱스 불일치(`at.ts:86-97`): 스칼라 분기 정규화.
- M13 sortWithReference aliasing(`:29`): `source.slice()`.
- M16 differenceLite NaN 의미론: 문서 명시 또는 findIndex.
- M12 sortWithReference 선할당 낭비: lazy 그룹. 벤치 전후.
- LOW: map hole 콜백, chunk(0/2.5) 입력 참조 반환.

### Task 3.5 — hash 계열 (common-utils #2, #5, #6, #7) 〔B급, **결정: 레퍼런스 교정**〕

**확정 방향**: Murmur3 를 `Math.imul` 로 교정해 **진짜 MurmurHash3(Austin Appleby 레퍼런스 호환)** 로 만든다. 클래스명·JSDoc·`@see smhasher` 가 이미 레퍼런스를 표방하므로 이는 계약 이행이다. 해시값이 바뀌지만 프로덕션 직접 소비 0건이고, 유일한 간접 소비(`stableSerialize` 의 omit 해시 → schema-form `registerPlugin.ts:203`)는 캐시 키 용도라 값이 아닌 일관성만 요구하므로 회귀 없음(grep 실측).

- #5 `__mixK1__` 곱셈 교정(`murmur3.ts:66-77`, `:541`, `:543`): 16비트 분할곱셈의 누락 항(`k1_lo * c_hi`)을 복원하거나 `Math.imul` 로 대체. 레퍼런스 벡터 일치가 판정 기준.
- #2 DataView 오프셋(`murmur3.ts:414`): `getUint32(i * BYTES_PER_CHUNK, true)`. `isAligned` 게이트(`:382-383`)는 `DataView.getUint32` 가 정렬을 요구하지 않으므로 제거 가능(분기 하나 절약).
- #6 꼬리 부호(`:521`): `if (k1 > 0)` → `if (this.__remainder__ > 0)` 상태 기반. 값 기반인 한 부호 문제는 재발한다.
- #7 polynomialHash `slice(-length)`(`:19`) + max 클램프. 벤치+충돌률 측정.
- **필수**: Appleby 레퍼런스 테스트 벡터를 test-record 로 추가(현재 자기참조 테스트가 버그를 은폐 중이며, 이 Task 의 유일한 정답 기준이다). fail-first: `Murmur3.hash('hello') === 613153351`(수정 전 384527210).

### Task 3.6 — promise/scheduler/function (common-utils #10, #11, #14, #16, #17, #23)

- #10 withTimeout 타이머 누수: 내부 AbortController + finally abort. fail-first: fast resolve 후 프로세스 즉시 종료(수정 전 timer 잔류로 지연).
- #11 clearImmediate 없는 환경 import 실패: 두 심볼 모두 가드.
- #14 stateManager.update 미알림: update 말미 publish.
- #16 waitAndReturn 동기 throw/unhandledRejection: `Promise.resolve().then(fn)` + `Promise.all`.
- #17 scheduleNextTick 환경 단계 불일치: 의미 고정(문서 명시). data-loader 회귀 확인.
- #23 debounce/throttle signal 리스너 누수: dispose() 또는 clear() 확장.
- #12 throttle 최소 간격(Phase 2 아님, 여기): 실행 지점서 previous 갱신.

### Task 3.7 — json patch RFC 정합 (json H-1, H-3, H-4, H-5, H-8, M-1~M-14) 〔M-1 등 B급〕

- H-1 compare→applyPatch 배열 축소 예외: remove 인덱스 내림차순 emit. **round-trip property test 필수**(현재 applyPatch 참조 테스트 0건).
- H-3 difference 숫자키 누락: 경로 추측 대신 실제 부모 `isArray` 판정 + 최상위 분기.
- H-4 mergePatch 비객체 대상 TypeError: 진입부 `if(!isPlainObject(source)) source={}`.
- H-5 compare toJSON(Date) 미감지: `toJSON` 우선 + Date getTime.
- H-8 getJSONPath↔convertJsonPathToPointer 방언 불일치: 정본 방언 선언 + 소비측 정합.
- M-1 배열 move/copy splice, M-2 선행 `/` 검증, M-9 숫자 세그먼트, M-10/M-13 이스케이프, M-14 immutable 등: 보고서 순.
- **주의**: 폼 상태 정합성 직결. 각 수정에 round-trip(difference→mergePatch, compare→applyPatch) 테스트.

---

## Phase 4 — 타입 개선

> 선언부 수정, 호출부 `as` 금지. 각 수정 후 소비 패키지(json/react-utils/schema-form/json-schema) `typecheck` 통과.

### Task 4.1 — common-utils 타입 〔H10 A급〕

- **H10 hasOwnProperty**(`libs/hasOwnProperty.ts:31`): `<T>(value: T, key: PropertyKey): key is keyof T`. **A급** — 12+ 소비처 typecheck. 실패한 호출부는 선언부 관점에서 정정.
- M7 `at` 반환(`at.ts:78-85`): `Type|undefined`/`(Type|undefined)[]`, 제약 `readonly number[]|number`.
- M9 `cacheMapFactory`(`:159-190`): `<K extends string,V>` 제네릭 + `Iterable<readonly [K,V]>` 초기값(get 이 any 반환 제거).
- #8 `isFalsy`/`isTruthy`(`isFalsy.ts:294`): `Falsy` 에서 `typeof NaN` 제거(number 오염 해소, filter(isTruthy) never[] 붕괴 수정).
- #15 getTrackableHandler 차단 반환: 시그니처 `Promise<Result|undefined>`, `as Result` 제거.
- #18 scheduleMacrotask 반환: `ReturnType<typeof setImmediate>|number` 또는 브랜드 타입.
- #27/#49/#50 predicate 정밀화(무의미 술어 제거, boolean→적절 술어, 임의 T 단언 문서화).

### Task 4.2 — json 타입 (json L-5, L-6, M-9, M-12)

- L-6 `getValue<Output=unknown>` 완화 + 제약 제거(unsound as 단언 축소).
- L-5 compareRecursive `@ts-expect-error` 제거(`Object.is`/unknown 캐스트).
- M-9 배열 포인터 시그니처 `(string|number)[]`. M-12 `unescapeSegment` 정본 개명.

### Task 4.3 — react-utils 타입 (react L17, M8, L14)

- L17 withErrorBoundaryForwardRef `as Props`(`:87`) 제거(제네릭 제약 선언부 정리).
- M8 withUploader onChange 충돌(`withUploader.tsx:110-114`): `onFileChange` 개명 + `React.MouseEvent`. **breaking(prop 개명)** — 소비처 grep 후.
- L14 src/index.ts 와일드카드 6개 → 명시 나열(30 심볼).

---

## Phase 5 — 문서/공개 표면/나머지 LOW

### Task 5.1 — JSDoc 정합 〔결정: **문서 우선 + 버그성만 동작 수정**〕

**확정 방침**: C급 항목은 원칙적으로 문서를 실제 동작에 맞춰 정직하게 정정한다. 예외적으로 **사용자가 명백히 놀랄 오작동**만 동작을 고치며, 그 경우 벤치 전후 측정과 소비처 회귀 검토를 동반한다(성능 1급 지표 저장소이므로 부담 최소화가 목적).

**동작 수정 대상(버그성)**:

- `round(1.005, 2) === 1`(`round.ts:63-65`): 반올림 오류는 함수의 존재 이유를 배반하므로 수정. 지수표기 기반 반올림 + `Number.isFinite(value * multiplier)` 가드(`round(1e300, 20)` → Infinity 방지). fail-first: `round(1.005,2)===1.01`, `round(1e300,20)===1e300`.
- `isEmpty` 의 Map/Set 오판(`isEmpty.ts:428-435`): `isEmpty(new Map([['a',1]]))===true` 는 이름과 정면으로 어긋나 놀람이 크므로 `size` 검사 분기 추가. **단** `isEmptyObject`(`:163-168`)는 JSDoc:144-147 이 이를 의도된 성능 트레이드오프로 이미 선언했으므로 **동작 불변, 문서 유지**. 계약: `isEmpty` 는 breaking 이나 소비처 회귀 검토 후 진행.

**문서만 정정(동작 불변)**:

- common-utils: merge 배열 병합(H9 — 문서가 틀림, index-wise 로 정정), isArrayLike 문자열/희소배열(#20 — 문서에서 Strings 제거), isPlainObject 조부모 조건·toStringTag 오탐(#21), MessageChannelScheduler private 생성자/unload 주장(#24), isPromise thenable 자기모순(#25), math 2^53 주장(#46/#47/#48), counterFactory "thread-safe", clamp min>max(#31), max/min/median 의 NaN 위치 의존(#32/#33), fromBase 빈 입력(#29 는 동작 수정 — 문서가 throw 를 약속).
  - Murmur3 레퍼런스 주장은 **Task 3.5 에서 코드를 문서에 맞추므로**(레퍼런스 교정 확정) 여기서 제외한다.
- json: escapeSegment 예제 함수명(M-11), getJSONPointer 루트(M-7 문서), convertJsonPointerToPath 비가역(M-8 문서).
- react-utils: useOnUnmount StrictMode 발화(M6), useDebounce ms 반영(L18), useRestProperties 비교 한계(L9 택1), ErrorBoundary 복구(M4 문서 택1).

### Task 5.2 — 공개 표면 정리 (seiri_public-contract)

- common-utils `src/index.ts:1-16` 및 `utils/math/index.ts` 와일드카드 → 명시 나열.
- react-utils `src/index.ts` 6개 와일드카드 → 명시.
- json `escape/constant.ts:3,7` 죽은 export 제거(중복 상수 일원화).
- MessageChannelScheduler handler.ts export 3종(#38) 공개/삭제 결정.
- 테스트 파일명 정합: common-utils `stringifyWithFullSortedKeys.test.ts`→`serializeWithFullSortedKeys.test.ts`(seiri_naming §4).

### Task 5.3 — react-utils 나머지 LOW

- L10 fallback={null}(`ErrorBoundary.tsx:57`), L13 renderComponent falsy(`:28`), L12 isMemoComponent Symbol.for 상수화, L15 alias 통일, L16 displayName, L19-L21 정리.
- **H3 isReactComponent forwardRef/lazy 누락**(별도 취급, 아래): `$$typeof`(`react.forward_ref`/`react.lazy`) 판별 추가 + isFunctionComponent 계약 정직화. renderComponent 가 forwardRef 컴포넌트를 null 반환하는 문제 → schema-form MUI/antd 플러그인 영향 확인. **fail-first**: `remainOnlyReactComponent({Button, helper})` 가 helper 제외(수정 전 유지), `renderComponent(forwardRefComp)` 가 렌더됨.

---

## Phase 6 — 벤치 대상 확충 (Phase 0 하니스 위에)

Phase 3 수정의 전후 회귀 기준선. 선별 원칙(고연산만; 본문 1-5줄 훅/함수는 React/런타임만 측정하므로 제외).

**common-utils** (`bench/*.bench.ts`):

1. clone vs cloneLite vs structuredClone(Phase 0 스모크 확장)
2. equals vs stableEquals(동일 트리/조기 불일치/flat 50-5000키/omit)
3. stableSerialize(cache-miss vs cache-hit 비율 핵심)
4. merge(30 소비처; overlay/배열/flat/반복)
5. sortWithReference(ref 10-5000 × source 3-전체)
6. Murmur3(입력종류×크기×정렬; #2 수정 회귀 기준선)
7. MessageChannelScheduler 처리량(문서 "4-10x" vs 실측 1.18x 간극; 테스트 내 console.log 처리량 측정을 벤치로 이전)
8. debounce/throttle 억제 호출 오버헤드, filter 핫패스(isPlainObject/isEmpty/isArrayLike), math 집계(max/min/sum spread 교차점)

**json** (`bench/*.bench.ts`):

1. compare(크기×깊이×변경밀도×immutable×strict; Phase 0 스모크 확장)
2. applyPatch(immutable 전체 clone 비용; 패치수/문서크기 비율)
3. difference(compare 대비 순 오버헤드)
4. escapeSegment/unescapePath 대량(조기 종료 유무)
5. getJSONPointer/getJSONPath(H-6 WeakSet 오버헤드 정당화 기준선)

**react-utils** (기존 4종에 추가):

- useTimeout/useDebounce schedule churn(deps 변경마다 재무장; 현재 미측정)
- isReactComponent/remainOnlyReactComponent/renderComponent(schema-form 해석 경로; L12 개선 정량화)
- 기존 bench 방법론 지적 반영: perRenderOverhead 제목 "200 renders"→실제 2000 hook calls 정정.

---

## Phase 7 — 성능 회수 (PROGRESS.md §성능 후속 작업 수집본)

> 근거 실측치는 `PROGRESS.md` §성능 후속 작업의 표(hz — 높을수록 빠름). 작업 순서는 그 수집본의 제안 순서(1→5)를 따른다.
>
> **방향 확정 (2026-08-17, 사용자)**:
>
> 1. `difference` 는 **1단 재귀로 재작성**하고 보류 항목 **json H-3**(숫자키 객체를 배열로 오판해 remove 가 누락되는 실버그)을 함께 해소한다 — 동작 변화(버그 수정)가 성능 작업에 합류. 모노레포 소비처 0건·숫자키 특성화 테스트 0건(grep 실측).
> 2. `applyPatch` 의 immutable 기본 동작을 **부분 복제(copy-on-write)** 로 바꾼다 — "반환값 완전 분리(deep copy)" 계약이 "원본 불변 + 미변경 서브트리 구조 공유" 로 바뀐다. 공개 npm 기준 breaking, 모노레포 소비처 0건. 기존 테스트는 루트 분리(`result !== source`)만 고정하므로 CoW 에서도 통과한다(grep 실측).
>
> **스코프 제외**: 수집본 C 항목(`isReactComponent` 분기 순서, `compare` 변경 경로)은 측정 선행이 필요해 이번 Phase 에 넣지 않는다.

### Phase 7 공통 절차 (모든 Task 상속)

- **성능 게이트**: 수정 **전** 대상 벤치 파일을 실행해 기준 hz 를 기록 → 수정 → 같은 파일 재실행해 전후 표를 PROGRESS 에 남긴다. 대상 시나리오가 개선되지 않거나 무관 시나리오가 5% 넘게 느려지면 되돌리고 보류 사유를 기록한다.
  - 실행: `yarn workspace @winglet/<pkg> bench bench/<대상>.bench.ts`
- **동작 게이트**: 리팩터 Task(7.3·7.4·7.5)는 기존 테스트 **무수정 통과**(필요 시 characterization 을 먼저 추가해 현재 동작을 고정한 뒤 수정). 동작 변화 Task(7.1·7.2)는 변화 지점만 fail-first 신규 테스트로 red 관찰 후 수정하고, 나머지 기존 테스트는 무수정 통과.
- **완료 게이트**: 해당 패키지 `test`/`typecheck`/`lint`/`build`. 7.5 는 `equals` 가 A급(소비처 31)이므로 common-utils 재빌드 후 소비 패키지 전량 test. 착지한 계약 변화는 §릴리스 기록에 즉시 추가.
- 벤치 파일은 tsconfig 검사 대상(Task 5.3) — bench 콜백은 블록 본문(void 반환).

### Task 7.1 — difference 1단 재귀 재작성 (B-1 + H-3 합류) 〔동작 변화〕

기준: no-arrays **2,712 hz** vs 같은 입력 `compare` 17,419 hz. 낭비의 실체 = `compare` 가 `escapeSegment` 로 만든 경로 문자열을 `getArrayBasePath` 가 재파싱하고, `setValue`(내부 `compilePointer` 가 split + `unescapePath`)·`getValue` 가 mergePatch/target 을 **루트부터 재탐색**하는 왕복. RFC 7396 조립에는 경로 문자열이 아예 필요 없다.

- [ ] `json/src/JSONPointer/utils/patch/difference/differenceObjectPatch.ts` — `compare` 경유를 버리고 source/target 을 직접 걷는 내부 재귀로 교체(공개 시그니처 불변). 스케치:

  ```ts
  export const differenceObjectPatch = (
    source: JsonObject,
    target: JsonObject,
  ): JsonObject | undefined => differenceRecursive(source, target);

  const differenceRecursive = (
    source: JsonObject,
    target: JsonObject,
  ): JsonObject | undefined => {
    let patch: JsonObject | undefined = undefined;
    let hasRemoved = false;
    const sourceKeys = Object.keys(source);
    for (let i = 0, l = sourceKeys.length; i < l; i++) {
      const key = sourceKeys[i];
      const sourceValue = source[key];
      if (hasOwnProperty(target, key)) {
        const targetValue = target[key];
        if (
          sourceValue === targetValue ||
          (sourceValue !== sourceValue && targetValue !== targetValue)
        )
          continue;
        if (targetValue === undefined) {
          (patch ??= {})[key] = null;
          hasRemoved = true;
        } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
          const child = differenceRecursive(sourceValue, targetValue);
          if (child !== undefined) (patch ??= {})[key] = child;
        } else if (!equals(sourceValue, targetValue))
          (patch ??= {})[key] = cloneLite(targetValue);
      } else {
        (patch ??= {})[key] = null;
        hasRemoved = true;
      }
    }
    const targetKeys = Object.keys(target);
    if (!hasRemoved && targetKeys.length === sourceKeys.length) return patch;
    for (let i = 0, l = targetKeys.length; i < l; i++) {
      const key = targetKeys[i];
      const targetValue = target[key];
      if (hasOwnProperty(source, key) || targetValue === undefined) continue;
      (patch ??= {})[key] = cloneLite(targetValue);
    }
    return patch;
  };
  ```

- [ ] **동작 대조** — 보존: NaN 쌍 동일 취급 · target 의 undefined 값 = 제거(null) · source 에 없는 undefined 신규 키 skip · 배열/타입 불일치 leaf 는 `equals` 판정 후 `cloneLite(target)` 통째 교체(M-5 참조 분리 유지) · 변경 없음 = `undefined`. **변화(H-3)**: 숫자키 plain object 를 배열로 오판하지 않고 재귀 병합 + null 마커 생성 → remove 누락 실버그 해소. **변화(우발)**: Date leaf — 기존은 compare 의 toJSON 정규화로 ISO 문자열이 패치에 실렸으나 신규는 `equals`(equalsBuiltin) 상태 비교 + Date 클론. `JsonValue` 타입 밖 입력의 우발 동작이고 기존 테스트 0건(grep 실측) — 신규 동작을 characterization 1건으로 고정.
- [ ] `utils/getArrayBasePath.ts` 와 `__tests__/arrayBasePath.test.ts` **삭제** (유일 소비처 소멸). `grep -rn getArrayBasePath json/src` 무결과 확인. JSDoc 의 "two-phase" 서사도 재귀 서술로 갱신(문서 선행).
- [ ] **fail-first**: 신규 `__tests__/difference.roundTrip.test.ts` — `mergePatch(source, difference(source, target))` 가 target 과 deep-equal 인 round-trip 속성. 숫자키 케이스 `{a:{'0':'x','2':'w'}} → {a:{'0':'z'}}` 는 수정 전 결과에 `'2': 'w'` 가 잔존해 **red** 임을 관찰(H-3 증상 그대로). Date characterization 포함.
- [ ] 기존 `difference.test.ts` 37 + `escapeHandling.test.ts` 21 **무수정 통과** — escape 키가 결과 객체에 원본 그대로 남는 것이 왕복 제거의 정당성 증명.
- **벤치 게이트**: `bench/difference.bench.ts` — no-arrays 가 compare 단독(17,419) 이상, with-arrays 동반 개선.
- **릴리스 기록**: json major 표에 H-3 동작 변화("숫자키 객체가 배열로 오판되지 않고 재귀 병합·null 마커 생성") 추가.

### Task 7.2 — applyPatch copy-on-write (B-2) 〔breaking, 사용자 확정〕

기준: 패치 1건 **65,311 hz** / 100건 12,580 hz — 1건에도 전체 `cloneLite`. CoW 는 패치가 닿는 경로의 노드만 얕은 복제하고 나머지 서브트리는 원본과 공유한다.

- [ ] **JSDoc 선행**: `applyPatch.ts` 의 "Immutable mode creates a deep copy" 를 "원본 불변 + 미변경 서브트리는 반환값과 원본이 공유(구조 공유)" 로 갱신. 한계 명시: 동일 노드를 두 경로가 참조하는 입력에서는 패치가 닿은 경로만 분리된다.
- [ ] `applyPatch.ts` — 전체 `cloneLite(source)` 를 얕은 루트 복제 + 소유 추적으로 교체:

  ```ts
  const cloned = immutable ? new WeakSet<object>() : null;
  let result: any = source;
  if (cloned !== null && source !== null && typeof source === "object") {
    result = isArray(source) ? source.slice() : { ...source };
    cloned.add(result);
  }
  for (let i = 0, l = patches.length; i < l; i++)
    result = applySinglePatch(
      result,
      patches[i],
      i,
      strict,
      protectPrototype,
      cloned,
    );
  ```

- [ ] `applySinglePatch.ts` — 시그니처 말미에 `cloned: WeakSet<object> | null` 추가(내부 함수). walk 하강부(`current = current[segment]`)를 소유권 확보로 교체:

  ```ts
  let next: any = current[segment];
  if (
    cloned !== null &&
    next !== null &&
    typeof next === "object" &&
    !cloned.has(next)
  ) {
    next = isArray(next) ? next.slice() : { ...next };
    cloned.add(next);
    current[segment] = next;
  }
  current = next;
  ```

- [ ] **함정 — MOVE 의 from 경로 오염**: `handleObject`/`handleArray` 의 MOVE 분기는 `setValue(source, patch.from, undefined)` 로 **path walk 와 다른 from 경로를 직접 변형**한다(제거 의미론은 `delete`). from 경로가 미복제 공유 노드면 원본이 오염된다. 해결: `applySinglePatch` 의 MOVE/COPY 검증 블록에서 `patch.op === Operation.MOVE && cloned !== null` 이면 신규 헬퍼 `ensureOwnedFromPath(source, patch.from, cloned)` 를 호출해 from 경로의 중간 노드 전부를 위와 같은 방식으로 얕은 복제해 둔다(존재하지 않는 세그먼트를 만나면 조용히 중단 — 이후 기존 getValue/setValue 의 기존 에러/무시 경로 유지). 신규 파일 `applyPatch/utils/ensureOwnedFromPath.ts`(1파일 1함수). COPY 의 from 은 읽기 + `cloneLite` 라 확보 불요. `handleRootPatch` 의 from 도 `getValue` 읽기 전용이라 불요. **핸들러 3파일은 무수정.**
- [ ] 보존 확인: root ADD/REPLACE 가 반환한 `patch.value` 는 `cloned` 에 넣지 않는다 — 기존에도 직접 변형 대상이었다. TEST op 는 걷기만 하므로 복제가 일어나도 정확성 무해(선택 최적화: op 가 TEST 면 확보 생략 — 벤치로 판단).
- [ ] **fail-first**: 신규 `__tests__/applyPatch.copyOnWrite.test.ts` —
  1. 공유(신규 계약): `replace /a/b` 후 `result.c === source.c` — 수정 전 전체 클론이라 **red**, 수정 후 green.
  2. 원본 불변 가드: 닿은 경로 수정 후 source deep-equal 유지(수정 전에도 통과).
  3. MOVE from 오염 가드: `[{op:'move', from:'/x/y', path:'/a/b'}]` 후 `source.x.y` 잔존(수정 전에도 통과 — from 확보가 빠진 미숙한 CoW 구현이면 red 가 되는 회귀 방지선).
  4. move 된 서브트리를 후속 패치로 변형해도 원본 불변.
- [ ] 기존 `applyPatch.test.ts` 50 + `applyPatch.security.test.ts` 5 + `applyPatch.pathForms.test.ts` **무수정 통과**(루트 분리 단언 `result !== source` 는 얕은 루트 복제로 유지된다).
- **벤치 게이트**: `bench/applyPatch.bench.ts` — 1/10/100 패치 모두 개선, `immutable: false`(mutating) 시나리오 비회귀.
- **릴리스 기록**: json major 표에 breaking("immutable 이 deep copy → 구조 공유. 반환값을 변형하는 소비자는 미변경 서브트리를 통해 원본을 변형하게 된다") 추가.

### Task 7.3 — stableSerialize omit 정렬 memo (A-1)

기준: same input with omit **3,183,716 hz** (수정 전 3,638,113 — M20 이 매 호출 복사·정렬·Set 구축·Murmur3 해시를 추가). 소비처 패턴(상수 omit 컬렉션 재사용)에서 이 비용은 컬렉션당 1회면 충분하다.

- [ ] `common-utils/src/utils/object/stableSerialize.ts` — omit 컬렉션 객체를 키로 하는 WeakMap memo:

  ```ts
  type OmitEntry = { set: Set<string>; hash: string };
  const omitEntryCache = new WeakMap<object, OmitEntry>();

  const resolveOmitEntry = (
    omit: Set<string> | readonly string[],
  ): OmitEntry => {
    const cached = omitEntryCache.get(omit as object);
    if (cached !== undefined) return cached;
    const keys = [...omit].sort();
    const entry: OmitEntry = {
      set: new Set(keys),
      hash: Murmur3.hash(keys.join(",")).toString(36),
    };
    omitEntryCache.set(omit as object, entry);
    return entry;
  };

  export const stableSerialize = (
    input: unknown,
    omit?: Set<string> | readonly string[],
  ): string => {
    if (!omit) return createHash(input, null, "");
    const entry = resolveOmitEntry(omit);
    return createHash(input, entry.set, entry.hash);
  };
  ```

  기존 정렬·join·해시 로직을 그대로 옮긴다(결과 문자열 불변). falsy omit 은 기존과 동일하게 무-omit 취급.

- [ ] **JSDoc 선행**: Limitations 의 입력 불변 전제를 omit 컬렉션까지 확장 — "omit 컬렉션도 identity 로 memo 되므로, 재사용하는 컬렉션의 내용을 변형하면 이전 정렬·해시가 재사용된다".
- [ ] characterization +1 (`stableSerialize.contract.test.ts`, 현재 6케이스): 같은 omit 배열 참조를 변형 후 재호출하면 이전 해시가 나온다 — 문서화된 한계를 고정.
- [ ] 기존 stableSerialize 테스트 3파일 무수정 통과(출력 문자열 불변이므로).
- **벤치 게이트**: `bench/stableSerialize.bench.ts` — with omit 이 3,638,113(원값) 이상 회복, 무-omit 2 시나리오 비회귀.

### Task 7.4 — sortWithReference sparse 회수 (B-3, M12 재접근)

기준: sparse(3/5000) **5,698 hz**. 실측상 지배 비용은 5,000 엔트리 Map 구축(+빈 배열 5,000 선할당). 정렬 교체는 `undefined` 계약을 깨서 기각됐으므로(리뷰 CONFIRMED) **버킷 의미론은 유지**하고, source 멤버십으로 Map 을 축소 + 등장한 인덱스만 그룹을 지연 생성한다.

- [ ] characterization 선행: `__tests__/sortWithReference.test.ts` 에 **중복 reference 항목** 케이스가 없으면 +1 — 현재 동작(같은 항목이 reference 에 두 번이면 **마지막 인덱스가 이긴다**: `referenceMap.set` 이 덮어쓰므로)을 고정한 뒤 수정에 들어간다.
- [ ] `common-utils/src/utils/array/sortWithReference.ts`:

  ```ts
  if (!reference) return source.slice();
  const sourceSet = new Set(source);
  const referenceMap = new Map<Value, number>();
  for (let i = 0, l = reference.length; i < l; i++) {
    const entry = reference[i];
    if (sourceSet.has(entry)) referenceMap.set(entry, i); // last-wins 유지(무가드 set)
  }
  const referencedGroups = new Map<number, Value[]>();
  const unreferencedItems: Value[] = [];
  for (let i = 0, l = source.length; i < l; i++) {
    const item = source[i];
    const referenceIndex = referenceMap.get(item);
    if (referenceIndex === undefined) unreferencedItems.push(item);
    else {
      const group = referencedGroups.get(referenceIndex);
      if (group === undefined) referencedGroups.set(referenceIndex, [item]);
      else group.push(item);
    }
  }
  const orderedIndices = [...referencedGroups.keys()].sort((a, b) => a - b);
  // 이하 orderedIndices 순회로 그룹 방출 → unreferencedItems 후미
  ```

  - 동작 보존 논증: 그룹 내 순서 = source 등장 순서(순회 순서) · 그룹 간 순서 = reference 인덱스 오름차순(숫자 정렬 — 비교 함수가 원소가 아닌 **인덱스**를 받으므로 `undefined` 원소 계약과 무관) · 미등장 항목 원래 순서 후미 · 중복 reference last-wins · `undefined` 멤버십은 Set/Map 의 SameValueZero 로 기존과 동일. 기존 버킷 사유 주석은 위치를 옮겨 유지.

- [ ] 기존 sortWithReference 테스트 무수정 통과.
- **벤치 게이트**: `bench/sortWithReference.bench.ts` — sparse 5,698 hz 대비 개선(기대 수 배), dense 230,129 hz ±5% 이내. dense 가 5% 넘게 밀리면: `reference.length` 가 source 대비 작을 때 기존 선할당 경로를 유지하는 임계 분기를 실측으로 검토하고, 그래도 안 되면 되돌리고 보류 기록.

### Task 7.5 — equals·stableEquals plain-pair fast-path (A-2·A-3)

기준: stableEquals equal-tree **20,645 hz**(원값 21,656) · cyclic **20,775 hz**(원값 22,375). 원인 = 객체 쌍마다 `getTypeTag` 2회(`Object.prototype.toString.call`). 기각된 "own key 0 일 때만 태그 확인"(프로퍼티 붙은 Date 오탐 부활) 대신, **`Object.getPrototypeOf === Object.prototype` 쌍**이면 내장 상태가 없음이 프로토타입으로 보장되므로 태그 없이 구조 비교로 직행한다.

- [ ] `common-utils/src/utils/object/equals.ts` — 배열 블록(이미 태그 앞에 있음) 뒤, 태그 조회를 fast-path 로 감싼다:

  ```ts
  const OBJECT_PROTOTYPE = Object.prototype;
  // equalsRecursive 내부, 배열 처리 뒤:
  if (
    Object.getPrototypeOf(left) !== OBJECT_PROTOTYPE ||
    Object.getPrototypeOf(right) !== OBJECT_PROTOTYPE
  ) {
    const tag = getTypeTag(left);
    if (tag !== getTypeTag(right)) return false;
    if (tag !== OBJECT_TAG) {
      /* 기존 equalsBuiltin 위임 유지 */
    }
  }
  // 이하 기존 키 비교(공통 경로)
  ```

- [ ] `common-utils/src/utils/object/stableEquals.ts` — ① 배열 블록(`leftIsArray` 비교·원소 루프)을 태그 조회 **앞**으로 이동(한쪽만 배열 → false 는 태그 불일치와 동일 결론, 둘 다 배열 → 태그가 둘 다 ARRAY_TAG 였으므로 이후 ARRAY_BUFFER/isView/builtin 분기 비적중 — 동작 동일). ② 이동 후 남은 태그 경로(ARRAY_BUFFER·isView·builtin)를 equals 와 같은 fast-path 조건으로 감싼다.
- [ ] **동작 대조**: 정상 입력 완전 보존 — literal-proto plain 쌍은 기존에도 OBJECT_TAG 로 구조 비교였다. cross-realm plain·`Object.create(null)`·프로퍼티 붙은 내장 객체는 fast-path 미적용(프로토타입 불일치)으로 기존 태그 경로 그대로. 변화는 병적 입력뿐: own/proto `Symbol.toStringTag` 로 내장 태그를 위장한 literal-proto 객체 쌍 — 기존엔 equalsBuiltin 이 존재하지 않는 메서드를 불러 **TypeError** 를 던지던 입력이 구조 비교 값을 반환하게 된다(throw 를 고정한 기존 테스트 0건 — 무수정 통과가 판정 기준).
- [ ] 기존 테스트 전량 무수정 통과: `equals.test.ts` 31 · `equals.contract.test.ts` 11 · `stableEquals.test.ts` 43 · `stableEquals.contract.test.ts` 6.
- **벤치 게이트**: `bench/stableEquals.bench.ts` — equal-tree ≥ 21,656 · cyclic ≥ 22,375(원값 회복). `bench/equals.bench.ts` 전 시나리오 비회귀~개선.
- **완료 게이트(A급)**: common-utils build 후 소비 패키지 전량 test — json · react-utils · schema-form · promise-modal · json-schema · data-loader.

### Task 간 인터페이스

다섯 Task 는 서로 다른 파일을 만지며 의존이 없다 — 순서는 회수 폭 순일 뿐이다. 유일한 접점: 7.1 의 신규 재귀가 `equals` 를 leaf 판정에 사용하는데, 7.5 는 동작 보존 리팩터이므로 어느 순서로 착지해도 7.1 의 결과는 같다.

```
Phase 0 (벤치 인프라)  ──> Phase 6 이 이것을 사용
Phase 1 (도달 HIGH)    ──> 최우선. A급 회귀 매트릭스 준수
Phase 2 (보안 HIGH)
Phase 3 (HIGH/비효율)  ──> Phase 0 벤치로 성능 전후 게이트
Phase 4 (타입)         ──> 소비 패키지 typecheck 게이트
Phase 5 (문서/표면)
Phase 6 (벤치 확충)
Phase 7 (성능 회수)    ──> PROGRESS §성능 후속 작업 수집본. Task 7.1→7.5 순, 벤치 전후 게이트
```

**각 Phase 완료 게이트**: 해당 패키지 `test` + `typecheck` + `lint` 통과. A급 계약 Task 는 소비 패키지(schema-form/json-schema/data-loader) `test`+`typecheck` 추가 통과. 완료 claim 은 실행한 검증 명령을 먼저 명시(seiri_verify).

**방향 결정 사항 (2026-08-17 확정, 미결정 없음)**:

| #   | 사안                     | 확정                                                                                                                                                                                                     | 반영 위치   |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Murmur3                  | **레퍼런스 교정** — `Math.imul` 로 진짜 MurmurHash3 로 만든다. 클래스명·JSDoc 이 이미 표방하므로 계약 이행. 해시값 변경되나 프로덕션 소비 0건, 간접 소비(stableSerialize omit 해시)는 캐시 키라 무해     | Task 3.5    |
| 2   | clone maxDepth           | **JSDoc 이 정본, 코드 수정** — `depth > limit` 로 N 단계까지 복제. 2번째 인자 실사용처 0건이라 회귀 없이 직관적 동작 채택                                                                                | Task 3.1 M2 |
| 3   | C급 문서/동작            | **문서 우선 + 버그성만 동작** — `round` 반올림 오류와 `isEmpty` 의 Map/Set 오판만 동작 수정, 나머지는 문서를 실제 동작에 맞춰 정정. `isEmptyObject` 는 의도된 트레이드오프로 선언되어 있으므로 동작 불변 | Task 5.1    |
| 4   | stableSerialize 비-plain | **결정적 안정 키** — WeakMap 기반 인스턴스 안정 id 로 "같은 입력 → 같은 출력" 보장. 구조 동일성까지는 미지원(JSDoc 명시). registerPlugin 캐시 무력화 해소가 목적                                         | Task 3.3 H8 |

> #3 의 동작 수정 2건은 계약 변경(breaking)이나 **`isEmpty` · `round` 모두 프로덕션 소비처 0건**(grep 실측, 2026-08-17)으로 확인되어 §계약 변경 마스터 리스트 **B급(위험 낮음, 수정 자유)** 에 속한다. 공개 npm 패키지이므로 changeset 에는 breaking 으로 기록한다.

---

## 릴리스 기록 — changeset 에 breaking 으로 남길 항목

> 이 저장소는 `.changeset/` 를 추적하지 않는다(릴리스 시점에 `yarn changeset` 으로 생성). 그래서 **실제로 착지한** 계약 변경을 여기 한 곳에 모아 둔다. 릴리스 담당자는 이 표를 그대로 changeset 본문으로 옮기면 된다. "모노레포 소비처 0" 은 저장소 내부 이야기일 뿐, **공개 npm 패키지이므로 외부 소비자에게는 전부 breaking** 이다.

### @winglet/common-utils — major

| 유틸                                            | 변화                                                                                                                       | 근거     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| `equals` · `stableEquals`                       | omit 키를 개수 비교 **전에** 제외 → 비대칭 키셋이 이제 equal. Date/RegExp/Map/Set 는 상태 비교(이전엔 무조건 true)         | Task 3.2 |
| `stableSerialize`                               | 출력 문자열 형식 변경(문자열 인용, `null`/`undefined` 명시, Invalid Date 표기, omit 키 정렬). 캐시 키로 쓰던 값이 달라진다 | Task 3.3 |
| `Murmur3`                                       | MurmurHash3 x86_32 레퍼런스와 일치하도록 교정 → **모든 해시값이 달라진다**. 저장된 해시가 있으면 재계산 필요               | Task 3.5 |
| `polynomialHash(_, length)` (length < 7)        | `slice(0, n)` → `slice(-n)` — 저비트를 보존하도록 잘라내는 쪽이 바뀜                                                       | Task 3.5 |
| `groupBy` · `transformKeys` · `transformValues` | 반환 객체가 `Object.create(null)` 산 — 프로토타입이 없다. `result.hasOwnProperty(...)` 같은 상속 메서드 호출이 깨진다      | Task 3.4 |
| `isEmpty`                                       | 내용이 있는 `Map`/`Set` 을 이제 non-empty 로 판정(이전엔 own key 가 없어 empty)                                            | Task 5.1 |
| `round`                                         | 지수 표기로 밀려 잘못 반올림되던 입력이 교정됨                                                                             | Task 5.1 |
| `merge`                                         | `__proto__` 키를 병합에서 제외 — 프로토타입 오염 차단. 그 키를 실제로 병합하던 코드가 있다면 무시된다                      | Task 2.1 |
| `hasOwnProperty`                                | 타입 가드 `key is never` → `key is keyof Type`. 가드 내부에서 통과하던 잘못된 키 사용이 타입 에러로 드러날 수 있다         | Task 4.1 |
| `at`                                            | 스칼라 인덱스도 `Math.trunc` 정규화 — `at(a, 1.5)` 가 배열 인자와 같은 슬롯을 읽는다                                       | Task 3.4 |
| `getTrackableHandler`                           | 차단된 호출의 반환이 `Promise<Result \| undefined>` — 이전엔 `Result` 로 거짓 주장                                         | Task 4.1 |

### @winglet/json — major

| 유틸                                 | 변화                                                                                                                                         | 근거     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `getJSONPointer`                     | 루트 반환 `'/'` → `''`(RFC 6901). **`''` 는 falsy 이므로 `if (pointer)` 로 존재를 판정하던 코드가 루트를 놓친다** — `!= null` 로 바꿔야 한다 | Task 3.7 |
| `applyPatch` 배열 `move`/`copy`      | 덮어쓰기 → splice 삽입, 제거는 `delete` 가 아니라 splice(구멍이 남지 않는다). RFC 6902 정합                                                  | Task 3.7 |
| `applyPatch` `move`/`copy` 의 `from` | 문자열이 아니면 `JsonPatchError('PATCH_PATH_INVALID')` — 이전엔 조용히 통과했다                                                              | Task 3.7 |
| `compare` 배열 제거 순서             | 배열 원소 제거 패치를 역순으로 방출 — 이전 순서로는 스스로 만든 패치를 되적용할 수 없었다                                                    | Task 3.7 |
| `difference`                         | 숫자키 plain object 를 배열로 오판하지 않는다(H-3) — 이전엔 remove 가 누락돼 병합 결과에 제거된 키가 남았다. Date leaf 는 ISO 문자열 대신 Date 클론으로 패치에 실린다. 변경이 금지 키뿐이면 `{}` 대신 `undefined` 반환 | Task 7.1 |

### @winglet/react-utils — minor

| 유틸                                        | 변화                                                             | 근거     |
| ------------------------------------------- | ---------------------------------------------------------------- | -------- |
| `isReactComponent`                          | `forwardRef`/`lazy` 컴포넌트를 이제 컴포넌트로 인정(이전엔 탈락) | Task 4.3 |
| `isForwardRefComponent` · `isLazyComponent` | 신규 export(추가만, 기존 표면 불변)                              | Task 4.3 |
