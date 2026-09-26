# 15라운드 반영 명세 (worker용)

결정의 원문은 `reviews/round-15-decisions.md`. 이 명세는 그 결정을 살아 있는 설계 문서에 적용하는 규칙이다. 결정은 하지 않는다. 규칙으로 정할 수 없는 문장은 고치지 말고 파일·줄·이유를 보고한다. 한국어 격식체, 약어 금지. `reviews/` 아래는 손대지 않는다.

## A. 일반 치환 규칙 (모든 대상 파일)

A1. **코드 예시.** 노드 스키마 안의 `"&X": v`(JSON) 또는 `'&X': v`(JS)는 같은 노드의 `"controls": { "X": v }` / `controls: { X: v }`로 옮긴다. 같은 노드에 `controls`가 이미 있으면 그 안에 합친다. `'&children': [{ targets, control: {...} }]`는 `controls: { children: [{ targets, controls: {...} }] }`로. `'&discriminator': 'kind'`는 `controls: { discriminator: 'kind' }`로. 예시 안의 `computed: {...}`는 오늘의 코드를 보여 주는 문맥이 아니면 `controls`로.

A2. **식의 기준점.** 조각 객체(`allOf` 항목, `oneOf`·`anyOf` 분기, `then`·`else`)의 게이트 식, `children` 항목의 식, `discriminator`가 만드는 식에서 `../x`는 `./x`로 바꾼다(호스트 기준). 노드 자신의 스키마에 적힌 식은 바꾸지 않는다. 그 밖에 남는 `../`는 진짜 부모 참조인지 판단하지 말고 파일·줄을 보고한다.

A3. **산문의 키 이름.** 열세 키 `active` `visible` `readOnly` `disabled` `default` `derived` `injectTo` `unsetValue` `resetInteraction` `unsetOnInactive` `children` `discriminator` `watch`에 대해 `` `&X` ``는 `` `controls.X` ``로 바꾼다. `&if`·`&pristine`·`&clearValue`처럼 옛 이름을 오늘의 코드나 옛 이름으로 설명하는 자리는 `&if` 그대로 둔다(오늘의 코드 사실이므로). 단 "`&if`는 `&active`로 흡수"처럼 새 이름이 뒤따르면 뒤의 것만 `controls.active`로.

A4. **총칭.** "`&` 키"·"`&` 접두 키"·"`&`로 시작하는 키" → "`controls`의 키" 또는 "제어 키". "`&` 식"·"`&` 표현식" → "`controls`의 식". "`&` 명령" → "`controls`의 명령". "`&` 표현식 시스템" → "`controls` 식 시스템". "`&` 식 언어" → "`controls` 식 언어". "예약 층"이라는 낱말은 그대로 두되 그 정의 문장은 B의 문장으로 바꾼다.

A5. **컨테이너 이름.** "`control` 컨테이너", "`control.*`", "`control.키`", "`control` 블록" → `controls`. "`&children` 항목의 `control`" → "`controls.children` 항목의 `controls`". "조각의 `control`", "조각 객체의 `control`" → "조각의 `controls`". "`computed`(새 이름 `control`)" → "`computed`(새 이름 `controls`)". "`computed.*` → `control.*`" → "`computed` → `controls`".

A6. **두 철자 문장 삭제.** "`&키`와 `control.키`는 한 선언의 두 철자다", "둘 다 있으면 `control`이 이긴다", "평면 `&키`와 컨테이너", "`control`과 `&`의 동시 제공", "`computed` 철자를 별칭으로 남기는지" 같은 문장은 다음 한 문장으로 바꾼다: "제어 키는 `controls` 안에만 적는다. 평면 `&` 축약과 `computed` 별칭은 없다(15라운드)."

A7. **지우는 규칙.** "키워드 위치의 `&` 키, `control` 컨테이너, `virtual`"과 "형상·투영 키·표현 키의 닫힌 목록"(규칙 둘) → "키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`"(규칙 하나). "`&` 키·`control`·`virtual`·형상·투영 키·표현 키 전부" → "키워드 위치의 그룹 객체 셋".

