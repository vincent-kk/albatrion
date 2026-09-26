# 3라운드 레드팀 — §B 판별식 식별 알고리즘 · §C2 로드 계약 · G1

대상: `reviews/round-3-spec.md` §B, §C2, `00-goals.md` G1. 방법: §B를 문자 그대로 구현하고(`spikes/guard-cost/redteam3/algorithm-b.mjs`, 100줄), 생성기 출력을 모사한 코퍼스(`corpus.mjs`, 14종)에 돌려 ajv 8.17.1의 판정과 비교했다. §A3(옵션 A)·§A5·§C2의 방출 모델은 `form-model.mjs`에 있다. 모든 수치는 `run.mjs`의 실행 결과이며 전체 로그는 `results.log`다. 실행하지 않은 지적은 "추론"으로 표시했다.

명세가 답하지 않는 곳은 구현에서 옵션으로 두고 **가장 문자 그대로의 읽기를 기본값**으로 삼았다: `allOf` 항목 안의 `$ref`는 풀지 않음(`resolveAllOfItemRefs=false`), 같은 키의 교차는 `{allOf:[a,b]}`로 보존(`sameKey='allOf'`), `enum`은 원소 하나만 후보(`multiEnum=false`).

## 요약표

| 공격 | 판정 | 한 줄 근거 | 실행 |
| ---- | ---- | ---------- | ---- |
| 1 §B.1 `allOf`·`$ref` | **반례** | 태그가 2단 상속의 base에 있으면 값 집합이 `[]`가 되고, 4단계가 공허하게 "서로소"라 판정해 `{enum: []}` 가드를 만든다 — ajv가 스키마 자체를 거부 | Y |
| 2 §B.2 null | **반례** | `type:['object','null']`·`nullable:true` 분기는 벗겨지지 않아 `nullable=false`인데 ajv는 `null`을 통과시킨다 | Y |
| 3 §B.3 후보 | **반례** | 후보를 서로소 검사 **전에** 고른다 — `apiVersion`이 먼저 선언되면 유효한 `kind`를 버리고 `select`로 떨어진다. 다원소 `enum`(zod·pydantic 다중 Literal)도 `select` | Y |
| 4 §B.4 겹침 | 통과(G1) / 반례(왕복) | 판정은 같다. 초기 선택이 동점이면 다른 분기의 키를 잃는다 | Y |
| 5 §B.5 mapping | **반례** | "어떤 값도 통과하지 않는다"는 거짓 — petstore 예제 값 3/4가 `oneOf` 통과. ajv `discriminator:true`는 mapping에 throw(확인), **pydantic 출력에도** throw | Y |
| 6 G1 + `unevaluatedProperties` | 통과 | 판정 동치는 성립. 비활성 분기의 키를 숨겨 invalid → valid가 되는 경우가 있다(설계상 예외) | Y |
| 7 §C2 omit | **반례** | `dependentRequired`·호스트 `required`가 비활성 조각의 키를 가리키면 로드 valid → 방출 invalid이고 omit 끄기로 안 고쳐진다 | Y |
| 8 §C2 default | **반례** | 로드 값에 비활성 분기의 키가 있으면 `getValue()`의 에러 목록이 로드 값의 것과 다르다. "enum 에러"는 검증기가 내지 않는다 | Y |

## 코퍼스 결과 개요 (`results.log` §0)

