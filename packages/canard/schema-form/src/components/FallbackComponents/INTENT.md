# FallbackComponents

## Purpose

사용자·플러그인 렌더러가 없을 때 최소 HTML 표시를 제공하는 마지막 폴백입니다.

## Conventions

- 입력 실행과 오류 해석은 전달받은 props에 맡깁니다. [DETAIL](DETAIL.md)의 접근성 연결을 유지합니다.

## Boundaries

### Always do

- 전달받은 Input을 렌더하고 루트에 불필요한 그룹을 더하지 않습니다.
- 제목 id 규약을 유지하여 사용자 입력도 같은 접근성 연결을 사용할 수 있게 합니다.

### Ask first

- 기본 HTML·접근성·스타일 규약 또는 렌더러 props 계약을 바꿀 때

### Never do

- PluginManager에 직접 의존하거나 자체 폼 상태·비즈니스 로직을 도입하지 않습니다.
