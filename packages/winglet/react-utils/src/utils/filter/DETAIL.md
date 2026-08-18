# filter contract

## Requirements

- 값의 런타임 형태만으로 React가 인정하는 컴포넌트(함수·클래스·forwardRef·lazy·memo)와 엘리먼트를 판별할 수 있어야 한다.
- forwardRef·lazy·memo처럼 함수가 아닌 객체로 표현되는 exotic 컴포넌트도 빠짐없이 판별해야 한다 — 판별 누락은 소비자 쪽에서 렌더 대상이 조용히 사라지는 형태로 나타난다.
- 각 predicate는 예외를 던지지 않고 항상 boolean을 반환한다.

## API Contracts

- `isClassComponent(component)`: `typeof component === 'function'`이고 `component.prototype.isReactComponent`가 truthy일 때만 true. `Component`/`PureComponent` 상속 클래스가 갖는 프로토타입 마커를 확인한다.
- `isFunctionComponent(component)`: `typeof component === 'function'`이고 `prototype.isReactComponent`가 없을 때 true. 클래스가 아닌 모든 함수에 대해 true를 반환한다 — 컴포넌트로 쓰이지 않는 일반 함수도 구분하지 못한다.
- `isForwardRefComponent(component)`: 객체이고 `$$typeof === Symbol.for('react.forward_ref')`일 때만 true.
- `isLazyComponent(component)`: 객체이고 `$$typeof === Symbol.for('react.lazy')`일 때만 true.
- `isMemoComponent(component)`: 객체이고 `$$typeof === Symbol.for('react.memo')`일 때만 true. `memo()`로 감싼 함수형·클래스형 컴포넌트 모두 해당한다.
- `isReactComponent(component)`: 위 predicate(함수·memo·forwardRef·lazy·클래스)의 OR 합성 — 하나라도 true면 true.
- `isReactElement(object)`: React `isValidElement`의 재수출이다. 자체 판별 로직은 없다.

## Acceptance Criteria

### class-component-detection — 클래스 컴포넌트 판별

- `class extends Component`는 true, 화살표 함수와 `memo()` 래핑 값은 false.

### function-component-detection — 함수 컴포넌트 판별

- 화살표 함수는 true, `class extends Component`와 `memo()` 래핑 값은 false.

### memo-component-detection — memo 컴포넌트 판별

- `memo(화살표 함수)`와 `memo(클래스)` 모두 true.
- 화살표 함수·클래스·숫자·객체·배열은 false.

### react-component-union — 통합 판별의 커버리지

- 클래스·화살표 함수·`memo(화살표 함수)`·`memo(클래스)`·`forwardRef(...)`·`lazy(...)`가 모두 true.
- `null`·`{}`·문자열·숫자·`undefined`는 false.
- forwardRef·lazy 판별이 빠지면 `renderComponent`가 조용히 `null`을 반환해 화면에서 사라지는 회귀로 이어진다.

### react-element-detection — React 엘리먼트 판별

- JSX 엘리먼트는 true.
- `{}`·`[]`·문자열·`null`·숫자·`undefined`는 false.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: predicate마다 독립적으로 tree-shaking 가능해야 하는 함수당 한 파일 flat 컬렉션이 이 fractal의 정본 형태다. organ으로 내리면 배럴 깊이만 늘고, 서브패스 엔트리로 일부 predicate만 가져다 쓰는 외부 소비자(`@canard/schema-form` 등)의 번들 이득이 없다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## History

- 2026-08-18 — `isForwardRefComponent`·`isLazyComponent`를 신설하고 `isReactComponent`의 판별 합성에 포함했다. 이전에는 forwardRef·lazy 값이 기존 predicate 중 어느 것도 인식하지 못해 `isReactComponent`가 false를 반환했고, 그 결과 소비자 쪽에서 렌더 대상이 조용히 `null`로 사라지는 회귀가 있었다.

## Last Updated

2026-08-18 — 최초 계약 작성. 컴포넌트·엘리먼트 판별 predicate 계약 수립.
