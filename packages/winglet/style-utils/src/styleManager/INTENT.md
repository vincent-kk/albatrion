# styleManager — 스코프 CSS 생명주기 flat API

## Purpose

`styleManagerFactory`와 `destroyScope` 두 flat 함수로 스코프 CSS의 추가·해제·전체 정리를 위한 공개 계약을 소유한다. 실제 싱글톤 등록·DOM 반영·배치 처리는 자식 fractal `StyleManager`가 소유하며, 이 fractal은 그 위에 얹는 커링·클린업 함수 형태의 인체공학적 API 계약만 소유한다.

## Boundaries

### Always do

- `destroyScope`/`styleManagerFactory`는 `StyleManager.get(...)`에 위임하는 얇은 어댑터로 유지한다 — 스코프 생명주기 로직을 이 층에 복제하지 않는다
- `StyleManager`에서 발생한 예외는 삼키지 않고 그대로 전파한다

### Ask first

- `styleManagerFactory`가 반환하는 커링 함수의 시그니처(인자 순서, cleanup 반환 형태) 변경
- `StyleManager` 클래스 자체를 이 fractal의 엔트리 포인트로 재수출하는 변경

### Never do

- 엔트리 포인트에서 `styleManagerFactory`/`destroyScope` 외의 이름을 재수출
- Shadow DOM 구성(`shadowRoot` 옵션) 전달을 가로막거나 변형하는 로직 추가
