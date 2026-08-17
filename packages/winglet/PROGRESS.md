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

| 파일                                                 | 변경                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `common-utils/.../equalsBuiltin.ts`                  | 신규 내부 헬퍼(`index.ts` 미노출). Date 는 `getTime()`(무효 날짜의 NaN 포함), RegExp 는 `source`+`flags`, Set/Map 은 크기와 내용으로 비교. 재귀 비교자는 인자로 받아 `equals` 로의 의존 순환을 만들지 않는다                                                                               |
| `common-utils/.../equals.ts`                         | (H6) 배열 처리 뒤 타입 태그를 비교하고, `OBJECT_TAG` 가 아니면 `equalsBuiltin` 위임 — 클래스 인스턴스는 `OBJECT_TAG` 라 구조 비교 경로를 그대로 탄다. (H5) 키 개수 비교를 omit 적용 후 양쪽 모두에 대해 수행(`countRetained`). (M11) `countObjectKey(right)` → `Object.keys(right).length` |
| `common-utils/.../__tests__/equals.contract.test.ts` | 신규 9 케이스 (기존 파일 31 케이스로 상한 근접)                                                                                                                                                                                                                                            |
| `common-utils/bench/equals.bench.ts`                 | 신규. deep/early-mismatch/flat 50·500키/omit 3종                                                                                                                                                                                                                                           |

**fail-first**: omit 비대칭 2건 `expected false to be true`, 내장 객체 2건 `expected true to be false`. 가드 3건(비-omit 비대칭 거부·자기 자신과 동등·클래스 인스턴스 구조 비교)은 수정 전에도 통과.

**⚠ 확정 방향 변경 — H6 (사용자 재확정)**

플랜은 "비-plain 객체는 `left === right` 폴백" 이었다. 그러나 구현 직후 **기존 테스트 `equals.test.ts:229` 가 깨졌다** — Date·RegExp·Set 을 담은 복잡 구조가 구조적으로 같으면 equal 이길 기대하는 케이스다. 참조 비교를 택하면 값이 같은 Date 두 개도 unequal 이 되어 그 단언을 내가 고쳐야 했다. 사용자에게 근거와 함께 3개 선택지를 제시했고 **구조 비교** 로 재확정받았다. 그 결과 **깨진 기존 테스트가 무수정으로 통과**한다.

문서화된 한계: Set 멤버와 Map 키는 SameValueZero 로 매칭한다(객체 멤버는 identity). 순서 무관 페어링 탐색은 선형 비교를 이차로 만들기 때문이며, 테스트에 명시 케이스를 남겼다.

**성능 게이트 (bench 전후, hz — 높을수록 빠름)**

| 시나리오       |        전 |        후 |       변화 |
| -------------- | --------: | --------: | ---------: |
| flat 500키     |    25,481 |    34,657 | **+36.0%** |
| flat 50키      |   285,418 |   355,380 | **+24.5%** |
| omit 없음      |   286,090 |   355,337 |     +24.2% |
| omit(array)    |   260,170 |   278,249 |      +7.0% |
| omit(Set)      |   263,511 |   281,508 |      +6.8% |
| deep 341노드   |    62,834 |    64,268 |      +2.3% |
| early mismatch | 8,916,015 | 9,350,056 |      +4.9% |

