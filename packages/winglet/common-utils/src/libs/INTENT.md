# libs — 팩토리·프리미티브 헬퍼 컬렉션

## Purpose

캐시 팩토리(`cacheMapFactory`/`cacheWeakMapFactory`), `counterFactory`, `getKeys`, `getTypeTag`, `hasOwnProperty`, 난수 헬퍼 3종(`getRandomString`/`getRandomNumber`/`getRandomBoolean`) — 서로 다른 책임을 가진 7개 독립 유틸리티를 소유한다. 공통된 상위 개념이 없어 하나의 organ 이름으로 묶이지 않는다.

## Conventions

- 공개 subpath는 `@winglet/common-utils/lib`(단수)다 — 디렉터리명 `libs`(복수)와 다르다.
- 각 파일은 상태를 캡슐화한 팩토리(`cacheMapFactory` 등) 또는 순수 프리미티브 함수 중 하나다.

## Boundaries

### Always do

- 새 유틸리티가 기존 7개 중 어느 것과도 공유할 개념이 없으면 새 파일로 flat하게 추가한다
- 캐시·카운터 팩토리가 반환하는 메서드 시그니처를 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 여러 유틸리티를 하나의 organ 이름으로 묶는 재배치(그룹핑할 공통 개념이 실제로 생겼을 때만)
- `hasOwnProperty`/`getKeys`의 프로토타입 체인 처리 방식 변경

### Never do

- `cacheWeakMapFactory`가 감싸는 `WeakMap`에 열거(enumeration)나 `size` 기능을 추가(네이티브 `WeakMap` 계약 위반)
- 의미 없는 organ 이름(`utils2`, `misc` 등)으로 이 디렉터리를 재구성
