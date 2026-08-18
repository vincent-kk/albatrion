# cx — className 결합 유틸리티 쌍

## Purpose

문자열·숫자·배열·객체를 재귀적으로 처리해 className을 결합하는 `cx`와, 문자열·숫자 위주의 truthy 필터링만 수행하는 경량 대응 `cxLite`를 소유한다. 두 함수는 동일한 최상위 truthy 필터링 루프를 공유하되 중첩 배열·객체 처리 여부에서만 갈린다 — 이 대칭성이 두 파일을 organ 아래로 옮기지 않고 나란히 두는 근거다.

## Boundaries

### Always do

- `cxLite`는 객체·배열을 특별 취급하지 않고 truthy 필터링만 수행하는 경량 계약을 유지한다 — 이 계약을 깨는 변경은 `cx`와의 구분을 무의미하게 만든다
- 두 함수 모두 순수 함수로 유지한다 — DOM이나 전역 상태를 읽거나 쓰지 않는다

### Ask first

- `cxLite`에 객체·배열 재귀 처리를 추가하는 변경(두 함수의 구분 자체를 없애는 변경)
- `ClassValue`/`ClassObject`/`ClassArray` 타입 형태 확장

### Never do

- `cxLite`를 `cx`의 단순 별칭으로 만들어 성능 특성을 잃는 변경
- 두 함수에 프레임워크 또는 외부 패키지 의존성 추가
