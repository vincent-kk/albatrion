# getPathManager

## Purpose
computed 표현식 파싱 중 발견된 JSONPointer 의존성 경로를 중복 없이 순서대로 수집하고, 인덱스 기반으로 참조할 수 있는 `PathManager` 객체를 생성한다.

## Structure
- `getPathManager.ts` — 팩토리 함수 및 `PathManager` 인터페이스
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- `PathManager` 인터페이스: `{ get(), set(path), findIndex(path) }`
- `#` Fragment prefix 자동 제거 (`path[0] === $.Fragment ? path.slice(1)`)
- 중복 경로 무시 (`!paths.includes(path)`)
- `findIndex` 는 `Array.indexOf` 기반 O(n); 의존성 수가 적어 허용

## Boundaries

### Always do
- `set()` 호출 후 `findIndex()` 로 인덱스 조회 (set 전에 findIndex 호출 금지)
- `get()` 으로 최종 경로 배열 회수하여 `dependencyPaths` 에 할당

### Ask first
- `PathManager` 를 Map 기반으로 교체하는 최적화 (의존성 수가 많아지는 경우)

### Never do
- `PathManager` 없이 의존성 경로를 직접 배열에 수집
- `get()` 으로 반환된 배열을 외부에서 직접 변경

## Dependencies
- `@/schema-form/helpers/jsonPointer` — `JSONPointer` (`$.Fragment`, `$.Separator`)
- `@aileron/declare` — `Fn`
