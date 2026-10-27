# B2-P1b 독립 코드 검토 보고서 (Part 1: Code, Equivalence, Tests)

- **검토 커밋 범위**: `4f2001dcd..a04a40588`
- **대상 패키지**: `packages/canard/schema-form`
- **작업 브랜치**: `perf/schema-form-b2-p1b-lazy-inactive`
- **작업 트리**: `/Users/Vincent/Workspace/albatrion/branch-switch-b2-p1`
- **저장소 소유자**: Vincent
- **검토자**: Antigravity (독립 읽기 전용 검토자)

---

## 1. 종합 판정표

| 항목 | 판정(PASS/FAIL/주의) | 근거(path:line) |
| :--- | :---: | :--- |
| **1.1 공개 표면 불변** | PASS | `git diff 4f2001dcd..a04a40588 -- packages/canard/schema-form/src/public/` 및 `src/index.ts` 결과 변경 없음 (0 lines changed). `dist/index.d.ts` 빌드 결과 SHA256 불변 검증 완료 (`/private/tmp/b2-p1b-20261027/dts-diff.json`: `identical: true`, `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6`). 배달 전후 비교(`run-c-differential.mjs` 72개 장면/323개 단계, `run-h5-public.mjs` 6개 장면/12개 단계) 차분 0건 확인 (`/private/tmp/b2-p1b-20261027/delivery.log:1-5`). |
| **1.2 시험 단언 보존 (증분 전용)** | PASS | `git diff 4f2001dcd..a04a40588 --stat -- '*.test.*'` 결과 신규 시험 3건(`settle.inactive-lazy-cost.test.ts` +57, `settle.inactive-lazy-fallback.test.ts` +104, `settle.inactive-lazy-generations.test.ts` +136), 픽스처 1건(`createInactiveLazyTree.ts` +27), 그림자 검증 설정(`setupDeriveShadowEvaluation.ts` +13)만 추가됨. 기존 시험 파일의 단언 수정 및 삭제 0건 (`grep '^-'` 검증 완료). #475 계약 시험(`settle.inactive-memo-contract.test.ts`) 변경 없이 그대로 유지됨. |
| **1.3 계층 및 프랙탈 임포트 규칙** | PASS | `src/app` 임포트 전무. `record/types/runtime.ts:83`에서 정착 구현을 직접 참조하지 않고 `inactiveValuesState?: unknown;`으로 불투명하게 선언하여 의존성 역전 방지. `settle/` 내부 서브모듈 간 임포트는 프랙탈 규칙 준수. `utils/`는 상위/독립 organ으로 settle 내부를 임포트하지 않음. |
| **1.4 DETAIL 선행 커밋 및 비용 모델/그림자 모드 명시** | PASS | 커밋 순서 검증 완료: `968052831`(record/DETAIL.md:64, settle/DETAIL.md:68-75) 및 `976c02e32`(engine/DETAIL.md:83) 문서 커밋이 구현 커밋 `a04a40588`보다 엄격히 선행. 쓰기 $O(\|\Delta\|)$ 표식 + 저널 + 상각 압축, 첫 읽기 $O(K \log K) + \text{미소비 }\Delta$, detached 토큰 직전 커밋 불변 세대 캡처 및 지연 getter, 저널 상한 $\max(2\cdot L, 512)$, `engineModes.inactiveValues === 'verify'` 그림자 비교 명시됨 (`settle/DETAIL.md:68-75`). |
| **2.1 살아 있는 호스트 N회 미읽기 전환 후 동치성 및 참조 안정성** | PASS | `InactiveValuesState.ts:131-158` (`read`), `176-209` (`readGeneration`), `readInactiveProjection.ts:16-44`, `replayInactiveGeneration.ts:14-45`, `reconcileInactivePath.ts:19-76`에서 불변 세대 체인을 재생하여 전체 재구성 오라클과 동일한 엔트리, 문서 순서(`compareInactiveOrder.ts`), 값, 동결 배열(`Object.isFrozen`) 생성. 동일 호스트에 대한 연속 읽기는 `this.hosts` 및 `this.values`를 통해 동일 참조 유지. N회 미읽기 후 읽기와 매 쓰기 후 읽기의 동치성 검증 완료 (`settle.inactive-lazy-generations.test.ts:14-27`). |
| **2.2 무관 호스트 참조 불변성 (Untouched Host Identity)** | PASS | `InactiveValuesState.ts:132-151`에서 `!this.dirty.has(node)` 및 `!hasInactiveRangeChanges(this.generation, node.path)` 판정을 통해 무관 호스트에 대해 신규 배열 생성이나 순회 없이 직전 캐시 참조 `held.values` 즉시 반환. 검증 완료 (`settle.inactive-lazy-generations.test.ts:69-97`의 `quiet.inactiveValues === untouched`). |
| **2.3 Detached 참조의 직전 커밋 시점 지연 평가 및 압축 독립성** | PASS | `captureDetachedFieldNodeReads.ts:26-36`에서 이탈 시점에 `InactiveValuesState.capture(node.path)`로 당시 불변 세대 토큰을 캡처하고 지연 getter(`get inactiveValues()`)로 반환하여 쓰기 시점 배열 할당 방지. 이후 180회 이상의 분기 전환 및 저널 압축이 발생하더라도 캡처된 불변 세대 객체는 보존되어 detach 당시의 동결 배열 정확히 반환 (`settle.inactive-lazy-generations.test.ts:38-67`, `99-136`). |
| **2.4 라이브 호스트와 Detached 토큰 간 동일 세대 참조 공유** | PASS | `InactiveValuesState.ts:177-184`에서 `generation.readVersions.get(path)`와 `this.values.get(version)`을 통해 라이브 호스트와 detached 토큰이 동일 세대/동일 경로를 읽을 때 동일한 동결 배열 참조를 공유함 (`settle.inactive-lazy-generations.test.ts:69-97`의 `group.inactiveValues === held`). |
| **2.5 Fallback (load, reset, rebuild, array rearrangement, pruneLatentRaw, perished paths)** | PASS | `updateInactiveValuesMemo.ts:29-48`에서 `load`(`context.kind === 'load'`), `resetSubtree`, `rebuild`, 배열 재배치/비움(`clearArrayRuntimePaths.ts:91,95,104`, `rekeyArrayRuntimePaths.ts:103`), 실제 잠복 정리(`pruneLatentRaw.ts:29,55`), 소멸 경로(`prunePerishedPaths.ts:36,47`) 시 `inactiveValuesRebuild = true`에 따라 독립 오라클 `rebuildInactiveValuesMemo`로 완전 폴백하고 `state.reset()` 수행. `captureInactiveBase.ts:37-41`로 이전 배열 참조 승계. 검증 완료 (`settle.inactive-lazy-fallback.test.ts:5-72`). |
| **2.6 특수 엣지 케이스 동치성** | PASS | ① 동일 경로 상이 종류: `reconcileInactivePath.ts:29-52`에서 `view.sources.pathIndex.at(path)` 순회 및 `compareInactiveOrder`로 우선순위 선정.<br>② `unsetOnInactive` 이탈: `reconcileInactivePath.ts:34-44`에서 정리된 원본 배제 (`settle.inactive-lazy-fallback.test.ts:74-104`).<br>③ 재진입 후 재이탈: `settle.inactive-lazy-generations.test.ts:29-36`에서 엔트리 객체 재생성 및 신규 identity 반영 검증.<br>④ 호스트 자체 이탈: `settle.inactive-lazy-generations.test.ts:38-67` 검증.<br>⑤ 메타데이터 전용 변경: `setLatentRaw.ts:47`에서 `inactiveValueChanges` 추적으로 누락 방지. |
| **2.7 내부 소비처 전수 지연 경로 전환 또는 쓰기 시점 불필요 증명** | PASS | `settle/DETAIL.md:63-64`에 명시: 배달 마커/페이로드, `FormHandle.getValue`(`outputValue`), hydration snapshot, React 훅(`useFieldNode`, `useWatch`)은 쓰기 시점에 `inactiveValues` 배열을 소비하지 않음. 공개 getter 및 `LazyInactiveMap.ts:5-58`을 통해 `runtime.inactiveValuesMemo`의 `get`/`has`/iteration 조회 시 지연 materialization 수행. `getRuntimePathStores.ts:13-14`에서 일괄 경로 처리 전 `publishAll()`을 호출하여 네이티브 맵 정합성 보장. |
| **3.1 저널 상한 상수 및 커밋 시점 압축 트리거** | PASS | `InactiveValuesState.ts:23-25, 115-122`에 `JOURNAL_SOURCE_MULTIPLIER = 2`, `MINIMUM_JOURNAL_ITEMS = 512` 상수가 정의 및 문서화되어 있으며, `this.journalSize > Math.max(2 * latentRaw.size, 512)` 초과 시 커밋 단계에서 `this.compress()` 트리거. |
| **3.2 상각 비용 및 메모리 유계성 (Bounded Journal)** | PASS | 압축 비용은 $O(L \cdot \text{depth} + D)$이며 최소 $\max(2L, 512)$개 사실이 누적된 후 1회 실행되므로 쓰기당 상각 비용 $O(1)$ 성립. 미읽기 저널 체인은 주기적으로 단일 `base` 세대로 평탄화되므로 미읽기 쓰기 횟수 $N$에 따른 메모리 무한 증가가 원천 차단됨. |
| **3.3 토큰 누수 방지 (엔진 내부 강참조 차단)** | PASS | `captureDetachedFieldNodeReads.ts:42-45`에서 detached 토큰은 `runtime.detachedReads` (`WeakMap<object, ...>`)에만 보관되어 외부 사용자가 이탈 노드 참조를 해제하면 세대 데이터도 정상 GC됨. `InactiveValuesState` 내부는 `WeakMap`/`WeakSet`으로 라이브 노드를 추적하여 엔진 내부 누수 없음. |
| **3.4 압축 시 기존 Detached 토큰 불변성** | PASS | `InactiveValuesState.ts:292-305`의 `compress()`는 `this.generation`만 신규 세대로 교체하고, 기존에 생성된 detached 토큰이 참조하는 과거 `InactiveGeneration` 객체 트리는 변경하지 않음 (`settle.inactive-lazy-generations.test.ts:99-136` 검증). |
| **3.5 옛 토큰 보존 시 메모리 영향 명시** | PASS | 외부 사용자가 여러 압축 경계를 걸쳐 구 세대 토큰을 장기 보유하는 경우, 각 기준 세대의 $\sum L_b$ 및 고유 $\Delta$가 외부 참조에 의해 유지될 수 있음을 `record/DETAIL.md:64`, `settle/DETAIL.md:71` 및 ADR에 명시함. |
| **4.1 그림자 검증 오라클 독립성** | PASS | `captureInactiveOracle.ts:9-25` 및 `verifyInactiveValuesMemo.ts:18-64`에서 `rebuildInactiveValuesMemo` 오라클은 `oracle.latentRaw`와 `oracle.latentRawMetadata`만을 기반으로 처음부터 전체 재구성하며, `InactiveValuesState`나 증분 저널 자료구조를 일절 참조하지 않음. |
| **4.2 읽기 및 커밋 단위 전수 그림자 검증** | PASS | `engineModes.inactiveValues === 'verify'` 시: ① 매 커밋 후 `updateInactiveValuesMemo.ts:57`에서 전체 폼 재구성 오라클과 1:1 비교(배열, 길이, 동결, 엔트리 순서/값, 미변경 호스트 동일성), ② 매 읽기 시 `InactiveValuesState.ts:143, 180, 203`에서 `verifyInactiveRead.ts:22-81`을 통해 해당 세대의 재구성 오라클과 1:1 비교 수행. |
| **4.3 검증 번들(test:verify) 무위반 통과** | PASS | `setupDeriveShadowEvaluation.ts:13, 33-41`을 통해 전역 활성화. 검증 스위트 실행 결과 424개 파일, 17,860회 커밋 비교, 327,929회 읽기 비교에서 위반 0건 확인 (`/private/tmp/b2-p1b-20261027/verify.log`). |
| **5.1 시작 빌드 실패 단언 (Fail-First / Red-Green)** | PASS | 시작 빌드(`4f2001dcd`)에서 신규 시험 실행 시: ① `settle.inactive-lazy-cost.test.ts:47-49`의 8/80/256 브랜치 무관 항목 순회 및 배열 동결 할당 실패(각 6/78/254건 발생), ② `settle.inactive-lazy-generations.test.ts:62`의 이탈 시점 `/group` 즉시 읽기 차단 단언 실패, ③ `settle.inactive-lazy-generations.test.ts:132`의 상태/압축 단언 실패 확인 (`/private/tmp/b2-p1b-20261027/red.log:1-127`). HEAD(`a04a40588`)에서 모두 통과. |
| **5.2 핵심 계약 시험 망라성** | PASS | ① 무관 항목 find/sort 및 배열 할당 0건 검증 (`settle.inactive-lazy-cost.test.ts:15-57`), ② 지연 detached 캡처 (`settle.inactive-lazy-generations.test.ts:38-67`), ③ 참조 동일성 및 무관 호스트 불변 (`settle.inactive-lazy-generations.test.ts:69-97`), ④ Fallback 전체 경로 (`settle.inactive-lazy-fallback.test.ts:5-72`), ⑤ 저널 압축 및 구 토큰 보존 (`settle.inactive-lazy-generations.test.ts:99-136`), ⑥ N회 미읽기 후 읽기 동치성 (`settle.inactive-lazy-generations.test.ts:14-27`). |
| **6.1 할당 규율 (Allocation Discipline)** | PASS | 쓰기 시점에는 새 공개 동결 배열 할당 전무(dirty 표식과 journal node만 생성). 읽기 시점에 호스트 단위로만 1회 동결 배열 생성 및 `WeakMap` 캐싱. 무관 호스트는 identity 체크로 할당 0. 페어 키 재사용 및 슬라이스 기반 호스트 탐색으로 경로 문자열 생성 최소화. |
| **6.2 주석 및 커밋 규율** | PASS | 주석에 과거 시제, 폐기된 가설 언급, 세션 ID 전무. 오직 현재 명세 및 불변식만 기술. 커밋 작성자 및 메시지에 공동 저자나 세션 식별자 없음. |

---

## 2. 결함 및 개선 권고사항 (Defects Ranked by Severity)

본 검토 범위(`4f2001dcd..a04a40588`) 내에서 공개 계약 위반, 동치성 훼손, 메모리 무한 누수, 오라클 독립성 결함은 **0건**입니다.

- **심각도 상 (Critical/High)**: 해당 없음 (0건)
- **심각도 중 (Medium)**: 해당 없음 (0건)
- **심각도 하 (Low / 권고)**:
  - `packages/canard/schema-form/src/core/engine/settle/utils/inactiveValues/InactiveValuesState.ts:257, 43`:
    호스트 경로의 조상 추출 루프에서 `ancestor.slice(0, ancestor.lastIndexOf('/'))`를 직접 사용하고 있습니다. 이는 스키마 폼 내부의 JSON Pointer 구분자 표기와 완벽히 일치하지만, 프로젝트 내 표준 상수(`$.Separator` 등)를 참조하도록 통일하면 추후 구분자 리팩토링 시 응집도를 더욱 높일 수 있습니다. (현재 기능 및 동치성에는 영향 없음)

---

최종 판정: PASS
