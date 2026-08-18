# cx contract

## Requirements

- `cx(...args)`는 문자열·숫자를 그대로, 배열은 재귀적으로 평탄화하며, 객체는 값이 truthy인 키만 포함해 공백으로 이어붙인 문자열을 반환한다.
- `cxLite(...args)`는 truthy인 인자만 공백으로 이어붙인다 — 배열·객체는 재귀 처리 없이 JS의 기본 문자열 변환으로만 다뤄진다.
- 두 함수 모두 인자가 없거나 전부 falsy면 빈 문자열을 반환한다.

## API Contracts

- `cx(...args: ClassValue[]): string` — falsy 값(`false`/`null`/`undefined`/빈 문자열/`0`/`NaN`)은 최상위에서 걸러진다. 내부 헬퍼 `getSegment`는 export되지 않는다.
- `cxLite(...args: ClassValue[]): string` — `cx`와 동일한 최상위 truthy 필터링을 쓰되, 배열·객체를 재귀 처리하지 않는다.

## Acceptance Criteria

### cx-composition — cx의 재귀적 결합

- 문자열·숫자 인자는 공백으로 이어붙여지고, falsy 인자는 결과에서 제외된다.
- 객체 인자는 값이 truthy인 키 이름만 포함한다.
- 배열 인자는 중첩을 포함해 재귀적으로 평탄화되어 결합된다.

### cxlite-truthy-filter — cxLite의 truthy 필터링과 미가공 처리

- `null`/`undefined`/`false`/빈 문자열/`0`/`NaN`은 결과에서 제외되고, 인자가 없으면 빈 문자열을 반환한다.
- 중복된 클래스명을 제거하지 않고 그대로 이어붙인다.
- 객체·배열 인자는 재귀 처리 없이 JS 기본 문자열 변환 결과로 이어붙여진다(`cx`와 달리 이 지점에서 값이 달라진다).

## Boundary Exemptions

### `cxLite.ts` — cx와 대칭인 경량 변형 유지

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `cxLite`는 `cx`와 같은 인자 형태(`...args: ClassValue[]`)와 반환 타입을 공유하는 대칭적 경량 변형이며, 자신의 JSDoc이 `cx`를 직접 참조한다. 같은 이름 파일(`cx.ts`)과 나란히 fractal root에 두는 것이 이 fractal의 정본 형태이고, organ으로 옮기면 두 파일을 감싸는 배럴 깊이만 늘어난다.

## Last Updated

2026-08-18 — 최초 계약 작성. #329 문서화 작업으로 신설.
