# objectBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors 공유 보조 < objectBehavior < behaviors 뿌리 < SchemaNode`입니다. `branch/`와 `terminal/`은 내부 organ입니다. 모두 이 종류 안에서 소비하므로 경계 예외가 없습니다(NODE-009·016).
- 두 전략은 청사진이 정한 고정 선택입니다. 렌더 입력을 이 행에서 검사하지 않습니다(NODE-028·042).

## API Contracts

- 진입점은 `objectBehavior: { branch: Behavior; terminal: Behavior }`를 이름으로 내보냅니다. 두 행은 공통 일곱 칸 순서이며 `type: 'object'`, 전략만 각각 `'branch'`·`'terminal'`입니다. 행 파일은 전략별 행 객체만 정의하고 길어진 칸과 전략별 보조는 해당 organ에 둡니다.
- branch의 `interpret`는 객체 값을 자식으로 분배할 입력으로 두고, 잘못된 종류의 `null`·수 등은 원본 `raw`로 보존합니다. `declareChildren`은 청사진의 활성 자식 선언만 돌려주고 생성하지 않습니다. `assemble`은 활성 자식 `emit`과 선언 밖 `extras`를 합쳐 `local`을 만들며 자식이 없으면 `{}`입니다(VALUE-002·034, NODE-043).
- branch의 키 순서는 유효 스키마 `options.propertyKeys` → 각 이름의 첫 선언 전순서 → `extras` 삽입 순서입니다. 키 집합이 같으면 바뀐 자식만 얕게 패치하고, 집합이 바뀌면 해당 호스트 키 수만큼 새 객체를 짓습니다. `project`는 순서를 보존하고 빈 `local`의 `omitEmpty` 방출 생략을 적용합니다(SETTLE-042, VALUE-034).
- terminal은 자식 선언이 없고 `interpret`·`assemble`·`project`가 통째로 받은 객체 참조를 유지합니다. 내부 키는 정규화하지 않습니다. `Merge`가 객체 호스트에 대한 부분 쓰기인지 통째 값인지의 판정은 정착의 쓰기 종류가 맡습니다(NODE-005·006, VALUE-037, WRITE-079).
- `utils/` organ은 두 전략이 함께 쓰는 `omitEmptyObject`와 객체 값 동등성 보조를 소유합니다. `omitEmptyObject`는 입력을 바꾸지 않는 투영 계산이고 다른 종류에 재수출하지 않습니다(NODE-009, LANDING-082).

## Acceptance Criteria

### object-branch — 형상과 키 순서

- 현재 형상의 자식만 합성하고 빈 host의 `local`은 `{}`이며 선언·`extras` 키의 결정적 순서가 유지됩니다(VALUE-034, SETTLE-042).

### object-terminal — 통째 참조

- terminal은 자식이 없고 내부를 정규화하거나 복사하지 않으며 방출이 원본 참조를 유지합니다(NODE-005, VALUE-037).

## Last Updated

2026-09-29