A8. **맨 키의 그룹 이동.** 스키마 키를 뜻하는 자리에서 `terminal` → `options.terminal`, `virtual` → `options.virtual`, `propertyKeys` → `options.propertyKeys`, `options.omitEmpty`·`options.omitTrailing`은 그대로, `formType` → `presentation.formType`, `FormTypeInput`(키) → `presentation.FormTypeInput`, `FormTypeInputProps`(키) → `presentation.FormTypeInputProps`, `FormTypeRendererProps`(키) → `presentation.FormTypeRendererProps`, `errorMessages` → `presentation.errorMessages`. 구성 요소·타입·정의 목록을 뜻하는 자리(`FormTypeInput` 구성 요소, `formTypeInputDefinitions`, 타입 `FormTypeInputProps`)는 그대로. "`FormTypeInput`의 유무" → "`presentation.FormTypeInput`의 유무". "형상·투영 키"·"표현 키"·"접두 없는 폼 전용 키"·"닫힌 목록"을 정의하거나 열거하는 문장은 B의 문장으로 바꾼다. "그 밖의 `options`"(플러그인 자유 칸) → "`presentation`의 플러그인 자유 칸".

A9. **근거 표기.** "13라운드 답 3(제어용 필드들에 대해서만 &)"과 "14라운드 확정(O-9)"·"14라운드에 확정(닫힌 목록)"을 근거로 든 자리는 "15라운드(`reviews/round-15-decisions.md`)"로 바꾸고, 필요하면 "13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다"를 덧붙인다.

A10. **렌더 계층 이름.** `CustomFormTypeRenderer` → `FormTypeGroupRenderer`. 타입 `FormTypeRenderer`(구성 요소 타입) → `FormTypeGroupRenderer`. 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError`(플러그인이 등록하는 렌더러를 뜻할 때만) → `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`. 합성 API `Form.Group` 등과 props `FormGroupProps` 등은 그대로. `FormTypeRendererProps`·`FormTypeRendererContext`는 그대로.

A11. **축 표기.** "축 6항(`&` 키는 값을 제어하는 층이다)" → "축 6항(`controls`의 키는 값을 제어하는 층이다)". "축 7항(JSON Schema 표현은 `&`로 대체할 수 있어야 한다)" → "축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)". "축 8항(`&` 표현식과 `injectTo`는 …)" → "축 8항(`controls`의 식과 `injectTo`는 …)". "축 9항(`control`과 `&`의 동시 제공)" → "축 9항(폼 전용 키는 그룹 객체 셋 안에만, 15라운드 개정)".

A12. **마무리 검사.** 파일마다 남은 `&`를 `grep -n '&'`로 세어, 식 안의 `&&`와 HTML 엔티티, 오늘의 코드를 설명하는 `&if`·`&pristine`·`&clearValue`·"오늘 `&` 키는 검증기에 간다" 같은 사실 문장만 남긴다. 남긴 줄은 모두 보고한다. Mermaid 펜스는 건드리지 않는다.

## B. 정의 문장 (그대로 넣는다)

B1. **예약 층 정의.** "폼 전용 키는 그룹 객체 셋 안에만 있다. `controls`(값·형상을 때에 따라 바꾸는 규칙과 정책. 정착 루프가 읽는다), `options`(값·형상의 정적 설정 `terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`. 청사진과 투영이 읽는다), `presentation`(보이는 것 `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`와 플러그인 자유 칸. 렌더 계층만 읽는다). 맨 키는 모두 JSON Schema의 것이고 폼은 읽지 않는다. 모르는 그룹 안 키는 청사진 오류다. 그룹 이름은 명사이고 셀 수 있는 항목의 지도는 복수, 하나의 면은 단수다(15라운드, `reviews/round-15-decisions.md`)."

B2. **기준점.** "모든 JSON Pointer는 그것을 선언한 노드를 기준으로 푼다. 노드는 그 자체로 행위의 원천이자 네임스페이스다. `oneOf`·`allOf`·`then` 조각, `controls.children` 항목, `controls.discriminator`가 만드는 게이트는 모두 호스트 스키마 안의 선언이므로 호스트가 기준이다. 조각 객체의 `controls.active: \"./kind === 'bank'\"`에서 `./kind`는 호스트의 `kind`다. 조각은 같은 네임스페이스의 다른 표현 위치이지 다른 네임스페이스가 아니다(소유자 15라운드). `.`·`..`는 폼의 확장 표기이므로 폼이 정당하고 일관되게 처리한다(소유자 12라운드). 자식에 적던 식을 `controls.children`으로 옮기면 `../x`를 `./x`로 고친다."

