# T1-A — union 논리 정합성

**종합 판정: fail.** 현행 원장만으로는 `union` 잎의 동작이 모든 경우에 결정되지 않고, 서로 맞지도 않으며, 예측할 수도 없습니다. 서로 다른 문제는 모순 4건(M1–M4)과 공백 12건(G1–G12)입니다.

경로 기준: `ledger/`·`reviews/`·`spikes/`는 ARCH(`/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture`) 기준이고, `src/`는 PKG(`/Users/Vincent/Workspace/albatrion/packages/canard/schema-form`) 기준입니다. 판정에는 현행 항목만 썼습니다(`현행`·`현행(부정 결정)`·`현행(기록)`).

## 요약: 결정됨 21 / 공백 12 / 모순 6
시나리오 행 39개를 센 수입니다. 한 문제가 여러 행에 걸리므로, 서로 다른 문제로 세면 모순 4건, 공백 12건입니다.

## 시나리오
| # | 입력 | 원장이 정하는 결과 | 근거(ID, path:line) | 판정 |
|---|---|---|---|---|
| A1-a | `['number','string']` | `union` 잎이 됩니다. 접은 집합은 {number,string}이고 행은 `terminal`입니다 | BLUEPRINT-034 ledger/blueprint.md:539-541 | 결정됨 |
| A1-b | `['integer','number']` | number 종류입니다(union이 아닙니다). 정수 규칙과 수 규칙 가운데 무엇을 쓰는지는 M1에 적었습니다 | BLUEPRINT-034 :542, LANDING-130 ledger/landing.md:1884 | 결정됨(종류) |
| A1-c | `['string','null']` | nullable string입니다 | BLUEPRINT-034 :540,:542 | 결정됨 |
| A1-d | `['integer','string','null']` | nullable union {number,string}입니다 | :539-541 | 결정됨(종류) |
| A1-e | `['null']` | null을 빼면 접은 집합이 비어, 규칙의 "둘 이상"에도 "하나"에도 들지 않습니다 | :540-542 | 공백 G1 |
| A1-f | `['integer','boolean']` | union {number,boolean}입니다. `['number','boolean']`과 같은 종류라 노드를 공유할 수 있습니다 | :540-543 | 결정됨(종류) |
| A1-g | `['string','object']` | 청사진 오류 `UNKNOWN_JSON_SCHEMA`입니다 | :549, ERROR-164 ledger/error.md:2395 | 결정됨 |
| A1-h | (추가) `['object','null']`, `anyOf:[{$ref:객체},{$ref:객체},{type:'null'}]` | (5)를 글자대로 읽으면 "object가 원시 타입(null)과 섞인 union"이라 청사진 오류입니다. nullable 플래그 규칙과 TEST-067(b)에 어긋납니다 | :549, :496, :500, TEST-067 ledger/test.md:1081 | 모순 M3 |
| A2-a | `['number','string']` 슬롯을 게이트 없이 `'number'`로 다시 선언(`allOf` 항목, 정적 `$ref`) | 다른 종류의 두 선언이 늘 함께 켜지므로 청사진 오류 `SHARED_NODE_KIND_CONFLICT`입니다 | BLUEPRINT-034 :543-544, BLUEPRINT-012 :214, ERROR-164 error.md:2404 | 결정됨 |
| A2-b | 같은 슬롯을 `then`에서 `'number'`로 다시 선언 | 게이트가 참이 될 때마다 공유 충돌입니다. 마운트 때면 폼이 서지 않고, 마운트 뒤면 앞선 종류(본체 union)로 커밋하고 사슬 끝에서 throw하며 `degraded`가 됩니다. JSON Schema에서 흔한 "본체는 union, `then`으로 좁힘"이 늘 오류가 됩니다. :517이 권하는 형 고르기(`if-then-else`)를 본체의 union 선언과 함께 쓰면 부딪힙니다 | :214, BLUEPRINT-033 :517 | 결정됨(예측성 위험, M2 끝) |
| A2-c | `['string','number']`로 다시 선언(게이트 유무 무관) | 접은 집합이 같으므로 노드 하나를 공유합니다 | :543, BLUEPRINT-010 | 결정됨(유효 `type`의 병합은 G3) |
| A2-d | `['number','string','null']`로 다시 선언 | 같은 종류라 공유합니다. 공유 노드가 nullable인지, `then`이 켜지고 꺼질 때 그것이 바뀌는지를 정한 문장이 없습니다 | :540, :543, VALUE-030 ledger/value.md:439-441 | 공백 G3 |
| A2-e | `{ minimum: 0 }`(type 없음)으로 다시 선언 | 어느 종류와도 맞습니다. 연언(`allOf`·`then`)이면 교차하고, 게이트 없는 분기면 존재만 더합니다 | BLUEPRINT-032 :496, SCHEMA-008 ledger/schema.md:154 | 결정됨 |
| B-1 | `['number','string']`: `true`, `null`(nullable 아님), `{}`, `"42"`, `42` | `"true"`(꺼짐), `null`(켜짐, 경고, 검증기가 있으면 제출 거부), `{}`(켜짐), `"42"`(꺼짐), `42`(꺼짐) | BLUEPRINT-033 :518, WRITE-075 ledger/write.md:1058, VALUE-030 :442, VALUE-033 | 결정됨 |
| B-2 | `['number','boolean']`: `"42"`, `"true"`, `"1"`, `1`, `"abc"` | `42`, `true`, `1`(불리언은 문자열 `"1"`을 받지 않음), `1`, `"abc"`(켜짐). 나머지는 모두 꺼짐 | 같은 곳 | 결정됨 |
| B-3 | `['string','boolean']`: `1`, `0`, `2` | `1`(켜짐, 받아 줄 형이 둘), `0`(켜짐), `"2"`(꺼짐). 1은 그대로 남고 2는 바뀌는 불연속이 있습니다(ajv `coerceTypes`라면 `"1"`) | 같은 곳 | 결정됨 |
| B-4 | `['integer','boolean']`: `"1.5"`, `"2"`, `12.5` | 나열형으로 읽으면 `"1.5"`(켜짐), `2`, `12.5`(켜짐, 단일 정수 노드와 같음)입니다. 접은 형으로 읽으면 `1.5`와 `12.5`가 꺼짐인데 검증기는 형 에러를 냅니다 | :518-519, :540, :545-546, write.md:1058, value.md:443 | 모순 M1 |
| B-5 | `['integer','string']`: `12.5`, `"12.5"` | 나열형이면 `12.5`→`"12.5"`(꺼짐)이고 `"12.5"`는 그대로입니다. 접은 형이면 `12.5`가 그대로 꺼짐인데 검증기는 기각합니다 | 같은 곳 | 모순 M1 |
| B-6 | "단일 타입 노드의 변환은 목록이 하나인 경우다" | string과 boolean은 맞습니다. integer는 나열형에서만 맞는데, 나열형은 `['integer','number','boolean']`에 `"2"`가 오면 받아 줄 형을 둘로 세어 `"2"`를 켜진 채 둡니다(`['number','boolean']`이면 `2`). number는 `NaN`·`±Infinity`가 목록의 한 형인지 정해지지 않았습니다(단일 수 노드는 켜짐). null은 `['null']`이 정해지지 않았습니다 | :519, value.md:443 | 모순 M1, 공백 G1·G2 |
| C1-a | 기본 입력: 어느 정의가 맞는가, 시험이 `type:'union'`을 보는가 | 원장은 union 노드의 `Hint.type`·`schemaType`을 정하지 않습니다. 오늘 hint.type은 `node.schemaType`이고 문자열 정의의 시험은 `{type:'string'}`입니다. `node.type`의 `'union'`을 보게 하면 맞는 기본 정의가 하나도 없어 입력이 그려지지 않습니다 | BLUEPRINT-033 :521, NODE-041 ledger/node.md:600; src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:59,70; src/formTypeDefinitions/FormTypeInputString.tsx:48 | 공백 G4 |
| C1-b | `"42"`를 입력 | 입력이 그려진다고 치면 `['number','string']`은 `"42"`(문자열 원소), `['number','boolean']`은 `42`입니다. 치는 도중의 `"42."`·`"-"`·`"1e"`는 켜지고 경고가 나갑니다(M4) | :518, :521, write.md:1058 | 결정됨(입력 경로는 G4) |
| C1-c | 입력을 비움 | :521은 친 글이 해석을 거친다고 하므로 문자열 입력 그대로면 `""`가 갑니다. REACT-027은 "빈 칸이면 `undefined`"입니다. `['number','boolean']`에서 `""`면 켜지고 경고가 나가며, `undefined`면 없음입니다 | :521, REACT-027 ledger/react.md:411-414 | 모순 M4 |
| C2 | `{type:['number','string'], enum:[1,'a']}` | 해석 규칙은 그대로 적용됩니다(폼은 `enum`을 읽지 않음). 어느 입력이 뽑히는지는 정해지지 않았습니다(오늘 enum 정의의 시험은 `type==='string'`). 문자열 입력이면 `"1"`이 문자열 원소로 남으므로 `1`은 칠 수 없고 검증기가 기각합니다 | :518, SCHEMA-006; src/formTypeDefinitions/FormTypeInputStringEnum.tsx:82-83 | 공백 G4 |
| C3 | 문자열 노드 옵션 | `omitEmpty`는 적용됩니다(`''`는 종류와 무관하게 빈 값). `trim`은 문자열 행의 `finishInput`만 판단하고, union 행의 `finishInput`은 정해지지 않았습니다 | VALUE-034 value.md:536, NODE-007 node.md:142 | 공백 G5(`omitEmpty`는 결정됨) |
| C4 | 항목끼리 맞는가 | 가드 9→10은 NODE-041 node.md:601, NODE-015 충돌 node.md:245, SURFACE-010 충돌 surface.md:244가 모두 같고, 오늘 9개(src/index.ts:46-54)도 확인했습니다. 겉면 멤버 약 57(SURFACE-058 surface.md:882)은 union이 멤버를 더하지 않으므로 영향이 없습니다. `isUnionNode` 이름도 모두 같지만 NODE-041·SURFACE-056에 "(가칭)"이 남아 있습니다. 어긋나거나 빈 것: union 멤버 형의 이름이 없고, SURFACE-056의 "종류 형 일곱"(surface.md:850)에 union 형이 빠져 있습니다. `FormTypeInputProps`의 값 형과 `InferValueType`을 말하는 항목이 없습니다. 멤버 `schemaType`의 union 값도 없습니다 | 셀에 적은 대로 | 공백 G6 |
| C5 | union에 새 오류 코드가 있는가 | 없습니다. `VALUE_TYPE_MISMATCH`(ERROR-186), `UNKNOWN_JSON_SCHEMA`(:549), 공유 충돌 코드를 다시 씁니다 | ERROR-186 error.md:2699, :549, error.md:2404 | 결정됨(코드 겹침은 G11) |
| D1 | 게이트와 식(`if`, `computed`, 18C-13 (5)) | 식의 경로는 투영 뒤의 방출 트리를 읽습니다. union 잎은 해석 뒤의 값을 그대로 방출하며, 바꾸지 못한 값도 그렇습니다. `"42"`와 `42`는 `===`로 다르고, `''`는 `omitEmpty` 때문에 `undefined`로 보입니다. `if`는 검증기의 의미론을 따릅니다 | CONTROLS-080 ledger/controls.md:1216, FRAGMENT-016, WRITE-054 write.md:800, LANDING-136 | 결정됨 |
| D2 | variant 호스트의 판별자 슬롯이 `['string','number']` | 분기의 `kind`에 형을 적으면(`{type:'string',const:'a'}`) 끌어올린 string 선언과 호스트의 union이 다른 종류라 청사진 오류입니다. 분기끼리 형이 다르면 FRAGMENT-007로도 오류입니다. 형 없는 `const`면 게이트가 `./kind === 값`으로 엄격히 비교하므로, 기본 입력으로 친 `"1"`은 `const:1` 분기를 켜지 못합니다 | FRAGMENT-007 ledger/fragment.md:146, FRAGMENT-008, :543-544, :214 | 결정됨(형 없는 const의 "종류"는 G12) |
| D3 | `valueTypeMismatch`·`valueTypeMismatches` | 해석 뒤의 값이 목록의 형이 아니고, 없음도 아니고, nullable 노드의 null도 아니면 켜집니다. 켜진 경로는 루트의 경로 집합에 들고, 같은 커밋에서는 같은 참조를 돌려줍니다 | :518, value.md:442-449, SURFACE-052 surface.md:787-790 | 결정됨(값이 형에 드는지의 판정은 M1·G2) |
| D4 | NODE-056의 충돌 줄 | 맞습니다. closing:990의 "`type`에 적힌 순서로"는 :519와 어긋나고, 결론(수·문자열·불리언 변환을 두 종류 이상이 씀)은 그대로 성립합니다. WRITE-056 write.md:841에도 같은 줄이 있습니다. 변환을 선언 순서로 정하는 현행 항목은 이 둘 말고 없습니다(나머지 "선언 순서"는 키 순서와 전순서 이야기입니다). 형식 문제 셋: node.md:915의 결정 본문에 대체된 구절이 남아 있습니다. :547의 "(3)의 parse"가 가리키는 변환 문장은 대체되었습니다(→ :518). NODE-008 node.md:162, NODE-018 :290-291, LANDING-082 landing.md:1270, SCHEMA-031이 분할된 BLUEPRINT-031을 가리킵니다 | node.md:928 | 결정됨 |
| E1 | `{anyOf:[{type:'string'},{type:'null'}]}`, 자기 `type` 없음 | (5)의 제외로 오류는 아닙니다. nullable string이 된다는 것은 BLUEPRINT-032 보충(null 분기는 nullable 플래그)과 (5)를 거꾸로 읽어서만 나옵니다. 분기에서 종류를 정하는 문장도, 이주 행도 없습니다. 오늘은 `extractSchemaInfo`가 null을 돌려 `UNKNOWN_JSON_SCHEMA`로 폼이 서지 않습니다. 보충의 "현재 isNullBranch가 알아본다"는 객체 호스트에서만 참입니다 | :500, :549; src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:21-23, src/core/nodes/schemaNodeFactory.ts:72-116 | 공백 G7 |
| E2-a | `{anyOf:[{type:'string'},{type:'number'}]}`, 자기 `type` 없음 | 청사진 오류입니다 | :549 | 결정됨(코드 겹침은 G11) |
| E2-b | `{type:['string','number'], anyOf:[{type:'string',minLength:1},{type:'number',minimum:0}]}` | (5)는 "`type` 배열을 더하면 된다"고 합니다. 그러나 게이트 없는 분기는 선언이고 분기의 `type`은 종류로 읽히므로(union ≠ string ≠ number) 청사진 오류가 됩니다. 이 슬롯은 객체 스키마가 아니라 variant 호스트도 아닙니다(BLUEPRINT-017) | :543-544, :549-550, :214, :216, FRAGMENT-001 fragment.md:77, SCHEMA-001 schema.md:65, BLUEPRINT-017 :279 | 모순 M2 |
| E3-a | 단일 형 `{type:'string', nullable:true}` | nullable string입니다 | BLUEPRINT-032 보충 :500 | 결정됨 |
| E3-b | union `{type:['number','string'], nullable:true}` | nullable union입니다. 그런데 입력이 읽는 목록 `node.jsonSchema.type`에 `null`이 없어 :520의 입력 계약으로는 `null`을 보낼 수 없고, REACT-027은 비우기 때 `null`을 보냅니다(M4). ajv 8.17.1은 이 스키마를 컴파일하면서 `type` 배열에 `'null'`을 밀어 넣습니다(실행 확인) | :500, :520, react.md:414 | 공백 G10 |
| E4 | 입력이 읽는 `type` 목록 | `node.jsonSchema`는 병합된 유효 스키마입니다(BLUEPRINT-021 :336). 병합표에 `type` 행이 없어 여러 선언의 목록이 어떻게 합쳐지는지 정해지지 않았습니다. `{anyOf:[{type:['number','string']},{type:'null'}]}`처럼 union이 게이트 없는 분기에서만 선언되면 분기의 제약은 교차하지 않으므로 유효 스키마에 `type`이 없습니다. 그러면 입력이 읽을 목록이 undefined입니다 | :336, schema.md:154, SCHEMA-044 schema.md:626 | 공백 G3 |
| F1 | 생성기가 원시 union을 `anyOf`로 냄 | 이런 스키마가 선다고 기대하는 현행 항목은 없습니다. TEST-067 코퍼스 14종(spikes/guard-cost/redteam3/corpus.mjs)을 훑어보니 원시 union은 0건입니다. (5)에 따라 TypeBox, pydantic `Union[str,int]`, zod 4.0–4.4, 제약이 붙은 zod, OAS 3.0은 모두 청사진 오류이고, `Optional[X]`는 G7에 걸립니다. 코퍼스의 `type:['object','null']`과 `anyOf[객체,객체,null]`은 M3에 걸립니다 | test.md:1081, :549 | 공백 G8 |
| F2 | ajv의 union 경고 | 다루는 항목이 없습니다. ajv 8.17.1 기본값 `strictTypes:"log"`에서는 `['number','string']`, `['integer','number']`, (5)의 처방을 적용한 스키마를 컴파일할 때마다 경고가 찍힙니다(실행 확인) | VALIDATE-003 validate.md:96 | 공백 G9 |
| F3 | bind한 ajv가 검증 데이터를 바꿈 | 검증기가 받는 값이 `getValue()`·방출 캐시와 같은 참조인지 사본인지, 바꾸면 어떻게 되는지 적은 항목이 없습니다. VALIDATE-002는 보장이 미치는 범위를 줄일 뿐입니다 | VALIDATE-001 validate.md:66, VALIDATE-002 :82, VALUE-012 | 공백 G10 |