| 모사 대상 | B의 출력 | 가드 = ajv 수용 분기? |
| --- | --- | --- |
| pydantic 2.9 `Field(discriminator)` (`const` + `discriminator.mapping`) | discriminated `kind` | 예 (5/5 표본) |
| pydantic 2.9 `Optional[Union[Cat,Dog]]` (평평한 anyOf + null 분기) | discriminated, nullable | 예 |
| pydantic 2.9 `Optional[discriminated]` (anyOf[{oneOf}, null]) | 바깥: `single`·nullable / 안쪽: discriminated·**nullable=false** | 예, 단 nullable이 안쪽에 전달되지 않음 |
| pydantic ≤2.8 `const`+`enum` 병기 (추론) | discriminated | 예 |
| OpenAPI 3.0 petstore mapping-only | discriminated **values `[[],[]]`** → 가드가 무효 스키마 | 가드 컴파일 실패 |
| OpenAPI 3.0 `nullable:true` 분기 | discriminated, nullable=false | `null`에서 어긋남 |
| OpenAPI 3.1 2단 상속(TypeSpec식, 추론) | discriminated **values `[[],["Dog"]]`** | 가드 컴파일 실패 |
| OpenAPI 3.1 `type:['object','null']` 분기 | discriminated, nullable=false | `null`에서 어긋남 |
| zod-to-json-schema 3.23 `discriminatedUnion` | discriminated | 예. `additionalProperties:false`라 가드는 Cat을 고르고 ajv는 기각하는 표본 있음(판정은 검증기 것이므로 G1 유지) |
| zod `z.enum(['cat','lion'])` 태그 | **select** (no-candidate) | ajv는 분기를 유일하게 고른다 |
| TypeBox 0.32 `Type.Union` | discriminated | 예 |
| typescript-json-schema 0.64 리터럴 키 2개 | **select** (overlap on `apiVersion`) | ajv는 `kind`로 유일하게 고른다 |
| 손으로 쓴 겹치는 anyOf | select (overlap) | — |
| pydantic 재귀 트리 union | discriminated | 예, 종료 |

## 공격별 상세

### 1 — 반례 (§B.1 `allOf` 평탄화·`$ref`)

스키마(OpenAPI 3.1, TypeSpec `model Persian extends Cat extends Pet` 모사 — 추론):

```
Pet:     {properties: {petType: {type: string}}, required: [petType]}
Cat:     {allOf: [{$ref: Pet}, {properties: {petType: {enum: ['Cat']}}}]}
Persian: {allOf: [{$ref: Cat}, {properties: {furLength}}]}
Dog:     {allOf: [{$ref: Pet}, {properties: {petType: {enum: ['Dog']}, packSize}}]}
pet:     {oneOf: [{$ref: Persian}, {$ref: Dog}], discriminator: {propertyName: petType}}
```

관찰(`run.mjs:45-66`, `results.log` §1):

| 구현 선택 | B의 values | 결과 |
| --- | --- | --- |
| 문자 그대로(항목 `$ref` 안 풂, 교차=`allOf`) | `[[], ["Dog"]]` | discriminated, Persian 가드 `{enum: []}` → ajv "enum must have non-empty array" |
| 항목 `$ref` 풂, 교차=`allOf` | `[[], []]` | Dog의 태그까지 사라진다 — `{allOf:[{type:string},{enum:['Dog']}]}` 안의 `enum`을 3단계가 보지 못한다 |
| 항목 `$ref` 풂, 교차=얕은 병합 | `[[], ["Dog"]]` | Persian은 여전히 `[]` — 태그가 `Cat.allOf` 안, 즉 두 단계 아래 |

세 가지 결함이 겹친다.
- (a) `discriminator.propertyName`이 있으면 3단계는 그 키를 "유일한 후보"로 **무조건** 채택하고, 각 분기에 그 키의 `const`/`enum`이 있는지 묻지 않는다. 값 집합이 `[]`인 분기가 생긴다.
- (b) 4단계 "쌍마다 서로소"는 빈 집합에 대해 공허하게 참이다. 그래서 `{enum: []}` 가드가 나온다. ajv는 이것을 유효한 스키마로도 받지 않는다(`results.log` §0 "guard-invalid").
- (c) "같은 키는 교차 — 두 선언이 모두 유효 스키마"를 `{allOf:[a,b]}`로 표현하면 3단계가 `const`/`enum`을 찾지 못한다. 얕은 병합으로 표현하면 찾지만, 이때 가드는 base의 제약을 잃는다: base `kind: {type: integer}` + 분기 `kind: {const: '1'}`에서 가드는 `{kind:'1'}`을 고르고 ajv는 어떤 값도 그 분기로 받지 않는다(`run.mjs:56-60`: `guard0=true ajv-accepts=[]`). 판정은 검증기 것이므로 G1은 유지되나 형상은 검증기가 절대 통과시키지 않는 분기를 그린다.
- 재귀: pydantic 재귀 트리(`Node.children.items.anyOf[$ref Node]`)는 1단계가 `properties` 안으로 내려가지 않으므로 종료한다(`run.mjs:61-62`). 자기 참조 `$defs.A = {$ref: A}`는 명세에 방문 집합이 없어 **미정의** — 이 구현은 `derefBranch`(`algorithm-b.mjs:21`)에 seen-set을 더해 throw한다. 생성기가 내는 모양은 아니다(추론).

