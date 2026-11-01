# 상태 어휘와 출력 차이

## 최종 상태 어휘 — NODE-067

`FieldNodeState.Dirty`→`FieldNodeState.Edited`(bit 1), `ShowError.Dirty`→`ShowError.Edited`(bit 4), `ShowError.DirtyTouched`→`ShowError.EditedTouched`(bit 16), `required`→`isRequired`, `active`→`isActive`, `visible`→`isVisible`, `enabled`→`isPresent`, `readOnly`→`isReadOnly`, `disabled`→`isDisabled`, `misfit`→`isMisfit`로 바꾼다 (NODE-067).
노드 boolean은 is 접두사를 쓰고 isRoot는 유지하며 record와 getter는 같은 이름이다 (NODE-067).
React props·FieldInputHint·schema·controls 키와 재계산 dirty 어휘는 유지하고 옛 이름 별칭은 두지 않는다 (NODE-067).
`isEdited`는 `!!state[FieldNodeState.Edited]`, `isTouched`는 `!!state[FieldNodeState.Touched]`이다 (NODE-067).
사용자 입력만 Edited를 세우고 프로그램 setValue·배열 동사·fill·파생 쓰기·injectTo·unsetValue·trim은 세우지 않는다 (NODE-067).
원래 값 복귀로 Edited가 지워지지 않으며 reset·clearSubtreeState·resetInteraction이 초기화한다 (NODE-067).
detach 뒤 isEdited·isTouched는 마지막 커밋 상태를 유지하고 isDivergent는 isPresent·isActive처럼 현재 출력 기여를 설명하므로 false다 (NODE-067).
ShowError의 기본 EditedTouched 정책과 비트 값은 유지하며 Submitted나 Divergent 조건을 더하지 않는다 (NODE-067).
근거는 원문 29–31·60·76–78이다 (NODE-067).

## 기준 출력 차이 — VALUE-044

`isDivergent`는 현재 폼 출력과 마지막 루트 로드 커밋 출력의 같은 경로 값을 비교한다 (VALUE-044).
기준은 `loadBaseline` 박스의 최종 루트 출력 참조이고, 첫 로드 전과 detach 뒤에는 false다 (VALUE-044).
루트 reset·루트 resetSubtree·rebuild·validator 교체는 새 기준을 만들며 자식 reset과 일반 쓰기는 옮기지 않는다 (VALUE-044).
배열은 위치로 비교하고 hole·숨김 값도 폼 출력 그대로 포함한다 (VALUE-044).
자식 reset의 원본은 아이템 identity를 따라가므로 배열 재배치나 외부 파생값에 따라 reset 뒤에도 true일 수 있다 (VALUE-044).
`sameValue`는 각 단계의 같은 참조를 건너뛰며 미선언 객체 키 순서에 민감하다 (VALUE-044).
읽기는 두 경로를 O(depth)로 걷고 현재 값과 기준 값을 `Object.is`로 키 삼아 결과를 메모한다 (VALUE-044).
쓰기에는 기준 읽기나 비교를 더하지 않고 반복 읽기의 비교 호출은 0이다 (VALUE-044).
메모는 자기 경로 값만 보유하며 기준은 로드 뒤 교체된 부분을 보유한다 (VALUE-044).
정착 중 읽기는 `value`·`outputValue`처럼 일시 값을 줄 수 있으나 모든 입력을 키로 삼으므로 커밋 뒤까지 남지 않는다 (VALUE-044).
React는 `UpdateValue`·`UpdatePath`·`UpdateState`에서 다시 읽는다 (VALUE-044).
커밋 전 던진 로드는 기준을 유지하고 커밋 뒤 보고되는 예산·식·게이트 실패는 degraded 출력을 새 기준으로 삼는다 (VALUE-044).
근거는 원문 32·60–63이며 최종 getter 철자는 78번을 따른다 (VALUE-044).