## 공백과 모순

### M1 — 모순 — `integer`의 형 판정과 변환: 어느 읽기로도 모든 경우가 맞지 않음
- 근거:
  - blueprint.md:540 "`integer`는 `number`로 접는다". 이 문장은 종류를 정할 때만 씁니다.
  - :545-546 "값이 나열된 타입 가운데 하나에 맞으면 그대로 둔다" / "정합은 값이 나열된 타입 가운데 하나라는 뜻이다"
  - :518 "받아 줄 형이 정확히 하나일 때만 그 형으로 바꾸며, 받아 줄 형이 없거나 둘 이상이면 받은 그대로 두고 경고등을 켠다"
  - :519 "단일 타입 노드의 변환은 목록이 하나인 경우다"
  - write.md:1058 "(정수 노드는 결과가 안전한 정수일 때만, 이미 수인 값은 자르지 않는다)"
  - value.md:443 "정수 노드의 정수 아닌 수 … 켜진다"
  - :542 "`['integer','number']`는 number"
- 원장이 지지하는 읽기:
  - (a) 형 판정은 나열된 형으로 합니다(:545-546, :520의 "목록은 `node.jsonSchema.type`").
  - (b) 변환은 목록의 형마다 WRITE-075의 그 형 규칙으로 합니다. :519가 이것을 요구합니다.
  - 이 읽기에서는 union이 단일 정수 노드와 같게 동작합니다(B-4의 12.5는 켜짐).
