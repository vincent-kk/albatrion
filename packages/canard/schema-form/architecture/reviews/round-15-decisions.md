# 15라운드 — a-z 설계서 검토 논의에서 정해진 것

2026-09-24. Vincent가 `08-design-a-to-z.md`를 deilen 뷰어에서 읽고 남긴 댓글 둘(§3.2 제어 키, §6 예시의 `../kind`)에서 시작한 대화의 기록이다. 문서 반영 전의 메모이며, 반영이 끝나면 이 파일의 "반영" 칸을 채운다. 답의 원문은 대화에 있고 여기는 편집자가 정리한 것이다.

## 확정

| 번호 | 결정 | 근거(소유자의 말) | 반영 |
| --- | --- | --- | --- |
| 1 | **식의 기준점은 선언된 노드 하나.** 노드는 그 자체로 행위의 원천이자 네임스페이스다. `oneOf`·`allOf`·`then` 조각, `children` 항목, `discriminator`가 만드는 게이트의 식은 모두 호스트에 선언된 것이므로 호스트 기준이다. `./kind`가 늘 맞고 `../kind`는 틀리다. `discriminator` 변환은 `./키 === 값`. 자식에 적던 식을 `children`으로 옮기면 `../x`를 `./x`로 고친다. 08 §14 이주 항목 26(`&if` 기준점 변경)은 사라진다 | "각 node는 그 자체로 행위의 원천이자 네임스페이스가 된다. oneOf allOf 같은 표현은 동일한 네임스페이스의 서로 다른 표현 위치이지 다른 네임스페이스가 아니다" | 반영(2026-09-24, verifier 게이트 둘 통과) |
| 2 | **제어 키는 네 부류와 형으로 적는다.** 형용사(`boolean \| 식→boolean`, 참인 동안): `active` `visible` `readOnly` `disabled` `unsetOnInactive`. 명사(값의 출처): `default`는 값, `derived`는 식→값, `injectTo`는 함수→`{경로: 값}`. 동사(`boolean \| 식→boolean`, 참이 되는 순간): `unsetValue` `resetInteraction`. 선언(구조): `children` 배열, `discriminator` 문자열, `watch` 문자열 배열 | "네 분류와 형으로 다시 쓰자. injectTo 명사화 동의한다" | 반영(2026-09-24, verifier 게이트 둘 통과) |
| 3 | **`injectTo` 이름은 그대로.** `inject`만 남기면 방향이 읽히지 않는다. 명사화만 한다 | "동의한다(명사화만 진행하라)" | 반영(2026-09-24, verifier 게이트 둘 통과) |
| 4 | **폼 전용 키는 그룹 객체 셋 안에만 둔다.** `controls`(값·형상을 때에 따라 바꾸는 규칙과 정책, 정착 루프가 읽는다), `options`(값·형상의 정적 설정, 청사진과 투영이 읽는다: `terminal` `virtual` `propertyKeys` `omitEmpty` `omitTrailing` `trim`), 표현 그룹(보이는 것, 렌더 계층만 읽는다: `formType` `FormTypeInput` `FormTypeInputProps` `FormTypeRendererProps` `errorMessages`, 플러그인 자유 칸). 맨 키는 모두 JSON Schema의 것이고 폼은 읽지 않는다. 모르는 그룹 안 키는 청사진 오류. 검증기에 넘기기 전 지우는 것은 그룹 셋뿐. 병합은 그룹 단위로 §9 병합표를 적용한다. 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다 | "동의합니다" (그룹 셋, `options`는 코어만 읽는 정적 설정, 플러그인 자유 칸은 표현 그룹으로) | 반영(2026-09-24, verifier 게이트 둘 통과) |
| 5 | **`&` 축약을 없앤다.** 숏컷을 모두 없애고 중첩 객체만 둔다. 축 6항("`&`로 시작하는 키에는 완전히 다른 규칙이 적용된다")·7항("JSON Schema 표현은 `&` 표현으로 대체할 수 있어야 한다")·8항("`&` 표현식과 `injectTo`는 폼을 제어하는 예약어")의 `&`는 `controls`로 읽고, 9항("`computed`와 `&`의 동시 제공은 유지한다")은 "`controls` 하나만 둔다"로 뒤집는다. ADR 0003은 그룹 네임스페이스로 다시 쓴다 | "숏컷을 모두 없애고 중첩 객체로 하는 게 빼기도 편하고 나중에 서버 스키마랑 클라이언트 스키마를 병합하기도 편하겠지" | 반영(2026-09-24, verifier 게이트 둘 통과) |
| 6 | **그룹 이름은 복수 명사로 맞춘다.** `control` → `controls`(JSON Schema가 이름 붙은 항목의 지도를 `properties`·`$defs`처럼 복수로 쓰는 관례). `children` 항목의 `control`도 `controls`. 그룹 안의 나머지 이름은 그대로 둔다. 표현 그룹의 `FormType` 접두는 개념 이름이라 떼지 않는다(떼면 플러그인이 쓰는 타입 이름과 어긋난다) | "options와 controls와 품사가 맞지 않지 않아?" (동사 `render` 기각) | 반영(2026-09-24, verifier 게이트 둘 통과) |
| 7 | **표현 그룹의 이름은 `presentation`.** 명사. 수는 뜻을 따른다: 셀 수 있는 항목의 지도는 복수(`controls`, `options`), 하나의 면은 단수(`presentation`). `ui`·`render`·`renderers`·`view`는 버림 | "그룹 이름은 presentation으로 하자" | 반영(2026-09-24, verifier 게이트 둘 통과) |

