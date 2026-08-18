# StyleManager — 스코프 CSS 싱글톤 엔진

## Purpose

scopeId(및 선택적 `shadowRoot`)별 싱글톤 인스턴스로 CSS 선택자 스코핑, `requestAnimationFrame` 배치 DOM 반영, `adoptedStyleSheets`/`<style>` 폴백 적용, 전체 정리(`destroy`)를 소유한다. CSS 압축은 소유하지 않고 `compressCss`에 위임한다.

## Conventions

- `@`로 시작하는 규칙과 `:root`, `:host` 선택자는 스코프 접두사를 붙이지 않는다 — 그 외 모든 선택자는 `.<scopeId>` 클래스 접두사를 받는다.
- Shadow DOM 스코프(`config.shadowRoot`)는 스코핑을 건너뛰고 원본 선택자를 그대로 쓴다.

## Boundaries

### Always do

- DOM 반영은 `requestAnimationFrame` 한 번으로 배치한다 — `add`/`remove` 호출마다 즉시 DOM을 갱신하지 않는다
- `destroy()`는 예약된 프레임 취소, 시트/엘리먼트 제거, 캐시 초기화, 레지스트리 제거를 모두 수행한다

### Ask first

- 싱글톤 키 구성(scopeId, Shadow DOM 인스턴스 키) 변경
- `adoptedStyleSheets`/`<style>` 폴백 판단 조건 변경

### Never do

- 동일 처리 결과 CSS를 재적용해 불필요한 DOM 갱신을 유발하는 경로 추가
- `destroy()` 이후에도 레지스트리나 DOM에 해당 scope의 흔적을 남기는 변경
