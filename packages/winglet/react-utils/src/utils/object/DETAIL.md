# object contract

## Requirements

- 문자열 키를 가진 딕셔너리에서 값이 React 컴포넌트로 판별되는 엔트리만 남긴 새 객체를 반환한다.
- 컴포넌트가 아닌 값(원시값, 일반 객체·배열 등)은 결과에서 제외된다.
- 컴포넌트 판별은 filter 형제 fractal의 `isReactComponent`를 그대로 재사용하며, 이 fractal은 판별 조건을 자체 구현하지 않는다.
- 입력 딕셔너리는 변형되지 않는다 — 항상 새 객체를 반환한다.

## API Contracts

- `remainOnlyReactComponent(dictionary)`:
  - `dictionary`의 각 키를 순회하며 `isReactComponent(value)`가 true인 엔트리만 결과 객체에 담는다.
  - 결과는 새 객체이며, 입력 `dictionary`는 그대로 유지된다.
  - 판별 범위는 `isReactComponent`에 그대로 종속된다 — 컴포넌트로 쓰이지 않는 일반 함수도 `isFunctionComponent`가 함수와 함수형 컴포넌트를 구조적으로 구분하지 못해 결과에 남는다.

## Acceptance Criteria

### component-only-filtering — 컴포넌트가 아닌 값 제거

- 컴포넌트가 없는 딕셔너리(모든 값이 숫자)는 빈 객체를 반환한다.

### component-value-retained — 컴포넌트 값 보존

- 컴포넌트 함수를 값으로 가진 키는 결과 객체에 그대로 남는다.

## Boundary Exemptions

### `remainOnlyReactComponent.ts` — 단일 공개 유닛 flat 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 이 fractal은 공개 유닛이 하나뿐이라 organ으로 감싸도 배럴 홉만 하나 늘 뿐 경계를 더 명확히 하지 못한다 — 루트 flat 파일이 정본 형태다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성. `remainOnlyReactComponent` 단일 유닛 계약 수립.
