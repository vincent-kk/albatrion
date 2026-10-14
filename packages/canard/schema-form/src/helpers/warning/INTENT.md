# warning

## Purpose

개발 환경에서만 쓰는 진단 경고를 한곳으로 모으는 헬퍼. 에러 시스템과 같은 `code + formatted message + details` 구조를 쓰지만 Error 인스턴스는 만들지 않고 `printWarning`으로 내보낸다. 프로덕션(`process.env.NODE_ENV === 'production'`)에서는 아무것도 출력하지 않는다.

## Conventions

- 패키지 안의 개발 전용 경고는 모두 이 모듈을 거친다. 개별 `console.warn`을 직접 호출하지 않는다.
- 경고도 에러와 같은 `code + formatted message + details` 구조를 쓴다.
- 메시지는 `formatVirtualizationDisabledWarning`처럼 경고를 내는 fractal의 `utils/`에 둔 전용 포매터로 만든다.
- `code + message` 단위로 세션당 한 번만 출력한다. 노드별 파이프라인에서 콘솔이 넘치는 것을 막기 위해서다.
- 스키마 작성자가 조치할 수 있는 내용만 경고한다. 내부 디버깅 로그는 넣지 않는다.

## Boundaries

### Always do

- 새 개발 진단을 추가할 때는 `warnDevelopmentIssue`와 전용 warning 포매터를 쓴다.

### Ask first

- 특정 경고를 throw(에러)로 올리는 정책 변경
- 중복 제거 기준 변경(code+message에서 다른 키로)

### Never do

- 프로덕션 환경에서 출력되는 로그 추가
- 사용자 데이터(폼 값)를 details에 포함
