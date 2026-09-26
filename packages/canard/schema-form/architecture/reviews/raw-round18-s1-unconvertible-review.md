# 18라운드 S1 — 변환할 수 없는 값의 처리, 독립 검토 원자료 (2026-09-26)

소유자 지시: "이거 에이전트 스웜 교차검증을 한번 거쳐봐. 판단이 쉽지 않네. 그러면서도 사용성에 지대한 변화가 일어날 수 있고." 같은 문제 정의서(아래 §1의 요지)를 세 갈래에 따로 보냈다. Claude 스웜 일곱(설계자 넷, 반박자 둘, 판정자 하나), codex(세션 `727787f6-0ac6-477c-94c9-2050de4b4c07`), antigravity(세션 `c70168f7-4421-43fd-a7ea-fd1028ef3264`). 세 갈래 모두 나(변환할 수 없는 값은 받은 그대로 든다)를 권했고, 소유자가 나와 정합 상태(경고등)와 변환 불가의 `onError` 전달을 확정했다(`reviews/round-18-owner-answers.md`). 아래 §2–§6은 받은 그대로 옮겼다. 검토자의 권고는 채택 결정이 아니다.

## 1. 문제 정의서

저장소: /Users/Vincent/Workspace/albatrion, 패키지 `packages/canard/schema-form/`. 설계 문서는 `architecture/`(커밋 165ee8948과 작업 트리의 `reviews/round-18-*` 파일). 읽기 전용이다. 저장소의 어떤 파일도 만들거나 고치거나 지우지 마라. 실험이 필요하면 `/tmp/claude-501/s1swarm/` 아래에서만 한다.

