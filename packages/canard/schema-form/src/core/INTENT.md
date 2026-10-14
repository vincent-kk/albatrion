# core — Node engine and surface composition boundary

## Purpose

렌더 바인딩과 core 호스트가 쓸 수 있도록 engine과 node surface 계약을 하나로 묶는다. 실행 규칙은 engine이 소유하고, 공개 node 타입과 가드, 빌드 채널은 surface가 소유한다.

## Conventions

- 진입점에는 이름을 붙인 re-export만 두고, 구현은 그것을 소유한 모듈에 남겨 둔다.
- core 호스트와 React 바인딩은 같은 트리 구성 채널과 마운트 채널을 쓴다.
- 입력 원본은 내보내는 출력과 따로 저장하고, 타입이 맞지 않으면 명시적으로 보고한다.
- 렌더러 표현은 불투명한 타입 매개변수로 넘기며, engine 스키마 타입은 React를 import하지 않는다.

## Boundaries

### Always do

- 공개 계약과 바인딩 전용 채널은 진입점에서 이름을 붙여 re-export한다.
- 트리를 구성하고 마운트하는 동안 호스트 predicate 참조를 그대로 유지한다.
- node 값은 공개 write 계약과 이름이 붙은 바인딩 채널로 바꾼다.

### Ask first

- 이벤트 전달 시점이나 공개 옵션 비트를 바꾸려는 경우.
- 공개 node 멤버나 바인딩 전용 연산을 추가하려는 경우.

### Never do

- 보존된 레거시 engine이나 애플리케이션 플러그인 레지스트리를 import하지 않는다.
- 바인딩 전용 함수를 패키지 진입점으로 노출하지 않는다.
- 렌더러 표현을 읽거나 호출자가 소유한 스키마 데이터를 변경하지 않는다.
