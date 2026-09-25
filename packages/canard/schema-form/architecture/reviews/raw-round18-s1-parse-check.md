# 18라운드 S1 검증 — 노드별 parse는 값의 수정인가, JS 자동 형변환의 통제된 모사인가 (2026-09-26)

소유자 답 S1(`reviews/round-18-owner-answers.md`)과 소유자의 물음("자동 형변환을 값의 수정으로 보는게 맞을까요? 아니면 js 의 자동형변환 모사동작이라고 주장해도 무방할까요?")에 대해 검증자가 오늘의 파서 다섯을 JavaScript 변환, ajv 8.17.1의 `coerceTypes`(`true`, `array`)와 같은 입력 표로 실행해 비교한 판정이다. 아래는 받은 그대로 옮겼다. 저장소 파일은 쓰지 않았고 임시 파일은 `/tmp/claude-501/s1check/`에 있었다.

**Verdict: 조건부 정당함.** 다만 커밋 165ee8948의 코드를 그대로 두면 이 서술은 성립하지 않습니다. 파서가 하는 일 가운데 JavaScript 변환과 ajv `coerceTypes`의 결과가 모두 일치하는 것은 일부입니다. 뒤에 나오는 표에서 (a)로 표시한 행들이며, 이 부분만 "통제된 모사"라고 부를 수 있습니다. 나머지 행 대부분은 두 기준 어디에도 없는 값 수정입니다. 이 수정들이 유효하지 않은 주입값을 유효한 값이나 "없음"으로 바꾸기 때문에 에러가 보이지 않게 됩니다.

저장소에는 아무것도 쓰지 않았습니다. 실행 전후 `git status`가 최초 스냅숏과 같고, vite 캐시 디렉터리에도 새 파일이 없습니다.

## 1. 파서, JavaScript, ajv 8.17.1 비교 (실행으로 확인)

분류는 네 가지입니다.
- **(a)** JavaScript 변환과 ajv 결과가 모두 같습니다. 무손실 변환입니다.
- **(a′)** JavaScript와는 같지만 여러 입력이 한 값으로 모이는 손실 변환이고, ajv는 형 에러로 거부합니다.
- **(b)** 두 기준 모두와 다릅니다. 이미 목표 형인 값을 바꾸거나 빈 값으로 치환하는 경우도 여기에 넣었습니다.
- **(b 표지)** 실패 표지(`NaN`, `""`)로 바꾸는 경우입니다. 부모 값에서는 `omitEmpty` 기본값 때문에 "없음"이 됩니다.

ajv 칸의 "에러"는 형 에러로 거부하고 원래 값을 그대로 둔다는 뜻입니다.

**수 (`parseNumber`)**

| 입력 | parseNumber | Number(x) | ajv `true` | ajv `'array'` | 분류 |
|---|---|---|---|---|---|
| `"12"`, `" 12 "`, `"-12"`, `"12.5"` | 12, 12, -12, 12.5 | 같음 | 같음 | 같음 | a |
| `"12.5"` 정수 | 12 | 12.5 | 에러 | 에러 | b (절삭) |
| `12.7` 정수 (-12.7도 같음) | 12 | 12.7 | 에러 | 에러 | b (이미 수인 값을 절삭) |
| `"1e5"` (정수도 같음) | **15** | 100000 | 100000 | 100000 | b (뜻이 바뀜) |
| `"0x10"` | 10 | 16 | 16 | 16 | b |
| `"12abc34"` / `"$1,234.56"` / `"1-2"` / `"1.2.3"` | 1234 / 1234.56 / 1 / 1.2 | NaN | 에러 | 에러 | b (문자 제거) |
| `""` | NaN | 0 | 에러 | 에러 | b 표지 (ajv처럼 거부하지만 값은 사라짐) |
| `null` (nullable 아님) / `true` | NaN | 0 / 1 | 0 / 1 | 0 / 1 | b 표지 |
| `[]` / `[5]` | NaN | 0 / 5 | 에러 | 에러 / 5 | b 표지 |
| `{}` / `NaN` | NaN | NaN | 에러 / NaN 통과 | 같음 | JavaScript와 같음, 부모에서는 없음 |
| `"Infinity"` | NaN | Infinity | Infinity | Infinity | b 표지 |

**문자열 (`parseString`)**

| 입력 | parseString | String(x) | ajv `true` | ajv `'array'` | 분류 |
|---|---|---|---|---|---|
| `12`, `NaN`, `-0` | "12", "NaN", "0" | 같음 | 같음 | 같음 | a |
| `true` | **""** | "true" | "true" | "true" | b (지움) |
| `null` (nullable 아님) | "" | "null" | "" | "" | a (ajv 기준) |
| `{}` / `[1,2]` / `["a"]` | "" | "[object Object]" / "1,2" / "a" | 에러 | 에러 / 에러 / "a" | b |