### 2 — 반례 (§B.2 null 분기)

| 모양 | 출처 | ajv `{pet: null}` | B의 `nullable` |
| --- | --- | --- | --- |
| `anyOf: [Cat, Dog, {type: 'null'}]` | pydantic `Optional[Union]` | valid (분기 2) | true |
| Cat에 `type: ['object','null']` | 3.1 | valid (분기 0) | **false** |
| Cat에 `nullable: true` | 3.0 (springdoc/NSwag, 추론) | valid (분기 0; ajv는 `nullable` 키워드를 `strict:true`에서도 컴파일) | **false** |
| `anyOf: [{discriminator, oneOf: [...]}, {type: 'null'}]` | pydantic `Optional[discriminated]` | valid | 바깥 true, **안쪽 false** |

(`run.mjs:67-78`, `results.log` §2.) `nullable=false`이면 `null`은 §C3의 "잘못된 종류의 값"으로 취급되어 `raw := null`, 자식 전부 비활성, `emit = null`이고 검증기는 valid를 준다 — 폼은 "깨진" 상태를 그리면서 에러를 내지 못한다. §A6의 null 계약이 걸리지 않는다. 반대로 pydantic의 중첩 모양은 2단계가 "그 분기 자체가 호스트"라고만 하고 남은 분기가 다시 union일 때 B를 재귀하라는 말도, 바깥의 `nullable`을 안쪽에 넘기라는 말도 없다 — **미정의**. 이 구현은 재귀하되 플래그를 넘기지 않아 안쪽이 `false`가 된다.

### 3 — 반례 (§B.3 후보 선택)

- `const`+`enum` 병기(pydantic ≤2.8, 추론): `const`를 먼저 읽으므로 통과(`run.mjs:81`).
- 다원소 `enum`: zod `z.discriminatedUnion('kind', [z.object({kind: z.enum(['cat','lion'])}), …])`(zod-to-json-schema 3.23)와 pydantic의 `Literal['cat','lion']` 멤버는 `enum: ['cat','lion']`을 낸다. 문자 그대로의 3단계는 후보가 없어 `select`가 되고, `multiEnum=true`로 바꾸면 `[["cat","lion"],["dog"]]`로 서로소이며 가드가 ajv와 정확히 같은 분기를 고른다(`run.mjs:82-85`, 3/3 표본). "원소가 하나인 enum만"은 근거 없는 축소다. 서로소 검사(4단계)가 이미 다원소를 다룬다.
- 후보 둘: typescript-json-schema 0.64가 `{apiVersion: 1, kind: 'circle', r}` | `{apiVersion: 1, kind: 'square', s}`를 낼 때(선언 순서 보존) 첫 분기의 키 순서는 `apiVersion, kind`. 3단계가 `apiVersion`을 고르고 4단계가 겹침(`[[1],[1]]`)을 보고 `select`로 떨어진다. 같은 스키마에서 `kind`를 먼저 선언하면 discriminated(`run.mjs:86-88`). 키를 정렬하는 생성기에서는 `apiVersion < kind`이므로 항상 `select`(`run.mjs:89-91`). 즉 (a) 결과가 선언 순서·정렬 여부에 따라 갈리고, (b) 후보를 하나로 줄인 **뒤에** 서로소를 검사하므로 유효한 판별식을 버린다. JSON 파싱 자체도 정수형 키를 앞으로 옮기므로 "첫 분기의 키 순서"는 생성기 밖에서도 흔들린다(추론).

### 4 — 통과(G1) / 반례(왕복) (§B.4 겹침)

스키마: `anyOf: [{kind: cat, meow, additionalProperties: false}, {kind: cat, meow, lives, required: [lives]}, {kind: dog}]`. B → `select`(overlap). `run.mjs:94-106`:

| 선택 | 로드 | 방출 | ajv(로드) | ajv(방출) |
| --- | --- | --- | --- | --- |
| 0 | `{kind, meow, lives: 9}` | `{kind, meow}` | valid | valid |
| 0 | `{kind, lives: 9}` | `{kind}` | valid(분기 1로) | valid(분기 0로) |
| 1 | 같은 두 값 | 로드와 동일 | valid | valid |

판정은 어느 선택에서도 같다 — G1은 지킨다. 그러나 선택 0에서는 `lives`가 비활성 분기의 선언이라 방출에서 빠지고, 값이 통과하는 **이유**(분기 1 → 분기 0)가 바뀐다. ADR 0002의 초기 선택 규칙("값의 키를 가장 많이 선언한 분기")은 이 표본에서 분기 1을 고르므로 손실을 막지만, 동점이면 앞 분기라 S6이 그대로 남는다. `anyOf`에서 ajv는 여러 분기를 동시에 받는데 폼은 하나만 그리므로, 겹치는 union에서 "숨겨진 키 = 잃는 키"는 구조적이다.

### 5 — 반례 (§B.5 OpenAPI 3.0 mapping)

swagger.io "Inheritance and Polymorphism" 예제 그대로(Cat `required: [huntingSkill]`, Dog `required: [packSize]`, 분기에 `const` 없음, `discriminator.mapping`만). `run.mjs:108-127`, draft-07과 2020 동일:

| 값 | 수용 분기 | `oneOf` |
| --- | --- | --- |
| `{petType: Cat, huntingSkill: lazy}` | [0] | **valid** |
| `{petType: Dog, packSize: 3}` | [1] | **valid** |
| `{petType: Cat, packSize: 3}` | [1] | **valid** — 태그를 무시하고 Dog로 통과 |
| `{petType: Cat, huntingSkill, packSize}` | [0, 1] | invalid |

"표준 검증기는 어떤 값도 통과시키지 않는다"는 분기들의 `required`가 같을 때만 참이다. 실제 예제는 분기마다 다른 `required`를 두므로 대부분의 값이 통과한다. 따라서 "지원하지 않는다"의 근거가 틀렸고, 진짜 문제는 다른 데 있다: 세 번째 행처럼 **태그와 검증기의 선택이 어긋난다**. mapping으로 가드를 만들면 폼은 Cat의 형상(huntingSkill 빈 칸)을 그리고 검증기는 valid를 준다. 폼은 자체 `required` 에러를 만들 수 없으므로(ADR 0001) 빈 필수 칸과 valid가 나란히 보인다. G1은 유지된다.

문자 그대로의 B는 이 부류를 `discriminated`(values `[[],[]]`, `unsupported` 플래그)로 돌려주고 가드 `{enum: []}`를 만든다 — 1의 (b)와 같은 결함. mapping-only는 `select`(또는 별도 종류)로 명시적으로 떨어져야 한다.

ajv `discriminator: true`(`run.mjs:118-125`):
- mapping 있음 → throw `discriminator: mapping is not supported` (명세의 주장 확인).
- mapping 제거 → throw `oneOf subschemas (or referenced schemas) must have "properties/petType"` — ajv는 `allOf`를 평탄화하지 않으므로 3.0 상속형은 mapping과 무관하게 이 옵션을 못 쓴다.
- **pydantic 2.9 출력**(`const` + `discriminator.mapping`) → 같은 throw. 즉 검증기 플러그인이 `discriminator: true`를 켜면 가장 흔한 BE 출력이 컴파일되지 않는다. B는 pydantic 출력을 `propertyName` + `const`로 올바르게 discriminated로 식별한다(`run.mjs:126`).

### 6 — 통과 (G1 + `unevaluatedProperties: false` + §A5)

호스트 `{unevaluatedProperties: false, oneOf: [Cat, Dog]}`, `kind`는 분기에만 선언. §A5대로 `kind`를 무조건 자식으로 두고 방출했다(`run.mjs:129-141`):

| 로드 | 활성 | 방출 | ajv(로드) | ajv(방출) |
| --- | --- | --- | --- | --- |
| `{}` | tag만 | `{}` | invalid | invalid (같은 에러) |
| `{kind: cat, meow}` | Cat | 동일 | valid | valid |
| `{kind: cat, meow, bark: true}` | Cat | `{kind, meow}` | **invalid** (bark unevaluated) | **valid** |
| `{kind: bird}` | tag만 | 동일 | invalid | invalid (같은 에러) |
| `{kind: cat, extra: 1}` | Cat | extra 유지 | invalid | invalid (같은 에러) |

