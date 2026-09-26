# 검증 V2

## 판정: 고침 필요 (15건)

검증 방법: 네 제안을 모두 읽었습니다. 인용된 원장 항목(BLUEPRINT-011/012/021/032–035, NODE-011/015/020/028/041/042/046/047, SURFACE-052/056/058, VALUE-012/030/033/034, WRITE-013/056/071/075/079/082/083/084/090, VALIDATE-002/003/004/007/018/043/044, ERROR-186/200, REACT-027, CONTROLS-006/074/080, FRAGMENT-001/007/008/048/049, SCHEMA-001/007/008/012/036, LANDING-130/151)은 `ARCH/ledger/*.md`에서 원문으로 대조했습니다. `path:line`은 제안마다 8곳 이상을 직접 열어 확인했습니다. 실행으로 확인한 것은 셋입니다. `d-rule-a.mjs`를 돌려 D의 결과(`tieCount: 12`, 순서·멱등 위반 0)가 재현됐습니다. ajv 8.17.1은 `['string','number']`에서 `strictTypes` 경고를 1회 내고, `{type:[..], nullable:true}`를 컴파일하면 작성자 배열이 `["string","number","null"]`로 바뀌었습니다(C 32·D 32의 전제 확인). A의 형 탐침(`$TMPDIR/lensA`)은 컴파일은 돌지만, 결과 형은 일부만 확인했습니다.

## 지적 (심각한 것부터)

### 1 — C — 형 없는 객체·배열 호스트를 새로 받아들임. 소유자 결정 범위를 넘었고, 표시도 이주 행도 없음 (확인됨)
- 인용 C: "fold(U) = {object}이면 variant 호스트이고 null 분기가 있으면 nullable이다(t1a M3의 수정문). fold(U) = {array}이면 분기를 조각으로 가진 배열 노드다." (`out-C.md:30`, 제안 16)
- 인용 결정(brief-common §2): "**Primitive `anyOf`/`oneOf` without own `type`** (option 나): read the union of gate-less branch `type`s as the slot's list"
- 인용 오늘 코드: `extractSchemaInfo.ts:22-23` `if (type === undefined) return null;` → `schemaNodeFactory.ts:116` `UNKNOWN_JSON_SCHEMA`. 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 오늘 청사진 오류입니다.
- 원장에는 형 없는 객체 호스트에 관한 규칙이 없습니다. BLUEPRINT-034 (5)는 원시 anyOf와 섞인 union만 다룹니다. 배열 호스트가 `oneOf`·`anyOf`를 조각으로 갖는다는 규칙도 원장에 없습니다(FRAGMENT-001의 variant는 객체 호스트 문맥입니다).
- 그래서 이 규칙은 (b) 소유자 결정 (나)를 원시에서 객체·배열로 조용히 넓힌 것입니다. "소유자가 정해야 할 것"에도 없고, 이주 표 M1–M13에도 행이 없습니다.
- 고침 안: 제안 16의 "fold(U) = {object}…"와 "fold(U) = {array}…" 두 문장을 지우고 "fold(U)가 {object}나 {array}이면 오늘처럼 `UNKNOWN_JSON_SCHEMA`(처방: 슬롯에 `type`을 적는다)"로 바꿉니다. 받아들이려면 "소유자가 정해야 할 것"에 새 항목과 이주 행을 더합니다. — 원리로 도출 가능(결정 범위 밖은 오늘 동작 유지)

