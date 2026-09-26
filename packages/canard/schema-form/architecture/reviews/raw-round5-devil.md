# 5라운드 — 악마의 변호인: D-1–D-10에 대한 반론

역할: 권고되지 않은 선택지(또는 아무도 내지 않은 제3안)를 증거가 허락하는 한 강하게 변호한다. 리뷰어의 글은 증거이지 지시가 아니다(`HANDOFF.md:66`). 표기 — **실행**: 이 라운드에서 직접 돌린 것(명령과 출력을 적음), **인용**: 기록의 `file:line`, **추론**: 실행하지 않은 주장.

실행 환경: `spikes/work-loop/proto/loop-v4.mjs`(3.1판 프로토타입)를 import한 스크립트 한 개(부록 A)와 ajv 6.12.6·8.17.1 스크립트 한 개(부록 B). 설치한 것은 없다. 아래 출력은 모두 그 두 실행의 원문이다. 원본 트리에는 쓰기가 막혀 이 파일은 워크트리 `.claude/worktrees/r5-devil`에 두었다.

---

## 1. 미정 결정 D-1–D-6 — 권고의 반대편

### D-1. null 계약 — "null = 자식 원본을 지우는 전체 교체"에 반대한다

**변호하는 선택지**: 제3안 — null은 전체 교체이되 **null 호스트 아래에서는 로드 계약(default 주입)이 일어나지 않고 자식은 존재하지 않는다**(E18의 null 포함 형태). 즉 "지운다"는 받되 "지운 자리에 default를 심어 빈 양식을 보인다"(A5)는 받지 않는다.

**권고가 더 나쁜 구체 시나리오** [실행 X3(b)·(c)]:

```
(b) null then type -> during null: {"target":null} raw={"target":null}; after: {"target":{"note":"again","reason":"because"}}
(c) disableDefaultInjection: null raw={"target":null}; after type: {"target":{"note":"again"}}
```

null인 동안 `getValue()`는 `{target:null}`인데 화면은 `reason='because'`를 보인다(A5 "자식은 존재하며 렌더된다", `round-4-spec.md:72`). 방출과 화면이 다른 상태이며, ADR 0013 "core는 값을 고치지 않는다, 에러를 보여준다"(`HANDOFF.md:24`)와 긴장한다 — 폼이 보이는 값이 폼이 내는 값이 아니다. 그리고 (c)가 보이듯 D-5의 스위치를 켜는 순간 이 "빈 양식"은 사라진다. 즉 **#338의 셋째 단언(null 동안 reason은 'because')은 D-1이 지키는 계약이 아니라 default 주입의 부산물**이고, D-5 한 줄로 깨진다. "유지"라는 이름은 그래서 과장이다.

**권고가 덮어 둔 증거**:

- codex `raw-crosscheck-decisions-codex.md:34` — "현재 blank 생성에는 배열 minItems 보정도 포함되므로, 재설계에서 값 보정을 제거하면 S4의 이력 독립성은 보존하되 blank의 세부 값까지 모두 보존할 수는 없습니다(`ObjectNode.branch.nullable.blankState.test.ts:184`)". D-1의 결정적 근거 "S4 폐기 시 vitest 24개 실패"(`round-3.md:160`)는 그 24개가 **현재 blank 의미**(minItems 채우기 포함)를 고정한다는 뜻이다. ADR 0013 아래에서는 "유지"를 골라도 그 일부는 깨진다. 24라는 숫자는 양쪽을 다 벤다.
- claude 수렴 `raw-crosscheck-decisions-claude.md:638-639` — "core는 '실수로 누른 null 토글'과 '레코드 B의 로드'를 구별하지 못합니다. 둘 다 `setValue(null)`입니다." 구별 못 하는 두 사건에 하나의 의미를 주면 한쪽은 반드시 틀린다. 권고는 "되돌리기는 토글임을 아는 입력 컴포넌트가 맡는다"로 넘겼는데, `nullable` 판정은 core 렌더 계층이 입력에 넘기고(`src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:127`, `hooks/useFormTypeInput.ts:73`) 토글 UI는 각 플러그인의 `FormTypeInput*`이 그린다. 곧 "직전 객체를 기억했다가 Overwrite로 되쓰는" 책임이 플러그인 수만큼 복제된다 [추론].
- D-4·D-7과 합치면 `setValue`는 이 API에서 가장 파괴적인 연산이 **기본값**이 된다(§2 C-2).

