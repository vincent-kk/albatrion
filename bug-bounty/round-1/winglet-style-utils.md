# @winglet/style-utils 버그 바운티 결과

확인된 버그는 5건입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-style-utils/probes.test.ts`](probes/winglet-style-utils/probes.test.ts)

영향 범위: `@lerx/promise-modal`이 `StyleManager`로 스타일을 주입하므로(`packages/lerx/promise-modal/src/app/ModalManager.ts`, `src/components/Foreground/Foreground.tsx`, `src/components/Background/Background.tsx`), 아래 1번과 2번은 promise-modal 사용자에게도 영향을 줍니다.

## 1. `StyleManager`가 `@media` 블록의 닫는 중괄호를 잃어, 뒤따르는 규칙이 미디어 쿼리 안으로 들어갑니다

- 심각도: 높음. 출력 CSS의 구조가 깨집니다. 뒤따르는 규칙은 조용히 미디어 쿼리의 조건을 받게 되고, `@media` 안의 규칙은 스코프 접두사 없이 문서 전체에 적용됩니다.
- 영향받는 공개 API: `styleManagerFactory`, `destroyScope` (`@winglet/style-utils`, `@winglet/style-utils/style-manager`).
- 어긋난 계약: `packages/winglet/style-utils/src/styleManager/StyleManager/DETAIL.md:32`는 일반 선택자에 `.<scopeId>` 접두사가 붙고 `@media` 규칙은 접두사 없이 유지된다고 적고 있습니다.
- 원인: `packages/winglet/style-utils/src/styleManager/StyleManager/StyleManager.ts:292`의 `__scopeCSS__`는 규칙 하나가 다음 `}`에서 끝난다고 가정합니다. `@media (...) { .a { … } }`에서는 첫 덩어리가 안쪽 `}`에서 끝나 그대로 복사되므로(312행) `.a`에 스코프가 붙지 않습니다. 남은 ` }`에는 `{`가 없어 건너뛰어지고, 그 결과 중괄호 하나가 사라집니다.
- 재현: 테스트 "a nested @media block keeps its closing brace so later rules stay outside it". 실제 출력은 `{`가 3개, `}`가 2개이고, 기대값은 개수가 같은 것입니다.
- 확신도: 높음.

## 2. `StyleManager`가 선택자 목록의 첫 선택자에만 스코프를 붙입니다

- 심각도: 높음. `.a, .b {}`가 `.scope .a,.b{…}`가 되어 `.b`가 문서 전체로 새어 나갑니다.
- 영향받는 공개 API: `styleManagerFactory`.
- 어긋난 계약: `packages/winglet/style-utils/src/styleManager/StyleManager/INTENT.md:9`는 `@` 규칙과 `:root`, `:host`를 제외한 모든 선택자가 `.<scopeId>` 접두사를 받는다고 적고 있습니다.
- 원인: `StyleManager.ts:313`이 선택자 문자열 전체 앞에 `scope + ' '`를 한 번만 붙이고, 쉼표로 나누지 않습니다.
- 재현: 테스트 "every selector in a selector list receives the scope prefix". 실제 출력은 `.bounty-list .a,.b{color:red}`이고, 기대 출력에는 `.bounty-list .b`가 들어 있어야 합니다.
- 확신도: 높음.

## 3. `compressCss`가 `calc()` 안의 `+` 양옆 공백을 지워 선언을 무효로 만듭니다

- 심각도: 높음. `calc(1px + 2px)`는 흔한 표현인데, 결과인 `calc(1px+2px)`는 무효한 CSS라서 브라우저가 선언을 버립니다. `StyleManager`도 기본으로 `compressCss`를 호출합니다.
- 영향받는 공개 API: `compressCss` (`@winglet/style-utils`, `@winglet/style-utils/util`).
- 어긋난 계약: `packages/winglet/style-utils/src/utils/compressCss/INTENT.md`의 Never do 항목은 압축 결과가 원본과 다른 규칙 집합으로 파싱되면 안 된다고 하고, Always do 항목은 애매하면 공백을 남기라고 합니다.
- 원인: `packages/winglet/style-utils/src/utils/compressCss/compressCss.ts:100`과 `:118`에서 `PLUS`가 인접 형제 결합자 처리 때문에 "뒤 공백 제거"와 "앞 공백 제거" 집합 양쪽에 들어 있습니다. 코드는 지금 함수 괄호 안에 있는지 구분하지 않습니다.
- 재현: 테스트 "keeps the whitespace calc() requires around +". 실제 출력은 `.a{width:calc(1px+2px)}`입니다.
- 확신도: 높음.

## 4. `compressCss`가 따옴표 문자열 안의 `/*`를 주석 시작으로 보고 나머지 스타일시트를 지웁니다

- 심각도: 중간에서 높음. 데이터가 조용히 사라집니다. `.a{content:"/*"}.b{color:red}`가 `.a{content:"`가 됩니다.
- 영향받는 공개 API: `compressCss`.
- 어긋난 계약: `compressCss/INTENT.md`의 Never do 항목은 주석 제거 로직이 선언 값 안의 실제 내용을 손상시키면 안 된다고 적고 있습니다.
- 원인: `compressCss.ts:80`의 스캐너가 문자열 구간을 추적하지 않아, 어떤 위치의 `/*`든 주석 모드로 전환합니다.
- 재현: 테스트 "does not treat comment markers inside a string as a comment".
- 확신도: 높음.

## 5. `compressCss`가 `:` 앞의 하위 결합자 공백을 지워 선택자의 의미를 바꿉니다

- 심각도: 중간. `.a :hover`는 `.a`의 하위 요소 중 마우스가 올라간 요소를 고르고, `.a:hover`는 `.a` 자신을 고릅니다. `.a :not(...)`과 `.a ::before`에서도 같은 일이 일어납니다.
- 영향받는 공개 API: `compressCss`.
- 어긋난 계약: `compressCss/INTENT.md`의 Conventions 항목은 하위 결합자 공백이 선택자 의미를 바꾸므로 보존한다고 적고 있습니다.
- 원인: `compressCss.ts:115`에서 `COLON`이 "앞 공백 제거" 집합에 들어 있어, 가상 클래스 앞의 공백이 지워집니다.
- 재현: 테스트 "keeps the descendant combinator before a pseudo-class". 실제 출력은 `.a:hover{color:red}`이고, 기대 출력은 `.a :hover{color:red}`입니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- `cx`와 `cxLite`는 falsy 값, 숫자, 중첩 배열, 객체 입력에서 clsx와 같게 동작합니다.
