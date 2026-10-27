# B2-P1 독립 코드 검토 보고서 (Part 1: Code, Equivalence, Tests)

- **검토 커밋 범위**: `a8e61d155..91acbdb77`
- **대상 패키지**: `packages/canard/schema-form`
- **작업 브랜치**: `perf/schema-form-b2-p1-inactive-memo`
- **저장소 소유자**: Vincent
- **검토자**: Antigravity (독립 읽기 전용 검토자)

---

## 1. 종합 판정표

| 항목 | 판정(PASS/FAIL/주의) | 근거(path:line) |
| :--- | :---: | :--- |
| **1.1 공개 표면 불변** | PASS | `packages/canard/schema-form/src/index.ts`, `packages/canard/schema-form/dist/index.d.ts`, `packages/canard/schema-form/src/__tests__/publicSurface.test.ts`에 대한 `git diff a8e61d155..91acbdb77` 결과 변경 없음 (0 lines changed). |
| **1.2 시험 단언 보존 (증분 전용)** | PASS | `git diff a8e61d155..91acbdb77 --stat -- '*.test.*'` 결과 신규 파일 2개(`settle.inactive-memo-delta.test.ts` +142, `settle.inactive-memo-shadow.test.ts` +139) 및 `setupDeriveShadowEvaluation.ts` (+14)만 추가되었으며, 기존 단언의 수정/삭제 라인 0건 (`grep '^-'` 검증 완료). |
| **1.3 계층 및 프랙탈 임포트 규칙** | PASS | `src/app` 임포트 없음. 신규 파일들(`updateInactiveHostLists.ts:1-6`, `updateInactiveValueEntries.ts:1-6`, `rebuildInactiveValuesMemo.ts:1-11`, `getLatentChildOrder.ts:1-3` 등)은 상위 프랙탈 및 동일 장기(organ) 직속 파일만 참조하며 하향/측면 프랙탈 경계 위반 없음. |
| **1.4 DETAIL 선행 커밋 및 비용 모델/그림자 모드 명시** | PASS | 커밋 순서에서 `16930a6f8`(DETAIL 문서)이 `91acbdb77`(코드 구현)보다 선행. `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:5-7`, `record/DETAIL.md:5`, `engine/DETAIL.md:5`, `arrangeFieldNodeItems/DETAIL.md:5`에 증분 비용 $O(\|\Delta\| \cdot \text{depth})$, 영향 호스트 정착당 1회 복사(루트 $O(L)$ 복사 포함), fallback 조건(load, reset, rebuild, pruneLatentRaw, 소멸, 배열 재배치)의 $O(L \cdot \text{depth} + L \log L)$ 비용, shadow verify 모드 명시됨. |
| **2.1 증분 추가(이탈) 및 제거(진입) 동치성** | PASS | 이탈 시 `captureExitedRaw.ts:63`에서 `getLatentChildOrder`로 순서 계산 후 `setLatentRaw.ts:47`에서 `inactiveValueChanges` 기록. 진입/부활 시 `updateInactiveValuesMemo.ts:59-61`에서 경로 수집 후 `updateInactiveValueEntries.ts:24`의 `find(root, path)`를 통해 실시간 생존 노드를 비활성 목록에서 제거. 전체 재구성과 동일 결과 보장. |
| **2.2 Fallback 경로 완전성** | PASS | `updateInactiveValuesMemo.ts:22-30`에서 `load`(`context.kind === 'load'`), `reset`(`latentRawDirty` 및 비어있는 변경셋), `rebuild`(`!inactiveValueOrders` 또는 `has('')` 없음), 일괄 가지치기/재배치(`pruneLatentRaw.ts:23`, `clearArrayRuntimePaths.ts:44`, `rekeyArrayRuntimePaths.ts:31`, `prunePerishedPaths.ts:19`에서 `inactiveValuesRebuild = true`) 시 독립 오라클 `rebuildInactiveValuesMemo`로 완전 폴백. |
| **2.3 특수 엣지 케이스 동치성 및 테스트 범위** | PASS | ① 중첩 호스트/배열 아이템 순서: `compareInactiveOrder.ts:9-27`로 사전식 순서 및 경로 타이 브레이커 완벽 일치 (`settle.inactive-memo-shadow.test.ts:18, 46` 검증).<br>② 동일 경로-상이 종류: `readInactiveCandidate.ts:21-38`의 `pathIndex.at(path)` 순회 및 최우선 순서 선택 (`settle.inactive-memo-shadow.test.ts:77` 검증).<br>③ `unsetOnInactive` 이탈: `setLatentRaw.ts:44-55` 및 `updateInactiveValuesMemo.ts:74-75`에서 미존재 메타데이터 정리 (`settle.inactive-memo-delta.test.ts:114`, `shadow.test.ts:77` 검증).<br>④ 재진입 후 재이탈: 진입 시 제거 후 재이탈 시 위치 재삽입 (`settle.inactive-memo-shadow.test.ts:18` 검증).<br>⑤ 호스트 자체 이탈: `context.exited`의 `visitFieldNodes` 순회 및 기존 비활성 자손의 호스트/루트 목록 불변성 유지 (`settle.inactive-memo-shadow.test.ts:18` 검증).<br>⑥ 원본 없는 메타데이터 변경: `setLatentRaw.ts:47`에서 `template && order` 변경 시 무조건 `inactiveValueChanges` 등록으로 추적. |
| **3.1 그림자 검증 오라클 독립성** | PASS | `engineModes.ts:8-14`의 `inactiveValues: 'verify'` 모드 도입. `updateInactiveValuesMemo.ts:34-51`에서 증분 실행 전 스냅샷을 분리 보관하고, `verifyInactiveValuesMemo.ts:17`에서 `rebuildInactiveValuesMemo` 오라클을 완전히 독립 실행하여 크기, 호스트별 목록, 순서, `Object.is` 값 동등성, freeze 상태, 변경/미변경 호스트 참조 유지 여부를 1:1 비교. |
| **3.2 검증 번들 전역 실행** | PASS | `setupDeriveShadowEvaluation.ts:17`에서 `engineModes.setMode('inactiveValues', 'verify')` 활성화 및 `afterAll` 단언(`expect(inactive.violations).toBe(0)`) 추가. `test:verify` 번들에서 435개 파일, 27,535회 비교 동안 위반 0건 확인 (`shadow-summary.json`). |
| **4.1 시작 빌드 실패 단언 (Fail-First / Red-Green)** | PASS | `/private/tmp/b2-p1-20261027/red.log`에서 `settle.inactive-memo-delta.test.ts:52-78`의 무관 잠복 엔트리(8개, 256개) 대상 `navigation.find` 호출 횟수가 기존 구현에서 각각 8회, 256회 발생하여 `expect(unrelated).toHaveLength(0)` 단언으로 실패했음이 확인됨. |
| **4.2 미변경 호스트 참조 동일성 보존 검증** | PASS | `settle.inactive-memo-delta.test.ts:79-96`에서 `/quiet` 호스트 목록 참조 동일성(`expect(memo.get('/quiet')).toBe(quiet)`) 및 무관 항목 객체 동일성 유지 검증 완료. `verifyInactiveValuesMemo.ts:30`에서도 오라클과 동일한 호스트 참조 보존 여부 검증. |
| **4.3 폴백 케이스 검증** | PASS | `settle.inactive-memo-shadow.test.ts:46-75`(배열 remove, clear), `settle.inactive-memo-shadow.test.ts:110-138`(load, resetSubtree, rebuilt tree)에서 폴백 정상 동작 및 상태 격리 검증 완료. |
| **5.1 할당 규율 (경로 문자열 및 페어 키 재사용)** | PASS | 엔트리별 신규 경로 문자열 생성 없이 이탈 시 이미 생성된 pair key 재사용 (`setLatentRaw.ts:47`). exact path 조회는 `pathIndex.at(path)` 인덱스 활용. 호스트 조상 순회는 `/` 슬라이스만 수행. |
| **5.2 배열 복사 상한 준수** | PASS | `updateInactiveHostLists.ts:20-27`에서 `lists.get(host)`를 통해 영향받는 호스트당 `slice()`를 정착당 최대 1회만 수행. `settle.inactive-memo-delta.test.ts:98-105`에서 루트 복사 1회 및 미영향 호스트 복사 0회 검증 완료. 삭제된 항목은 `orders.delete(previous.entry)`로 약한 순서 참조 즉시 해제. |
| **6.1 주석 규율** | PASS | `git diff`의 모든 추가 주석에서 과거 시제("previously", "used to", 날짜 표기, 이전 커밋 언급) 전무. 오직 현재의 명세와 동작 계약만 기술 (`updateInactiveValuesMemo.ts:1-7`, `compareInactiveOrder.ts:1-8`, `updateInactiveHostLists.ts:1-6` 등). |

---

## 2. 결함 및 개선 권고사항 (Defects Ranked by Severity)

본 검토 범위(`a8e61d155..91acbdb77`) 내에서 기능적 불일치, 회귀, 공개 계약 위반, 오라클 독립성 훼손을 초래하는 결함은 **0건**입니다.

- **심각도 상 (Critical/High)**: 해당 없음 (0건)
- **심각도 중 (Medium)**: 해당 없음 (0건)
- **심각도 하 (Low / 권고)**:
  - `packages/canard/schema-form/src/core/engine/settle/utils/commit/utils/inactiveValues/updateInactiveHostLists.ts:28, 48`:
    호스트 경로 추출 시 `host.slice(0, host.lastIndexOf('/'))`를 직접 사용하고 있습니다. 현재 JSON Pointer 구분자(`$Separator = '/'`)와 일치하며 다른 settle 유틸리티와 통일되어 있어 동작상 차이는 없으나, 일관성을 위해 상속/선언된 상수를 가져와 사용하는 방안을 향후 코드베이스 정리 시 고려할 수 있습니다. (현재 동작 및 동치성에는 영향 없음)

---

최종 판정: PASS
