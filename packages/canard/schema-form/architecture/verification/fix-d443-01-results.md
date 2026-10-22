# D443-01 — 문자 그대로 별표인 소유자의 재계산 복구

2026-10-23. 기준 커밋은 `8a1906f00385c525a61881fb94347cc5d985aae3`입니다.

## 원인과 적용 규칙

객체의 속성명 `*`도 소유자 경로에서는 `/*`로 표현됩니다. `expandTemplatePaths`가 경로 조각만 보고 배열 와일드카드로 펼쳐 객체의 `itemCount` 0에서 빈 목록을 반환했습니다. 이 때문에 값·있음·문맥 변경 뒤 `visible`, `readOnly`, `disabled` 소유자가 재계산에서 빠졌습니다. `active`는 게이트 레지스트리의 별도 경로로 처리되어 영향이 없었습니다.

이제 `*` 조각은 `node.blueprintNode.item !== undefined`인 반복 아이템 호스트 아래에서만 펼쳐집니다. 그 밖에서는 문자 그대로의 속성 이름입니다. 게이트로 빠진 마지막 리터럴 위치도 경로를 유지하며 배열 반복 아이템의 색인과 순서는 같습니다. CONTROLS-080 (4)·(5), SETTLE-020·021 및 440C-01의 이름 규칙을 따릅니다.

제품 변경은 조건 한 줄과 JSDoc 한 줄뿐입니다. 공개 진입점의 이름, EVENT 계약, 청사진 수명 및 재사용 정책은 변경하지 않았습니다. 네 호출 경로는 같은 함수를 계속 사용합니다. 의존 등록과 일반 affected 조회, 있음 템플릿 처리, 문맥 소유자 등록에서 기존에 누락된 리터럴 소유자가 다시 포함됩니다.

## 변경 파일

아래 경로는 `packages/canard/schema-form` 기준입니다.

| 파일 | 변경 내용 |
| --- | --- |
| `src/core/engine/settle/DETAIL.md` | 알려진 별표 결함 문장을 현재 규칙으로 교체하고 다른 열린 항목을 보존했습니다. |
| `src/core/engine/settle/utils/templatePaths/expandTemplatePaths.ts` | 반복 아이템 청사진 조건과 JSDoc를 추가했습니다. |
| `src/core/engine/settle/__tests__/expandTemplatePaths.test.ts` | 객체 별표, 게이트로 빠진 별표, 반복 배열 색인의 직접 검사 3건을 추가했습니다. |
| `src/core/engine/settle/__tests__/settle.presence-star-name.test.ts` | 별표 상태 키 8건의 예상 실패 선택을 제거하여 36건을 모두 일반 시험으로 실행합니다. |
| `src/__tests__/fixtures/remountEquivalence/createStarScenes.ts` | 있음 변화 없는 값 쓰기와 `@` 직접 판독 장면을 추가했습니다. |
| `src/core/__tests__/remount-equivalence/targeted.test.ts` | 별표 계열만 일반 시험으로 전환했습니다. |
| `src/__tests__/e2e/remount-equivalence.targeted.test.tsx` | 별표 계열만 일반 시험으로 전환했습니다. |
| `src/core/__tests__/remount-equivalence/corpus.test.ts` | D443-01 전용 family 3·6·7·8·15만 일반 시험으로 전환했습니다. family14는 유지했습니다. |

## 실패 우선 검증과 관문

수정 전 직접·중첩 위치와 값·문맥 경로의 별표 네 장면이 prefix 1에서 불일치했습니다. 갱신 트리의 visible/enabled/readOnly/disabled는 true, 새 마운트는 false였습니다. `*x` 대조군에는 불일치가 없었습니다. 새 value-only 및 direct-context-reader 장면도 같은 실패를 보였습니다.

