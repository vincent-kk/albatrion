# winglet 품질 개선 — 진행 원장

> `PLAN.md` 가 사양, 이 파일이 이력이다. 한 줄에 하나: 무엇이 어디에 반영됐고 어떻게 검증했는지.
> 재개 시 대화 기억이 아니라 이 원장과 git 이력을 신뢰한다. 완료로 표시된 Task 는 다시 하지 않는다.

## Phase 0 — 벤치 인프라

### [x] Task 0.1 / 0.2 — common-utils · json 벤치 하니스 · 2026-08-17 (codex 위임)

**반영**: 두 패키지에 `vitest.bench.config.ts`(environment `node`, alias `@/<pkg>`→`./src`, include `bench/**/*.bench.ts`, outputJson `bench/.results/latest.json`), `package.json` bench 스크립트 4종(react-utils 와 문자열 동일), `.gitignore` 에 `bench/.results`, 스모크 벤치 `common-utils/bench/clone.bench.ts`(depth4·width4 = 341 노드, 입력은 계측 구간 밖 1회 생성) 와 `json/bench/compare.bench.ts`(변경 밀도 0/1/50% × 100·1000 노드).

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils bench` → 통과. `clone` 31,849 Hz / `cloneLite` 63,776 Hz / `structuredClone` 30,413 Hz
- `yarn workspace @winglet/json bench` → 통과. 100노드 무변경 19.6M Hz vs 1% 109K Hz — `compare` 의 조기 종료 경로가 실제로 크게 버는 것을 확인
- 두 패키지 `typecheck` / `lint` 모두 통과

**비고**: `src/**` 무수정 확인. 작업 중 codex 가 관찰한 `math/**` 동시 변경은 본 세션의 Task 1.1 작업이며, codex 는 이를 보존했다.

## Phase 1 — 도달 가능 HIGH

### [x] Task 1.1 — gcd/lcm 무한 루프 + 지수 표기 소수 (#1, #13) · 2026-08-17

**반영**

| 파일                                                           | 변경                                                                                                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common-utils/src/utils/math/countDecimals.ts`                 | 신규. 지수 표기(`1e-7`)의 소수 자릿수를 지수부까지 읽어 계산. `gcd`·`lcm` 공용 내부 헬퍼(`index.ts` 미노출)                                                                     |
| `common-utils/src/utils/math/constant.ts`                      | `MAX_FRACTION_DIGITS = 100` 추가 (`toFixed` 상한, 초과 시 RangeError)                                                                                                           |
| `common-utils/src/utils/math/gcd.ts`                           | 진입부 유한성 가드 → `NaN`; 소수 자릿수 산출을 `countDecimals` 로 교체; 스케일 결과 유한성 가드 → `NaN`; `maxDecimals > MAX_FRACTION_DIGITS` 면 `toFixed` 생략. JSDoc 계약 갱신 |
| `common-utils/src/utils/math/lcm.ts`                           | 진입부 유한성 가드(공개 API 경계); 소수 자릿수 산출을 `countDecimals` 로 교체; `toFixed` 상한 처리. JSDoc 계약 갱신                                                             |
| `schema-form/.../intersectSchema/utils/intersectMultipleOf.ts` | 비유한 `multipleOf` 를 제약 없음으로 간주(호출측 신뢰 경계 가드). JSDoc 갱신                                                                                                    |
| `common-utils/.../__tests__/gcd.test.ts`                       | +4 케이스 (7→11)                                                                                                                                                                |
| `common-utils/.../__tests__/lcm.test.ts`                       | +2 케이스 (7→9)                                                                                                                                                                 |
| `schema-form/.../__tests__/intersectMultipleOf.test.ts`        | +1 케이스 (15→16)                                                                                                                                                               |

**fail-first 관찰**

- `yarn workspace @winglet/common-utils test --run .../gcd.test.ts` — 수정 전 **90초 동안 결과 0건**(정상 1초 미만). 동기 무한 루프라 vitest 타임아웃이 끊지 못함 = 보고된 hang 증상 그대로.
- `intersectMultipleOf(Infinity, 2)` — common-utils 재빌드 후 `expected NaN to be 2` 로 red. (재빌드 전에는 schema-form 이 stale `dist` 를 참조해 hang — `seiri_test-validity` §2 사례)

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils build` → 통과 (typecheck 포함)
- `yarn workspace @winglet/common-utils test --run` → **112 파일 / 1004 테스트 통과**
- `yarn workspace @winglet/common-utils lint` → 통과
- `yarn workspace @canard/schema-form typecheck` → 통과
- `yarn workspace @canard/schema-form test --run` → **204 파일 / 3568 테스트 통과**

**계획 대비 편차**

1. 플랜은 `uclidGcd` 루프에 `right === right` 방어를 명시했으나 **채택하지 않았다**. 진입부 유한성 가드 + 스케일 결과 유한성 가드로 `uclidGcd` 가 비유한 값을 받는 경로가 사라져, 루프 가드는 도달 불가능한 죽은 절이 된다(`seiri_test-validity` §5 위반). 대신 스케일 오버플로를 `NaN` 으로 정직하게 보고한다 — 루프 가드 방식은 `gcd(1e308, 1.5)` 에서 수학적으로 틀린 `1.5` 를 반환했다.
2. 플랜에 없던 `lcm` 의 소수 자릿수 수정을 포함했다. `lcm` 도 동일한 문자열 파싱 결함을 갖고 있어(`lcm(1e-7, 2e-7)` → `0`), gcd 만 고치면 도달 경로가 남는다.
3. `MAX_FRACTION_DIGITS` clamp 은 플랜에 없었으나 필수였다 — `countDecimals` 도입으로 `maxDecimals` 가 100 을 넘을 수 있게 되어 `toFixed` 가 RangeError 를 던진다(probe 로 확인). clamp 덕에 `gcd(1e-300, 2e-300)` 이 정확히 `1e-300` 을 반환한다.

### [x] Task 1.2 — MessageChannelScheduler 정지 2종 (#3, #4) · 2026-08-17

**반영**

| 파일                                                               | 변경                                                                                                                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common-utils/.../MessageChannelScheduler.ts`                      | `__requestFlush__()` 추출 — arming 게이트를 한 곳으로 일원화. `__flushBatch__` 는 빈 큐에서 `__idle__` 를 스스로 복원(#3). 메시지 핸들러는 배치 처리 후 남은 대기 태스크가 있으면 재arming(#4) |
| `common-utils/.../__tests__/MessageChannelScheduler.flush.test.ts` | 신규 3 케이스. 기존 파일이 이미 33 케이스로 test-record 상한(32) 초과 상태라 `filid_verification-records` §4 에 따라 인시던트 기준 분할                                                        |
| `common-utils/.../__tests__/scheduleMacrotask.fallback.test.ts`    | 신규 2 케이스. `globalThis.setImmediate` 를 제거한 브라우저 형태에서 `scheduleMacrotask` → MessageChannelScheduler 라우팅 경로를 검증                                                          |

**fail-first 관찰**

- 신규 flush 스위트: `expected [] to deeply equal ['after']`(#3 정지), `expected ['first'] to deeply equal ['first','second']`(#4 유실). 세 번째 케이스(태스크 내부 재스케줄)는 수정 전에도 통과 — 수정이 그 동작을 깨지 않는지 지키는 가드.
- 폴백 스위트: `MessageChannelScheduler.ts` 만 `git stash push -- <path>` 로 범위 한정 되돌린 뒤 실행해 동일 2건 red 확인, 즉시 `stash pop` 복원.

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils test --run` → **114 파일 / 1009 테스트 통과** (기존 33 케이스 스위트 무수정 통과 포함)
- `yarn workspace @winglet/common-utils lint` → 통과
- `yarn workspace @winglet/common-utils typecheck` → 통과

**계획 대비 편차**

1. 플랜은 "스냅샷 방식을 버리고 핸들러가 현재 대기 전체를 소비" 를 1안으로 제시했으나, **핸들러 tail 에서 재arming** 하는 2안을 택했다. 와이어 포맷(`MessageEvent<number[]>`)과 기존 33 케이스 스위트를 건드리지 않고 두 결함을 모두 없앤다.
2. schema-form 소비처 회귀 테스트는 추가하지 않았다. Node 실행에서는 `globalThis.setImmediate` 가 존재해 `scheduleMacrotask` 가 네이티브 경로를 타므로 schema-form 테스트는 이 결함을 통과할 수 없다. 대신 원인 지점(common-utils)에서 브라우저 형태를 직접 재현했다.

### [x] Task 1.3 — getTrackableHandler pending 영구 고착 (#9) · 2026-08-17

**반영**

| 파일                                                             | 변경                                                                                                                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `common-utils/.../getTrackableHandler.ts`                        | `finally` 안에서 `afterExecute` 호출을 중첩 `try/finally` 로 감싸, 훅이 throw 해도 `pending = false; publish()` 에 도달하도록 수정. JSDoc:281 이 이미 약속한 계약의 이행 |
| `common-utils/.../__tests__/getTrackableHandler.cleanup.test.ts` | 신규 3 케이스. 기존 파일이 정확히 32 케이스(test-record 상한)라 인시던트 기준 분할                                                                                       |

**fail-first 관찰**

3건 모두 red — `pending` 이 `true` 고착, `preventConcurrent` 기본값으로 두 번째 호출이 원본을 실행하지 못함(spy 1회), 완료 통지 누락(listener 1회).

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils test --run src/utils/function` → **4 파일 / 53 테스트 통과** (기존 32 케이스 스위트 무수정 통과 포함)

### [x] Task 1.4 — Portal 리마운트 + anchor 교체 (react H1, H2) · 2026-08-17

**반영**

| 파일                                                | 변경                                                                                                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-utils/.../Portal.tsx`                        | 등록 id 를 `useLazyConstant(() => getRandomString(36))` 로 인스턴스당 1회 생성. 콘텐츠 upsert 와 언마운트 해제를 별도 effect 로 분리 — children 변경이 더 이상 해제·재등록을 일으키지 않는다 |
| `react-utils/.../context/PortalContext.ts`          | `portalAnchorRef` → `setPortalAnchor` 콜백 ref, `register(element)` → `register(id, element)`                                                                                                |
| `react-utils/.../context/PortalContextProvider.tsx` | 레지스트리를 배열 → `ReadonlyMap<string, ReactNode>`(id 기준 O(1) upsert, 삽입 순서 유지). anchor 를 `useRef` → `useState` 로 승격해 render 중 ref 읽기 제거                                 |
| `react-utils/.../context/usePortalContext.ts`       | `usePortalAnchorRef` → `usePortalAnchor`                                                                                                                                                     |
| `react-utils/.../Anchor.tsx`                        | 콜백 ref 사용. JSDoc 갱신                                                                                                                                                                    |
| `react-utils/.../__tests__/Portal.render.test.tsx`  | 신규 4 케이스. 기존 `withPortal.test.tsx` 는 Portal/Anchor 를 전혀 렌더하지 않아 이 결함들이 살아남았다                                                                                      |

**fail-first 관찰 (H1·H2 상호 은폐 때문에 2단계로 진행)**

1. H1: `expected "spy" to be called 1 times, but got 4 times` — 부모 3회 리렌더에 포털 서브트리가 4회 마운트(감사 보고의 `{mounts:4, unmounts:3}` 와 일치).
2. H1 수정 후 H2 테스트는 여전히 통과했다. 원인 2가지를 차례로 제거해야 표면화했다 — (a) `children` 이 매 렌더 새 객체라 `register` 재실행이 provider 를 다시 렌더시켜 stale ref 를 덮어씀 → 참조 고정 콘텐츠로 교체, (b) 두 분기가 같은 타입·같은 위치라 React 가 anchor DOM 노드를 재사용 → `key` 로 실제 언마운트/마운트 강제.
3. 그 결과 H2 red: `expected null not to be null` — anchor 교체 후 콘텐츠가 DOM 에서 완전히 사라짐(분리된 노드로 포털됨).

**검증 (실행 결과)**

- `yarn workspace @winglet/react-utils test --run` → **27 파일 / 175 테스트 통과** (기존 `withPortal.test.tsx` 무수정 통과 포함)
- `yarn workspace @winglet/react-utils typecheck` → 통과
- `yarn workspace @winglet/react-utils lint` → 통과

**계약 영향**: `PortalContext` 형태 변경은 `internal` — grep 결과 `Portal`·`usePortalAnchorRef`·`portalAnchorRef` 의 소비처가 react-utils 내부뿐이며 모노레포 외부 소비처가 없다.

### Phase 1 완료 게이트 · 2026-08-17

`common-utils` · `react-utils` 재빌드 후 전 소비 패키지 회귀 없음.

| 패키지                        | 결과                            |
| ----------------------------- | ------------------------------- |
| `@winglet/common-utils` build | 통과 (typecheck 포함)           |
| `@winglet/react-utils` build  | 통과 (typecheck 포함)           |
| `@canard/schema-form`         | 204 파일 / **3568 테스트 통과** |
| `@lerx/promise-modal`         | 11 파일 / **128 테스트 통과**   |
| `@winglet/json`               | 26 파일 / **536 테스트 통과**   |
| `@winglet/json-schema`        | 17 파일 / **392 테스트 통과**   |
| `@winglet/data-loader`        | 2 파일 / **48 테스트 통과**     |

## Phase 2 — 보안 HIGH

### [x] Task 2.1 — merge prototype pollution (H1) · 2026-08-17

**반영**: `merge.ts` 키 순회에서 `__proto__` 만 건너뛴다(`PROTOTYPE_POLLUTION_KEY` 상수 + 근거 JSDoc). `merge.test.ts` 에 인시던트 3 케이스 추가(9→12).

**fail-first**: `expected 'yes' to be undefined` — 최상위·중첩 `__proto__` 양쪽에서 `Object.prototype` 오염 확인.

**과잉 차단 회피 근거**: 함께 추가한 `constructor` 케이스는 **수정 전에도 통과**했다 — `target['constructor']` 는 함수라 `isPlainObject` 를 통과하지 못하고 평범한 own 프로퍼티로 대입되므로 오염 경로가 아니다. json 의 `isForbiddenKey` 가 `constructor` 를 무조건 막아 데이터를 조용히 잃는 문제(M-6)를 여기서 반복하지 않았다.

**검증**: `merge.test.ts` 12 테스트 통과, `typecheck` 통과.

### [x] Task 2.2 — 순환 참조 무한 루프 4종 (H2, H3, json H-6) · 2026-08-17

**반영**

| 파일                                              | 변경                                                                                                                                                                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common-utils/.../hasUndefined.ts`                | 전역 `WeakSet` 방문 추적. 재방문이 답을 바꿀 수 없는 boolean 탐색이라 전역 추적이 건전하다                                                                                                                                                                             |
| `common-utils/.../serializeWithFullSortedKeys.ts` | **조상 전용** 추적(exit 센티널로 스택에서 조상 집합 유지) + `[Circular]` 마커. 전역 방문 추적을 쓰면 순환이 아닌 공유 참조까지 접혀 서로 다른 문서가 같은 지문을 갖게 되므로 채택하지 않았다. JSDoc 의 "Will cause infinite loops (not handled)" 를 실제 동작으로 갱신 |
| `json/.../getJSONPointer.ts` · `getJSONPath.ts`   | 전역 `WeakSet` 방문 추적. `value === target` 비교가 큐잉 전에 끝나므로 대상을 놓치지 않는다                                                                                                                                                                            |
| 각 테스트                                         | `hasUndefined` +3, `serializeWithFullSortedKeys` +2, `getJSONPointer` +2, `getJSONPath` +2                                                                                                                                                                             |

**fail-first**: `hasUndefined` 는 30초 무응답(무한 루프), `serializeWithFullSortedKeys` 와 json 두 DFS 는 **FATAL ERROR: JavaScript heap out of memory**.

**검증**: common-utils 관련 2 파일 31 테스트 통과, json 26 파일 540 테스트 통과, json `typecheck` 통과.

**분류 정정**: 감사는 H3(`serializeWithFullSortedKeys`)를 버그로 보고했으나 JSDoc 이 "Circular References: Will cause infinite loops (not handled)" 로 **이미 한계를 선언**하고 있었다. 계약 위반이 아니라 DoS 표면 제거를 위한 개선으로 분류한다. 반면 H2(`hasUndefined`)는 JSDoc 이 "handled safely" 라고 **거짓 주장**했으므로 계약 위반이 맞다.

### [x] Task 2.3 — json 프로토타입 우회 + copy 참조 공유 (H-2, H-7) · 2026-08-17

**반영**

| 파일                                                 | 변경                                                                                                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `json/.../applyPatch/utils/assertSafeFromPointer.ts` | 신규. `move`/`copy` 의 `from` 포인터를 세그먼트 단위로 검증 — `path` 는 walk 중 검사되지만 `from` 은 핸들러 안 `getValue` 로 해석돼 검사 사각이었다 |
| `json/.../applySinglePatch.ts`                       | 루트 패치 분기 직후 `'from' in patch` 일 때 위 검증 호출                                                                                            |
| `json/.../handleObject.ts` · `handleArray.ts`        | COPY 분기를 `cloneLite(getValue(...))` 로 변경. MOVE 는 원본을 제거하므로 클론 불필요                                                               |
| `json/.../__tests__/applyPatch.security.test.ts`     | 신규 5 케이스. 기존 `applyPatch.test.ts` 가 50 케이스로 상한 초과라 인시던트 분할                                                                   |

**fail-first**: `expected [Function] to throw an error` ×3(from 경로 무검사), `expected 999 to be 1`(copy 가 메모리 공유). 정상 경로 copy/move 가드 케이스는 수정 전에도 통과.

**검증**: json 27 파일 / **545 테스트 통과**(기존 50 케이스 스위트 무수정 통과), `typecheck` · `lint` 통과.

**계획 대비 편차**: 플랜의 "`getValueByPointer` 에 금지키 가드 추가" 는 이번에 하지 않았다. 그것은 `getValue` 공개 API 에 `protectPrototype` 옵션을 추가하는 breaking 변경(M-3)이라 Phase 4 소관이고, `from` 검증만으로 이번 익스플로잇 경로는 닫힌다.

### Phase 2 완료 게이트 · 2026-08-17

| 대상                          | 결과                                       |
| ----------------------------- | ------------------------------------------ |
| `common-utils` / `json` build | 통과                                       |
| `@winglet/common-utils`       | 115 파일 / **1020 테스트 통과**, lint 통과 |
| `@winglet/json`               | 27 파일 / **545 테스트 통과**              |
| `@canard/schema-form`         | 204 파일 / **3568 테스트 통과**            |
| `@lerx/promise-modal`         | 11 파일 / **128 테스트 통과**              |
| `@winglet/json-schema`        | 17 파일 / **392 테스트 통과**              |
| `@winglet/react-utils`        | 27 파일 / **175 테스트 통과**              |
| `@winglet/data-loader`        | 2 파일 / **48 테스트 통과**                |

## Phase 3 — 나머지 HIGH + 비효율

### [x] Task 3.1 — clone 계열 (H4, M3, M2, LOW) · 2026-08-17

**반영**

| 파일                                                | 변경                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common-utils/.../clone.ts`                         | (H4) Buffer 복제를 `value.subarray()` → `Uint8Array.prototype.slice.call(value)` — 실측으로 **Buffer 타입은 유지되면서 메모리는 복사**됨을 확인했고, 전역 `Buffer` 식별자를 쓰지 않아 브라우저 번들에 폴리필이 주입될 여지도 없다. (M3) Date·RegExp·Buffer·TypedArray·ArrayBuffer 분기에 `cache.set` 추가 — 공유 참조가 복제본에서도 하나로 유지된다. (LOW) RegExp 매치 배열의 `groups` 를 `index`/`input` 과 함께 보존 |
| `common-utils/.../__tests__/clone.builtins.test.ts` | 신규 4 케이스 (기존 파일이 30 케이스로 상한 근접)                                                                                                                                                                                                                                                                                                                                                                       |

**fail-first**: `expected 99 to be 1`(Buffer 메모리 공유), `expected <Date> to be <Date>`·`expected /x/g to be /x/g`(공유 참조가 둘로 갈라짐), `expected undefined to deeply equal { word: 'hello' }`(groups 유실).

**검증**: clone 관련 2 파일 34 테스트 통과(기존 30 케이스 **무수정** 통과), common-utils 116 파일 / **1024 테스트 통과**, `typecheck` · `lint` 통과.

**⚠ 확정 방향 번복 — M2 maxDepth**

착수 전 확정은 "JSDoc 이 정본, 코드 수정" 이었고 근거는 "maxDepth 인자 실사용처 0건이라 회귀 없음" 이었다. **이 전제가 틀렸다.** `clone.test.ts:176-212` 가 maxDepth 계약을 8개 단언으로 이미 고정하고 있다:

- `clone(x, 0) === x` (복제 안 함)
- `clone(x, 1)` → 루트만 복제
- `clone(x, 2)` → 루트 + level1 복제
- `clone(x, 3)` → 루트 + level1 + level2 복제

즉 "maxDepth = N 은 N 개 객체 레벨을 복제한다" 는 **자체적으로 일관된 계약**이며 코드가 이를 정확히 구현한다. 가드를 `depth > limit` 로 바꾸면 `maxDepth=0` 과 `1` 이 구별되지 않아 "복제하지 않음" 을 표현할 수단이 사라진다 — API 가 나빠진다. 따라서 **코드를 정본으로 두고 JSDoc 예제를 정정**했다(`clone(deep, 2)` 의 level2 단언을 참조로 수정 + `maxDepth=0` 예시 추가). 되돌리려면 JSDoc 편집 한 번이면 된다.

**커밋 후 발견한 빌드 파손**: 린터가 `groups` 대입 줄을 줄바꿈하면서 `@ts-expect-error` 지시자가 `if` 줄에 붙어 `tsc -p tsconfig.declarations.json` 이 실패했다(`yarn typecheck` 는 다른 tsconfig 라 통과). 지시자를 블록 안 대상 줄 바로 위로 옮겨 줄바꿈에 견디게 수정했다. 커밋 직전 `/seiri:verify` 게이트가 잡았다.

### [x] Task 3.2a — equals omit·내장 객체 계약 (H5, H6, M11) · 2026-08-17 〔A급 계약 변경〕

**반영**

| 파일 | 변경 |
| --- | --- |
| `common-utils/.../equalsBuiltin.ts` | 신규 내부 헬퍼(`index.ts` 미노출). Date 는 `getTime()`(무효 날짜의 NaN 포함), RegExp 는 `source`+`flags`, Set/Map 은 크기와 내용으로 비교. 재귀 비교자는 인자로 받아 `equals` 로의 의존 순환을 만들지 않는다 |
| `common-utils/.../equals.ts` | (H6) 배열 처리 뒤 타입 태그를 비교하고, `OBJECT_TAG` 가 아니면 `equalsBuiltin` 위임 — 클래스 인스턴스는 `OBJECT_TAG` 라 구조 비교 경로를 그대로 탄다. (H5) 키 개수 비교를 omit 적용 후 양쪽 모두에 대해 수행(`countRetained`). (M11) `countObjectKey(right)` → `Object.keys(right).length` |
| `common-utils/.../__tests__/equals.contract.test.ts` | 신규 9 케이스 (기존 파일 31 케이스로 상한 근접) |
| `common-utils/bench/equals.bench.ts` | 신규. deep/early-mismatch/flat 50·500키/omit 3종 |

**fail-first**: omit 비대칭 2건 `expected false to be true`, 내장 객체 2건 `expected true to be false`. 가드 3건(비-omit 비대칭 거부·자기 자신과 동등·클래스 인스턴스 구조 비교)은 수정 전에도 통과.

**⚠ 확정 방향 변경 — H6 (사용자 재확정)**

플랜은 "비-plain 객체는 `left === right` 폴백" 이었다. 그러나 구현 직후 **기존 테스트 `equals.test.ts:229` 가 깨졌다** — Date·RegExp·Set 을 담은 복잡 구조가 구조적으로 같으면 equal 이길 기대하는 케이스다. 참조 비교를 택하면 값이 같은 Date 두 개도 unequal 이 되어 그 단언을 내가 고쳐야 했다. 사용자에게 근거와 함께 3개 선택지를 제시했고 **구조 비교** 로 재확정받았다. 그 결과 **깨진 기존 테스트가 무수정으로 통과**한다.

문서화된 한계: Set 멤버와 Map 키는 SameValueZero 로 매칭한다(객체 멤버는 identity). 순서 무관 페어링 탐색은 선형 비교를 이차로 만들기 때문이며, 테스트에 명시 케이스를 남겼다.

**성능 게이트 (bench 전후, hz — 높을수록 빠름)**

| 시나리오 | 전 | 후 | 변화 |
| --- | ---: | ---: | ---: |
| flat 500키 | 25,481 | 34,657 | **+36.0%** |
| flat 50키 | 285,418 | 355,380 | **+24.5%** |
| omit 없음 | 286,090 | 355,337 | +24.2% |
| omit(array) | 260,170 | 278,249 | +7.0% |
| omit(Set) | 263,511 | 281,508 | +6.8% |
| deep 341노드 | 62,834 | 64,268 | +2.3% |
| early mismatch | 8,916,015 | 9,350,056 | +4.9% |

M11 수정이 태그 검사 비용을 상쇄하고도 남아 전 시나리오가 빨라졌다.

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils test --run` → **117 파일 / 1034 테스트 통과** (기존 `equals.test.ts` 31 케이스 **무수정** 통과)
- `typecheck` 통과, `build` 통과
- 소비 패키지 전량 통과 — json 545 · react-utils 175 · schema-form 3568 · promise-modal 128 · json-schema 392 · data-loader 48

### [x] Task 3.3 — serialize 계열 (H7, H8, M18, M20, M1) · 2026-08-17

**반영**

| 파일 | 변경 |
| --- | --- |
| `common-utils/.../stableSerialize.ts` | (M20) omit 키를 복사 후 정렬해 해시 — 나열 순서가 결과를 바꾸지 않는다. (H7) 캐시 항목을 `{omitHash, result}` 튜플로 바꿔 omit 집합이 일치할 때만 재사용 — 빈 omitHash 가 모든 결과의 접두사라 omit 결과가 일반 호출로 새던 문제 제거. (M18) 문자열만 `JSON.stringify` 로 인용해 `1` 과 `'1'` 충돌 제거, `null`/`undefined` 를 명시 처리해 `undefined` 반환 제거, 무효 Date 는 `Invalid Date` 로(그 `toJSON()` 은 `null` 이라 실제 null 과 충돌) |
| `common-utils/.../serializeObject.ts` | (M1) `while (key)` → `while ((key = keys.pop()) !== undefined)` — 빈 문자열 키에서 순회가 끊겨 남은 슬롯이 hole 로 남던 문제 |
| `common-utils/.../__tests__/stableSerialize.contract.test.ts` | 신규 6 케이스 |
| `common-utils/.../__tests__/serializeObject.test.ts` | +1 케이스 (7→8) |
| `common-utils/bench/stableSerialize.bench.ts` | 신규 |

**fail-first**: omit 오염 `expected '1n37n{a:1}' not to be '1n37n{a:1}'`, omit 순서 의존, `typeof` 가 `'undefined'`, `1`/`'1'` 충돌, `{a:1}`/`{a:'1'}` 충돌 — 5건. serializeObject 는 `expected 'b:3||' to be 'b:3|:2|a:1'`.

**기존 스냅샷 3건 갱신 (근거 제시)**: `stableSerialize.test.ts` 의 정확 출력 단언 3건을 갱신했다. 기대/실제 diff 를 전부 대조해 **변경이 두 종류뿐임을 확인**했다 — (1) 문자열 값에 인용 부호 추가(충돌 수정의 직접 결과), (2) omit 해시 `1toy9cy`→`6hyqx9`(키 정렬의 직접 결과). 구조·키 순서·숫자 표현은 한 글자도 바뀌지 않았다.

**⚠ 계획 대비 편차 — H7 캐시 처리**

플랜은 "가변 입력이면 memo 를 호출 단위로 한정" 이었다. 벤치 기준선이 캐시 히트 경로를 **12.2M hz** 로 보여줬고, 캐시를 제거하면 전체 순회(수만 hz 수준)로 100배 이상 느려진다 — 성능 게이트를 통과할 수 없다. 대신 **캐시를 유지하되 omit 오염만 정확히 제거하고, 입력을 불변으로 취급한다는 전제를 JSDoc `Limitations` 에 명시**했다. H8 역시 결정(인스턴스 안정 id)대로 동작이 이미 맞으므로, 거짓이던 JSDoc 주장(`구조가 같은 다른 객체도 같은 문자열`)을 사실에 맞게 정정했다.

**성능 게이트 (hz)**

| 시나리오 | 전 | 후 | 변화 |
| --- | ---: | ---: | ---: |
| 같은 입력 반복 | 12,207,588 | 15,234,528 | **+24.8%** |
| 매번 다른 입력 | 11,899,178 | 14,151,330 | +18.9% |
| omit 있는 반복 | 3,638,113 | 3,183,716 | **-12.5%** |

omit 경로 감소는 매 호출 키 정렬(M20 의 대가)이고, 훨씬 잦은 무-omit 경로는 튜플 비교가 문자열 `startsWith` 를 대체해 빨라졌다.

**검증**: common-utils **119 파일 / 1047 테스트 통과**, `typecheck`·`lint`·`build` 통과, 소비 패키지 전량 통과(json 545 · react-utils 175 · schema-form 3568 · promise-modal 128 · json-schema 392).

### [x] Task 3.2b — stableEquals omit·내장 객체 (H5, M8, M14) · 2026-08-17

**반영**

| 파일 | 변경 |
| --- | --- |
| `common-utils/.../countRetainedKeys.ts` | 신규 내부 헬퍼. `equals` 에 두었던 `countRetained` 를 `stableEquals` 와 공유하도록 승격(`readonly PropertyKey[]` 로 일반화해 `Reflect.ownKeys` 의 symbol 키도 받는다) |
| `common-utils/.../equals.ts` | 지역 헬퍼를 위 공유 헬퍼로 교체 |
| `common-utils/.../stableEquals.ts` | (M8) 타입 태그 비교 추가 — 종류가 다른 두 객체가 둘 다 own key 0개라 equal 로 판정되던 문제 제거. ArrayBuffer 는 `Uint8Array` 뷰로 감싸 기존 바이트 비교 경로 재사용. `OBJECT_TAG` 가 아니면 `equalsBuiltin` 위임(Date/RegExp 의 기존 `instanceof` 분기를 대체 — 태그 기반이라 cross-realm 도 잡는다). (H5) omit 적용 후 양쪽 키 개수 비교. (M14) visited 부기를 `has`+`get` 반복(최대 6회 조회)에서 `get` 2회 + 필요 시 `set` 으로 축소 |
| `common-utils/.../__tests__/stableEquals.contract.test.ts` | 신규 6 케이스 (기존 파일 43 케이스로 상한 초과) |
| `common-utils/bench/stableEquals.bench.ts` | 신규. equal 트리 / 순환 구조 / equals 대조 |

**fail-first**: omit 비대칭 `expected false to be true`, Map·ArrayBuffer·이종 내장 객체 3건 `expected true to be false`. 가드 2건(비-omit 비대칭 거부·Date/RegExp 상태 비교)은 수정 전에도 통과.

**⚠ 성능 게이트 — 느려졌고, 그대로 수용한다 (hz)**

| 시나리오 | 전 | 후 | 변화 |
| --- | ---: | ---: | ---: |
| equal 트리(341노드) | 21,656 | 20,645 | **-4.7%** |
| 순환 구조 | 22,375 | 20,775 | **-7.1%** |

원인은 객체 쌍마다 추가된 `getTypeTag` 2회(`Object.prototype.toString.call`)다. M14 의 visited 조회 축소(6→2회 + 필요 시 set)가 일부만 상쇄했다. 0-key 인 경우에만 태그를 확인하도록 늦추면 비용을 되찾을 수 있지만, 프로퍼티가 붙은 Date 처럼 own key 를 가진 내장 객체에서 오탐이 되살아나므로 채택하지 않았다. **소비처가 0인 유틸에서 오탐 제거와 맞바꾼 5~7% 이며, `equals`(소비처 31)는 같은 태그 검사를 넣고도 M11 덕에 오히려 빨라졌다.**

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils test --run` → **118 파일 / 1040 테스트 통과** (기존 `stableEquals.test.ts` 43 케이스 **무수정** 통과)
- `typecheck` · `lint` · `build` 통과
- 소비 패키지 전량 통과 — json 545 · react-utils 175 · schema-form 3568 · promise-modal 128 · json-schema 392 · data-loader 48