B3. **머리 주석(00·05·06·07 첫 제목 바로 아래 한 문단).** "> 표기 주의(15라운드). 이 문서의 `&키`·`control` 표기는 `controls.키` 그룹 표기로 바뀌었고, 조각 식의 기준점은 호스트(`./x`)가 되었으며, 맨 폼 전용 키는 `options`·`presentation` 그룹으로 옮겨졌다. 이 문서는 그때의 기록이라 고치지 않는다. 살아 있는 규칙은 `03-mental-model.md`와 `08-design-a-to-z.md`, 결정은 `reviews/round-15-decisions.md`에 있다."

## C. 파일별 지시

C1. `03-mental-model.md`. (a) §1.3 축 6·7·8·9항을 다음으로 바꾼다.
```
6. `controls`의 키에는 완전히 다른 규칙이 적용된다. 값을 바꾸고, 필드를 가리고, 상태 변화에 따라 값을 빼거나 바꾸거나 다른 노드에 영향을 준다. "값을 제어하는" 층이다. (15라운드 개정: `&` 축약을 없애고 `controls` 그룹으로 적는다)
7. JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다. (15라운드 개정)
8. `controls`의 식과 `injectTo`는 폼을 제어하는 예약어이며 명확한 동작 위계와 이름 컨벤션을 가진다. (15라운드 개정)
9. 폼 전용 키는 그룹 객체 셋(`controls`·`options`·`presentation`) 안에만 둔다. 평면 `&` 축약과 `computed` 별칭은 두지 않는다. (15라운드 개정. 이전 문장 "`computed`(새 이름 `control`)와 `&`의 동시 제공은 유지한다"를 뒤집었다. 소유자: "숏컷을 모두 없애고 중첩 객체로 하는 게 빼기도 편하고 나중에 서버 스키마랑 클라이언트 스키마를 병합하기도 편하겠지")
```
(b) §1.4 표의 "| 예약 층 |" 행 전체를 다음 한 줄로 바꾼다(네 칸).
```
| 예약 층 | 폼 전용 키 전부. 그룹 객체 셋 안에만 있다. `controls`(값·형상을 때에 따라 바꾸는 규칙과 정책: 게이트·잠금·숨김·값 규칙·자식 제어·판별·의존 선언. 정착 루프가 읽는다), `options`(값·형상의 정적 설정: `terminal`, `virtual`, `propertyKeys`, `omitEmpty`, `omitTrailing`, `trim`. 청사진과 투영이 읽는다), `presentation`(보이는 것: `formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, 플러그인 자유 칸. 렌더 계층만 읽는다). 맨 키는 모두 JSON Schema의 것이고 폼은 읽지 않는다. 모르는 그룹 안 키는 청사진 오류다. 평면 `&` 축약은 없다(15라운드, `reviews/round-15-decisions.md`. 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다). 검증기에 넘기기 전에 키워드 위치의 그룹 객체 셋을 지운다(규칙 하나). 오늘 맨 키로 쓰는 `disabled`·`visible`·`active`는 `controls`로, `terminal`·`virtual`·`propertyKeys`는 `options`로, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`와 플러그인의 `options` 자유 칸은 `presentation`으로 옮긴다(이주). `options.virtual`은 그대로 두되 오늘의 `required` 재작성(가상 이름을 실제 자식 이름으로 펼침)은 버린다 | 값과 UI를 제어한다(축 6항(`controls`의 키는 값을 제어하는 층이다)). 게이트, 잠금과 숨김, 값의 출처, 에지에서의 동작, 자식 집합 제어, 명시 판별 | 판정에 닿지 못한다(G2). 검증기는 예약 층의 키를 보지 않는다 |
```
(c) §4의 "**조각 수준 식의 기준점.**" 문단을 "**식의 기준점(15라운드).** " + B2로 바꾼다. (d) 나머지는 A 규칙. (e) 문서 머리의 상태 문장 "5차(2026-09-24, 10–14라운드 뒤)"를 "6차(2026-09-24, 15라운드 뒤)"로.