### 2 — 넷 모두 — 소유자 결정 때문에 바뀌어야 하는 현행 원장 문장을 아무도 ID로 올리지 않음 (확인됨)
- 인용 원장 BLUEPRINT-034 (1): "선언 하나의 `type`이 원시 타입(`string`·`number`·`integer`·`boolean`·`null`)만의 배열이면 잎 노드 하나가 된다." (`ledger/blueprint.md:539`)
- (5): "`object`·`array`가 원시 타입과 섞인 값 union(`type` 배열이거나 …)과, … 자기 `type`이 없는 원시 `anyOf`·`oneOf`는 청사진 오류다" (`blueprint.md:549`)
- (4): "패키지의 기본 입력 정의는 `union` 노드를 문자열 입력으로 그리고" (`blueprint.md:547`)
- BLUEPRINT-033: "기본 입력 정의(…)는 문자열 입력을 그대로 쓰고 새 입력을 두지 않으며" (`blueprint.md:521`)
- 제안 쪽: C 19·23은 객체·배열이 든 union을, C 13–16은 형 없는 원시 anyOf를 받습니다. B 22–25는 초안 규칙과 읽기 전용 JSON을 가진 감싸개를, B 27은 enum·radio 정의를 둡니다. 모두 위 문장과 어긋나는데, 어느 제안도 이 항목 ID를 "바뀜"으로 적지 않았습니다. C의 오류 표(`out-C.md:83`)는 오히려 BLUEPRINT-034 (5)를 근거로 인용합니다.
- 고침 안: 아래 "원장 변경 목록"의 BLUEPRINT-033·034 행을 합본에 넣고, 각 행에 대체하는 소유자 결정(2026-09-26 (c), (나), 기본 입력 초안 (나))을 출처로 적습니다. — 원리로 도출 가능

### 3 — D — union의 루트·배열 아이템 채움 규칙이 VALUE-034 문장과 다름. 원장 변경으로 적지 않음 (확인됨)
- 인용 D 19: "루트와 배열 아이템 자리의 채움 값은 **원본 값의 JSON 종류**로 정합니다. 원본이 객체면 `{}`, 배열이면 `[]`" (`out-D.md:85`)
- 인용 원장 VALUE-034: "루트는 방출이 없을 때 루트 종류의 빈 그릇을 `outputValue`로 준다: 객체 루트는 `{}`, 배열 루트는 `[]`, 그 밖의 루트는 `undefined`다." / "잎 아이템은 `null`로 그 자리를 채운다" (`ledger/value.md:538,540`)
- NODE-047은 union을 잎으로 분류합니다(`node.md:726`). 그래서 원장대로라면 원본이 `{}`인 union 루트는 `undefined`, 아이템은 `null`입니다. D는 원소 하나 = 단일 노드의 일관성을 근거로 이를 알면서 바꿨습니다(a). 그런데 VALUE-034를 바뀌는 항목으로 올리지 않았고, D 20은 같은 항목을 "그대로" 근거로 인용합니다.
- 고침 안: 원장 변경 목록에 "VALUE-034 보충: 루트·아이템의 채움은 종류가 아니라 원본의 JSON 종류로 정한다(union과 터미널 객체·배열)"를 넣습니다. D 19의 근거 줄에 "VALUE-034 변경"을 적습니다. — 원리로 도출 가능(D 스스로 원소 하나 = 단일 노드로 도출함)

### 4 — C — `oneOf`와 `anyOf`가 함께 있으면 오류라는 규칙이 틀린 전제에 섰고, 소유자 결정 (나)를 표시 없이 좁힘 (확인됨)
- 인용 C 13: "`oneOf`와 `anyOf`가 함께 있으면 `UNKNOWN_JSON_SCHEMA`이고 … (SCHEMA-036이 아직 열려 있으므로 합치는 규칙을 만들지 않는다)" (`out-C.md:27`)
- 인용 원장: "SCHEMA-036 | 열림: 같은 호스트의 `oneOf`와 `anyOf` 분기의 동순위 | 대체됨(→ FRAGMENT-049)" (`ledger/schema.md:44`). FRAGMENT-049(현행): "같은 호스트에서 `oneOf[i]`는 모든 `anyOf[j]`보다 앞이다." (`fragment.md:714`)
- (b) 놓친 것입니다. 결정 (나)는 이 경우를 빼지 않았는데 C는 오류로 좁혔고, "소유자가 정해야 할 것"에도 올리지 않았습니다.
- 고침 안: 근거를 SCHEMA-036에서 "두 키워드는 연언이므로 목록은 두 합집합의 교집합"(정적 연언 규칙 9와 같은 원리)으로 바꿉니다. 교집합의 fold가 비거나 섞이면 `UNKNOWN_JSON_SCHEMA`입니다. 오류로 남기려면 소유자 항목으로 올립니다. — 원리로 도출 가능(연언 = 교집합)

