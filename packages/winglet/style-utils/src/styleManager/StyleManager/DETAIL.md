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
- CSS 스코핑은 `@`로 시작하는 규칙, `:root`, `:host` 선택자를 그대로 두고 그 외 선택자에는 `.<scopeId>` 접두사를 붙인다. Shadow DOM 대상에는 스코핑을 적용하지 않는다.

## Acceptance Criteria

### singleton-registry — scopeId·ShadowRoot별 싱글톤 계약

- 동일 scopeId로 `get`을 반복 호출하면 같은 인스턴스를 반환한다.
- 서로 다른 `shadowRoot`로 같은 scopeId를 호출하면 서로 다른 인스턴스를 반환한다.

### batched-dom-update — rAF 배치와 폴백 계약

- 한 프레임 안에서 여러 번 `add`를 호출해도 DOM 반영 함수는 정확히 1회만 실행된다.
- 동일한 처리 결과의 CSS를 다시 `add`해도 DOM 반영 함수가 호출되지 않는다.
- `CSSStyleSheet`/`adoptedStyleSheets`를 지원하는 환경에서는 시트로, 아니면 scope 클래스가 붙은 `<style>` 엘리먼트로 반영된다.

### css-scoping — 선택자 스코핑 규칙

- 일반 선택자에는 `.<scopeId>` 접두사가 붙고, `@media`·`:root` 규칙은 접두사 없이 유지된다.
- Shadow DOM 대상에서는 스코프 접두사가 붙지 않는다.

### destroy-cleanup — 정리 계약

- `destroy()` 이후 같은 scopeId로 `get`을 호출하면 이전과 다른 새 인스턴스를 반환한다.
- `destroy()` 이후 문서(또는 shadowRoot)의 `adoptedStyleSheets`/`<style>` 흔적이 모두 제거된다.
- Shadow DOM 대상에서도 동일하게 정리된다.

## Last Updated

2026-08-18 — 최초 계약 작성. #329 문서화 작업으로 신설.
