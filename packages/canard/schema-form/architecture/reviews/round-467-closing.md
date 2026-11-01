# 467라운드 닫기 — 상태 어휘와 기준 출력 차이

2026-11-02. #508 병합 기준 212967e0f 위의 승인된 구현과 기록입니다. 성능 창·독립 최종 검토·병합·릴리스는 이 구현 완료와 구분하며 결과 문서에서 판정합니다.

## 편집자 결정

- **467C-01 (최종 이름과 기존 상호작용 계약)**
  - 【추론】 `FieldNodeState.Dirty`→`FieldNodeState.Edited`(bit 1), `ShowError.Dirty`→`ShowError.Edited`(bit 4), `ShowError.DirtyTouched`→`ShowError.EditedTouched`(bit 16), `required`→`isRequired`, `active`→`isActive`, `visible`→`isVisible`, `enabled`→`isPresent`, `readOnly`→`isReadOnly`, `disabled`→`isDisabled`, `misfit`→`isMisfit`로 바꾼다. 노드 boolean은 is 접두사를 쓰고 isRoot는 유지하며 record와 getter는 같은 이름이다. React props·FieldInputHint·schema·controls 키와 재계산 dirty 어휘는 유지하고 옛 이름 별칭은 두지 않는다. `isEdited`는 `!!state[FieldNodeState.Edited]`, `isTouched`는 `!!state[FieldNodeState.Touched]`이다. 사용자 입력만 Edited를 세우고 프로그램 setValue·배열 동사·fill·파생 쓰기·injectTo·unsetValue·trim은 세우지 않는다. 원래 값 복귀로 Edited가 지워지지 않으며 reset·clearSubtreeState·resetInteraction이 초기화한다. detach 뒤 isEdited·isTouched는 마지막 커밋 상태를 유지하고 isDivergent는 isPresent·isActive처럼 현재 출력 기여를 설명하므로 false다. ShowError의 기본 EditedTouched 정책과 비트 값은 유지하며 Submitted나 Divergent 조건을 더하지 않는다. 근거는 원문 29–31·60·76–78이다.
- **467C-02 (기준 출력과 드문 지연 읽기)**
  - 【추론】 `isDivergent`는 현재 폼 출력과 마지막 루트 로드 커밋 출력의 같은 경로 값을 비교한다. 기준은 `loadBaseline` 박스의 최종 루트 출력 참조이고, 첫 로드 전과 detach 뒤에는 false다. 루트 reset·루트 resetSubtree·rebuild·validator 교체는 새 기준을 만들며 자식 reset과 일반 쓰기는 옮기지 않는다. 배열은 위치로 비교하고 hole·숨김 값도 폼 출력 그대로 포함한다. 자식 reset의 원본은 아이템 identity를 따라가므로 배열 재배치나 외부 파생값에 따라 reset 뒤에도 true일 수 있다. `sameValue`는 각 단계의 같은 참조를 건너뛰며 미선언 객체 키 순서에 민감하다. 읽기는 두 경로를 O(depth)로 걷고 현재 값과 기준 값을 `Object.is`로 키 삼아 결과를 메모한다. 쓰기에는 기준 읽기나 비교를 더하지 않고 반복 읽기의 비교 호출은 0이다. 메모는 자기 경로 값만 보유하며 기준은 로드 뒤 교체된 부분을 보유한다. 정착 중 읽기는 `value`·`outputValue`처럼 일시 값을 줄 수 있으나 모든 입력을 키로 삼으므로 커밋 뒤까지 남지 않는다. React는 `UpdateValue`·`UpdatePath`·`UpdateState`에서 다시 읽는다. 커밋 전 던진 로드는 기준을 유지하고 커밋 뒤 보고되는 예산·식·게이트 실패는 degraded 출력을 새 기준으로 삼는다. 근거는 원문 32·60–63이며 최종 getter 철자는 78번을 따른다.
- **467C-03 (VALUE-013의 투명 메모 범위)**
  - 【추론】 VALUE-013은 읽기가 외부 관측값을 바꾸지 않는다는 규칙이며 드문 순수 읽기 결과의 완전한 입력 키 메모를 금지하지 않는다. isDivergent는 현재 출력과 기준의 같은 경로 값 전부를 키로 삼는다. 기존 선례는 inactiveValues의 commit 때 dirty 표시와 lazy 구성, watchValuesMemo의 commitNumber 키, combinedErrors의 identity 키, pointer-segment LRU, WeakMap의 파생 record 층이다. 일반 value의 읽기 재조립을 되살리는 결정은 아니며 정착 중 일시 읽기는 커밋 뒤 키가 달라진다. 근거는 원문 62–63과 S3 조사다.

## 근거와 남은 것

- 소유자 원문은 round-467-owner-answers.md, 최종 계약은 plan/state-vocabulary/design.md, 실행 결과는 verification/state-vocabulary/results.md에 둡니다.
- 기존 기록·보충은 삭제하지 않습니다. 구현 관문과 성능 창·독립 검토·소유자 병합·버전 결정을 구분합니다.
- 다음 라운드 번호는 468이다.