M11 수정이 태그 검사 비용을 상쇄하고도 남아 전 시나리오가 빨라졌다.

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils test --run` → **117 파일 / 1034 테스트 통과** (기존 `equals.test.ts` 31 케이스 **무수정** 통과)
- `typecheck` 통과, `build` 통과
- 소비 패키지 전량 통과 — json 545 · react-utils 175 · schema-form 3568 · promise-modal 128 · json-schema 392 · data-loader 48

### [x] Task 3.3 — serialize 계열 (H7, H8, M18, M20, M1) · 2026-08-17

**반영**

| 파일                                                          | 변경                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `common-utils/.../stableSerialize.ts`                         | (M20) omit 키를 복사 후 정렬해 해시 — 나열 순서가 결과를 바꾸지 않는다. (H7) 캐시 항목을 `{omitHash, result}` 튜플로 바꿔 omit 집합이 일치할 때만 재사용 — 빈 omitHash 가 모든 결과의 접두사라 omit 결과가 일반 호출로 새던 문제 제거. (M18) 문자열만 `JSON.stringify` 로 인용해 `1` 과 `'1'` 충돌 제거, `null`/`undefined` 를 명시 처리해 `undefined` 반환 제거, 무효 Date 는 `Invalid Date` 로(그 `toJSON()` 은 `null` 이라 실제 null 과 충돌) |
| `common-utils/.../serializeObject.ts`                         | (M1) `while (key)` → `while ((key = keys.pop()) !== undefined)` — 빈 문자열 키에서 순회가 끊겨 남은 슬롯이 hole 로 남던 문제                                                                                                                                                                                                                                                                                                                     |
| `common-utils/.../__tests__/stableSerialize.contract.test.ts` | 신규 6 케이스                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `common-utils/.../__tests__/serializeObject.test.ts`          | +1 케이스 (7→8)                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `common-utils/bench/stableSerialize.bench.ts`                 | 신규                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**fail-first**: omit 오염 `expected '1n37n{a:1}' not to be '1n37n{a:1}'`, omit 순서 의존, `typeof` 가 `'undefined'`, `1`/`'1'` 충돌, `{a:1}`/`{a:'1'}` 충돌 — 5건. serializeObject 는 `expected 'b:3||' to be 'b:3|:2|a:1'`.

**기존 스냅샷 3건 갱신 (근거 제시)**: `stableSerialize.test.ts` 의 정확 출력 단언 3건을 갱신했다. 기대/실제 diff 를 전부 대조해 **변경이 두 종류뿐임을 확인**했다 — (1) 문자열 값에 인용 부호 추가(충돌 수정의 직접 결과), (2) omit 해시 `1toy9cy`→`6hyqx9`(키 정렬의 직접 결과). 구조·키 순서·숫자 표현은 한 글자도 바뀌지 않았다.

**⚠ 계획 대비 편차 — H7 캐시 처리**

플랜은 "가변 입력이면 memo 를 호출 단위로 한정" 이었다. 벤치 기준선이 캐시 히트 경로를 **12.2M hz** 로 보여줬고, 캐시를 제거하면 전체 순회(수만 hz 수준)로 100배 이상 느려진다 — 성능 게이트를 통과할 수 없다. 대신 **캐시를 유지하되 omit 오염만 정확히 제거하고, 입력을 불변으로 취급한다는 전제를 JSDoc `Limitations` 에 명시**했다. H8 역시 결정(인스턴스 안정 id)대로 동작이 이미 맞으므로, 거짓이던 JSDoc 주장(`구조가 같은 다른 객체도 같은 문자열`)을 사실에 맞게 정정했다.

**성능 게이트 (hz)**

| 시나리오       |         전 |         후 |       변화 |
| -------------- | ---------: | ---------: | ---------: |
| 같은 입력 반복 | 12,207,588 | 15,234,528 | **+24.8%** |
| 매번 다른 입력 | 11,899,178 | 14,151,330 |     +18.9% |
| omit 있는 반복 |  3,638,113 |  3,183,716 | **-12.5%** |

omit 경로 감소는 매 호출 키 정렬(M20 의 대가)이고, 훨씬 잦은 무-omit 경로는 튜플 비교가 문자열 `startsWith` 를 대체해 빨라졌다.

**검증**: common-utils **119 파일 / 1047 테스트 통과**, `typecheck`·`lint`·`build` 통과, 소비 패키지 전량 통과(json 545 · react-utils 175 · schema-form 3568 · promise-modal 128 · json-schema 392).

### [x] Task 3.4 — array·object 유틸 (M4, M5, M6, M13 / M12 되돌림) · 2026-08-17

**반영**

| 파일                                                       | 변경                                                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --- | ---------------------------------------------------------------------- |
| `common-utils/.../groupBy.ts`                              | (M4) 누산기를 `Object.create(null)` 로 — `constructor`/`toString` 같은 상속 멤버가 키로 오면 `result[key].push` 가 TypeError 를 던지던 문제 제거 |
| `common-utils/.../transformKeys.ts` · `transformValues.ts` | (M5) 누산기를 `Object.create(null)` 로 — `__proto__` 키가 프로토타입 setter 에 흡수돼 조용히 사라지던 문제 제거                                  |
| `common-utils/.../at.ts`                                   | (M6) 스칼라 분기에도 배열 분기와 같은 `Math.trunc(index)                                                                                         |     | 0`정규화 —`at(a, 1.5)`와`at(a, [1.5])` 가 다른 슬롯을 읽던 불일치 제거 |
| `common-utils/.../sortWithReference.ts`                    | (M13) reference 생략 시에도 복사본 반환 — 한쪽 경로만 입력을 그대로 돌려주던 aliasing 제거. M12(버킷 → 정렬)는 아래 〔되돌림〕 참조              |
| 각 테스트                                                  | groupBy +1, transformKeys +1, transformValues +1, at +1, sortWithReference +1                                                                    |
| `common-utils/bench/sortWithReference.bench.ts`            | 신규 (sparse / dense)                                                                                                                            |

**fail-first**: `TypeError: result[key].push is not a function`(groupBy), `expected [] to deeply equal ['__proto__']`(transformKeys), `expected ['a'] to deeply equal ['__proto__','a']`(transformValues), `expected undefined to be 2`(at), `expected [3,1,2] not to be [3,1,2]`(sortWithReference aliasing).

**⚠ 되돌림 — M12 버킷 제거 (리뷰 지적 CONFIRMED)**

버킷을 `Array.prototype.sort` 로 교체했을 때 벤치는 sparse +6.0%(5,698→6,040 hz), dense +1.6%(226,417→230,129 hz)였다. 그러나 리뷰가 의미 회귀를 짚었다 — `Array.prototype.sort` 는 `undefined` 원소를 **비교 함수에 넘기지 않고** 무조건 끝으로 옮긴다. 따라서 reference 가 `undefined` 를 마지막이 아닌 위치에 두면 정렬 구현은 그 순서를 지킬 수 없다. 6%/1.6% 로는 계약 손상을 살 수 없어 **버킷 구현으로 되돌리고, 이유를 코드 주석으로 남겼다**(`sortWithReference.ts:37-39`). M13 aliasing 수정만 유지된다. M12(빈 배열 선할당 제거)는 다시 성능 백로그로 — 정렬이 아닌 다른 수단(예: 등장한 인덱스만 지연 생성)이 필요하다.

감사는 빈 배열 선할당이 26% 를 차지한다고 추정했으나, 실측에서는 5000 엔트리 `Map` 구축이 지배 비용이었다.

**반환 계약 변화**: `groupBy`·`transformKeys`·`transformValues` 의 반환 객체는 이제 프로토타입이 없다. `result.hasOwnProperty(...)` 처럼 상속 메서드를 호출하던 코드가 있으면 깨지므로 각 `@returns` 에 명시했다. 세 함수 모두 모노레포 내 소비처가 0 이고, 소비 패키지 전량 통과로 확인했다.

**검증**: common-utils **119 파일 / 1052 테스트 통과**, `typecheck`·`lint`·`build` 통과, 소비 패키지 전량 통과.

### [x] Task 3.5 — hash 레퍼런스 교정 (#5, #2, #6, #7) · 2026-08-17

**확정 방향**: 사용자 확정대로 **레퍼런스 교정** — `Murmur3` 를 Austin Appleby 의 MurmurHash3 x86_32 와 일치시킨다.

**반영**

| 파일                                                   | 변경                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common-utils/.../murmur3.ts`                          | (#5) `__mixK1__` 과 최종 혼합의 16비트 분할 곱셈을 `Math.imul` 로 교체 — 분할 형태는 교차항 하나를 누락해 레퍼런스와 일치할 수 없었다. 상수도 조각(`0x2d51`/`0xcc9e0000`)에서 전체 값(`0xcc9e2d51`/`0x1b873593`, `0x85ebca6b`/`0xc2b2ae35`)으로. (#2) DataView 잔여 청크 오프셋 `(i - alignedChunks) * 4` → `i * 4` — 버퍼 앞부분을 다시 읽어 꼬리 청크가 해시에 기여하지 못했다. (#6) `if (k1 > 0)` → `if (this.__remainder__ > 0)` — 꼬리 3번째 문자가 `0x8000` 이상이면 k1 이 음수 int32 라 블록이 통째로 버려졌다. 고아가 된 `__MASK_16_SHIFT__` 제거 |
| `common-utils/.../polynomialHash.ts`                   | (#7) `.slice(0, length)` → `.slice(-length)` — 상위 자릿수는 크기만 담아 짧은 길이에서 해시가 붕괴했다. `length <= 0` 가드 추가(`slice(-0)` 은 `slice(0)` 이라 전체를 반환)                                                                                                                                                                                                                                                                                                                                                                               |
| `common-utils/.../__tests__/murmur3.reference.test.ts` | 신규 6 케이스. **기대값은 전부 레퍼런스에서 독립 도출** — 공개 벡터 5종으로 검증한 probe 로 생성했다                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `common-utils/.../__tests__/polynomialHash.test.ts`    | +2 케이스 (충돌률·0 패딩)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

**fail-first**: 레퍼런스 6 케이스 전부 red — `expected 3253963644 to be 1009084850`("a"), 정렬/비정렬 불일치 `expected 3162182596 to be 576625206`, 꼬리 폐기 `expected 389533576 not to be 389533576`, seed 불일치 등. polynomialHash 는 충돌률 케이스가 red(20000 중 19851 충돌).

**기존 단언 갱신 (근거 제시)**

- `murmur3.test.ts` 31 케이스는 **무수정 통과**했다. 결정성·증분 일관성 같은 속성만 검증하고 레퍼런스 벡터가 하나도 없어 알고리즘 오류를 잡지 못하던 스위트다.
- `polynomialHash.test.ts` 4건은 `// 실제 반환값` 주석이 달린 특성화 스냅샷이었다. 길이 3·1·소수점 케이스는 앞자리→뒷자리 변경의 직접 결과(`'248'`→`'87m'`, `'2'`→`'m'`), 음수 길이는 새 가드로 `''`. 길이 0·7·8·10 케이스는 그대로 통과한다.
- `stableSerialize.test.ts` 의 omit 해시 토큰 `6hyqx9`→`1bjyhvz`. 치환 후 나머지 문자열이 **완전히 일치함을 스크립트로 확인**했다 — Murmur3 교정의 직접 파급이고 그 외 차이는 없다.

**계획 대비 편차**: 플랜은 `length` 를 7로 clamp 하는 안도 담았으나 **철회**했다. 기존 테스트가 길이 8·10 에서 0 패딩된 더 긴 결과를 계약으로 고정하고 있어 clamp 는 회귀였다. 대신 JSDoc 의 부정확한 `max: 7` 표기를 실제 동작(초과 길이는 0 패딩)으로 정정했다.

**소비처 영향**: `polynomialHash` 의 유일한 소비처 promise-modal `ModalManager` 는 기본값 7 을 쓰며, 길이 7 출력은 변경 전후가 동일하다(패딩된 7자에 대해 `slice(0,7)` 과 `slice(-7)` 이 같음). `Murmur3` 는 프로덕션 직접 소비가 0 이고 `stableSerialize` 의 omit 해시로만 간접 사용된다.

### [x] Task 3.6 — promise·scheduler·function (#10, #11, #14, #16, #23, #17) · 2026-08-17

**반영**

| 파일                                                                 | 변경                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common-utils/.../withTimeout.ts`                                    | (#10) 내부 `AbortController` 를 외부 signal 과 연결하고 `finally` 에서 abort — 경주에서 진 `delay` 타이머가 남아 프로세스 종료를 지연시키고 반복 호출에서 누적되던 문제 제거          |
| `common-utils/.../waitAndReturn.ts`                                  | (#16) `fn` 을 promise 안에서 시작해 동기 예외도 지연 뒤 전달하고, `Promise.allSettled` 로 delay 와 함께 정산해 대기 중 거부가 핸들러 없이 방치되지 않게 함                            |
| `common-utils/.../scheduleMacrotask.ts` · `scheduleMacrotaskSafe.ts` | (#11) `setImmediate` 와 `clearImmediate` 를 **둘 다** 확인. 팩토리가 모듈 최상위에서 실행되므로 한쪽만 있는 폴리필에서 서브패스 전체가 임포트 불가였다                                |
| `common-utils/.../getTrackableHandler.ts`                            | (#14) `stateManager.update` 가 구독자에게 통지. 훅 실행 중에는 `hookRunning` 게이트로 통지를 미뤄 직후 pending publish 에 합친다 — 실행당 통지 수는 그대로 2회                        |
| `common-utils/.../debounce.ts` · `throttle.ts`                       | (#23) `dispose()` 추가 — `clear()` 는 대기 호출만 취소하고 공유 `AbortSignal` 의 리스너는 남아 wrapper 를 붙들었다                                                                    |
| `common-utils/.../scheduleNextTick.ts`                               | (#17) "Consistent next tick semantics across all platforms" 주장을 실제 동작으로 정정 — Node 는 마이크로태스크/nextTick, 브라우저는 매크로태스크라 `setTimeout(0)` 대비 순서가 반대다 |
| 신규 테스트 4파일                                                    | `withTimeout.cleanup`(2), `waitAndReturn.timing`(2), `scheduleMacrotask.partialGlobals`(2), `getTrackableHandler.publish`(1), `rateLimit.dispose`(2)                                  |

**fail-first**: 7건 red — 남은 타이머 `expected 1 to be +0`·`expected 5 to be +0`, scheduler 임포트 throw 2건, 동기 예외가 1ms 만에 전달 `expected 1 to be greater than or equal to 50`, 실제 `unhandledRejection` 발생, update 통지 0회.

**기존 단언 무수정**: `getTrackableHandler.test.ts` 의 "ignore duplicate subscribers"(실행당 2회 통지)가 처음에는 3회로 깨졌다. 테스트 의도는 중복 구독 dedup 이고 횟수는 부수적이지만, 플랜의 "중복 publish 정리" 지침대로 훅 창 통지를 직후 publish 에 합치는 방식을 택해 **단언을 고치지 않고** 통과시켰다.

**⚠ 보류 — #12 throttle 최소 간격**

감사의 제안(실행 지점에서 `previous` 갱신 + `>` → `>=`)을 그대로 적용하면 최소 간격이 보장되지 않는다. 추적해 보면 leading 게이트와 trailing 타이머가 각각 다른 기준시각을 쓰기 때문에, 보장하려면 "쿨다운 중 호출을 창 끝으로 미루는" 스케줄링 모델 자체를 다시 짜야 한다. 타이밍에 민감하고 기존 동작 테스트 9건이 걸려 있어, 한 줄짜리 반쪽 수정 대신 **별도 작업으로 남긴다**. 관측 증상은 `ms=100` 에서 trailing 직후 leading 이 발화해 간격이 4ms 로 좁아지는 것.

**검증**: common-utils **125 파일 / 1069 테스트 통과**, `build`·`lint` 통과, 소비 패키지 전량 통과.

### [x] Task 3.7 — json patch RFC 정합 (H-1, H-4, H-5, M-2, M-4, M-5, M-7, M-9, M-11, M-14, L-5, L-8, L-9) · 2026-08-17

**반영**

| 파일                                              | 변경                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `json/.../compare/compareRecursive.ts`            | (H-1) 배열 노드의 remove 패치를 **인덱스 내림차순**으로 방출 — applyPatch 가 splice 하므로 오름차순이면 뒤 인덱스가 이미 줄어든 배열 밖을 가리켰다. (H-5/L-8) `toJSON` 우선 지원(`toJson` 은 별칭 유지), `in` 대신 `typeof` 로 프로토타입 체인 조회 절감. 정규화 결과가 객체면 그 값으로 재귀(세분화 비교 유지), 스칼라면 노드 통째 교체 — Date 두 개가 키 0개라 동일 판정되던 문제 제거. (L-5) 제네릭 파라미터 재대입 대신 재귀라 `@ts-expect-error` 없이 타입이 성립 |
| `json/.../mergePatch/mergePatchRecursive.ts`      | (H-4) 진입부 `if (!isPlainObject(source)) source = {}` — RFC 7396 이 요구하는 동작이며 기존 기본 파라미터는 `undefined` 만 덮었다                                                                                                                                                                                                                                                                                                                                      |
| `json/.../mergePatch/mergePatch.ts`               | (M-14) immutable 모드에서 비객체 패치도 복제                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `json/.../applyPatch/applySinglePatch.ts`         | (M-2) 선행 `/` 검증 — 없으면 첫 세그먼트가 조용히 버려져 다른 위치를 수정했다                                                                                                                                                                                                                                                                                                                                                                                          |
| `json/.../manipulator/utils/compileSegments.ts`   | (M-4) 호출자 배열을 제자리 변형하지 않고 새 배열에 기록. (M-9) 숫자 세그먼트를 문자열로 정규화                                                                                                                                                                                                                                                                                                                                                                         |
| `json/.../manipulator/{getValue,setValue}.ts`     | (M-9) 시그니처를 `(string                                                                                                                                                                                                                                                                                                                                                                                                                                              | number)[]` 로 정정 |
| `json/.../manipulator/utils/setValueByPointer.ts` | (L-9) `-` → 인덱스 변환을 자동 생성 블록보다 **먼저** 수행                                                                                                                                                                                                                                                                                                                                                                                                             |
| `json/.../difference/differenceObjectPatch.ts`    | (M-5) 배열 경로 값도 `cloneLite` — 반환 패치가 target 의 배열을 참조 공유했다                                                                                                                                                                                                                                                                                                                                                                                          |
| `json/.../getJSONPointer/getJSONPointer.ts`       | (M-7) 루트 반환값 `'/'` → `JSONPointer.Root`(빈 문자열)                                                                                                                                                                                                                                                                                                                                                                                                                |
| `json/.../escape/escapeSegment.ts`                | (M-11) JSDoc 예제 11줄이 전부 `escapePath` 로 적혀 있었다                                                                                                                                                                                                                                                                                                                                                                                                              |
| 신규 테스트                                       | `patch/__tests__/roundTrip.test.ts`(5), `manipulator/__tests__/pointerContract.test.ts`(4), `mergePatch/__tests__/mergePatch.immutable.test.ts`(2)                                                                                                                                                                                                                                                                                                                     |

**fail-first**: 배열 축소 round-trip 2건 `JsonPatchError`, mergePatch 비객체 대상 `TypeError: Cannot create property 'b' on number '5'`, 호출자 배열 변형, 숫자 세그먼트 `TypeError: segment.indexOf is not a function`, 중간 `-` `TypeError`, immutable 미복제.

**기존 단언 갱신 (근거 제시)**: `getJSONPointer.test.ts` 3건이 루트에 `'/'` 를 고정하고 있었다. RFC 6901 에서 전체 문서는 빈 문자열이고 `'/'` 는 빈 문자열 키를 가리키며, 이 패키지의 `JSONPointer.Root` JSDoc 이 그 점을 명시한다. `compare` 의 `toJson` 테스트 3건은 재귀 방식으로 정정해 **무수정 통과**시켰다.

**보류 — 별도 작업으로 남긴 항목**

| 항목                                  | 사유                                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-3 difference 숫자키 누락            | `getArrayBasePath` 가 경로 문자열만 보고 배열 여부를 단정한다. target 실조회로 바꾸려면 최상위 `''` base path 처리까지 얽혀 difference 의 경로 해석 재설계가 필요하다 |
| H-8 JSONPath 방언 불일치              | `getJSONPath`(`$` 접두사·인용) 와 `convertJsonPathToPointer`(둘 다 없음) 중 정본을 정하는 결정이 선행                                                                 |
| M-1 RFC 6902 배열 move/copy           | 삽입이 아닌 덮어쓰기, move 원본 제거가 delete. RFC 정합은 breaking 이고 L-10 과 함께 재검토해야 한다                                                                  |
| M-6 difference 가 constructor 키 유실 | `setValue` 의 `isForbiddenKey` 무음 유실. 보호 정책 통일(L-7)과 묶여야 한다                                                                                           |
| M-8·M-10·M-12·M-13                    | 방언·이름 계약 결정 선행(H-8 과 같은 묶음)                                                                                                                            |

**검증**: json **30 파일 / 556 테스트 통과**, `typecheck`·`lint`·`build` 통과, schema-form 3568 · json-schema 392 통과.

## Phase 4 — 타입 개선

### [x] Task 4.1 / 4.3 — 선언부 타입 정정 (H10, M7, #8, #15, react H3·L10·L12·L15) · 2026-08-17

**반영**

| 파일                                                                     | 변경                                                                                                                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| `common-utils/libs/hasOwnProperty.ts`                                    | **(H10, A급)** `key is keyof typeof value`(=`keyof unknown`=`never`) → `<Type>(value: Type, key: PropertyKey): key is keyof Type`. 12+ 소비처의 가드가 실제로 좁히기 시작한다               |
| `json/.../compareRecursive.ts`                                           | H10 이 표면화시킨 유일한 오류. `hasOwnProperty` 가 실제로 좁히자 서로 무관한 두 제네릭의 값을 비교하던 지점이 드러났다 — 호출부 캐스트가 아니라 값 선언을 `unknown` 으로 정직하게 잡아 해소 |
| `common-utils/utils/filter/isFalsy.ts`                                   | (#8) `Falsy` 에서 `typeof NaN` 제거 — 리터럴이 아니라 `number` 전체라 `Falsy` 가 모든 수를 삼켰고, `[1,0,2].filter(isTruthy)` 가 `never[]` 가 되며 `isFalsy(string                          | number)` 는 unsound 했다 |
| `common-utils/utils/array/at.ts`                                         | (M7) 반환을 `Type \| undefined` / `(Type \| undefined)[]` 로, 제약을 `readonly number[] \| number` 로                                                                                       |
| `common-utils/.../getTrackableHandler/{type,getTrackableHandler}.ts`     | (#15) 동시 실행 차단 시 반환이 `undefined` 이므로 호출 시그니처를 `Promise<Result \| undefined>` 로. `undefined as Result` 캐스트 제거                                                      |
| `react-utils/.../isForwardRefComponent.ts` · `isLazyComponent.ts`        | **(H3)** 신규. `forwardRef`/`lazy` 는 함수가 아니라 객체라 기존 판별이 놓쳤고, `renderComponent` 가 오류 없이 `null` 을 돌려줘 화면에서 조용히 사라졌다                                     |
| `react-utils/.../isReactComponent.ts` · `filter/index.ts`                | 두 판별을 합류시키고 공개                                                                                                                                                                   |
| `react-utils/.../isMemoComponent.ts`                                     | (L12) `Symbol.for` 를 모듈 상수로 승격                                                                                                                                                      |
| `react-utils/.../ErrorBoundary.tsx`                                      | (L10) `fallback                                                                                                                                                                             |                          | FALLBACK`→`!== undefined`—`null` 은 "에러 시 아무것도 렌더하지 않는다" 라는 유효한 의사다 |
| `react-utils/.../withUploader.tsx`                                       | (L15) `src/**` 에서 유일하게 alias 를 쓰던 import 를 상대 경로로 통일                                                                                                                       |
| `react-utils/.../isFunctionComponent.ts` · `remainOnlyReactComponent.ts` | 런타임에서 임의 함수와 컴포넌트 함수를 구별할 수 없다는 사실을 `@remarks` 와 예제에 명시 — 예제가 약속하던 "helper 는 제외된다" 는 지킬 수 없는 주장이었다                                  |
| 신규 테스트                                                              | `isReactComponent.exotic`(4), `withErrorBoundary.fallback`(2), `renderComponent.falsy`(2)                                                                                                   |

**fail-first**: forwardRef/lazy 미인식 `expected false to be true`, forwardRef 가 렌더되지 않음 `expected null not to be null`, `fallback={null}` 이 기본 메시지로 대체 `expected 'An unexpected error has occurred' to be ''`.

**감사 재분류 — react L13 은 버그가 아니다**

감사는 `renderComponent(0)`·`renderComponent('')` 가 `null` 이 되는 것을 falsy 노드 유실로 분류했다. 그러나 기존 `renderComponent.test.tsx` 가 `renderComponent('not a component') === null` 을 계약으로 고정하고 있다 — 이 함수는 **노드가 아니라 컴포넌트/엘리먼트만** 렌더한다. 그 계약에서 `0`·`''` 드롭은 일관된 동작이므로 통과시키려던 수정을 되돌리고, 계약을 명시하는 테스트를 남겼다.

**A급 회귀 검토 결과**: `hasOwnProperty` 변경 후 6개 소비 패키지 `typecheck` 전부 통과(json 1건은 위처럼 선언부에서 해소). 테스트도 전량 통과 — common-utils 1069 · json 556 · react-utils 183 · schema-form 3568 · promise-modal 128 · json-schema 392 · data-loader 48.

## Phase 5 — 문서·공개 표면

### [x] Task 5.1 / 5.2 — JSDoc 정정과 entry point 명시 나열 · 2026-08-17 (codex 위임)

**반영**: 런타임 로직 무변경. 사실과 다른 JSDoc 주장 18개 파일 정정 — `merge`(배열 concat 주장 → index-wise), `isArrayLike`(Strings 열거), `isPlainObject`(조부모 조건·toStringTag 한계), `isPromise`(thenable 자기모순), `counterFactory`("thread-safe"), `combination`·`permutation`·`sum`·`digitSum`·`toBase`(2^53 주장), `clamp`(min>max 미검증), `max`·`min`(NaN 위치 의존), `median`(NaN 정렬 구현 정의), `differenceLite`·`intersectionLite`(NaN 의미론이 `difference` 와 다름), `MessageChannelScheduler`(private 생성자·없는 unload 핸들러), `isEmpty`(새 Map/Set 동작). `json` `escape/constant.ts` 의 죽은 export 2개 제거. 테스트 파일명 `stringifyWithFullSortedKeys.test.ts` → `serializeWithFullSortedKeys.test.ts`.

**공개 표면 명시 나열**: `common-utils/src/index.ts`(13개 `export *`), `common-utils/utils/math/index.ts`, `react-utils/src/index.ts`(6개 `export *`) 를 이름 나열로 교체.

**표면 불변 증명 (요구한 검증)**

| Entry point       | 런타임 전 → 후 | 선언 전 → 후 | 추가/삭제 |
| ----------------- | -------------: | -----------: | --------: |
| common-utils root |      203 → 203 |    213 → 213 |     0 / 0 |
| common-utils math |        25 → 25 |      25 → 25 |     0 / 0 |
| react-utils root  |        32 → 32 |      32 → 32 |     0 / 0 |

정렬 후 집합이 정확히 동일했다. react-utils 는 브리핑의 "30개" 와 달리 실제 표면이 32개였고, 계약 보존을 위해 32개를 모두 명시했다.

### [x] Task 5.3 — 벤치 파일 타입 검사 편입 · 2026-08-17

**⚠ 제 검증 누락으로 만든 결함을 codex 가 발견했다.** Phase 6 에서 추가한 `react-utils/bench/componentResolution.bench.ts` 의 콜백이 값을 반환해 vitest `BenchFunction`(`void | Promise<void>`) 과 어긋났고, **react-utils 의 `typecheck` 와 `build` 가 깨진 채로 커밋됐다.** 벤치 실행(`yarn bench`)만 확인하고 해당 패키지의 `typecheck`/`build` 를 돌리지 않은 것이 원인이다 — react-utils 만 `tsconfig` 에 `bench/**` 를 포함하고 있어 벤치가 타입 검사 대상이었다.

**반영**

| 파일                                                                          | 변경                                                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 세 패키지의 `bench/**/*.ts` 15개                                              | 모든 `bench()` 콜백을 블록 본문으로 바꿔 `void` 를 반환하게 정정                                                         |
| `common-utils/tsconfig.json` · `json/tsconfig.json`                           | `include` 에 `bench/**/*.ts` 추가 — 이 결함이 두 패키지에서는 **타입 검사 사각이라 드러나지 않았다**                     |
| `common-utils/tsconfig.declarations.json` · `json/tsconfig.declarations.json` | react-utils 와 동일하게 `bench/**`·`vitest.bench.config.ts` 를 제외 — 선언 빌드의 `rootDir: src` 밖이라 `TS6059` 가 났다 |

**검증**: 세 패키지 벤치 실제 실행(json 13 · common-utils 37 · react-utils 27 항목), `typecheck`·`build` 전부 통과.

## Phase 6 — 벤치 대상 확충

### [x] Task 6 — 고연산 경로 벤치 추가 · 2026-08-17

**추가한 벤치**

| 파일                                             | 측정                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `common-utils/bench/merge.bench.ts`              | overlay(341 노드) 빈 target vs 채워진 target, flat 200키, 200 요소 배열                                             |
| `common-utils/bench/murmur3.bench.ts`            | 16B/1KB/64KB, 정렬 vs 비정렬(byteOffset 1), 문자열 — DataView 오프셋 수정(#2)의 회귀 기준선                         |
| `common-utils/bench/filterPredicates.bench.ts`   | `isPlainObject`·`isEmpty`·`isArrayLike` 를 입력 종류별로 — schema-form·json 내부 루프에서 필드 수만큼 반복되는 경로 |
| `json/bench/applyPatch.bench.ts`                 | 패치 1/10/100건 × immutable on·off                                                                                  |
| `json/bench/difference.bench.ts`                 | `difference` vs 내부에서 돌리는 `compare`, 배열 포함 문서                                                           |
| `react-utils/bench/componentResolution.bench.ts` | `isReactComponent` 분기별 + `remainOnlyReactComponent` 레지스트리 필터                                              |

**벤치가 드러낸 사실**

- `difference` 2,712 hz vs 같은 입력의 `compare` 17,419 hz — **6.4배**. 감사가 지적한 "compare 후 패치마다 getValue/setValue 를 재실행하는 2단 구조" 의 비용이 정량화됐다.
- `applyPatch` 는 패치 1건 65,311 hz, 100건 12,580 hz — 패치 1건에도 문서 전체 `cloneLite` 비용을 내므로 소량 패치에서 복제가 지배한다(부분 복제 최적화의 기대 이익 근거).
- `isReactComponent` 는 분기 순서대로 24.1M → 22.1M → 19.0M hz 이고, 컴포넌트가 아닌 값은 모든 분기를 통과해 14.7M hz 로 가장 느리다.
- `compare` 무변경 경로 23.0M hz vs 1% 변경 4,301 hz(1000 노드) — 조기 종료가 실제로 4 자릿수 배수를 번다.

**방법론 정정**: `react-utils/bench/perRenderOverhead.bench.ts` 의 describe 제목 "200 renders" 를 실제 규모인 "20 renders x 100 instances" 로 정정했다(`RENDERS=20`, `INSTANCES=100`).

### [x] Task 3.2b — stableEquals omit·내장 객체 (H5, M8, M14) · 2026-08-17

**반영**

| 파일                                                       | 변경                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common-utils/.../countRetainedKeys.ts`                    | 신규 내부 헬퍼. `equals` 에 두었던 `countRetained` 를 `stableEquals` 와 공유하도록 승격(`readonly PropertyKey[]` 로 일반화해 `Reflect.ownKeys` 의 symbol 키도 받는다)                                                                                                                                                                                                                                                                    |
| `common-utils/.../equals.ts`                               | 지역 헬퍼를 위 공유 헬퍼로 교체                                                                                                                                                                                                                                                                                                                                                                                                          |
| `common-utils/.../stableEquals.ts`                         | (M8) 타입 태그 비교 추가 — 종류가 다른 두 객체가 둘 다 own key 0개라 equal 로 판정되던 문제 제거. ArrayBuffer 는 `Uint8Array` 뷰로 감싸 기존 바이트 비교 경로 재사용. `OBJECT_TAG` 가 아니면 `equalsBuiltin` 위임(Date/RegExp 의 기존 `instanceof` 분기를 대체 — 태그 기반이라 cross-realm 도 잡는다). (H5) omit 적용 후 양쪽 키 개수 비교. (M14) visited 부기를 `has`+`get` 반복(최대 6회 조회)에서 `get` 2회 + 필요 시 `set` 으로 축소 |
| `common-utils/.../__tests__/stableEquals.contract.test.ts` | 신규 6 케이스 (기존 파일 43 케이스로 상한 초과)                                                                                                                                                                                                                                                                                                                                                                                          |
| `common-utils/bench/stableEquals.bench.ts`                 | 신규. equal 트리 / 순환 구조 / equals 대조                                                                                                                                                                                                                                                                                                                                                                                               |

**fail-first**: omit 비대칭 `expected false to be true`, Map·ArrayBuffer·이종 내장 객체 3건 `expected true to be false`. 가드 2건(비-omit 비대칭 거부·Date/RegExp 상태 비교)은 수정 전에도 통과.

**⚠ 성능 게이트 — 느려졌고, 그대로 수용한다 (hz)**

| 시나리오            |     전 |     후 |      변화 |
| ------------------- | -----: | -----: | --------: |
| equal 트리(341노드) | 21,656 | 20,645 | **-4.7%** |
| 순환 구조           | 22,375 | 20,775 | **-7.1%** |

원인은 객체 쌍마다 추가된 `getTypeTag` 2회(`Object.prototype.toString.call`)다. M14 의 visited 조회 축소(6→2회 + 필요 시 set)가 일부만 상쇄했다. 0-key 인 경우에만 태그를 확인하도록 늦추면 비용을 되찾을 수 있지만, 프로퍼티가 붙은 Date 처럼 own key 를 가진 내장 객체에서 오탐이 되살아나므로 채택하지 않았다. **소비처가 0인 유틸에서 오탐 제거와 맞바꾼 5~7% 이며, `equals`(소비처 31)는 같은 태그 검사를 넣고도 M11 덕에 오히려 빨라졌다.**

**검증 (실행 결과)**

- `yarn workspace @winglet/common-utils test --run` → **118 파일 / 1040 테스트 통과** (기존 `stableEquals.test.ts` 43 케이스 **무수정** 통과)
- `typecheck` · `lint` · `build` 통과
- 소비 패키지 전량 통과 — json 545 · react-utils 175 · schema-form 3568 · promise-modal 128 · json-schema 392 · data-loader 48

---

## 리뷰 대응 · 2026-08-17

`/seiri:request-review` 로 받은 12건을 이 저장소 기준으로 검증했다. **회귀 주장 4건이 CONFIRMED** 였고, 그중 3건은 내가 이번 작업에서 만든 것이다.

### 확인되어 고친 것

| #   | 지적                                                                                 | 검증 결과                                                                                                                                                                                                                           | 조치                                                                                                |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | `round` 가 지수 표기 입력에서 **반올림하지 않고 원값을 돌려준다**                    | CONFIRMED. 내가 쓴 `` +`${value}e${precision}` `` 가 `Number("1.2e-7e7")` → `NaN` 을 만들어 폴백이 원값을 반환했다. `round(1e-7, 3)` 이 `0` 대신 `1e-7`. 내 테스트 `round(1e300, 20)` 은 같은 NaN 경로를 밟아 **공허하게** 통과했다 | 기존 지수를 접는 `shiftExponent` 로 교체, 테스트 +2                                                 |
| 2   | `equals` 가 **TypedArray 를 더 이상 구조 비교하지 않는다**                           | CONFIRMED. `Object.keys(new Uint8Array([1,2,3]))` 는 `['0','1','2']` 라 이전엔 구조 비교로 통과했다. 비-`OBJECT_TAG` 전량을 `equalsBuiltin` 으로 보내면서 `false` 로 떨어졌고, 커스텀 `Symbol.toStringTag` 객체도 같이 깨졌다       | `equalsBuiltin` 반환을 `boolean \| undefined` 로 — 규칙 없는 태그는 구조 비교로 되돌린다. 테스트 +2 |
| 3   | `applyPatch` 가 **fragment 포인터 `#/a/b` 를 거부한다**                              | CONFIRMED. `compileSegments.ts:21` 이 `#` 을 명시적으로 받고 schema-form 문서가 `'#/properties/user'` 를 쓴다. "compilePointer 가 이미 거른다" 던 내 주석은 사실이 아니었다                                                         | 첫 세그먼트로 `''` 와 `JSONPointer.Fragment` 를 모두 허용, 신규 `applyPatch.pathForms.test.ts`      |
| 4   | `sortWithReference` 정렬 교체가 **`undefined` 순서 계약을 깬다**                     | CONFIRMED. `Array.prototype.sort` 는 `undefined` 를 비교 함수에 넘기지 않고 끝으로 옮긴다                                                                                                                                           | 버킷 구현으로 되돌림(Task 3.4 〔되돌림〕 참조)                                                      |
| 5   | `getTrackableHandler` — `beforeExecute` 가 던지면 `hookRunning` 이 켜진 채 남는다    | CONFIRMED. 이후 모든 publish 가 막힌다                                                                                                                                                                                              | catch 에서 `hookRunning` 복구 + `publish()` 후 rethrow, 테스트 +1                                   |
| 6   | `stableSerialize` — 순회 중 예외가 나면 **오염된 캐시 항목이 남는다**                | CONFIRMED (getter 가 던지는 입력으로 재현)                                                                                                                                                                                          | 순회를 try/catch 로 감싸고 throw 시 `remove(input)`, 신규 `stableSerialize.failure.test.ts`         |
| 7   | `withTimeout` — `fn()` 이 **동기적으로 던지면** abort 리스너가 외부 signal 에 남는다 | CONFIRMED (리스너 누수)                                                                                                                                                                                                             | `fn()` 을 리스너 등록 **전에** 평가, 신규 `withTimeout.syncThrow.test.ts`                           |
| 8   | `isEmpty` 의 `instanceof Map/Set` 은 cross-realm 에서 오판한다                       | 타당. 이 디렉터리의 나머지는 전부 태그 기반이다                                                                                                                                                                                     | `isMap`/`isSet` 로 교체                                                                             |
| 9   | `Falsy` 타입 JSDoc 이 `NaN` 을 멤버로 열거하는데 유니온에는 없다                     | 타당. `isFalsy(value: number)` 안에서 `NaN` 이 `0` 으로 좁혀지는 결과를 설명하는 문장이 없었다                                                                                                                                      | 열거에서 `NaN` 을 빼고 `@remarks` 로 이유와 한계를 명시                                             |

### 기록으로 닫은 것

| #   | 지적                                                                                                   | 판단                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 10  | `getJSONPointer` 루트 반환 `''` 은 **falsy** 라 `if (pointer)` 로 존재를 판정하던 코드가 루트를 놓친다 | 코드 변경은 옳다(RFC 6901). 위험은 **외부 소비자** 에게 있으므로 §릴리스 기록에 breaking + 이행 방법(`!= null`)까지 적어 두었다. 저장소 내 소비처는 0(grep 무결과) |
| 11  | `groupBy`·`transformKeys`·`transformValues` 의 프로토타입 없는 반환은 breaking                         | 동의. 각 `@returns` 에 이미 명시했고, §릴리스 기록에 breaking 으로 올렸다                                                                                          |
| 12  | 느려진 3개 시나리오를 벤치 회귀로 방치하지 말 것                                                       | 동의. 아래 §성능 후속 작업으로 모았다. 사용자가 **별도 작업** 으로 두기로 확정했다                                                                                 |

**검증 (실행 결과, 2026-08-17 최종)**

| 패키지                  |                test | typecheck · lint · build |
| ----------------------- | ------------------: | -----------------------: |
| `@winglet/common-utils` | 127 파일 / **1077** |                     통과 |
| `@winglet/json`         |   31 파일 / **559** |                     통과 |
| `@winglet/react-utils`  |   30 파일 / **183** |                     통과 |
| `@winglet/json-schema`  |   17 파일 / **392** |           typecheck 통과 |
| `@canard/schema-form`   | 204 파일 / **3568** |           typecheck 통과 |
| `@lerx/promise-modal`   |   11 파일 / **128** |           typecheck 통과 |
| `@winglet/data-loader`  |     2 파일 / **48** |           typecheck 통과 |

합계 **422 파일 / 5955 테스트, 실패 0**.

---

## 성능 후속 작업 — 수집본 (별도 작업)

> 사용자 지시: "느려진 함수들을 모두 모아서 리스트업. 속도개선을 위한 작업은 따로 하지". 아래는 **이번 작업에서 실측된 것만** 이다. 숫자는 각 Task 의 성능 게이트 표에서 그대로 옮겼다(hz — 높을수록 빠름).

### A — 이번 작업으로 실제 느려진 것

| 유틸              | 시나리오            |        전 |        후 |       변화 | 원인                              |
| ----------------- | ------------------- | --------: | --------: | ---------: | --------------------------------- |
| `stableSerialize` | omit 있는 반복      | 3,638,113 | 3,183,716 | **-12.5%** | M20 — 매 호출 omit 키 정렬        |
| `stableEquals`    | 순환 구조           |    22,375 |    20,775 |  **-7.1%** | M8 — 객체 쌍마다 `getTypeTag` 2회 |
| `stableEquals`    | equal 트리(341노드) |    21,656 |    20,645 |  **-4.7%** | 동일                              |

셋 다 정확성과 맞바꾼 값이며, `stableEquals` 는 프로덕션 소비처가 0이고 `stableSerialize` 의 무-omit 경로는 오히려 +24.8% 다. **회수 방향**: omit 키 정렬을 호출마다가 아니라 omit 컬렉션 단위로 memo; 태그 조회를 own key 0 인 경우로 늦추되 프로퍼티가 붙은 내장 객체를 놓치지 않는 판별을 함께 마련.

### B — 구조적 낭비 (이번 작업이 만든 것이 아니라, 벤치가 드러낸 것)

| 대상                | 실측                                                  | 낭비의 정체                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `json` `difference` | 2,712 hz vs 같은 입력 `compare` **17,419 hz (6.4배)** | `compare` 로 패치를 만든 뒤 패치마다 `getValue`/`setValue` 를 다시 도는 2단 구조 — 경로 문자열 왕복 + `O(patches × depth)` 재탐색. 차집합 연산 자체의 비용(출력 조립)과 분리 가능한 부분이다 |
| `json` `applyPatch` | 패치 1건 65,311 hz / 100건 12,580 hz                  | 패치 1건에도 문서 전체 `cloneLite` — 소량 패치에서 복제가 지배한다. 부분 복제로 회수 가능                                                                                                    |
| `sortWithReference` | sparse(3/5000) 5,698 hz                               | M12 — reference 길이만큼 빈 배열 선할당. 정렬 교체는 `undefined` 계약을 깨서 되돌렸으므로, 등장한 인덱스만 지연 생성하는 쪽으로 다시 접근해야 한다                                           |

`difference` 6.4배는 **변경 밀도 100%(256 리프 전부 상이)** 조건의 수치다. 밀도가 낮으면 격차는 줄어든다.

### C — 미실측 의심 (측정부터 필요)

- `isReactComponent`: 컴포넌트가 **아닌** 값이 모든 분기를 통과해 14.7M hz 로 가장 느리다(통과 경로는 24.1M/22.1M/19.0M). 레지스트리 필터처럼 비-컴포넌트가 다수인 입력에서는 분기 순서가 비용이다.
- `compare`: 무변경 23.0M hz vs 1% 변경 4,301 hz(1000 노드) — 조기 종료는 이미 4자릿수 배수를 번다. 추가 이득은 변경이 있는 경로에서 찾아야 한다.

### 후속 작업 순서 (제안)

1. B-`difference` 2단 구조 — 격차가 가장 크고 원인이 특정돼 있다
2. B-`applyPatch` 부분 복제 — 소량 패치가 지배적 사용 형태다
3. A-`stableSerialize` omit 정렬 memo — 회수 폭이 명확하다
4. B-`sortWithReference` M12 재접근 — 계약을 지키는 수단이 필요하다
5. A-`stableEquals` 태그 조회 — 소비처 0이라 우선순위 최하

### 계획 확정 · 2026-08-17

위 5건을 **`PLAN.md` Phase 7 (Task 7.1~7.5)** 로 계획 확정. 사용자 방향 확정 2건 — ① difference 는 1단 재귀로 재작성하며 보류 항목 json H-3(숫자키 remove 누락)을 합류 해소(동작 변화), ② applyPatch immutable 기본을 copy-on-write 로 변경("반환값 완전 분리" → "원본 불변 + 구조 공유", breaking). C 항목(isReactComponent·compare)은 측정 선행 필요로 스코프 제외. 상세 설계·게이트는 PLAN.md 가 정본.