`""`은 부모 값에서 없음이 됩니다.

**불리언 (`parseBoolean`)**

| 입력 | parseBoolean | Boolean(x) | ajv (두 설정 같음) | 분류 |
|---|---|---|---|---|
| `"true"`, `1`, `0` | true, true, false | 같음 | 같음 | a |
| `"false"` | false | true | false | a (ajv 기준, JavaScript와는 다름) |
| `null` (nullable 아님) | false | false | false | a. 다만 값이 새로 생겨 `required`를 통과함 |
| `"1"`, `"0"`, `"abc"`, `"no"`, `2`, `[]`, `{}` | 모두 **true** | true | 에러 | a′ (쓰레기 값이 유효한 true가 됨) |
| `""` | false | false | 에러 | a′ |
| `" TRUE "` | true | true | 에러 | a′ (앞뒤 공백 제거·대소문자 무시) |

**배열·객체 (`parseArray`, `parseObject`)**

JavaScript에는 배열이나 plain object로 가는 암묵 변환이 없습니다. JSON도 마찬가지입니다. `JSON.parse`는 형을 보존하고, `JSON.stringify`는 `NaN`과 `Infinity`를 `null`로, `Date`를 ISO 문자열로 바꿀 뿐입니다.

| 입력 | parseArray | ajv `true` | ajv `'array'` | 분류 |
|---|---|---|---|---|
| `"a,b"` | `[]` (setValue) / 로드 때는 **`["a",",","b"]`** | 에러 | `["a,b"]` | b |
| `5`, `null`, `true` | `[]` | 에러 | `[5]`, `[null]`, `[true]` | b |
| `{}` | `[]` | 에러 | 에러 | b |

| 입력 | parseObject | ajv (두 설정 같음) | 분류 |
|---|---|---|---|
| `[]`, `"x"`, `5`, `null` | `{}` | 에러 | b |
| `Date` | `{}` | **그대로 통과** (object 형으로 인정) | b (ajv가 유효로 보는 값을 버림) |

## 2. 파서를 지나는 쓰기와 실행 결과

**코드 추적.** 모든 쓰기가 `setValue` → `applyValue` → `__emitChange__` → `__parseValue__`를 지납니다.
- 공개 `setValue`: `AbstractNode.ts:355-363`
- 사용자 입력: `SchemaNodeInput.tsx:53`
- 부모에서 자식으로의 전파: `ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:293`
- 로드: 각 노드 생성자. 예를 들어 `NumberNode.ts:131`, `StringNode.ts:117`, `BooleanNode.ts:91`
- reset과 `derived`: `AbstractNode.ts:1087`
- `injectTo`: `AbstractNode.ts:1003`

`parseArray`와 `parseObject`는 terminal 노드일 때만 씁니다. branch 객체는 `null`을 `{}`로 바꾸고(`BranchStrategy.ts:228`), branch 배열은 배열이 아닌 입력을 무시합니다.

**실행 결과** (스키마: `i`는 integer이며 `maximum: 12`, 여섯 필드 모두 required)

| 경로 | 입력 | 결과 값 | 에러 |
|---|---|---|---|
| 로드 | `{n:"12abc34", i:12.7, s:true, b:"abc", ta:"a,b", to:"x"}` | `{"n":1234,"i":12,"b":true,"ta":["a",",","b"]}` | `/s:required`, `/to:required`만 나옴. n, i, b, ta에는 에러가 없고, i는 `maximum`도 통과함 |
| 로드 대조군 | `i:13` | 13 | `/i:maximum` |
| 로드 | `{n:"1e5", i:"12.5", s:12, b:"0", ta:5, to:Date}` | `{"n":15,"i":12,"s":"12","b":true}` | `/ta`, `/to` required |
| 로드 (nullable 아님) | 여섯 필드 모두 `null` | `{"b":false}` | b를 뺀 다섯 필드에 required |
| 루트 `setValue` (전파) | 첫 행과 같은 값 | `{"n":1234,"i":12,"b":true}` (ta는 `[]`) | required만 |
| 잎 `setValue` | n에 `"$1,234.56"`, i에 `13.9` | n은 1234.56, i는 13 | `/i:maximum` |
| 선택 필드 로드 | `{n:"abc", s:true, o:"x"}` 그리고 `{n:true, s:[1,2], o:[1]}` | `{}` | **에러 없음** |