**권고가 틀리려면**: (1) 실제 앱에서 "optional 섹션 토글"(주소 없음 체크 → 다시 해제)이 레코드 전환보다 빈번하고, 토글 뒤 값 복원을 기대하는 사용자가 다수라는 것 [추론 — 사용량 자료 없음]. (2) 렌더 계층에 null 토글의 표준 컴포넌트가 없어 복원 책임이 플러그인마다 흩어진다는 것(위 인용으로 사실).

### D-2. 조각 활성 — "출발점 고정 + 비단조 + 상한"에 반대한다

**변호하는 선택지**: 제3안 — 출발점 고정은 유지하되 **상한 초과를 결과가 아니라 실패로 다룬다**(마지막 바퀴로 고정하지 않고 직전 커밋의 형상을 유지, `budget-exceeded`를 검증 에러와 같은 급의 차단으로 노출). 그리고 지원 범위 밖의 정의를 "부정 순환"에서 "**자기 참조 전부**"로 넓힌다.

**권고가 더 나쁜 구체 시나리오 1 — 상한의 홀짝이 값을 정한다** [실행 X1]:

```
frags=1 cap=2 -> emit=undefined active=[] status=budget-exceeded sweeps=2 rounds=2
frags=2 cap=3 -> emit={"x":1} active=["neg","dummy"] status=budget-exceeded sweeps=3 rounds=2
```

같은 자기 부정 조각(`if not x then x default 1`)에 **무관한 무조건 조각 하나**(`dummy`, 항상 참)를 더했더니 방출이 `{}`에서 `{x:1}`로 바뀐다. 상한이 "조각 수 + 1"이므로 어떤 조각을 스키마 어디에 추가하든 다른 조각의 결과가 바뀔 수 있다. 작성자가 무관한 필드를 추가한 릴리스에서 기존 필드의 값이 뒤집힌다. 기록은 이를 "결정적이지만 임의적"(F3, `round-4.md:124`)이라 했는데, 스키마 편집에 대해 **국소적으로도 안정적이지 않다**는 것이 더 정확하다.

**시나리오 2 — 양의 자기 참조는 지원 범위 안이면서 조용히 값을 떨어뜨린다** [실행 X4]:

```
prime({k:1,a:'loaded'}) -> emit={"k":1} raw={"k":1,"a":"loaded"} active=[] status=stable
write(a,'typed') -> emit={"k":1}
```

`if: {required:['a']}, then: {properties:{a:…}}` — "있으면 제약한다"는 손으로 쓴 스키마의 흔한 관용구다 [추론 — 저장소 코퍼스에는 `then.properties` 사용 0건, `rg` 실행]. 출발점 고정(A4-1, `round-4-spec.md:58`)에서 a는 처음 G에 없으므로 가드가 거짓이고, 조각이 켜지지 않으며, 로드한 `'loaded'`는 raw에만 남고 방출에서 빠진다. 검증기는 `{k:1}`을 통과시키고 `settle.status`는 `stable`이다 — **관측 수단이 아무것도 울리지 않는 데이터 손실**이다. F3의 지원 범위 밖 정의("가드 의존 관계에 부정을 포함한 순환")는 이 부류를 안에 둔다. 현재 구현은 `then.properties`를 읽지 않으므로(`flattenConditions.ts:44-61`, claude `:160-203`) 이 스키마가 형상으로 해석되는 것은 새 설계가 처음이다 — 새 설계가 새로 만드는 손실이다.

**권고가 덮어 둔 증거**:

- claude `raw-crosscheck-decisions-claude.md:229-238` — "완화책 [추론, 미실행]: 상한을 넘은 호스트를 단조 규칙(A)으로 한 번 더 돌려 그 결과로 고정합니다. 그러면 홀짝 의존이 사라집니다." 4라운드에서 비교하겠다고 적었으나 F1–F32 어디에도 비교 결과가 없다.
- codex `raw-crosscheck-decisions-codex.md:66` — "선택한 마지막 바퀴는 선언 순서와 예산에 의존할 수 있으며, submit 소비자에게 이 상태를 공개하는 비용을 받아들여야 합니다." 권고는 "상태 칸 + 루트 통지"로 답했지만, X4가 보이듯 상태 칸이 `stable`인 손실이 있다.

