# StyleManager contract

## Requirements

- `StyleManager.get(scopeId, config?)`는 scopeId(및 Shadow DOM인 경우 `shadowRoot` 인스턴스)별로 유일한 인스턴스를 반환하는 정적 싱글톤 팩토리다.
- `add(id, css, compressed?)`는 CSS를 스코핑하고(Shadow DOM이면 스코핑 생략), `compressed`가 아니면 압축한 뒤, 이전에 저장된 동일 id의 처리 결과와 다를 때만 DOM 갱신을 예약한다.
- `remove(id)`는 저장된 스타일을 제거하고, 실제로 제거되었을 때만 DOM 갱신을 예약한다.
- DOM 갱신은 `requestAnimationFrame` 콜백 하나로 배치된다 — 같은 프레임 안의 여러 `add`/`remove` 호출은 DOM에 한 번만 반영된다.
- `destroy()`는 예약된 애니메이션 프레임을 취소하고, 적용된 시트 또는 엘리먼트를 제거하고, 내부 캐시를 비우고, 인스턴스를 레지스트리에서 제거한다.

## API Contracts

- `StyleManager.get(scopeId: string, config?: StyleManagerConfig): StyleManager` — 문서는 scopeId별 Map을 사용하고, Shadow DOM은 ShadowRoot를 키로 하는 WeakMap 안의 scopeId별 Map을 사용한다. 레지스트리는 분리된 ShadowRoot와 호스트의 수거를 막지 않는다.
- DOM 반영은 `CSSStyleSheet.prototype.replaceSync`와 `adoptedStyleSheets`를 모두 지원하는 환경에서는 그 경로를 쓰고, 아니면 scope 클래스가 붙은 `<style>` 엘리먼트에 `textContent`를 대입하는 방식으로 폴백한다. `replaceSync` 호출이 실패하면 예외를 던지지 않고 `console.warn`으로 기록한다.
- CSS 스코핑은 텍스트를 앞에서부터 한 번 훑으며 규칙마다 프렐류드(선택자 또는 at-rule 조건)와 블록을 찾는다.
  - 중괄호·세미콜론·쉼표는 문자열(`"…"`, `'…'`), 주석(`/* … */`), 백슬래시 이스케이프 밖에 있을 때만 구조로 센다 — 안쪽 문자를 세면 `content: "{"` 하나가 시트의 나머지를 지우거나 다음 규칙을 블록 안으로 끌어들인다. 따옴표 없는 `url(…)`(대소문자 무관) 안의 `/*`는 주석을 열지 않고, 그 안의 `;`는 문장형 at-rule을 끝내지 않는다 — `url(http://x.com/a/*b)`가 주석으로 읽히면 뒤따르는 규칙이 사라지고, `@import url(http://x.com/a;b.css);`가 URL 안에서 끊기면 스코프가 URL에 들어가고 다음 규칙이 스코프를 잃는다. `url(`은 바로 앞이 식별자 문자(영문자·숫자·`-`·`_`·백슬래시·비ASCII)가 아닐 때만 URL로 본다 — `myurl(` 같은 다른 함수의 인자를 불투명하게 다루면 그 안의 주석과 괄호를 잘못 읽는다.
  - 알려진 한계: 따옴표 없는 `url(…)` 안의 중괄호는 구조로 센다. 중괄호마다 `url(` 안인지 확인하면 모든 일반 규칙이 그 비용을 치르기 때문이며, 중괄호가 든 URL은 따옴표로 감싸야 한다.
  - 블록 끝은 중괄호 깊이로 찾는다 — 첫 `}`에서 끊으면 `@media` 같은 중첩 블록의 닫는 중괄호가 사라진다.
  - 일반 규칙은 선택자 목록의 최상위 쉼표(괄호·문자열·주석·이스케이프 밖)마다 나눈 각 선택자에 `.<scopeId> ` 접두사를 붙인다. 주석을 제외한 선택자가 ASCII 대소문자 구분 없이 `:root` 또는 `:host`이면 그대로 둔다. 빈 목록 항목은 빈 항목으로 남겨 무효 목록을 범위 컨테이너 규칙으로 바꾸지 않는다. 이스케이프된 후행 공백은 선택자 토큰에 속하므로 보존한다. 첫 선택자에만 붙이면 나머지 선택자가 문서 전체로 샌다.
  - 평평한 스타일 규칙(프렐류드의 `{`가 다음 `}`와 다음 불투명 토큰보다 앞서고, 블록의 `}`가 다음 `{`와 다음 불투명 토큰보다 앞서는 규칙)은 구조 탐색 없이 처리하고, 그중 선택자가 하나이며 비어 있지 않고 ASCII 비공백 문자로 시작하고 끝나며 `:`로 시작하지 않는 규칙은 접두사 뒤에 선택자부터 `}`까지의 원문 한 조각을 붙인다. 출력은 일반 경로와 바이트 단위로 같아야 한다 — 동등성 테스트가 고정된 기준 스코퍼와 비교해 이를 지킨다.
  - 규칙을 담는 그룹 at-rule(`@media`, `@supports`, `@container`, `@layer`, `@scope`, `@document`, `@starting-style`, 벤더 접두사 포함)은 조건부를 그대로 두고 블록 안 규칙을 같은 방식으로 재귀 스코핑한다. 안쪽 규칙이 스코프 밖으로 새지 않게 하기 위해서다.
  - 그 밖의 블록 at-rule(`@keyframes`, `@font-face`, `@page` 등)은 블록 전체를 그대로 복사한다 — `from`/`to` 같은 키프레임 선택자에 접두사가 붙으면 규칙이 무효가 된다.
  - 문장형 at-rule(`@import`, `@charset`, `@layer a, b;` 등)은 구조로 센 `;`까지, 시트 끝에서는 누락된 세미콜론을 보충해 다음 스타일 식별자와의 경계를 유지한다. Shadow DOM에서도 같은 경계를 보충한다. 뒤에 스타일 규칙이 없어도 복사한다.
  - 규칙 사이의 주석은 버린다. 주석 뒤의 at-rule도 at-rule로 인식한다.
  - 블록 없이 `}`를 만난 프렐류드와 짝 없는 `}`는 버리고, 다음 프렐류드는 그 `}` 뒤에서 시작한다 — 남은 `}`가 다음 선택자 앞에 붙으면 그 규칙의 스코프가 깨진다.
  - 짝이 맞는 `}`가 없는 마지막 규칙은 버린다. 그 규칙이 그룹 at-rule이면 이미 만든 안쪽 결과도 함께 버린다.
