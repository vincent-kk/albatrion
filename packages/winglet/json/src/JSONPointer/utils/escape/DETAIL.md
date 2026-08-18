# escape contract

## Requirements

- 세그먼트 안의 리터럴 틸드(`~`)와 슬래시는 각각 `~0`, `~1`로 이스케이프되고, `~0`, `~1`은 다시 틸드와 슬래시로 언이스케이프된다.
- 경로 단위 이스케이프는 세그먼트 내용만 변환 대상으로 삼고, 세그먼트를 나누는 구조적 슬래시는 변환하지 않는다.
- 유효하지 않은 이스케이프 시퀀스(틸드 뒤에 `0`이나 `1`이 아닌 문자, 후행 단독 틸드 포함)는 언이스케이프 시 에러 없이 원문 그대로 유지된다.
- 특수문자가 전혀 없는 입력은 네 공개 함수 모두 원본과 동일한 문자열을 반환한다(빈 문자열 포함).

## API Contracts

- `escapeSegment(segment)` → 세그먼트 문자열 하나를 받아 틸드와 슬래시를 각각 `~0`, `~1`로 치환한 문자열을 반환한다. 특수문자가 없으면 입력과 동일한 값을 반환한다.
- `escapePath(path)` → 여러 세그먼트로 이루어진 전체 포인터 경로를 받아 각 세그먼트에 `escapeSegment`를 적용하고 구조적 구분자로 재결합한 문자열을 반환한다.
- `unescapePath(segment)` → 이스케이프된 토큰을 받아 `~0`, `~1` 시퀀스를 틸드와 슬래시로 되돌린 문자열을 반환한다. 유효하지 않은 시퀀스는 변경 없이 유지한다.
- `unescapeSegment` → `unescapePath`의 별칭이다. 별도 구현 없이 동일한 함수를 가리킨다.

## Acceptance Criteria

### segment-escape — 세그먼트 단위 이스케이프 규칙

- `escapeSegment`는 세그먼트 내 틸드를 `~0`으로, 슬래시를 `~1`로 치환하고, 두 문자 모두 없으면 원본을 그대로 반환한다.
- 연속된 특수문자와 두 문자가 섞인 세그먼트도 각 문자를 개별적으로 치환한다.
- 빈 문자열 입력은 빈 문자열을 반환한다.

### path-escape — 경로 단위 이스케이프와 구분자 보존

- `escapePath`는 슬래시로 나눈 각 세그먼트에 `escapeSegment`를 적용한 뒤, 재결합에 쓰는 구조적 슬래시는 이스케이프하지 않는다.
- 빈 경로, 루트 경로, 선행 슬래시 없는 단일 세그먼트를 각각 정의된 대로 처리한다.
- 세그먼트 내용 자체에 슬래시가 있으면(테스트 예: `foo/bar` → `foo~1bar`) 구조적 슬래시와 구별되도록 `~1`로 이스케이프된다.

### unescape-roundtrip — RFC 6901 언이스케이프와 왕복 정합

- `unescapePath`는 `~0`을 틸드로, `~1`을 슬래시로 되돌리고, `~2`·`~z`·후행 단독 틸드 등 유효하지 않은 시퀀스는 원문 그대로 보존한다.
- 별칭 `unescapeSegment`는 `unescapePath`와 동일한 함수이며 모든 케이스에서 동일한 결과를 낸다.
- RFC 6901 예시 `/clients/~1/scopes`를 이스케이프한 값과 그 값을 언이스케이프한 결과가 각 스위트에서 서로 대칭인 리터럴로 고정되어 있어, 두 방향이 서로의 역함수임이 교차 검증된다.

## Boundary Exemptions

### `*.ts` — flat 단일 함수 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`, `getJSONPointer.ts`, `compareRecursive.ts`, `compileSegments.ts`, `applySinglePatch.ts`
- **Direct import**: `allowed`
- **Reason**: `escapePath`·`escapeSegment`·`unescapePath`는 이름이 같은 대표 파일 없이 함수당 한 파일로 나뉜 flat 컬렉션이 정본 형태다 — organ 재배치는 배럴 깊이만 늘리고 세그먼트 단위·경로 단위라는 서로 다른 소비 형태를 흐린다. 포인터 역탐색·패치 비교·세그먼트 컴파일·패치 적용 등 형제 연산 fractal은 순회 핫패스에서 개별 함수 파일을 직접 참조해 배럴 재수출 그래프 전체가 딸려오는 것을 피한다. zero-peer 승인은 `.filid` 설정의 scoped exempt(zero-peer-file)와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