**권고가 틀리려면**: 자기 참조 스키마가 코퍼스에 없다는 근거(claude grep `:196-199`)가 실제 사용자 스키마를 대표하지 않으면 된다. 코퍼스 14종은 생성기 출력(pydantic·zod 등)을 본뜬 것이고, 손으로 쓰는 `if`는 그 밖에 있다.

### D-3. 금지 조각 — "(iii) 폼은 읽지 않는다"에 반대한다

**변호하는 선택지**: (ii)의 좁은 형태 — 폼은 금지 조각을 **형상으로만** 읽는다: `false`로 선언된 키의 입력은 만들되 "비활성·읽기 전용 + 키 삭제 동작"을 붙인다. 값은 지우지 않는다(P2 유지). (i)의 조용한 삭제도, (iii)의 "고칠 수 없는 에러"도 피한다.

**권고가 더 나쁜 구체 시나리오** [실행 ajv8 + 인용]:

```
{x:""} valid? false | {} valid? true      # properties.x:false
```

본체에 `x:{type:'string'}`이 있고 `then`에서 `x:false`인 경우, claude 수렴 `:653`은 "본체에 선언된 x는 에러가 `/x`로 그 필드에 붙고, **비우면 풀립니다**"라 했다. 그러나 문자열 입력을 비우면 raw는 `''`이지 없음이 아니고(A2 "없음과 ''는 다르다", `round-4-spec.md:32`), `omitEmpty`가 꺼져 있으면 `''`가 방출되어 `false` 스키마에 여전히 걸린다. 사용자는 그 필드에 어떤 값을 넣어도 못 푼다. 잔여 목록(A8)은 "입력 노드가 없는 키"만 다루므로(`round-4-spec.md:87`) 선언된 필드에는 삭제 동작이 없다. 결국 **(iii)의 전제 UX(A8/F8)가 본체 선언 + `then` 금지 조합을 빠뜨렸다** — antigravity가 처음부터 우려한 "고칠 수 없는 에러"(`raw-crosscheck-decisions-antigravity.md:325`)의 살아남은 형태다.

**권고가 덮어 둔 증거**:

- F8(`round-4.md:129`) "잔여 목록은 `instancePath`가 그 키인 에러만 담는다"는 `additionalProperties:false`를 담지 못한다 [실행 ajv 6·8 동일]:

```
additionalProperties:false -> [{"instancePath":"","keyword":"additionalProperties","params":{"additionalProperty":"extra"}}]
properties.x:false        -> [{"instancePath":"/x","keyword":"false schema","params":{}}]
```

  키 이름은 `params.additionalProperty`에만 있다. F8을 지키려면 core가 ajv 고유의 `params` 형태를 해석해야 한다 — P1이 금지한 "폼이 검증기의 뜻을 해석"하는 일을 에러 쪽에서 하는 것이다. 곧 **D-3의 전제 UX는 형상 규칙을 에러 라우팅 규칙으로 이름만 바꾼 것**이다. 청사진에서 `false`를 읽지 않으려고 검증기 출력에서 `false`를 읽는다.
- codex `raw-crosscheck-decisions-codex.md:101-103` — "(ii)와 (iii)의 차이는 기본 오류 표시 여부가 아니라 **core가 금지를 특별한 필드 상태로 해석하는지**입니다." 권고가 (ii)를 기각한 이유는 "사용자가 고칠 수 없는 필드에 에러가 뜬다"(`round-3.md:90`)인데, 위와 같이 (iii)에서도 같은 일이 난다.

**권고가 틀리려면**: 이 조합(본체 선언 + 조건부 `false`)이 실제 BE 스키마에 나타나면 된다. OpenAPI 생성기는 `false` 서브스키마를 내지 않으므로 [추론] 손으로 쓴 스키마의 문제이고, 빈도는 D-2의 자기 참조와 같은 급이다.

### D-4. 쓰기 종류 — "`Overwrite`가 기본값"에 반대한다

**변호하는 선택지**: 제3안 — **기본값 없음**. `setValue(V, mode)`에서 `mode`를 필수로 한다(C7의 메이저 브레이킹이므로 가능). 또는 루트가 아닌 노드에서는 `Merge`를 기본으로 한다.