## 확정(이어서)

| 번호 | 결정 | 근거 | 반영 |
| --- | --- | --- | --- |
| 8 | **렌더 계층 이름 매핑(소유자 확정 "예, 이대로 반영").** 규칙 셋. (1) `FormType…`은 노드 단위 조각과 그것을 그리는 것. 플러그인이 등록하고 Form 속성이 덮고 스키마 `presentation`이 노드별로 고르거나 props를 준다. (2) `…Renderer` 접미는 "그리는 것". (3) `Form.X`는 소비자가 `path`로 놓는 합성 API이고 props는 `FormXProps`, 안에서 `FormTypeXRenderer`를 부른다 | 아래 표 | 반영(2026-09-24, verifier 게이트 둘 통과) |

### 8의 표 — 렌더 계층 이름 매핑

**스키마 `presentation` 그룹.** `formType` → `presentation.formType`, `FormTypeInput` → `presentation.FormTypeInput`, `FormTypeInputProps` → `presentation.FormTypeInputProps`, `FormTypeRendererProps` → `presentation.FormTypeRendererProps`, `errorMessages` → `presentation.errorMessages`. 플러그인 자유 칸도 이 안.

**노드 단위 조각 `FormType…`.**

| 개념 | 오늘 | 새 이름 |
| --- | --- | --- |
| 입력란 위젯과 그 정의 | `FormTypeInput` `FormTypeInputProps`(`…WithNode`·`…WithSchema`) `FormTypeInputDefinition` `formTypeInputDefinitions` `FormTypeInputMap` `formTypeInputMap` `FormTypeTestFn` `FormTypeTestObject` `FormTypeInputsContext` | 그대로 |
| 한 단위(라벨+입력란+오류)를 그리는 것 | 플러그인 `FormGroup`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer`, 대체 구현 `FormGroupRenderer` | `FormTypeGroupRenderer`(플러그인 키·Form 속성·타입이 같은 이름), 대체 구현 `FallbackFormTypeGroupRenderer` |
| 라벨을 그리는 것 | 플러그인 `FormLabel`, 대체 구현 `FormLabelRenderer` | `FormTypeLabelRenderer`, `FallbackFormTypeLabelRenderer` |
| 입력란 자리를 그리는 것(`FormTypeInput`을 앉힌다) | 플러그인 `FormInput`, 대체 구현 `FormInputRenderer` | `FormTypeInputRenderer`, `FallbackFormTypeInputRenderer` |
| 오류를 그리는 것 | 플러그인 `FormError`, 대체 구현 `FormErrorRenderer` | `FormTypeErrorRenderer`, `FallbackFormTypeErrorRenderer` |
| 네 렌더러의 공통 props와 묶음 | `FormTypeRendererProps` `FormTypeRendererContext` `FormTypeRendererContextProvider` | 그대로 |

**합성 API `Form.…`.** 모두 그대로. `Form.Group`/`FormGroupProps` → `FormTypeGroupRenderer`, `Form.Label`/`FormLabelProps` → `FormTypeLabelRenderer`, `Form.Input`/`FormInputProps` → `FormTypeInputRenderer`, `Form.Error`/`FormErrorProps` → `FormTypeErrorRenderer`, `Form.Render`/`FormRenderProps` → 소비자가 직접 그린다. 이름 없는 형 `FormGroup`·`FormLabel`·`FormInput`·`FormError`·`FormRender`는 합성 구성 요소만 가리키게 된다(플러그인 키가 옮겨 가므로 충돌이 사라진다).

## 반영할 자리

원장 `03-mental-model.md` §1.3 축 6·7·8·9항, §1.4 두 층 표, §4 기준점 문단, §5 표. `02-target-overview.md` §3 예시와 `discriminator` 문장. `07-conclusions.md` 예시 둘. ADR 0002·0003·0005·0010·0013·0014의 `&` 표기와 예시. `08-design-a-to-z.md` §3 전체, §6 예시, §8·§9, §13, §14(항목 26 삭제, `computed` → `controls`, 맨 표현 키 → 표현 그룹, `terminal`·`virtual`·`propertyKeys`·플러그인 자유 칸 → 각 그룹). 검토 기록 `reviews/`는 역사이므로 고치지 않는다. 검토 기록을 뺀 설계 문서에서 `&키` 출현은 약 1,050곳(2026-09-24 셈).

## 이름 규칙의 교차 검증 (codex low, antigravity mid. 2026-09-24)

두 검토자 모두 규칙 위반은 찾지 못했고, codex는 "이름이 소유 경계와 역할을 먼저 드러내고 그 다음 수와 렌더 여부를 드러낸다는 하나의 원칙"으로 판정했다. antigravity는 아래 넷을 들어 "과도기적"이라 했다. 편집자 판단과 함께 적는다.

| 지적 | 편집자 판단 |
| --- | --- |
| Form 속성은 그룹 렌더러만 덮고 라벨·입력란 자리·오류 렌더러를 덮는 속성이 없어 "플러그인이 등록하고 Form 속성이 덮는다"는 규칙이 반쪽이다 | **수용.** Form 속성에 넷을 모두 둔다. 플러그인 키와 같은 이름 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer` |
| `presentation` 안에서 `formType`·`errorMessages`는 카멜, `FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`는 파스칼이라 표기가 섞인다 | **규칙으로 닫음.** 구성 요소를 담는 키는 파스칼(React의 구성 요소 값 관례), props 객체 키는 그 props 타입의 이름을 그대로(키와 타입의 1:1 연결). 소유자가 그룹 안 이름 유지를 확정했다 |
| `FormTypeInput`(위젯)과 `FormTypeInputRenderer`(자리)가 접미로만 갈리고 `Group`·`Label`·`Error`에는 조각이 없어 대칭이 깨진다. `FormTypeWidget`으로 갈라 부르자 | **불수용.** 입력란만 조각이 있는 것은 사실이 그렇다(위젯은 노드마다 고르고 나머지는 틀의 부분이다). `…Renderer` 접미가 "그리는 것"을 뜻하는 규칙으로 갈린다. `FormTypeInput`은 패키지의 중심 개념이라 바꾸지 않는다 |
| `FormTypeRendererProps`가 `FormTypeGroupRenderer`와 이름이 어긋난다 | **불수용.** 네 렌더러가 같은 props를 받으므로 총칭이 맞다. `presentation.FormTypeRendererProps`는 그 공통 props에 노드별로 더하는 것이다 |
| `controls`는 웹 표준·라이브러리에서 입력 위젯(form controls)을 뜻한다. `options`는 선택지 목록을 뜻한다. `Group`은 다중 컨트롤 묶음을 뜻한다 | **기록만.** 소유자가 고른 이름이고 규칙 위반이 아니다. 08 §13 이름 규칙에 "이 패키지에서 `controls`는 규칙, `Group`은 한 필드 단위"라고 한 줄 적는다 |
| `options.virtual`은 정적 플래그가 아니라 하위 스키마 구조라 위상이 다르다 | **기록만.** 소유자가 `options`에 두기로 했다. `shape` 그룹으로 떼는 안은 앞서 기각했다 |
| `errorMessages`는 ajv-errors의 `errorMessage`와 단복수가 다르다, `presentation`은 WAI-ARIA의 역할 이름과 같다 | **기록만.** 충돌이 아니다 |