기본 수 입력은 `valueAsNumber`를 보냅니다(`FormTypeInputNumber.tsx:23`). 그래서 입력 경로에서 실제로 작동하는 것은 정수 절삭뿐입니다. 문자 제거와 치환은 주로 로드, `setValue`, 자동 쓰기 경로에서 일어납니다. 이것이 바로 5라운드 발언이 다룬 "값을 주입했을 때"의 상황입니다.

## 3. 원칙이 어디까지 덮는가

설치된 ajv 8.17.1에서 확인한 내용입니다. `lib/core.ts:118-121`의 `// options to modify validated data:` 아래에 `removeAdditional`, `useDefaults`, `coerceTypes`가 있습니다. `README.md:97-99`는 coercing data를 `guide/modifying-data.html#coercing-data-types`로 연결합니다.

또 ajv 소스(`lib/compile/validate/dataType.ts:63-130`)를 보면, ajv는 목표 형이 아닌 값만, 그리고 문자열 전체가 수일 때만(`x && x == +x`) 변환합니다. 절삭, 문자 제거, 빈 값 치환은 하지 않습니다.

두 가지 읽기가 가능합니다.

- **문자 그대로 읽는 경우.** (a)도 원칙에 포함됩니다. `"12"`는 원래 `type: number`에서 실패하는데 변환 뒤에 통과합니다. 소유자가 5라운드에 "그걸 바랐다면 ajv autofix 같은 걸"이라고 가리킨 것도 ajv가 스스로 데이터 수정으로 분류한 기능들입니다.
- **취지로 읽는 경우.** 5라운드의 문제의식은 뜻이 바뀌어 사용자가 혼란을 겪는 것이었습니다. 이 읽기에서는 뜻을 보존하는 (a)는 빠지고, (b)와 b 표지는 온전히 포함됩니다. a′는 경계에 있습니다. JavaScript와는 같지만, 쓰레기 값을 유효한 `true`로 만들어 에러를 숨기기 때문입니다.

(b)가 원칙에 포함된다는 것은 이미 설계 기록에 있습니다. `reviews/round-2.md:151`에 파서 강제 변환을 입력 컴포넌트로 옮기는 근거로 바로 이런 사례(`"1e3"`→13, `"12kg"`→12, 정수 1.9→1)가 적혀 있습니다.

## Findings (심각도 순)

1. **확인됨, 높음.** `src/core/parsers/parseNumber.ts:35,42`: `/[^\d.-]/g`로 문자를 제거하므로 `"1e5"`가 15, `"0x10"`이 10, `"12abc34"`가 1234가 됩니다. 뜻이 바뀌고 형 에러가 사라집니다. 첫 번째 로드 행에서 n 에러가 없습니다.
2. **확인됨, 높음.** `parseNumber.ts:33,37`의 `Math.trunc`: 이미 수인 12.7도 12로 자릅니다. 형 에러와 `maximum` 에러가 함께 사라집니다(대조군 13에서는 에러가 남).
3. **확인됨, 높음.** `parseArray.ts:25`와 `parseObject.ts:32`: 형이 맞지 않는 값을 `[]`와 `{}`로 치환합니다. JavaScript에도 ajv에도 이런 변환은 없고, ajv가 유효로 보는 `Date`도 버립니다.
   - 이 동작은 설계 문서 세 곳에서 이미 폐기하기로 한 것입니다: `adr/0013-core-does-not-rewrite-values.md:91`, `04-inherited-constraints.md:49`(F27), `reviews/round-2.md:151`의 "버린다".
   - 그런데 S1 반영 칸(`reviews/round-18-owner-answers.md:7`)은 `:88`과 `:89`만 대체한다고 적었습니다. 문서끼리 모순입니다.
4. **확인됨, 중간.** 거부된 값은 실패 표지(`NaN`, `""`, `[]`, `{}`)가 되고, `omitEmpty` 때문에 부모에서 없음이 됩니다. 그 결과 필수 필드에서는 `type` 에러가 `required`로 바뀌고, 선택 필드에서는 에러가 전혀 없습니다(선택 필드 행). 결정 1의 "그대로 들어가고 에러로 보인다"를 어깁니다.
5. **확인됨, 중간.** `parseString.ts:37`: `true`, `[1,2]`, `{}`를 `""`로 지웁니다. JavaScript와 ajv는 `true`를 `"true"`로 바꿉니다.
6. **확인됨, 중간.** `ArrayNode/strategies/TerminalStrategy/TerminalStrategy.ts:273-274`: 로드 때 `length`가 있는 값을 순회하므로 `"a,b"`가 `["a",",","b"]`가 됩니다. 같은 값을 `setValue`로 쓰면 `[]`입니다. 파서 밖의 동작이지만 로드 경로에 있습니다.
7. **확인됨, 낮음.** `parseBoolean.ts:40`의 truthiness는 JavaScript에 충실하지만 손실 변환입니다. 또 `src/core/parsers/INTENT.md:10`과 S1 반영 칸은 "파싱 불가 입력은 `false`"라고 적었는데, 실제로 `"abc"`는 `true`가 됩니다. 문서가 틀렸습니다.