### 5 — A — 형을 가진 슬롯의 null 분기도 `nullable`을 켜게 됨. 오늘 동작과 다르고 이주 행이 없음 (plausible: A가 형 있는 슬롯까지 뜻했는지 문장만으로는 확정 불가)
- 인용 A 2: "union을 포함한 모든 종류에서, 세 표기 가운데 하나라도 있으면 `true`입니다: 목록에 든 `'null'`, `nullable: true`, 게이트 없는 null 분기" (`out-A.md:14`)
- 오늘 코드: `{type:'object', oneOf:[…,{type:'null'}]}`의 nullable은 자기 `type`에서만 나옵니다(`extractSchemaInfo.ts:32-35`). null 분기는 건너뛰기만 합니다(`getCompositionNodeMapList.ts:69-71`). `warnIfNullUnreachable.ts`는 `parentNode.nullable === false`이면 판정을 끝냅니다. 곧 형 있는 객체의 null 분기는 오늘 nullable을 주지 않습니다.
- C 24는 반대로 정합니다: "자기 `type`이 non-null인 슬롯에 붙은 null 분기는 nullable을 주지 않는다". A의 이주 표(`out-A.md:76-87`)에는 이 변화가 없습니다.
- 고침 안: A 2의 셋째 표기를 "자기 `type`이 없는 슬롯의 게이트 없는 null 분기"로 한정합니다(C 24·오늘 코드와 같게). 넓히려면 이주 행 "형 있는 호스트 + null 분기 → nullable이 됨"을 더합니다. — 원리로 도출 가능(연언 의미, 오늘 동작 유지)

### 6 — D — 소유자가 확정한 객체 멤버십(`typeof`/`Array.isArray`)을 다시 엶. 비 union 노드의 동작도 바뀜 (확인됨)
- 인용 결정(brief-common §2 (c)): "no conversion to/from object/array (membership by `typeof`/`Array.isArray`)"
- 인용 D 2: "`object` | 평범한 객체(… 프로토타입이 `Object.prototype` 또는 `null`)" (`out-D.md:24`), 그리고 소유자 항목 1: "이 판정은 단일 터미널 객체 노드(원소 하나인 경우)에도 그대로 적용되므로 사용성 변화" (`out-D.md:177`)
- 이 항목은 소유자에게 올라가 있어 절차상 허용됩니다. 다만 두 가지가 빠졌습니다. 첫째, 채택하면 비 union 터미널 객체 노드마다 쓰기 1회당 `Object.getPrototypeOf`가 더해지고(속도 가치), `Date`·`File`을 든 기존 폼에서 경고등이 새로 켜집니다. 둘째, 이에 대한 이주 행이 없습니다.
- 고침 안: 권고로 두되 "소유자 결정 (c)를 다시 여는 안"이라고 명시합니다. 채택하면 이주 행 "터미널 객체·객체 union에서 비평범 객체는 경고등"과 비용 줄을 더합니다. — 소유자 판단 필요(확정 사실의 재개)