**권고가 더 나쁜 구체 시나리오** [실행 X3(a)]:

```
(a) user clears reason -> getValue={"target":{"note":"typed"}}; setValue(getValue()) -> {"target":{"note":"typed","reason":"because"}}
```

기본 모드에서 `setValue(getValue())`는 항등이 아니다(D-7(a)). 기본값이 `Overwrite`이고 `Overwrite`가 전이 기준을 비우므로(F4, `round-4.md:125`), 앱이 "현재 값을 살짝 바꿔 되쓰는" 가장 흔한 패턴 — `form.setValue({...form.getValue(), status:'sent'})` — 이 사용자가 지운 키를 되살린다. 오늘도 기본은 `Overwrite`다(`AbstractNode.ts:358`, claude `:338`). 그러나 오늘은 default 재주입이 없다 — 새 설계에서 **기본 모드의 파괴력이 D-1(null 자식 소거)·D-7(재주입)만큼 커졌는데 기본값은 그대로**다.

**권고가 덮어 둔 증거**:

- claude `raw-crosscheck-decisions-claude.md:352` — "branch object에 `formTypeInputMap`으로 붙인 입력이 `onChange({test:'wow'})`를 하면, HCO의 `Replace` 때문에 형제가 지워집니다 [실행]." 권고는 이를 "오늘과 같음"으로 유지하고 부분 쓰기는 입력 작성자가 `Merge`로 명시하라 한다(`:396`). 입력 컴포넌트 작성자가 `Merge`를 아는 것은 core 옵션 어휘가 입력 계약으로 새는 것이며, "입력 컴포넌트는 값을 보고만 한다"(F7의 SC)와 어긋난다 [추론].
- antigravity `raw-crosscheck-decisions-antigravity.md:210` — "기본값이 `Overwrite`이므로, 하위 객체의 일부 필드만 부분적으로 패치하고자 하는 외부 소비자는 반드시 `{ option: 'Merge' }`를 전달해야". 권고 표에는 이 대가가 빠졌다.
- D-7이 "수정자 비트" 하나를 다시 넣었다(`round-4.md:152` F30). D-4의 논거 "비트 열 개를 둘로"는 결정 두 개 뒤에 셋이 되었다. 비트 하나가 돌아오면 다음 것도 돌아온다 [추론].

**권고가 틀리려면**: `setValue`를 부분 패치 용도로 쓰는 소비자가 없다는 근거가 있으면 된다. 기록에는 없다.

### D-5. 로드 시 default 스위치 — "기본 계약 유지 + Form 속성 하나"에 반대한다

**변호하는 선택지**: 제3안 — Form 속성을 두지 않고 **로드 사건마다 방향을 선언**한다: `defaultValue`와 짝인 `defaultValueMode`(가칭) 또는 `reset(opts)`·`setValue(V, {mode, defaults:'inject'|'skip'})`. 곧 D-7이 이미 만든 호출 단위 옵션을 양방향으로 만들고, 그것 하나만 둔다.

**권고가 더 나쁜 구체 시나리오** [추론, F25·D-7 인용]: sparse 레코드를 편집하는 앱이 `disableDefaultInjection`을 켠다. 같은 화면에 "새 레코드" 버튼이 있다. `setValue({}, Overwrite)`로 새 레코드를 만들면 default가 하나도 들어오지 않는다 — D-7의 호출 단위 옵션은 "억제" 방향뿐이라(`round-4.md:113` "Form 속성 `disableDefaultInjection`과 같은 뜻") 켜진 속성을 호출에서 되돌릴 수 없다. 앱은 Form을 리마운트하거나 default를 스스로 채워야 한다 — ADR 0013이 폼에서 걷어낸 "값 만들기"가 앱으로 돌아온다.

**권고가 덮어 둔 증거**:

- codex `raw-crosscheck-decisions-codex.md:180` — "E1의 나중 OFF→ON default 주입은 이 옵션의 직접 범위 밖입니다. 그런데 로드 직후 초기 활성 결정을 별도 전이로 처리하여 default가 다시 들어가면 옵션이 무효가 됩니다." F25(`round-4.md:146`)는 이를 "전체 교체 뒤 첫 정착" 플래그로 답했으나, 프로토타입은 `root.replacedHosts.length > 0`인 정착에서만 억제한다(`loop-v4.mjs:1136`). 전체 교체 직후 리스너가 쓰면 다음 정착은 "로드가 아니므로"(F25) 전이 주입이 일어난다 — 같은 사용자 행위(레코드 열기)의 두 번째 파동에서 default가 들어온다 [추론, 미실행].
- claude `raw-crosscheck-decisions-claude.md:469` — "새 레코드 폼에 `defaultValue={}`를 주는 소비자는 옵션을 켜면 default를 하나도 받지 못합니다. 문서에 '새 레코드 폼에는 `defaultValue`를 주지 않는다'고 적어야 합니다." 문서로 막아야 하는 함정은 API가 잘못 잘린 표시다.
- 이름 논쟁(`fillDefaults`→`skipDefaultsOnLoad`→`disableDefaultInjection`)에 세 리뷰어가 쓴 분량이 뜻의 범위 논의보다 길다. D-7이 호출 단위 옵션을 추가한 순간 Form 속성의 존재 이유는 "`defaultValue`에는 호출이 없다"뿐이다.

**권고가 틀리려면**: 한 Form 인스턴스가 "sparse 편집"과 "새 레코드" 두 모드를 오가지 않는다는 전제가 참이면 된다. 일반적인 CRUD 화면에서는 거짓이다 [추론].

### D-6. `virtual` — "(a) core의 참조 그룹 노드"에 반대한다

**변호하는 선택지**: (b) 렌더 계층으로 완전히 이동. core에는 **경로 별칭 하나**(`find('/period')`가 형제 집합을 돌려주는 읽기 전용 조회)만 남긴다.

**권고가 더 나쁜 구체 시나리오** [추론, 인용]: (a)는 core 노드 종류 표에 셋째 행을 추가하고(`round-3.md:106`), 그 행을 위해 다음을 새로 정해야 한다 — claude `raw-crosscheck-decisions-claude.md:566-575`가 나열한 다섯 가지: 읽기 전용 튜플의 생성 단계와 통지, `&virtual` 문법 이주, 경로 별칭과 이중 방문(`AbstractNode.ts:143-145`), 그룹 `&active`의 구성 필드 병합 유지 여부, `oneOf` 분기 안 `virtual` 지원 여부. 다섯 모두 "값을 소유하지 않는 노드"가 P2–P4 밖에 있다는 도출표(`03-mental-model.md:83`)와 무관한 렌더러 편의를 위한 결정이다. 그룹이 존재하는 유일한 이유는 두 필드를 하나의 `FormTypeInput`이 그리는 것이고, 그것은 P5 "core는 렌더러를 모른다"의 반대편에 있다.

**권고가 덮어 둔 증거**:

- `round-3.md:169` — "required 펼치기는 React Form에서만(`Form.tsx:91`) — core만 쓰면 이미 깨져 있음". 이 사실은 (a)의 근거로 쓰였지만 반대로도 읽힌다: `virtual`의 의미 있는 부분은 이미 React 계층에 있다.
- codex `raw-crosscheck-decisions-codex.md:221-223` — "(b)가 반드시 코드 중복을 강제하는 것은 아닙니다. 프레임워크 공통 렌더 지원 패키지에 묶을 수 있지만 ... 따라서 '다른 렌더러 이식에는 무조건 (b)가 유리하다'는 결론은 근거보다 강합니다." (a)의 근거 "다른 렌더러 이식 시 (b)는 바인딩마다 9책임"(`round-3.md:169`)의 반대 증언인데 권고 표에 실리지 않았다.
- 보존 대상은 `virtual.render.test.tsx` 12개 + `VirtualNode.test.ts` 4개(`round-3.md:103`). 12개는 렌더 테스트이므로 (b)에서도 그대로 산다. core에 남는 것은 refresh 4개뿐이다.

**권고가 틀리려면**: `node.find('/period').setValue([a,b])` 부채질을 쓰는 소비자가 실제로 있고 그것이 렌더 계층 API로 대체될 수 없으면 된다. 기록에 사용 근거는 없다.

---

## 2. 결정 간 모순과 어색한 상호작용

