# encodeGraph

## Purpose

graph 저장과 fingerprint가 공유하는 지원 값 순회·참조 번호·token table 생성을 소유합니다.

## Conventions

serialization 내부 공통 경계입니다. 패키지 공개 API로 재수출하지 않습니다.

## Boundaries

### Always do

- 반복 순회로 cycle과 깊은 입력을 처리합니다.
- 입력 객체를 변경하지 않고 omit을 값 접근보다 먼저 적용합니다.
- 외부 소비자가 사용하는 함수와 결과 타입만 entry point에 노출합니다.

### Ask first

- token/node 형식, 지원 타입, opaque 또는 정렬 정책을 변경합니다.

### Never do

- 함수별 순회 상태를 호출 사이에 공유합니다.
- encodeNode 등 전용 helper를 entry point에서 export합니다.