## 게이트 뒤의 편집자 결정 (verifier 1차, 2026-09-24)

verifier가 결정 4행이 남긴 충돌 셋을 물었다. 편집자가 결정 4의 뜻 안에서 닫았고, 소유자가 다르게 보시면 뒤집는다.

| 물음 | 결정 | 17라운드 결정 |
| --- | --- | --- |
| 병합표에서 `options`도 깊은 병합인가 | 예. 그룹 객체(`options`, `presentation`)는 깊은 병합, `controls`의 값·동작 키는 병합하지 않는다(15라운드 논의에서 소유자가 동의한 문장 그대로) | 17라운드 스웜 수렴(편집자 결정). 유지(R15-1). `controls`는 그룹째 병합하지 않고 키마다 병합표의 행을 따른다. 세부(R15-8): 재귀는 두 선언이 같은 키에 모두 원자가 아닌 plain object를 줄 때만 새 객체를 만들어 하고(쓰기 시 복사), 원자(React 요소, 자기 열거 키가 `current` 하나뿐인 ref 모양)는 나중 승, 한쪽 선언에만 있는 값은 객체라도 복사하지 않고 참조를 옮기며, 선언이 하나면 그 객체를 그대로 쓴다. `@winglet/common-utils`의 `merge`에 선택 인자(배열 교체, 원자 판정, 한쪽 값의 참조 이동)를 더한다. 인자가 없으면 오늘 동작이다(14라운드 O-11 되물음의 답) |
| `presentation`은 "렌더 계층만 읽는다"인데 청사진이 `FormTypeInput`의 유무로 터미널 전략을 정한다 | 예외 하나를 적는다. "청사진은 `presentation.FormTypeInput`의 유무만 본다(터미널 전략)". 키는 `presentation`에 둔다(구성 요소다) | R15-2 개정: 판정을 렌더 계층으로. 청사진은 `presentation`을 읽지 않는다(결정 4의 "렌더 계층만 읽는다"). 인라인 `FormTypeInput`을 꽂은 객체·배열 노드가 터미널이 되는 암묵 규칙은 소유자가 의도된 기능이라 한 것이므로(`00-goals.md:116`, ADR 0011 §3) 유지하되, 렌더 계층(React 바인딩)이 `presentation.FormTypeInput`이 있고 `null`이 아닌지를 보는 판정 함수를 청사진에 넘긴다. 청사진은 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다(선언 사이 규칙은 R15-10). 17라운드 스웜 수렴(편집자 결정), 통보(반대하시면 엽니다) |
| `trim`은 ADR 0013이 입력 컴포넌트로 옮겼는데 `options`(청사진과 투영이 읽는다)에 들어갔다 | `trim`을 `presentation`으로 옮긴다. 입력 컴포넌트가 읽는 설정이다. `options`는 `terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing` 다섯 | 소유자 질문 R17-3(답까지 `options`). 이 칸의 편집자 제안은 결정 4의 `options` 목록과 어긋나 소유자 질문으로 남겼다. 답까지 효력: `trim`은 결정 4대로 `options`의 닫힌 목록에 남고(청사진 오류 아님), 누가 어디서 적용하는가는 정하지 않는다(PR-7의 입력 쓰기 경로가 답을 기다린다) |
| "모르는 그룹 안 키는 청사진 오류"와 `presentation`의 플러그인 자유 칸이 부딪힌다 | `controls`·`options` 안의 모르는 키는 청사진 오류, `presentation`의 모르는 키는 플러그인 자유 칸(오늘의 `options.lazy`·`protocols`·`range`·`marks` 같은 키가 그리로 간다) | 17라운드 스웜 수렴(편집자 결정). 유지(R15-4). 옮겨 오는 맨 키 목록에 `switchSize`를 더한다. `presentation` 안의 코어 키 대소문자 오타와 `controls`·`options` 키 이름은 렌더 계층이 개발 모드 경고로 알리며 청사진은 관여하지 않는다(R15-9) |
| `FormTypeInputProps` 안의 prop `FormTypeRenderer`(`src/types/formTypeInput.ts:146`) | 결정 8의 표에 빠졌다. PR-7 이주에서 `FormTypeGroupRenderer`로 함께 바꾼다(08 §14의 32에 덧붙임) | 17라운드 스웜 수렴(편집자 결정). 사실과 범위 정정(R15-5): prop은 `FormTypeInputProps`가 아니라 `ChildNodeComponentProps`(`src/types/formTypeInput.ts:146`)에 있고 같은 공개 prop이 `FormGroupProps`(`src/components/Form/components/FormGroup.tsx:23`)에도 있다. 둘과 `OverridableFormTypeInputProps`의 Omit 목록을 PR-7 이주에서 함께 `FormTypeGroupRenderer`로 바꾼다. 합성 API `Form.*`의 이름과 `…Props` 형 이름은 그대로이고(`FormInputProps`·`FormRenderProps`도 `ChildNodeComponentProps`와 교차하므로 그 안의 prop이 같이 바뀐다), `SchemaNodeProxy`·`FormTypeRendererContext`의 비공개 칸은 구현이 정한다 |