| # | 결정 쌍 | 발견 | 증거 |
| - | ------- | ---- | ---- |
| C-1 | D-8 ↔ F6 ↔ 프로토타입 | F6(`round-4.md:127`)은 "통과 분기가 없으면 앞의 분기", F29(`:151`)는 "빈 값이면 분기 없음"이라 하며 서로 다르다. 프로토타입은 F6을 따른다 | **실행 X2**: `prime({}) -> active=["A"] emit={"a":"A"}` — 빈 값에서 첫 분기가 켜지고 default가 주입되어 값이 만들어진다. D-8 "폼은 값을 만들지 않는다"의 반례가 스파이크 안에 있다. `initialSelection`(`loop-v4.mjs:415-430`)은 `bestCount=-1`로 시작해 0개 일치도 첫 분기를 고른다 |
| C-2 | D-1 ↔ D-7(a) | "null 뒤 객체 복귀"와 `setValue(getValue())`는 같은 결과(둘 다 사용자가 지운 키에 default를 되살린다). 차이는 **경로**뿐 — 전자는 자식 부분 쓰기 한 번, 후자는 루트 전체 교체 | **실행 X3(a)·(b)**: 둘 다 `reason:'because'` 복귀. 모순은 아니지만 "null은 특수 장치가 아니다"라는 D-1의 주장이 D-7과 함께 "어떤 전체 교체든 사용자가 지운 키를 되살린다"로 일반화된다. 소유자가 D-7에서 "값을 씌우는 경우와 기본값을 설정하는 경우가 다르다"고 했으므로(`round-4.md:113`), 그 구별을 null에도 적용해야 일관된다 — `setValue(null)`에도 억제 수정자가 있어야 하고, 없으면 D-1은 D-7이 인정한 구별을 null에서만 무시한다 |
| C-3 | D-1 ↔ D-5 | D-1의 "빈 양식"은 D-5 스위치로 사라진다 | **실행 X3(c)**: `disableDefaultInjection` + null → 자식 raw 없음, 타이핑 뒤 `{note:'again'}`. #338 셋째 단언은 옵션 의존 |
| C-4 | D-3 ↔ A8/F8 | 잔여 키 UX는 검증기 에러에서 키를 뽑아야 하는데 `additionalProperties`의 키는 `params`에만 있다 | **실행 ajv 6·8**: `instancePath:""`, `params.additionalProperty`. F8의 "`instancePath`가 그 키인 에러만"으로는 못 담고, 담으려면 검증기 고유 출력을 해석한다 — 형상 규칙을 에러 규칙으로 옮긴 것 |
| C-5 | D-5 ↔ D-7 | 두 스위치가 한 가지 뜻. 우선순위 미정의. 호출 단위 옵션이 억제 방향뿐이면 Form 속성이 켜진 뒤 호출로 되돌릴 수 없다 | `round-4.md:113` "같은 뜻", F25 `:146`, F30 `:152`. 둘 다 켜지면·하나만 켜지면의 표가 없다 |
| C-6 | D-4 ↔ D-7 | D-4는 "비트 10개 → 2개"인데 D-7이 셋째를 넣었다. `Merge` + 억제 수정자는 F25에 따라 무의미한 조합(Merge는 로드가 아니므로 억제할 것이 없다) | F25 `:146`, F30 `:152` |
| C-7 | D-8 ↔ D-2 | 빈 값에서 판별식 union은 분기 없음(D-8)이지만 선택 가드 union은 첫 분기(F6, 프로토타입). 같은 "빈 값"에 두 답 | C-1과 같은 실행 |
| C-8 | D-10 ↔ T-9 | 디바운스 제거로 한 핸들러 안의 `setValue` 세 번이 `onChange` 세 번·검증 요청 세 번이 된다(오늘은 한 번). "배치를 쓰라"가 답인데 오늘의 소비자는 배치를 모른다 | **실행 X5**: `3 sequential setValue (no batch) -> onChange=3`, `batch of 3 -> onChange=1`. `04-inherited-constraints.md:17` T-9 "키 입력마다 소비자 콜백과 검증기가 돈다"를 막던 장치가 사라진다 |
| C-9 | D-10(c) ↔ 프로토타입 | (c) "최외곽 동기 진입당 1회"는 스파이크에 없다 — 프로토타입은 F22(파동마다)다 | **실행 X5**: `listener writes during wave -> onChange=2 waves=2`; `loop-v4.mjs:1217` 파동 루프 안에서 `root.onChange` 호출. 4라운드의 "tearing 0" 실행은 (c)가 아니라 F22를 검증한 것 |
| C-10 | D-10 ↔ F15 | React 레이아웃 이펙트가 커밋 뒤에 쓰면 그것은 **새 최외곽 진입**이므로 `onChange`가 다시 불린다. F15가 파동 상한을 "틱당"으로 둔 이유가 바로 이 되먹임인데, `onChange`의 "1회"는 진입당이라 틱당 여러 번이 된다 | `round-4.md:136` F15 "React 레이아웃 이펙트를 거치는 되먹임을 세기 위해", `:116` D-10 [추론] |
| C-11 | D-9 ↔ F7 | `RequestRefresh`는 core 판단·비공개, `RequestRemount`는 공개. 사용자가 "리마운트 없이 다시 읽어라"를 말할 수단이 없다 — 남는 도구는 무거운 쪽뿐 | `src/core/types/event.ts:74-75, 94-95`; `round-4.md:128` F7; claude `:362` "`RequestRefresh`는 공개 이벤트가 아닙니다" |