## "JavaScript 자동 형변환의 통제된 모사"가 정직한 서술이 되기 위한 조건

1. **기준을 명시합니다.** 기준은 JavaScript의 ToNumber, ToString, ToBoolean이거나 ajv `coerceTypes` 가운데 하나입니다. JSON에는 암묵 형변환이 없으므로 "JSON 자동 형변환"이 가리킬 대상이 없습니다. "통제"는 그 기준의 선언된 부분집합이어야 하며, 기준 밖의 결과를 내면 안 됩니다.
2. **변환은 입력 전체에 대한 기준의 결과이거나, 선언된 거부여야 합니다.**
3. **거부는 보여야 합니다.** 유효한 값이나 없음으로 바뀌면 안 됩니다.
4. **결정 1은 "대상이 아니다"가 아니라 이름 붙은 예외를 기록해야 합니다.** ajv 스스로 이 변환을 데이터 수정으로 분류하기 때문입니다.

이 조건 아래에서 오늘의 동작은 이렇게 나뉩니다. 설계는 결정하지 않았습니다.

- **바꾸거나 명시적 옵션으로 돌려야 하는 것:** Findings 1, 2, 3, 5, 6.
- **의도된 예외로 선언하고 남길 수 있는 것:** a′인 불리언 truthiness와 공백·대소문자 정규화, nullable이 아닌 불리언의 `null`→`false`, `""`과 `null`의 NaN 거부. 거부는 조건 3을 만족할 때만 남길 수 있습니다.
- **이미 충실한 것:** 수 문자열에서 수, 수에서 문자열, `"true"`, `"false"`, `1`, `0`에서 불리언.

## 각 읽기의 결과

- **(1) S1을 그대로 받는 경우 (오늘의 파서가 결정 1 밖이라고 보는 경우).** 문서가 서로 모순됩니다(Finding 3). 실행 결과로 보면 core가 유효하지 않은 주입값을 유효한 값으로 교정하고 있습니다. 5라운드 원칙을 사실상 뒤집는 것이므로, trim 행처럼 "뒤집힘"으로 기록해야 합니다.
- **(2) 문자 그대로 읽는 경우.** (a)를 포함한 모든 변환이 수정입니다. 잎 노드는 틀린 형을 담을 수 없으므로, 결정 1의 "에러로 보인다"는 형이 아닌 제약에만 적용되도록 줄어듭니다.
- **(3) 취지로 읽는 경우.** (a)만 남고 (b)는 입력 컴포넌트나 옵션으로 갑니다. 거부를 보이게 하려면 원래 값이나 형 에러를 담을 자리가 필요합니다. 그러면 S1이 처음 던진 질문, 즉 잎 노드 공개 값의 형이 다시 열립니다.

## Fix spec

설계 선택이 필요하므로 작업자에게 넘길 수 있는 수정 사양은 없습니다. 선택이 정해진 뒤 문서에 반영할 곳만 적습니다. 어느 읽기를 택하든, S1 반영 칸은 다음 둘 가운데 하나를 해야 합니다.
- `adr/0013-core-does-not-rewrite-values.md:91`, `04-inherited-constraints.md:49`, `reviews/round-2.md:151`을 대체 목록에 넣는다.
- 또는 `parseArray`와 `parseObject`를 "그대로 쓴다"에서 뺀다.

## Unverified

- ajv 웹 문서(`modifying-data.html`)의 본문은 가져오지 않았습니다. 설치된 파일의 주석과 링크만 확인했습니다.
- JSON Schema 명세에 형 변환 규정이 없다는 점은 로컬 파일로 확인하지 않았습니다.
- 입력 경로(React 렌더링), reset, `derived`, `injectTo`는 코드로만 추적했습니다.
- 외부 플러그인(antd, mui) 입력이 문자열을 보내는지는 확인하지 않았습니다.

## 임시 파일

모두 `/tmp/claude-501/s1check/` 아래에 있습니다.
- `vite.config.mjs`: `@/schema-form` 별칭 설정. 캐시도 이 디렉터리에 둡니다.
- `parsers.ts`, `parsers.out`: 파서, JavaScript, ajv 비교 표
- `nodes.ts`, `nodes.out`: 로드, 전파, 잎 `setValue`, 검증 실행
- `optional.ts`: 선택 필드 실행
