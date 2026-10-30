# B2-P2 풀 리퀘스트 독립 코드 검토 보고서

- **검토 범위**: `8d9d885bf..3d1efc587`
- **대상 패키지**: `packages/canard/schema-form`
- **대상 브랜치**: `perf/schema-form-b2-p2-host-preparation` → `feat/schema-form-branch-switch`
- **작업 트리**: `/Users/Vincent/Workspace/albatrion/branch-switch-b2-p2`
- **저장소 소유자**: Vincent
- **검토자**: Antigravity (독립 읽기 전용 검토자)

---

## 1. 종합 판정표

| 항목 | 판정 | 근거 (path:line) |
| :--- | :---: | :--- |
| **(1) 범위 및 모듈 계약** | PASS | `dist/index.d.ts` 바이트 동일 및 신규 공개 export 0건. `src/core` 내 `src/app` 임포트 0건. 프랙탈 규칙 준수(`compute/utils/prepareHostWheelPlan.ts:27`, `childSelection/utils/prepareStaticHost.ts:34`, `childSelection/utils/discardStaticHostPreparation.ts:10`, `controls/prepareControlLayers.ts:24` 등 소유 서브트리 내부에서만 소비). 커밋 순서에서 DETAIL(`bbd3b74d7`)이 구현 코드(`8d3bb3755`)보다 앞서며 비용 모델과 무효화 규칙 명시. 모든 주석은 현행 규격만 기술. |
| **(2) 캐시 키 및 무효화 정합성** | PASS | • **바퀴 계획 (`wheelPlan`)**: 라이브 호스트 레코드 키(`derivedRecords.ts:21`). `blueprint`, `path`, `itemCount`, `relocated` 동일성 검증(`prepareHostWheelPlan.ts:34-42`). 재진입 시 새 인스턴스로 분리, relocation 변경 시 `GateRegistry`가 참조 갱신(`getGateRegistry.ts:386,504`). `cap`은 분배 입력 크기>0일 때 재계산(`computeNode.ts:182,263`).<br>• **나감/컨트롤 계층 (`controlLayerIndex`)**: 불변 `BlueprintNode` 키(`prepareControlLayers.ts:27`). 정적 선언만 색인하며 동적 선택 ID(`nodeIds`/`parentIds`) 및 커밋 규칙 값은 호출 시점에 조회(`getControlLayers.ts:70-98`).<br>• **정적 자식 baseline (`preparedStaticHost`)**: 라이브 호스트 키. load, 분배 입력, path 변화, relocated, 실패 시 폐기(`prepareStaticHost.ts:40-50`). reset/배열 재배치/예외 시 `discardStaticHostPreparation` 호출(`finishSettlement.ts:110`, `computeNode.ts:332`). 호스트 수명 중 캐시 stale 발생 불가능. |
| **(3) 정적 자식 준비 (SETTLE-052)** | PASS | 정적 엔트리는 게이트·오버레이·재배치 게이트·동명 후보가 없는 엔트리만 한정(`HostStaticPartition.ts:34-45`, `prepareStaticHost.ts:70-76`). 동명 후보(x/y) 발생 시 정적 엔트리가 비어 즉시 dynamic 폴백(`HostStaticPartition.ts:34`, `prepareStaticHost.ts:74`). 동적 엔트리는 매 정착 고정 baseline에서 원래 순서로 선택(`selectChildren.ts:144-205`, SETTLE-044/GOAL-029). verify 모드에서 독립 witness 검증 및 불일치 시 예외 발생(`prepareStaticHost.ts:63-95`, `settle.host-preparation.test.ts:98-112`). |
| **(4) 나감 정책 및 제어 계층** | PASS | 프래그먼트 소유자 상속 및 `unsetOnInactive` 의미론 완전 보존(`prepareFragmentOwners.ts:15-21`, `prepareParentControlLayers.ts:38-51`, `getControlLayers.ts:72-97`). 선언 순서(`order`) 정렬로 authored 순서 유지. 식/가드가 던져 나간 노드의 나감 비움 미적용 및 커밋 값 보존(ERROR-125) 동작 동일(`settle.error-gate-exits.test.ts:1-26` 전수 통과). |
| **(5) `getLatentOrder` 순서 동치성** | PASS | `getBlueprintChildIndex`를 통해 템플릿별 첫 번째 일치 위치를 O(1) 조회(`getBlueprintChildIndex.ts:23-30`). 중복 엔트리의 첫 번째 edge 보존 및 배열 인덱스 폴백 보존. `push` 후 `reverse()`로 기존 `unshift`와 결과 배열 순서 100% 동일(`getLatentOrder.ts:29-39`, `settle.exit-preparation.test.ts:47-68`). |
| **(6) 테스트 검증 및 단언 불변** | PASS | 신규 테스트 5개 파일 전수 추가(add-only, 기존 시험 단언 수정 0건). 기준 base에서 17건 실패(호출 횟수 상한 및 재방문 방지 검증). lifecycle 테스트가 load/reset/re-entry/배열 재배치/오류 복구 커버(`settle.host-preparation-lifecycle.test.ts:1-105`). E2E(`branch-host-preparation-lifecycle.test.tsx:5-15`)는 공개 인터페이스(`@/schema-form`, `renderForm`)만 임포트. |

---

## 2. 결함 및 개선 권고 사항 (Defects & Rankings)

- **심각도 P0 ~ P3 결함**: **0건 (없음)**
- **권고 사항 (P4 - 사후 모니터링)**:
  - 동명 분기 후보(x/y)를 갖는 호스트의 경우 `HostStaticPartition`이 정적 분할 목록을 비워 안전하게 기존 동적 경로로 후퇴하므로 정합성 결함은 전혀 없으나, 형제 선형항 최적화는 후속 단계(B3)에서 다룰 과제로 남겨짐을 확인했습니다.

---

최종 판정: PASS
