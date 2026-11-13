# async contract

## Requirements

- `scan(schema)`은 `Promise<this>`를 반환해 체이닝 가능하며, 실패(예외) 시 원본·처리된 스키마·수집된 참조 상태를 모두 초기화한 뒤 예외를 다시 던진다.
- `getValue()`는 sync와 같은 공통 출력 구현을 사용하며, 연산이 없으면 입력 참조를 그대로 반환하고 `false`도 캐시한다. 별칭 공유를 명시한 인라인 대상을 제외하면 출력 사본은 입력과 객체를 공유하지 않는다.
- 콜백 대기 중을 포함해 같은 인스턴스의 `scan`과 `getValue`는 `scan-in-progress` 오류로 거절한다. 다른 인스턴스의 동시 실행은 허용한다.
- 필터·변형(mutate)·참조 해석·방문자(enter/exit) 콜백은 각각 동기 값 또는 프로미스를 반환할 수 있으며, 프로미스인 경우에만 await한 뒤 다음 단계로 진행한다.
- 실제 데이터 시나리오(중첩 `$defs`, 순환 참조, `oneOf` 내부 참조)에서 sync와 동일한 최종 스키마를 만든다.
- 방언과 boolean·inert·정의 역할 및 `keywords`·`additionalKeywords`의 해석은 루트의 공통 순회 계약을 따르며, boolean에도 필터·변형·방문자의 비동기 순서를 유지한다.
- 코어가 thenable 결과를 만난 콜백 지점에서만 멈추고, 드라이버가 기다린 값을 같은 프레임에 전달해 다음 단계부터 재개한다. 대기 전의 콜백을 다시 호출하거나 형제 노드를 먼저 방문하지 않는다.

## API Contracts

- `new JSONSchemaScannerAsync(props?)`: sync와 동일한 형태의 `visitor`/`options`를 받되 각 콜백이 `Promise`를 반환할 수 있다. `cloneResolvedSchema` 기본값 `true`, `cacheResolvedReference` 기본값 `false`로 sync와 동일하다.
- `scan(schema): Promise<this>`.
- `getValue<OutputSchema>(): OutputSchema | undefined`.
- entry point는 순회 어휘 상수는 재수출하지 않는다 — 상수는 sync fractal에서만 재수출된다.

공개 클래스 이름은 `JSONSchemaScannerAsync`이며 이전 표기의 별칭은 제공하지 않습니다. 두 이름으로 같은 계약이 갈라지는 것을 막습니다.

## Acceptance Criteria

### callback-sequencing — 콜백 await 순서 보장

- 방문자 `enter`/`exit`가 각각 지연 있는 프로미스를 반환하면, `scan()`은 각 콜백이 완료된 뒤에야 다음 단계로 진행함을 호출 순서로 검증한다.
- 방문자 콜백이 동기 함수(프로미스를 반환하지 않음)여도 정상 동작함을 검증한다.

### async-reference-outcome — 비동기 참조 해석 성공·실패 결과

- `resolveReference` 옵션이 프로미스로 스키마를 반환하면 해당 노드가 `referenceResolved: true`와 해석된 스키마로 방문됨을 검증한다.
- `resolveReference` 옵션이 프로미스로 `undefined`를 반환하면 해당 노드가 `referenceSkipped: 'unresolved'`를 갖고 원본 `$ref` 스키마 그대로 방문됨을 검증한다.

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
