# validateChildTargets contract

## Requirements

분석된 선언의 자식 제어 대상이 해당 호스트에 존재하는지 검증한다.

부모 분석 문맥에 선언 수집이 기록한 단조 증거 `hasChildTargets`가 있을 때만 호출되며, 증거가 없으면 자식 대상·판별 키 오류가 불가능하고 호출할 때는 기존 오류 순서를 유지한다.

## API Contracts

- fields 제어 항목의 대상이 비터미널 호스트의 직계 자식인지 확인하고, 없는 대상은 작성 위치를 가진 정적 오류로 보고한다. 같은 노드의 선언들이 서로 다른 discriminator 키를 지정하면 먼저 선언된 키와 충돌한 키를 함께 보고한다.

## Acceptance Criteria

### child-targets — 분석 뒤 자식 대상 검증

- fields 대상은 조건부·가상 이름까지 모은 뒤 검사하며, 어느 선언에도 없는 대상은 schemaPath가 있는 `CHILDREN_TARGET_NOT_FOUND`로 실패한다. 같은 노드의 선언 사이에서 판별 키가 다르면 `DISCRIMINATOR_MISMATCH`로 실패한다.
- 부모 blueprint의 `blueprint.diagnostics.test.ts`(fields 대상 사례)와 `blueprint.discriminator.test.ts`가 `blueprint()`로 이 절을 검증한다.

## Last Updated

정돈-3 blueprint 재구성(2026-10-15)