- 이 읽기가 깨지는 곳:
  - 나열형은 목록에 integer와 number가 함께 있으면 받아 줄 형을 둘로 셉니다. `['integer','number','boolean']`에 `"2"`가 오면 `"2"`가 켜진 채 남습니다.
  - 접은 형은 `['integer','boolean']`·`['integer','string']`의 `12.5`를 정합(꺼짐)으로 둡니다. 그런데 검증기는 형 에러를 내므로 공개 형 판별자(SURFACE-052)와 검증기가 어긋납니다.
  - 한 원소로 접히는 `['integer','number']`와 `['integer','null']`이 정수 규칙과 수 규칙 가운데 무엇을 쓰는지 정한 문장이 없습니다. 오늘은 `schemaType === 'integer'`로 가릅니다(src/core/nodes/NumberNode/NumberNode.ts:104).
- 고칠 문장 안: "union 노드에서 '값이 목록의 한 형'은 JSON Schema의 형 판정이다(`number`는 유한한 수, `integer`는 정수인 유한한 수). '받아 줄 형'은 목록의 형마다 WRITE-075의 그 형 규칙으로 바꾼 결과이며, 결과 값이 같으면 하나로 센다. 한 원소로 접히는 목록은 `number`가 있으면 수 규칙, `integer`만 있으면 정수 규칙을 쓴다."
  - **원리로 도출 가능.** 근거는 :519의 단일 타입 동치, value.md:443, VALIDATE-001의 판정 불변입니다. 경고등이 꺼진 값을 검증기가 형 때문에 기각하면 안 되기 때문입니다.