verifier 2차(조건부 통과)가 물은 둘도 편집자가 닫았다(17라운드 스웜 수렴으로 닫힘. 결정은 새 칸).

| 물음 | 결정 | 17라운드 결정 |
| --- | --- | --- |
| `controls.unsetOnInactive`의 형이 부류 표("`boolean` 또는 식")와 행("불리언")에서 다르다 | 13라운드 확정대로 `boolean`만. 정책 키라 식을 받지 않는다. 부류 표에 예외로 적는다 | 17라운드 스웜 수렴(편집자 결정), 통보(반대하시면 엽니다). R15-6: 노드·`children` 항목·조각의 `controls.unsetOnInactive`는 형용사 부류의 형 그대로 `boolean` 또는 식→`boolean`을 받으며(15라운드 결정 2) 부류 표에 예외를 적지 않는다. "13라운드 확정대로"는 사실과 달랐다(13라운드는 이름과 기본값만 정했고 형은 14라운드 가치 점검 F-6의 편집자 문장에서 처음 나온다). 어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋(그 노드가 형상에 있던 마지막 커밋)의 것이다. 나가는 순간 형상 밖의 노드를 새로 평가하지 않으므로(12라운드 §9 "형상에 없는 노드의 규칙: 평가하지 않음", 소유자 "동의") 식은 나감을 일으킨 변화를 보지 못한다. 보게 하려면 12라운드 §9에 예외가 필요하다. Form 속성 `unsetOnInactive`는 `boolean`만이며 그 층은 React가 마지막으로 커밋한 속성 값으로 센다(O8-마) |
| 같은 노드가 여러 조각에서 선언될 때 `controls.children`·`discriminator`·`watch`·`unsetOnInactive`의 병합 행이 없다 | 병합하지 않는다. `children`과 `unsetOnInactive`는 선언한 조각의 층에서 각각 효력을 가진다(나감 비움 규칙과 같은 대상 규칙이 층으로 푼다), `watch`는 경로의 합집합, `discriminator`는 호스트에 하나이며 둘이 다르면 청사진 오류. 병합표에 행 하나를 더한다 | 17라운드 스웜 수렴(편집자 결정). R15-7: 병합하지 않는다. `children`과 `unsetOnInactive`는 각 선언이 속한 층(노드 자신, `children` 항목, 조각의 `controls`)에서 그 선언을 담은 조각이 켜져 있는 동안(나감에서는 직전 커밋 기준) 각각 효력을 가진다. `discriminator`는 노드에 하나이며 선언이 여럿이면 같은 값만 허용하고 다르면 청사진 오류다(14라운드 O-1). `watch`는 의존이 모든 선언의 경로 합집합(청사진, 정적)이고 입력에 가는 공개 위치 배열 `watchValues`는 유효 스키마의 것(켜진 선언 가운데 전순서에서 나중 것)이다. 병합표에 행 하나를 더한다 |

## 17라운드 스웜 수렴 (2026-09-25)

위 두 표의 "17라운드 결정" 칸이 이 절의 결과다. 두 표의 "결정" 칸은 그때의 기록으로 둔다. 게이트 뒤 편집자 결정 일곱 가운데 여섯은 17라운드 스웜 수렴(편집자 결정)으로 닫혔고, `trim`의 자리는 소유자 질문 R17-3으로 남았다(답까지 `options`). `presentation` 예외 행(R15-2 개정)과 `unsetOnInactive`의 형 행(R15-6)은 소유자에게 알리는 통보(반대하시면 엽니다)다. 같은 수렴에서 새로 닫은 점은 셋이다. `merge`의 선택 인자와 원자(R15-8), `presentation` 실수의 개발 모드 경고(R15-9), 터미널 전략의 선언 사이 정적 규칙과 `options.virtual`·`options.propertyKeys`의 자리(R15-10)다. 물음 셋(R17-1·R17-2·R17-3)과 통보 넷은 `08-design-a-to-z.md` §16.3, 수렴과 두 게이트의 기록은 `reviews/raw-round17-convergence.md`에 있다.