C2. `02-target-overview.md`. A 규칙 전부. §3 예시의 `"&active": "../kind === 'bank'"`는 `"controls": { "active": "./kind === 'bank'" }`로. `discriminator` 문장의 `&active: "../kind === <값>"`은 `controls.active: "./kind === <값>"`으로. 두 층 정의 문장은 B1.

C3. `08-design-a-to-z.md`. (a) §3.2·§3.3·§3.4를 아래 D의 블록으로 통째로 바꾼다("### 3.2"부터 "## 4." 직전까지). (b) §0 용어 표: "`&` 키와 표준 키워드" → "그룹 객체 셋과 표준 키워드"; 게이트 행 `&active` → `controls.active`. (c) §1 가치 표 표현자유도 행: "`&` 명령" → "`controls`의 명령", "축 6·7항(`&`는 …, JSON Schema 표현은 `&`로 대체 가능)" → "축 6·7항(`controls`는 값을 제어하는 층, JSON Schema 표현은 `controls`로 대체 가능)". (d) §2 축 6·7·8·9 문장을 C1(a)와 같은 뜻으로 줄인 판으로: "6. `controls`의 키에는 완전히 다른 규칙이 적용된다. 값을 제어하는 층이다. 7. JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다. 8. `controls`의 식과 `injectTo`는 예약어이며 명확한 동작 위계와 이름 컨벤션을 가진다. 9. **개정(15라운드).** 폼 전용 키는 그룹 객체 셋 안에만 둔다. 평면 `&` 축약과 `computed` 별칭은 없다." (e) §6 예시 머리 문장 "`allOf` 조각 하나는 `&active` 게이트를 가진다" → "`controls.active` 게이트", 예시의 `"&active": "../kind === 'bank'"` → `"controls": { "active": "./kind === 'bank'" }`. (f) §13 표에 다음 세 행을 "쓰기 옵션" 행 앞에 넣고, 표 아래 "`control` 컨테이너의 타입 표면…" 문단을 바꾼다.
```
| 스키마 그룹 | `controls`, `options`, `presentation` | §3. 맨 키는 JSON Schema의 것 |
| 렌더 계층(노드 단위) | `FormTypeInput`과 정의 목록 `formTypeInputDefinitions`. 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`(넷 모두 플러그인 키이자 같은 이름의 Form 속성. 오늘의 `FormGroup`·`FormLabel`·`FormInput`·`FormError`와 `CustomFormTypeRenderer`). 공통 props `FormTypeRendererProps`, 문맥 `FormTypeRendererContext` | 15라운드 |
| 합성 API | `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`·`Form.Render`와 props `FormGroupProps`·`FormLabelProps`·`FormInputProps`·`FormErrorProps`·`FormRenderProps`. `path`를 받아 그 노드의 일부를 그리며 `Form.X`는 `FormTypeXRenderer`를 부른다 | 그대로 |
```
바꿀 문단: "이름 규칙 셋(15라운드). `FormType…`은 노드 단위 조각과 그것을 그리는 것이고 플러그인이 등록하며 Form 속성이 덮고 스키마 `presentation`이 노드별로 고르거나 props를 준다. `…Renderer` 접미는 그리는 것이다. `Form.X`는 `path`를 받는 합성 API이고 props는 `FormXProps`다. 구성 요소를 담는 키는 파스칼이고 props 객체 키는 그 props 타입의 이름을 그대로 쓴다. 이 패키지에서 `controls`는 규칙이지 입력 위젯이 아니고, `Group`은 한 필드 단위(라벨·입력란·오류)이지 여러 컨트롤의 묶음이 아니다. `controls`의 타입 표면은 §3.2 표가 정한다(안쪽 `children[].controls`는 닫힌 목록)."
(g) §14 표: 3행 새 설계 "`controls.active`로 흡수"; 4행 "`controls`로 이름 변경. 별칭 없음(15라운드)"; 6행 키 이름에 `controls.` 접두; 14행 새 설계 "`controls.disabled`·`controls.visible`·`controls.active`"; 26행 새 설계 "바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다"; 28행 새 설계 "키워드 위치의 그룹 객체 셋(§3.4). strict 검증기에는 동작 변화"; 끝에 세 행 추가:
```
| 30 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) |
| 31 | 맨 키 `terminal`·`virtual`·`propertyKeys`, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`, `options`의 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation`의 다섯 키와 자유 칸 |
| 32 | 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`. Form 속성은 `FormTypeGroupRenderer`. 합성 API `Form.*`와 그 props는 그대로 |
```
(h) §15·§16·§17의 `control` 별칭·타입 표면·O-9 언급은 A5·A6·A9로. §16의 14라운드 기록에는 문장을 지우지 말고 "(15라운드에 그룹 셋으로 대체)"를 붙인다. (i) 나머지는 A 규칙.