- 이스케이프되지 않은 LF·CR·FF는 닫히지 않은 문자열을 끝내므로 다음 규칙 탐색이 계속된다. 백슬래시 뒤 CRLF는 하나의 줄 연속으로 처리한다.
- Shadow DOM 대상에는 스코핑을 적용하지 않는다.

## Acceptance Criteria

### singleton-registry — scopeId·ShadowRoot별 싱글톤 계약

- 동일 scopeId로 `get`을 반복 호출하면 같은 인스턴스를 반환한다.
- 서로 다른 `shadowRoot`로 같은 scopeId를 호출하면 서로 다른 인스턴스를 반환한다.

### batched-dom-update — rAF 배치와 폴백 계약

- 한 프레임 안에서 여러 번 `add`를 호출해도 DOM 반영 함수는 정확히 1회만 실행된다.
- 동일한 처리 결과의 CSS를 다시 `add`해도 DOM 반영 함수가 호출되지 않는다.
- `CSSStyleSheet`/`adoptedStyleSheets`를 지원하는 환경에서는 시트로, 아니면 scope 클래스가 붙은 `<style>` 엘리먼트로 반영된다.

### css-scoping — 선택자 스코핑 규칙

- 일반 선택자와 선택자 목록의 모든 선택자에 `.<scopeId>` 접두사가 붙고, `:root`·`:host`는 접두사 없이 유지된다.
- `@media` 블록은 닫는 중괄호를 유지하고 안쪽 규칙에도 접두사가 붙으며, 뒤따르는 규칙은 블록 밖에 남는다. `@keyframes` 블록은 그대로 유지된다.
- 문자열·주석 안의 중괄호·세미콜론·쉼표, 짝 없는 `}`, 앞선 주석은 규칙을 잃거나 스코프를 빠뜨리게 만들지 않는다.
- Shadow DOM 대상에서는 스코프 접두사가 붙지 않는다.

### destroy-cleanup — 정리 계약

- `destroy()` 이후 같은 scopeId로 `get`을 호출하면 이전과 다른 새 인스턴스를 반환한다.
- `destroy()` 이후 문서(또는 shadowRoot)의 `adoptedStyleSheets`/`<style>` 흔적이 모두 제거된다.
- Shadow DOM 대상에서도 동일하게 정리된다.
- 외부 참조가 없는 분리된 ShadowRoot와 호스트는 명시적 destroy 없이도 수거된다.

## Last Updated

StyleManager의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
