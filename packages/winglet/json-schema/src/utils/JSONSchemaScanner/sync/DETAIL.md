# sync contract

## Requirements

- `scan(schema)`은 인스턴스를 반환해 체이닝 가능하며, 실패(예외) 시 원본·처리된 스키마·수집된 참조 상태를 모두 초기화한 뒤 예외를 다시 던진다.
- `getValue()`는 공통 출력 계약을 따른다. 연산이 없으면 입력 참조를 그대로 반환하고, 연산이 있으면 입력과 콜백 반환값에 쓰지 않고 출력 사본을 만든다. `cloneResolvedSchema: false`로 인라인한 대상의 별칭 공유는 유지한다.
- `getValue()`의 결과는 최초 호출 시 계산되어 캐시되고, `false`를 포함한 이후 재호출은 같은 캐시를 반환한다.
- 동기 콜백 안에서 같은 인스턴스의 `scan` 또는 `getValue`를 호출하면 `scan-in-progress` 오류를 던진다. 이 오류를 콜백이 처리하면 바깥 스캔은 계속할 수 있다.
- `keywords`는 내장 어휘를 대체하고 `additionalKeywords`는 그 뒤에 이어붙인다. 같은 이름은 나중 항목의 순서·종류·방언을 사용한다. 방언과 boolean·inert·정의 역할은 루트의 공통 순회 계약을 따른다.
- 프로미스 판별을 위해 콜백 반환값의 `then` 속성을 읽지 않는다. 판별의 부수효과가 동기 순회에 섞이지 않게 비동기 드라이버만 대기 기능을 켠다.

## API Contracts

- `new JSONSchemaScanner(props?)`: `props.visitor`(`enter`/`exit`)와 `props.options`를 받는다. `options.cloneResolvedSchema`는 기본값 `true`(해석된 하위 스키마를 인라인 시점에 깊은 복제), `options.cacheResolvedReference`는 기본값 `false`(참조 문자열별 재해석 결과 메모이제이션)다.
- `scan(schema): this`: 동기로 순회를 완료한 뒤 `this`를 반환한다.
- `getValue<OutputSchema>(): OutputSchema | undefined`: 처리된 최종 스키마를 반환한다.
- entry point는 순회 어휘 상수도 이름으로 재수출한다 — 상수 값 자체는 상위 organ 소유다.

공개 클래스 이름은 `JSONSchemaScanner`이며 이전 표기의 별칭은 제공하지 않습니다. 두 이름으로 같은 계약이 갈라지는 것을 막습니다.

## Acceptance Criteria

### real-schema-resolution — 실제 스키마 데이터로 검증한 참조 해석

- exit 방문자에서 수집한 `$ref` → 정의 Map을 `resolveReference` 옵션으로 되돌려주면, `getValue()`가 참조를 정의 내용으로 치환한 스키마를 반환함을 단일 `$defs`·중첩된 `$defs`·`oneOf` 내부 `$ref` 시나리오별로 검증한다.
- `additionalProperties: false`처럼 해석과 무관한 키워드는 결과 스키마에 원본 그대로 유지됨을 검증한다.

### cycle-safety — 순환 참조 안전 종료

- 자기 자신 또는 조상 정의를 가리키는 `$ref`를 가진 스키마를 순회해도 무한 루프 없이 완료되며, 순환 지점은 1레벨만 해석되고 더 깊은 재귀 지점은 `$ref`로 남음을 검증한다 — 트리형 재귀 구조를 대상으로 한 별도 케이스로도 확인한다.

## Boundary Exemptions

### `JSONSchemaScanner.ts` — 변형 디렉터리 + 클래스명 파일의 정본 배치 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 디렉터리명이 이미 async 변형과의 구분자 역할을 하므로, 파일명은 담고 있는 클래스명을 그대로 쓴다 — 디렉터리명으로 다시 감싸면 이름이 중복된다. 클래스 본체가 root에 그대로 남아 있어야 파일 경로만으로 클래스 정의를 바로 찾을 수 있다.

## Last Updated

sync의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
