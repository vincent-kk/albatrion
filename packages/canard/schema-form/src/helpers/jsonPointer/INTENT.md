# jsonPointer — schema-form 경로 문법 경계

## Purpose

RFC 6901의 루트, 구분자, fragment 표기에 schema-form 전용 Parent, Current, Wildcard, Context 심볼을 더한 경로 문자열 계약을 소유한다. 경로의 접두사를 판별하고, 상대 경로를 결합하고, fragment와 루트 표기를 정규화한다.

필드 노드 탐색이나 포인터가 가리키는 값의 조회는 소유하지 않는다. 슬래시 한 글자를 빈 루트로 정규화하는 폼 내부 규칙은 RFC 6901이 빈 이름의 멤버로 해석하는 것과 다르다.

## Conventions

- `JSONPointer.Index`는 폐기 예정인 별칭이므로 새로 쓸 때는 `Wildcard`를 고른다.
- `getAbsolutePath`는 `./`로 시작하면 현재 경로에 붙이고, `../`로 시작하면 부모로 올라간다. 부모로 올라가는 동작은 루트에서 멈추며, 절대 경로와 “#/a/b” 같은 URI fragment 입력은 그대로 반환한다.
- `stripFragment`는 URI fragment의 해시를 제거한다. 해시만 있는 입력, 해시와 슬래시만 있는 입력, 슬래시만 있는 입력은 모두 빈 루트 문자열로 정규화한다. 해시와 슬래시는 파일 경로가 아니라 JSON Pointer fragment 문법이다.
- 경로 유틸은 외부 상태 없이 문자열 접두사와 구분자를 직접 비교한다. 접두사를 판별한다고 해서 나머지 경로 문법까지 검증하는 것은 아니다.

## Boundaries

### Always do

- 확장 심볼(`..`, `.`, `*`, `@`)을 쓸 때는 RFC 6901 표준 문법과 어떻게 다른지 밝힌다.
- `getAbsolutePath`가 URI fragment 입력을 직접 받는 계약을 유지한다. fragment를 제거해야 하는 소비자만 따로 `stripFragment`를 호출한다.
- 슬래시만 있는 입력을 폼 전용으로 루트 정규화하는 동작을 바꿀 때는 표준 포인터의 빈 이름 멤버와 구분해 계약을 검토한다.

### Ask first

- 새 확장 심볼 추가(computed 표현식 파서와 경로 해석 전반에 영향을 준다)
- `getAbsolutePath`에 부모 이동 횟수 제한이나 오류 처리 추가

### Never do

- `JSONPointer.Index`를 새 코드에서 사용하지 않는다.
- 경로 유틸에 외부 상태 접근이나 의도적인 오류 발생을 추가하지 않는다.
