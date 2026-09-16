# runCli

## Purpose

Sole `inject-agents-settings` CLI driver. Parses `--package <name...>` from argv — each value is a scope alias (`@<scope>`), a scoped package (`@<scope>/<name>`), or an unscoped package (`<name>`). Resolves every target, then hands off to exactly one of three renderers.

## Conventions

- 대상 해석은 파일시스템·모듈 해석을 수행하고, 플래그 검사는 값만 검증합니다. 부수효과가 다르므로 두 책임을 별도의 내부 구획으로 유지합니다.
- 실행 함수는 대상 해석 후 렌더러로 진행하며 렌더러가 플래그 검사를 소비합니다. 대상 해석에서 렌더러나 플래그 검사 계층으로 역참조하지 않습니다.
- 렌더러가 사용하는 플래그 검사는 실패 시 종료하는 resolve 계열과 실패를 값으로 반환하는 parse 계열을 구분합니다. JSON 렌더러는 출력 문서 중간에 종료하지 않도록 parse 계열을 사용합니다.
- asset-path 검사는 렌더러가 생기기 전에 실행되며 실패 시 종료 코드 2와 빈 stdout을 유지합니다. JSON 요청에도 같은 규칙을 적용합니다.

## Boundaries

### Always do

- 모든 종료 경로는 문서화된 종료 코드 0 / 1 / 2를 사용합니다.
- 대상 해석 후 renderOrFallback을 한 번 호출합니다. JSON, 비대화형, Ink 순의 분기는 이 함수가 소유합니다.

### Ask first

- 단일 동작 CLI에 최상위 하위 명령을 추가하는 변경

### Never do

- resolveScopeAlias 외에서 node_modules를 열거
- 대화형 UI를 정적으로 import하거나 renderOrFallback 밖에서 동적으로 로드
- 핵심 연산 모듈의 공개 진입점을 우회해 내부 구현에 접근