C4. ADR `0001`·`0002`·`0004`·`0005`·`0006`·`0007`: A 규칙 전부. 상태 문장의 축 표기는 A11. ADR 0002 §의 예시 `"&active": "../kind === 'card'"` 류는 A1·A2. ADR 0005의 제거 목록 문장은 A7·A8. ADR 0003은 편집자가 따로 다시 쓴다(손대지 않는다).

C5. ADR `0008`~`0014`, `README.md`, `HANDOFF.md`: A 규칙 전부. README의 ADR 0003 행은 "| [0003](./adr/0003-group-namespace.md) | 예약 층: 그룹 객체 셋 `controls`·`options`·`presentation`으로 값과 UI를 제어한다. 키 목록·단계·부류, 기준점은 호스트, `&if`는 `controls.active`로 흡수 | 일부 수락 (6차 본문, 15라운드) |"로. README와 HANDOFF에 15라운드 행을 더한다: "15라운드 — a-z 검토 논의. `&` 축약 제거, 그룹 셋, 기준점 호스트, 렌더 계층 이름 규칙. `reviews/round-15-decisions.md`". `00-goals.md`·`05-before-after.md`·`06-conclusions.md`·`07-conclusions.md`는 본문을 고치지 않고 B3 머리 주석만 첫 제목 바로 아래에 넣는다. `01-current-structure.md`는 오늘의 코드 설명이므로 손대지 않는다.

## D. 08 §3.2–§3.4 교체 블록

### 3.2 `controls` — 값·형상을 때에 따라 바꾸는 규칙과 정책

제어 키는 `controls` 그룹 안에만 적는다. 평면 `&` 축약과 `computed` 별칭은 없다(15라운드. 소유자: "숏컷을 모두 없애고 중첩 객체로 하는 게 빼기도 편하고 나중에 서버 스키마랑 클라이언트 스키마를 병합하기도 편하겠지"). 부류가 형과 동작을 말한다. 형용사는 참인 동안 유지되는 상태, 명사는 값의 출처, 동사는 참이 되는 순간의 동작, 선언은 구조다.

| 부류 | 형 | 키 |
| --- | --- | --- |
| 형용사 | `boolean` 또는 식→`boolean`. 참인 동안 | `active` `visible` `readOnly` `disabled` `unsetOnInactive` |
| 명사 | 값의 출처 | `default`(값), `derived`(식→값), `injectTo`(함수→`{ 경로: 값 }`) |
| 동사 | `boolean` 또는 식→`boolean`. 참이 되는 순간 | `unsetValue` `resetInteraction` |
| 선언 | 구조 | `children`(배열), `discriminator`(문자열), `watch`(문자열 배열) |