| 검사 | 결과 |
| --- | --- |
| 수정 전 선택 시험 | 38통과·13실패입니다. 직접 확장 2건, presence 8건, 별표 core/render/react18 각 1건이 실패했습니다. |
| 수정 후 같은 선택 시험 | 51/51 통과이며 presence 36건과 React 19·18 검사가 포함됩니다. |
| corpus 표시 정리 후 | 16가족 모두 통과했습니다. |
| typecheck·lint·build | 각각 종료 0입니다. 빌드는 개발 플래그·게이트 표 출하 설정·타입 선언·해시 검사도 포함합니다. |
| 전체 기본 최종 JSON | 총 5,285건 중 5,284통과·0실패·기존 todo1이며 success=true입니다. 1,577 suite와 스냅샷 71건이 모두 통과했습니다. |
| 전체 기본 실제 종료 | CLI exit 1, 추가 stderr 없음입니다. 조정자는 425C-02의 알려진 Chromium 종료 양상으로 분류하고 추가 실행 없이 이 차이를 명시하도록 지시했습니다. |
| 전체 verify | 총 4,323건 중 4,322통과·0실패·기존 todo1, 종료 0입니다. |
| Node·Bun 관찰 동일성 | 각각 58 ID × 3 lane = 174장면, 차이 0입니다. 수정 전 기준 dist와 수정 뒤 dist를 사용했습니다. |
| 조건 제거 변이 | 새 리터럴 직접 확장 2건과 별표 core 1건이 실패했습니다. 조건 복원 뒤 같은 7건이 통과하고 작업 트리도 원래 상태로 돌아왔습니다. |
| 경로 규칙 | 각 커밋 전 지정 HEAD grep에서 기존 일치 11행 외 새 일치가 0행입니다. |

첫 전체 기본 실행은 5,275통과·9실패·todo1, 종료 1이었습니다. 다섯 실패는 정상화된 별표 corpus의 `it.fails` 역실패여서 조정자 승인으로 후속 테스트 커밋에서 정리했습니다. 나머지 네 실패는 Storybook의 cx04 amount-input, cx11 ime-during-switch, browser-gates의 EVENT-065 IME 및 REACT-027 number badInput입니다. 425C-02에 따라 해당 세 파일을 무변경 단독 재실행하여 6/6 통과를 확인했습니다. 이후 전체 기본 재실행의 시험 실패는 0건입니다.

원본은 작업 네임스페이스의 `gates/`에 `before-targeted-ready.json`, `tests-red.json`, `tests-green.json`, `default.json`, `default-final.json`, `storybook-recheck.json`, `verify.json`, `equivalence.json`, `mutation.json`, `mutation-restored.json`으로 보존했습니다. 빌드 산출물은 추적 대상이 아니며 소스 커밋에 포함하지 않았습니다. FCA 검사와 독립 검토는 조정자가 수행합니다.

## 남은 remount 불일치

아래 항목은 다른 finding의 `it.fails`에서 관찰 불일치로 보존됩니다. 최종 시험 실패 0건이 이 항목들의 해결을 뜻하지는 않습니다.

| 장면 | 접두사 | 남은 finding |
| --- | --- | --- |
| `gap-overlay-empty` | 1 | D443-02, C443-01 |
| `gap-overlay-trailing` | 0·1·2 | D443-04, C443-02 |
| `gap-overlay-type` | 1 | D443-05 및 D443-02의 overlay 판독 누락 |
| `control-overlay-same-host` | 1 | C443-01 |
| `gap-relocated-cousin-value-shallow` | 2 | D443-03 |
| `gap-relocated-cousin-value-deep` | 2 | D443-03 |
| `corpus-443-f14-v0`부터 `v7`까지 | 1 | D443-02, C443-01; 기본 128장면 코퍼스 |
| `corpus-443-f14-v0`부터 `v63`까지 | 1 | D443-02, C443-01; verify 1,024장면 코퍼스 |
| 렌더 corpus(`remount-equivalence.corpus.test.tsx`) family 14 `~` 이름 장면 | 1 | D443-02, C443-01; 화면 어댑터 재생, 기본 128장면·verify 1,024장면 |

targeted의 overlay 6건과 relocated 2건은 수정 전 기록과 수정 후 단위 시험의 metadata.remount 전체가 정확히 같습니다. 별표 여섯 장면은 불일치 0건이며 ancestor도 0건입니다. 후보 finding의 판정은 변경하지 않았습니다.

## 비용과 후속 과제

`getDependencyIndex.ts`의 `add()` 537–549행이 소유자 `/*`를 호스트로 접는 동작은 남습니다. 따라서 직접 `/*` 소유자는 수정 뒤에도 매 쓰기에서 재계산됩니다. 정확성을 복구하는 데 필요한 확장 규칙만 바꾸었으며 이 비용의 정리는 후속 과제입니다. 별도 성능 측정은 이번 PR의 요구가 아니므로 실행하지 않았습니다.
