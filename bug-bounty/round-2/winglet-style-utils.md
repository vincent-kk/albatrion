# @winglet/style-utils 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 2건입니다. 1라운드 문서([`../round-1/winglet-style-utils.md`](../round-1/winglet-style-utils.md))의 5건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-style-utils/`](probes/winglet-style-utils/)

- 실행하려면 파일을 `packages/winglet/style-utils/src/__bounty__/r2-common-utils/`에 복사한 뒤 `yarn workspace @winglet/style-utils test --run src/__bounty__/r2-common-utils/`를 실행합니다.
- `probes.test.ts`는 테스트 8개 중 2개, `shadowLeak.test.ts`는 2개 중 1개가 실패합니다. 통과하는 테스트는 대조군입니다.

원인 파일 위치: `packages/winglet/style-utils/src/styleManager/`

관련 항목: promise-modal 2라운드 문서 1번 항목은 promise-modal이 `shadowRoot` 설정 없이 `styleManagerFactory`를 호출하는 문제입니다. 아래 1번은 `shadowRoot` 설정을 넘겼을 때의 정리 문제이므로 서로 다릅니다.

## 1. Shadow DOM 스코프의 `StyleManager`를 공개 API로 해제할 수 없어, shadow 호스트마다 메모리가 새고 README 예제도 동작하지 않습니다

- 심각도: 높음에서 중간. 사용자 정의 엘리먼트 인스턴스 하나마다 shadow 호스트, 그 DOM 트리, 스타일시트가 회수되지 않습니다. 문서가 제시한 두 가지 정리 방법이 모두 동작하지 않습니다.
- 영향받는 공개 API: `styleManagerFactory(id, { shadowRoot })`, `destroyScope`.
- 어긋난 계약:
  - `docs/agents/skills/style-utils-skill/SKILL.md:32`, 44행과 `knowledge/style-manager.md:149`는 shadow 매니저가 호스트가 가비지 컬렉션될 때 해제된다고 적고 있습니다.
  - `README.md:321`의 Shadow DOM 예제는 `disconnectedCallback`에서 `destroyScope('custom-element')`를 호출하고, `README.md:111`은 이 호출이 모든 스타일을 제거한다고 설명합니다.
- 원인:
  - `StyleManager.ts:62`의 정적 `__SHEETS__ = new Map<string, StyleManager>()`가 매니저를 강하게 참조합니다. 매니저는 `__root__`(83행)로 shadowRoot를 붙잡고, shadowRoot는 다시 호스트를 붙잡습니다.
  - 레지스트리 항목을 지우는 코드는 `destroy()`뿐입니다. 그런데 `destroyScope`는 설정 없이 `StyleManager.get(scopeId)`를 호출하므로 문서 모드 키만 찾습니다. shadow 키(`scope:shadow:<id>`)에는 닿지 못하고, 매니저를 새로 하나 만든 뒤 바로 파괴하는 것으로 끝납니다.
- 1라운드와의 관계: 새로운 종류입니다. 문서 예제가 실제로 동작하지 않는다는 점에서 1라운드의 문서 불일치 항목들과도 관련됩니다.
- 재현:
  - `shadowLeak.test.ts`의 "a detached shadow host whose styles were all cleaned up is garbage-collected": 스타일을 모두 정리하고 DOM에서 떼어 낸 호스트가 `gc()` 뒤에도 `WeakRef`로 살아 있습니다. 같은 파일의 대조군(팩토리를 쓰지 않은 호스트)은 회수됩니다.
  - `probes.test.ts`의 "destroyScope removes the styles of a shadow-root scope, as the README Shadow DOM example relies on": `destroyScope` 뒤에도 shadowRoot 안에 `<style>`이 1개 남습니다. 기대값은 0개입니다.
- 확신도: 높음. 가비지 컬렉션 재현은 대조군이 통과하는 것으로 환경 문제가 아님을 확인했습니다.

## 2. `destroyScope` 이전에 만든 주입 함수를 계속 쓰면, 레지스트리 밖의 파괴된 매니저가 되살아나고 이후 `destroyScope`로 지울 수 없습니다

- 심각도: 낮음에서 중간. 스타일 엘리먼트가 영구히 남습니다. `@lerx/promise-modal`은 팩토리를 버린 뒤 다시 만들기 때문에 이 문제를 피합니다.
- 영향받는 공개 API: `styleManagerFactory`, `destroyScope`.
- 어긋난 계약:
  - `src/styleManager/DETAIL.md:7`은 두 함수가 스코프 생명주기 상태를 직접 갖지 않고, 모든 상태를 레지스트리가 소유한다고 적고 있습니다.
  - `knowledge/style-manager.md:108`은 한 번의 `destroyScope('x')`가 모든 스타일을 제거한다고 적고 있습니다.
- 원인: `styleManagerFactory.ts:63`이 매니저 인스턴스를 클로저에 붙잡아 둡니다. 파괴된 인스턴스에서도 `add()`가 동작해 새 `<style>`과 시트를 만들지만, 그 인스턴스는 이미 레지스트리에 없어서 `destroyScope`가 찾지 못합니다.
- 1라운드와의 관계: schema-form 1라운드 3번 항목(처음 받은 핸들을 붙잡고 나중에 바뀐 핸들을 따라가지 못하는 문제)과 같은 종류입니다.
- 재현: `probes.test.ts`의 "an injector created before destroyScope does not resurrect an unregistered manager that destroyScope cannot reach". `style.bounty-zombie`가 1개 남고, 기대값은 0개입니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- `compressCss`는 postcss로 원본과 결과를 파싱해 규칙 트리를 비교했을 때 다음 경우를 모두 보존합니다. 컨테이너 이름에 밑줄, 숫자, 한글이 들어가거나 숫자로 끝나는 경우, `@supports`, `@font-face`(따옴표 안 공백이 있는 `url`), 중첩된 `@media`, `!important`, 사용자 정의 속성, 결합자, `translate`와 `rotate` 함수, 범위 미디어 쿼리, `:nth-child(2n - 1)`, CSS 중첩.
- 공백만 있는 CSS를 `add`하면 이전 스타일이 남는 것, 모든 스타일을 지운 뒤 빈 시트가 붙어 있는 것, 대기 중인 flush 전에 스타일을 제거해도 흔적이 남지 않는 것은 문서대로의 동작입니다.
- 문자열 안의 공백과 세미콜론이 손상되는 경우는 1라운드 4번(스캐너가 문자열 구간을 추적하지 않음)과 원인이 같아 다시 조사하지 않았습니다. 문자열이나 주석 안의 `}`가 스코프 처리를 깨는 경우도 1라운드 1번과 원인이 같아 다시 조사하지 않았습니다.