| 키 | 부류 | 자리 | 단계 | 하는 일 | 로드에서 | 런타임에서 |
| --- | --- | --- | --- | --- | --- | --- |
| `active` | 형용사 | 노드 스키마(노드 게이트), 조각 객체(조각 게이트) | 계산(호스트 바퀴) | 거짓이면 형상에서 뺀다. 원본은 기본으로 남고 방출에서 빠진다 | 거짓인 노드는 생기지 않는다 | 거짓→참에 노드가 생겨 채움을 받는다 |
| `visible` | 형용사 | 노드 | 계산의 끝 | 표시만 가린다. 형상·값·방출을 바꾸지 않는다 | — | 전환은 생성이 아니다 |
| `readOnly`, `disabled` | 형용사 | 노드 | 계산의 끝 | 그 노드의 입력을 잠근다. 자손에 내려가지 않는다 | — | — |
| `default` | 명사 | 노드 | 전이 | 노드가 생길 때 없음이면 채운다. 표준 `default`보다 앞 | 형상의 모든 노드가 생긴 노드 | 생긴 노드에만 |
| `derived` | 명사 | 노드 | 파생 | 의존 값이 바뀔 때 자기 값을 덮는다. 식이 `undefined`면 쓰지 않는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 | 발화한다(직전 값이 없다) | 에지 |
| `injectTo` | 명사 | 노드 | 파생 | 원천의 방출 값이 바뀔 때 대상에 전체 교체를 쓴다. 남에게 주는 값의 출처 | 발화한다 | 에지 |
| `unsetValue` | 동사 | 노드 | 파생 | 식이 거짓→참이 되는 순간 값을 없음으로. 입력은 남는다 | 로드된 값으로 평가해 참이면 지운다 | 거짓→참에서 지우고 참→거짓에서는 아무 일도 없다 |
| `resetInteraction` | 동사 | 노드 | 커밋 | 식이 참이 되면 `dirty`·`touched`를 초기화한다. 값은 건드리지 않는다 | `unsetValue`와 같은 시점 규칙 | 같음 |
| `unsetOnInactive` | 형용사(불리언) | 노드, `children` 항목의 `controls`, 조각의 `controls`, Form 속성 | 전이 | 정책이 참으로 정해진 노드가 나갈 때 원본을 한 번 비운다(나가는 조상의 정책이 내려온다, §8.4). 기본 꺼짐 | 로드에는 나감이 없다 | 나갈 때 한 번 |
| `children` | 선언 | 객체 노드 | 각 키의 단계 | `[{ targets: [자식 이름…], controls: { readOnly, visible, active, disabled, unsetValue, default, derived, resetInteraction, unsetOnInactive } }]`. 이름으로 가리킨 직계 자식에 건다. 안쪽 `controls`는 닫힌 목록이며 `children`·`injectTo`·`discriminator`·`watch`는 들지 않는다. 손자에 걸려면 자식 스키마에 `controls.children`을 적는다 | — | — |
| `discriminator` | 선언 | union 호스트 | 청사진 | 분기의 그 키 `const`·`enum`을 읽어 분기별 `active: "./키 === 값"`으로 바꾼다. 상태와 루프를 바꾸지 않는다. 그 키의 분기 선언을 **게이트 없는 선언으로도 취급해 끌어올린다**(14라운드 확정. 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다. 존재만 더하는 선언이며 제약은 교차하지 않는다 — 게이트 없는 분기와 같은 문맥, 편집자 도출). 어느 분기에도 그 키의 `const`·`enum`이 없거나, 분기 선언의 종류가 서로 다르거나, `const`·`enum` 값이 두 분기에 겹치면 청사진 오류 | — | — |
| `watch` | 선언 | 노드 | 청사진·표시 | 의존 경로 선언. 식이 읽는 경로를 정적으로 알 수 없을 때 작성자가 적는다 | — | — |