### M2 — 모순 — (5)의 처방("`type` 배열을 더하면 된다")이 (2)와 BLUEPRINT-012 때문에 청사진 오류가 됨
- 근거:
  - :550 "슬롯에 `type` 배열을 더하면 되고, 이는 검증 결과를 바꾸지 않는다"
  - :543-544 "`union` 노드끼리는 접은 집합이 같을 때만 같은 종류다" / "다른 종류의 선언과 같은 이름이면 BLUEPRINT-011·012의 충돌 규칙을 따른다"
  - fragment.md:77: 게이트 없는 `oneOf`·`anyOf` 분기는 "분기 전체 | 선언"입니다.
  - :216 "게이트 없는 분기끼리 같은 이름·다른 종류의 필드를 두면 … 3행이 된다"
  - :549 자신이 분기의 `type`을 종류로 읽습니다.
  - 참고: 브리프가 든 P1′의 "`oneOf`·`anyOf`의 분기"는 대체된 GOAL-077(goal.md:1111)과 08:48의 문구입니다. 현행 GOAL-026(goal.md:445)에는 없습니다. 다만 현행 SCHEMA-001(schema.md:65)과 FRAGMENT-001이 분기를 조각으로 읽습니다.
- 실패 시나리오: E2-b의 스키마에는 본체의 union, 분기의 string, 분기의 number라는 세 선언이 있고 모두 게이트가 없습니다. 그래서 `SHARED_NODE_KIND_CONFLICT`(error.md:2404)로 폼이 서지 않습니다. 게다가 이 처방은 ajv 기본 설정에서 union 경고를 새로 부릅니다(G9).
- 고칠 문장 안: "자기 `type`을 가진 잎 슬롯의 게이트 없는 `oneOf`·`anyOf` 분기 안 `type`은 종류 선언으로 세지 않는다. 분기의 접은 형이 슬롯의 접은 집합 안이면 검증 전용이고, 밖이면 (5)의 청사진 오류다."
  - **원리로 도출 가능.** 분기는 "또는" 문맥이라 제약을 교차하지 않습니다(fragment.md:77, SCHEMA-008).
