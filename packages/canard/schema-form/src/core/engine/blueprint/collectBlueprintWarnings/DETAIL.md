# collectBlueprintWarnings contract

## Requirements

관심 있는 진단 소비자에게 청사진의 인라인 종단 예약 키 경고를 수집해 전달한다.

## API Contracts

- 터미널 하위의 예약 키 경고는 터미널 노드의 schemaPath마다 기록 하나에 keys와 paths를 모은다. 같은 코드와 schemaPath의 중복은 억제하며, 인라인 하위만 조사하고 참조 대상은 따라가지 않는다(BLUEPRINT-044).

## Acceptance Criteria

### blueprint-warnings — 늦은 수집과 터미널 하위 경고

- 진단 소비자가 없으면 경고를 검사하지 않고, 캐시된 루트에 소비자가 나중에 붙으면 루트마다 한 번 수집한다.
- 터미널 하위의 예약 키 경고는 터미널 schemaPath마다 기록 하나에 keys와 paths를 모으고, 인라인 하위만 조사하며 참조 대상은 따라가지 않는다(BLUEPRINT-044).
- 부모 blueprint의 `blueprint.diagnostics.test.ts`가 `blueprint()`로 이 절을 검증한다(늦은 수집, 터미널 인라인 그룹, union 호스트 사례).

## Last Updated

정돈-3 blueprint 재구성(2026-10-15)
