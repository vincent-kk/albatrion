# rateLimit — 호출 빈도 제어 유틸리티

## Purpose

`debounce`와 `throttle`을 소유하는 fractal이다. 두 함수 모두 하나의 공유 타이머·컨텍스트 엔진 위에서 동작하며, 이 엔진과 옵션 타입은 helpers organ에 있다. 어느 공개 함수도 이 fractal의 디렉터리 이름과 같지 않아 eponymous 구현 하나로 흡수되지 않으므로, 두 파일 모두 flat 공개 표면으로 fractal root에 남는다.

## Conventions

- 기본 실행 모드는 함수마다 다르다 — `debounce`는 `leading: false`/`trailing: true`, `throttle`은 `leading: true`/`trailing: true`가 기본값이다. 이 비대칭을 바꾸는 변경은 두 함수 모두의 문서화된 계약을 함께 갱신해야 한다.
- `clear`는 예정된 실행만 취소하고, `dispose`는 그에 더해 공유 `AbortSignal`에 등록한 리스너까지 해제한다 — signal이 오래 살아있는 경우 wrapper를 폐기할 때는 `dispose`를 쓴다.

## Boundaries

### Always do

- 타이머·컨텍스트 관리 로직 변경은 helpers organ의 공유 엔진을 통해서만 한다 — 함수별로 복제하지 않는다
- signal을 폐기 전에 정리해야 하는 경로를 추가할 때는 `dispose`로 리스너 해제까지 보장한다

### Ask first

- `debounce`/`throttle`의 기본 `leading`/`trailing` 값 변경(문서화된 비대칭을 깨뜨림)
- 공유 옵션 타입(`ExecutionOptions`) 확장

### Never do

- 공유 엔진을 우회해 타이머를 함수 파일 안에 직접 구현
- `AbortSignal` 리스너 해제 없이 `clear`만으로 폐기를 대신하는 경로 추가
