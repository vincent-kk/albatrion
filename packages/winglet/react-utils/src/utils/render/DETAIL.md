# render contract

## Requirements

- ReactNode·컴포넌트 타입·이미 생성된 엘리먼트 중 무엇이 들어오든 렌더 가능한 형태로 정규화한다.
- falsy 값과, 엘리먼트도 컴포넌트도 아닌 truthy 값(문자열·숫자 등)은 모두 `null`로 수렴한다 — 텍스트를 그대로 렌더하는 경로는 없다.
- 엘리먼트 판별과 컴포넌트 판별은 filter 형제 fractal에 위임하며 중복 구현하지 않는다.

## API Contracts

- `renderComponent(Component, props?)`:
  - `Component`가 falsy(`0`, `''`, `false`, `null`, `undefined` 등)면 `null`을 반환한다.
  - `isReactElement(Component)`가 true면 `Component`를 그대로 반환한다(참조 동일성 유지).
  - 그 외 `isReactComponent(Component)`가 true면 `createElement(Component, props)` 결과를 반환한다.
  - 위 어느 것에도 해당하지 않으면(문자열·숫자 등 truthy 비컴포넌트 값 포함) `null`을 반환한다.

`0`과 빈 문자열도 다른 falsy 값과 같은 비렌더 입력입니다. 이 헬퍼는 텍스트를 렌더하는 경로를 제공하지 않으므로 유효한 ReactNode라는 이유만으로 직접 출력하지 않습니다.

## Acceptance Criteria

### falsy-to-null — falsy·비컴포넌트 truthy 입력은 null

- `0`, `''`, `false`, `null`, `undefined`는 모두 `null`을 반환한다.
- `42`, `'not a component'`처럼 truthy이지만 엘리먼트도 컴포넌트도 아닌 값도 `null`을 반환한다.

### element-passthrough — 엘리먼트는 참조 동일성 유지한 채 반환

- JSX 엘리먼트를 전달하면 동일 참조(`toBe`)로 그대로 반환된다.

### component-instantiation — 컴포넌트 타입은 인스턴스화

- 함수 컴포넌트·클래스 컴포넌트에 props를 전달하면 정의된 결과를 반환한다.
- `isReactComponent`가 인식하는 exotic 컴포넌트(forwardRef 포함)도 렌더 대상이 된다 — 판별 누락 시 조용히 `null`이 되어 화면에서 사라지는 회귀를 막는다.

## Boundary Exemptions

### `renderComponent.tsx` — 단일 공개 유닛 flat 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 이 fractal도 공개 유닛이 하나뿐이라 organ으로 감싸는 재배치는 배럴 홉만 늘릴 뿐이다 — 루트 flat 파일이 정본 형태다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

render의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
