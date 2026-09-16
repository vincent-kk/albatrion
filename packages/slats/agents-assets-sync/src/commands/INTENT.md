# commands

## Purpose

CLI 인자를 해석하고 주입 작업을 시작하는 공개 경계를 소유합니다. runCli는 패키지 이름과 스코프 별칭을 해석해 대상을 결정하고 렌더러 선택을 위임합니다. JSON 요청은 renderJson으로, 비대화형 실행은 renderPlain으로, 대화 가능한 TTY 실행은 Ink로 연결합니다.

## Conventions

- 인자·대상 해석과 실제 연산의 책임을 분리하며, 이 경계에서 핵심 주입 로직을 재구현하지 않습니다.
- 렌더러 선택은 JSON 요청, 비대화형 환경, 대화형 TTY 순으로 판정하는 단일 분기점에 위임합니다.

## Boundaries

### Always do

- 사용자에게 드러나는 실패는 문서화된 종료 코드 0 / 1 / 2 계약으로 전달합니다.
- renderOrFallback을 통해 렌더러를 한 번만 선택합니다.

### Ask first

- 최상위 하위 명령을 추가하는 변경 — 대상이 여럿이어도 현재 CLI는 단일 동작을 유지합니다.

### Never do

- 대화형 UI를 정적으로 import하거나 renderOrFallback 밖에서 동적으로 로드
- 하위 프랙탈의 공개 진입점을 우회해 내부 구현에 접근
- resolveScopeAlias 외의 코드에서 node_modules를 열거 — 스코프 별칭 해석만이 이 열거를 소유합니다.
