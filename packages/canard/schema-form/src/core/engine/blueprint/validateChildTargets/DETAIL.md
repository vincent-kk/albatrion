# validateChildTargets contract

## Requirements

- 오류 위치는 jsonPointer 이름 조립 API를 사용해 예약 이름과 구분자를 보존한다.

분석된 선언의 자식 제어 대상이 해당 호스트에 존재하는지 검증한다.

부모 분석 문맥에 선언 수집이 기록한 단조 증거 `hasChildTargets`가 있을 때만 호출되며, 증거는 controls.fields가 있을 때 세운다. discriminator만으로는 세우지 않는다. 증거가 없으면 자식 대상 오류가 불가능하고 호출할 때는 기존 자식 대상 오류 순서를 유지한다.

## API Contracts

- fields 제어 항목의 대상이 비터미널 호스트의 직계 자식인지 확인하고, 없는 대상은 작성 위치를 가진 정적 오류로 보고한다. 판별 키는 비교하지 않는다. 같은 노드의 여러 선언은 각자 다른 키로 자신의 oneOf·anyOf를 독립 선택할 수 있다(C12).

## Acceptance Criteria

### child-targets — 분석 뒤 자식 대상 검증

- fields 대상은 조건부·가상 이름까지 모은 뒤 검사하며, 어느 선언에도 없는 대상은 schemaPath가 있는 `CHILDREN_TARGET_NOT_FOUND`로 실패한다. 서로 다른 판별 키는 이 검증을 유발하거나 오류를 만들지 않는다.
- 부모 blueprint의 `blueprint.diagnostics.test.ts`(fields 대상 사례)와 `blueprint.discriminator.test.ts`가 `blueprint()`로 이 절을 검증한다.

## Last Updated

2026-11-03