---

## 3. 결정된 항목 D-7–D-10 — 소유자가 보지 못했을 수 있는 귀결

**D-7 (a) + 호출 단위 억제.** 결정은 `setValue(getValue())`의 비멱등을 받아들이고 억제 옵션으로 피하게 한다. 보지 못했을 귀결: 억제는 "로드 주입"만 막고(F25) 그 정착 안의 **전이 주입**(조각 OFF→ON)까지 막지만, 그 뒤 리스너·`injectTo`가 일으키는 정착은 막지 않는다. 곧 `setValue(V, {skip})` 한 줄이 default 없는 값을 만든 직후 `&derived`나 `injectTo` 한 번에 default가 채워질 수 있다 [추론, codex `:180`이 같은 우려]. 또 `Merge`에 억제를 붙이면 아무 일도 없다(C-6). 옵션 표의 3×2 조합 가운데 의미 있는 것은 넷이다.

**D-8 암묵 default 없음.** 결정은 판별식 union에 대한 것인데 F29는 선택 가드 union에도 "빈 값이면 분기 없음"을 확장했다. 프로토타입은 반대로 첫 분기를 켠다(X2). 둘 중 하나는 고쳐야 하고, 고치는 쪽이 프로토타입이면 "선택 가드 union은 빈 값에서 아무 분기도 보이지 않는다" — 사용자가 분기를 고르는 UI(ADR 0010, 아직 미작성)가 없으면 빈 폼에 union 필드가 통째로 비어 보인다. `HANDOFF.md:59`의 "이 조합을 고정하는 테스트가 없다"는 판별식 경우이고 선택 가드 경우는 언급이 없다.

**D-9 `RequestRemount` 유지.** 소유자의 뜻은 "제어·비제어와 무관하게 서브트리를 최신화하는 사용자 도구"다. 귀결: 리마운트는 포커스·IME 조합·스크롤·플러그인 내부 상태(T-2·T-15·T-21이 지키려는 것)를 모두 버린다. F7이 Refresh를 core 전용으로 가두었으므로(C-11) 사용자 도구는 가장 가벼운 것이 아니라 가장 무거운 것 하나만 남는다. 또 `RequestRemount`는 루트 `FormChildrenRenderer`의 재렌더 마스크에도 들어 있어(`src/components/Form/components/FormChildrenRenderer.tsx:17-21`) 서브트리 명령이 루트 render-prop을 다시 돌린다 — 배달 집합 규칙(B3-2)에서 시그널 노드의 조상이 통지되는지 명세가 답하지 않는다 [추론].

**D-10 (c) 진입당 1회.** 결정의 목적은 "마이크로태스크 파동이 여러 번 돌아도 한 번"이었다. 귀결 셋. (1) X5: 오늘의 디바운스는 **틱 안의 여러 진입**도 한 번으로 합쳤는데 (c)는 합치지 않는다 — 배치를 쓰지 않는 기존 소비자는 진입 수만큼 `onChange`와 검증 요청을 받는다. F28의 커밋 번호 스탬프가 늦은 검증 결과를 버리므로 정확성은 지켜지지만 요청 수는 줄지 않는다. (2) C-10: 레이아웃 이펙트 되먹임은 새 진입이므로 "한 수정에 한 번"이 "한 틱에 여러 번"이 된다. (3) C-9: (c)는 아직 아무 스파이크도 돌리지 않았다. 프로토타입의 `onChange`는 파동 안에 있고(`loop-v4.mjs:1217`), "리스너가 일으킨 파동은 합쳐진다"는 구현되지 않았다. 4라운드의 실행 증거는 (c)의 증거가 아니다.