### 7 — D — 값을 바꾸는 검증기의 사본 경로가 VALIDATE-002를 "지킨다"고 적었지만 실제로는 넓힘. 오늘 동작과 달라지는데 이주 행 없음 (계약 문구는 확인됨, 오늘 값 변이 경로는 plausible)
- 인용 D 31: "이 동작은 VALIDATE-002의 "같은 설정" 보장을 지킵니다." (`out-D.md:103`)
- 인용 원장 VALIDATE-002: "**같은 설정**은 … 값을 바꾸는 옵션(`coerceTypes` 등)을 쓰지 않는 것을 뜻한다." (`ledger/validate.md:84`)
- 원장은 값을 바꾸는 인스턴스를 계약 밖에 둡니다. D는 그 인스턴스까지 계약 안으로 들이므로, 이는 VALIDATE-002의 변경입니다(a, 목록에 없음).
- 오늘은 `validate(this.__enhancedValue__)`처럼 살아 있는 값을 참조로 넘깁니다(`AbstractNode.ts:718`, `ValidationManager.ts:121-125`). ajv 플러그인도 복사하지 않습니다(`createValidatorFactory.ts:23-25`). 그래서 `useDefaults`·`coerceTypes` 인스턴스를 `bind`한 폼은 오늘 값이 제자리에서 바뀝니다. D의 사본 경로를 적용하면 이 효과가 사라지는데, D에는 이주 문장이 없습니다.
- 고침 안: D 31을 "VALIDATE-002의 '같은 설정'을 값을 바꾸는 인스턴스까지 넓힌다(원장 변경)"로 고칩니다. 이주 행 "바인딩한 ajv의 `useDefaults`·`coerceTypes`가 더는 폼 값을 바꾸지 않는다"를 더합니다. — 원리로 도출 가능(문구 정정). 채택 자체는 이미 보류 중인 소유자 결정입니다.

### 8 — B — 시험 객체의 `schemaType` 배열과 노드의 `schemaType` 배열이 같은 이름, 다른 뜻 (확인됨)
- 인용 B 16: "`FormTypeTestObject.schemaType`의 형은 `JSONSchemaType | JSONSchemaType[]`입니다('null' 없음). 여기서 배열은 "그중 하나"라는 뜻이고 union 목록이 아닙니다." (`out-B.md:42`)
- 인용 B 9: `Hint.schemaType`은 "union에서만 배열입니다" (`out-B.md:29`). B 12: "노드, Hint, 입력 prop에서 같은 이름은 같은 값입니다."
- `{schemaType:['string','number']}`는 읽기로는 "string·number union"인데, 실제로는 string 노드와 number 노드에 맞고 union에는 맞지 않습니다. `type` 키는 노드 값이 배열일 수 없어 이 충돌이 없지만, `schemaType` 키에서는 설계 가치 "같은 이름은 같은 뜻"이 깨집니다. B가 표로 알린 함정(`out-B.md:48`)을 없애지 않고 문서로 남긴 것입니다.
- 고침 안: `FormTypeTestObject.schemaType`의 형을 스칼라 `Exclude<JSONSchemaType,'null'>`로 두고 배열을 받지 않습니다. 배열이 오면 B 15의 등록 경고를 냅니다. "그중 하나"는 `type` 키나 함수 시험으로 씁니다. — 원리로 도출 가능(일관성 가치)

### 9 — A — 이주 표와 넘기는 요구가 B와 맞춘 보정 전의 내용으로 남음 (확인됨)
- 인용 A 보정: "Lens B는 Hint와 입력 props가 노드 필드 이름을 1:1로 따르는 안을 냈습니다(`type` = `node.type` …). A는 이 안을 받아들입니다." (`out-A.md:48`)
- 인용 A 이주 표: "`Hint.type`, `FormTypeInputProps.type` 형이 넓어짐 | … union 입력은 `Array.isArray(type)`로 받습니다." (`out-A.md:81`). 넘기는 요구: "`Hint.type`은 `node.schemaType`을 그대로 비춥니다(배열이면 같은 참조)." (`out-A.md:58`)
- 보정 뒤에는 `Hint.type`이 배열이 될 수 없으므로 이 행대로 이주하면 틀립니다. B 37–39의 이주 행(`type` 의미 변경, `['number','integer']` → `'number'`, mui `schemaType === 'integer'`)이 A 표에는 없습니다.
- 고침 안: `out-A.md:81` 행을 "`Hint.type`·`FormTypeInputProps.type`은 `node.type`(종류)으로 바뀌고 `schemaType` 칸이 새로 생김. 이주는 B 37–39"로 바꿉니다. `:58`의 요구를 "`Hint.schemaType`이 `node.schemaType`을 비춘다"로 고칩니다. — 원리로 도출 가능