- 덧붙여 `allOf`·`then`에서 원소 형으로 좁혀 다시 선언하는 경우(A2-a, A2-b)를 같은 종류로 받을지는 **소유자 판단 필요**입니다. 이유: 【추론】인 (2)가 JSON Schema의 흔한 좁히기를 늘 충돌로 만듭니다. 또 :517이 권하는 형 고르기를 본체의 union 선언과 함께 쓰면 폼이 서지 않거나 `degraded`가 됩니다.

### M3 — 모순 — (5)의 "원시 타입과 섞인" union에 `null`이 드는가
- 근거:
  - :539의 원시 타입 목록에는 `null`이 있습니다.
  - :549 "`object`·`array`가 원시 타입과 섞인 값 union(`type` 배열이거나, 자기 `type` 없이 분기의 `type`이 섞인 …)". "null 분기를 빼고도"는 둘째 절에만 적혀 있습니다.
  - :496, :500: nullable은 플래그이며, null 분기와의 `anyOf`·`oneOf`도 여기에 듭니다.
  - fragment.md:699 "null 분기(`isNullBranch`)는 노드의 nullable 플래그"
  - test.md:1081 "(b) 코퍼스 14종 … 모두 선다."
- 실패 시나리오: 문언대로 구현하면 코퍼스의 OpenAPI-3.1 `$defs/Cat`(`type:['object','null']`)과 pydantic `Optional[Union[Cat,Dog]]`(`anyOf:[{$ref},{$ref},{type:'null'}]`)가 청사진 오류가 되어 TEST-067(b)가 실패합니다. 요약본(reviews/round-18-closing-summary.md:33)은 "오늘과 같은" 오류라고 하지만, 오늘 `['object','null']`은 nullable 객체로 섭니다(extractSchemaInfo.ts:28-30).
- 고칠 문장 안: "(5)의 섞임은 `null`을 빼고 센다. `['object','null']`·`['array','null']`과, 객체(배열) 분기에 null 분기만 더한 `oneOf`·`anyOf`는 nullable 객체(배열)이다."
  - **원리로 도출 가능.** 근거는 BLUEPRINT-032 :496과 FRAGMENT-048 :699입니다.

### M4 — 모순 — 기본 입력(문자열 입력 그대로)과 입력 구성 요소의 계약
- 근거:
  - :520 "`union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며"
  - :521 "문자열 입력을 그대로 쓰고 … 친 글은 위 해석을 거친다"
  - react.md:411-414 "초안 … 은 입력이 스스로 든다" / "노드에는 자기 형의 값이나 없음만 보낸다" / "빈 칸이면 `undefined`를 보낸다" / "비우기 조작은 nullable이면 `null`, 아니면 `undefined`를 보낸다"
  - ERROR-186: 경고는 "정합 상태가 켜질 때마다 한 번" 보냅니다.
- 실패 시나리오:
  - `['number','boolean']`에서 기본 입력을 비우면, 오늘의 문자열 입력은 `""`를 보냅니다(FormTypeInputString.tsx:27-29). `""`는 목록의 형이 아니고 받아 줄 형도 없으므로 켜지고 `VALUE_TYPE_MISMATCH` 경고가 갑니다. 그런데 방출에서는 `omitEmpty`로 빠지므로 값·경고등과 방출이 서로 갈립니다.
  - `42.5`를 치는 동안 `"4"`는 `4`, `"42."`는 켜짐과 경고, `"42.5"`는 꺼짐으로 오갑니다.
  - `nullable:true`인 union은 목록에 `null`이 없어 :520으로는 `null`을 보낼 수 없는데, :414는 비우기 때 보냅니다.
- 고칠 문장 안: "기본 입력 정의가 union 노드에 쓰는 문자열 입력은 비지 않은 글을 그대로 보내고, 빈 칸이면 `undefined`, nullable이면 비우기에 `null`을 보낸다. REACT-027의 '자기 형의 값만 보낸다'는 이 기본 입력에 적용하지 않는다. union 입력 계약의 목록은 `type`의 원소에, nullable이면 `null`을 더한 것이다."
  - 빈 칸과 null 부분은 **원리로 도출 가능**합니다. README §1의 우선순위에 따라 소유자 답(:521)이 편집자 결정(REACT-027)을 이깁니다.
  - 치는 도중의 경고 소음을 받아들일지는 **소유자 판단 필요**입니다. ERROR-186이 켜질 때마다 경고하게 정했고, 기본 입력은 최소 구현이라 받아들일 수도 있기 때문입니다.