판정 동치(폼 판정 = 검증기(방출))는 다섯 경우 모두 성립한다. 항상 방출되는 태그는 `unevaluatedProperties`와 충돌하지 않는다 — 분기가 통과하면 그 분기가 `kind`를 평가한 것으로 친다. 셋째 행은 §C4의 "필드가 가려지면서 값을 빼내는" 예외가 서버가 기각한 레코드를 사용자 행위 없이 valid로 만드는 경우다(S6의 "무효한 레코드가 유효해진다"가 `unevaluatedProperties`에서도 성립). 설계된 동작이므로 통과로 두되 문서화 대상이다.

### 7 — 반례 (§C2 방출 정책)

`run.mjs:143-162`. "omit 끄기로 해결"이 맞는 경우와 아닌 경우:

| 모양 | ajv(로드) | omit on → 방출 | omit off → 방출 | omit 끄기로 해결? |
| --- | --- | --- | --- | --- |
| `required: [name]`, `{name: ''}` | valid | `{}` invalid | `{name:''}` valid | 예 |
| `minProperties: 1`, `{meta: {}}` | valid | `{}` invalid | valid | 예 |
| `minItems: 3`, `{xs: [1,null,null]}` | valid | `{xs:[1]}` invalid | valid | 예 — 단 끄는 스위치는 `omitTrailing`이지 `omitEmpty`가 아니다. 명세는 `omitEmpty`만 이름 짓는다 |
| `dependentRequired: {a: [b]}`, `b`는 `if: {required:[flag]} then: {properties:{b}}` 안에만 선언, `{a: 1, b: 2}` | valid | `{a:1}` **invalid** | `{a:1}` **invalid** | **아니오** |
| 호스트 `required: [b]`, `anyOf: [{a, a2}, {b}]`, `{a, a2, b}` | valid | `{a, a2}` **invalid** | 동일 **invalid** | **아니오** — ADR 0002의 초기 선택("키를 가장 많이 선언한 분기")이 분기 0을 고른다 |
| `additionalProperties: {type: string}`, `{id, x: 'ok'}` | valid | extra 유지, valid | valid | 해당 없음(통과) |
| `if: {required:[a]} then: {not: {required:[x]}}`, `{a, x}` | **invalid** | `{a}` valid | valid | 방향이 반대 — 금지 조각이 무효 레코드를 유효하게 만든다 |

로드 valid → 방출 invalid의 진짜 원인은 omit이 아니라 **활성 집합의 제외**다: 호스트 수준의 키워드(`required`, `dependentRequired`, `minProperties`)가 비활성 조각의 키를 가리키면, 원본에 값이 있어도 방출에서 빠진다. §C2는 이 경로를 다루지 않는다. 마지막 행은 round-2 S5의 "옳은 동작은 a를 보이고 검증기의 에러를 붙이는 것"과 §A3-5의 "x의 제외는 투영에서 일어난다"가 어긋나는 지점이다 — **모순** 후보로 lifecycle 검토와 대조가 필요하다.

### 8 — 반례 (§C2 default는 없는 키에만)

pydantic 출력에 호스트 `properties: {note: {default: 'auto'}}`를 더한 호스트. `run.mjs:164-176`:

| 로드 | raw(정착 후) | 방출 | 로드 = 방출? | ajv 에러 목록 |
| --- | --- | --- | --- | --- |
| `{kind: bird}` | `+note` | `{note, kind}` | 아니오 (default 주입) | **동일** (oneOf + 분기별 `const`·`required`) |
| `{kind: bird, meow: m}` | `+note` | `{note, kind}` — `meow` 빠짐 | 아니오 | **다름**: 방출에는 `required meow`가 추가 |
| `{kind: cat}` | `+note` | `{note, kind}` | 아니오 | 동일 |

