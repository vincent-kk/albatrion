# Composition Feature Scenarios

## Purpose

기능 카탈로그의 조건과 합성(G3) 그룹이 새로 쓰는 공유 장면을 소유합니다.
oneOf·anyOf·allOf·if/then/else·명시 판별과 검증기 기반 분기 판정·오류 귀속을 다룹니다.

## Conventions

- 장면 모듈은 데이터 전용으로 두며, 실행은 어댑터가 소유합니다(TEST-010).
- 장면 이름은 `composition.` 접두사로 식별하고 모든 최상위 단계에 기대값을 둡니다.
- 기존 엔진 부류(union, settle, value, validation)에 같은 동작의 장면이 있으면 여기서 복사하지 않고 소비자가 그 부류에서 가져옵니다.

## Boundaries

이 부류는 새 장면의 입력과 관찰 가능한 기대값을 소유합니다.
소비자는 엔진 실행·렌더링·검증기 등록·단언 런타임을 소유합니다.

## Always do

- 분기 활성은 `controls.active`·`controls.discriminator`·작성된 `if`로만 기술합니다.
- 오류 기대값은 keyword 같은 부분 계약으로 적고, 개수와 순서를 함께 고정합니다.

## Ask first

- 부류의 책임을 조건과 합성 밖으로 넓히기 전에 확인합니다.
- 기존 엔진 부류의 장면을 이 부류로 옮기기 전에 확인합니다.

## Never do

- 엔진의 형을 포함해 폼 엔진이나 테스트 러너를 장면 데이터에 가져오지 않습니다.
- `&if`·`computed.*` 같은 사라진 옛 문법으로 장면을 쓰지 않습니다.