### G1 — 공백 — `['null']`
- 근거: :540-542는 null을 빼고, 둘 이상이면 union, 하나면 그 원시 종류라고만 합니다. 원소가 없는 경우는 없습니다. BLUEPRINT-032 :495는 null 종류를 둡니다. 오늘 extractSchemaInfo.ts:26-27은 이것을 null 노드로 만듭니다.
- 고칠 문장 안: "접은 집합이 비면(`['null']`) null 종류이며 nullable이다." (**원리로 도출 가능**)

### G2 — 공백 — union에서 `NaN`·`±Infinity`가 number에 드는가
- 근거: value.md:443 "수 노드의 `NaN`·`±Infinity` … 켜진다". 반면 :518은 목록의 한 형이면 그대로 두고, 받아 줄 형이 없거나 둘일 때만 경고등을 켭니다. `typeof`로 읽으면 `['number','string']`의 `NaN`은 꺼짐이 되어 :519의 동치가 깨집니다. ajv 8.17.1은 `strictNumbers` 기본값 true로 `NaN`·`Infinity`를 number에서 기각합니다(실행 확인).
- 고칠 문장 안: M1의 문장(`number`는 유한한 수)으로 닫힙니다. (**원리로 도출 가능**)

### G3 — 공백 — 유효 스키마의 `type`·nullable 병합과 경고등을 다시 정하는 때
- 근거:
  - blueprint.md:336 "`node.jsonSchema`가 … 메모된 유효 스키마로 바뀐다"
  - 병합표(schema.md:154, :626 등)에 `type` 행도 nullable 행도 없습니다.
  - value.md:439-441 "원본과 노드의 형(`type`, nullable)만의 함수" / "쓰기마다 `interpret`가 한 번 정한다"
- 실패 시나리오:
  - 본체가 `['number','string']`이고 `then`이 `['number','string','null']`이며 값이 `null`일 때, `then`이 켜지고 꺼지는 동안 쓰기가 없으므로 경고등이 낡은 채 남거나, 처음부터 어느 쪽인지 알 수 없습니다.
  - E4의 스키마에는 유효 `type`이 없어 입력이 읽을 목록이 없습니다.
- 고칠 문장 안: "노드의 종류·nullable·union 목록은 청사진이 선언들에서 정적으로 정한다. 목록은 정적 연언(본체·게이트 없는 `allOf`·`$ref`) 선언들의 목록에서 null을 뺀 공통 원소이고, 게이트 없는 분기에만 있으면 그 분기의 목록이다. 유효 스키마의 `type`은 이 목록에 nullable이면 `null`을 더해 싣는다."
  - 정적으로 정한다는 부분은 **원리로 도출 가능**합니다. value.md:441의 "쓰기마다"와 맞추려면 형이 정적이어야 하기 때문입니다.
  - 게이트 가진 선언이 nullable만 더하는 경우를 버릴지는 **소유자 판단 필요**입니다. JSON Schema의 연언으로는 버리는 것이 맞지만 작성자의 기대와 다를 수 있습니다.

### G4 — 공백 — union 노드의 입력 선택(`Hint.type`·`schemaType`·시험)
- 근거:
  - :521 "문자열 입력을 그대로 쓰고 새 입력을 두지 않으며"
  - node.md:600 "`node.type`은 `'union'`"
  - 멤버 `schemaType`은 확정분 44개 안에 있습니다(surface.md:882가 인용하는 `reviews/raw-round17-node-structure.md:136`). 원장에서 `schemaType`과 `Hint`를 찾으면 0건입니다.
  - 오늘 코드: useFormTypeInput.ts:70 `type: node.schemaType`, :59는 맞는 정의가 없으면 `null`을 돌려줍니다. `FormTypeTestObject.type`의 형은 `JSONSchemaType`(src/types/formTypeInput.ts:163)이라 `'union'`을 적을 수 없습니다.
- 실패 시나리오:
  - hint.type에 `'union'`을 주면 기본 입력이 그려지지 않아 :521을 지키지 못합니다.
  - `schemaType`에 목록의 첫 형을 주면 `['number','string']`에 수 입력이 뽑혀, 사실상 "형을 고르는" 입력이 됩니다.
  - C2의 enum 슬롯도 어느 정의가 뽑힐지 정해지지 않습니다.
- 고칠 문장 안: "union 노드의 `schemaType`과 `Hint.type`은 `'union'`이다. 기본 문자열 정의의 시험은 `{ type: ['string','union'] }`이고, `FormTypeTestObject.type`의 형에 `'union'`을 더한다. 기본 enum·radio 정의는 union을 받지 않는다."
  - **원리로 도출 가능.** 공개 인터페이스의 일관성(`node.type`, `isUnionNode`)과 :521을 따른 것입니다.

### G5 — 공백 — union의 `trim`
- 근거: node.md:142 "문자열 행의 `finishInput` 칸이 `options.trim`을 판단". :541은 union 행이 `terminal` 하나라고만 합니다. NODE-006은 "뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다"고 합니다.
- 시나리오: `['number','string']`에 `trim:true`를 두고 `" a "`를 친 뒤 포커스를 잃었을 때 자르는지 정해지지 않았습니다.
- 고칠 문장 안: "union 행의 `finishInput`은 문자열 행의 칸을 공유한다. 값이 문자열이고 `trim`이 켜졌으면 자르고, 그 자동 쓰기는 `interpret`를 거친다." (**원리로 도출 가능**)

