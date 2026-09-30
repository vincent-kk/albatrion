# ComputedPropertiesManager — 계산 상태와 의존성 소유자

## Purpose

노드의 계산 상태와 의존성 값 배열을 관리합니다. 표현식 문법의 컴파일은 청사진 경계에 맡기고, 노드가 읽는 계산 결과와 갱신 시점은 이 모듈이 소유합니다.

## Conventions

- `computed.*`와 `&fieldName` 별칭을 같은 계산 계약으로 처리합니다.
- `getPathManager`가 정한 경로 순서와 `dependencies` 인덱스를 일치시키고, 값 갱신 뒤 `recalculate()`를 호출합니다.
- 계산 설정이 없는 노드는 공유 sentinel을 사용할 수 있으므로 실제 매니저 생성 판단과 매니저가 읽는 필드 어휘는 하나의 소유 경계에서 유지합니다. 사본이 어긋나면 계산이 필요한 노드도 재계산하지 못합니다.

## Boundaries

### Always do

- 새 computed 필드를 추가하면 공개 계산 타입과 생성자의 함수 준비를 함께 갱신합니다.
- 의존성 경로는 `PathManager.set()`으로 등록합니다.
- 의존성 구독 전 `isEnabled`를 확인합니다.

### Ask first

- `MAX_LOOP_COUNT` 또는 배치 제한 변경
- `ALIAS` (`&`) prefix 규칙 변경
- 공개 계산 계약에 새 필드 타입 추가

### Never do

- 동적 함수를 `eval`로 생성하지 않습니다.
- `pathManager`를 우회해 의존성 경로 배열을 직접 늘리지 않습니다.
- 의존성 갱신 없이 `recalculate()`를 반복 호출하지 않습니다.
