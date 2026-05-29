# combineConditions

## Purpose

문자열 조건 배열을 지정한 논리 연산자(`&&` 또는 `||`)로 결합해
단일 표현식 문자열을 생성하는 순수 함수.
`convertExpression` 이 생성한 개별 표현식을 조합할 때 주로 사용된다.

## Structure

| 파일                   | 역할                                         |
| ---------------------- | -------------------------------------------- |
| `combineConditions.ts` | 구현 — falsy 필터링 + 괄호 래핑 + join       |
| `index.ts`             | `combineConditions` named re-export (barrel) |

## Conventions

- 시그니처: `(conditions: (string | Nullish)[], operator?: '&&' | '||') => string | null`
- falsy 값(`null`, `undefined`, `''`)은 `isTruthy` 필터로 자동 제거
- 필터 후 요소 0개 → `null` 반환, 1개 → 괄호 없이 그대로 반환
- 복수 요소는 각각 `(...)` 로 래핑 후 연산자로 join; 기본 연산자 `'&&'`
- 배열 순회에 `@winglet/common-utils/array` 의 `map` 사용 (native 대신)

## Boundaries

### Always do

- 빈 배열 또는 전부 falsy인 입력에서 `null` 을 반환할 것
- 복수 조건의 각 항목을 `(` `)` 로 래핑하여 연산자 우선순위 충돌 방지

### Ask first

- `'&&'` / `'||'` 이외의 연산자(`??`, `|`) 지원 추가
- 래핑 문자(괄호 외 다른 그룹핑 기호) 변경

### Never do

- 조건 문자열의 내용을 파싱하거나 의미 변환
- 생성된 표현식을 `eval`, `Function()` 등으로 직접 실행
- 연산자 우선순위 판단을 위해 개별 조건 AST 파싱 시도

## Dependencies

- 내부: `@aileron/declare`(`Nullish`)
- 외부: `@winglet/common-utils/array`(`map`), `@winglet/common-utils/filter`(`isTruthy`)
