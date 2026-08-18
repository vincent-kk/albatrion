# filters — 스키마 타입 판별자

## Purpose

JSON Schema 노드를 판별하는 타입가드와 두 스키마의 `type`을 비교하는 함수를 함께 묶어 재수출하는 flat 컬렉션이다. 스키마 종류별로 base(non-nullable)·nullable·겸용(둘의 합집합) 세 변형을 함께 제공하는 것이 기본 패턴이다. 단일 스키마 판별과 별개로 두 스키마 간 타입 호환·동일 여부를 비교하는 함수도 포함하며, nullable 판정의 공유 로직은 내부 `utils` organ이 소유하고 이 fractal이 이름으로 재수출한다.

스키마 순회·`$ref` 해석은 소유하지 않는다 — 상위 패키지 루트가 재수출하는 형제 fractal의 책임이다.

## Boundaries

### Always do

- 판별 함수는 스키마를 변형하지 않는 순수 함수로 유지한다 — 부수효과나 스키마 클론을 추가하지 않는다
- 새 스키마 종류의 판별자를 추가할 때도 base·nullable·겸용 세 변형 패턴을 따른다

### Ask first

- 판별 기준에 OpenAPI `nullable` 플래그 등 새 필드를 반영하는 변경
- 두 스키마 비교 함수의 호환·동일 판정 규칙 확장

### Never do

- 판별자 내부에서 스캐너나 `resolveReference`를 호출해 `$ref`를 해석하는 로직 추가
- 판별 결과에 따라 인자로 받은 스키마 객체를 변경하는 코드 추가