### 10 — B — 기본 입력의 enum·radio 확장이 확정 사실 "문자열 입력 재사용"과 BLUEPRINT-034 (4)를 다시 엶. 원장 ID 없이 초안 줄만 인용 (확인됨)
- 인용 B 27: "기본 enum·radio 정의의 시험을 `type === 'union' && enum 원소가 모두 원시값…`까지 넓힙니다. … 이는 `drafts/union-design-decision.md:45`의 "enum 정의는 받지 않음"을 뒤집는 것입니다" (`out-B.md:72`)
- 인용 결정(brief-common §2): "Default input (`formTypeDefinitions` …): reuse the string input, no new component." 인용 원장 BLUEPRINT-034 (4) (`blueprint.md:547`).
- 소유자 항목 1로 올라가 있어 절차는 맞습니다. 다만 뒤집는 대상은 초안 문장이 아니라 확정 사실과 현행 원장 항목입니다.
- 고침 안: B의 소유자 항목 1의 근거를 "brief §2 기본 입력 결정과 BLUEPRINT-034 (4)를 여는 안"으로 고칩니다. — 소유자 판단 필요(확정 사실의 재개)

### 11 — A — union 노드의 값 형이 SURFACE-052의 "그 형의 값"보다 넓음. 원장 변경으로 적지 않음 (확인됨, 설계상 선택)
- 인용 A 11: "`false`이면 `value: string | number | boolean | ObjectValue | ArrayValue | undefined`" (`out-A.md:26`)
- 인용 원장 SURFACE-052: "`false`이면 `value`가 그 형의 값·`undefined`·(nullable이면) `null`이고" (`ledger/surface.md:790`)
- A는 제네릭을 버렸으므로 `['string','number']` union도 형으로는 `boolean`·객체·배열을 받습니다. 원장이 약속한 좁힘보다 약하고, B의 남은 요구("`value`는 목록 형들의 합집합", `out-B.md:115`)와도 어긋납니다. A는 이것을 원장 변경으로 적지 않았습니다.
- 고침 안: 원장 변경 목록에 "SURFACE-052 보충: union 멤버의 `value`는 형 수준에서 목록으로 좁히지 않는다(값 형은 `FormTypeInputProps<Value>`가 맡음)"를 넣거나, A가 제네릭을 받아들입니다. — 소유자 판단 필요(형 정밀도 대 구현 크기)

### 12 — C — 유효 스키마 `type` 도장의 비용이 비 union 노드와 배열 아이템마다 들고, 순서가 바뀌는 이주가 빠짐 (plausible)
- 인용 C 비용: "유효 스키마 도장은 계산값이 원문과 내용이 다를 때만(`nullable` 키워드, `integer` 세분, 분기 합치기, 원문 배열 보호) 노드마다 얕은 사본 하나를 만들고" (`out-C.md:157`)
- 인용 C 31: "`null`은 nullable일 때 끝에 붙인다" (`out-C.md:53`)
- `nullable: true` 키워드를 쓴 비 union 노드는 배열 아이템까지 노드마다 사본을 만듭니다. 슬롯 단위로 공유하면 되는 비용입니다. 또 `['null','string']`처럼 작성된 nullable 노드는 `jsonSchema.type`이 `['string','null']`로 순서가 바뀌는데, 이주 표 M11은 `nullable: true` 경우만 적었습니다.
- 고침 안: 도장한 `type`과 사본을 청사진 슬롯마다 한 번 만들어, 같은 슬롯의 노드와 아이템이 공유하도록 C 32와 비용 줄에 적습니다. M11에 "null이 앞에 적힌 배열은 끝으로 옮겨짐"을 더합니다. — 원리로 도출 가능(속도 가치)