### G6 — 공백 — union의 공개 형
- 근거:
  - node.md:599 "공개 판별 합집합과 `InferSchemaNode`에 `union` 멤버를 더한다". 멤버 형의 이름이 없습니다.
  - surface.md:850 "종류 형 일곱(`ArrayNode`·…·`VirtualNode`)"에 union 형이 없습니다.
  - surface.md:790 "`false`이면 `value`가 그 형의 값…"
  - `InferValueType`과 `FormTypeInputProps`의 union 값 형을 적은 항목은 0건입니다.
  - 오늘 `InferValueType`은 배열을 원소별로 나눠 `number | string`을 냅니다(packages/winglet/json-schema/src/types/value.ts:35-37,145-153). `['string','object']`에도 `string | ObjectValue`를 내므로, 청사진 오류인 스키마에 형이 붙습니다.
- 고칠 문장 안: "union 멤버의 공개 형은 `UnionNode`이고 SURFACE-056의 종류 형은 여덟이다. `UnionNode.value`와 `FormTypeInputProps`의 값은 `valueTypeMismatch`가 거짓이면 목록 형들의 값의 합집합, `undefined`, nullable이면 `null`이고, 참이면 `unknown`이다. `InferValueType`은 원시 `type` 배열을 원소별 값 형의 합집합으로 추론한다." (**원리로 도출 가능**. 근거는 SURFACE-052와 NODE-041입니다.)

### G7 — 공백 — 자기 `type` 없는 원시 `anyOf`에 null 분기가 붙은 경우
- 근거:
  - :549의 둘째 절 때문에 오류는 아닙니다.
  - :500 "현재 `helpers/jsonSchema/isNullBranch`가 알아본다". 하지만 오늘 `isNullBranch`를 쓰는 곳은 객체 호스트 합성, `preprocessSchema`의 oneOf 거름, 조건 추출뿐입니다.
  - 잎 슬롯은 extractSchemaInfo.ts:21-23이 null을 돌려주고, schemaNodeFactory.ts:116에서 `UNKNOWN_JSON_SCHEMA`가 됩니다(코드를 따라가 확인).
  - LANDING-129는 `type` 배열만 다룹니다.
- 시나리오: pydantic `Optional[str]`가 내는 `{anyOf:[{type:'string'},{type:'null'}]}`가 새 설계에서 서는지, 어떤 노드가 되는지, 유효 `type`이 무엇인지 정한 문장이 없습니다.
- 고칠 문장 안: "자기 `type`이 없는 슬롯의 게이트 없는 `oneOf`·`anyOf`가 null 분기를 빼고 한 종류면 그 종류의 nullable 잎이며, 유효 `type`은 그 목록에 `null`을 더한 것이다. 오늘 `UNKNOWN_JSON_SCHEMA`이던 스키마가 서게 되므로 이주 행을 둔다." (**원리로 도출 가능**. 12-9와 BLUEPRINT-032가 근거입니다.)

### G8 — 공백 — 생성기가 내는 원시 union(`anyOf`)을 받지 않음
- 근거:
  - :516 목적: "원시 타입이 여럿인 필드를 폼이 받아들이는 것"
  - :549-550의 (5)와 그 처방
  - test.md:1081의 코퍼스에는 원시 union이 없습니다.
- 시나리오:
  - TypeBox `Type.Union([String, Number])`, pydantic `Union[str,int]`, zod 4.0–4.4, 제약이 붙은 zod는 청사진 오류로 폼이 서지 않습니다.
  - OAS 3.0은 `type` 배열을 금하므로 :550의 처방을 쓸 수 없습니다.
  - 처방을 쓰면 M2로 오류가 되고, G9의 경고도 납니다.
- 고칠 문장 안(둘 중 하나):
  - (가) (5)를 유지합니다. 이 제한과 처방을 이주 안내와 배포 문서에 적고, 원시 union을 내는 생성기 표본을 TEST에 더합니다.
  - (나) 자기 `type`이 없는 게이트 없는 원시 `oneOf`·`anyOf`는 분기 `type`의 합집합을 `type` 배열로 읽어 union 잎으로 세웁니다.
  - **소유자 판단 필요.** P1′의 원문(closing:84)은 `type: [number, string]`만 들었습니다. (나)는 분기를 형 선언으로 읽는 새 해석이라 P1′과 FRAGMENT-004의 경계에 닿습니다.

### G9 — 공백 — ajv의 union 경고
- 근거:
  - validate.md:96: 기본값(`allErrors`·`strictSchema:false`·`validateFormats:false`)은 바꾸지 않습니다.
  - `allowUnionTypes`·`strictTypes`를 말하는 항목은 0건입니다.
  - 실행 결과: `strictTypes`의 기본값은 `"log"`입니다. 컴파일할 때마다 `console.warn`으로 "strict mode: use allowUnionTypes to allow union type keyword"가 찍힙니다. 이 경고는 프로덕션에서도 나므로, 폼의 경고 정책(owner-answers:17 "개발 모드 콘솔, 프로덕션은 핸들러가 있을 때만") 밖에 있습니다.
- 고칠 문장 안: "ajv 플러그인 셋의 기본 설정에 `allowUnionTypes: true`를 더한다(판정은 그대로). bind한 인스턴스의 설정은 소비자 몫이며 문서에 적는다."
  - **소유자 판단 필요.** VALIDATE-003은 소유자 답(R1)으로 기본값을 바꾸지 않기로 했습니다.