- **조각 객체의 제어 키.** 조각 객체(`allOf` 항목, 분기, `then`)의 `controls.active`는 그 조각의 게이트이고, 그 밖의 제어 키(`controls.readOnly` 등)는 그 조각이 직접 선언한 호스트의 직계 자식에 조각이 켜진 동안 걸린다(조각 범위 제어). 더 깊은 자손에는 그 자손을 직접 선언한 안쪽 조각의 `controls`가 걸린다.
- **식의 기준점(15라운드).** 모든 JSON Pointer는 그것을 선언한 노드를 기준으로 푼다. 노드는 그 자체로 행위의 원천이자 네임스페이스다. 조각, `children` 항목, `discriminator`가 만드는 게이트는 모두 호스트 스키마 안의 선언이므로 호스트가 기준이다. 조각 객체의 `controls.active: "./kind === 'bank'"`에서 `./kind`는 호스트의 `kind`다. 조각은 같은 네임스페이스의 다른 표현 위치이지 다른 네임스페이스가 아니다(소유자). `.`·`..`는 폼의 확장 표기다(원장 §4). 자식에 적던 식을 `controls.children`으로 옮기면 `../x`를 `./x`로 고친다.
- **게이트 입력.** 게이트는 검증기가 볼 값(투영 뒤의 값)을 본다. 선언되지 않은 키의 값(`extras`)도 그 값에 든다(원장 §5). `extras`는 정적이다. 청사진 어디에도 선언되지 않은 키만 `extras`이고, 조각이 선언한 키는 그 조각이 모두 꺼지면 잠복 원본이라 게이트도 검증기도 보지 않는다(P1·P4, 14라운드).

### 3.3 `options`와 `presentation` — 정적 설정과 표현

폼 전용 키 가운데 제어가 아닌 것은 두 그룹에 든다. 맨 키는 모두 JSON Schema의 것이고 폼은 읽지 않는다. 모르는 그룹 안 키는 청사진 오류다(15라운드, `reviews/round-15-decisions.md`. 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다).

| 그룹 | 뜻 | 읽는 이 | 키 |
| --- | --- | --- | --- |
| `options` | 값·형상의 정적 설정 | 청사진과 투영 | `terminal`, `virtual`, `propertyKeys`, `omitEmpty`, `omitTrailing`, `trim` |
| `presentation` | 보이는 것 | 렌더 계층만 | `formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, 플러그인 자유 칸 |

그룹 이름은 명사이고 수는 뜻을 따른다. 셀 수 있는 항목의 지도는 복수(`controls`, `options`), 하나의 면은 단수(`presentation`). `options.virtual`은 현행대로 두되 오늘의 `required` 재작성(가상 이름을 실제 자식 이름으로 펼침)은 버린다. 작성자는 `required`에 실제 필드를 적는다. 오늘 맨 키로 쓰는 `disabled`·`visible`·`active`는 `controls`로, `terminal`·`virtual`·`propertyKeys`는 `options`로, 표현 키 다섯과 플러그인의 `options` 자유 칸은 `presentation`으로 옮긴다(이주).

```json
{
  "type": "object",
  "properties": { "kind": { "type": "string", "enum": ["card", "bank"] } },
  "controls": {
    "active": "./mode !== 'hidden'",
    "children": [{ "targets": ["kind"], "controls": { "readOnly": "./locked" } }]
  },
  "options": { "propertyKeys": ["kind"], "omitEmpty": true },
  "presentation": { "formType": "card", "FormTypeRendererProps": { "label": "결제" } }
}
```

### 3.4 검증기에 넘기기 전 지우는 규칙 하나

키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다. 지우는 이유는 판정이 아니라 컴파일이다(ADR 0003 §7). 작성된 스키마 자체는 변형하지 않고 검증기에 넘길 사본에서만 지운다(ADR 0001). 오늘은 여섯 키(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)만 지우고 `&` 키·`computed`·`virtual`·`terminal` 등은 검증기까지 가므로, 그룹 셋으로 옮기는 것이 이주 항목이다. 서버 스키마에 넘길 때도 같은 셋을 지우면 되고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다.