### 13 — C — 정적 선언의 nullable 규칙이 같은 종류(9)와 좁히기(10)에서 서로 다름 (확인됨, 문장 대조)
- 인용 C 9: "nullable ← nullable ∧ (`null` ∈ τ(d))". C 10: "d는 **검증 전용**이다. 목록에도 nullable에도 기여하지 않는다".
- 두 경우를 비교합니다. `['string','number','null']` + `allOf ['string','number']`는 nullable이 꺼집니다. `['string','number','null']` + `allOf 'string'`은 연언이 `null`을 거부하는데도 nullable이 켜진 채 남습니다. 그러면 비우기 조작이 `null`을 보내고, 검증기가 이를 기각합니다.
- 고침 안: 규칙 10에 "nullable은 규칙 9처럼 AND로 반영한다(종류를 바꾸지 않는 세분)"를 더합니다. — 원리로 도출 가능(C 스스로 `null`을 종류를 바꾸지 않는 세분으로 정의함, 요약 둘째 줄)

### 14 — D — 터미널 `Merge` 규칙을 "모름"이라 했지만 WRITE-079가 이미 답함 (확인됨, 놓친 것)
- 인용 D 9: "터미널 객체 노드의 `Merge` 규칙을 원장에서 찾지 못했습니다("모름")." (`out-D.md:66`)
- 인용 원장 WRITE-079: "그 자리의 값을 통째로 바꾸는 경우는 둘이다. … 다른 하나는 그 자리의 노드가 객체 호스트가 아닌 때다." (`ledger/write.md:1113-1115`)
- union과 터미널 객체는 모두 객체 호스트가 아니므로 통째 교체가 현행입니다. D의 결론은 맞고, 근거만 빠졌습니다. 쓰기 렌즈에 넘긴 요구는 필요 없습니다.
- 고침 안: D 9의 근거를 WRITE-079 (나) 둘째 경우로 바꾸고, "쓰기 렌즈" 요구를 지웁니다. — 원리로 도출 가능

### 15 — B·D·C — 새 경고 코드와 기록 칸이 ERROR 원장 행으로 올라가 있지 않음. 인용 경로 오류 둘 (확인됨)
- 새 코드와 칸이 넷입니다. B 15 `FORM_TYPE_TEST_INVALID`(`out-B.md:41`), D 12의 `trim` 경고(`out-D.md:69`), D 27의 판별 리터럴 경고(`out-D.md:97`), D 14가 ERROR-186 기록에 더한 `reason`·`candidates`. ERROR-186의 원문은 "(path, 기대 형, 받은 값의 종류, 쓰기 출처)"입니다(`ledger/error.md:2702`). C는 자기 경고를 "ERROR-164에 새 경고 행"으로 올렸지만 B·D는 올리지 않았습니다.
- 경로 오류 1: D는 `S/swarm-union/d-ajv-if.cjs`를 인용했지만(`out-D.md:54,102`) 그 파일은 그 자리에 없고 `/private/tmp/claude-501/d-ajv-if.cjs`에 있습니다.
- 경로 오류 2: A 12는 "두 가드가 `strategy`를 보기 때문입니다(… 오늘 `filter.ts:75,195`)"라고 썼지만, 오늘 코드는 `node.group`을 봅니다(`filter.ts:77,198`). `strategy`는 새 설계(NODE-015)입니다.
- 고침 안: 원장 변경 목록에 ERROR-164 행 넷과 ERROR-186 보충을 더합니다. 두 인용을 바로잡습니다. — 원리로 도출 가능

### 확인했으나 지적 없음(요약)
- 확정 사실 대조에서 다음은 어긋나지 않았습니다.
  - 규칙 A(D 4·7, 실행 재현)
  - 채움 시점(D 22)
  - `default`도 규칙 A를 지남(D 23)
  - `options.terminal:false` → ERROR-200(B 20·C 18)
  - `find('/slot/key')` 없음(C 19)
  - `['object','null']`은 nullable object(C 23)
  - 좁힘은 검증 전용(C 10·29)
  - 기본 입력 초안 (나)(B 24·D 15)
  - `valueTypeMismatch === false`의 뜻(B 34·D 17)
