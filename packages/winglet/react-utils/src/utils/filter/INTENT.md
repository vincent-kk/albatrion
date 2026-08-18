# filter — React 컴포넌트/엘리먼트 판별 predicate

## Purpose

React가 인정하는 컴포넌트 형태(함수·클래스·forwardRef·lazy·memo)와 엘리먼트를 런타임에 판별하는 predicate 모음을 소유한다. 판별 결과는 object·render 형제 fractal이 렌더 가능 여부를 가르는 분기 기준으로 그대로 재사용한다.

## Conventions

- forwardRef·lazy·memo는 함수가 아니라 `$$typeof` 심볼을 가진 객체이므로, 해당 predicate는 각각 React 내부 브랜드 심볼(`Symbol.for('react.forward_ref')` 등)을 로컬 상수로 비교한다 — `react-is` 패키지에는 의존하지 않는다.
- `isReactComponent`는 함수·memo·forwardRef·lazy·클래스 판별의 OR 합성이다. 판별 방식을 바꾸는 변경은 이 합성의 순서와 완전성에 영향을 준다.
- `isFunctionComponent`는 클래스가 아닌 모든 함수에 대해 true다 — 컴포넌트로 쓰이지 않는 일반 함수와 함수형 컴포넌트가 런타임에서 구조적으로 구분되지 않는다는 전제 위에 있다.

## Boundaries

### Always do

- 새 exotic 컴포넌트 판별을 추가할 때는 `$$typeof` 브랜드 심볼 비교 방식을 따르고 `isReactComponent`의 합성에 포함한다
- predicate의 판별 기준을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- `isReactComponent`가 인식하는 컴포넌트 종류의 추가·제거
- 구조적으로 다른 값과 구분 불가능한 predicate(`isFunctionComponent` 등)의 의미론 변경

### Never do

- `react-is` 패키지 의존성을 추가해 브랜드 심볼 비교 방식을 대체
- predicate가 예외를 던지도록 바꿔 boolean 반환 계약을 깨는 경로 추가
