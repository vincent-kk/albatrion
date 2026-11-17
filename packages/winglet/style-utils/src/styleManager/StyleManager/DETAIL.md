# StyleManager contract

## Requirements

- `StyleManager.get(scopeId, config?)`는 scopeId(및 Shadow DOM인 경우 `shadowRoot` 인스턴스)별로 유일한 인스턴스를 반환하는 정적 싱글톤 팩토리다.
- `add(id, css, compressed?)`는 CSS를 스코핑하고(Shadow DOM이면 스코핑 생략), `compressed`가 아니면 압축한 뒤, 이전에 저장된 동일 id의 처리 결과와 다를 때만 DOM 갱신을 예약한다.
- `remove(id)`는 저장된 스타일을 제거하고, 실제로 제거되었을 때만 DOM 갱신을 예약한다.
- DOM 갱신은 `requestAnimationFrame` 콜백 하나로 배치된다 — 같은 프레임 안의 여러 `add`/`remove` 호출은 DOM에 한 번만 반영된다.
- `destroy()`는 예약된 애니메이션 프레임을 취소하고, 적용된 시트 또는 엘리먼트를 제거하고, 내부 캐시를 비우고, 인스턴스를 레지스트리에서 제거한다.

## API Contracts

- `StyleManager.get(scopeId: string, config?: StyleManagerConfig): StyleManager` — Shadow DOM 대상은 `shadowRoot`별로 부여되는 내부 식별자와 scopeId를 조합한 키로 별도 인스턴스를 만든다.
- DOM 반영은 `CSSStyleSheet.prototype.replaceSync`와 `adoptedStyleSheets`를 모두 지원하는 환경에서는 그 경로를 쓰고, 아니면 scope 클래스가 붙은 `<style>` 엘리먼트에 `textContent`를 대입하는 방식으로 폴백한다. `replaceSync` 호출이 실패하면 예외를 던지지 않고 `console.warn`으로 기록한다.
- CSS 스코핑은 규칙 단위로 중괄호 깊이를 세어 블록 끝을 찾는다 — 첫 `}`에서 규칙을 끊으면 `@media` 같은 중첩 블록의 닫는 중괄호가 사라지고 뒤따르는 규칙이 그 블록 안으로 들어간다.
  - 일반 규칙은 선택자 목록의 최상위 쉼표(괄호·대괄호·따옴표 밖)마다 나눈 각 선택자에 `.<scopeId> ` 접두사를 붙인다. 정확히 `:root`이거나 `:host`인 선택자는 그대로 둔다. 첫 선택자에만 붙이면 나머지 선택자가 문서 전체로 샌다.
  - 규칙을 담는 그룹 at-rule(`@media`, `@supports`, `@container`, `@layer`, `@document`, `@starting-style`, 벤더 접두사 포함)은 조건부를 그대로 두고 블록 안 규칙을 같은 방식으로 재귀 스코핑한다. 안쪽 규칙이 스코프 밖으로 새지 않게 하기 위해서다.
  - 그 밖의 블록 at-rule(`@keyframes`, `@font-face`, `@page` 등)은 블록 전체를 그대로 복사한다 — `from`/`to` 같은 키프레임 선택자에 접두사가 붙으면 규칙이 무효가 된다.
  - `;`로 끝나는 문장형 at-rule(`@import`, `@charset`, `@layer a, b;` 등)은 그대로 복사한다.
  - 짝이 맞는 `}`가 없는 마지막 규칙은 버린다.
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
- Shadow DOM 대상에서는 스코프 접두사가 붙지 않는다.

### destroy-cleanup — 정리 계약

- `destroy()` 이후 같은 scopeId로 `get`을 호출하면 이전과 다른 새 인스턴스를 반환한다.
- `destroy()` 이후 문서(또는 shadowRoot)의 `adoptedStyleSheets`/`<style>` 흔적이 모두 제거된다.
- Shadow DOM 대상에서도 동일하게 정리된다.

## Last Updated

StyleManager의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