- A 8은 BLUEPRINT-033의 목록 출처를 알면서 바꿨고, 그 ID를 적었습니다(a). C 38의 `allowUnionTypes`는 VALIDATE-003과의 충돌을 소유자 항목으로 올렸습니다(a).
- 속도: A·B는 쓰기·커밋마다 드는 비용을 더하지 않습니다. D의 쓰기 비용은 union 노드에만 듭니다(지적 6의 채택 시 제외).
- 인용 점검 결과는 다음과 같습니다.
  - A: `AbstractNode.ts:77,79-83,134`, `extractSchemaInfo.ts:24-35`, `schemaNodeFactory.ts:143`, `formTypeInput.ts:30-35,47,62-65`, `formTypeRenderer.ts:21`, `useFormTypeInput.ts:70`, `SchemaNodeInput.tsx:124`, mui `FormTypeInputNumber.tsx:29,81,109`, `value.ts:10-15`, winglet `jsonSchema.ts:103-110,149-153`, antd6 `FormTypeInputTextarea.tsx:67-68`, `index.ts:33,34,63,69,70`, stories `:523,717,1029`, `raw-round17-node-structure.md:136`이 모두 맞습니다.
  - B: `useFormTypeInput.ts:32-57,69-77`, `PluginManager.ts:40,77-79`, `formTypeInputDefinitions.ts:44-58`, antd5 Number `:61-63`, antd5·mui Radio `:86`/`:125`, mui StringEnum `:126-127`, 기본 StringEnum `:55-59`·Radio `:49-54`, antd5 Date `:69-72`, 기본 Number `:44`, String `:22-26`이 모두 맞습니다.
  - C: `processSchemaType.ts:57-67,73`, `processAllOfSchema.ts:31-32,45-50`, ajv `dataType.ts:19-29,35`, `NumberNode.ts:104`, ajv8 기본 `:16-19`, ajv7 `:22`, `isCompatibleSchemaType.ts:78-80`, `oas303.txt:3087-3089`가 맞습니다. `warnIfNullBranchIgnored.ts:15-29`는 경고만 하는 함수입니다. 건너뛰는 자리는 `getCompositionNodeMapList.ts:69-71`입니다(주장 자체는 맞음).
  - D: `createValidatorFactory.ts:19-25`, `stripSchemaExtensions.ts:32-36`, `ValidationManager.ts:118,150`, ajv8·7 `core.d.ts:107`/`:95`, ajv6 `ajv.d.ts:140`, `controls.md:1153`이 맞습니다.

## (V2만) 원장 변경 목록