## 이미 정해진 것(소유자 답, 바꿀 수 없음. 원문은 `architecture/reviews/round-18-owner-answers.md`)
- S1: "node 는 각자의 타입에 맞는 parse 함수를 가져야 합니다. 지금처럼요. 이건 값의 조작이라기보단, json or JS 의 자동형변환을 통제 가능하게 구현하는 방향이라고 보아도 좋습니다."
- S1 이어서(나): parse는 뜻이 그대로인 변환만 한다(ajv `coerceTypes` 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언 진릿값 변환은 뺀다. 소유자: "이게 정확히 내가 원하는 기능이에요. 그 이상을 하는건 나도 원치 않습니다."
- R17-1(나): "나 허용. 망가진 값을 올리는게 더 위험하겠다." 정착 오류는 모든 환경에서 사슬 끝에서 던지고 `degraded` 동안 제출을 거부한다(`architecture/adr/0014-error-policy.md` §2·§5).
- 17라운드 통보 3: 검증기가 없으면 거부하지 않고 알리기만 한다. 소유자: "오류만 내보내고 거절은 하지 마시죠 … 저는 jsonSchema 로 form 만 그리고, 유효성검증은 따로 하지 않는 사용예도 알고있어서요". 검증기 없는 사용이 실재한다.
- ADR 0013 결정 1(`architecture/adr/0013-core-does-not-rewrite-values.md`, 5라운드 소유자 발언 근거): "core는 받은 값을 고치지 않는다. 유효하지 않은 값은 그대로 들어가고 에러로 보인다."
- 오류 채널: `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 받는 관찰자다(ADR 0014 §3). 세 층: 오류, 경고, 검증 결과(노드 `errors`).

## 소유자가 이번에 제기한 우려(이번 검토의 핵심)
- "node.value 는 제어컴포넌트에서 상태로 그대로 쓰인단말이지. 그래서 이걸 바꿔버리면, 제어컴포넌트 동작을 예측하기 어려워질걸?"
- "값을 가지고 있는데 빈 값을 표현하는것도 좀 위험할거같아."
- "만약 validator 가 연결되지 않은 경우에는? 그 경우에는 진짜 form 에러를 받고(onError로), 값이 비워져야 하는건가?"
- "사용성에 지대한 변화가 일어날 수 있고."

## 사실(실행으로 확인됨)
- 오늘의 파서 다섯(`src/core/parsers/`)과 JS 변환, ajv 8.17.1 `coerceTypes`의 비교, 노드 단위 실행: `architecture/reviews/raw-round18-s1-parse-check.md`. 오늘은 모든 쓰기(로드, `setValue`, 입력, 전파, `derived`, `injectTo`, reset)가 `__parseValue__`를 지난다. 변환 실패는 `NaN`·`""`·`[]`·`{}`가 되고, `omitEmpty` 때문에 부모에서 없음이 되어 형 에러가 `required`로 바뀌거나 사라진다.
- ajv는 변환하지 못하면 값을 그대로 두고 형 에러를 낸다. 우리 ajv 플러그인 기본 설정(`allErrors: true, strictSchema: false`)에서는 `strictNumbers`가 켜져 `NaN`과 `Infinity`가 "must be number"로 걸린다. `strict: false`로 만든 검증기에서는 `NaN`이 통과한다. `JSON.stringify({ n: NaN })`은 `{"n":null}`이다.
- 오늘 기본 수 입력(`src/formTypeDefinitions/FormTypeInputNumber.tsx`)은 비제어(`defaultValue`)이고 `event.target.valueAsNumber`를 보낸다(빈 칸이나 치다 만 글자는 `NaN`). UI 플러그인(`packages/canard/schema-form-*-plugin`)의 입력은 제어 컴포넌트로 `value`를 쓰는 것이 많다. 확인해서 근거로 써라.

## 후보(이것만으로 한정하지 않는다)
- 가. `NaN` 같은 대체 값(오늘). 수 노드만 가능하고 다른 타입에는 대체 값이 없다.
- 나. 그대로 둔다(ajv). 노드는 받은 입력을 그대로 들고 `value`도 그것을 돌려준다. 형 에러는 검증기가 낸다.
- 다. 그대로 두되 읽기를 가른다. 저장은 입력, `value`는 자기 타입이나 `undefined`, 입력과 에러 여부는 따로 읽는다. 소유자가 위험하다고 본 안이다.
- 라. 쓰기를 거부한다. 저장하지 않고 변환 불가를 오류로 알린다. 저장=보임=타입.
- 마. 쓰기의 출처(로드, 공개 `setValue`, 사용자 입력, 자동 쓰기, reset)마다 다르게 한다.
- 바. 그 밖의 안.

## 모든 안을 같은 기준과 장면으로 평가한다
기준: C1 저장=보임=타입(제어 컴포넌트의 예측 가능성), C2 조용한 변경 없음, C3 오류가 보임(검증기 있음), C4 오류가 보임(검증기 없음), C5 망가진 값을 올리지 않음, C6 원래 입력의 보존, C7 공개 형의 정직함, C8 모든 노드 종류에 같은 규칙(수·문자열·불리언·배열·객체·가상·터미널 객체), C9 사용자 입력 경험(치다 만 글자, IME, 제어와 비제어), C10 새 개념과 표면의 비용.
장면: S-a 서버 로드 `{ age: "abc" }`(수 노드), 검증기 있음과 없음. S-b 호출자 `setValue("abc")`. S-c `derived`가 문자열을 냄. S-d 제어 입력(예: antd `InputNumber`)에서 사용자가 `-`를 치는 중. S-e 비제어 기본 수 입력의 빈 칸(`valueAsNumber`가 `NaN`). S-f 불리언 노드에 `"abc"`, 배열 노드에 `"a,b"`, 객체 노드에 `"x"`. S-g nullable 수 노드에 `null`, nullable 아닌 수 노드에 `null`. S-h reset과 다시 로드.

## 규칙
- 규칙 1: 소유자 답은 고정이다. 소유자 답과 글자 그대로 부딪히는 결론은 결론이 아니라 소유자 질문이 된다.
- 규칙 2: 원리로 정할 수 없고, 순위가 정해지지 않은 가치를 맞바꾸며, 사용자에게 보이는 결과를 바꾸는 것만 소유자 질문이 된다.
- 규칙 3: 오류는 삼키지 않는다.
- 한국어 격식체로, 약어 없이 쓴다. 근거는 `file:line`으로 댄다.

## 2. Claude 스웜 판정자의 판정

**권고.** 권고: 나′입니다. 목록에 적은 변환으로 바꿀 수 있는 값만 바꿉니다. 바꿀 수 없는 값은 받은 그대로 들고, 그대로 보여 주고, 그대로 방출합니다. 값을 비우지도, 대체하지도, 쓰기를 거부하지도 않습니다. 형 불일치는 검증기가 있으면 검증 결과로, 없으면 경고 기록으로 알립니다. 입력 구성 요소는 치다 만 글자를 스스로 들고 있어야 하며, 형이 아닌 값을 유효한 상태처럼 그리지 않습니다.

이 권고는 소유자께서 S1 이어서에서 직접 물으신 남은 물음(`architecture/reviews/round-18-owner-answers.md:8`, 반영 칸 '답 대기')에 대한 답입니다. 내용은 소유자께서 처음 떠올리신 안('변환 가능한 값만 변환하고, 안되면 입력값을 그냥 전달해서 need to number 같은 에러를 보여주면')을 다듬은 것입니다. 네 제안이 모두 같은 핵심을 권했습니다. 두 공격(사용성과 React, 무결성과 오류)도 핵심을 무너뜨리지 못했고 세부만 고쳤습니다. 고정된 소유자 답을 글자 그대로 모두 지키는 후보는 이것 하나입니다.
- 가(`NaN`)는 받은 값을 고치므로 ADR 0013 결정 1(`architecture/adr/0013-core-does-not-rewrite-values.md:29`), 그리고 S1 이어서의 '그 이상을 하는건 원치 않습니다'와 부딪힙니다.
- 라(거부)는 '입력을 막지 않는다'(`:29`), 그리고 통보3(`architecture/adr/0014-error-policy.md:213`)과 부딪힙니다.
- 다(읽기 가르기)는 소유자께서 위험하다고 하신 모양 그대로입니다.

잃는 것은 소유자께서 짚으신 '노드가 자기 타입의 값을 소유한다는 보장'입니다. 이 보장이 '변환할 수 있을 때만'으로 줄어듭니다. 다만 이 보장은 오늘도 참이 아닙니다. 오늘의 `NaN`은 JSON의 수가 아니어서 직렬화하면 `null`이 됩니다. 수 밖의 노드는 대체 값이 없어서 `""`·`[]`·`{}`·`true`로 뜻을 바꿔 왔습니다. 그 결과 형 에러가 `required`로 바뀌거나 사라졌습니다(`architecture/reviews/raw-round18-s1-parse-check.md:88`, `:94`, `:118`). 가지 노드에서는 같은 거래를 이미 받아들였습니다(`adr/0013-core-does-not-rewrite-values.md:91`, `08-design-a-to-z.md:152`, `:274`).

장면별 결과입니다.
- S-a 서버 로드 `{ age: "abc" }`: 원본, `value`, 방출이 모두 `"abc"`입니다.
  - 검증기 있음: `/age`에 "must be number"가 나고, 제출은 `ValidationError`로 거부됩니다. `onError`에는 가지 않습니다.
  - 검증기 없음: 트리마다 한 번 `VALIDATOR_MISSING`, 경로마다 로드당 한 번 가칭 `VALUE_TYPE_MISMATCH` 경고가 갑니다. 제출은 거부하지 않고, 서버는 `"abc"`를 받습니다.
  - 어느 쪽이든 오늘처럼 `required`로 바뀌거나 사라지지 않습니다.
- S-b 호출자 `setValue("abc")`: S-a와 같습니다. 호출자 오류로 던지지 않습니다. `setValue("12")`는 12가 됩니다.
- S-c `derived`가 문자열을 냄: `"12"`는 12, `"abc"`는 받은 그대로입니다. 폼이 작성자의 선언을 빼거나 바꾸지 않았으므로 정착 오류가 아니고 `degraded`도 아닙니다(`adr/0014-error-policy.md:36`).
- S-d antd `InputNumber`에서 `-`를 치는 중: 노드는 직전 값을 유지합니다. rc-input-number는 입력기 조합 중에도, 해석 결과가 `NaN`일 때도 `onChange`를 부르지 않습니다(`node_modules/rc-input-number/es/InputNumber.js:300-305`). 치다 만 글자는 입력의 몫입니다.
- S-e 기본 수 입력의 빈 칸: 입력 계약에 따라 빈 칸이면 `undefined`를 보냅니다. 없음이 되고, 필수 필드면 `required`가 납니다. 치다 만 글자(`validity.badInput`)는 쓰지 않고, 포커스를 잃으면 표시를 노드 값으로 되돌립니다. 제3자 입력이 `NaN`을 보내면 형 불일치로 보아 받은 그대로 두고 방출합니다.
- S-f 불리언에 `"abc"`, 배열에 `"a,b"`, 객체에 `"x"`: 셋 다 받은 그대로 둡니다. `true`로 바꾸지 않고, 글자 배열이나 `[]`, `{}`로 바꾸지 않습니다. 각 경로에 형 에러나 경고가 나고, 입력은 무효 상태로 그립니다.
- S-g `null`: nullable 노드에서는 `null`이 유효한 값입니다. nullable이 아닌 노드에서도 `null`을 그대로 들고 `null`로 방출하며, 검증기가 형 에러를 냅니다. 오늘은 `NaN`을 거쳐 없음이 되어 선택 필드가 통과했으므로 동작 변화이고, F27과 같은 부류로 기록합니다. 서버가 `null`을 보내는 필드에는 스키마에 nullable을 적는 것이 해법입니다.
- S-h reset과 다시 로드: 로드와 같습니다. 깨끗한 레코드를 로드하면 앞 레코드의 값이 남지 않습니다. 경고의 중복 막기 집합이 로드마다 비워지므로, 불일치가 남아 있으면 경고가 한 번 다시 갑니다.

이 권고는 네 가지 조건과 함께 가야 합니다.
1. 변환 목록을 ajv보다 좁게, 이름을 붙여 적습니다. ajv는 공백만 있는 문자열을 0으로, `"0x10"`을 16으로, `"Infinity"`를 무한대로 바꾸고, 큰 정수 문자열은 정밀도를 잃습니다(`/tmp/claude-501/s1swarm/critic-integrity/coerce.cjs`로 다시 실행해 확인).
2. `omitEmpty`의 빈 값은 형으로 판정합니다. `NumberNode.ts:120`이 가져오지 않은 전역 `isNaN`을 써서 `"abc"`까지 방출에서 뺍니다.
3. 입력 구성 요소 계약을 둡니다.
4. 경고의 조건을 `VALIDATOR_MISSING`과 같게 둡니다.

확신도 '높음'은 핵심 규칙과 검증기 없음에 대한 답에 대한 것입니다. 입력 구성 요소 쪽 보완(antd의 포커스 이탈 뒤 표시, 실제 브라우저의 `badInput`)은 jsdom 실험과 코드 읽기로만 확인했습니다. PR-7에서 실행으로 확인해야 합니다.

**규칙.** 규칙(나′)
1. 규칙은 하나이고 출처와 상관없이 같습니다. 노드에 드는 모든 쓰기는 그 노드 동작 행의 `interpret` 칸(`architecture/09-landing-and-test-strategy.md:105`)을 한 번 지납니다. 로드, 공개 `setValue`, 사용자 입력, 부모에서 자식으로의 전파, `controls.derived`·`controls.injectTo`·채움 같은 자동 쓰기, reset이 모두 그렇습니다. `interpret`는 순수하고, 던지지 않고, 모든 입력에서 값을 돌려주며, 멱등입니다(`interpret(interpret(x))`는 `interpret(x)`와 같습니다).

2. 변환 목록입니다. 이것만 바꾸며, ajv `coerceTypes`의 부분집합입니다.
- 수 노드: 문자열이고, 앞뒤 공백을 뺀 나머지가 비어 있지 않은 JSON 수 표기(부호 `-`, 10진 정수부, 소수부와 지수부는 있어도 되고 없어도 됨)일 때 수로 바꿉니다. 결과가 유한해야 합니다. 소수부와 지수부가 없는 정수 표기라면 결과가 안전한 정수 범위 안에 있어야 합니다.
- 정수 노드: 위 조건에 더해 결과가 안전한 정수일 때만 바꿉니다. 이미 수인 12.7은 자르지 않습니다.
- 문자열 노드: 유한한 수는 `String(n)`으로, 불리언은 `"true"`·`"false"`로 바꿉니다.
- 불리언 노드: 정확히 `"true"`·`"false"`인 문자열과 수 1·0만 바꿉니다.
- 이미 자기 형인 값은 그대로 둡니다. 공백 자르기는 `options.trim`의 `finishInput` 칸에만 남습니다.

3. ajv와 이렇게 다르며, 이 차이에는 이름을 붙여 적습니다. 다음은 뜻이 바뀌므로 하지 않습니다.
- `null`을 0·`""`·`false`로 바꾸기. S1 이어서가 뺀 빈 값 치환과 진릿값 변환입니다.
- 빈 문자열이나 공백만 있는 문자열을 0으로 바꾸기.
- 16진·2진·8진 표기 변환.
- `"Infinity"` 변환, 그리고 수가 넘치는 표기의 변환.
- 안전 범위를 넘는 정수 표기의 변환(정밀도를 잃습니다).
- 불리언을 수로 바꾸기.
- 스칼라를 배열로 감싸기.
- 로드 때 문자열을 글자 배열로 쪼개기(`src/core/nodes/ArrayNode/strategies/TerminalStrategy/TerminalStrategy.ts:273-274`)도 없앱니다.

4. 변환할 수 없으면 받은 값을 그대로 원본에 둡니다.
- 대체 값(`NaN`·`""`·`[]`·`{}`), 비우기, 쓰기 거부, 읽기 가르기는 없습니다.
- `null`은 nullable 노드에서는 자기 형의 값입니다. nullable이 아닌 노드에서는 받은 그대로 듭니다.
- 가지 노드는 이미 정한 대로 잘못된 종류의 값을 자기 원본에 듭니다(`architecture/08-design-a-to-z.md:152`, `:274`).

5. 읽기와 방출은 하나입니다.
- `node.value`, `FormTypeInputProps`의 `value`와 `defaultValue`, `getValue()`, 부모의 방출, 그리고 검증기와 제출이 보는 값은 모두 같은 원본에 투영 규칙을 적용한 값입니다.
- `omitEmpty`의 빈 값은 형으로 판정합니다. 수 노드는 `undefined`만 빈 값입니다. `NaN`은 빈 값이 아니라 형 불일치입니다. 문자열 노드는 `undefined`와 문자열 `""`만 빈 값입니다.
- 형이 맞지 않는 값은 결코 빈 값이 아닙니다.
- `null`은 오늘처럼 `null`로 방출합니다(`src/core/nodes/NumberNode/NumberNode.ts:119`, `src/core/nodes/StringNode/StringNode.ts:85`).

6. 알림입니다. 형 불일치란 자기 형이 아니고, `undefined`도 아니며, nullable 노드의 `null`도 아닌 값입니다. 수 노드의 `NaN`과 `Infinity`도 포함합니다.
- 검증기가 있으면 검증 결과(노드 `errors`, 제출의 `ValidationError`)로만 드러냅니다. `onError`에는 보내지 않습니다(ADR 0014 §1, `architecture/adr/0014-error-policy.md:34`, `:95`).
- 검증기가 없고 검증 모드가 `None`이 아니면(`VALIDATOR_MISSING`과 같은 조건, `:213`) 경고 층 기록 하나를 개발 모드 콘솔과 `onError`로 보냅니다. 코드는 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`이고, `level`은 `'warning'`, 칸은 `path`와 `details`(기대한 형, 받은 값의 종류)입니다.
- 중복 막기는 코드와 경로로 하고, 로드마다 비웁니다(`:152`).
- 이 기록은 던지지 않고, `degraded`를 만들지 않으며, 제출을 막지 않습니다.
- 검증 모드를 `None`으로 적으면 보내지 않습니다.

7. 입력 구성 요소 계약입니다. `src/types/formTypeInput.ts:60-65`의 문서 주석에 적습니다.
- (ㄱ) 초안: 치다 만 글자와 입력기 조합 중인 글자는 입력이 스스로 듭니다.
  - 노드에는 자기 형의 값이나 없음만 보냅니다. `NaN`과 치다 만 원문은 보내지 않습니다.
  - 빈 칸이면 `undefined`를 보냅니다. 비우기 조작은 nullable이면 `null`, 아니면 `undefined`를 보냅니다.
  - 해석할 수 없는 초안이 남은 채 포커스를 잃으면 표시를 노드 값으로 되돌립니다.
- (ㄴ) 형이 아닌 값: `value`, `defaultValue`, 함수형 갱신의 `prev`는 노드 형이 아닐 수 있습니다.
  - 그런 값을 유효한 상태(빈 칸, 켜짐, 꺼짐, 체크된 항목)처럼 그리지 않습니다.
  - 받은 값이나 무효 표지가 보여야 하고, 한 번의 조작으로 비울 수 있어야 합니다.

8. 예외는 하나, 가상 노드입니다. 가상 노드는 자기 원본이 없어 받은 그대로 들 자리가 없습니다. 모양이 틀린 쓰기는 `architecture/adr/0014-error-policy.md:257`의 분류를 따릅니다. 공개 호출이면 호출자 오류, 자동 쓰기면 정착 오류입니다. 그리고 길이보다 배열인지를 먼저 봅니다(`src/core/nodes/VirtualNode/VirtualNode.ts:45`).

**쓰기 출처별.**
- **로드: 마운트의 `defaultValue`, 루트 전체 교체 `setValue(V)`, 그리고 그 안에서 부모가 자식에게 나눠 주는 전파.** 잎과 터미널 노드는 각각 `interpret`를 지납니다. 바꿀 수 있는 값(`"12"`)은 바꾸고, 그 밖의 값(`"abc"`, nullable이 아닌 노드의 `null`, 불리언 노드의 `"abc"`, 배열 노드의 `"a,b"`)은 받은 그대로 원본에 둡니다. 터미널 배열이 문자열을 글자로 쪼개는 동작은 없앱니다. 가지 노드는 잘못된 종류의 값을 자기 원본에 들고, 자식은 존재하되 빈 상태로 그려집니다(`architecture/08-design-a-to-z.md:274`). `value`와 방출이 곧 원본입니다. 형이 맞지 않는 값은 `omitEmpty`로 빠지지 않습니다. 입력은 `key={version}`으로 다시 마운트되어 새 `defaultValue`를 읽고(`src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:95`, `:121`), 입력 계약에 따라 형이 아닌 값을 무효 상태로 그립니다. 드러나는 자리: 검증기 있음: 로드 뒤 검증 요청 규칙(`architecture/adr/0014-error-policy.md:217`)에 따라 노드 `errors`에 형 에러가 들어가고, 제출은 `ValidationError`로 거부됩니다. `onError`에는 가지 않습니다. 칸 옆의 문구는 기본 정책 `DirtyTouched`(`src/providers/FormTypeRendererContext/FormTypeRendererProvider.tsx:14`, `:65`)를 따르지만, 입력의 무효 표지는 그 정책과 상관없이 바로 보입니다. 검증기 없음: 트리마다 `VALIDATOR_MISSING` 하나와 경로마다 로드당 `VALUE_TYPE_MISMATCH` 경고 하나가 갑니다. 거부나 throw는 없고, 받은 값이 그대로 제출됩니다.
- **공개 `setValue`: 잎에 쓰기, `Merge`, 그 밖의 호출자 쓰기.** 로드와 같은 `interpret`를 지납니다. `setValue("12")`는 12, `setValue("abc")`는 `"abc"`입니다. 형이 틀린 값은 데이터 문제이지 공개 호출의 계약 위반이 아니므로 호출자 오류로 던지지 않습니다(결정 1, `architecture/adr/0013-core-does-not-rewrite-values.md:29`). 호출자 오류로 남는 것은 계약을 어긴 호출뿐입니다. `Overwrite`와 `Merge`를 함께 주는 경우, 폐기된 노드에 쓰는 경우(`architecture/adr/0014-error-policy.md:85`), 가상 노드에 모양이 틀린 값을 쓰는 경우입니다. 자기 입력에서 온 쓰기가 아니므로 새로 고침으로 입력이 다시 마운트됩니다. 드러나는 자리: 검증기가 있으면 노드 `errors`에 형 에러가 들어가고, 제출이 거부되며, `onError`에는 가지 않습니다. 검증기가 없으면 그 경로에 `VALUE_TYPE_MISMATCH` 경고가 갑니다(로드당 한 번). 어느 쪽이든 throw는 없습니다.
- **사용자 입력: 입력 구성 요소의 `onChange`.** 입력 계약에 따라 core에는 자기 형의 값이나 없음만 옵니다. 치다 만 글자(`-`, `1.`)와 입력기 조합 중인 글자는 입력이 듭니다. antd는 이미 그렇게 합니다(`node_modules/rc-input-number/es/InputNumber.js:300-305`). 기본 수 입력은 빈 칸이면 `undefined`를 보내고, `badInput`이면 쓰지 않으며, 포커스를 잃으면 표시를 되돌리도록 고칩니다(`src/formTypeDefinitions/FormTypeInputNumber.tsx:23`). 출처로 가르지 않으므로, 계약을 지키지 않는 제3자 입력이 원문이나 `NaN`을 보내도 같은 규칙이 적용됩니다. 곧 받은 그대로 담고, `NaN`은 형 불일치로 방출합니다. 사용자 입력은 다시 마운트하지 않으므로 커서와 치던 글자가 유지됩니다(`src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:20-23`). 드러나는 자리: 빈 칸이면 필수 필드에서 `required`, 선택 필드에서 에러 없음으로 오늘과 같습니다. 계약을 어긴 제3자 입력의 `NaN`이나 원문은 검증기가 있으면 형 에러(`DirtyTouched`에 따라 보임), 없으면 경로마다 로드당 한 번 경고입니다. 치다 만 상태 자체는 오류가 아닙니다.
- **자동 쓰기: `controls.derived`, `controls.injectTo`, 채움(`controls.default` > `default`).** 같은 `interpret`를 지납니다. 식이 `"12"`를 내면 12, `"abc"`를 내면 `"abc"`를 담습니다. 폼이 작성자의 선언을 빼거나 바꾸지 않았으므로 정착 오류가 아니고 `degraded`도 아닙니다(`architecture/adr/0014-error-policy.md:36`). 식과 게이트는 같은 원본 하나를 읽으므로 형이 맞지 않는 값을 만날 수 있습니다. 식이 그 값에서 던지면 이미 정한 대로 식 실패로 `degraded`가 됩니다(`:197`, `:201`). 이것은 18라운드 안건 B(`architecture/08-design-a-to-z.md:488`)의 명세에 적습니다. 가상 노드를 대상으로 하는 `injectTo`는 `:257`의 분류를 따릅니다. 자동 쓰기이므로 대상 입력이 다시 마운트됩니다. 드러나는 자리: 검증기가 있으면 대상 경로에 형 에러가 납니다. 검증기가 없으면 대상 경로에 경고가 갑니다. 식이 던진 경우에만 `EXPRESSION_THREW`가 되고 제출이 거부됩니다(R17-1).
- **reset: 같은 스키마의 reset, 재생성 reset.** reset은 로드입니다(`architecture/adr/0013-core-does-not-rewrite-values.md:41`). 초기값이 같은 `interpret`를 다시 지나며, 형이 맞지 않는 초기값은 다시 받은 그대로 담깁니다. 전체 교체이므로 앞 상태의 값이 남지 않습니다. 새 로드가 형이 맞는 값이면 불일치도 끝납니다. 다시 마운트되어 비제어 입력이 새 원본을 읽습니다. 드러나는 자리: 검증 결과는 새 커밋을 기준으로 다시 계산합니다. 경고의 중복 막기 집합은 로드마다 비우므로(`architecture/adr/0014-error-policy.md:152`), 불일치가 남아 있으면 경고가 한 번 다시 갑니다. `diagnostics`에는 닿지 않습니다.
- **가상 노드에 쓰기(유일한 예외).** 가상 노드는 자기 원본이 없어 받은 그대로 담을 자리가 없습니다. 값은 참조한 잎들로 나뉘어 들어가고, 나뉜 값은 잎의 규칙을 따릅니다. 모양이 틀린 쓰기는 오늘처럼 받지 않습니다. 길이만 보는 검사(`src/core/nodes/VirtualNode/VirtualNode.ts:45`)는 길이가 같은 문자열을 글자로 쪼개므로, 배열인지를 먼저 봅니다. 드러나는 자리: `architecture/adr/0014-error-policy.md:257`의 분류를 따릅니다. 공개 호출이면 호출자 오류(즉시 throw), 자동 쓰기면 정착 오류(사슬 끝 throw, `degraded`)입니다. 확정은 `options.virtual` 설계 항목에서 합니다.

**검증기가 없을 때.** 아닙니다. 값을 비우지 않습니다. `onError`에도 오류(`level: 'error'`)가 아니라 경고(`level: 'warning'`) 기록 하나를 보냅니다.

값은 이렇게 됩니다. 받은 `"abc"`를 그대로 들고, `value`, 방출, 제출이 모두 `"abc"`입니다. 제출은 거부하지 않습니다. 소유자께서 드신 사용례, 곧 폼만 그리고 검증은 따로 하는 호스트(통보3)는 서버에서 실제 입력을 받아 형 에러로 잡을 수 있습니다.

비우지 않는 까닭은 넷입니다.
1. 비우기는 S1 이어서에서 소유자께서 빼신 '빈 값 치환'입니다. 결정 1의 '받은 값을 고치지 않는다'(`architecture/adr/0013-core-does-not-rewrite-values.md:29`)도 어깁니다.
2. 비운 값은 `omitEmpty` 때문에 방출에서 사라집니다(`src/core/nodes/NumberNode/NumberNode.ts:119-122`). 그러면 서버가 준 값이 다시 제출될 때 조용히 없어지고, 선택 필드라면 서버 검증까지 통과합니다.
3. ADR 0014는 폼이 호출자의 쓰기를 빼거나 바꾼 커밋을 오류 층의 조용한 데이터 손상으로 정의합니다(`architecture/adr/0014-error-policy.md:32`, `:36`). 비우는 규칙은 폼이 스스로 오류를 만들고, R17-1에 따라 그 오류를 던져야 하는 모순이 됩니다.
4. 검증기가 없는 폼에서는 그 원래 값이 문제의 유일한 증거입니다.

오류 층으로 보내지 않는 까닭은 이렇습니다. 오류 층은 throw, 거부, 싱크 가운데 하나로 드러내야 합니다(`:32`). 정착 쪽 오류라면 `degraded`와 제출 거부로 이어집니다(`:201`, `:203`). 그러면 서버 데이터의 틀린 칸 하나 때문에 검증을 쓰지 않는 폼이 던지거나 제출을 못 하게 되어, 통보3 '오류만 내보내고 거절은 하지 마시죠'와 부딪힙니다. 값을 그대로 두면 폼의 약속이 깨지지 않으므로 경고 층의 정의('동작을 바꾸지 않는 알림', `:33`)에 맞습니다. 또 검증기 없음 알림의 수준은 소유자께서 이미 warning으로 정하셨습니다(`architecture/reviews/round-17-owner-answers.md:33`, '(가) ㄱ warning으로').

알리는 방법은 이렇습니다.
- 조건: 검증기가 플러그인에도 `validatorFactory`에도 없고, 검증 모드가 `None`이 아닐 때입니다. `VALIDATOR_MISSING`과 같은 조건입니다(`:213`).
- 내용: 형이 맞지 않는 경로마다 로드당 한 번, 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 보냅니다. `path`, 기대한 형, 받은 값의 종류를 싣습니다.
- 출력: 기본 출력은 개발 모드 콘솔입니다. `onError` 핸들러는 모든 환경에서 받고, 핸들러가 없으면 비용이 없습니다. 중복 막기는 코드와 경로로 하며 로드마다 비웁니다(`:152`).
- 트리마다 한 번 가는 `VALIDATOR_MISSING`과는 별개입니다. 검증 모드를 `None`으로 적으면 둘 다 사라집니다.

검증기가 있을 때는 이 경고를 보내지 않습니다. 같은 사실이 노드 `errors`와 제출 거부로 이미 드러납니다. 여기에 `onError`까지 보내면 통보4('onError 와 onValidate 를 섞는건 사용자 입장에서 엄청 햇갈립니다', `:95`)를 어기게 됩니다.

이 경고는 core가 검증기의 일을 대신하는 것이 아닙니다(결정 3, `adr/0013-core-does-not-rewrite-values.md:31`). 노드 `errors`에 넣지 않고, 제출을 막지 않으며, 스키마의 다른 제약은 보지 않습니다. core 자신의 parse가 노드 형으로 바꿨는지만 알립니다. 조건부 스키마 경고(`adr/0014-error-policy.md:214`)와 같은 부류입니다.

끝 사용자에게 보이는 것도 따로 챙겨야 합니다. 검증기가 없으면 화면에 검증 문구가 없습니다. 그래서 입력 구성 요소 계약('형이 아닌 값을 유효한 상태처럼 그리지 않는다')이 유일한 화면 신호이고, 기본 수 입력을 비롯한 자사 입력 보완이 이 답의 일부입니다.

**제어 컴포넌트.** 먼저 사실 하나를 바로잡습니다. 문제문은 'UI 플러그인 입력은 제어 컴포넌트로 value를 쓰는 것이 많다'고 적었습니다. 그러나 수, 문자열, 여러 줄 입력은 기본 입력과 모든 플러그인에서 비제어입니다.
- 수 입력: 기본 `src/formTypeDefinitions/FormTypeInputNumber.tsx:34`, `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:52`, antd6 `:52`, mui `:100`, antd-mobile `:42`.
- 문자열과 여러 줄 입력도 모두 `defaultValue`를 씁니다.

라이브러리 자신의 입력 계약은 '비제어 + 바깥 쓰기 때 다시 마운트'입니다. `SchemaNodeInput.tsx:95`가 `defaultValue`를 `version`에 묶고, `:121`이 `key={version}`을 줍니다. 사용자 입력은 새로 고침을 내지 않으므로 치던 글자가 지워지지 않습니다(`useFormTypeInputControl.ts:20-23`). 제어 `value`를 쓰는 것은 불리언 체크박스와 스위치입니다(antd5 `FormTypeInputBoolean.tsx:36`, `FormTypeInputBooleanSwitch.tsx:61`, antd6 `:61`, antd-mobile `:46`). 그래서 어긋남이 생길 수 있는 곳은 세 군데입니다. 제3자나 사용자가 만든 제어 입력, `node.value`를 React 상태로 옮겨 쓰는 앱 코드, 불리언 입력입니다.

예측 가능성은 이렇게 보장됩니다. 읽기가 하나(`value`는 원본)이고 `interpret`가 순수하고 멱등이므로 다음이 성립합니다.
- 노드 형의 값을 쓰면 같은 값을 돌려받습니다. `undefined`와 nullable 노드의 `null`도 마찬가지입니다.
- 변환할 수 없는 값을 쓰면 같은 값을 돌려받습니다.
- 달라지는 것은 변환 목록의 경우(`"12"`는 12)뿐이고, 그 결과는 결정적입니다.
- 방출, 검증, 제출도 같은 값을 봅니다. 오늘은 `value`가 `NaN`인데 부모 방출에는 키가 없어서 둘이 어긋납니다(`NumberNode.ts:119-122`).

초안은 입력이 들어야 합니다. 이 계약은 선택이 아니라 필수입니다. 치다 만 원문을 노드로 보냈다가 돌려받으면 변환이 소수점과 부호를 지웁니다. `"1."`이 1이 되어, `"1.5"`를 치면 15, `"-0.5"`를 치면 5가 되고, 공백은 0이 됩니다. 이것은 `/tmp/claude-501/s1swarm/attack-react/decimal.cjs`를 다시 실행해 확인했습니다. 그래서 제어 입력의 예측 가능성은 core 규칙만으로 생기지 않고 규칙 7의 (ㄱ)이 있어야 생깁니다. rc-input-number는 이미 그렇게 합니다(`node_modules/rc-input-number/es/InputNumber.js:300-305`). 앱 코드에는 두 가지 관례를 안내합니다. 원문은 자기 상태에 들고 노드에는 해석한 값을 씁니다. 제어 수 입력에 넘길 때는 `typeof value === 'number' ? value : ''`처럼 좁힙니다.

형이 아닌 값은 유효한 상태처럼 그리지 않습니다(규칙 7의 ㄴ). 소유자께서 걱정하신 '값을 가지고 있는데 빈 값을 표현'은 어느 후보를 골라도 core만으로는 없어지지 않습니다. 입력 구성 요소의 층에 남기 때문입니다.
- 브라우저의 수 입력은 `"abc"`를 빈 칸으로 정리합니다(`/tmp/claude-501/s1swarm/integrity/sanitize.cjs`).
- antd `InputNumber`는 처음에는 `"abc"`를 보이다가, 포커스를 한 번 잃으면 `onChange` 없이 빈 칸이 됩니다(`attack-react/rcblur.cjs`, `InputNumber.js:368-384`).
- 체크박스와 스위치는 두 상태만 그릴 수 있습니다. 기본 체크박스는 `"abc"`를 켜짐으로 그리고(`src/formTypeDefinitions/FormTypeInputBoolean.tsx:29`), 스위치는 `checked={value ?? undefined}`입니다.
- 가(`NaN`)도 똑같이 빈 칸으로 보입니다(`InputNumber.js:171`).

그래서 같은 변경 묶음(PR-7)에서 자사 입력을 고칩니다.
- 수 입력: 형이 아닌 값이 있는 동안 원문과 무효 표지를 보이고, 한 번의 조작으로 비울 수 있게 합니다.
- 체크박스: 미정 상태로 그립니다. antd5 체크박스는 이미 그렇게 합니다(`FormTypeInputBoolean.tsx:20-24`).
- 스위치: 무효 표지를 붙입니다.
- 배열을 기대하는 입력은 `Array.isArray`로 막습니다. 대상은 다음과 같습니다.
  - antd5·antd6·mui의 문자열 체크박스: `defaultValue.map`이 `"a,b"`에서 렌더 중 TypeError를 냅니다.
  - 기본 문자열 체크박스: `includes`가 부분 문자열 검사가 되고, `prev` 펼침은 `["a",",","b","c"]`를 만듭니다(`src/formTypeDefinitions/FormTypeInputStringCheckbox.tsx:61-63`, `:76`).
  - antd의 날짜·시간·월 범위 입력: `length === 2` 검사가 두 글자 문자열을 범위로 읽습니다.
- antd와 mui 수 입력: 비울 때 nullable이 아니면 `undefined`를 보내게 합니다. 오늘은 `null`을 보냅니다(mui `FormTypeInputNumber.tsx:74-76`).
- mui 수 입력의 `parseFloat`·`parseInt`는 문자열 앞부분만 해석하므로(`:80-86`) 문자열 전체를 해석하도록 바꿉니다.

다른 후보는 제어 입력에서 더 나쁩니다.
- 가(`NaN`): React는 수 입력에 느슨한 비교를 써서 `NaN`을 렌더마다 다시 쓰고(`node_modules/react-dom/cjs/react-dom-client.development.js:1661-1664`), 그때마다 치던 글자가 지워집니다.
- 다(`undefined`): 제어 입력이 비제어로 넘어가 표시가 멈춥니다.
- 라(거부): 거부된 키 입력을 React가 되돌려 입력이 굳은 것처럼 보입니다.

**다른 후보가 지는 까닭.**
- 가. `NaN` 같은 대체 값(오늘): 받은 `"abc"`를 실패 표지로 고치므로 결정 1(`architecture/adr/0013-core-does-not-rewrite-values.md:29`)과 부딪힙니다. S1 이어서의 '그 이상을 하는건 원치 않습니다'와도 부딪힙니다. 뜻이 그대로인 변환이 아니기 때문입니다. 대체 값은 수 노드에만 있어 모든 노드에 같은 규칙을 적용할 수 없습니다(C8). `omitEmpty`가 `NaN`을 없음으로 돌리므로 저장(`NaN`)과 방출(없음)이 어긋나고, 형 에러가 `required`로 바뀌거나 사라집니다(`src/core/nodes/NumberNode/NumberNode.ts:119-122`, `architecture/reviews/raw-round18-s1-parse-check.md:118`). JSON으로 직렬화하면 `null`이 되고, `strict: false`로 만든 검증기는 통과시킵니다. 화면은 빈 칸인데 값은 `NaN`이므로, 소유자께서 위험하다고 하신 '값을 가지고 있는데 빈 값을 표현하는 것'이 바로 오늘의 상태입니다(`node_modules/rc-input-number/es/InputNumber.js:171`). 제어 수 입력에서는 React가 렌더마다 다시 써서 치던 글자를 지웁니다.
- 다. 저장은 입력, `value`는 자기 형이나 `undefined`: 소유자께서 위험하다고 하신 모양 그대로입니다. 제어 입력은 `undefined`를 받으면 비제어로 넘어가고 표시가 멈춥니다. 원본, `value`, 표시가 서로 달라집니다. 방출이 원본을 따르면 화면에 없는 값이 제출되고, `value`를 따르면 서버 값이 조용히 사라집니다. 읽기가 둘이 되어 표면 비용도 큽니다(C10).
- 라. 쓰기 거부: 결정 1의 '그대로 들어가고', '입력을 막지 않는다'와 글자 그대로 부딪히므로 규칙 1에 따라 결론이 될 수 없고, 소유자 질문 1의 반대쪽으로만 남습니다. 로드와 reset에서 거부된 잎은 비우거나(조용한 변경) 앞 레코드의 값을 남기게 됩니다(2라운드 잠복 값 결함의 모양). 거부는 '호출자의 쓰기가 커밋에서 빠짐'이므로 오류 층이고(`architecture/adr/0014-error-policy.md:32`), throw와 `degraded` 제출 거부로 이어집니다. 그러면 검증기 없는 폼까지 서버 값 하나로 잠겨 통보3과 부딪힙니다. 제어 입력에서는 키 입력이 되돌아가고, 원래 입력도 잃습니다(C6).
- 마. 쓰기 출처마다 다르게: 같은 `"abc"`가 출처에 따라 다르게 동작하므로, 제어 입력과 앱 코드가 `value`를 예측할 수 없습니다(C1). 규칙이 다섯 벌이 되고(C8, C10), 쓰기의 종류를 core가 추론하지 않는다는 D-4(`architecture/adr/0013-core-does-not-rewrite-values.md:36`)와도 어긋납니다. 출처에 따라 달라야 하는 것은 치다 만 글자뿐이며, 그것은 입력 구성 요소 계약으로 core 밖에서 풉니다.
- 나(경고 없이 그대로 두기만 함): 검증기가 있을 때는 나′와 같습니다. 그러나 검증기가 없으면 core가 이미 알고 있는 변환 실패가 트리마다 한 번 가는 `VALIDATOR_MISSING` 말고는 어디에도 드러나지 않습니다. 규칙 3(오류를 삼키지 않는다)과 C4가 약해집니다.
- 소유자께서 가정하신 안(검증기가 없으면 값을 비우고 `onError`로 오류를 보냄): 비우기는 뺀 '빈 값 치환'이고, `omitEmpty`를 거쳐 서버 값이 조용히 사라집니다. 게다가 비우기 자체가 ADR 0014가 정의한 오류(`:32`, `:36`)라서 폼이 스스로 오류를 만들게 됩니다. `level: 'error'`는 throw, `degraded`, 제출 거부를 부르므로 통보3과 부딪힙니다. 검증기 없음 알림의 수준은 소유자 답 (가)로 이미 warning입니다(`architecture/reviews/round-17-owner-answers.md:33`).
- 제안 1의 '검증기가 있어도 `onError` 경고를 보냄': 같은 사실이 노드 `errors`와 `onError`로 두 번 갑니다. 검증 결과를 `onError`에서 빼기로 한 계약(`architecture/adr/0014-error-policy.md:34`, `:95`, 통보4)과 글자 그대로 부딪힙니다. '변환 불가 구간마다 한 번'이라는 새 중복 막기 단위도 기존 장치(`:152`)와 겹치는 둘째 장치이고, 원문을 보내는 입력에서는 타자마다 기록이 쏟아집니다.
- 제안 2의 '기본 입력이 `badInput`이면 `NaN`을 보냄'과 '검증 모드 `None`에서도 경고': 치다 만 글자를 커밋하게 되어 입력 계약과 어긋납니다. 그 값은 직렬화하면 `null`이 되고, 입력 중인 상태를 데이터 경고로 잘못 알립니다. `None`은 작성자가 검증 알림을 끄겠다고 적은 표지이므로, `VALIDATOR_MISSING`처럼 이 경고도 끕니다.
- 제안 3의 '`NaN`은 이미 수 형이므로 항등, `omitEmpty`에서는 빈 값으로 유지': `node.value`는 `NaN`인데 방출은 없음이고 경고도 없습니다. 저장과 방출이 어긋나고 조용한 소멸이 그대로 남습니다. 게다가 오늘 투영의 전역 `isNaN`(`NumberNode.ts:120`)을 그대로 두면 `"abc"`도 방출에서 빠집니다.
- ajv `coerceTypes` 전체, zod `z.coerce`, TypeBox `Value.Convert`: 뜻이 바뀌는 변환을 포함합니다. `null`을 0·`""`·`false`로, 공백을 0으로, `"0x10"`을 16으로, `"Infinity"`를 무한대로 바꾸고(직렬화하면 `null`), 큰 정수 문자열은 정밀도를 잃으며, 정수를 자릅니다. S1 이어서의 '뜻이 그대로인 변환만'과 빈 값 치환·진릿값 변환 제외에 어긋납니다.
- 바. 검증기가 없을 때 core가 노드 `errors`에 형 에러를 직접 넣음: core가 검증기의 일을 맡게 되어 결정 3(`architecture/adr/0013-core-does-not-rewrite-values.md:31`)을 어깁니다. 검증 결과 층에 출처가 둘 섞이고, 검증기를 붙이면 에러가 두 번 나거나 모양이 달라집니다.
- 원본은 그대로 두되, 방출 투영에서 nullable이 아닌 잎의 `null`과 `NaN`을 없음으로 보는 안: 오늘의 결과(선택 필드는 통과, 필수 필드는 `required`)를 지키지만, 형 에러가 `required`로 바뀌거나 사라지는 결함(`raw-round18-s1-parse-check.md:118`)을 되살립니다. 저장과 방출도 어긋납니다. 객체에 대해 이미 정한 '보존·방출하고 type 에러'(`architecture/adr/0013-core-does-not-rewrite-values.md:91`)와도 다릅니다. 가장 강한 반론으로 따로 적었습니다.

**소유자 질문.**
- 질문 1. 변환하지 못한 값을 노드가 받은 그대로 들고 `value`로 돌려주는 나′를 S1 이어서의 남은 물음에 대한 답으로 확정하시겠습니까? 이 물음은 새로 올리는 것이 아닙니다. 소유자께서 직접 물으신 것이고(`architecture/reviews/round-18-owner-answers.md:8`, '파싱 실패시 지금처럼 NaN으로 파싱하게 하는게 좋을까요?', 반영 칸 '답 대기'), 소유자께서 말씀하신 가치가 걸려 있어 확정을 청합니다. 권고의 근거는 고정된 답(결정 1, S1 이어서, 통보3)을 글자 그대로 모두 지키는 후보가 이것 하나라는 점입니다. 맞바꾸는 것은 '노드가 자기 타입의 값을 소유한다는 보장'이며, 이 보장이 '변환할 수 있을 때만'으로 줄어듭니다. 보장을 우선하시려면 라(쓰기 거부)를 고르셔야 하고, 그 경우 세 가지가 따라옵니다. 결정 1에 이름 붙은 예외를 적어야 합니다. 로드와 reset에서 거부된 잎을 비울지(조용한 변경), 앞 값을 남길지(잠복 값) 정해야 합니다. 검증기 없는 폼도 틀린 서버 값 하나 때문에 오류 층(throw, `degraded`, 제출 거부)에 들어갑니다.
- 질문 2. 공개 값 형의 선언을 넓히시겠습니까? 나′에서는 수 노드의 `value`와 `FormTypeInputProps`의 `value`·`defaultValue`가 실행 중에 받은 그대로의 값(예: `"abc"`)일 수 있습니다. 그러면 오늘의 선언(`src/core/nodes/NumberNode/NumberNode.ts:25`, `:51`, `src/types/formTypeInput.ts:61-65`, `InferValueType`)이 그 경우에 거짓이 됩니다. 선택지는 둘입니다. (ㄱ) 선언 형을 '그 타입, 없음, 또는 변환하지 못한 받은 값'으로 넓힙니다. 형은 정직해지고 `defaultValue.map` 같은 충돌을 컴파일러가 잡지만, 모든 사용자 정의 입력과 플러그인이 좁히는 코드를 써야 하는 큰 사용성 변화가 생깁니다. (ㄴ) 선언 형은 오늘처럼 좁게 둡니다. 대신 문서 주석, 입력 구성 요소 계약, 형 판별 함수 하나로 예외를 알리고, 자사 입력은 PR-7에서 점검과 시험으로 막습니다. 비용은 싸지만 형이 드물게 사실과 다릅니다. 형의 정직함과 생태계 호환은 순위가 정해지지 않은 가치이고, 타입스크립트 사용자가 보는 결과가 달라지므로 원리로 정할 수 없습니다. 권고는 (ㄴ)입니다. 까닭은 셋입니다. 소유자께서 사용성 변화의 크기를 걱정하셨습니다. 가지 노드에서 같은 선택을 이미 받아들였습니다(`architecture/adr/0013-core-does-not-rewrite-values.md:91`). 오늘의 형도 `NaN` 때문에 이미 JSON의 수를 보장하지 못합니다. 제안 가운데 하나(무결성 렌즈)는 (ㄱ)을 권했습니다.

**가장 강한 반론.** 가장 강한 반론은 무결성 공격의 첫 항목과 사용성 공격이 함께 가리키는 것입니다. 나′는 소유자께서 걱정하신 '값을 가지고 있는데 빈 값을 표현'을 core에서 입력 구성 요소로 옮길 뿐인데, 오늘의 입력은 그 책임을 질 준비가 되어 있지 않다는 것입니다. 구체적으로는 이렇습니다.
- 브라우저의 수 입력은 형이 아닌 값을 빈 칸으로 정리합니다. antd는 포커스를 한 번 잃으면 빈 칸이 됩니다(`/tmp/claude-501/s1swarm/attack-react/rcblur.cjs`). 스위치는 참이나 거짓만 그릴 수 있습니다.
- `null`과 `NaN`이 더는 방출에서 빠지지 않으므로, 오늘 조용히 통과하던 흔한 데이터가 검증기 있는 폼에서 제출을 막습니다. 데이터베이스의 NULL을 받은 nullable이 아닌 선택 필드, 비울 때 `null`을 보내는 antd·mui 수 입력, 빈 칸에 `valueAsNumber`(`NaN`)를 보내는 제3자 입력이 그렇습니다. 모두 '빈 칸인데 형 에러'가 되고, 사용자는 이미 빈 칸을 다시 비울 방법이 없습니다.
- 게이트와 식도 결과를 바꿉니다. `if`의 `minimum`은 수가 아닌 값에 공허하게 참입니다(`/tmp/claude-501/s1swarm/critic-integrity/guard2.cjs`: 오늘 거짓, `\"abc\"`·`null`·`\"\"`에서 참). `\"a,b\".map`처럼 식이 던지면 `EXPRESSION_THREW`로 `degraded`가 되어(`architecture/adr/0014-error-policy.md:197`) 검증기 없는 폼까지 잠급니다.

이 반론이 내미는 대안은 원본은 그대로 두되, 결정 2가 허용한 방출 투영(`omitEmpty`)에서 nullable이 아닌 잎의 `null`과 `NaN`을 없음으로 보아 오늘의 결과를 지키는 것입니다.

받아들이지 않은 까닭은 다섯입니다.
1. 그 투영은 형 에러가 `required`로 바뀌거나 사라지는 결함(`architecture/reviews/raw-round18-s1-parse-check.md:118`)을 `null`에 대해 되살리고, 저장과 방출을 가릅니다.
2. 객체에 대해 이미 정한 '보존·방출하고 type 에러'(`architecture/adr/0013-core-does-not-rewrite-values.md:91`)와 규칙이 갈립니다.
3. 부분 갱신 방식의 백엔드에서는 `null`(지움)과 없음(그대로 둠)이 뜻이 다릅니다.
4. 오늘 `null`이 방출에서 빠지는 까닭은 `omitEmpty`가 아니라 파서의 `NaN`·`\"\"` 치환입니다. `src/core/nodes/NumberNode/NumberNode.ts:119`와 `src/core/nodes/StringNode/StringNode.ts:85`는 `null`을 `null`로 방출합니다. 그리고 그 치환은 소유자께서 S1 이어서에서 빼셨습니다.
5. 해법은 투영이 아니라 두 곳에 있습니다. 하나는 스키마입니다. 서버가 `null`을 보내는 필드에는 nullable을 적습니다. 다른 하나는 입력 계약입니다. 비우기는 nullable이 아니면 `undefined`를 보내고, 형이 아닌 값은 무효 표지와 한 번에 비우기로 그립니다. 이 동작 변화는 F27과 같은 이주 항목으로 기록합니다. 게이트와 식이 형이 맞지 않는 값을 읽는 규칙은 18라운드 안건 B(`architecture/08-design-a-to-z.md:488`)에서 명세합니다.

둘째로 강한 반론은 소유자 자신이 말씀하신 가치(노드의 타입 보장)를 앞세워 라를 고르자는 것입니다. 이것은 소유자 질문 1로 올렸습니다.

**확신.** 높음

**문서 영향.**
- `architecture/reviews/round-18-owner-answers.md:7`: 반영 칸의 두 문장을 S1 이어서와 이 결정으로 바꿉니다. 바꿀 문장은 '오늘의 `src/core/parsers/`를 그대로 쓴다'와 '공개 값 형은 오늘처럼 그 타입의 값이다(수 노드는 수, 파싱 실패는 `NaN`)'입니다. `:8` 반영 칸의 '답 대기'는 소유자 확정 뒤에 닫습니다.
- `architecture/adr/0013-core-does-not-rewrite-values.md`: `:29` 결정 1에 이름 붙은 예외(형 정규화, 변환 목록)와 '변환하지 못한 값은 받은 그대로 든다'를 적습니다. `:88` 행('타입별 파서의 강제 변환은 입력 컴포넌트로')을 'interpret의 변환 목록 + 초안은 입력 구성 요소'로 바꿉니다. `:91`의 F27을 잎과 터미널 노드로 넓히고, ajv와의 이름 붙은 차이(`null` 변환, 공백의 0 변환, 16진 등 표기, 무한대, 정밀도 손실, 불리언의 수 변환, 배열 감싸기)를 적습니다.
- `architecture/adr/0014-error-policy.md`: §3 받는 것 목록(`:84-91`)과 §6 검증기 없음(`:213`)에 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`와 그 조건(`VALIDATOR_MISSING`과 같음, 검증기가 있으면 보내지 않음)을 넣습니다. 코드 표(`:250` 부근)에 행을 하나 더합니다. 경고 중복 막기(`:152`)를 이 코드에 적용한다고 적습니다. `:257` 가상 노드 행에 '배열인지를 먼저 본다'를 더합니다.
- `architecture/08-design-a-to-z.md`: `:152` 원본 설명에 '잎과 터미널 노드는 변환하지 못한 값을 받은 그대로 든다'를 더합니다. `:274`에 가지 노드가 잘못된 종류의 값을 들 때의 한계(자식의 채움 값은 보이지만 방출되지 않음)를 적습니다. `:488` 식 언어 명세(18라운드 안건 B)에 '식과 게이트는 원본 하나를 읽고 형이 맞지 않는 값을 만날 수 있으며, 던지면 식 실패다'를 적고, 작성자 안내에 'if 서브스키마에 type을 함께 적는다'를 넣습니다.
- `architecture/09-landing-and-test-strategy.md`: `:105` interpret 칸의 계약(순수, 던지지 않음, 멱등, 실패하면 항등)과 project 칸의 `omitEmpty` 빈 값 형 판정을 적습니다. `:9`, `:33`, `:160`의 파서 관련 시험 항목을 변환 목록과 ajv 차이의 시험으로 바꿉니다. PR-7 이주 항목에 입력 구성 요소 계약과 자사 입력 수정 목록을 넣습니다. 수정 목록은 기본 수·불리언·문자열 체크박스 입력, antd5·antd6·antd-mobile 스위치, antd5·antd6·mui 문자열 체크박스, antd 날짜·시간·월 범위, antd·mui 수 입력의 비우기와 부분 해석, antd의 포커스 이탈 표시입니다.
- `architecture/04-inherited-constraints.md:49`: F27 행을 잎 노드까지 넓힌 동작 변화로 고칩니다. 들어갈 내용은 다섯입니다. `NaN`·`""`·`[]`·`{}`·`true` 치환의 폐기, nullable이 아닌 `null`이 방출되고 형 에러가 나는 것, `NaN`이 `omitEmpty`에서 빠지지 않는 것, 비울 때 `null`이나 `NaN`을 보내는 제3자 입력의 결과 변화, 오늘 `required`로 나던 문구가 형 에러로 바뀌는 것입니다.
- `architecture/03-mental-model.md:152`: '파서 강제 변환은 입력 컴포넌트로' 문장을 새 규칙으로 바꿉니다.
- `architecture/reviews/round-18-agenda.md:76`: S1 행의 '남은 물음: 변환하지 못한 입력의 처리'를 닫습니다. 문제문의 전제 가운데 '플러그인 입력은 제어가 많다'가 수와 문자열 입력에 대해서는 틀렸다는 사실(모두 `defaultValue`를 씀)도 함께 적습니다.
- 구현 쪽 모듈 문서(PR-2와 PR-7 때 고침): `packages/canard/schema-form/src/core/parsers/INTENT.md:10`의 '파싱 불가 입력은 `false`'는 오늘도 거짓이므로 새 변환 목록으로 바꿉니다. `packages/canard/schema-form/src/types/formTypeInput.ts:60-65`의 문서 주석에 입력 구성 요소 계약(초안, 형이 아닌 값의 표시, 비우기)을 적습니다.

## 3. Claude 스웜 설계자 넷

### 3.1 설계자 1: 나′: 받은 그대로 담고 그대로 돌려준다. 치다 만 글자는 입력이 들고, 변환하지 못한 값은 경고로 한 번 알린다

**관점.** 제어·비제어 React 입력 구성 요소와 사용자 입력 경험. 오늘의 기본 입력과 UI 플러그인(`packages/canard/schema-form-*-plugin`)이 `node.value`를 어떻게 읽고 `onChange`를 어떻게 부르는지, React 19.2.6이 `NaN`·`undefined`·다른 형의 `value`를 받은 제어 입력을 어떻게 다루는지(설치본 소스 확인과 jsdom 실험, `/tmp/claude-501/s1swarm/lens-controlled/react-writes.cjs`, `react-number.cjs`), 후보마다 치다 만 글자("-", "1."), 입력기 조합(한글 등), 플러그인 작성자에게 무슨 일이 일어나는지를 보았습니다. 먼저 사실 하나를 바로잡습니다. 문제문은 "UI 플러그인의 입력은 제어 컴포넌트로 `value`를 쓰는 것이 많다"고 적었지만, 수와 문자열 입력은 전부 비제어입니다. 기본 입력(`src/formTypeDefinitions/FormTypeInputNumber.tsx:34`), antd5와 antd6(`FormTypeInputNumber.tsx:52`), mui(`FormTypeInputNumber.tsx:100`), antd-mobile(`FormTypeInputNumber.tsx:42`)이 모두 `defaultValue`를 쓰고, 문자열과 여러 줄 입력도 같습니다. 제어로 쓰는 것은 불리언 체크박스와 스위치입니다(antd5 `FormTypeInputBoolean.tsx:36`, `FormTypeInputBooleanSwitch.tsx:61`, antd-mobile `FormTypeInputBooleanSwitch.tsx:46`, 문자열 스위치 `checked={value === checked}`). 라이브러리 자체의 입력 계약도 '비제어 + 바깥 쓰기 때 다시 마운트'입니다. `SchemaNodeInput.tsx:95`가 `defaultValue`를 `version`에 묶고, `:121`에서 `key={version}`을 줍니다. `useFormTypeInputControl.ts:20-23`에 따르면 사용자 입력은 `RequestRefresh`를 내지 않으므로 치던 글자가 지워지지 않습니다. 그래서 소유자가 걱정한 '제어 환경에서 값이 어긋나는 문제'는 세 곳에 모입니다. 제3자나 사용자가 만든 제어 입력, 앱 코드가 `node.value`나 `getValue`를 React 상태로 옮겨 쓰는 경우, 그리고 불리언 입력입니다.

**규칙.** 쓰기가 어디서 왔든(로드, 공개 `setValue`, 사용자 입력, `derived`와 `injectTo` 같은 자동 쓰기, reset) 규칙은 하나입니다. 노드의 parse는 뜻이 그대로이고 ajv `coerceTypes` 수준 안에 드는 변환만 합니다. 문자열 전체가 수이면 수로, 수는 문자열로, `"true"`·`"false"`·`1`·`0`은 불리언으로 바꿉니다. `null`을 `0`·`""`·`false`로 바꾸는 것은 뜻이 바뀌므로 하지 않습니다. 이렇게 바꿀 수 있으면 바꾼 값을, 바꿀 수 없으면 받은 값을 손대지 않고 원본에 담습니다. `value`와 입력의 `value`·`defaultValue` 속성은 언제나 원본에 담긴 것을 돌려줍니다. 읽기는 하나뿐이어서 저장과 보임이 같습니다. 대체 값(`NaN`)도, 비우기도, 거부도 없습니다. 방출도 받은 그대로입니다. `omitEmpty`는 `NaN`을 빈 값으로 세지 않습니다. 형 에러는 검증기가 노드 `errors`로 냅니다. 검증기가 있든 없든 core는 한 노드가 '바꿀 수 있음'에서 '바꿀 수 없음'으로 넘어갈 때마다 경고 층 기록 하나를 `onError`와 개발 모드 콘솔로 보냅니다. 기록은 가칭 `SCHEMA_FORM_WARNING.UNCONVERTED_VALUE`이고 `path`, 기대 타입, 받은 값의 종류, 쓰기 출처를 담습니다. 기록 전에는 `hasConsumer`로 받을 곳이 있는지 묻습니다. 제출은 검증기가 있으면 검증 실패로 막히고, 없으면 막지 않습니다. 입력 구성 요소에게는 계약이 하나 붙습니다. 치다 만 글자(초안)는 입력이 스스로 들고, 노드에는 자기 타입의 값이나 없음만 보냅니다. 빈 칸과 해석할 수 없는 글자는 `undefined`로 보내고, 비우기 조작은 nullable이면 `null`, 아니면 `undefined`로 보냅니다. 원본이 없는 가상 노드는 나눌 수 없는 쓰기를 오늘처럼 호출자 오류로 던집니다.

**검증기가 없을 때.** 아닙니다. 검증기가 없어도 값은 비우지 않고, 받은 그대로 두고 그대로 보이는 것을 권고드립니다. 비우지 않는 이유는 셋입니다. 첫째, 비우기는 결정 1이 금한 조용한 변경입니다(`adr/0013-core-does-not-rewrite-values.md:29`). 둘째, 소유자께서 우려하신 '값을 가지고 있는데 빈 값을 표현하는 것'을 core가 직접 만드는 일입니다. 셋째, 검증기가 없는 폼에서는 그 원래 값이 문제의 유일한 증거인데 그것을 지우게 됩니다. `onError`로는 알리되 '오류'가 아니라 '경고' 기록 하나를 보냅니다. 기록은 가칭 `SCHEMA_FORM_WARNING.UNCONVERTED_VALUE`이고 `path`, 기대 타입, 받은 값의 종류, 쓰기 출처를 담으며, 노드가 변환 불가 상태로 넘어갈 때 한 번 갑니다. 기본 출력은 개발 모드 콘솔입니다. 경고인 까닭도 있습니다. `level: 'error'`는 ADR 0014에서 사슬 끝의 throw, 프로미스 거부, 싱크, 그리고 `degraded` 동안의 제출 거부를 뜻합니다(`adr/0014-error-policy.md:32`, `:86`). 그렇게 되면 검증기가 없을 때 거절하지 말라는 통보3의 답(`:18`)과 부딪힙니다. 또 폼은 받은 것을 바꾸지 않았으므로 폼의 약속이 깨지지 않았고, 이는 경고 층의 정의에 맞습니다(`:33`, `:120`). 이 경고는 검증기가 있을 때도 보냅니다. 같은 입력이 검증기 유무에 따라 다른 길로 드러나지 않게 하려는 것입니다(G5). 검증 결과(`ValidationIssue`)를 `onError`에 섞는 것도 아닙니다. 끝 사용자에게는 입력이 원래 값을 그려 줄 때만 보이므로, 기본 수 입력의 표시를 보완하는 일이 남습니다.

**위험.**
- 문제문의 전제 가운데 '플러그인 입력은 제어가 많다'는 수와 문자열 입력에 대해서는 틀렸습니다(모두 `defaultValue`). 그래서 제어 환경에서 생기는 어긋남은 제3자·사용자 입력, 앱 상태, 불리언 입력에 모입니다. 18라운드 문서에 이 사실을 바로 적어 두어야 판단이 흔들리지 않습니다.
- 브라우저의 수 입력(`type=number`, 기본 입력과 mui)은 형이 다른 값을 빈 칸으로 정리합니다(jsdom 확인). 그래서 권고안에서도 기본 입력에는 '값을 가진 채 빈 칸'이 남습니다. 형이 다른 `defaultValue`를 받으면 원래 글자를 보여 주는 텍스트 모드로 그리거나, 적어도 `aria-invalid` 표시를 하도록 기본 입력을 보완해야 합니다.
- antd와 mui 수 입력은 칸을 비울 때 `null`을 보냅니다(rc-input-number `lib/InputNumber.js:285`, mui `FormTypeInputNumber.tsx:74-76`). 입력을 고치지 않으면 nullable이 아닌 필드를 비웠을 때 `required` 대신 형 에러가 나고 `null`이 방출됩니다. 자사 플러그인은 `nullable ? null : undefined`로 고치고, 제3자 플러그인에는 동작 변화로 알려야 합니다. 사용성 변화가 가장 크게 드러나는 곳입니다.
- 제어 `type=number`에 문자열 원래 값("abc")을 주면 React가 다시 그릴 때마다 입력 요소에 다시 씁니다(실험 ["abc","abc"]). 사용자가 입력하면 원본이 바뀌므로 오래가지는 않지만, 제어 작성자 안내서에 `typeof value === 'number' ? value : ''` 관례를 적어야 합니다.
- 공개 형을 넓히면(C7) 플러그인 작성자 코드에서 타입스크립트 오류가 날 수 있습니다. 넓히지 않으면 선언이 거짓으로 남습니다(`NumberNode.ts:25`, `:51`, `types/formTypeInput.ts:61-65`).
- 경고가 너무 많이 날 수 있습니다. 문자열을 키마다 보내는 제3자 입력이 있으면 기록이 쏟아지므로 '노드마다 변환 불가 구간에 한 번'이라는 중복 억제가 계약에 들어가야 합니다. 받을 곳이 없으면 `hasConsumer`로 비용을 없앱니다.
- 옛 입력이 보내는 `NaN`은 `strict: false` 검증기를 통과하고 JSON에서 `null`이 됩니다. `omitEmpty`에서 `NaN`을 빼는 것(`NumberNode.ts:120`)도 동작 변화입니다.
- `derived`의 형이 틀린 결과는 작성자의 결함인데 경고로만 알립니다. 검증기가 없으면 틀린 값이 서버까지 갑니다. 소유자가 R17-1 수준(오류 층)을 원하시면 규칙이 출처를 가르게 됩니다.
- 가상 노드는 `values?.length`로 나누므로(`VirtualNode.ts:45`) 길이가 같은 문자열이 글자 단위로 나뉠 수 있습니다. 배열 판정을 먼저 해야 합니다.
- 분기 배열이나 객체가 원래 스칼라 값을 쥐면 자식이 없음입니다. 자식 하나를 편집하면 원래 값이 자식으로 만든 값으로 바뀝니다(`adr/0013-core-does-not-rewrite-values.md:100`). 이 전이를 문서에 적어야 합니다.
- "1."이나 "-"를 칠 때 실제 브라우저(Chrome, Safari)가 `value`를 ""로 보고하는지는 jsdom과 HTML 규칙으로만 확인했습니다. 실제 브라우저에서는 확인하지 않았습니다.

### 3.2 설계자 2: 나′ — 받은 그대로 들고 그것을 보이며, 변환하지 못한 사실은 검증기가 있으면 검증 결과로, 없으면 경고 기록으로 알린다 (값은 비우지 않고 제출도 막지 않는다)

**관점.** 데이터 무결성과 오류의 보임. 후보마다 무엇이 저장되고(원본), 무엇이 `value`로 읽히며 입력에 보이고, 무엇이 방출·직렬화되어 검증기와 제출에 가며, 호스트가 `onError`·노드 `errors`·제출 거부로 무엇을 보는지를 검증기가 있을 때와 없을 때로 나누어 추적했습니다. 근거 경로는 `packages/canard/` 아래 기준입니다. 실험은 `/tmp/claude-501/s1swarm/integrity/sanitize.cjs` 하나(jsdom으로 수 입력의 값 정화와 `JSON.stringify`의 NaN 처리 확인)이며 저장소는 고치지 않았습니다.

**규칙.** 노드의 모든 쓰기(로드, 공개 `setValue`, 사용자 입력, 자동 쓰기, reset)는 한 규칙을 지납니다. 행의 `interpret` 칸이 부르는 parse는 뜻이 그대로인 변환(ajv `coerceTypes: true`의 수 문자열→수, 수→문자열, `"true"`·`"false"`·`1`·`0`→불리언)만 하고, 변환할 수 없으면 받은 값을 바꾸지 않고 그대로 원본에 둡니다. `null`을 0·`""`·`false`로 바꾸는 것과 스칼라를 배열로 감싸는 것은 뜻이 바뀌므로 하지 않습니다. 노드의 `value`는 언제나 원본 그 자체이며(저장=읽기), 방출도 같은 원본을 투영하므로 검증기와 제출이 보는 값이 호스트가 읽는 값과 같습니다. 이 규칙은 잎, 터미널 객체·배열, 가지 객체·배열에 같습니다(가지 노드는 이미 잘못된 종류의 값을 원본으로 듭니다). `NaN`과 `Infinity`는 JSON의 수가 아니므로 `omitEmpty`의 빈 값이 아니라 형이 맞지 않는 값으로 다루어 방출합니다. 알림의 자리는 판정할 검증기의 유무로 나뉩니다. 검증기가 판정하는 폼에서는 검증기의 형 에러가 노드 `errors`와 제출의 `ValidationError`로 나가고 `onError`에는 아무것도 가지 않습니다(검증 결과 층). 검증기가 없거나 검증 모드가 `None`인 폼에서는 core가 쓰기 뒤 원본이 노드 형에 맞지 않음을 알고 있으므로, 거부하지도 비우지도 않고 경고 층 기록(`level: 'warning'`, 가칭 `SCHEMA_FORM_WARNING.UNCONVERTIBLE_VALUE`, `path`, `details`에 기대한 형과 받은 값의 형)을 개발 모드 콘솔과 `onError`로 보냅니다. 중복 억제 키는 코드와 경로이며 로드마다 초기화합니다. 이 기록은 오류 층이 아니므로 사슬 끝에서 던지지 않고 `degraded`로 만들지 않으며 제출을 막지 않습니다. 입력 구성 요소는 노드 형이 아닌 `value`를 유효한 상태처럼 그리지 않을 책임을 지며(불리언은 `value === true`로만 켬, 수 입력은 원문을 보이거나 무효 표시), 기본 수 입력은 빈 칸이면 `undefined`, 치다 만 글자(`validity.badInput`)면 `NaN`을 보냅니다. 가상 노드는 원본이 없으므로 모양이 틀린 쓰기를 오늘처럼 호출자 오류로 즉시 던집니다.

**검증기가 없을 때.** 아닙니다. 검증기가 없을 때에도 값을 비우지 않고, 오류 층(`level: 'error'`)으로 보내지도 않는 것이 맞다고 판단합니다. 권고는 이렇습니다. 받은 값을 그대로 들고, `node.value`와 방출과 제출이 모두 그 값입니다. 그리고 경고 층 기록 하나(`level: 'warning'`, 가칭 `SCHEMA_FORM_WARNING.UNCONVERTIBLE_VALUE`, 경로와 기대한 형과 받은 형을 담음)를 개발 모드 콘솔과 `onError`로 보냅니다. 경로마다 로드당 한 번이며, 제출은 막지 않습니다. 까닭은 넷입니다. (1) 값을 비우는 것은 소유자가 S1 이어서 나에서 뺀 '빈 값 치환' 그 자체입니다(`architecture/reviews/round-18-owner-answers.md:8`). 게다가 비운 값은 `omitEmpty` 때문에 방출에서 사라지므로(`schema-form/src/core/nodes/NumberNode/NumberNode.ts:119-122`), 서버가 준 `\"abc\"`가 다시 제출될 때 조용히 없어집니다. 이는 ADR 0014가 오류로 정의한 '호출자의 쓰기가 커밋에서 빠지거나 바뀐' 조용한 데이터 손상입니다(`architecture/adr/0014-error-policy.md:32`, `:36`). 즉 비우면 폼이 스스로 오류를 만듭니다. (2) 오류 층으로 보내면 규칙상 사슬 끝에서 던지고, 폼 약속의 파손으로서 `degraded` 제출 거부와 한 묶음이 됩니다(`:32`, `:53`, `:203`). 그러면 서버 데이터에 틀린 칸 하나만 있어도 검증을 쓰지 않는 호스트가 제출할 수 없게 되어, 통보3의 '오류만 내보내고 거절은 하지 마시죠'와 부딪힙니다(`:213`). (3) 값을 그대로 두면 폼의 약속은 깨지지 않습니다. 그래서 이 사건은 오류가 아니라 경고 층의 '동작을 바꾸지 않는 알림'에 맞습니다(`:33`). 검증기가 없을 때만 내는 경고라는 선례도 이미 있습니다(`:214`의 조건부 스키마 경고). (4) 검증기가 있으면 같은 사실이 형 에러로 노드 `errors`와 제출 거부에 드러납니다. 그때 `onError`로도 보내면 '검증 결과는 `onError`에 가지 않는다'(`:34`, `:95`)를 어기고 두 번 알리게 되므로, 검증기가 판정하지 않는 폼(검증기 없음, 또는 검증 모드 `None`)에서만 보냅니다. 핸들러가 없는 프로덕션에서는 보이는 출력이 없다는 한계가 남습니다. 이것은 소유자가 `VALIDATOR_MISSING`에 받아들인 것과 같은 수준이며, 호스트가 `onError`를 달면 모든 환경에서 받습니다.

**위험.**
- 원시 `<input type="number">`는 형이 아닌 문자열을 그릴 수 없습니다(jsdom 실행: `"abc"`→`""`). 기본 수 입력(`schema-form/src/formTypeDefinitions/FormTypeInputNumber.tsx:26-38`)을 원문과 무효 표시로 그리도록 고치지 않으면 '값을 들고 빈 칸을 보임'이 기본 입력에 남습니다. 게다가 기본 표시 정책 `DirtyTouched`(`FormTypeRendererProvider.tsx:14`)에서는 로드 직후의 형 에러가 칸 옆에 보이지 않습니다.
- 불리언 입력 가운데 참 같은 값으로 켜지는 것들이 있습니다. antd5·antd6·antd-mobile 스위치의 `checked={value ?? undefined}`(`schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:61`, `schema-form-antd6-plugin/.../FormTypeInputBooleanSwitch.tsx:61`, `schema-form-antd-mobile-plugin/.../FormTypeInputBooleanSwitch.tsx:46`, `node_modules/rc-switch/es/index.js:54`)와 기본 체크박스의 `defaultChecked`(`schema-form/src/formTypeDefinitions/FormTypeInputBoolean.tsx:29`)입니다. 이들은 `"abc"`를 켜짐으로 그려 보임과 저장된 뜻이 어긋납니다. 플러그인 수정과 입력 계약 문서화가 같은 PR에 들어가야 합니다.
- 공개 선언 형이 변환 불가 값을 담지 않습니다(소유자 질문). 좁은 형을 그대로 두면 TypeScript 소비자가 `value`를 수로 믿고 계산하다 문자열을 만납니다. `controls.derived` 식처럼 `value`를 읽는 작성자 식도 같습니다(오늘은 `NaN`을 만났던 자리).
- `NaN`을 `omitEmpty`의 빈 값에서 빼면, 빈 칸에 `NaN`을 보내는 사용자 정의 입력이 있는 폼에서 방출이 바뀝니다(키 없음 → `NaN` 방출과 형 에러). 기본 입력은 빈 칸에 `undefined`를 보내도록 함께 고쳐야 하고, 이 변화는 행동 변화로 기록해야 합니다.
- 검증기 없이 호스트가 방출을 직접 `JSON.stringify`하면 `NaN`이 `null`로 바뀝니다(jsdom 실행). 경고가 유일한 신호이며, 프로덕션에서 `onError`를 달지 않으면 보이지 않습니다(경고 층의 기본 출력은 개발 모드뿐, `adr/0014-error-policy.md:33`).
- nullable 아닌 노드의 `null`을 0·`""`·`false`로 바꾸지 않는 것은 ajv `coerceTypes` 표(`reviews/raw-round18-s1-parse-check.md:30`, `:41`, `:52`)보다 좁습니다. '뜻이 그대로인 변환만'에서 도출했지만 parse 명세에 제외로 명시해야 합니다. 스칼라를 배열로 감싸는 `coerceTypes: 'array'`의 동작도 같이 제외로 적어야 합니다. 오늘 `required`로 나던 에러 문구가 형 에러로 바뀝니다.
- 경고가 검증기 유무에 따라 나오거나 나오지 않으므로, 같은 데이터가 설정에 따라 `onError` 흐름이 다릅니다. 어느 설정에서나 한 자리에는 드러나지만, `ADR 0014` §3의 받는 것 목록과 §6에 조건을 명시해야 합니다. 검증 모드 `None`에서도 이 경고를 낼지는 `VALIDATOR_MISSING`을 끄는 `None`의 뜻과 다르므로 문서에 따로 적어야 합니다.
- 서버 데이터 전체가 틀린 형이면 경로마다 경고가 하나씩 나와 기록이 많아집니다. 중복 억제 키(코드와 경로, 로드마다 초기화)를 명시해야 합니다.
- `VirtualNode`의 모양 틀린 쓰기는 오늘처럼 던지므로 C8의 유일한 예외로 남습니다(`schema-form/src/core/nodes/VirtualNode/VirtualNode.ts:45-58`). 가상 노드가 방출 데이터에 없다는 사실에서 나온 예외임을 문서에 적어야 합니다.

### 3.3 설계자 3: 나′: 값 하나 규칙(변환할 수 있으면 변환하고, 그렇지 않으면 받은 그대로 든다. 저장=보임=방출, 어긋남은 검증 결과나 경고로 알린다)

**관점.** 공개 API와 형 계약. 공개 읽기(`node.value`, `outputValue`, `FormHandle.getValue()`, 형 판별 함수, `InferValueType`, `FormTypeInputProps`)가 각 후보에서 무엇을 정직하게 약속할 수 있는지, 플러그인 작성자와 호스트가 무엇을 처리해야 하는지를 봅니다. 규칙이 놓일 자리는 노드 구조의 동작 행 칸(`architecture/09-landing-and-test-strategy.md:103`의 `interpret`·`project`)과 `validation` 모듈로 잡았습니다.

**규칙.** 노드에 드는 모든 쓰기(로드, 공개 `setValue`, 사용자 입력, 자동 쓰기, reset)는 그 노드 동작 행의 `interpret` 칸(`architecture/09-landing-and-test-strategy.md:103`)을 한 번 지납니다. `interpret`는 순수하고 던지지 않는 함수입니다. 입력 전체가 목표 형을 손실 없이 적은 것일 때만 변환하고(수 노드의 `"12"`는 12가 되며, 이 변환은 ajv `coerceTypes`의 부분집합입니다), 그렇지 않은 입력은 손대지 않고 그대로 돌려줍니다(항등). `null`은 nullable 노드에서만 목표 형의 값입니다. nullable이 아닌 노드에서도 `null`을 0, `""`, `false`로 바꾸지 않습니다. 노드는 그 결과 하나를 원본으로 들고, `node.value`, `outputValue`(투영 규칙을 적용한 뒤의 값), `FormHandle.getValue()`, `FormTypeInputProps.value`는 모두 그 한 값을 읽습니다. 대체 값(`NaN`, `""`, `[]`, `{}`)을 넣지 않고, 쓰기를 거부하지 않으며, 읽기를 가르지 않습니다. 형이 맞지 않는 값은 검증기가 돌면 검증 결과(노드 `errors`의 `type`)로 드러납니다. 검증기가 돌지 않으면 `validation` 모듈이 `onError`로 경고 기록(`level: 'warning'`, 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`, 로드마다 경로당 한 번)을 보내고 개발 모드 콘솔에도 냅니다. 두 경우 모두 쓰기와 제출을 거부하지 않습니다. 치다 만 글자나 빈 칸을 형에 맞는 값으로 바꾸는 일은 입력 구성 요소가 `onChange` 계약(`src/types/formTypeInput.ts:65`)으로 책임집니다. 이 규칙은 설계가 가지 노드에 이미 정해 둔 규칙과 같습니다. 가지 노드는 잘못된 종류의 값을 원본으로 들고 그대로 방출하며 type 에러를 냅니다(`architecture/adr/0013-core-does-not-rewrite-values.md:91`, `architecture/adr/0006-single-value-ownership.md:31`, `architecture/08-design-a-to-z.md:274`). 이번 규칙은 그것을 잎 노드와 터미널 노드로 넓힐 뿐입니다.

**검증기가 없을 때.** 아닙니다. 값을 비우지 않고, `onError`에도 오류가 아니라 경고로 보냅니다. 첫째, 값을 비우면 조용한 변경입니다. ADR 0013 결정 1("받은 값을 고치지 않는다. 그대로 들어가고 에러로 보인다", `architecture/adr/0013-core-does-not-rewrite-values.md:29`)을 어기고, 검증 기록이 적은 '거부는 보여야 하며 없음으로 바뀌면 안 된다'(`architecture/reviews/raw-round18-s1-parse-check.md:127`)도 어깁니다. 더 구체적으로는 소유자가 든 검증기 없는 사용례, 곧 폼만 그리고 검증은 따로 하는 호스트가 가장 크게 다칩니다. 선택 필드가 비워진 채 올라가면 서버 검증을 통과해 데이터가 사라지고, `"abc"`가 그대로 올라가면 서버가 형 에러로 잡습니다. 둘째, 오류 층(`level: 'error'`)은 기본 드러남이 throw, 거부, 싱크 가운데 하나여야 합니다(`architecture/adr/0014-error-policy.md:30`). 그러면 서버 데이터 하나 때문에 폼이 던지거나 제출을 막게 되어 통보3의 "오류만 내보내고 거절은 하지 마시죠"(`:213`)와 부딪힙니다. ADR 0014의 가르는 물음 "이 사건 뒤에도 원장의 규칙이 지켜지는가"(`:33`)로 보아도, 값을 받은 그대로 두었으므로 규칙은 지켜졌고 경고 층입니다. 드러남은 이렇습니다. 검증기가 돌지 않는 커밋에서 형이 맞지 않는 노드마다 `onError`로 경고 기록(가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`, `path`, 기대한 형, 받은 값의 종류)을 보냅니다. 로드마다 경로당 한 번이고(`:152`), 모든 환경에서 가며(`:31`), 개발 모드 콘솔에도 나갑니다. 검증기가 돌면 같은 사건이 검증 결과(노드 `errors`)이므로 `onError`에 보내지 않습니다. 소유자의 "onError 와 onValidate 를 섞는건 햇갈린다"를 지키기 위해서입니다. 최종 사용자 화면에 에러 문구가 없는 것은 검증을 끈 호스트의 선택입니다. 다만 '값을 가지고 있는데 빈 값을 표현하는' 위험을 줄이려면, 기본 수 입력은 값이 수가 아닐 때 받은 글자를 그대로 보여 주도록 렌더 계층에서 고치기를 권합니다.

**위험.**
- 플러그인이 선언 형을 믿고 쓴 코드가 형 밖의 값에서 렌더 중에 던질 수 있습니다. 예를 들어 `packages/canard/schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputStringCheckbox.tsx:67`과 `packages/canard/schema-form-mui-plugin/src/formTypeInputs/FormTypeInputStringCheckbox.tsx:71`의 `defaultValue.map`은 `"a,b"`에서 TypeError가 납니다. 필드 바운더리가 가두어 대체 화면과 `onError`로 보내지만(`architecture/adr/0014-error-policy.md:52`) 사용 경험이 나빠집니다. PR-7 전에 내장 입력과 플러그인 입력을 `typeof`로 방어하도록 점검해야 합니다.
- 조용히 틀리게 보이는 곳도 있습니다. 내장 `src/formTypeDefinitions/FormTypeInputStringCheckbox.tsx:76`의 `defaultValue?.includes(rawValue)`는 문자열 `"a,b"`에서 부분 문자열 검사가 되어 `"a"`를 체크된 것으로 그립니다. 날짜 범위 입력의 `defaultValue?.length === 2`(`packages/canard/schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputDateRange.tsx:59`)는 두 글자 문자열을 범위로 읽습니다.
- 브라우저 수 입력은 수가 아닌 `defaultValue`를 빈 칸으로 정리합니다(HTML 명세의 값 정리 규칙이며 실행하지 않은 추정입니다). 그래서 노드가 `"abc"`를 드는데 위젯은 비어 보이는 '값을 가지고 있는데 빈 값' 모습이 위젯 수준에 남습니다. 오늘의 `NaN`도 같이 빈 칸입니다. 기본 수 입력이 수가 아닌 값을 글자로 보여 주도록 고치지 않으면, 검증기가 없는 폼에서는 최종 사용자가 어긋남을 알 길이 없습니다. antd `InputNumber`가 수가 아닌 `defaultValue`를 어떻게 그리는지는 확인하지 않았습니다.
- 동작 변화가 기록되어야 합니다. 오늘은 변환하지 못한 값이 `NaN`, `""`, `[]`, `{}`로 바뀌어 `required` 에러가 나거나 에러가 없었는데, 이제는 받은 값이 방출되고 type 에러가 납니다. nullable이 아닌 노드의 `null`도 `required`에서 type 에러로 바뀝니다. F27과 같은 부류의 이주 항목입니다(`architecture/04-inherited-constraints.md:49`).
- ajv `coerceTypes`는 `null`을 0, `""`, `false`로 바꾸지만 이 규칙은 바꾸지 않습니다. '뜻이 그대로'와 F27의 일관성을 따른 판단입니다. 소유자 답의 '(ajv 규칙 수준)'을 상한이 아니라 기준으로 읽으면 어긋나 보일 수 있으므로 ADR 0013의 이름 붙은 예외에 명시해야 합니다.
- `omitEmpty`의 빈 값 판정에서 `NaN`을 오늘처럼 빈 값으로 두면(`src/core/nodes/NumberNode/NumberNode.ts:120`), `valueAsNumber`를 쓰는 제3자 입력은 오늘처럼 동작합니다. 대신 호출자가 드물게 로드한 `NaN`은 방출에서 빠집니다. JSON은 `NaN`을 나를 수 없으므로(`JSON.stringify`는 `null`) 실제 빈도는 낮다고 봅니다. `strict: false` 검증기는 `NaN`을 통과시킨다는 사실(문제 정의의 사실 항목)도 함께 적어야 합니다.
- 터미널 배열의 로드 경로가 문자열을 한 글자씩 나누는 동작(`src/core/nodes/ArrayNode/strategies/TerminalStrategy/TerminalStrategy.ts:273-274`)을 없애지 않으면, 같은 `"a,b"`가 로드와 `setValue`에서 다르게 남아 C8이 깨집니다.
- 가상 노드는 원본이 없어 받은 그대로 들 자리가 없습니다. 잘못된 쓰기의 분류가 가상 노드 설계 항목(`architecture/adr/0014-error-policy.md:257`)에 달려 있으므로, 그 항목에서 '호스트 원본처럼 든다'를 택하지 않으면 가상 노드만 다른 규칙이 됩니다.

### 3.4 설계자 4: 나′ — 받은 그대로 보존(ajv·react-jsonschema-form·JSON Forms 방식), 초안은 입력 구성 요소가 소유

**관점.** 선행 사례(prior art). 설치된 패키지와 로컬에서 읽을 수 있는 소스로 확인했습니다. 대상은 ajv 8.17.1 `coerceTypes`, react-jsonschema-form 6.6.1(`@rjsf/core`, `@rjsf/utils`, `@rjsf/validator-ajv8`), react-hook-form 7.76.1, Formik 2.4.9, zod 3.25.76, TypeBox 0.34.48, rc-input-number 9.5.0과 `@rc-component/input-number` 1.6.2(antd 입력), react-dom 19.2.6, TypeScript `lib.dom.d.ts`, jsdom 26.1.0입니다. JSON Forms는 저장소에 설치되어 있지 않습니다. 그래서 npm 레지스트리에서 3.6.0 묶음(core, vanilla-renderers, material-renderers)을 `/tmp/claude-501/s1swarm/lens-prior-art/`에 받아 읽었습니다. 실행한 실험 파일은 `/tmp/claude-501/s1swarm/lens-prior-art/`에 있는 `dom.cjs`, `rjsf.cjs`, `controlled.cjs`입니다. 저장소 파일은 쓰지 않았습니다.

확인한 결론은 이렇습니다. JSON Schema를 기준으로 삼는 라이브러리(ajv, react-jsonschema-form, JSON Forms, TypeBox `Value.Convert`)는 모두 후보 나를 씁니다. 변환하지 못한 값을 그대로 두고, 형이 맞지 않는다는 사실은 검증기가 알립니다. 필드를 기준으로 삼는 라이브러리(react-hook-form의 `valueAsNumber`, Formik)는 대체 값(`NaN`, `''`)을 씁니다. 그 대체 값이 오늘 우리 파서와 같은 결함을 냅니다. Formik은 형 에러를 `required`로 바꾸고, 엄격하지 않은 검증기는 `NaN`을 통과시킵니다. 치다 만 글자는 어느 선행 사례에서도 저장소에 들어가지 않습니다. 입력 구성 요소가 자기 초안으로 따로 들고 있습니다(rc-input-number, react-jsonschema-form `NumberField`, JSON Forms material).

**규칙.** 노드에 드는 모든 쓰기(로드, 공개 `setValue`, 사용자 입력, 부모에서 자식으로의 전파, `derived`, `injectTo`, reset)는 그 노드 타입의 parse를 한 번 지납니다. parse가 값을 바꾸는 경우는 하나뿐입니다. 받은 값이 목표 형이 아니고 뜻이 그대로인 변환이 있을 때입니다. 변환은 ajv `coerceTypes`의 부분집합입니다. 문자열 전체가 유한한 수이면 수가 되고, 정수 노드에서는 소수부가 없어야 합니다. 수와 불리언은 문자열이 됩니다. `"true"`·`"false"`·`1`·`0`은 불리언이 됩니다. `null`, `""`, 배열, 객체는 어느 방향으로도 변환하지 않습니다. ajv의 `null`→`0`·`false`·`""`는 뜻이 바뀌므로 이름 붙은 차이로 적고 따르지 않습니다. 변환할 수 없으면 노드는 받은 값을 그대로 저장하고, `value`는 저장한 그 값을 그대로 돌려줍니다(저장=보임). 대체 값(`NaN`, `""`, `[]`, `{}`), 쓰기 거부, 읽기 가르기는 없습니다. 방출도 그 값을 그대로 싣습니다. 형이 맞지 않는 값은 `omitEmpty`가 말하는 빈 값이 아니므로 생략되지 않습니다. 형 불일치는 검증 결과 층에 속합니다(ADR 0014 §1). 검증기가 있으면 노드 `errors`의 `type` 에러로 보이고, 제출은 여느 검증 실패처럼 막힙니다. 검증기가 없으면 값을 비우지 않고 제출도 거부하지 않습니다. `VALIDATOR_MISSING`과 같은 조건에서 노드마다 한 번 `onError`에 경고 기록(가칭 `VALUE_TYPE_MISMATCH`, 경로와 받은 값)을 보내는 것을 권합니다. 이 경고를 둘지는 소유자 질문입니다. 자기 저장 자리가 없는 가상 노드만 예외입니다. 모양이 맞지 않는 쓰기는 오늘처럼 호출자 오류로 즉시 던집니다(`VirtualNode.ts:44-58`). 치다 만 글자(`-`, `1.`, 조합 중인 IME 글자)는 입력 구성 요소의 초안이며 core에 쓰지 않습니다. 입력 구성 요소는 빈 칸이면 `undefined`를 보내고, 변환한 수나 받은 원문을 보냅니다. `NaN`을 새로 만들어 보내지 않습니다. 형이 맞지 않는 값을 받으면 그 값을 보이게 그립니다.

**검증기가 없을 때.** 아닙니다. 검증기가 없어도 값을 비우지 않고, 오류 층의 기록으로 보내지도 않는 것이 맞습니다. 근거는 세 가지입니다. 첫째, 값을 비우면 그것이 곧 ADR 0014가 오류로 정의한 '호출자의 쓰기를 빼거나 바꾼 커밋', 곧 조용한 데이터 손상입니다(`architecture/adr/0014-error-policy.md:32`, `:36`). R17-1에 따르면 그런 커밋은 사슬 끝에서 던져야 하므로, 비우는 규칙은 스스로 오류를 만들어 던지는 모순이 됩니다. 둘째, 형이 맞지 않는 값은 폼이 약속을 깬 사건이 아니라 '사용자의 값이 스키마에 맞지 않음', 곧 검증 결과 층입니다(`architecture/adr/0014-error-policy.md:34`). 소유자는 검증기가 없을 때 '오류만 내보내고 거절은 하지 마시죠'라고 정했고, 그것은 이미 `VALIDATOR_MISSING` 경고로 반영되어 있습니다(`:213`). 셋째, 선행 사례도 어느 것 하나 값을 비우지 않습니다. react-jsonschema-form은 `noValidate`이면 formData를 그대로 제출하고(`node_modules/@rjsf/core/src/components/Form.tsx:1164`), JSON Forms의 `NoValidation`은 데이터를 건드리지 않습니다. 권하는 모습은 이렇습니다. 값은 `\"abc\"` 그대로 저장되고, 보이고, 방출됩니다. 제출은 거부하지 않습니다. `onError`에는 트리마다 한 번 `VALIDATOR_MISSING`이 갑니다. 여기에 더해 `VALIDATOR_MISSING`과 같은 조건(검증기가 없고 검증 모드가 `None`이 아님)에서 형이 맞지 않는 노드마다 로드당 한 번 경고 기록(`level: 'warning'`, 가칭 `VALUE_TYPE_MISMATCH`, 경로와 받은 값)을 보내기를 권합니다. parse는 검증기 없이도 변환에 실패한 사실을 알고 있으므로 계산 비용이 들지 않습니다. 검증 모드를 `None`으로 적은 폼에서는 `VALIDATOR_MISSING`처럼 이 경고도 나가지 않습니다. 이 경고를 둘지는 아래 소유자 질문 2입니다.

**위험.**
- 네이티브 `type=number` 입력은 형이 맞지 않는 값(`"abc"`, `"NaN"`)을 받으면 빈 칸으로 정화합니다(jsdom 실행: `/tmp/claude-501/s1swarm/lens-prior-art/dom.cjs`). 기본 수 입력(`packages/canard/schema-form/src/formTypeDefinitions/FormTypeInputNumber.tsx:34`)과 mui 플러그인(`packages/canard/schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:100`)에서는 '값을 가지고 있는데 빈 칸을 보이는' 일이 표시 단계에서 생깁니다. 이 위험은 가에서도 똑같이 생깁니다(`NaN`도 빈 칸이 됩니다). 나′에서는 값과 에러가 남으므로 복구할 수 있지만, 입력 구성 요소가 형이 맞지 않는 값을 보이게 그리도록 고쳐야 합니다. rc-input-number는 원문을 그대로 표시하는 선례입니다(`InputNumber.js:170-171`)
- 공개 값 형을 넓히면 TypeScript 소비자 코드 전반에 좁히는 코드가 필요해져, 주 버전 수준의 변화가 됩니다. 넓히지 않으면 형이 거짓이 됩니다. 어느 쪽도 비용이 있습니다(소유자 질문 1)
- `omitEmpty`가 형이 맞지 않는 값(예: 수 노드의 `""`)을 빈 값으로 보고 생략하면, 형 에러가 `required`로 바뀌는 오늘의 결함(`architecture/reviews/raw-round18-s1-parse-check.md:118`)이 되살아납니다. 빈 값은 노드 타입별로 좁게 정의해야 합니다
- 제3자 입력이나 호출자가 `NaN`을 쓰면 core는 그대로 저장합니다. `strict: false` 검증기는 이것을 통과시키고(`rjsf.cjs` 실행), 호스트의 `JSON.stringify`는 `null`로 바꿉니다. 플러그인 기본 설정의 `strictNumbers`를 유지하고, 검증기가 없을 때의 경고가 유한하지 않은 수도 형 불일치로 세어야 합니다
- 형이 맞지 않는 값을 든 branch 노드에 자식 쓰기나 항목 추가가 오면, 받은 값이 새 그릇으로 바뀝니다(react-jsonschema-form과 lodash `set`의 선례, 실행 확인). 사용자의 새 쓰기이므로 조용한 변경은 아니지만, 원래 값이 사라지는 순간이므로 문서에 적어야 합니다
- ajv 규칙 가운데 `null`→`0`·`false`·`""`와 `coerceTypes: 'array'`의 스칼라 감싸기를 따르지 않습니다. 소유자 답의 'ajv 규칙 수준'과 글자가 조금 어긋나므로, 뜻이 바뀌는 변환이라는 이유와 함께 이름 붙은 차이로 적어야 합니다
- 로컬에서 확인하지 못한 것이 넷 있습니다. (1) 실제 브라우저에서 `-`를 쳤을 때 `validity.badInput`의 값과 입력 이벤트의 순서입니다. jsdom은 사용자의 타이핑을 흉내 내지 못해 `badInput`이 늘 `false`입니다. (2) 제어 네이티브 수 입력에서 `NaN`이 치던 `-`를 지우는지입니다. React 코드로 추론했을 뿐 브라우저에서 실행하지 않았습니다. (3) JSON Schema 명세에 형 변환 규정이 없다는 점입니다. (4) JSON Forms는 설치된 패키지가 아니라 레지스트리에서 받은 3.6.0을 읽었습니다

## 4. Claude 스웜 반박자 둘

### 4.1 반박자 1

**각도.** 사용성과 React. 네 제안은 모두 같은 핵심 규칙 나′(변환할 수 있으면 변환하고, 그렇지 않으면 받은 그대로 두며, 비우지 않고, 알림은 검증 결과나 경고로 보냄)를 권합니다. 그래서 공격은 규칙 자체보다 규칙이 실제 입력 부품에 닿는 자리를 겨누었습니다. 제어 입력과 비제어 입력, 타자, 포커스 이탈, reset, 플러그인 부품입니다. 소유자의 우려인 '값을 가지고 있는데 빈 값을 표현하는 것'이 각 제안에서 실제로 없어지는지를 기준으로 보았습니다. 저장소는 고치지 않았습니다. 실험은 `/tmp/claude-501/s1swarm/attack-react/` 아래의 네 파일에서 React 19.2.6, jsdom, rc-input-number(루트 `node_modules`), ajv 8.17.1로 돌렸습니다. `decimal.cjs`는 소수 타자, `rcblur.cjs`는 antd 수 입력의 포커스 이탈, `display.cjs`는 형이 틀린 값의 표시를 봅니다. ajv 변환 경계는 `$TMPDIR/ajvc.cjs`로 확인했습니다. 제안 1이 바로잡은 사실은 제가 다시 확인했고 맞습니다. 모든 플러그인의 수, 문자열, 여러 줄 입력은 `defaultValue`를 쓰는 비제어 입력입니다(`schema-form-*-plugin/src/formTypeInputs/FormTypeInput{Number,String,Textarea}.tsx`). 제어 입력으로 쓰는 것은 불리언과 스위치입니다.

**살아남은 것.**
- 핵심 규칙 나′(받은 그대로 두고, 비우지 않고, 쓰기를 거부하지 않음)는 네 제안 모두에서 살아남습니다. 위 공격은 core가 값을 비우거나 대체해야 한다는 근거가 되지 않습니다. 비우면 같은 '빈 칸 표시'가 저장과 방출까지 번집니다. 가의 `NaN`도 브라우저 수 입력과 antd에서 똑같이 빈 칸으로 보입니다.
- '검증기가 없어도 값을 비우지 않고, `onError`에는 오류가 아니라 경고로 보낸다'는 답은 네 제안 모두에서 살아남습니다. 사용성 쪽에서 반례를 찾지 못했습니다.
- 제안 1은 가장 튼튼합니다. 플러그인 수 입력이 비제어라는 사실의 교정, React가 `NaN`, `undefined`, 거부된 쓰기를 어떻게 처리하는지에 대한 분석, 초안은 입력이 든다는 계약이 모두 버팁니다. 다만 경고 조건(검증기가 있을 때도 보냄)과 중복 억제 단위는 고쳐야 합니다.
- 제안 2는 보완을 거치면 살아남습니다. 경고를 검증기가 판정하지 않는 폼으로 한정한 점은 ADR 0014 §1과 맞습니다. 불리언을 `value === true`로 보완하는 부분은 다시 설계해야 합니다.
- 제안 3은 omitEmpty 투영을 고쳐야만 살아남습니다(`NumberNode.ts:120`의 전역 `isNaN`). S-d와 C9의 주장은 무너집니다.
- 제안 4는 C9의 주장과 S-d의 실험 결론이 무너집니다(소수 타자). 선행 사례의 교훈인 '초안은 입력 부품이 소유'와 핵심 규칙은 살아남습니다.
- 소유자의 우려 '값을 가지고 있는데 빈 값을 표현하는 것'은 어느 안으로도 core에서 없어지지 않습니다. 두 상태 부품(체크박스, 스위치)과 브라우저 수 입력의 정리 규칙 때문에 부품 층에 남습니다. 이것은 나′에 반대하는 근거가 아니라, 입력 계약과 표시 정책이 함께 가야 한다는 조건입니다.

**고침.**
- 입력 계약에 '형이 틀린 값을 받으면 유효한 상태처럼 그리지 않는다'를 부품별로 구체화합니다. 체크박스는 ref로 `indeterminate`를 켭니다. 스위치는 두 상태 중 어느 것도 참이 아니므로, 옆에 무효 표지를 붙이거나 형이 틀린 동안 미정 부품으로 바꿔 그립니다. 브라우저 수 입력은 형이 틀린 원래 값이 있는 동안 원문을 읽기 전용 안내로 옆에 보이고, 비우기 버튼을 둡니다. 이렇게 해야 '두 번 눌러야 거짓'과 '비울 사건이 없음'이 풀립니다.
- 로드, `setValue`, 자동 쓰기에서 온 형 불일치는 `DirtyTouched`와 상관없이 칸 옆에 보이게 합니다. 예를 들어 `ShowError`를 켜는 식입니다. 이것은 사용자에게 보이는 결과를 바꾸므로 소유자 질문으로 올립니다.
- antd 수 입력 플러그인은 형이 틀린 `defaultValue`를 받으면 포커스를 잃을 때 빈 칸이 되지 않게 해야 합니다. 방법은 둘입니다. `value`로 원문을 제어해 `flushInputValue`가 원문으로 되돌리게 하거나, 무효 상태(`status`)와 원문 안내를 따로 둡니다. 실제로 원문이 유지되는지는 jsdom과 브라우저에서 다시 확인해야 합니다(`rcblur.cjs`를 바꿔 실행).
- 같은 변경 묶음에서 배열에 기대는 플러그인 부품을 모두 `Array.isArray`로 막습니다. antd5·antd6·mui 문자열 체크박스(`.map`), 기본 문자열 체크박스(`.includes`), 날짜·시간·월 범위(`.length === 2`)가 대상입니다. S-f의 '보임' 칸은 부품마다 다시 적습니다.
- 변환 명세를 ajv보다 좁게, 이름을 붙여 적습니다. 앞뒤 공백이 없고, 비어 있지 않은 10진 표기이며, 유한한 수일 때만 변환합니다. 공백 문자열이 0이 되는 것, 16진·2진 표기, "Infinity"는 뺍니다. `null`과 같은 이유(뜻이 바뀜)로 ajv와의 차이로 기록합니다.
- 제안 3과 제안 4는 '원문을 보내는 제어 입력도 나′에서 칠 수 있다'는 주장을 거둡니다. 대신 제안 1의 초안 계약('노드에는 자기 타입의 값이나 없음만 보낸다')을 모든 제안의 필수 입력 계약으로 삼습니다. 제3자 작성자용 안내에 "1."이 1로 바뀌는 예를 적습니다.
- 기본 수 입력은 포커스를 잃을 때 `validity.badInput`이 참이면 한 가지로 정리합니다. `undefined`를 보내 칸과 노드를 함께 비우거나, 표시를 노드 값으로 되돌립니다. 제안 3과 4처럼 '-'가 보이는 채 이전 값이 제출되는 일을 막고, 제안 4의 `NaN` 문장의 모순을 없앱니다.
- omitEmpty의 빈 값 판정은 전역 `isNaN`이 아니라 형에 따른 판정(`Number.isNaN`, 또는 `NaN`을 빼는 것)으로 명시합니다. 제안 3은 투영을 유지하더라도 문자열이 빠지지 않게 고칩니다.
- 제안 1의 경고는 제안 2처럼 검증기가 판정하지 않는 폼에만 보냅니다. 중복 억제는 ADR 0014 `:152`대로 code와 path로 하고, 로드마다 비웁니다.
- S-f 문자열판(객체나 배열을 쥔 문자열 노드)을 장면에 더하고 C1 판정을 다시 매깁니다. 원래 값이 사용자의 한 글자 편집으로 사라지는 전이를 문서에 적습니다.

**공격 (12건).**
- [높음] 제안 1, 제안 2, 제안 4 (antd 수 입력이 원래 값을 보여 준다는 주장: 제안 1의 S-a와 C4, 제안 2의 S-a, 제안 4의 S-a) / S-a와 S-b(검증기가 있을 때와 없을 때), antd5 플러그인. 서버가 `{ age: "abc" }`를 줍니다. 수 입력에 처음에는 "abc"가 보입니다. 사용자가 Tab으로 이 칸을 지나가기만 합니다(포커스를 얻었다가 잃음).: 포커스를 잃는 순간 입력 칸이 빈 칸이 됩니다. 그런데 `onChange`는 불리지 않으므로 노드는 "abc"를 그대로 쥡니다. 소유자가 걱정한 '값을 쥔 채 빈 칸을 보임'이 사용자가 한 번 지나가기만 해도 생깁니다. 게다가 기본 표시 정책 `DirtyTouched`는 dirty와 touched가 둘 다 참이어야 에러를 보입니다. 이 경우 dirty가 거짓이므로 "must be number"도 칸 옆에 보이지 않습니다. 검증기가 있으면 제출이 이유가 보이지 않는 채로 막힙니다. 검증기가 없으면 빈 칸처럼 보이는 곳에서 "abc"가 서버로 갑니다. 제안들이 C4의 근거로 든 'antd는 원래 값을 보여 준다'는 첫 그림에서만 참입니다. (근거: 실험 `/tmp/claude-501/s1swarm/attack-react/rcblur.cjs`의 출력은 `defaultValue "abc" shown "abc" after blur "" onChange calls []`입니다. 원인 코드는 `node_modules/rc-input-number/es/InputNumber.js:368-384`(flushInputValue)와 `:247-279`(triggerValueUpdate)입니다. 플러그인은 비제어입니다(`schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:52`). 표시 정책은 `schema-form/src/providers/FormTypeRendererContext/FormTypeRendererProvider.tsx:13`, `:65`에 있습니다.)
- [높음] 네 제안 모두 (불리언 입력). 특히 제안 1의 보완(`defaultValue === true`)과 제안 2의 보완(`value === true`) / S-f. 불리언 노드가 "abc"를 쥡니다. 기본 체크박스, antd5·antd6·antd-mobile 스위치 모두 같습니다.: 체크박스와 스위치는 두 상태만 그릴 수 있어서 "abc"를 정직하게 보일 방법이 없습니다. 오늘 코드에서 기본 체크박스는 켜짐으로 그려집니다(`defaultChecked`가 참 같은 값을 켜짐으로 받음). 스위치도 `checked={value ?? undefined}`여서 켜짐입니다. 그래서 제안 3과 4는 '참'을 보이면서 "abc"를 제출합니다. 제안 1과 2의 보완은 반대로 꺼짐을 보이면서 "abc"를 쥡니다. 이것이 바로 '값을 가지고 있는데 빈 값을 표현하는 것'입니다. 사용자가 '거짓'을 원해도 칸이 이미 꺼져 보이므로 보낼 사건이 없습니다. 두 번 눌러야만 `false`가 되며, 이 방법을 알아낼 수 없습니다. antd 체크박스의 미정 상태만 예외입니다. (근거: `schema-form/src/formTypeDefinitions/FormTypeInputBoolean.tsx:29`, `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:61`, `schema-form-antd6-plugin/src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:61`, `schema-form-antd-mobile-plugin/src/formTypeInputs/FormTypeInputBooleanSwitch.tsx:46`. 예외인 antd 체크박스는 `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputBoolean.tsx:20-25`입니다. 실험 `display.cjs`의 출력은 `checkbox defaultChecked "abc" -> true`입니다.)
- [높음] 제안 1, 제안 2, 제안 4 (S-f에서 보이는 값이 "a,b"라는 주장). 제안 3은 위험 항목에 적었으나 보완 범위가 부족합니다. / S-f. 항목이 문자열 enum인 체크박스 배열 노드(`formType: 'checkbox'`)에 로드나 `setValue`로 "a,b"가 옵니다.: antd5, antd6, mui 플러그인의 문자열 체크박스는 `defaultValue.map`을 부르므로 렌더 중에 TypeError로 죽습니다. 필드 경계가 대체 화면으로 가두어도 필드가 사라집니다. 기본 문자열 체크박스는 `defaultValue?.includes(rawValue)`가 부분 문자열 검사가 되어 a와 b를 체크된 상태로 그립니다. 유효한 배열 ["a","b"]처럼 보이면서 문자열 "a,b"를 제출합니다. antd의 날짜·시간·월 범위 입력은 `defaultValue?.length === 2`라서 두 글자 문자열을 범위로 읽습니다. 나′가 core에서 '받은 그대로'를 허용하는 순간, 오늘 파서가 보장하던 배열 형에 기대던 부품이 깨집니다. (근거: `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputStringCheckbox.tsx:67`, `schema-form-antd6-plugin/src/formTypeInputs/FormTypeInputStringCheckbox.tsx:67`, `schema-form-mui-plugin/src/formTypeInputs/FormTypeInputStringCheckbox.tsx:71`, `schema-form/src/formTypeDefinitions/FormTypeInputStringCheckbox.tsx:76`, `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputDateRange.tsx:59`, `FormTypeInputTimeRange.tsx:53`, `FormTypeInputMonthRange.tsx:58`. 실험 `display.cjs`의 출력은 `"a,b".map is not a function`과 `true,true,false`입니다.)
- [높음] 제안 3 (S-d와 C9 '지킴': 제어 입력이 "-"를 돌려받아 "-5"를 칠 수 있다), 제안 4 (C9와 S-d: '원문을 그대로 보내는 제어 입력도 나′에서만 계속 칠 수 있습니다') / S-d의 변형. 타자마다 원문 문자열을 보내는 제어 텍스트 입력에서 사용자가 "1.5", "-0.5", "1.05"를 칩니다.: ajv 수준의 변환은 "1."을 1로, "-0"을 0으로, "1.0"을 1로 바꿉니다. 제어 입력은 그 수를 돌려받아 소수점과 부호를 지웁니다. 결과는 "1.5"가 15, "-0.5"가 5(부호가 조용히 사라짐), "1.05"가 105입니다. 두 제안이 C9를 '지킴'으로 매긴 근거인 실험(`controlled.cjs`)은 "-3"만 쳐 보았습니다. 나′에서도 치다 만 글자는 core에 오면 안 됩니다. 입력 부품이 초안을 들어야 한다는 계약이 필수이지, 나′의 장점이 아닙니다. (근거: 실험 `/tmp/claude-501/s1swarm/attack-react/decimal.cjs`의 출력은 `want "1.5" | ... "1."=>store 1 shown "1" ; "15"=>store 15`와 `want "-0.5" | ... "-0"=>store 0 shown "0" ; ... "05"=>store 5`입니다. 변환 규칙은 제안 4가 쓴 실험의 규칙과 같습니다(`/tmp/claude-501/s1swarm/lens-prior-art/controlled.cjs:10`).)
- [중간] 제안 1과 제안 2 (C1: '제어 입력과 앱 상태는 넣은 것을 그대로 돌려받습니다', '제어 입력이 value={node.value}로 받는 것이 곧 저장되고 방출되는 값') / S-b와 S-d. 앱 코드가 `node.setValue(text)`를 부르고 `node.value`를 React 상태로 옮겨 씁니다.: 변환할 수 있는 문자열은 수로 바뀌어 돌아옵니다("1."는 1, "12"는 12). 변환할 수 없는 문자열은 문자열로 돌아옵니다. 그래서 타자에 따라 `typeof`가 번갈아 바뀌고, 앞 항목의 소수 문제가 앱 상태에서도 생깁니다. '넣은 것을 그대로 돌려받는다'는 말은 변환할 수 없는 값에만 참입니다. (근거: `decimal.cjs`의 출력, ajv 실행 결과(`"1." -> 1`, `"1.50" -> 1.5`), `schema-form/src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:116`.)
- [중간] 네 제안의 변환 명세 (제안 1 '문자열 전체가 수이면 수로', 제안 2 '수 문자열→수', 제안 3 '손실 없이 적은 것', 제안 4 '문자열 전체가 유한한 수') / S-b와 S-c. 문자열을 보내는 입력이나 `derived`가 " ", "\n", "0x10", "0b11", "Infinity"를 냅니다.: ajv 8.17.1의 `coerceTypes`는 " "와 "\n"을 0으로, "0x10"을 16으로, "0b11"을 3으로, "Infinity"를 Infinity로 바꿉니다. 빈칸을 0으로 바꾸는 것은 제안들이 `null`에 대해 '뜻이 바뀐다'며 뺀 바로 그 변환입니다. 제어 입력에서는 사용자가 친 공백이 "0"으로 보입니다(`decimal.cjs`의 `" "=>store 0 shown "0"`). 'ajv 규칙 수준'으로 구현하면 필수 필드의 `required`가 공백 한 칸으로 사라집니다. (근거: `$TMPDIR/ajvc.cjs`의 실행 결과는 `" " -> 0`, `"\n" -> 0`, `"0x10" -> 16`, `"0b11" -> 3`, `"Infinity"`가 에러 없이 통과함입니다. 해당 ajv 코드는 `packages/canard/schema-form/node_modules/ajv/lib/compile/validate/dataType.ts:99-107`입니다.)
- [높음] 네 제안 모두 (기본 수 입력과 mui 수 입력의 보완이 명세되지 않음) / S-a와 S-h. 선택 필드(필수가 아닌 필드)에 "abc"를 로드합니다. 기본 수 입력(`type=number`)을 씁니다.: 브라우저가 "abc"를 빈 칸으로 정리합니다. 사용자는 빈 칸을 보지만, 값을 비우려 해도 보낼 사건이 없습니다. 숫자를 하나 쳤다가 지워야만 비워지며, 이 방법을 알아낼 수 없습니다. `DirtyTouched`라서 제출 전까지 에러도 보이지 않습니다. 검증기가 없으면 보이지 않는 "abc"가 제출됩니다. 네 제안은 이 위험을 적었지만, 보완을 '텍스트 모드로 그리거나 aria-invalid' 정도로만 말했습니다. 텍스트 모드는 모바일 숫자 자판과 `step`을 잃고, aria-invalid는 값을 보여 주지 못합니다. 저장소 밖 제3자 플러그인의 브라우저 수 입력은 보완할 수 없습니다. C1이 '부분'이라는 판정은 실제보다 약하게 적혀 있습니다. 가장 흔한 입력에서 소유자의 우려가 그대로 남습니다. (근거: `schema-form/src/formTypeDefinitions/FormTypeInputNumber.tsx:27`, `:34`, `schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:100`(TextField `type="number"`), 실험 `/tmp/claude-501/s1swarm/integrity/sanitize.cjs`, `schema-form/src/providers/FormTypeRendererContext/FormTypeRendererProvider.tsx:65`.)
- [중간] 제안 3 (S-e: `badInput`이면 쓰지 않음), 제안 4 (규칙: 치다 만 글자는 core에 쓰지 않음) / S-e의 변형. 기본 수 입력의 값이 30입니다. 사용자가 전체를 선택하고 "-"만 친 뒤 칸을 떠나 제출합니다.: 브라우저 수 입력은 rc-input-number와 달리 포커스를 잃어도 마지막 유효 값으로 되돌아가지 않습니다. 그래서 칸에는 "-"가 남고 노드는 30을 쥐며, 30이 제출됩니다. 보이는 것과 저장된 것이 조용히 다릅니다. 또 제안 4의 S-e는 '`badInput`이면 입력이 `NaN`을 보낼 수 있다'고 적어서, 자기 규칙('`NaN`을 새로 만들어 보내지 않습니다')과 어긋납니다. (근거: `schema-form/src/formTypeDefinitions/FormTypeInputNumber.tsx:22-24`. 사용자 입력은 다시 마운트하지 않습니다(`schema-form/src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:20-23`). rc-input-number의 되돌림은 그 부품에만 있습니다(`node_modules/rc-input-number/es/InputNumber.js:368-384`).)
- [높음] 제안 3 (S-e: '`NaN`을 `omitEmpty`의 빈 값으로 보는 오늘의 투영은 `project` 칸에 남깁니다'와 S-a의 방출 `{ age: "abc" }`) / S-a와 S-e. 수 노드가 "abc"를 쥡니다.: 오늘의 `__onChangeWithOmitEmpty__`는 가져오지 않은 전역 `isNaN`을 씁니다. 전역 `isNaN("abc")`는 참이므로, 투영을 그대로 두면 "abc"가 부모 값에서 빠집니다. 형 에러가 다시 `required`로 바뀌거나 사라집니다. 제안 3이 없앤다고 한 결함이 되살아나고, S-a의 방출 주장이 거짓이 됩니다. 제3자 입력이 보낸 `NaN`도 `node.value`는 `NaN`이고 부모에는 없으므로, 제안의 '저장=보임=방출'이 깨집니다. (근거: `schema-form/src/core/nodes/NumberNode/NumberNode.ts:120`(`isNaN(input)`). 1-15행의 import에 `isNaN`이 없으므로 전역 함수입니다.)
- [중간] 제안 1 (검증기가 있어도 `onError` 경고를 보내고, 중복 억제를 '변환 불가 구간마다 한 번'으로 둠) / S-a(검증기 있음), 그리고 원문 문자열을 보내는 제3자 입력에서 사용자가 "-5"를 쳤다 지우기를 되풀이합니다.: '사용자의 값이 스키마에 맞지 않음'은 ADR 0014가 정의한 검증 결과 층이고, 이 층은 `onError`에 가지 않습니다. 검증기가 있을 때도 보내면 같은 사실이 노드 `errors`와 `onError`로 두 번 갑니다. 이는 17라운드 소유자 답(통보4 둘째 답)에 따른 '받지 않는 것' 목록과 부딪힙니다. 구간마다 한 번이면 타자가 변환 불가로 다시 들어갈 때마다 기록이 새로 나갑니다. `onError`를 오류 수집기에 연결한 호스트는 프로덕션에서 사용자 타자마다 기록을 받습니다. (근거: `architecture/adr/0014-error-policy.md:34`, `:93-95`(받지 않는 것), `:152`(경고의 중복 억제는 code와 path로, 로드마다 비움).)
- [낮음] 제안 2 (S-e와 C9: 기본 입력이 `badInput`이면 `NaN`을 보내고, 에러는 포커스를 떠난 뒤에만 보임) / S-e. 사용자가 이미 한 번 편집해서 dirty와 touched가 참인 필드로 돌아와 "-"를 치기 시작합니다. 검증기가 있습니다.: `DirtyTouched`는 두 상태가 이미 참이면 곧바로 에러를 보입니다. 그래서 "-"를 칠 때마다 "must be number"가 깜박입니다. '포커스를 떠난 뒤에만 보인다'는 첫 편집에만 맞습니다. 또 `NaN`을 방출에서 빼지 않으므로, 검증기가 없으면 호스트의 `JSON.stringify`에서 `null`이 됩니다. 같은 값을 앱이 제어 `type=number`로 옮겨 쓰면 React가 렌더마다 "NaN"을 다시 써서 치던 글자를 지웁니다. (근거: `schema-form/src/providers/FormTypeRendererContext/FormTypeRendererProvider.tsx:65`. `node_modules/react-dom/cjs/react-dom-client.development.js:1661-1667`(제안 1과 제안 4의 인용).)
- [중간] 네 제안 모두 (문자열 노드가 객체나 배열을 쥘 때의 표시. C1 판정이 수 노드만 보았음) / S-a와 S-f의 문자열판. 문자열 노드에 `{ a: 1 }`이나 `["a","b"]`가 로드됩니다. 기본, antd, mui 문자열 입력은 모두 비제어이고 `defaultValue`를 씁니다.: React는 객체를 "[object Object]"로, 배열을 "a,b"로 그립니다. 배열 ["a","b"]와 문자열 "a,b"가 똑같이 보여서, 화면으로는 형이 틀렸다는 것을 알 수 없습니다. 사용자가 글자 하나를 고치면 "[object Object]x" 같은 문자열이 원래 값을 대신합니다. 편집처럼 보이는 동작이 원래 값을 잃게 합니다. (근거: 실험 `display.cjs`의 출력은 `"[object Object]"`와 `"a,b"`입니다. 비제어 문자열 입력은 `schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputString.tsx`, `schema-form-mui-plugin/src/formTypeInputs/FormTypeInputString.tsx`입니다(둘 다 `defaultValue`만 씀).)

### 4.2 반박자 2

**각도.** 데이터 무결성, 오류, 경계 형에 대한 적대 검토입니다. 네 제안은 모두 나′(받은 그대로 담고 그대로 보인다)를 권합니다. 그래서 공통 핵심과 제안마다 다른 세부를 따로 공격했습니다. 공격 장면은 검증기 없음, 서버 로드(`null`, `""`), `setValue`, 자동 쓰기(`derived`, `injectTo`, 게이트), nullable, 불리언, 배열, 객체, 가상 노드, `omitEmpty` 방출, 직렬화, 제출 거부입니다. 실험은 `/tmp/claude-501/s1swarm/critic-integrity/`의 `coerce.cjs`(ajv 8.17.1 `coerceTypes` 경계값), `guard.cjs`, `guard2.cjs`(가드 서브스키마의 적용 범위) 셋이며, 저장소는 고치지 않았습니다. 제안 번호는 이렇게 부릅니다. 제안 1은 제어 입력 렌즈, 제안 2는 무결성 렌즈, 제안 3은 공개 형 렌즈, 제안 4는 선행 사례 렌즈입니다.

**살아남은 것.**
- 살아남는 공통 핵심(네 제안 모두): 변환하지 못한 값을 비우지 않고, `NaN` 같은 대체 값을 넣지 않고, 쓰기를 거부하지 않으며, `value`가 원본 하나를 읽습니다. 검증기가 없을 때도 오류 층(throw, `degraded`, 제출 거부)으로 올리지 않습니다. 소유자의 가정('검증기가 없으면 onError로 오류를 받고 값을 비운다')에 대한 반박, 곧 비우기는 조용한 변경이고 오류 층은 통보3과 부딪힌다는 논증은 공격에도 버팁니다(`architecture/adr/0014-error-policy.md:30-36`, `:213`).
- 제안 2의 경고 자리 원칙(검증기가 판정하는 폼에서는 `onError`에 보내지 않고, 판정하지 않는 폼에서만 경고 층으로 보냄)과 제안 4의 조건(`VALIDATOR_MISSING`과 같은 조건, 곧 모드 `None`이면 보내지 않음)을 합친 형태가 살아남습니다. 제안 1의 '검증기가 있어도 보냄'은 통보4에 걸려 떨어집니다.
- 제안 4의 변환 규칙('문자열 전체가 유한한 수일 때만', 정수는 소수부 없음, `null`·`""`·배열·객체는 변환하지 않음)이 네 가운데 가장 안전합니다. 정밀도 조건을 더하면 살아남습니다.
- 제안 1과 제안 4의 입력 계약(치다 만 글자는 입력 구성 요소가 들고, core에는 자기 형의 값이나 없음만 보내며, `NaN`을 새로 만들지 않음)은 버팁니다. 제안 2의 `badInput`→`NaN`은 떨어집니다.
- 제안 1과 제안 4의 소유자 질문 1('수 노드가 변환하지 못한 값을 들어도 되는가')은 규칙 1에 맞게 올린 질문으로 살아남습니다.

**고침.**
- `null`과 빈 문자열의 방출 규칙을 소유자 질문으로 올립니다. 원본은 그대로 두되, `omitEmpty`가 켜진 잎에서는 nullable이 아닌 노드의 `null`과 문자열이 아닌 노드의 `""`을 투영에서 없음으로 보는 안입니다. 방출은 정책이고 원본을 건드리지 않으므로(`architecture/08-design-a-to-z.md:51`) 결정 1과 부딪히지 않습니다. 그러면 오늘의 결과(선택 필드는 통과하고 필수 필드는 `required`)가 유지됩니다. 반대는 형의 정직함(형 에러)입니다. 사용자에게 보이는 결과가 갈리므로 규칙 2에 해당합니다. ajv의 `null`→`""`·0·`false` 변환을 따르지 않는 것도 같은 질문에 묶어 소유자에게 확인받습니다.
- 변환 조건을 조입니다. 수로 바꾸는 것은 결과가 유한하고, 정수 노드에서는 `Number.isSafeInteger`이며, 수로 바꾼 뒤 다시 적은 글자가 앞뒤 공백을 뺀 입력과 같을 때(정밀도를 잃지 않을 때)만 합니다. 그 밖에는 받은 문자열을 그대로 둡니다. `"Infinity"`, `"1e400"`, 큰 정수 문자열이 조용히 바뀌지 않게 하려는 것입니다(`coerce.cjs`).
- `controls` 식 언어 명세(`architecture/08-design-a-to-z.md:488`)에 '형이 맞지 않는 원본을 식이 읽을 때의 값'을 적습니다. 식에는 투영에서 형이 맞지 않는 잎이 없음(`undefined`)으로 보이게 하는 안과, 원본을 보이고 식의 throw를 `EXPRESSION_THREW`(`degraded`)로 두는 안이 있습니다. 앞의 안은 틀린 서버 값 하나로 폼이 잠기는 것과, `null * qty = 0`처럼 그럴듯한 값이 조용히 만들어지는 것을 막습니다. 뒤의 안은 식이 받은 값을 그대로 봅니다. 둘은 소유자 질문으로 올립니다.
- 게이트의 적용 범위를 적습니다. 형이 맞지 않는 값은 `minimum`·`contains` 같은 형 한정 키워드를 공허하게 통과하므로 게이트가 뒤집힐 수 있습니다(`guard2.cjs`). 작성자 안내에 `if` 서브스키마에 `type`을 함께 적도록 권하거나, 앞 항목의 투영 규칙을 게이트에도 적용할지 함께 정합니다.
- 경고의 조건을 하나로 정합니다. 검증기가 없고 검증 모드가 `None`이 아닐 때만 보내고, 검증기가 있으면 모드와 상관없이 보내지 않습니다(통보4). 중복 막기는 ADR의 경고 장치(코드와 경로, 로드마다 비움, `architecture/adr/0014-error-policy.md:152`)를 그대로 씁니다. 유한하지 않은 수(`NaN`, `Infinity`)도 형 불일치로 셉니다.
- `NaN` 규칙을 하나로 정합니다. `NaN`은 빈 값이 아니라 형 불일치로 방출하고 경고 대상으로 셉니다(제안 3의 '`NaN`은 빈 값' 폐기). 기본 수 입력은 빈 칸과 `badInput`에서 모두 `undefined`를 보내거나 쓰지 않습니다(제안 2의 `badInput`→`NaN` 폐기). 동작 변화로 기록합니다.
- 내장 입력과 플러그인 입력의 함수형 갱신과 표시를 방어하도록 PR-7의 이주 항목에 넣습니다. 예를 들어 `Array.isArray(prev) ? prev : []`, `Array.isArray(defaultValue) && defaultValue.includes(...)`, 불리언은 `value === true`로 씁니다(`src/formTypeDefinitions/FormTypeInputStringCheckbox.tsx:61-63`, `:76`, `src/formTypeDefinitions/FormTypeInputBoolean.tsx:29`). 입력 계약에는 '`prev`와 `value`는 노드 형이 아닐 수 있다'를 적습니다.
- 가상 노드의 쓰기는 길이보다 `Array.isArray(values)`를 먼저 검사합니다(`src/core/nodes/VirtualNode/VirtualNode.ts:45`). C8의 예외는 '호출자 오류'가 아니라 `architecture/adr/0014-error-policy.md:257`의 출처별 분류(자동 쓰기이면 `degraded`)라고 정확히 적습니다.
- 제안 2와 4의 C1·C8 서술을 고칩니다. 가지 노드가 잘못된 종류의 값을 들 때 자식의 채움 값은 보이지만 방출되지 않습니다(`architecture/08-design-a-to-z.md:274`). 이 한계를 적습니다.
- 제안 2와 3의 소유자 질문을 넓힙니다. '선언 형을 넓히는가'에 앞서 '수 노드가 수가 아닌 값을 들어도 되는가'를 먼저 묻습니다(`architecture/reviews/round-18-owner-answers.md:7-8`).

**공격 (15건).**
- [높음] 제안 1, 2, 3, 4 모두(S-g의 판단과 방출 규칙) / S-g 변형. 데이터베이스의 NULL이 nullable이 아닌 선택 필드(수, 문자열, 불리언)로 로드되고, 검증기가 있는 경우: 오늘은 수 노드의 `null`이 `NaN`이 되어 방출에서 빠지고(`src/core/nodes/NumberNode/NumberNode.ts:103-104`, `:119-122`), 문자열 노드의 `null`은 `""`이 되어 빠집니다(`src/core/parsers/parseString.ts:38-41`, `src/core/nodes/StringNode/StringNode.ts:85-87`). 그래서 선택 필드는 에러 없이 제출됩니다. 나′에서는 `null`이 원본과 방출에 그대로 남아, 필드마다 "must be number"·"must be string"·"must be boolean"이 나고 제출이 막힙니다. 입력은 빈 칸(체크박스는 꺼짐)으로 보이므로, 소유자가 위험하다고 본 '값을 가지고 있는데 빈 값을 표현하는' 상태를 core가 가장 흔한 서버 데이터에서 만듭니다. 이미 빈 칸은 사용자가 비울 수 없습니다. 숫자를 쳤다가 지우거나 체크했다가 풀어야만 고쳐지므로, 폼 전체가 제출할 수 없는 상태로 시작합니다. 네 제안은 이것을 '문구가 `required`에서 형 에러로 바뀜' 정도로 적었지만, 실제로는 선택 필드의 제출 성공이 제출 실패로 바뀝니다. 게다가 `null`을 `""`·0·`false`로 바꾸지 않기로 한 것은 제안자들의 결론입니다. ajv 표에서 문자열 `null`→`""`은 'a (ajv 기준)'로 분류되어 있습니다(`architecture/reviews/raw-round18-s1-parse-check.md:38`, `:52`). 소유자 답 '(ajv 규칙 수준)'과 글자가 어긋나는데도 소유자 질문으로 올리지 않았습니다(규칙 1). (근거: `src/core/nodes/NumberNode/NumberNode.ts:103-104`, `:119-122`; `src/core/parsers/parseString.ts:38-41`; `src/core/nodes/StringNode/StringNode.ts:85-87`; `architecture/reviews/raw-round18-s1-parse-check.md:30`, `:38`, `:52`; `architecture/reviews/round-18-owner-answers.md:8`; 소유자 우려 '값을 가지고 있는데 빈 값을 표현하는것도 좀 위험')
- [중간] 제안 4(주로), 제안 1, 2, 3(정하지 않음) / S-a 변형. 폼 인코딩 방식의 백엔드가 수 노드에 `{ age: "" }`를 줌. 검증기 있음: ajv는 `""`을 수로 바꾸지 않으므로 원본은 `""`입니다. 기본 수 입력과 mui는 `type=number`라 빈 칸으로 그립니다. 제안 4는 '형이 맞지 않는 값은 빈 값이 아니다, `""`도 생략하지 않는다'라고 명시합니다. 그러면 빈 칸으로 보이는 선택 필드에 "must be number"가 나고 제출이 막힙니다. 사용자는 빈 칸을 다시 비울 수 없습니다. 제안 1, 2, 3은 수 노드의 `""`에 대한 `omitEmpty` 판정을 정하지 않아 같은 결과가 남습니다. (근거: `architecture/reviews/raw-round18-s1-parse-check.md:28`(`""`은 ajv 에러); `src/formTypeDefinitions/FormTypeInputNumber.tsx:26-34`; 제안 4 위험 항목 셋째('수 노드의 `""`를 빈 값으로 보고 생략하면 … 결함이 되살아납니다'))
- [높음] 제안 1, 2, 3, 4 모두(S-c와 자동 쓰기의 읽기 쪽) / S-a와 S-g 뒤의 `controls.derived`, `controls.injectTo`, 게이트 식이 형이 맞지 않는 원본을 읽는 경우. 예: `../age.toFixed(1)`, `../tags.map(...)`, `../price * ../qty`: 네 제안은 S-c를 '대상에 쓰는 값'으로만 따졌습니다. 그러나 나′는 식이 읽는 값의 형 보장도 없앱니다. 오늘은 parse가 `NaN`·`[]`·`{}`를 주므로 `.toFixed`와 `.map`이 던지지 않습니다. 나′에서는 `"abc"`나 `null`에 `.toFixed`, `"a,b"`에 `.map`을 부르면 TypeError가 납니다. 이것은 `EXPRESSION_THREW`로 `degraded`가 되고, 모든 환경에서 사슬 끝 throw와 제출 거부로 이어집니다. 검증기가 없는 폼도 서버의 틀린 칸 하나로 잠깁니다. 이것은 제안들이 '라'를 버린 이유로 든 결과, 곧 '틀린 칸 하나로 제출이 막힌다'를 다른 길로 되살립니다. 던지지 않는 식은 그럴듯한 값을 조용히 만듭니다. `null * 3`과 `"" * 3`은 0이 되어 유효한 합계로 방출되고, `"abc" + 1`은 `"abc1"`이 됩니다. 오늘은 `NaN`이 전파되어 합계가 빠집니다. 검증기가 없으면 원천 필드의 경고 하나 말고는 합계가 0이 된 것을 알릴 신호가 없습니다. (근거: `architecture/adr/0014-error-policy.md:197`(식이 던지면 `degraded`), `:201`, `:231`, `:268`, `:279`; `architecture/08-design-a-to-z.md:488`(식이 읽는 값이 원본인지 투영인지는 미정); `src/core/parsers/parseNumber.ts:31-40`(오늘은 늘 수를 돌려줌))
- [중간] 제안 1, 2, 3, 4 모두(검증기가 있을 때의 `if` 게이트) / S-a와 S-g. 작성자가 JSON Schema의 권장 형태 `if: { required: ['age'], properties: { age: { minimum: 18 } } }`로 조각을 가르는 경우: 오늘은 `NaN`이 방출에서 빠지므로 게이트가 `required`에 걸려 거짓입니다. 나′에서는 `"abc"`, `null`, `""`이 속성으로 남고, `minimum`이 수가 아닌 값에는 적용되지 않으므로 게이트가 참이 됩니다(`guard2.cjs` 실행: 오늘 false, `"abc"`/`null`/`""`은 true, 5는 false). 틀린 값 하나가 형상을 다른 분기로 바꿉니다. 그러면 방출되는 필드의 집합이 바뀌고, 작성자가 나감 비움 정책을 켰다면 반대 분기의 원본이 지워집니다. 이 손실은 사용자가 `"abc"`를 고친 뒤에도 돌아오지 않습니다. 배열의 `contains`도 문자열 `"x,y"`에는 적용되지 않아 참이 됩니다(`guard.cjs`). 어느 제안도 이 경로를 다루지 않았습니다. (근거: `/tmp/claude-501/s1swarm/critic-integrity/guard2.cjs`, `guard.cjs` 실행 결과; `architecture/08-design-a-to-z.md:180`(게이트는 `compileGuard`), `:488`(게이트는 투영 값을 읽음), `:167`(형상에 없는 노드는 방출에서 빠짐))
- [중간] 제안 1, 2, 3(ajv `coerceTypes` 수준이라고만 적은 변환 규칙), 제안 4(유한성만 막음) / S-a와 S-b. 수 노드에 `"Infinity"`, `"1e400"`, `"12345678901234567890"`, 정수 노드에 `"9007199254740993"`이 옴: ajv의 `x == +x` 규칙은 `"Infinity"`와 `"1e400"`을 `Infinity`로 바꿉니다. `JSON.stringify`는 이것을 `null`로 만듭니다(`coerce.cjs` 실행: `{"n":null}`). JSON에서 안전한 문자열이 폼을 지나 직렬화 경계에서 사라지는 조용한 변경입니다. 큰 정수 문자열은 정밀도를 잃습니다. `"12345678901234567890"`은 `12345678901234567000`이 되고, 정수 `"9007199254740993"`은 `9007199254740992`가 되어 정수 검증까지 통과합니다. 이런 값은 틀린 식별자로 서버에 올라갑니다. '뜻이 그대로인 변환'이 아니므로 제안 1, 2, 3의 C2 '지킴'은 거짓입니다. 제안 4는 '유한한 수'로 앞의 경우만 막고 정밀도 손실은 막지 않습니다. (근거: `/tmp/claude-501/s1swarm/critic-integrity/coerce.cjs` 실행 결과; `architecture/reviews/raw-round18-s1-parse-check.md:31`(`"Infinity"`→Infinity), `:25`)
- [중간] 제안 3 / S-e와 S-b. 제3자 입력이나 호출자가 `NaN`을 씀(`setValue(NaN)`, `valueAsNumber`를 보내는 사용자 입력): 제안 3은 `NaN`을 '이미 수 형이므로 항등'으로 원본에 두면서도 `omitEmpty`의 빈 값으로 남깁니다(`NumberNode.ts:120`). 형 일치 판정이 `typeof`라서 경고도 나지 않습니다. 결과는 `node.value`가 `NaN`, 방출이 없음, 검증기는 없음을 보고 선택 필드면 에러 없음, 경고 없음입니다. 제안 3이 없앴다고 주장한 '저장과 방출의 어긋남'과 '조용한 소멸'이 그대로 남습니다. 제안 3의 C1(저장=보임=방출)과 C2 '지킴'은 이 경로에서 거짓입니다. (근거: `src/core/nodes/NumberNode/NumberNode.ts:119-122`; 제안 3의 S-e 칸('`NaN`은 이미 수 형이므로 항등', '`NaN`을 `omitEmpty`의 빈 값으로 보는 오늘의 투영은 남깁니다')과 위험 항목 여섯째)
- [중간] 제안 2(제안 1도 일부) / S-e. 기본 수 입력에서 사용자가 `-`나 `1e`를 친 채 제출함. 검증기 없음, 또는 `strict: false` 검증기: 제안 2는 기본 입력이 `validity.badInput`일 때 `NaN`을 보내게 하고, `NaN`을 `omitEmpty`에서 빼서 방출합니다. 치다 만 글자가 커밋되어 `getValue()`와 `onChange`에 `NaN`이 나가고, 호스트의 `JSON.stringify`에서 `null`이 됩니다. 검증기가 없으면 사용자가 친 것과 다른 `null`이 서버로 갑니다. `strict: false` 검증기도 통과시킵니다. 게다가 정상적인 입력 중인 글자마다 `UNCONVERTIBLE_VALUE` 경고가 `onError`로 가서, 입력 도중의 상태를 데이터 경고로 잘못 알립니다. 이것은 '치다 만 글자는 입력이 든다'는 다른 제안들의 계약과도 어긋납니다. (근거: 제안 2의 rule과 S-e 칸; `architecture/reviews/raw-round18-s1-parse-check.md`의 사실 절(`JSON.stringify({ n: NaN })`은 `{"n":null}`); 문제 정의의 `strict: false`에 대한 사실)
- [높음] 제안 1 / S-a, S-b, S-f. 검증기가 있는 폼: 제안 1은 검증기가 있어도 노드마다 `UNCONVERTED_VALUE` 경고를 `onError`로 보냅니다. 그런데 '사용자의 값이 스키마에 맞지 않음'은 ADR 0014 §1이 정한 검증 결과 층이고, 그 층은 `onError`에 가지 않습니다. 같은 사실이 노드 `errors`와 `onError`에 두 번 가는 것은 고정된 소유자 답 통보4 'onError 와 onValidate 를 섞는건 사용자 입장에서 엄청 햇갈립니다'와 글자 그대로 부딪힙니다(규칙 1). 제안 2와 3이 같은 이유로 버린 안입니다. (근거: `architecture/adr/0014-error-policy.md:34`(검증 결과는 `onError`에 가지 않음), `:18`, `:327`(통보4 원문); 제안 1의 noValidatorAnswer('이 경고는 검증기가 있을 때도 보냅니다'))
- [중간] 제안 2, 3(경고의 조건) / 검증 모드를 `None`으로 적은 폼, 또는 검증기는 있으나 모드가 `OnRequest`뿐인 폼: 제안 2는 '검증기가 없거나 검증 모드가 `None`인 폼'에서 경고를 보냅니다. 그러나 `None`은 작성자가 검증 알림을 끄겠다고 적은 표지이고, ADR은 그때 `VALIDATOR_MISSING`도 사라진다고 정했습니다. 검증 없이 폼만 그리는 소유자의 사용례에서는 필드마다 경고가 잡음이 됩니다. 제안 3의 '검증기가 돌지 않는 커밋'은 검증기가 있어도 `OnRequest` 모드이면 커밋마다 참이 됩니다. 그러면 `onError` 경고가 가고, 뒤의 `validate()`가 같은 사실을 형 에러로 다시 알려 두 채널이 섞입니다(통보4). 더 근본적으로, 검증기가 없을 때 core가 형을 판정해 알리는 것은 제안 3이 '바-1'을 버린 근거(ADR 0013 결정 3 '위반은 검증이 알린다')와 같은 일을 채널만 바꿔서 하는 것입니다. 이 긴장을 적지 않았습니다. (근거: `architecture/adr/0014-error-policy.md:152`('검증 모드를 `None`으로 적으면 사라진다'); `architecture/08-design-a-to-z.md:345`; `architecture/adr/0013-core-does-not-rewrite-values.md:31`; 제안 3의 rejectedCandidates '바-1')
- [높음] 제안 1, 2, 3, 4 모두(S-f 배열, 입력 계약) / S-f. 배열 노드가 로드된 `"a,b"`를 들고 있을 때 사용자가 내장 문자열 체크박스에서 한 항목을 체크함: 내장 입력은 함수형 갱신 `onChange((prev) => [...(prev || []), rawValue])`를 씁니다. `prev`가 문자열 `"a,b"`이면 글자 단위로 펼쳐져 `["a",",","b","c"]`가 됩니다(`coerce.cjs` 실행). 이 값은 형이 맞는 배열이므로 형 에러도 경고도 없습니다. 항목에 `enum`이 없으면 검증을 통과해 쓰레기 배열이 제출됩니다. 체크를 풀 때의 `prev?.filter`는 문자열에서 TypeError를 던집니다. 이벤트 핸들러 안이므로 필드 바운더리에 잡히지 않고 전역 오류가 됩니다. 표시도 `defaultValue?.includes(rawValue)`의 부분 문자열 검사라 `"a"`가 체크된 것처럼 보입니다. 우리 입력이 나′의 원본에서 조용한 손상을 만듭니다. 제안 3만 `.map`과 `includes`를 짚었고, 펼침에 의한 손상은 아무 제안도 짚지 않았습니다. (근거: `src/formTypeDefinitions/FormTypeInputStringCheckbox.tsx:61-63`, `:76`; `/tmp/claude-501/s1swarm/critic-integrity/coerce.cjs`의 `spread` 출력; `architecture/adr/0014-error-policy.md:66`(이벤트 핸들러 예외는 바운더리를 발화시키지 않음))
- [중간] 제안 1, 2, 4('가상 노드는 오늘처럼 호출자 오류로 던진다'), 제안 3(일부) / S-b와 S-c. 참조 둘을 가진 가상 노드에 `setValue("ab")`, 또는 `derived`나 `injectTo`가 길이가 틀린 값을 씀: (1) 길이 검사가 `values?.length`뿐이므로 길이가 같은 문자열은 통과합니다. 그러면 글자 단위로 나뉘어 참조 잎에 `"a"`, `"b"`가 조용히 들어갑니다. 제안 1만 위험 항목에 적었고 나머지는 '던진다'고 잘못 적었습니다. (2) 새 설계는 이 사건을 출처로 가릅니다. 공개 API는 호출자 오류이고, 자동 쓰기는 정착 오류로 `degraded`와 제출 거부가 됩니다. 그래서 가상 노드는 '같은 규칙의 유일한 예외'가 아니라 출처별 규칙('마')이며, 검증기가 없어도 폼을 잠급니다. 제안들의 C8 근거가 이 사실과 맞지 않습니다. (근거: `src/core/nodes/VirtualNode/VirtualNode.ts:44-58`, `:66-73`; `architecture/adr/0014-error-policy.md:257`)
- [낮음] 제안 2, 4(C1, C8 '모든 쓰기에서 저장=읽기=방출') / S-f. 가지 객체가 `"x"`를 들고, 자식에 `default` 채움이나 `derived`가 있음: 설계상 비객체 호스트의 자식은 존재하고 렌더되며, 자동 쓰기(채움 등)는 호스트 원본을 건드리지 않습니다. 그래서 자식 입력에는 채움 값이 보이는데 방출은 `"x"`이고 그 값은 방출에 나타나지 않습니다. 가지 노드에서는 '보임=방출'이 이미 성립하지 않습니다. 제안 2의 '모든 쓰기에서 성립'과 제안 4의 C8 '지킴'은 과장입니다. (근거: `architecture/08-design-a-to-z.md:274`; `architecture/adr/0013-core-does-not-rewrite-values.md:91`)
- [중간] 제안 2, 3(소유자 질문의 범위) / S-a와 S-b. 수 노드가 `"abc"`를 듦: 소유자의 첫 답 'Number Node 에는 기본적으로 숫자만 값으로 받아져야'와 확정된 반영 '공개 값 형은 오늘처럼 그 타입의 값이다(수 노드는 수, 파싱 실패는 `NaN`)'이 나′와 글자 그대로 부딪힙니다. 그런데 제안 2와 3은 이것을 결론으로 두고, 소유자 질문을 '선언 형을 넓히는가'로 좁혔습니다. 규칙 1에 따르면 '수 노드가 수가 아닌 값을 들어도 되는가' 자체가 소유자 질문입니다. 제안 1과 4는 그렇게 올렸습니다. (근거: `architecture/reviews/round-18-owner-answers.md:7`(첫 답과 반영 칸), `:8`(S1 이어서의 '보장을 못하게 되니'))
- [낮음] 제안 1(경고의 중복 막기) / S-d. 원문을 보내는 제어 입력에서 형이 맞았다가 틀렸다가 하는 입력: 제안 1은 '변환 가능→불가로 넘어갈 때마다 한 번'이라는 새 중복 막기 단위를 둡니다. 이것은 ADR의 경고 중복 막기(코드와 경로, 로드마다 비움)와 다른 두 번째 장치입니다. 게다가 원문을 보내는 입력에서는 구간이 타자마다 열렸다 닫혀 기록이 쏟아집니다. 제안 1은 이 위험을 적고도 기존 장치를 쓰지 않았습니다. (근거: `architecture/adr/0014-error-policy.md:152`; 제안 1의 rule과 위험 항목 여섯째)
- [낮음] 제안 1, 2, 3, 4 모두(S-f 문자열 노드) / 문자열 노드에 배열 `["a","b"]`이나 객체가 로드됨: React는 `defaultValue`의 배열을 `"a,b"`로 문자열화합니다. 그래서 기본 글자 입력은 유효해 보이는 글자를 그리지만 원본은 배열입니다(보임≠저장). 사용자가 한 글자만 고쳐도 배열이 문자열로 바뀝니다. 사용자의 쓰기라 조용한 변경은 아니지만, 사용자는 형이 바뀐다는 것을 알 수 없습니다. (근거: `src/formTypeDefinitions/FormTypeInputString.tsx`의 `defaultValue` 사용(기본 입력의 비제어 계약, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:95`, `:121`))

## 5. codex의 보고(원문)

**권고는 나안, 즉 ‘변환할 수 없으면 보존하고 `value`도 그 값을 돌려주는 방식’입니다.** 다만 ‘수 노드의 값은 반드시 수’라는 보장과 기존 입력 컴포넌트의 무수정 호환성까지 함께 지킬 수는 없습니다. 그 비용을 숨기지 않고 채택 여부를 판단해야 합니다.

저장소는 변경하지 않았습니다. 아래 구현 사실은 읽기로 확인했으며, 입력 경험과 재설계 동작에 관한 판단은 **추론**으로 표시했습니다.

**1. 권고 규칙**

모든 쓰기는 대상 노드의 동일한 파서를 거칩니다. 합의한 의미 보존 변환이 가능하면 변환한 값을 저장하고, 불가능하면 받은 값을 그대로 저장하며 `value`도 그것을 반환합니다. 실패를 `NaN`, 빈 문자열, 빈 배열, 빈 객체나 `undefined`로 대체하지 않고 이전 값으로 되돌리지도 않습니다. 형 불일치는 검증기가 노드 `errors`로 알리며, 검증기가 없으면 기존의 ‘검증기 없음’ 경고와 비차단 정책을 따릅니다. 변환 불가 자체를 정착 오류나 `degraded`로 승격하지 않습니다. **추론:** 이는 ‘유효하지 않은 값도 그대로 들어가며 입력을 막지 않는다’는 기존 결정에, 이번에 허용한 형 변환만 예외로 더하는 해석입니다. [기존 값 계약:29](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0013-core-does-not-rewrite-values.md:29), [소유자 답변:8](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-18-owner-answers.md:8)

**2. 쓰기 출처별 동작과 오류가 드러나는 자리**

다음은 권고 동작입니다. 형 오류가 보이는 시점은 설정된 검증 시점에 따릅니다.

| 쓰기 출처 | 변환 불가 입력의 처리 | 검증기가 있을 때 | 검증기가 없을 때 |
|---|---|---|---|
| 서버 로드 | 받은 값을 보존합니다. `{ age: "abc" }`의 `age.value`는 `"abc"`입니다. | 준비 이후 설정된 검증에서 `age.errors`에 형 오류가 생깁니다. | 검증기 부재 경고만 냅니다. 로드를 거부하거나 값을 비우지 않습니다. |
| 공개 `setValue` | 이전 값을 새 입력으로 바꿉니다. 실패를 이유로 이전 값을 유지하지 않습니다. | 형 오류는 검증 결과입니다. 변환 불가만으로 호출이 예외를 던지지는 않습니다. | 값을 저장하며, 개별 형 오류를 자동 생성하지 않습니다. |
| 사용자 입력 | **컴포넌트가 실제 전달한 값**에 같은 규칙을 적용합니다. | 전달된 값의 오류는 노드 `errors`로 드러납니다. | 값 보존과 입력 표시를 유지합니다. 검증 통과를 보장하지 않습니다. |
| `derived`·`injectTo` | 정상적으로 반환·전달한 `"abc"`는 그대로 저장합니다. | 대상 노드의 형 오류입니다. | 그대로 저장합니다. |
| `reset`·다시 로드 | 재설정 원천에도 같은 파서를 적용합니다. 잘못된 값이 다시 들어오면 다시 보존합니다. | 로드 이후 검증 규칙을 따릅니다. | 같은 스키마의 재설정에는 검증기 부재 경고를 반복하지 않습니다. |

`derived`가 `"abc"`를 **반환하는 것**과 식이 **예외를 던지는 것**은 다릅니다. 후자는 기존 결정대로 정착 오류이며, 사슬 끝에서 드러나고 `degraded` 동안 제출을 거부합니다. 전자를 후자로 취급하면 ‘스키마에 맞지 않는 값’의 분류를 바꾸게 됩니다. [오류와 검증 결과의 구분:32](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md:32), [정착 오류 처리:49](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md:49), [검증기 부재·로드 검증:213](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md:213)

장면별로 적용하면 다음과 같습니다.

| 장면 | 권고 결과와 한계 |
|---|---|
| S-a 서버의 `{ age: "abc" }` | `"abc"`를 보존합니다. 검증기가 있으면 형 오류, 없으면 개별 형 판정 없이 진행합니다. |
| S-b `setValue("abc")` | S-a와 같습니다. 호출 경로 때문에 이전 값 유지로 바뀌지 않습니다. |
| S-c `derived`가 문자열 반환 | `"12"`처럼 허용된 변환이면 수로 저장하고, `"abc"`이면 문자열 그대로 저장합니다. |
| S-d 제어 수 입력에서 `-` 작성 중 | **추론:** 아직 컴포넌트 내부의 편집 문자열이면 노드에 쓰지 않습니다. 컴포넌트가 실제로 `"-"`를 전달했다면 노드는 보존합니다. 모든 키 입력을 완성된 수로 만들려고 해서는 안 됩니다. |
| S-e 기본 수 입력의 빈 칸 | 현재 컴포넌트가 전달하는 `NaN`을 받습니다. 이를 보존해도 원래 빈 칸이나 작성 중 문자열을 복원할 수는 없습니다. 현행 `omitEmpty`를 유지하면 방출에서 빠질 수도 있습니다. |
| S-f 불리언 `"abc"`, 배열 `"a,b"`, 객체 `"x"` | 각각 그대로 보존합니다. `true`, `[]`, `{}`로 바꾸지 않습니다. 문자열을 임의로 나누거나 배열로 감싸지도 않는 쪽을 권고합니다. |
| S-g 수 노드의 `null` | `nullable`이면 그대로 둡니다. 아니라면 **`null` 보존과 검증 오류를 권고**합니다. 다만 ajv의 `null → 0`까지 허용할지는 마지막 소유자 질문에 남깁니다. |
| S-h 재설정·재로드 | 같은 입력은 같은 결과가 됩니다. 새 로드가 `degraded` 기록을 초기화하는 것과 값이 유효해지는 것은 별개입니다. |

기본 수 입력은 실제로 `valueAsNumber`를 전달하고 `defaultValue`를 사용합니다. 또한 수 노드의 현행 생략 처리는 `NaN`을 부모에게 `undefined`로 전달합니다. 따라서 **파서 정책만 바꾸어 S-e를 해결했다고 말할 수 없습니다.** [기본 수 입력:23](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/formTypeDefinitions/FormTypeInputNumber.tsx:23), [수 노드 생략 처리:119](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/NumberNode/NumberNode.ts:119)

**3. 검증기가 없을 때에 대한 직접 답**

**값을 비우지 않으며, 변환 불가를 이유로 폼 오류를 던지거나 제출을 막지 않는 것이 권고입니다.**

기존 계약의 `onError`는 ‘검증기가 없다’는 **경고**를 받습니다. `"abc"는 수가 아니다`라는 개별 판정까지 `onError`에 넣으면, 검증 결과를 제외한다는 채널 계약과 충돌합니다. 검증 모드가 `None`이면 부재 경고도 없습니다. [경고와 검증 결과:33](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md:33), [검증기 없음:213](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md:213)

**추론:** ‘검증기 없이 사용 가능’, ‘개별 형 오류가 반드시 보임’, ‘잘못된 값의 제출을 반드시 차단’을 모두 보장할 수는 없습니다. 마지막 두 가지를 의무화하려면 별도의 상시 판정 기능이 필요합니다. 이를 파서 실패 처리라는 이름으로 조용히 도입해서는 안 됩니다.

**4. 제어 컴포넌트의 예측 가능성**

**현재 컴포넌트가 그대로 예측 가능하게 남는다고 보장할 수는 없습니다.** 보존안이 지키는 것은 ‘저장된 값과 읽는 값의 일치’이며, ‘그 값이 기존 입력 컴포넌트의 허용 타입에 속한다’는 보장은 아닙니다.

확인한 구현도 이 차이를 보여 줍니다.

- Ant Design 5·6 수 입력은 현재 `defaultValue`를 사용합니다. 이를 제어 수 입력의 검증 근거로 삼을 수 없습니다. [5판 수 입력:52](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:52), [6판 수 입력:52](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-antd6-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:52)
- 불리언 입력은 `value`에서 계산한 값을 `checked`로 전달합니다. `"abc"`를 보존하면서 이 연결을 그대로 두는 것은 안전한 호환성 주장이 아닙니다. [불리언 입력:20](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputBoolean.tsx:20)
- 현재 입력 속성의 공개 타입도 `value: Value | undefined`입니다. 실행 시 다른 타입을 반환하면서 선언만 유지하면 거짓 계약입니다. [입력 속성 타입:61](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/types/formTypeInput.ts:61)

**추론 — 보존안을 채택할 때 필요한 조건:** 입력 연결부는 표현할 수 없는 값을 정상적인 수나 불리언인 것처럼 넘기지 말고, 원래 값과 표현 불가 상태를 명시적으로 보여 주어야 합니다. `node.value`를 빈 값으로 위장해서는 안 됩니다. `-`, 소수점 작성 중 상태, 한글 조합 중 문자열은 입력 컴포넌트의 편집 상태로 다룹니다. 이 편집 상태는 노드에 ‘원본 값’과 ‘타입에 맞춘 가짜 값’을 두는 다안과는 다릅니다.

**5. 기준 C1–C10 판정**

| 기준 | 권고안 판정 | 근거 |
|---|---|---|
| C1 저장=보임=타입 | **부분** | 저장과 읽기는 일치하지만 스키마 타입 보장은 포기합니다. 기존 컴포넌트의 표시도 수정이 필요합니다. |
| C2 조용한 변경 없음 | **지킴** | 합의된 성공 변환 외에는 대체·폐기·이전 값 복귀가 없습니다. 기존 방출 정책은 별도입니다. |
| C3 오류가 보임 — 검증기 있음 | **부분** | 보존한 형 불일치는 판정할 수 있습니다. 다만 검증 시점·방출 생략·검증기 설정까지 파서가 보장하지는 않습니다. |
| C4 오류가 보임 — 검증기 없음 | **부분** | 검증기 부재는 알리지만 개별 형 오류는 보장하지 않습니다. |
| C5 망가진 값을 올리지 않음 | **부분** | 정착 오류의 제출 차단은 유지합니다. 검증기 없는 폼의 잘못된 값 제출은 막지 않습니다. |
| C6 원래 입력 보존 | **부분** | 노드가 받은 변환 불가 값은 보존합니다. `valueAsNumber`가 이미 버린 문자열까지 복구하지는 못합니다. |
| C7 공개 형의 정직함 | **지킴 — 타입 수정 조건** | 변환 불가 값도 포함하도록 공개 타입을 넓혀야 합니다. 기존 수 타입 선언을 유지하면 어깁니다. |
| C8 모든 노드 종류의 같은 규칙 | **부분** | 실제 데이터에는 같은 규칙을 적용합니다. 가상 노드의 참조 묶음 자체가 잘못된 경우는 별도 호출 계약입니다. |
| C9 사용자 입력 경험 | **부분** | 원본을 지우거나 되돌리지 않지만 편집 중 상태와 표현 불가 값에 대한 입력 연결부 수정이 필요합니다. |
| C10 새 개념과 표면 비용 | **부분** | 두 번째 값 읽기는 만들지 않지만 공개 타입과 입력 연결부의 변경 비용이 큽니다. |

가상 노드는 단순히 일곱 번째 데이터 타입이 아닙니다. 참조 노드에 값을 분배하며, 현행 구현은 참조 수와 다른 길이를 거부합니다. **추론:** 올바른 묶음 안의 `"abc"`는 대상 노드에 보존할 수 있지만, 어느 참조에 배정할지 정할 수 없는 묶음을 ‘형 불일치 데이터’와 같게 취급해서는 안 됩니다. 터미널 객체와 일반 객체의 잘못된 값 보존은 같은 방향으로 적용하되 내부 합성 방식은 다릅니다. [가상 노드:44](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/VirtualNode/VirtualNode.ts:44), [객체 값 보존 결정:91](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0013-core-does-not-rewrite-values.md:91)

**6. 다른 후보가 지는 까닭**

아래는 같은 기준과 장면에 대한 **추론**입니다.

| 후보 | 얻는 것 | 지는 이유와 해당 장면 |
|---|---|---|
| 가. 대체 값 | 기존 수 타입과 일부 입력 연결을 유지하기 쉽습니다. | S-a·S-b·S-c에서 원본을 잃어 C2·C6을 어깁니다. S-f에서는 공통 실패 표지가 없어 C8을 어깁니다. `NaN`은 S-e의 생략 문제도 해결하지 못합니다. |
| 다. 저장과 읽기 분리 | 타입에 맞춘 읽기를 제공하므로 C7을 지키기 쉽습니다. | S-a·S-b·S-f에서 실제 값이 있는데 빈 값으로 보일 수 있어 C1·C2를 훼손합니다. S-d에서는 편집 내용을 되돌릴 위험이 있고, S-h에는 어느 값을 복원하는지 새 계약이 필요해 C9·C10 비용이 큽니다. |
| 라. 쓰기 거부 | 수용된 값에 대해서는 C1·C7이 강합니다. | S-a에는 유지할 이전 값이 없고, S-b·S-c에는 호출자가 쓴 값 대신 이전 값이 남습니다. S-d·S-e는 입력을 되돌릴 수 있습니다. C6을 잃으며 ‘입력을 막지 않는다’는 결정과 직접 충돌합니다. |
| 마. 출처별 분리 | 사용자 입력 경험과 프로그램 쓰기를 각각 최적화할 여지가 있습니다. | S-a·S-b·S-c가 같은 값인데 서로 다른 결과가 됩니다. S-h에서 재설정·재로드가 결과를 바꾸며 C2·C8·C10이 약해집니다. 출처가 값의 의미를 바꾼다는 근거가 없습니다. |
| 바. 항상 작동하는 최소 형 검사 | C4를 강화할 수 있습니다. | 관찰만 하면 C5는 해결되지 않습니다. 제출까지 막으면 비차단 결정과 충돌합니다. 검증 결과의 소유자와 표시 표면이 늘어 C10 비용이 생깁니다. |

어느 후보든 검증기가 없으면 C3·C4가 저절로 해결되지 않습니다. 대체하거나 거부한다고 오류 표시가 자동으로 생기는 것도 아닙니다. 특히 오늘의 대체 값은 선택 필드에서 오류 자체를 사라지게 한 실행 기록이 있습니다. [실행 기록:94](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/raw-round18-s1-parse-check.md:94)

**7. 남는 소유자 질문**

1. **원본 보존을 위해 공개 값 타입을 넓히고 입력 컴포넌트를 수정하는 비용을 받아들이시겠습니까?**  
   제 권고는 받아들이는 쪽입니다. 반대로 ‘수 노드는 반드시 수만 소유하며 기존 제어 입력에 바로 연결할 수 있어야 한다’를 우선한다면, 변환 불가 값의 보존·수용 결정에 명시적인 예외가 필요합니다. 이는 구현자가 원리만으로 대신 결정할 수 없는 호환성과 데이터 보존의 교환입니다.

2. **`nullable`이 아닌 수 노드의 `null`은 보존하시겠습니까, ajv처럼 `0`으로 변환하시겠습니까?**  
   제 권고는 보존입니다. ‘값이 없음’을 ‘수 0’으로 바꾸는 것은 사용자에게 중요한 차이가 있기 때문입니다. 다만 실행 기록상 ajv는 `null → 0`을 허용하므로, ‘ajv 규칙 수준’이 허용 범위의 상한인지 해당 변환까지 채택한다는 뜻인지는 확정해야 합니다. `nullable`인 경우의 `null` 보존과는 별개의 질문입니다. [변환 비교:30](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/raw-round18-s1-parse-check.md:30)

## 6. antigravity의 보고(원문)

=== 1차 응답 (전체) ===

`@canard/schema-form` 재설계의 외부 독립 검토자로서, 18라운드 안건 에스-1(S1, 노드가 자기 타입으로 변환할 수 없는 값을 받았을 때의 처리)에 대하여 검토한 독립 권고안을 보고합니다. 다른 검토자의 의견은 참조하지 않고 독자적으로 판단하였습니다.

---

### 1. 권고안의 규칙

노드는 자신의 타입에 부합하는 해석 함수를 통하여 의미가 왜곡되지 않는 무손실 변환(Ajv의 `coerceTypes` 규칙 수준)만을 수행하며, 안전하게 변환할 수 없는 입력(예컨대 수 노드의 `"abc"`, `"-"`, 불리언 노드의 `"abc"`, 배열 노드의 문자열 등)을 받았을 때에는 값을 임의로 변조(`NaN`, 빈 문자열, 빈 배열, 빈 객체)하거나 비우지 않고 **원래의 입력을 노드의 원본에 그대로 보존하여 `node.value`로 온전히 노출**합니다. 모든 쓰기 출처(초기 적재, 공개 값 설정, 사용자 입력, 파생 규칙, 초기화)에서 쓰기 자체를 거부하거나 값을 비우지 않으며, 타입 불일치에 대한 판정과 제어는 검증기(Validator)의 스키마 검증 결과(`node.errors` 및 제출 차단)를 통하여 가시화합니다.

---

### 2. 쓰기 출처별 동작과 오류가 드러나는 자리

| 쓰기 출처 | 입력 예시 (수 노드 기준) | 저장되는 값 (`node.value`) | 방출 값 (`getValue`) | 오류가 드러나는 자리 (검증기 연결 시) | 오류가 드러나는 자리 (검증기 미연결 시) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **서버 로드** (마운트 시 초기값) | `{ age: "abc" }` | `"abc"` | `"abc"` | 커밋 후 준비 이펙트 단계에서 노드의 `errors`에 스키마 타입 오류(`type: number`) 표시 ([ADR 0014:217](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md#L217)) | 오류 없음 (마운트 시 폼 수준의 `VALIDATOR_MISSING` 경고만 1회 알림, [ADR 0014:213](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md#L213)) |
| **공개 `setValue`** (호출자 주입) | `node.setValue("abc")` | `"abc"` | `"abc"` | 변경 통지 후 검증 파동에서 노드의 `errors`에 스키마 타입 오류 표시 | 오류 없음 (사슬 끝 예외 송출 없음) |
| **사용자 입력** (`onChange`) | 치다 만 음수 부호 `"-"` 또는 `"abc"` | `"-"` 또는 `"abc"` | `"-"` 또는 `"abc"` | 실시간 검증(`OnChange`) 설정 시 노드의 `errors`에 즉시 타입 오류 표시 | 오류 없음 (입력 컴포넌트의 화면 상태 유지) |
| **자동 쓰기** (`controls.derived`, `injectTo`) | 수식이 잘못된 문자열 `"abc"`를 반환 | `"abc"` | `"abc"` | 정착 루프는 정상 커밋되며, 검증 파동에서 노드의 `errors`에 타입 오류 표시 ([ADR 0014:194](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md#L194) 준수) | 오류 없음 (식이 예외를 던진 것이 아니므로 정착 오류 아님) |
| **초기화** (`reset`) | 초기 적재 값 복원 (`"abc"`) | `"abc"` | `"abc"` | 초기화 사슬 끝에서 검증 요청 후 노드의 `errors`에 표시 ([ADR 0014:217](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md#L217)) | 오류 없음 |

---

### 3. 검증기가 없을 때에 대한 직접 답

소유자께서 제기하신 *"만약 검증기가 연결되지 않은 경우에는 진짜 폼 에러를 받고(`onError`로), 값이 비워져야 하는가?"*라는 물음에 대한 독립 검토자의 명확한 권고는 **"절대로 값을 비워서는 안 되며, `onError`로 치명적 오류를 발생시켜서도 안 된다"**입니다.

1. **값을 비워서는 안 되는 까닭**:
   제어 컴포넌트에서 사용자가 음수를 입력하기 위하여 `"-"`를 입력하거나 소수점을 찍는 순간, 파서는 일시적으로 수로 변환할 수 없습니다. 이때 값을 비워버리면 입력창이 빈 칸으로 리셋되어 사용자가 키보드로 값을 입력하는 행위 자체가 불가능해집니다. 이는 아키텍처 결정 기록 0013 제1결정(*"코어는 받은 값을 고치지 않는다. 입력을 막지 않는다"*, [`0013-core-does-not-rewrite-values.md:29`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0013-core-does-not-rewrite-values.md#L29))과 정면으로 충돌합니다.
2. **`onError`로 오류를 처리해서는 안 되는 까닭**:
   타입 변환 불가는 폼 엔진의 런타임 불변식이 깨진 사건(예산 초과, 무한 루프 등)이 아니라, 데이터 자체가 스키마 제약에 맞지 않는 "검증의 영역"입니다. 17라운드 통보 3에서 소유자께서 확정하셨듯이([`round-17-owner-answers.md`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-17-owner-answers.md)), 검증기 없이 스키마 폼을 사용하는 사용예는 *"유효성 검증은 백엔드에서 전담하고 프론트엔드는 폼 구성과 데이터 전송만 담당하겠다"*는 명시적 선택입니다.
3. **올바른 귀결**:
   검증기가 연결되지 않은 폼은 마운트 시점에 이미 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING` 경고([ADR 0014:213](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md#L213))를 통하여 유효성 검증이 비활성화되었음을 관찰자에게 알렸습니다. 따라서 코어는 사용자의 입력을 있는 그대로 들고 있으며, 검증기가 없으므로 어떠한 거부도 하지 않고 그대로 값을 전송합니다. 이것이 소유자께서 보장하고자 하셨던 "검증기 없는 폼의 실재하는 사용예"를 존중하는 유일하게 일관된 동작입니다.

---

### 4. 제어 컴포넌트가 예측 가능하게 남는 까닭

1. **상태와 뷰의 단일 진실 공급원(Single Source of Truth) 유지**:
   리액트의 제어 컴포넌트([React 공식 문서: Controlled Components](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable))는 `value` 속성으로 전달된 상태와 화면의 렌더링 결과가 1:1로 일치해야만 커서 위치가 튀지 않고 사용자 입력이 유실되지 않습니다.
   현재 코드베이스의 [SchemaNodeInput.tsx:116](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx#L116) 및 Ant Design 플러그인([FormTypeInputBooleanSwitch.tsx:42, 61](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form-antd5-plugin/src/formTypeInputs/FormTypeInputBooleanSwitch.tsx#L42))에서 보듯, 제어 컴포넌트는 `value={node.value}`를 상태로 직접 바인딩합니다.
2. **중간 입력 상태(Transient Input State)의 안전한 수용**:
   사용자가 음수 `-50`을 입력할 때 거치는 `"-"`, 소수점 `12.5`를 입력할 때 거치는 `"12."`는 변환 불가능한 문자열입니다. 만약 노드가 이를 `NaN`이나 `undefined`로 바꾸어 버리면, 리액트는 다음 렌더링에서 입력창을 공백으로 덮어쓰게 되어 타이핑이 차단됩니다(소유자 우려: *"node.value는 제어컴포넌트에서 상태로 그대로 쓰이는데 이걸 바꿔버리면 예측하기 어려워질 것"*).
3. **선행 사례와의 일치**:
   - **웹 표준 (WHATWG HTML 명세 & MDN `HTMLInputElement.valueAsNumber`)**: `<input type="number">`는 사용자가 유효하지 않은 문자열을 입력 중일 때 DOM 내부의 텍스트 표현을 유지하며, 브라우저는 이를 `ValidityState.badInput`이라는 검증 플래그로만 다룹니다.
   - **React Hook Form**: Controller를 통하여 제어 컴포넌트를 구성할 때, 유효하지 않은 중간 입력값을 실시간으로 제거하지 않고 필드 상태에 유지한 채 유효성 검사기(Resolver)를 통해서만 에러 메시지를 노출합니다([React Hook Form 공식 문서: Controller](https://react-hook-form.com/docs/usecontroller/controller)).
   - **React JSON Schema Form (RJSF)**: 입력 필드의 중간 텍스트를 formData에 보존하며, 변환 불가 상태는 AJV의 `type: number` 오류로 화면에 띄울 뿐 입력값을 비우지 않습니다([RJSF 공식 저장소: NumberField](https://github.com/rjsf-team/react-jsonschema-form)).

따라서 노드가 변환 불가 입력을 그대로 들고 `node.value`로 돌려줄 때에만, 제어 컴포넌트는 입력 거부나 화면 초기화 없이 본래 의도된 대로 완벽하게 예측 가능하게 동작합니다.

---

### 5. 기준 C1–C10 판정 표

| 기준 | 판정 | 근거 및 설명 |
| :--- | :---: | :--- |
| **C1. 저장=보임=타입** (제어 컴포넌트 예측 가능성) | **지킴** | 노드에 저장된 값과 `node.value`, 그리고 제어 컴포넌트가 화면에 그리는 값이 완벽히 일치하여 컴포넌트의 상태 불일치나 화면 리셋이 발생하지 않습니다. |
| **C2. 조용한 변경 없음** | **지킴** | 오늘날 파서([`raw-round18-s1-parse-check.md`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/raw-round18-s1-parse-check.md))가 행하던 `"1e5"`→`15`, `"12abc"`→`1234`, 정수 절삭, 불리언 임의 변환, 빈 배열/객체 치환 등의 조용한 데이터 훼손이 완전히 배제됩니다. |
| **C3. 오류가 보임** (검증기 있음) | **지킴** | 변환되지 않은 원래 값(예: `"abc"`)이 스키마 검증기(Ajv 등)에 전달되어 정확하게 `type: number` 오류를 발생시키며, 노드의 `errors`에 등록되어 사용자에게 즉시 가시화됩니다. |
| **C4. 오류가 보임** (검증기 없음) | **지킴** | 검증기를 연결하지 않은 환경은 마운트 시 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING`([ADR 0014:213](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md#L213))을 통해 명시적으로 고지되며, 스키마 유효성 검증을 생략하기로 한 계약에 충실합니다. |
| **C5. 망가진 값을 올리지 않음** | **지킴** | 검증기가 있을 때는 제출 시 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`로 차단됩니다. 과거처럼 `NaN`이 `JSON.stringify`에서 조용히 `null`로 변질되어 서버로 유출되던 치명적 결함([`raw-round18-s1-parse-check.md:32`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/raw-round18-s1-parse-check.md#L32))이 근절됩니다. |
| **C6. 원래 입력의 보존** | **지킴** | 아키텍처 결정 기록 0013 제1결정([`0013-core-does-not-rewrite-values.md:29`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0013-core-does-not-rewrite-values.md#L29))에 따라 호출자가 주입한 값이나 사용자가 타이핑한 문자열이 1바이트도 손실되지 않고 보존됩니다. |
| **C7. 공개 형의 정직함** | **부분** | 타입스크립트 정적 타입상 `NumberNode.value`는 `number | undefined`로 선언되나, 런타임에 유효하지 않은 입력이 있을 때는 일시적으로 문자열을 품을 수 있습니다. 이는 정적 타입과 런타임 입력 상태 간의 불가피한 괴리이며, 문서화 및 타입 좁히기 규약으로 관리되어야 합니다 (추론). |
| **C8. 모든 노드 종류에 같은 규칙** | **지킴** | 수 노드뿐 아니라 불리언, 문자열, 배열, 객체 노드 모두 "타입에 맞는 안전한 변환 시도 → 실패 시 원본 입력 보존"이라는 단 하나의 일관된 규칙을 따릅니다. |
| **C9. 사용자 입력 경험** (치다 만 글자, IME) | **지킴** | 제어 컴포넌트에서 음수 부호(`"-"`), 소수점(`"."`), 한글 IME 조합 중인 글자가 입력 도중 지워지거나 튕기지 않고 브라우저에 매끄럽게 유지됩니다. |
| **C10. 새 개념과 표면의 비용** | **지킴** | 이중 읽기 게터(`rawInput` 등)나 새로운 상태 채널을 신설하지 않고, 기존의 `node.value`와 `node.setValue` 의미론을 그대로 유지하므로 표면 증가 비용이 없습니다. |

---

### 6. 다른 후보가 지는 까닭

1. **후보 가 (`NaN` 같은 센티널 대체 값 — 현행 방식)가 지는 까닭**:
   - **적용 불가능성 (C8 위반)**: 수 노드 외의 불리언, 배열, 객체 노드에는 `NaN`과 같은 센티널 값이 존재하지 않습니다.
   - **조용한 데이터 왜곡 (C2, C5 위반)**: 과거 파서 검증([`raw-round18-s1-parse-check.md`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/raw-round18-s1-parse-check.md))에서 확인되었듯, `"1e5"`가 `15`로 왜곡되고, `NaN`은 `JSON.stringify` 직렬화 시 `null`로 바뀌어 서버에 오염된 데이터가 제출됩니다.
2. **후보 다 (원래 값 저장 후 `value`는 `undefined`로 가리는 안)가 지는 까닭**:
   - **제어 컴포넌트 붕괴 (C1, C9 위반)**: 소유자께서 가장 정확하게 경계하셨던 안입니다(*"node.value는 제어컴포넌트 상태로 쓰이는데 바꿔버리면 동작 예측이 어렵다", "값을 가지고 있는데 빈 값을 표현하는 것은 위험하다"*). `node.value`가 `undefined`를 반환하는 순간, 제어 컴포넌트는 입력창을 빈 칸으로 리셋하여 음수 부호나 타이핑 중인 글자를 화면에서 즉시 지워버립니다.
3. **후보 라 (쓰기를 거부하고 저장하지 않는 안)가 지는 까닭**:
   - **입력 불가능 초래 (C9 위반)**: 사용자가 음수 `-10`을 입력하기 위해 첫 글자로 `"-"`를 누르는 순간 파싱이 불가능하여 쓰기가 거부되므로, 사용자는 음수를 전혀 입력할 수 없게 됩니다.
   - **대원칙 위반**: 아키텍처 결정 기록 0013 제1결정(*"입력을 막지 않는다"*, [`0013-core-does-not-rewrite-values.md:29`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0013-core-does-not-rewrite-values.md#L29))과 정면으로 배치됩니다.
4. **후보 마 (쓰기 출처별로 상이한 분기 규칙을 두는 안)가 지는 까닭**:
   - **복잡도 폭증 (C8, C10 위반)**: 서버 로드, 공개 설정, 사용자 입력마다 동작을 다르게 하면 동일한 값이라도 진입 경로에 따라 노드의 상태가 달라져 결정성(G5)이 깨지고 디버깅이 극도로 어려워집니다.

=== 2차 응답 — 7번 항목 정정 (1차 응답의 7번 항목을 대체함) ===

지적해 주신 바를 면밀히 재검토하였으며, 귀하의 지적이 전적으로 타당함을 확인하였습니다.

이전 보고서의 7번 항목에서 제시하였던 질문("검증기가 없는 환경에서 제출을 막아야 하는가")은 17라운드 통보 3에서 소유자께서 이미 확정하신 결정(*"오류만 내보내고 거절은 하지 마시죠 … 저는 jsonSchema 로 form 만 그리고, 유효성검증은 따로 하지 않는 사용예도 알고있어서요"*, [`round-17-owner-answers.md`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-17-owner-answers.md)) 및 아키텍처 결정 기록 0014 제6절([`0014-error-policy.md:213`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0014-error-policy.md#L213))과 글자 그대로 정면 충돌합니다. 따라서 규칙 1에 따라 이미 고정된 답을 번복하는 질문은 남는 질문이 될 수 없으며, 본 검토자의 3번 항목 결론(*"어떠한 거부도 하지 않고 그대로 값을 전송한다"*)과도 명백한 자가당착이었습니다.

해당 질문을 즉시 철회하고, 규칙 2의 엄격한 요건에 따라 사안을 다시 검토한 7번 항목의 수정 판단을 아래와 같이 보고합니다.

---

### 7. 남는 소유자 질문에 대한 재판단: **남는 소유자 질문 없음**

규칙 2는 **"원리로 정할 수 없고, 순위가 정해지지 않은 가치를 맞바꾸며, 사용자에게 보이는 결과를 바꾸는 것만 소유자 질문이 된다"**고 규정하고 있습니다. 본 안건(18라운드 에스-1, 노드가 자기 타입으로 변환할 수 없는 값을 받았을 때의 처리)에 대하여 이 세 가지 조건을 충족하는 미결 사안이 존재하는지 철저히 점검한 결과는 다음과 같습니다.

1. **검증기 미연결 환경에서의 제출 동작**:
   - 17라운드 통보 3에서 소유자께서 *"검증기가 없으면 거부하지 않고 알리기만 한다"*고 이미 확정하셨습니다(규칙 1).
   - 따라서 검증기가 연결되지 않은 폼이 변환 불가 입력을 거부하지 않고 그대로 전송하는 것은 소유자의 확정 답변과 아키텍처 결정 기록 0014 제6절로부터 직접 도출되는 당연한 귀결이며, 정책 질문으로 다시 열릴 수 없습니다.
2. **변환 불가 입력 시 `node.value`의 노출 동작**:
   - 리액트 제어 컴포넌트의 단일 진실 공급원 원칙(기준 C1)과 사용자의 중간 타이핑(`"-"`, 소수점 등)을 보존해야 한다는 입력 경험 원칙(기준 C9), 그리고 아키텍처 결정 기록 0013 제1결정(*"코어는 받은 값을 고치지 않는다. 입력을 막지 않는다"*, [`0013-core-does-not-rewrite-values.md:29`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0013-core-does-not-rewrite-values.md#L29))에 의하여, 노드가 원래의 입력을 온전히 들고 `node.value`로 노출하는 것 외에 다른 대안은 원리적으로 성립할 수 없습니다.
3. **타입스크립트 정적 타입 선언의 엄격성 (기준 C7)**:
   - `NumberNode.value`의 정적 타입 범위를 넓힐 것인가의 문제는 타입 검사기(`tsc`)와 라이브러리 개발자에게 영향을 주는 개발 단계의 형식 체계일 뿐, 브라우저 화면에서 **사용자에게 보이는 런타임 결과를 바꾸지 않습니다**. 따라서 규칙 2의 조건("사용자에게 보이는 결과를 바꾸는 것")을 만족하지 못합니다.
4. **빈 값(`valueAsNumber`의 `NaN`)의 해석**:
   - 입력 필드가 비워졌을 때의 처리는 아키텍처 결정 기록 0013의 원본 변경 사건 표(D-11, `onChange(undefined)`가 빈 값) 및 제3결정(*"입력을 값으로 해석하는 일은 입력 컴포넌트의 몫이다"*, [`0013-core-does-not-rewrite-values.md:88`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/adr/0013-core-does-not-rewrite-values.md#L88))에 따라 입력 컴포넌트의 책임으로 이미 명확히 닫혀 있습니다.

#### 결론
본 안건은 소유자께서 이미 내리신 결정들(에스-1, 에스-1 이어서, 알17-1 나, 통보 3)과 확립된 아키텍처 원리(결정 1, 단일 클래스 동작 행 분리, 제어 컴포넌트 불변식)를 결합할 때, **어떠한 논리적 결함이나 가치 충돌 없이 정확히 단 하나의 해법(제2항 및 제3항의 권고안)으로 완전히 수렴**합니다.

따라서 소유자의 새로운 가치 판단이나 정책적 선택을 요구하는 **남는 소유자 질문은 존재하지 않으며**, 3번 항목의 직접 답(*"어떠한 거부도 하지 않고 원래 입력을 보존하여 그대로 전송한다"*)이 본 라이브러리의 최종 설계로서 완전한 내적 정합성을 갖추었음을 확인합니다.
