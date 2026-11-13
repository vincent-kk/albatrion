# async contract

## Requirements

- `scan(schema)`은 `Promise<this>`를 반환해 체이닝 가능하며, 실패(예외) 시 원본·처리된 스키마·수집된 참조 상태를 모두 초기화한 뒤 예외를 다시 던진다.
- `getValue()`는 sync와 같은 공통 출력 구현을 사용하며, 연산이 없으면 입력 참조를 그대로 반환하고 `false`도 캐시한다. 출력 연산이 있으면 결과는 입력·mutate 반환값·해소기 대상과 객체를 공유하지 않는다.
- 콜백 대기 중을 포함해 같은 인스턴스의 `scan`과 `getValue`는 `scan-in-progress` 오류로 거절한다. 다른 인스턴스의 동시 실행은 허용한다.
- 필터·변형(mutate)·참조 해석·방문자(enter/exit) 콜백은 각각 동기 값 또는 프로미스를 반환할 수 있으며, 프로미스인 경우에만 await한 뒤 다음 단계로 진행한다.
- 실제 데이터 시나리오(중첩 `$defs`, 순환 참조, `oneOf` 내부 참조)에서 sync와 동일한 최종 스키마를 만든다.
- 방언과 boolean·inert·정의 역할 및 `keywords`·`additionalKeywords`의 해석은 루트의 공통 순회 계약을 따르며, boolean에도 필터·변형·방문자의 비동기 순서를 유지한다.
- 코어가 thenable 결과를 만난 콜백 지점에서만 멈추고, 드라이버가 기다린 값을 같은 프레임에 전달해 다음 단계부터 재개한다. 대기 전의 콜백을 다시 호출하거나 형제 노드를 먼저 방문하지 않는다.

## API Contracts

- `scan(schema): Promise<this>`.
- `getValue<OutputSchema>(): OutputSchema | undefined`.
- entry point는 순회 어휘 상수는 재수출하지 않는다 — 상수는 sync fractal에서만 재수출된다.

공개 클래스 이름은 `JSONSchemaScannerAsync`이며 이전 표기의 별칭은 제공하지 않습니다. 두 이름으로 같은 계약이 갈라지는 것을 막습니다.

참조 프로토콜은 root·어휘적 child·dialect·resolve를 분리합니다. 해소된 정규 URI로 순환을 검사하고, 순수 교체 체인과 allOf 가지의 정체성 소유자를 나눠 독립 형제를 순환으로 오인하지 않습니다. 동기 스캐너의 Promise 해소 결과는 잘못된 프로토콜 결과로 거절합니다.

구방언에서 안전한 원시 형제만 버리고 정의 주소 컨테이너를 남겨 감싸며, 다른 객체·배열·boolean 형제가 있으면 relocation으로 보존합니다. 남은 참조의 형제도 방문하되 구방언의 정의 컨테이너 외 후손은 inert입니다. 현대 방언은 형제를 유지하고 새 가지를 기존 allOf 뒤에 붙입니다.

참조 체인과 인라인 노드에는 유한 상한이 있으며, 식별자를 바꾸는 mutate는 거절합니다. 새 하위 트리의 식별자를 다시 등록하지 않습니다.

## Acceptance Criteria

### callback-sequencing — 콜백 await 순서 보장

- 방문자 `enter`/`exit`가 각각 지연 있는 프로미스를 반환하면, `scan()`은 각 콜백이 완료된 뒤에야 다음 단계로 진행함을 호출 순서로 검증한다.
- 방문자 콜백이 동기 함수(프로미스를 반환하지 않음)여도 정상 동작함을 검증한다.

### async-reference-outcome — 비동기 참조 해석 성공·실패 결과

- 해소기의 resolve가 프로미스로 resolved 태그와 target을 반환하면 해당 노드가 `references`의 resolved 결과와 해석된 스키마로 방문됨을 검증한다.
- 해소기의 resolve가 프로미스로 skipped 태그와 unresolved 이유를 반환하면 해당 노드가 `references`의 unresolved 결과를 갖고 원본 `$ref` 스키마 그대로 방문됨을 검증한다.

### sync-parity — sync와 동일한 실제 데이터 해석 결과

- 중첩 `$defs`, 자기·조상 참조 순환, `oneOf` 내부 참조를 포함한 각 시나리오에서 sync 스캐너와 동일한 최종 스키마를 만듦을 검증한다.
- `scan()` 이전의 `getValue()`는 `undefined`를, 참조가 없는 스키마를 스캔한 뒤에는 원본과 동일한 값을 반환함을 검증한다.

## Boundary Exemptions

### `JSONSchemaScannerAsync.ts` — 변형 디렉터리 + 클래스명 파일의 정본 배치 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: sync와 대칭적인 배치다 — 디렉터리명이 이미 변형을 구분하므로 파일명은 클래스명을 그대로 쓴다. 이 클래스는 sync를 상속하지 않는 별도 구현이면서 동일한 순회 코어를 공유하므로, 파일명이 클래스 export를 직접 가리켜야 두 구현을 나란히 비교하기 쉽다.

## Last Updated

async의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