### G10 — 공백 — 검증기와 가드가 받는 값·스키마의 참조와 변이
- 근거:
  - validate.md:66은 `validator(작성된 스키마, 방출되는 값)`만 적고, 참조인지 사본인지는 적지 않습니다.
  - :82의 "같은 설정"은 보장이 미치는 범위만 줄입니다.
  - 플러그인은 값을 복사하지 않고 넘깁니다(schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25).
  - 실행 결과: `coerceTypes`·`useDefaults`·`removeAdditional`은 같은 참조를 제자리에서 바꿉니다. `{a:1,c:'true',extra:5}`가 `{a:"1",c:true,b:"D"}`가 되었습니다.
  - 실행 결과: `nullable:true`와 `type` 배열이 함께 있으면, 플러그인의 `{...schema}` 경로로 컴파일할 때 작성된 중첩 스키마의 `type` 배열에 `'null'`이 들어갑니다.
- 실패 시나리오(방출 트리를 참조로 넘긴다면):
  - (1) `['string','boolean']` 필드의 `1`(켜짐)을 `coerceTypes` 검증기가 방출 객체 안에서 `"1"`로 바꿉니다. 원장이 버린 선언 순서 변환이 되살아납니다. `getValue()`는 `"1"`, `node.value`는 `1`, 경고등은 켜짐으로 갈립니다. 원본이 바뀌지 않았으므로 VALUE-012대로 직전 참조를 두어 이 상태가 계속 남습니다.
  - (2) `useDefaults`가 `setValue(undefined)`로 비운 키에 `default`를 써 넣어, WRITE-090이 `getValue()`에서 깨집니다.
  - (3) `removeAdditional`이 방출에서 `extras`를 지웁니다.
  - (4) 스키마 쪽: LANDING-073(landing.md:1137 "`Form`의 스키마 `clone`은 없앤다")과, 지울 키가 없으면 원본을 돌려주는 strip(src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:36)을 합치면, 작성된 스키마 자체가 바뀌어 BLUEPRINT-001이 깨질 수 있습니다(가능성 있음, 확인은 못 함).
- 고칠 문장 안: "검증기와 가드는 방출 트리를 참조로 받고 바꾸지 않는다(플러그인 계약). 값을 바꾸는 옵션을 켠 인스턴스를 bind하는 것은 지원 범위 밖이며, 개발 모드에서는 검증기에 넘기는 방출 트리를 얼려 위반을 드러낸다. core는 검증기에 늘 작성 스키마의 사본을 넘긴다."
  - **원리로 도출 가능.** 근거는 VALIDATE-001·002와 BLUEPRINT-001이고, 속도가 우선이므로 검증마다 복사하는 대신 계약으로 막습니다.

### G11 — 공백(경미) — 타입 없는 원시 `anyOf`의 오류 코드가 둘에 걸림
- 근거: :549는 `UNKNOWN_JSON_SCHEMA`, error.md:2404는 `SHARED_NODE_KIND_CONFLICT`(게이트 없는 선언끼리 같은 이름·다른 종류)입니다. 분기의 `type`을 선언으로 읽으면 E2-a는 두 규칙 모두에 걸립니다.
- 고칠 문장 안: "자기 `type` 없는 원시 `oneOf`·`anyOf`의 섞임은 `UNKNOWN_JSON_SCHEMA` 하나로 보고한다." (**원리로 도출 가능**. 더 좁은 규칙이 이깁니다.)

### G12 — 공백(경미) — 판별 키의 형 없는 `const`끼리 JSON 형이 다를 때
- 근거: fragment.md:146 "있는 분기끼리 종류가 다르거나 … 청사진 오류". :496은 형 없는 overlay가 어느 종류와도 맞는다고 합니다. FRAGMENT-007 보충에 적힌 소유자 O-1은 "분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다"입니다.
- 고칠 문장 안: "판별 키 분기 선언은 `type`이 없으면 `const`·`enum` 값의 JSON 형으로 종류를 센다." (**원리로 도출 가능**. 소유자 O-1의 원문이 근거입니다.) 이렇게 하면 형이 섞인 union 판별자는 늘 오류가 됩니다.

## 확인하지 못한 것
- 새 설계는 아직 코드가 없으므로, 결과는 모두 원장 규칙을 따라가 얻은 것입니다.
- 오늘 동작 가운데 자기 `type` 없는 슬롯이 `UNKNOWN_JSON_SCHEMA`가 된다는 것은 코드를 읽어 확인했고 실행하지는 않았습니다.
- 생성기 출력(TypeBox, pydantic, zod, OAS 3.0)에 대한 사실은 브리프의 조사를 그대로 썼습니다.
- ajv에 대한 사실은 ajv 8.17.1과 플러그인 기본 설정으로 실행해 확인했습니다: `strictTypes:"log"`와 union 경고, `NaN`·`Infinity` 기각, 제자리 변이, `nullable`+`type` 배열의 변이, `type` 없는 `nullable`의 throw.
- G10 (4)는 실제로 드러나는지 확인하지 못해 "가능성 있음"으로 적었습니다. 새 core가 그룹 키가 없을 때도 사본을 넘기는지, 유효 스키마가 `type` 배열을 공유하는지 원장이 정하지 않았기 때문입니다.
- 원장 기계 검사(verbatim, ref 등)는 이번 범위가 아니라 돌리지 않았습니다.