- default 주입은 무조건 자식(`note`)에만 일어났고 비활성 분기의 자식에는 일어나지 않았다 — "없는 키에만"은 지켜진다. 그러나 `getValue()`는 로드 값과 다르다(주입된 `note`).
- 둘째 행: 어떤 분기도 활성이 아니므로 `meow`(Cat의 선언)가 방출에서 빠지고, 검증기는 방출 값에서 `meow` 누락을 **추가로** 보고한다. "getValue()에 대한 에러 = 로드 값에 대한 에러"는 로드 값이 비활성 분기의 키를 들고 있을 때 거짓이다. 무효한 레코드가 로드 뒤 더 무효해진다.
- "B + A5는 enum 에러를 보인다": 검증기가 내는 것은 `/pet/kind const must be equal to constant`(분기 수만큼) + `/pet oneOf`이며 `enum` 에러는 없다 — 작성 스키마에 `enum`이 없다(ADR 0001). 태그 노드의 `enum`은 폼 쪽 유효 스키마에만 있다. 이 에러들을 태그 노드로 라우팅하는 규칙은 **미정의**다.

## §B에 필요한 고쳐쓰기 (근거는 위 번호)

1. **1단계**: `allOf` 항목의 `$ref`를 풀고, 평탄화를 "한 단계"가 아니라 **`allOf`가 없어질 때까지**(방문 집합으로 순환 차단) 반복한다 [1]. 같은 키의 교차는 3단계가 읽을 수 있는 형태여야 한다 — `const`/`enum`은 교차 결과의 최상위에 남긴다(`{allOf}` 보존은 태그를 숨긴다) [1c].
2. **2단계**: `type` 배열에 `'null'`이 포함된 분기와 `nullable: true` 분기도 `nullable := true`로 센다(분기는 남긴다). 남은 분기가 하나이고 그것이 다시 union이면 B를 재귀하고 `nullable`을 안쪽에 전달한다 [2].
3. **3단계**: `discriminator.propertyName`은 후보를 **좁히는** 힌트이지 무조건 채택이 아니다 — 모든 분기에 그 키의 `const`/`enum`이 있을 때만 후보다 [1a, 5]. 다원소 `enum`을 후보로 허용한다(서로소 검사가 이미 다룬다) [3].
4. **3·4단계의 순서**: 후보 전부에 대해 서로소를 검사한 뒤, 통과한 후보 가운데 하나를 고른다. 고르는 순서는 키 순서가 아니라 결정적 기준(예: `discriminator.propertyName` > `required`에 있는 키 > 사전순)으로 적는다 [3].
5. **4단계**: 값 집합이 빈 분기가 하나라도 있으면 판별식이 아니다. 공허한 서로소를 금지한다 [1b, 5].
6. **5단계**: "표준 검증기는 어떤 값도 통과시키지 않는다"를 삭제한다. mapping-only는 `select`로 떨어지고, 개발 모드 경고의 문구는 "태그로 형상을 정할 수 없다(검증기는 `required` 차이로 분기를 고른다)"로 바꾼다. ajv `discriminator: true`는 mapping이 있는 **pydantic 출력에도** throw하므로 플러그인이 켤 수 없다고 적는다 [5].
7. **§C2**: "omit 끄기로 해결"에 조건을 단다 — 로드 valid → 방출 invalid는 호스트 키워드가 비활성 조각의 키를 가리킬 때도 생기며 이는 omit과 무관하다. `omitTrailing`도 같은 문장에 이름을 넣는다 [7]. "getValue()의 에러 = 로드 값의 에러"는 비활성 분기의 키가 있으면 거짓임을 적고, 태그 불일치 시 검증기 에러(`const` × 분기 수 + `oneOf`)를 태그 노드로 라우팅하는 규칙을 쓴다 [8].

## 파일

- `spikes/guard-cost/redteam3/algorithm-b.mjs` — §B 문자 그대로 구현(옵션: `resolveAllOfItemRefs`, `sameKey`, `multiEnum`)
- `spikes/guard-cost/redteam3/form-model.mjs` — §A3 옵션 A·§A5·§C2 방출 모델(단일 호스트)
- `spikes/guard-cost/redteam3/corpus.mjs` — 생성기 모사 스키마 14종(출처·버전 주석)
- `spikes/guard-cost/redteam3/run.mjs` — 공격 0–8, `node run.mjs [n]`
- `spikes/guard-cost/redteam3/results.log` — 전체 실행 로그(ajv 8.17.1, Node 24)