| ID | 무엇이 바뀌는가 | 제안 출처 |
|---|---|---|
| BLUEPRINT-033 | 입력이 목록을 읽는 곳이 `node.jsonSchema.type`에서 `node.schemaType`으로 바뀜(C는 도장으로 그대로 두는 안이라 V1이 조정) | A 8 (C 31과 대립) |
| BLUEPRINT-033 | "문자열 입력을 그대로 쓰고 새 입력을 두지 않으며"가 문자열 입력 감싸개(초안 규칙 (나), 객체·배열 읽기 전용 `JSON.stringify`와 비우기)로 바뀜 | B 22–25, D 15 (ID 미기재, 지적 2) |
| BLUEPRINT-034 (1) | "원시 타입만의 `type` 배열"이 `object`·`array`를 포함한 터미널 강제 union으로 넓어짐 | C 19·23 (소유자 결정 (c), ID 미기재) |
| BLUEPRINT-034 (4) | 기본 입력에 enum·radio 정의를 union에 여는 안 | B 27 (소유자 판단) |
| BLUEPRINT-034 (5) | 형 없는 원시 anyOf·oneOf를 청사진 오류에서 union·원시 잎으로 바꿈. 섞인 형 없는 분기(P2)와 형 없는 `const` 분기(P1)는 오류 유지. 형 없는 객체·배열 호스트는 지적 1 | C 13–16, A 13 (ID 미기재) |
| BLUEPRINT-011/012 | 본체 union을 `then`·`allOf`로 좁히면 검증 전용이 됨(명시적 예외) | C 10·29 (기재) |
| BLUEPRINT-032 보충 | `nullable: true`는 같은 객체에 `type`이 있을 때만 적용. null 분기는 형 없는 슬롯에서만 nullable을 줌(A 2와 대립) | C 1·22·24 |
| NODE-041 | union 멤버가 객체·배열 목록도 가짐. `schemaType: UnionSchemaType` | A 10·11 |
| SURFACE-052 보충 | union 멤버의 `value`는 형 수준에서 목록으로 좁히지 않음 | A 11 (미기재, 지적 11) |
| SCHEMA-007/008 (병합표) | 유효 스키마의 `type`은 병합하지 않고 청사진 계산값을 도장으로 찍음(interned frozen) | C 31–32 (기재) |
| VALUE-034 | union(과 터미널 객체·배열)의 루트·아이템 채움은 원본의 JSON 종류로 정함 | D 19 (미기재, 지적 3) |
| ERROR-186 | 기록에 `reason`·`candidates`를 더하고 `received`의 범주를 고정함 | D 14 (미기재) |
| ERROR-164 | 새 경고 행 넷: `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `FORM_TYPE_TEST_INVALID`, `string` 없는 union의 `trim`, 목록 밖 판별 리터럴 | C 35 (기재), B 15·D 12·D 27 (미기재) |
| CONTROLS-006 | `trim`의 `finishInput`을 `string`을 목록에 가진 union 행도 씀 | D 12 |
| CONTROLS-080 (5) 보충 | 경로는 평범한 객체의 자기 키와 배열 색인으로만 내려감(원시 값 아래는 `undefined`) | D 25 (기재) |
| FRAGMENT-007 보충 | union 판별 키의 분기 리터럴 형이 목록 밖이면 개발 경고 | D 27 (소유자 판단 3) |
| VALIDATE-002 | "같은 설정"을 값을 바꾸는 인스턴스까지 넓힘(그 인스턴스만 사본 경로) | D 30–31 (틀리게 "지킨다"로 적음, 지적 7) |
| VALIDATE-003 | ajv8 기본 설정에 `allowUnionTypes: true`를 더함 | C 38 (소유자 판단 3으로 기재) |
| VALIDATE-004/018 | 검증기에 넘기는 스키마 사본을 늘 깊게 복사함 | D 32 (C 151 요구와 같음) |
| VALIDATE-044 | `Validator` 문서 주석에 "받은 값과 스키마를 바꾸지 않는다"를 넣음 | D 28 |
| WRITE-056 보충 | parse(`interpret`)를 기본 입력과 플러그인이 쓰는 함수로 노출(공개 여부는 소유자 판단) | B 30, D 15 |
| LANDING-151 | PR-7 이주 목록에 추가: 플러그인 넷의 `['number','integer']` → `'number'`, mui `schemaType === 'integer'`, 플러그인별 union 항목 | B 38–40 (기재) |

## 확인하지 못한 것
- A의 형 탐침: `probe2`의 `InferSchemaNode` 사상과 `probe`의 `InferValueType` 결과는 다시 돌려 형을 하나하나 읽지 않았습니다. `probe3.ts`는 의도된 오류 하나를 내며 컴파일이 돕니다.
- D 25(경로가 원시 값 아래로 내려가지 않음)가 오늘 식 평가기의 동작과 같은지 확인하지 않았습니다. 다르면 이주 행이 필요합니다.
- 지적 7에서, 오늘 ajv의 제자리 변경이 `__enhancedValue__`를 거쳐 실제 방출 값까지 닿는지는 실행으로 확인하지 않았습니다(plausible).
- 지적 6·10·11은 채택 여부가 소유자 판단입니다. 이 보고는 목록에 없거나 확정 사실과 부딪친다는 점만 판정합니다.