---

## 부록 A — 프로토타입 실행 스크립트 (`node devil-proto.mjs`, 출력은 본문에 인용)

```js
import * as L from '<repo>/packages/canard/schema-form/architecture/spikes/work-loop/proto/loop-v4.mjs';
const { leaf, object, attach, declareFragments, prime, setValue, write, valueOf, activeIds, lastSettle, rawTree, batch, subscribe } = L;
// X1: self-negating fragment, with and without an unrelated always-on fragment (cap parity)
for (const dummy of [0, 1]) {
  const root = object('root'); attach(root, leaf('x'));
  const frags = [{ id: 'neg', guard: (G) => !('x' in G), declares: ['x'], defaults: { x: 1 } }];
  if (dummy) { attach(root, leaf('y')); frags.push({ id: 'dummy', guard: () => true, declares: ['y'] }); }
  declareFragments(root, frags); prime(root, {});
  console.log(frags.length, valueOf(root), activeIds(root), root.settle.status, root.settle.sweeps);
}
// X2: select-guard union, empty value
{ const root = object('root'); attach(root, leaf('a')); attach(root, leaf('b'));
  declareFragments(root, [{ id: 'A', select: 0, declares: ['a'], defaults: { a: 'A' } }, { id: 'B', select: 1, declares: ['b'], defaults: { b: 'B' } }]);
  prime(root, {}); console.log(activeIds(root), valueOf(root)); }
// X3: null->object vs setValue(getValue()) vs disableDefaultInjection
function mk(opts) { const root = object('root'), t = object('target'), note = leaf('note'), reason = leaf('reason', 'because');
  attach(root, t); attach(t, note); attach(t, reason); prime(root, { target: { note: 'typed', reason: 'edited' } }, opts); return { root, t, note, reason }; }
{ const { root, reason } = mk(); write(reason, undefined); const g = valueOf(root); setValue(root, g); console.log(g, valueOf(root)); }
{ const { root, t, note } = mk(); setValue(t, null); write(note, 'again'); console.log(valueOf(root)); }
{ const { root, t, note } = mk({ disableDefaultInjection: true }); setValue(t, null); write(note, 'again'); console.log(valueOf(root)); }
// X4: positive self-reference — "if a present then declare a"
{ const root = object('root'); attach(root, leaf('k')); const a = leaf('a'); attach(root, a);
  declareFragments(root, [{ id: 'ifPresent', guard: (G) => 'a' in G, declares: ['a'] }]);
  prime(root, { k: 1, a: 'loaded' }); console.log(valueOf(root), rawTree(root), activeIds(root), root.settle.status); }
// X5: onChange count — 3 sequential writes, one batch, listener feedback
{ const root = object('root'); const a = leaf('a'), b = leaf('b'), c = leaf('c'); attach(root, a); attach(root, b); attach(root, c); prime(root, {});
  let n = 0; root.onChange = () => { n++; };
  setValue(a, 1); setValue(b, 2); setValue(c, 3); console.log('sequential', n);
  n = 0; batch(root, () => { setValue(a, 4); setValue(b, 5); setValue(c, 6); }); console.log('batch', n);
  n = 0; let once = true; subscribe(a, () => { if (once) { once = false; setValue(b, 99); } }); setValue(a, 7); console.log('feedback', n, lastSettle.waves); }
```

## 부록 B — ajv 실행 (`node ajv-ap.mjs <ajv 경로>`, 6.12.6과 8.17.1에서 같은 결과)

```js
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.compile({ type: 'object', properties: { a: { type: 'string' } }, additionalProperties: false })({ a: 'x', extra: 1 });
// -> [{ instancePath: "", keyword: "additionalProperties", params: { additionalProperty: "extra" } }]
ajv.compile({ type: 'object', properties: { a: { type: 'string' }, x: false } })({ a: 'x', x: 1 });
// -> [{ instancePath: "/x", keyword: "false schema", params: {} }]
const v = ajv.compile({ type: 'object', properties: { x: false } }); v({ x: '' }) === false; v({}) === true;
```
