# 3라운드 버그 바운티 수정 기록

3라운드에서 확인된 106건(16개 패키지, 서로 다른 결함 92건)의 처리 결과입니다. 84건은 코드를 고쳤고, 21건은 코드의 동작을 그대로 두고 문서만 고쳤으며, 1건(`@winglet/common-utils` 6번)은 원인이 공용 빌드 스크립트에 있어 별도 풀 리퀘스트([#651](https://github.com/vincent-kk/albatrion/pull/651))로 고쳤습니다. `@winglet/common-utils` 7번은 여섯 winglet 패키지의 게시 manifest를 이 라운드에서 고쳤고, 나머지 패키지의 게시 `exports`는 같은 풀 리퀘스트에서 고쳤습니다. 결함이 아니라고 판정한 항목은 없습니다. 수정은 [`../FIX-PROCEDURE.md`](../FIX-PROCEDURE.md)의 네 작업 단위로 진행했습니다. `@lerx/promise-modal`과 `@slats/agents-assets-sync`([#647](https://github.com/vincent-kk/albatrion/pull/647))가 먼저 리베이스 병합되었고 병합 뒤 브랜치 끝은 `782dc4fe3`입니다. 플러그인 묶음([#649](https://github.com/vincent-kk/albatrion/pull/649))은 `@canard/schema-form`의 브랜치에 먼저 합쳐졌고, 그 브랜치가 [#648](https://github.com/vincent-kk/albatrion/pull/648)로 병합되어 브랜치 끝은 `1346f8dd1`입니다. 유틸리티 묶음은 [#650](https://github.com/vincent-kk/albatrion/pull/650), 공용 빌드 작업은 [#651](https://github.com/vincent-kk/albatrion/pull/651)입니다. #650은 #648처럼 fast-forward로, #651은 리베이스로 병합되었고 수정이 끝난 브랜치 끝은 `c43d997aa`입니다.

이 문서는 커밋 해시 대신 풀 리퀘스트를 적습니다. 항목별 실패하는 테스트 커밋과 수정 커밋은 각 풀 리퀘스트의 커밋 목록에서 `round-3 <패키지> <번호>` 표기로 찾습니다. 용어(실패하는 테스트 커밋, 속도 조건, 형제 결함, 신규 결함 분류 등)는 `FIX-PROCEDURE.md`를 따릅니다.

구현은 네 묶음 모두 Codex의 sol 모델이 맡았습니다. 독립 검토와 속도 재측정은 묶음마다 Cursor Grok이 한 번씩 했고, 계획 검토는 Gemini Hydrogen이 했습니다. 플러그인의 식별자 커밋은 검증 subagent가 세 번 나눠 읽었습니다. 구현자의 측정값과 검토자의 측정값이 다르면 이 문서는 검토자의 값을 쓰고 구현자의 값은 따로 밝혀 적습니다.

소유자가 보류했던 일곱 항목(`@canard/schema-form` 9, 11, 13, 15번, `@lerx/promise-modal` 2번, `@winglet/react-utils` 2번, `@winglet/common-utils` 2번)은 Vincent가 지휘 세션에 결정을 위임했습니다. Vincent가 정한 수용 기준은 "표준성과 합리성을 준수하고, 속도 검증도 충분하다면 수용한다"이며, 지휘 세션의 모든 동작 결정은 스펙표에 세 근거(따르는 표준이나 문서화된 계약, 예측 가능한 동작인 이유, 속도 검증)를 적었습니다. Vincent는 통합 풀 리퀘스트 [#646](https://github.com/vincent-kk/albatrion/pull/646)에서 어느 결정이든 뒤집을 수 있습니다.

## 패키지별 결과

상태의 뜻은 다음과 같습니다. "수정"은 실패하는 테스트로 재현한 뒤 코드를 고친 항목입니다. "문서 수정"은 코드의 동작을 그대로 두고 문서를 코드에 맞춘 항목입니다. "결정"이 붙은 항목은 지휘 세션이 결정 규칙으로 동작을 정한 항목이고, "호환성 깨짐"은 major changeset으로 기록한 항목입니다. "별도 작업(공용 빌드)"은 작업 단위 밖의 공용 빌드 스크립트를 고쳐야 하는 항목입니다. "추가 수정"은 3라운드 문서에 번호가 없지만 같은 종류의 형제로 확인하여 함께 고친 결함입니다.

분류 칸은 앞 라운드가 고친 코드나 동작에 다시 들어온 항목을 `FIX-PROCEDURE.md`의 세 분류로 적습니다. "새 결함(새 입력)"은 앞 라운드의 수정이 그 입력이나 경로를 빠뜨렸고 그 수정의 계약은 그대로인 경우입니다. "무관"은 앞 라운드의 수정에 닿지 않는 항목입니다. 수정이 만든 회귀나 진동으로 분류한 항목은 없습니다.

### 유틸리티 묶음

풀 리퀘스트: [#650](https://github.com/vincent-kk/albatrion/pull/650). 브랜치는 `1346f8dd1` 위로 리베이스되었습니다. 독립 검토는 런타임 결함을 찾지 않았고, 두 changeset(`trackable-async-hooks`, `committed-callback-handlers`)을 major로 바꾸라고 요구했으며, 이 요구와 소유자가 요청한 `applyPatch` 루트 비용 제거를 같은 풀 리퀘스트에 반영한 뒤 재검토가 통과했습니다. 리베이스 뒤의 전체 테스트는 `@winglet/common-utils` 1,314건 통과와 2라운드의 `it.fails` 2건, `@winglet/json` 681건, `@winglet/data-loader` 82건, `@winglet/style-utils` 195건 통과와 2라운드의 `it.fails` 2건, `@winglet/react-utils` 224건, `@winglet/json-schema` 832건, React 18 호환 51건이며, 영향 범위 검사 계획 전체가 통과했습니다.

#### @winglet/common-utils

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정 | 무관 | `throttle`이 `clear()` 뒤와 창 경계에서 호출 창을 다시 세우고, `leading: false`에서 마지막 호출을 trailing으로 실행합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 2 | 수정(결정, 호환성 깨짐) | 새 결함(새 입력: 2라운드 2번, 5번) | `getTrackableHandler`가 thenable을 반환한 `beforeExecute`와 `afterExecute`를 기다리고, 그 거절을 호출의 거절로 전달합니다. 동기 hook은 같은 tick에 끝납니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 3 | 수정 | 새 결함(새 입력: 2라운드의 콜백 오류 종류) | `onTaskError`가 예외를 던져도 실패한 작업을 다시 실행하지 않고 나머지 작업을 진행하며, handler의 오류를 호스트에 보고합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 4 | 수정(결정, 호환성 깨짐) | 무관 | `MessageChannelScheduler`의 작업 오류가 사라지지 않습니다. 사용자 `onTaskError`가 있으면 그 handler만 받고, 없으면 호스트에 보고합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 5 | 수정 | 새 결함(새 입력: 2라운드의 다른 realm 범위) | `clone`이 다른 realm의 Map, Set, Date, RegExp, ArrayBuffer와 지원하는 내장값을 같은 프로필로 복사합니다. 태그만 위조한 객체에는 생성자를 부르지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 6 | 수정(공용 빌드) | 무관 | 공용 빌드 스크립트가 CommonJS 소비자용 선언 그래프(`.d.cts`)를 만들고, 내보내기 설정이 `import`와 `require` 분기마다 `types`를 따로 가리킵니다. Node16, NodeNext, Bundler 해석에서 `.cts`와 `.mts` 소비자가 모두 컴파일됩니다. | [#651](https://github.com/vincent-kk/albatrion/pull/651) |
| 7 | 수정 | 무관 | 여섯 winglet 패키지의 `publishConfig.exports`에서 게시하지 않는 `./src/index.ts`를 가리키는 `source` 조건을 뺐습니다. 나머지 패키지와 `@slats/agents-assets-sync`의 게시 `exports`는 [#651](https://github.com/vincent-kk/albatrion/pull/651)에서 같은 방식으로 고쳤습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 8 | 수정(타입만) | 새 결함(새 입력: 2라운드 9번의 형제) | `isFile`, `isBlob`, `delay`, rate-limit 옵션의 선언이 전역 `File`, `Blob`, `AbortSignal`을 직접 요구하지 않으므로 DOM 타입이 없는 소비자의 `skipLibCheck: false` 검사가 통과합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 9 | 문서 수정 | 무관 | 패키지 지식 문서가 오류를 던지는 숫자 API(`combination`, `permutation`, `digitSum`, `toBase`, `fromBase` 등)와 sentinel 값을 반환하는 API를 구분합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 10 | 수정(결정) | 새 결함(새 입력: 2라운드 2번) | 완료 알림의 구독자가 예외를 던져도 다른 구독자가 모두 알림을 받고, 호출 결과는 바뀌지 않으며, 그 오류는 호스트에 보고됩니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 11 | 수정 | 새 결함(새 입력: 1라운드 3번) | `withTimeout`이 이미 중단된 신호를 받으면 `fn`을 부르지 않고 AbortError로 거절합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 12 | 수정 | 무관 | 2^31-1 밀리초를 넘는 유한 대기는 여러 구간으로 나눠 기다리고, `Infinity`는 취소될 때까지 기다립니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 13 | 수정 | 새 결함(새 입력: 2라운드 7번 realm 종류의 형제) | `createSafeFingerprint`가 다른 realm의 plain object, Date, RegExp를 참조가 아니라 내용으로 키를 만듭니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 14 | 수정 | 새 결함(새 입력: 다른 realm 형제) | `Murmur3`가 다른 realm의 `Uint8Array`와 `ArrayBuffer`를 로컬 바이트 뷰로 바꿔 해시합니다. 2라운드 3번의 OR 결합 결정은 그대로입니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 15 | 수정 | 새 결함(새 입력: 2번과 같은 함수) | hook을 부르기 전에 실행 상태를 잡으므로, `beforeExecute` 안에서 한 호출이 `preventConcurrent`를 우회하여 원 함수를 동시에 실행하지 못합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |

함께 고친 형제 범위: 2번, 10번, 15번은 각 hook 위치의 동기 반환, 동기 예외, resolve, reject, 끝나지 않는 Promise와 thenable, 대기 전후의 `pending`, 연속 호출과 재진입을 비교합니다. 5번은 `node:vm`에서 만든 값으로 기존 clone 프로필 전체(컬렉션 순환, 배열 자기 키, offset이 있는 view, SharedArrayBuffer, Error의 `cause`와 AggregateError, 위조 태그)를 비교합니다. 4번은 브라우저 wrapper를 먼저 쓰는 순서와 singleton을 먼저 쓰는 순서를 handler 유무별로 비교하고, 호스트 보고가 정확히 한 번이며 native timer 대체 경로가 같은 scheduler로 재귀하지 않음을 확인합니다. 12번은 `delay`, `timeout`, `withTimeout`과 같은 타이머를 쓰는 debounce와 throttle을 포함합니다. hook이 없는 `getTrackableHandler` 경로의 속도 이득은 별도 성능 커밋입니다.

#### @winglet/json

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정(결정) | 새 결함(새 입력: 2라운드 1번) | 기본 immutable 모드에서 루트 `add`, `replace`, `move`가 넣은 값을 소유하지 않은 것으로 기록하고, 같은 패치의 뒤 연산이 그 문서에 쓰기 직전에만 한 단계 복사합니다. 뒤의 쓰기가 호출자의 값과 원본 문서를 바꾸지 않습니다. 루트 `copy`의 빈 `from`은 현재 루트를 직접 읽어 primitive 루트도 지원합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 2 | 문서 수정 | 새 결함(새 입력: 1라운드 7번의 문서 형제) | 서로 어긋난 다섯 예제(`setValue`의 변경 감지, 없는 포인터와 잘못된 포인터, `applyPatch` 입력, primitive의 `getJSONPath`, JSONPath 글자 토큰)를 공개 API에 맞췄습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |

함께 고친 형제 범위: 1번은 모든 루트 연산과 깊이 1 연산, 두 모드, 객체, 배열, null, 불리언, 숫자, 문자열 루트, 루트 `from`, deep-freeze한 입력, 원본과 값의 별칭, 더 깊은 뒤 쓰기, 실패한 묶음과 재사용을 비교합니다. primitive 루트의 `copy`는 지휘 세션이 같은 종류로 승인한 형제입니다.

#### @winglet/data-loader

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정 | 새 결함(새 입력: 1라운드 1번) | 사용자 `batchScheduler`를 loader의 메서드가 아니라 독립 콜백으로 부르므로, 브라우저에서 `queueMicrotask`, `setTimeout`, `requestAnimationFrame`을 그대로 넘겨도 첫 `load`가 예외를 던지지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 2 | 수정(결정) | 새 결함(새 입력: 1라운드 1번) | `batchScheduler`가 한 번 동기 예외를 던진 뒤에도 다음 `load`가 진행됩니다. 물러난 묶음은 새 묶음의 캐시를 지우지 않고, 원 함수에 넘긴 `keys`와 이미 정착한 Promise는 바뀌지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 3 | 문서 수정 | 무관 | 키별 `Error`가 캐시에 남으므로 일시적 실패를 다시 시도하려면 `clear(key)`가 필요하다고 적었습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 4 | 문서 수정 | 무관 | TTL 캐시 예제의 `cacheMap`을 `cache`로 고치고, 단일 질의 예제가 `load`를 함께 예약한 뒤 `Promise.all`을 기다리게 고쳤습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |

함께 고친 형제 범위: 2번의 물러난 묶음 형제는 작업 실행 전후의 scheduler 예외, 원 함수의 늦은 resolve와 reject, 같은 키와 다른 키의 새 묶음을 조합한 여덟 동등성 사례로 고정했습니다.

#### @winglet/style-utils

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정(결정) | 새 결함(새 입력: 1라운드 4번) | `compressCss`와 스코퍼가 따옴표 밖의 escape, 1자리에서 6자리의 hex escape와 그 공백 종결자(CRLF 포함), escape된 URL 이름을 한 토큰으로 읽어 뒤의 문자열과 규칙을 보존합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 2 | 수정 | 무관 | 여러 스타일 식별자의 CSS를 DOM에 합쳐 쓸 때만 마지막 statement at-rule의 빠진 세미콜론을 보충하므로, 다음 식별자의 CSS가 그 at-rule에 붙지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 3 | 수정 | 새 결함(새 입력: 1라운드 2번) | 선택자 목록의 빈 항목(끝 쉼표나 주석만 남은 항목)에 스코프 클래스를 붙이지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 4 | 수정 | 무관 | 닫히지 않은 문자열을 escape되지 않은 LF, CR, FF에서 끝내고 다음 규칙을 계속 읽습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 5 | 수정 | 무관 | 대소문자, 주변 주석, 식별자 escape를 해석하여 단일 토큰인 `:root`와 `:host`만 전역으로 남깁니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 6 | 수정 | 무관 | 선택자 끝의 escape된 공백을 토큰의 일부로 보존합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 7 | 수정 | 무관 | 주석이 두 토큰 사이의 유일한 경계이면 빈 주석을 남기므로 `1px/**/2px`가 `1px2px`가 되지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 8 | 문서 수정 | 새 결함(새 입력: 2라운드 1번의 문서) | 명세와 패키지 지식 문서를 `destroyScope(id, { shadowRoot })`와 ShadowRoot별 레지스트리에 맞췄습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |

#### @winglet/react-utils

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정 | 새 결함(새 입력: 2라운드 1번) | `Portal.with` 범위나 `Portal.Anchor`가 `<Activity mode="hidden">` 또는 다시 suspend한 Suspense로 숨겨져도 포털 내용의 상태가 유지됩니다. 실제 삭제만 현재 앵커를 해제합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 2 | 수정(결정, 호환성 깨짐) | 무관 | `useHandle`과 `useOnUnmount` 같은 hook이 콜백 참조를 commit 단계에서만 공개하므로, 대기 중인 transition의 커밋되지 않은 render 값을 읽지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 3 | 수정 | 무관 | unmount 뒤에 부른 `useTimeout`의 `schedule()`은 타이머를 만들지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 4 | 문서 수정 | 무관 | 기본 `useDebounce`가 연속 변경에서 leading과 trailing 양쪽에서 실행된다고 문서를 고쳤습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 5 | 수정 | 새 결함(새 입력: 2라운드 2번) | `withUploader` 클릭 한 번에 조상의 `onClickCapture`와 document 캡처 리스너가 한 번만 실행됩니다. 같은 파일 입력을 잠시 분리한 채 클릭하고 즉시 원래 위치로 돌려놓습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 6 | 문서 수정 | 새 결함(새 입력: 2라운드 5번의 문서) | 패키지 스킬의 React peer 범위를 manifest와 같은 `>=16.14 <20`으로 맞췄습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |

그 밖의 커밋: `useTimeout`과 `useVersion`의 중복 저장소를 합친 성능 커밋과, `useVersion`의 비공개 `Fn` 타입이 선언에 드러나던 것을 구조 타입으로 고친 선언 커밋이 있습니다.

#### @winglet/json-schema

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정 | 새 결함(새 입력: 1라운드 1번) | `duplicate-identifier`로 실패한 문서가 등록한 자원과 앵커만 실패 경로에서 버리므로, 같은 resolver의 다음 조회가 그 문서를 오류 없이 인라인하지 않습니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 2 | 수정 | 무관 | `isIdenticalSchemaType`이 타입 표기가 같아도 `nullable`을 비교합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |
| 3 | 수정 | 새 결함(새 입력: 1라운드 4번의 철자 형제) | `$schema` URI의 scheme과 host는 대소문자를 구분하지 않고 인식하며, 나머지 부분은 구분합니다. | [#650](https://github.com/vincent-kk/albatrion/pull/650) |

### @lerx/promise-modal과 @slats/agents-assets-sync

풀 리퀘스트: [#647](https://github.com/vincent-kk/albatrion/pull/647). 독립 검토는 요구 사항 없이 통과했습니다. 검사 결과는 `@slats/agents-assets-sync` 367건, `@lerx/promise-modal` 362건, React 18 352건(Activity 전용 10건 건너뜀), 프로덕션 180건이 통과했고 영향 범위 검사 33단계가 통과했습니다. changeset 19개는 모두 patch입니다.

#### @slats/agents-assets-sync

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정 | 새 결함(새 입력: 1라운드의 공유 문서 보호) | `AGENTS.md`를 UTF-8 문자열이 아니라 바이트로 다시 쓰므로, 관리 블록 밖의 유효하지 않은 UTF-8 바이트가 U+FFFD로 바뀌지 않습니다. | #647 |
| 2 | 수정 | 새 결함(새 입력: 2라운드 3번) | 터미널(Ink) 출력도 계획이 실패한 단위를 보고하고 집계하므로, 종료 코드가 일반 출력, `--json`과 같습니다. | #647 |
| 3 | 수정 | 새 결함(새 입력: 앞 라운드의 터미널 경로) | 터미널에서도 `--asset`, `--agent`, `--scope` 값을 검증하여 잘못된 값은 종료 코드 2로 끝납니다. | #647 |
| 4 | 수정 | 무관 | 같은 디렉터리의 임시 파일을 완성한 뒤 이름을 바꾸므로, 실패하거나 중단된 다시 쓰기가 `AGENTS.md`를 잘라 두지 않습니다. | #647 |
| 5 | 수정(결정) | 무관 | 빌드된 manifest가 원본보다 오래되었으면, 실행이 건드리는 항목만 실제 원본 파일의 해시로 맞추고 세 출력 모두에 알립니다. | #647 |
| 6 | 수정 | 새 결함(새 입력: 1라운드의 터미널과 `--force` 경로) | 터미널에서 `--force`가 필요한 실행은 종료 코드 2로 끝나고, 막히지 않은 다른 단위는 적용됩니다. | #647 |
| 7 | 수정 | 새 결함(새 입력: 1라운드 1번, 5번) | 점으로 시작하는 이름의 제한을 스킬 디렉터리에만 적용하므로 `rules/.gitkeep`과 `commands/.gitkeep`이 패키지 전체를 막지 않습니다. | #647 |
| 8 | 수정 | 새 결함(새 입력: 2라운드 1번의 보고) | `--force`로 실제로 덮어쓴 파일을 "updated"로 보고합니다. | #647 |
| 9 | 수정 | 무관 | 터미널 `--force` 대화상자를 Ctrl-C로 취소해도 종료 코드 2입니다. | #647 |
| 10 | 수정 | 무관 | 대화상자의 y, n, Esc 키가 동작하고, 구현되지 않은 키 안내를 footer에서 지웠습니다. | #647 |
| 11 | 문서 수정 | 무관 | README의 Programmatic API 예제가 실제로 export된 이름만 가져옵니다. | #647 |
| 12 | 수정 | 새 결함(새 입력: 2라운드 5번) | `agents-build-hashes`가 UTF-8 BOM으로 시작하는 `package.json`을 읽습니다. | #647 |
| 13 | 수정 | 새 결함(새 입력: 2라운드의 scope 메타데이터와 BOM 경로) | scope 별칭 실행이 잘린 `package.json`을 가진 구성원의 사유를 알리고 정상 구성원은 계속 처리합니다. | #647 |
| 14 | 문서 수정 | 무관 | 세 소비자 문서가 프로젝트 루트를 root 표식 우선, 그다음 에이전트 앵커 순서로 찾는다고 적고, smoke test 준비를 이에 맞췄습니다. | #647 |

함께 고친 형제 범위: `surfaceEquivalence.test.tsx`(결과, `--force`, `--dry-run` 18행과 flag 4행)와 `publicSurfaceEquivalence.test.tsx`(실제 `runCli`로 알 수 없는 패키지, 잘린 scope 구성원, 중단된 다시 쓰기, 강제 갱신)가 일반, JSON, 터미널 세 출력의 종료 코드, 보고 단위, 실제 파일 결과를 비교합니다.

#### @lerx/promise-modal

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정 | 무관(2라운드 5번 결정 유지) | 모달 내용이 Provider를 감싼 Suspense 아래에서 suspend해도 요청 안의 Suspense가 대기를 받으므로, 끝없는 갱신 루프로 root 전체가 unmount되지 않습니다. | #647 |
| 2 | 수정(결정) | 새 결함(2라운드 5번 결정에 인접) | Provider만 숨겨지면 밖의 호출자 요청을 취소하지 않고, 다시 보일 때 대기 상태로 돌아옵니다. 함께 숨겨진 호출자는 자기 요청만 취소하고, 실제 unmount는 이전처럼 취소하거나 넘깁니다. | #647 |
| 3 | 수정(결정) | 새 결함(새 입력: 1라운드 5번) | Escape 한 번은 누르기 시작한 시점의 후보 하나만 닫으므로, 같은 키 처리 중에 열린 모달은 그 Escape로 닫히지 않습니다. | #647 |
| 4 | 수정 | 새 결함(새 입력: 1라운드 8번, 2라운드 1번과 3번) | 하나의 AbortSignal이 중첩된 dimmed 모달 둘을 함께 취소해도 포커스가 스택을 연 페이지 컨트롤로 돌아옵니다. | #647 |
| 5 | 수정(결정) | 새 결함(새 입력: 2라운드 2번) | 경로 변경으로 숨겨진 동안 정착한 `manualDestroy` 모달이 새 경로에서 종료 애니메이션으로 다시 보이지 않습니다. 노드가 최초 정착 시점의 표시 여부를 기록합니다. | #647 |
| 6 | 수정 | 새 결함(새 입력: 2라운드 1번) | 모달 루트가 웹 컴포넌트 호스트의 slot으로 렌더되는 light DOM 자식이어도, 그 호스트의 shadow tree 안 컨트롤이 dimmed 모달 뒤에서 inert가 됩니다. | #647 |
| 7 | 문서 수정 | 무관 | `useInitializeModal` JSDoc 예제가 Footer 함수를 바깥 범위에 두어 개발 경고를 내지 않습니다. | #647 |

### @canard/schema-form

풀 리퀘스트: [#648](https://github.com/vincent-kk/albatrion/pull/648). 독립 검토는 요구 사항 없이 통과했습니다. 라디오 이름 후속 수정 뒤의 검사 결과는 단위, 렌더, React 18 테스트 8,583건이고, 그 전의 같은 소스에서 verify 6,736건, Storybook 278건, 프로덕션 28건이 통과했습니다. changeset 15개는 major 3개, minor 1개, patch 11개입니다.

| 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|
| 1 | 수정(결정, 호환성 깨짐) | 새 결함(2라운드 10번의 계약을 결정으로 넓힘) | Form마다 `useId` 하나를 두고 입력에 `FieldInputProps.id`(scope + ":" + 실제 경로)를 DOM id로 넘깁니다. `Form.Label`의 `htmlFor`와 label id, 내장 입력의 id와 ARIA 연결이 이 id를 씁니다. `path`는 JSON Pointer 그대로입니다. | #648 |
| 2 | 수정 | 무관 | 포털로 다른 Form 안에 렌더한 Form의 제출이 자기 form 경계에서 멈추므로, 바깥 Form이 오래된 값으로 함께 제출되지 않습니다. | #648 |
| 3 | 수정 | 새 결함(새 입력: 2라운드 2번) | `active` 조건만 가진 재사용 `$defs` 템플릿을 의존 별칭으로 분류하고 발생 위치마다 소유자와 경로를 색인하므로, 둘째 이후 위치의 `active`가 반응합니다. | #648 |
| 4 | 수정 | 새 결함(새 입력: 2라운드 2번) | 살아 있는 자식만 소유하던 가정을 없애 꺼진 자식 gate와 context 소유자도 색인하므로, 둘째 이후 위치에서 꺼진 필드가 다시 켜집니다. | #648 |
| 5 | 수정(결정) | 새 결함(새 입력: 앞 라운드의 비활성 값 보존 수정) | `batch`와 `visitSubtree` 안에서 중첩 객체 Merge를 다른 쓰기와 합쳐도 Merge가 생략한 키를 지우지 않습니다. 순차 Merge와 결과가 같습니다. | #648 |
| 6 | 수정(결정, 호환성 깨짐) | 무관(1번과 같은 종류) | 라디오 그룹의 native `name`이 scoped id이므로, 마지막 경로 이름이 같은 라디오가 한 Form 안에서도, 다른 Form 사이에서도 별개의 그룹입니다. `FieldInputProps.name`은 항상 말단 이름입니다. | #648 |
| 7 | 수정(결정, 호환성 깨짐) | 무관 | Form과 FormProvider의 `context`를 패키지 안의 스냅숏으로 비교합니다. plain 객체와 지원하는 내장값은 내용으로, `URL`, `URLSearchParams`, 내용을 볼 수 없는 클래스 인스턴스는 참조로 비교합니다. | #648 |
| 8 | 문서 수정(결정으로 동작 유지) | 무관 | 컬렉션 조건 예제가 optional chaining으로 빈 배열을 다루고, 표현식 실패 뒤의 degraded 상태가 `load`나 `reset`까지 남는다고(ERROR-011) 설명합니다. | #648 |
| 9 | 수정(결정, 호환성 깨짐) | 무관 | `batch` 안의 배열 동사가 순차 호출과 같은 항목 신원을 유지합니다. 동사 전에 표시된 쓰기를 정착하고 배열을 즉시 배치하며, 구독자와 `onChange` 전달은 batch 끝에 한 번입니다. | #648 |
| 10 | 수정 | 무관 | batch 안의 `resetSubtree`가 앞에 표시된 조상 쓰기를 먼저 정착하므로 batch 끝에 되돌려지지 않습니다. | #648 |
| 11 | 문서 수정(결정으로 동작 유지) | 무관 | 일괄 갱신 예제가 `items` 노드에 직접 쓰고, 부모 Overwrite는 비활성 가지의 보존 값을 지우며 Merge나 직접 쓰기는 보존한다고 적었습니다. | #648 |
| 12 | 수정(결정) | 새 결함(새 입력: IR-6 규칙의 범위) | 검증 입력을 출력과 context로 보므로, 검증기가 같은 값을 다시 써도 진행 중인 판정을 받아들이고 pending을 풉니다. | #648 |
| 13 | 수정(결정, 새 공개 API) | 새 결함(2라운드 7번 결정 위에 더함) | `registerPlugin(plugin, { scope })`와 `FormProvider`의 `pluginScope`로 애플리케이션이 고른 범위의 레지스트리를 씁니다. scope가 없으면 2라운드의 realm 공유 레지스트리 그대로입니다. | #648 |
| 14 | 문서 수정(결정으로 동작 유지) | 무관 | `FormLabel` JSDoc 예제가 `type` prop 대신 스키마의 `format: password`를 씁니다. | #648 |
| 15 | 수정(결정) | 무관 | 내장 `$id` 자원 안의 `#/$defs/X`를 그 자원의 기준 URI로 풀어, 폼과 검증기가 같은 스키마를 씁니다. | #648 |
| 16 | 수정 | 무관 | `subscribe`가 반환한 정리 함수를 두 번 불러도 나중에 등록한 구독자가 지워지지 않습니다. | #648 |
| 17 | 수정 | 무관 | 한 노드의 검증 issue를 소유한 배열에 덧붙이므로 경로 배정 시간이 issue 수의 제곱으로 늘지 않습니다. | #648 |
| 추가 수정 | 수정 | 새 결함(새 입력: 3번, 4번의 형제) | `controls.fields`나 `oneOf`, `anyOf` 가지 아래에서 `@context`를 읽는 자식 gate가 false에서 true로 바뀔 때 다시 만들어집니다. 인라인 스키마에도 있던 결함이며 3번, 4번과 같은 커밋입니다. | #648 |

함께 고친 형제 범위: 3번과 4번은 `active`, `visible`, `readOnly`, `disabled`, 파생 값을 첫째, 둘째, 셋째 발생에서 인라인 스키마와 비교하고, 상대와 절대와 context 의존, 직접 속성과 `controls.fields`와 `oneOf`, `anyOf`, 중첩과 유한 재귀 템플릿, 배열 삽입과 이동과 제거, 호스트 퇴장과 재진입, `reset`과 `resetSubtree`, 두 호스트를 반대로 바꾸는 batch를 포함합니다. 9번은 모든 공개 배열 동사, 항목 쓰기와 오류와 상호작용, 중첩 batch, `visitSubtree`, 예외를 던지는 콜백, 닫힌 호스트를 포함합니다. 검증기 계약 문서(`validation.mdx` 영어와 한국어)에는 매 실행마다 다른 값을 쓰는 검증기가 끝나지 않는다는 문장을 더했습니다.

### 플러그인 묶음

풀 리퀘스트: [#649](https://github.com/vincent-kk/albatrion/pull/649)(`@canard/schema-form` 브랜치에 합쳐진 뒤 #648로 병합). 독립 검토는 형제 결함 하나(동적 앵커 표)를 요구했고 그 수정은 지휘 세션이 차이를 읽어 확인했습니다. 코어 식별자 계약을 소비하는 커밋은 검증 subagent가 세 번 읽었고 마지막 읽기에서 통과했습니다. 최종 테스트는 ajv6 244건, ajv7 302건, ajv8 620건, antd5 239건, antd6 236건, mui 212건, antd-mobile 161건으로 모두 통과했고 영향 범위 검사 34단계가 통과했습니다. changeset은 35개(major 4개, patch 31개)입니다.

| 패키지 | 항목 | 상태 | 분류 | 바뀐 것 | 풀 리퀘스트 |
|---|---|---|---|---|---|
| ajv6 | 1 | 수정 | 무관 | 다른 설치 사본의 같은 AJV 6 release가 던진 ValidationError도 `instanceof` 대신 오류의 표지로 인식하여 issue로 반환합니다. 관계없는 예외는 그대로 던집니다. | #649 |
| ajv6 | 2 | 수정 | 새 결함(새 입력: 앞 라운드의 정적 키 변환이 다루지 않은 동적 키) | compile과 `getSchema` 동안에만 `jsonPointers`를 켜고 소비자의 옵션을 복원하므로, 따옴표나 backslash가 든 동적 키의 issue가 올바른 JSON Pointer를 받습니다. | #649 |
| ajv6 | 3 | 문서 수정 | 무관 | README가 기본 Draft-07과, 사용자 인스턴스에 이전 draft의 메타 스키마를 등록하는 방법을 구분합니다. | #649 |
| ajv7 | 1 | 수정 | 무관 | 복제 시점의 레지스트리 사본 대신 원래 인스턴스의 살아 있는 `formats`와 `RULES`를 참조하므로, 앞선 compile 뒤에 더한 format과 keyword가 64개를 넘는 루트에도 적용됩니다. | #649 |
| ajv7 | 2 | 문서 수정 | 무관 | README가 Draft-06은 사용자 인스턴스에 메타 스키마를 등록해야 한다고 적습니다. | #649 |
| ajv8 | 1 | 수정 | 무관 | ajv7 1번과 같은 수정입니다. | #649 |
| ajv8 | 2 | 문서 수정 | 무관 | README가 기본 Draft-07과 별도 2019, 2020 진입점의 범위를 적고 Draft-04, Draft-06의 무조건 지원 주장을 지웠습니다. | #649 |
| ajv8 | 3 | 문서 수정 | 무관 | migration 예제가 사용자 인스턴스에 `addFormats`를 호출합니다. | #649 |
| antd5 | 1 | 수정(결정) | 무관 | URI 입력이 표시할 scheme을 저장된 값의 파싱 결과로 정하므로, Activity로 숨겼다가 보인 뒤에도 마운트 때의 scheme으로 돌아가지 않습니다. | #649 |
| antd5 | 2 | 수정(결정) | 새 결함(새 입력: 1라운드 antd5 4번) | RFC 3986의 유효한 scheme 접두사를 모두 그대로 보존하므로 `sms:`, `urn:`, `geo:` 같은 한 콜론 scheme에 `http://`를 붙이지 않습니다. | #649 |
| antd5 | 3 | 수정 | 무관 | enum alias를 자기 키에서만 읽으므로 `constructor`, `toString`, `valueOf`, `__proto__` 값이 일반 값과 같은 label을 받습니다. | #649 |
| antd5 | 4 | 수정 | 무관 | 다중 선택 검색이 표시 label과 원래 값을 대소문자 구분 없이 찾습니다. | #649 |
| antd5 | 5 | 문서 수정 | 무관 | README가 textarea의 `minRows`, `maxRows`를 스키마 수준 설정으로 적습니다. | #649 |
| antd6 | 1 | 수정(결정) | 무관 | antd5 1번과 같은 수정입니다. | #649 |
| antd6 | 2 | 수정(결정) | 새 결함(새 입력: 1라운드 antd6 4번) | antd5 2번과 같은 수정입니다. | #649 |
| antd6 | 3 | 수정 | 무관 | antd5 3번과 같은 수정입니다. | #649 |
| antd6 | 4 | 수정 | 무관 | antd5 4번과 같은 수정입니다. | #649 |
| antd6 | 5 | 문서 수정 | 무관 | antd5 5번과 같은 수정입니다. | #649 |
| antd6 | 6 | 수정 | 무관 | URI 접두 컨트롤을 deprecated `addonBefore` 대신 `Space.Compact`로 렌더하므로 렌더마다 나던 경고가 없습니다. antd5도 같은 소스를 씁니다. | #649 |
| mui | 1 | 수정(결정) | 무관 | antd5 1번과 같은 수정입니다. | #649 |
| mui | 2 | 수정(결정) | 새 결함(새 입력: 1라운드 mui 2번) | antd5 2번과 같은 수정입니다. | #649 |
| mui | 3 | 수정 | 무관 | antd5 3번과 같은 수정입니다. | #649 |
| mui | 4 | 수정(결정) | 무관 | 표시 scheme을 저장 값에서 정하므로 서버 HTML과 첫 클라이언트 paint가 저장된 scheme을 보입니다. | #649 |
| mui | 5 | 수정 | 무관 | 값이 없는 enum select에 빈 문자열 표시값을 넘기므로 out-of-range 경고가 나지 않습니다. 폼의 값은 그대로 비어 있습니다. | #649 |
| antd-mobile | 1 | 수정 | 무관 | enum label을 자기 키에서만 읽습니다. | #649 |
| antd-mobile | 2 | 수정 | 무관 | 범위 slider가 숫자 `items` 스키마의 `minimum`, `maximum`, `multipleOf`를 먼저 읽습니다. 배열 수준의 값은 1라운드 회귀를 위해 대체값으로 남습니다. | #649 |
| antd-mobile | 3 | 수정 | 무관 | 실제 thumb를 focus 대상으로 표시하고 `tabIndex`와 키보드 조작을 제공하므로 `focus(path)`가 동작합니다. | #649 |
| antd-mobile | 4 | 수정(결정, 호환성 깨짐) | 무관 | 라벨이 코어의 scoped id로 Stepper, Switch, Slider의 실제 컨트롤을 가리킵니다. 코어 1번에 의존하던 항목입니다. | #649 |
| antd-mobile | 5 | 문서 수정 | 무관 | 연속 volume 예제에서 marks를 빼고, marks가 이산 stop을 정한다고 적었습니다. | #649 |
| antd-mobile | 6 | 문서 수정 | 무관 | textarea 설정을 스키마 수준 예제로 고쳤습니다. | #649 |
| ajv6 | 추가 수정 | 수정 | 무관(ajv7, ajv8 1번의 형제) | 나중에 등록한 format과 keyword를 ajv7, ajv8과 같은 구조로 반영합니다. | #649 |
| ajv7, ajv8 | 추가 수정 | 수정 | 무관(3라운드 종류 24의 형제) | 동적 앵커 표를 `Object.create(null)`로 만들어, `toString` 같은 이름의 앵커가 저장되고 선언되지 않은 같은 이름이 묶인 것으로 보이지 않습니다. | #649 |
| antd5, antd6, mui, antd-mobile | 추가 수정 | 수정(결정, 호환성 깨짐) | 무관(코어 1번, 6번의 소비) | 모든 입력과 라벨이 `FieldInputProps.id`를, 그룹 제목이 `FieldRendererProps.labelId`를, 라디오 그룹이 id를 native name으로 씁니다. 검증 subagent가 찾은 MUI 체크박스 그룹의 중복 제목 id, antd5와 antd6과 antd-mobile 대체 입력의 빠진 `htmlFor`, MUI와 antd-mobile 배열 객체 항목의 제목, URI protocol 선택기의 접근성 이름, 날짜 범위의 두 끝점, 이름 없는 그룹 wrapper, MUI가 사용자 입력에 `labelId`를 넘기던 경고를 함께 고쳤습니다. | #649 |

함께 고친 형제 범위: URI는 세 플러그인에 바이트가 같은 28행 저장 값 표, 6행 구분자 표, 2행 사용자 목록으로 마운트, 서버 렌더, 경로 편집, scheme 편집, 외부 쓰기, reset, Activity를 비교하고, 기존 빈 값 회귀 12건은 바꾸지 않았습니다. 식별자는 플러그인마다 등록된 입력 정의(18, 18, 15, 10개)를 모두 렌더하는 동등성 표 98행(antd5와 antd6 각 27행, MUI 24행, antd-mobile 20행)으로 고정했습니다. AJV의 `cloneInstance`와 `makeSibling`의 스키마 키 검사도 자기 속성 검사로 통일했지만, AJV가 그 이름의 등록을 먼저 거부하므로 관찰 가능한 변화는 없습니다.

`@canard/schema-form` 6번의 라디오 이름 증상을 적은 antd5, antd6, mui 문서의 절과, ajv6 2번의 폼 수준 증상을 적은 `@canard/schema-form` 문서의 절은 번호가 없는 항목이며 각 원인 항목의 수정으로 해결되었습니다.

## 속도

비율은 일반 입력에서 수정 후 시간을 수정 전 시간으로 나눈 값이고, 1.03 이하는 측정 오차로 봅니다. 측정은 모두 프로세스 CPU 시간(사용자와 시스템의 합), 단일 스레드 Node, 수정 전후를 별도 프로세스로 번갈아 실행, 중앙값, 같은 빌드끼리의 대조를 씁니다. 각 프로세스는 React 클라이언트 렌더러와 여러 종류의 폼을 초기화한 일반 애플리케이션입니다. 6회 선별 뒤 손댄 행은 12회, 1.03에서 1.06 사이의 행은 24회 측정 세 번의 중앙값으로 정하고, 대조가 0.98에서 1.02를 벗어난 시리즈는 버립니다.

1.03을 넘는 행은 묶음마다 두 표로 나눕니다. "빠진 작업을 채운 행"은 수정 전 코드가 정확성에 필요한 일을 건너뛰었고 그 일이 이제 있어서 느린 행입니다. "기존 경로가 느려진 행"은 이미 올바르던 입력의 경로가 느려진 행이며, 이쪽이 실제 회귀입니다. UI 플러그인 네 종과 `@slats/agents-assets-sync`는 절차에 따라 재지 않습니다.

### 유틸리티 묶음

1.03 이하인 행은 다음과 같습니다. "검토"는 독립 검토의 재측정, "구현자"는 검토가 다시 재지 않은 행입니다.

| 패키지 | 행 | 비율 | 판정 |
|---|---|---|---|
| `@winglet/common-utils` | clone 6행, fingerprint 2행, Murmur3 4행(검토) | 0.998에서 1.029 | 통과입니다. |
| `@winglet/common-utils` | `throttleBurst` 0.226, `debounceBurst` 0.937, `getTrackableHandler` 3행 0.855에서 0.881, `withTimeout` 0.999, `delayZero` 0.998, `murmurBytes` 0.991, scheduler 2행 0.951과 0.994(구현자) | 0.226에서 0.999 | 통과입니다. `getTrackableHandler` 3행은 소유자 조건에 따른 24회 세 번의 엄격한 측정입니다. |
| `@winglet/json` | `rootCopy` 1.015(24회 세 번), `patchNested` 1.005(검토), `rootMoveTrue` 0.989, `rootMoveFalse` 0.982, `rootCopyFromRoot` 0.805, 손대지 않은 대조 `compareType` 0.990(구현자) | 0.805에서 1.015 | 통과입니다. 2라운드에서 1.076으로 수용한 루트 `move` 행의 값을 깎지 않습니다. |
| `@winglet/data-loader` | `loaderBatch`, `loaderSync`(검토) | 0.932, 1.009 | 통과입니다. |
| `@winglet/style-utils` | `compressFlat`, `compressEscapes`, `scopeOpaque`, `scopeNested`, `shadowAdd`(검토), `compressStrings`, `compressMultilineStrings`, `scopeFlat`, `styleFlush`(구현자) | 0.915에서 1.026 | 통과입니다. |
| `@winglet/react-utils` | `timeoutSchedule`, `portalMount`, `portalUpdate`, `uploaderMount`(24회 세 번), `uploaderStableRender`(검토), `stableCallbackRender`, `handleInvoke`, `portalStableUpdate`, `uploaderClick`, `useTimeout`과 `useVersion` 형제(구현자) | 0.923에서 1.027 | 통과입니다. `untrackedRender`(구현자 1.006)와 `callbackHookRender`(구현자 1.002)는 다시 재지 않았고, 검토는 `untrackedRender`를 손대지 않은 행으로 본 구현자의 판정이 틀렸다고 적었습니다. |
| `@winglet/json-schema` | `identityArray`(검토), `identityScalar`, `resolverAsync`, `resolverIndex`, `resolverCached`, `scannerDialect`(구현자) | 0.940에서 1.001 | 통과입니다. |

빠진 작업을 채운 행(단위는 측정 묶음 전체의 CPU 마이크로초):

| 패키지 | 행 | 수정 전 | 수정 후 | 비율 | 대조 | 채운 작업과 판정 |
|---|---|---:|---:|---:|---:|---|
| `@winglet/json` | `rootReplace` | 54232.0 | 54570.0 | 1.006 | 1.003 | 루트에 넣은 값은 참조로 들어가고 복사하지 않습니다. 처음 수정의 즉시 복사(검토 측정 1.584)를 지연 소유로 바꾼 결과입니다(1번). |
| `@winglet/json` | `rootAddLarge`(속성 1,000개 루트) | 1786.0 | 1806.0 | 1.011 | 1.008 | 같은 규칙입니다. 처음 수정은 11.602였습니다. |
| `@winglet/json` | `rootReplaceLarge` | 1826.5 | 1810.5 | 0.991 | 0.999 | 같은 규칙입니다. 처음 수정은 12.091였습니다. |
| `@winglet/json` | `rootReplaceLargeWrite`(루트 교체 뒤 `/k0` 쓰기) | 4765.0 | 21953.5 | 4.607 | 0.982 | 정확성에 필요한 유일한 복사입니다. 교체한 문서에 같은 패치가 다시 쓸 때 한 번 복사하며 연산 하나에 약 1.15마이크로초입니다. 수정 전 코드는 이 경우 호출자의 값을 바꿨습니다. |
| `@winglet/json` | `patchNested`, `patchNestedTen` | 161993.0, 104710.0 | 157358.5, 103955.0 | 0.971, 0.993 | 1.018, 1.007 | 루트가 아닌 경로에는 연산마다 참조 비교 한 번만 더합니다. |

루트 행은 소유자의 요청으로 다시 설계했습니다. 처음 수정은 루트에 넣는 값을 항상 한 단계 복사하여 큰 루트에서 약 12배가 되었습니다. 최종 형태는 중첩 컨테이너가 이미 쓰는 지연 소유를 루트에도 적용합니다. `applyPatch`의 반복문이 루트가 바뀐 사실을 지역 표지 하나로 기억하고, 다음 연산이 쓸 수 있을 때만 복사합니다. 루트 연산이 마지막이면 복사가 없고, 결과는 넣은 값과 같은 객체입니다. 이는 중첩 `add`가 값을 참조로 넣는 것과 같은 규칙이며 수정 전의 반환과도 같습니다. 재검토는 루트 연산 뒤의 두 연산, 세 연산 조합을 깊게 동결한 입력과 깊은 복제 기준 구현으로 대조하여 입력 변경과 예외가 없음을 확인했습니다.

기존 경로가 느려진 행:

| 패키지 | 행 | 수정 전 | 수정 후 | 비율 | 대조 | 근거와 판정 |
|---|---|---:|---:|---:|---:|---|
| `@winglet/react-utils` | `unmountHookRender` | 155587.0 | 174968.5 | 1.125 | 1.002 | 콜백을 commit 단계에서 공개하는 insertion effect입니다. 콜백 갱신 하나에 약 0.38마이크로초입니다(검토). 구현자 측정은 1.115입니다. render 중 ref를 쓰는 더 싼 방법이 이 결함입니다. native ref와 `useCallback`(1.110), owned adapter(1.080)도 쟀고, native ref에 정보를 더하는 후보는 봉인된 서버 렌더 ref 회귀를 실패하여, 호출자가 소유한 저장소를 골랐습니다. 지휘 세션이 수용했고 소유자 확인 항목입니다. |
| `@winglet/react-utils` | `handleRender` | 344432.0 | 361319.0 | 1.049 | 1.001 | 검토가 새로 1.03 위로 잰 행입니다(24회 세 번 1.0584, 1.0467, 1.0490, 구현자 1.023). 측정 페이지가 unmount hook도 함께 마운트하므로 순수한 `useHandle` 비용은 아니며, 콜백 갱신 하나에 약 0.3마이크로초입니다. 검토는 유지를 권고했습니다. |
| `@winglet/style-utils` | `scopeEscapes` | 123611.5 | 130473.0 | 1.0555 | 1.0025 | escape 뒤의 문자를 보고 hex, CRLF, escape된 URL 이름을 구분하는 후보 검사입니다. 시트 하나에 약 1.4마이크로초입니다(검토, 구현자 1.032와 약 0.84마이크로초). 구현자가 더 싼 후보 여덟 가지를 재고 버렸으며, 그중 가장 싼 것은 새 hex, CRLF, URL 사례를 실패하거나 더 느렸습니다. |
| `@winglet/style-utils` | `scopePseudo`(`:is`, `:hover`) | 114807.5 | 118236.5 | 1.030 | 0.994 | 선택자 경계에서 opaque 토큰과 root, host 후보를 구분하는 일입니다. 검토의 세 시리즈는 1.0183, 1.0315, 1.0299로 관문에 걸쳐 있습니다. 구현자 측정은 1.038(시트 하나에 약 0.875마이크로초)입니다. |

### @lerx/promise-modal과 @slats/agents-assets-sync

독립 검토가 다시 잰 제품 행 14개(모달 열고 닫기, `useModal`, 호출자와 Provider 마운트, 같은 root로의 `attach`, 비활성 Escape, 가운데 Tab, 중첩 포커스, 오류 렌더, 경로 프레임, 100개 hook 마운트, dimmed 열고 닫기, 스타일 attach와 detach, 호환 사본 종료)는 0.776에서 1.022입니다. 같은 root로의 `attach`는 0.776으로, 1라운드에서 1.072에서 1.109로 수용했던 행이 더 빨라졌습니다. 손대지 않은 `registry-read`는 1.009이고 `duration-normalization`(구현자 0.999)은 다시 재지 않았습니다.

빠진 작업을 채운 행: 없습니다.

기존 경로가 느려진 행(단위는 연산 하나의 마이크로초):

| 행 | 수정 전 | 수정 후 | 비율 | 대조 | 근거와 판정 |
|---|---:|---:|---:|---:|---|
| `anchor-presence` | 0.0056 | 0.0662 | 11.792 | 0.994 | 검증 전용 getter `anchored`가 `parentElement`를 한 번 읽습니다. 제품 호출자가 없고 패키지가 export하지 않습니다. 숨긴 동안 앵커 객체를 보관하므로 참조 비교(2.11나노초)는 기존 `bootstrapLifecycle.test.tsx`를 실패합니다. 구현자 측정은 5.920(약 26.81나노초)입니다. |

`@slats/agents-assets-sync`는 절차에 따라 재지 않습니다. 검토는 해시 조정이 이번 실행이 건드리는 manifest 항목만 읽고 관계없는 파일마다 해시나 디렉터리 읽기를 더하지 않음을 코드로 확인했습니다.

### @canard/schema-form

독립 검토가 다시 잰 일반 행 25개는 0.804에서 1.028입니다. 1라운드 행은 `watch-read` 1.003, `react-bridges` 1.004, `branch-nonnull` 0.964, `register-plugin` 1.015이고, 2라운드에서 1.134였던 재사용 템플릿 마운트는 1.000입니다. 12회 측정에서 1.04에서 1.05였던 네 행은 24회 측정 세 번의 중앙값으로 정했습니다(`mount-plain` 0.993, `context-update` 1.023, `batch-merge` 0.916, `compile-root-ref` 0.983). 라디오 이름 후속 수정 뒤 구현자가 잰 두 행은 `mount-100` 1.003, `react-bridges` 0.993입니다.

빠진 작업을 채운 행(9번 계약의 가격, 단위는 배열 동사 하나의 CPU 마이크로초, push 뒤 pop으로 같은 내용에 돌아오는 행):

| 행 | 수정 전 | 수정 후 | 비율 | 대조 |
|---|---:|---:|---:|---:|
| 새 batch 대 이전 묶음 batch, 관찰자 없음 | 16.932 | 29.435 | 1.738 | 1.000 |
| 새 batch 대 이전 묶음 batch, 관찰자 있음 | 17.466 | 26.279 | 1.505 | 1.004 |
| 같은 최종 빌드의 batch 대 순차 호출, 관찰자 없음 | 26.575 | 29.443 | 1.108 | 0.996 |
| 같은 최종 빌드의 batch 대 순차 호출, 관찰자 있음 | 24.710 | 26.279 | 1.063 | 0.999 |
| 순차 호출 자체(새 대 이전), 관찰자 없음 | 26.429 | 26.546 | 1.004 | 1.003 |
| 순차 호출 자체(새 대 이전), 관찰자 있음 | 25.392 | 24.636 | 0.970 | 1.000 |

이전 묶음 batch는 두 배치를 하나로 합쳐 건너뛰었고, 그 결과 잡아 둔 항목을 원래 위치에 쓰는 결함(9번)이 있었습니다. 새 batch는 동사마다 배치를 실제로 하고 batch 끝에 같은 내용으로 돌아왔는지 비교합니다. 더 싼 설계로 구독자 payload를 batch 경계에서 한 번만 만드는 안을 구현자가 시도했지만 payload 수만 3에서 1로 줄고 표본 할당량은 줄지 않았으며 관찰자 없는 batch가 1.035로 느려져 버렸습니다. 구독자가 없을 때 동등성 비교를 건너뛰는 안은 출력 참조 규칙을 깨고, 길이와 순서의 카운터는 같은 내용으로 되돌린 갱신을 구별하지 못합니다. 구현자의 값은 이전 묶음 대비 1.43과 1.04, 순차 대비 1.07과 1.00이었고, 검토는 같은 번들로 1.74와 1.50, 1.11과 1.06을 재고 유지를 권고했습니다. 이 값은 소유자 확인 항목입니다.

기존 경로가 느려진 행: 없습니다.

### 플러그인 묶음

독립 검토가 다시 잰 AJV 행은 아래 표의 한 행을 빼고 0.492에서 1.027입니다. ajv8과 ajv7의 직접 가드 compile은 0.492와 0.538로 빨라졌습니다. ajv6 `rootIdCompile`은 구현자가 1.040으로 재어 비용 예외로 보고했지만, 검토의 유효한 재측정은 1.027이라 예외가 아닙니다. 검토 뒤의 동적 앵커와 복제 수정에서 구현자가 잰 10행은 0.989에서 1.008입니다.

빠진 작업을 채운 행: 없습니다.

기존 경로가 느려진 행(단위는 측정 묶음 전체의 CPU 마이크로초):

| 행 | 수정 전 | 수정 후 | 비율 | 대조 | 근거와 판정 |
|---|---:|---:|---:|---:|---|
| ajv6 `rootCompile` | 14830.5 | 15586.5 | 1.051 | 1.003 | compile 동안 `jsonPointers`를 저장하고 켰다가 복원합니다(2번). AJV 6의 기본 경로 문자열은 오류 뒤에 동적 키의 경계를 되살릴 수 없습니다. 24회 세 번은 1.0510, 1.0640, 1.0445이고 구현자 측정은 1.056입니다. 검토가 시도한 조건부 스키마 탐색은 1.031과 1.034로 1.03에 닿지 않았고, 구현자의 인라인 형태는 현재 수정보다 1.029배 느렸습니다. 480개 compile 묶음 약 15.2밀리초에 약 0.86밀리초가 더해집니다(구현자). 지휘 세션이 수용했고 소유자 확인 항목입니다. |

## 스펙표

관찰 가능한 동작을 바꾼 수정마다 한 줄입니다. "표준 준수"는 코드가 표준이나 패키지가 이미 문서로 약속한 계약을 따르게 된 수정이고, "스펙 변경"은 문서가 정하지 않았던 동작이나 약속하던 범위가 바뀐 수정입니다. "결정"이 붙은 행은 근거 칸에 수용 기준의 세 근거를 (1) 따르는 표준이나 문서화된 계약, (2) 예측 가능한 동작인 이유, (3) 속도 검증의 순서로 적습니다. 속도 값은 따로 밝히지 않으면 검토의 재측정입니다.

### 유틸리티 묶음

| 항목 | 구분 | 이전 | 이후 | 근거 |
|---|---|---|---|---|
| common-utils 1 | 표준 준수 | `clear()` 뒤나 창 경계에서 throttling이 멈추고 `leading: false`에서 마지막 호출이 실행되지 않았습니다. | 창을 다시 세우고 마지막 호출을 trailing으로 실행합니다. | 문서화된 leading, trailing, `clear` 수명 계약입니다. |
| common-utils 2, 15 | 스펙 변경(결정, major) | async hook을 기다리지 않아 `beforeExecute`가 도는 중에 원 함수가 시작되었고, 거절이 원 함수를 막지 않았습니다. `beforeExecute` 안의 호출은 `preventConcurrent`를 우회했습니다. | thenable을 반환한 hook만 기다리고 동기 hook은 같은 tick에 끝납니다. 거절은 호출을 거절하고, `pending`은 대기를 포함하며, hook 안의 재진입은 막힙니다. | (1) 문서화된 생명 주기 순서와 Promise, thenable의 거절 의미입니다. (2) 원 함수가 hook이 끝난 뒤에만 시작하고 hook의 실패가 호출의 실패가 되며, 동기 hook의 시점은 그대로입니다. (3) 24회 세 번의 엄격한 측정에서 hook 없음 0.855, 구독자 0.881, 동기 hook 0.862입니다(구현자). 처음 구현은 동기 hook 1.077이라 버렸습니다. |
| common-utils 3 | 표준 준수 | 예외를 던지는 `onTaskError`가 실패한 작업을 매번 다시 실행하게 하고 다른 작업을 막았습니다. | handler 오류를 격리하여 호스트에 보고하고 나머지 작업을 진행합니다. | 문서화된 scheduler 진행과 작업 한 번 실행 계약입니다. |
| common-utils 4 | 스펙 변경(결정, major) | `onTaskError`가 없는 인스턴스의 작업 오류를 버렸고(`MessageChannelScheduler/DETAIL.md`의 이전 정책), 브라우저의 `scheduleMacrotask` 콜백 오류는 어디에도 보고되지 않았습니다. | 작업 오류를 잃지 않습니다. 사용자 `onTaskError`가 있으면 그것만 받고, 없으면 클래스 기본값이 `reportError`로, 그것이 없으면 별도 native timer에서 다시 던져 호스트에 정확히 한 번 보고합니다. | (1) 이벤트 리스너의 오류와 같은 호스트 보고 규칙입니다. (2) 한 클래스에 한 규칙이며 wrapper와 singleton의 생성 순서에 의존하지 않고 새 공개 API가 없습니다. (3) `schedulerBatch` 0.994, `schedulerCancel` 0.951이며(구현자) 정상 작업당 새 일이 없습니다. 호출마다 adapter를 씌우는 안은 1.355, 1.274라 버렸습니다. |
| common-utils 5 | 표준 준수 | 다른 realm의 Map, Set 등을 쓸 수 없는 객체로 복사했습니다. | 같은 프로필로 내용과 슬롯을 복사하고, 위조 태그에는 생성자를 부르지 않습니다. | realm과 무관한 문서화된 clone 프로필과 1라운드의 위조 태그 한계입니다. |
| common-utils 7 | 표준 준수 | 여섯 패키지의 게시 `exports`에 게시하지 않는 파일을 가리키는 `source` 조건이 있었습니다. | 게시 `exports`에서 뺐고, 작업 공간의 `exports`는 그대로입니다. | 게시한 조건부 export는 게시한 파일로 풀려야 한다는 Node 패키지 해석 규칙입니다. |
| common-utils 8 | 표준 준수(타입만) | 선언이 DOM 전역 타입을 요구했습니다. | 소비 환경에서 유도한 구조 타입을 씁니다. | 2라운드 9번과 같은 플랫폼 중립 선언 계약입니다. |
| common-utils 10 | 표준 준수(결정) | 예외를 던지는 완료 구독자가 뒤 구독자의 알림을 막고 성공한 호출을 거절로 바꿨습니다. | 모든 구독자가 알림을 받고, 완료 오류는 결과를 바꾸지 않고 호스트에 보고됩니다. 시작 오류의 거절은 그대로입니다. | (1) 모든 구독자에게 알린다는 관찰자 계약과 2라운드의 시작 오류 결정입니다. (2) 관찰자의 실패가 관찰되는 호출의 결과를 바꾸지 않습니다. (3) `trackableSubscribed` 0.881입니다(구현자). |
| common-utils 11 | 표준 준수 | 이미 중단된 신호에서도 `fn`을 불렀습니다. | `fn`을 부르지 않고 AbortError로 거절합니다. | 이미 중단된 연산은 시작하지 않는 AbortSignal 관례와, 코드보다 먼저 고친 `promise/DETAIL.md`입니다. |
| common-utils 12 | 표준 준수 | 2^31-1 밀리초를 넘는 대기와 `Infinity`가 약 1밀리초 뒤에 끝났습니다. | 요청한 시간을 기다리고 `Infinity`는 취소까지 기다립니다. | 문서화된 대기 시간과 취소입니다. |
| common-utils 13, 14 | 표준 준수 | 다른 realm의 plain object와 Date를 참조로 키를 만들었고, 다른 realm의 바이트 뷰에서 `Murmur3`가 TypeError를 던졌습니다. | 내용과 바이트로 다룹니다. | 같은 내용은 같은 키, 같은 바이트는 같은 해시라는 계약입니다. 2라운드의 OR 결합은 그대로입니다. |
| json 1 | 표준 준수(결정) | 기본 immutable 모드의 루트 `add`, `replace`가 호출자의 값을 그대로 넣어 뒤의 쓰기가 호출자 값과 원본을 바꿨습니다. | 루트에 넣은 값은 참조로 들어가고, 같은 패치의 뒤 연산이 그 문서에 쓰기 직전에 한 단계 복사합니다. 결과는 원본과 patch 값 양쪽과 구조를 공유하며, 마지막 루트 `add`, `replace`는 patch 값 자체를 반환합니다. 빈 `from`은 현재 문서 전체입니다. | (1) RFC 6902의 루트 연산, RFC 6901의 빈 포인터, `applyPatch/DETAIL.md`의 immutable 계약입니다. (2) 루트와 중첩 경로가 같은 소유 규칙과 같은 공유 규칙을 따릅니다. (3) 검토 재측정으로 루트 연산 1.006, 1.011, 0.991, 루트가 아닌 경로 0.971이며, 교체 뒤 쓰기만 연산당 약 1.15마이크로초의 복사를 냅니다. 기존 계약의 복원이라 patch입니다. |
| data-loader 1 | 표준 준수 | scheduler를 loader의 메서드로 불렀습니다. | 독립 콜백으로 부릅니다. | 명세가 `queueMicrotask`, `setTimeout`, `requestAnimationFrame`을 scheduler로 나열합니다. |
| data-loader 2와 형제 | 표준 준수(결정) | scheduler가 한 번 예외를 던지면 뒤의 `load`가 끝나지 않았고, 물러난 묶음이 새 묶음의 캐시를 지우거나 넘긴 `keys`를 비웠습니다. | 실패한 묶음은 상태를 풀고 물러난 묶음 배열은 새 배열로 바꾸며, 넘긴 읽기 전용 `keys`와 정착한 Promise는 그대로입니다. | (1) 실패한 묶음은 상태를 푼다는 명세와 `ReadonlyArray` 계약입니다. (2) 같은 키와 다른 키의 새 요청이 앞의 실패와 무관하게 정착합니다. (3) `loaderBatch` 1.009, `loaderSync` 0.932입니다. |
| style-utils 1, 4, 6, 7 | 표준 준수(결정) | escape, 닫히지 않은 문자열, escape된 끝 공백, 주석 경계를 잘못 읽어 다음 문자열을 압축하거나 규칙을 지우고 토큰을 붙였습니다. | 토큰 경계를 보존하고, 나쁜 문자열은 개행에서 끝냅니다. | (1) CSS Syntax Level 3의 escape, string, bad-string, comment, url 토큰 규칙입니다. (2) 압축과 스코핑의 결과가 브라우저가 읽는 토큰과 같습니다. (3) 일반 압축 행 0.915에서 1.015이고, `scopeEscapes` 1.0555와 `scopePseudo` 1.030은 지휘 세션이 수용한 비용입니다. |
| style-utils 2 | 표준 준수 | 세미콜론 없는 마지막 at-rule이 다음 식별자의 CSS를 삼켰습니다. | 합쳐 쓸 때만 세미콜론을 보충합니다. | 독립으로 주입한 문장은 경계를 유지한다는 계약입니다. |
| style-utils 3, 5 | 표준 준수 | 빈 목록 항목이 스코프 클래스가 되었고, `:ROOT`와 주석이 붙은 `:root`가 스코프 접두사를 받았습니다. | 빈 항목은 무효로 남고 단일 토큰의 root와 host만 전역입니다. | Selectors Level 4의 선택자 목록 문법과 ASCII 대소문자 무시 규칙입니다. |
| react-utils 1 | 표준 준수 | 범위나 앵커가 숨겨지면 포털 내용이 상태를 잃었습니다. | 상태를 유지하고 실제 삭제만 앵커를 해제합니다. | Activity와 Suspense의 일시 숨김은 상태를 보존한다는 React 계약입니다. |
| react-utils 2 | 스펙 변경(결정, major) | handler 참조를 render마다 갱신하여 버려진, suspend한, 예외를 던진 render가 handler를 바꿀 수 있었습니다. | commit된 handler만 실행합니다. React 18과 19는 `useInsertionEffect`로 모든 layout effect보다 먼저, 16.14와 17은 `useLayoutEffect`로 공개합니다. 공개 `useReference`는 그대로입니다. | (1) React 문서의 `useRef` 주의 사항(render 중에 ref를 쓰지 않음)과 `useInsertionEffect`의 실행 순서입니다. (2) 화면의 commit과 handler가 같은 값을 보고, 콜백 identity가 같으면 effect 본문을 생략합니다. (3) `unmountHookRender` 1.125, `handleRender` 1.049(콜백 갱신당 약 0.3에서 0.38마이크로초)이며, 세 구조를 잰 뒤 계약을 지키는 구조를 골랐습니다. |
| react-utils 3, 5 | 표준 준수 | unmount 뒤 `schedule()`이 타이머를 만들었고, 클릭 한 번에 조상의 캡처 리스너가 두 번 실행되었습니다. | 타이머를 만들지 않고, 캡처와 버블을 한 번씩만 지납니다. | unmount 뒤 일을 예약하지 않는 hook 계약과 DOM 이벤트 모델입니다. |
| json-schema 1 | 표준 준수 | 실패한 색인이 남긴 자원이 다음 조회에서 성공으로 쓰였습니다. | 실패한 문서의 자원과 앵커를 버립니다. | 거부된 문서는 등록된 자원이 되지 않는다는 계약입니다. |
| json-schema 2 | 표준 준수 | nullable 문자열과 일반 문자열을 같다고 했습니다. | 다르다고 합니다. | JSON Schema의 type 집합과 OpenAPI `nullable`의 동치입니다. |
| json-schema 3 | 표준 준수 | 대문자 scheme이나 host의 `$schema`를 인식하지 못해 대체 dialect를 썼습니다. | 인식하고, 나머지 URI 부분은 대소문자를 구분합니다. | RFC 3986의 scheme과 host 대소문자 무시 규칙입니다. |
| 문서만 고친 항목 | 문서만 | common-utils 9, json 2, data-loader 3, 4, style-utils 8, react-utils 4, 6 | 동작은 바뀌지 않았습니다. | 문서가 코드와 다른 문서의 실제 동작에 맞춰졌습니다. |

### @lerx/promise-modal과 @slats/agents-assets-sync

| 항목 | 구분 | 이전 | 이후 | 근거 |
|---|---|---|---|---|
| agents 1, 4 | 표준 준수 | 유효하지 않은 UTF-8 바이트가 U+FFFD로 바뀌었고, 실패한 다시 쓰기가 파일을 잘라 두었습니다. | 관리 블록 밖 바이트를 보존하고 임시 파일과 이름 바꾸기로 원자적으로 씁니다. | `core/injectDocs/DETAIL.md`의 공유 문서 보존 계약입니다. |
| agents 2, 3, 6 | 표준 준수 | 터미널에서 계획 실패 단위를 버리고 0으로 끝났고, 잘못된 flag가 실행 범위를 넓혔으며, `--force`가 필요한 실행이 1로 끝나고 다른 단위를 적용하지 않았습니다. | 세 출력이 같은 종료 코드(실행 오류 1, 차단 2, 성공 0)와 같은 검증을 쓰고 막히지 않은 단위를 적용합니다. | `commands/runCli/DETAIL.md`의 출력과 무관한 종료 코드 계약입니다. |
| agents 5 | 스펙 변경(결정) | manifest 해시를 절대 기준으로 써서, 오래된 manifest에서는 매 실행이 도구 자신의 복사본을 사용자 편집으로 보고 2로 끝났습니다. | 건드리는 항목만 실제 원본 해시로 맞추고 세 출력에 알립니다. 잘못된 manifest는 계속 실행 오류입니다. | (1) 원본 파일이 manifest보다 정확한 사실이며 `core/buildPlan/DETAIL.md`를 먼저 고쳤습니다. (2) 같은 설치를 다시 하면 수렴하고 조정 사실을 모든 출력이 알립니다. (3) 명령줄 도구라 측정 면제이며, 관계없는 파일마다 해시나 디렉터리 읽기를 더하지 않음을 검토가 코드로 확인했습니다. |
| agents 7, 8 | 표준 준수 | `.gitkeep` 하나가 패키지를 막았고, 실제 덮어쓴 파일이 diverged 경고로 보고되었습니다. | 점 이름 제한은 스킬에만 적용하고 덮어쓴 파일은 updated로 보고합니다. | `agentTarget`과 `injectDocs`의 DETAIL 문장입니다. |
| agents 9, 10, 12, 13 | 표준 준수 | Ctrl-C가 0으로 끝났고 n 키가 동작하지 않았으며, BOM 파일과 잘린 구성원에서 실패하거나 조용히 버렸습니다. | 사용자 취소는 2, footer의 키가 동작, BOM을 읽고, 잘못된 구성원의 사유를 알립니다. | `ui/DETAIL.md`의 취소 규칙과, Node와 주입기가 BOM을 받는다는 2라운드 계약입니다. |
| promise-modal 1 | 표준 준수 | 끝없는 갱신 루프로 root 전체가 unmount되었습니다. | 요청 안의 Suspense가 콘텐츠 준비를 기다립니다. | `components/Presenter/DETAIL.md`입니다. |
| promise-modal 2 | 스펙 변경(결정, patch) | Provider를 숨기면 모든 대기 요청을 취소했습니다. | 밖 호출자의 요청을 보존하고 다시 보일 때 대기로 돌아오며, 숨긴 동안 포커스와 Escape를 놓습니다. 함께 숨겨진 호출자와 실제 unmount의 취소는 그대로입니다. | (1) 공개 README는 unmount와 숨겨진 호출자의 취소(2라운드 5번)만 약속했고, React의 Activity와 다시 suspend한 Suspense는 숨긴 DOM을 보존합니다. (2) 요청이 기다리는 호출자의 수명을 따르며 새 노드나 서버 HTML 변화가 없습니다. (3) `provider-mount` 0.974, `caller-mount` 0.982, `useModal-100-mount` 1.012입니다. |
| promise-modal 3 | 표준 준수(결정) | 같은 Escape가 그 처리 중에 열린 모달을 즉시 닫았습니다. | 누르기 시작한 시점의 후보 하나만 닫습니다. | (1) 1라운드 5번의 Escape 한 번에 모달 하나 계약이며, `SPECIFICATION.md`(영어와 한국어), README, `app/DETAIL.md`를 코드보다 먼저 고쳤습니다. (2) Enter 단축키로 연 결과와 같습니다. (3) `escape-disabled` 1.010, `tab-middle` 1.009입니다. |
| promise-modal 4, 6 | 표준 준수 | 포커스가 body로 갔고, slot 배치의 shadow 컨트롤이 inert가 되지 않았습니다. | 연 컨트롤로 돌아가고 inert가 됩니다. | 명세의 포커스 복귀와, composed tree의 동등한 배치에서 같은 페이지 격리입니다. |
| promise-modal 5 | 표준 준수(결정) | 숨긴 동안 정착한 수동 종료 모달이 새 경로에서 다시 보였습니다. | 보이지 않습니다. 기록이 없는 이전 사본의 노드는 기존 종료를 유지합니다. | (1) 구현 전에 고친 `core/node/ModalNode/DETAIL.md`이며, 노드가 최초 정착 시점을 소유해야 같은 commit의 숨김과 정착을 놓치지 않습니다. (2) 자동 종료와 수동 종료의 숨김 결과가 같습니다. (3) `route-frame` 0.999, `compatible-exit` 1.011입니다. |

### @canard/schema-form

| 항목 | 구분 | 이전 | 이후 | 근거 |
|---|---|---|---|---|
| 1, 6 | 스펙 변경(결정, major) | 입력 id와 `htmlFor`가 경로라 한 페이지의 두 Form이 같은 id를 만들었고, 라디오 native name이 말단 이름이라 같은 이름의 라디오가 한 그룹이었습니다. | `FieldInputProps.id`(scope + ":" + 실제 경로)가 DOM id이고 label id는 "label:" + id입니다. `FieldRendererProps.labelId`가 그룹 제목이고, 라디오 그룹은 id를 native name으로, 모든 입력의 `name`은 말단 이름입니다. native 제출의 라디오 키가 scoped id로 바뀌고 `getValue`는 그대로입니다. | (1) HTML에서 id는 문서 전체에서 유일하고 label의 `for`는 같은 트리의 id이며, 라디오 그룹은 form과 name 단위입니다. React `useId`는 맞는 `identifierPrefix`로 서버에서 클라이언트까지 안정합니다. (2) 모든 소비자에게 한 규칙이고(Vincent의 일관성 우선), 두 번째 label 클릭이 첫 Form을 바꾸지 않으며 `name`은 표시용 말단 이름으로 일정합니다. (3) `render-100` 1.008, `react-bridges` 1.004, `context-update` 1.023이고 이름 후속 수정 뒤 1.003과 0.993입니다(구현자). |
| 2 | 표준 준수 | 포털 안 Form의 제출이 바깥 Form도 제출했습니다. | 자기 form의 제출만 처리합니다. | native form 제출의 대상 경계입니다. |
| 3, 4와 형제 | 표준 준수 | 재사용 템플릿의 둘째 이후 위치에서 `active`가 반응하지 않거나 다시 켜지지 않았습니다. | 인라인 스키마와 같습니다. | 2라운드 2번의 `$ref`와 인라인 동치 계약입니다. |
| 5 | 표준 준수(결정) | batch 안 중첩 Merge가 다른 쓰기와 합쳐지면 생략한 키를 지웠습니다. | 순차 Merge와 같습니다. | (1) Merge는 생략한 가지 키를 보존한다는 계약과 batch 합성입니다. (2) batch가 같은 호출을 하나씩 한 결과와 같습니다. (3) `batch-merge` 0.916, `batch-write` 1.005, `branch-nonnull` 0.964입니다. |
| 7 | 스펙 변경(결정, major) | 자기 키로 내용을 비교하여 `URLSearchParams`와 private 필드 클래스의 새 객체를 같다고 보았습니다. | plain 객체와 지원 내장값은 내용으로, `URL`, `URLSearchParams`, 내용을 볼 수 없는 클래스는 참조로 비교합니다. 공용 `equals`는 그대로입니다. | (1) `validation-ux.md`의 context 갱신 규칙이며, 볼 수 없는 내용은 참조만이 확실한 비교입니다. (2) 새 객체를 넘기면 다시 계산합니다. (3) `context-update` 1.023(24회 세 번), `react-bridges` 1.004입니다. |
| 9 | 스펙 변경(결정, major) | batch 안 배열 동사가 항목을 위치로 다뤄 오류와 상호작용 상태가 다른 행에 남고 항목 노드의 쓰기가 다른 항목에 닿았습니다(EVENT-035의 위치 연속성). | 순차 호출과 같은 항목 신원이고 batch 안의 읽기도 배치된 배열을 봅니다. 외부 전달은 가장 바깥 batch에 한 번이며, 최종 내용이 같으면 출력 참조를 복원하고 `onChange`를 생략합니다. | (1) 소비자 문서가 batch의 항목 신원을 약속하며 EVENT-035와 EVENT-013을 코드보다 먼저 고쳤습니다. (2) batch가 같은 호출을 하나씩 한 것과 같은 결과입니다. (3) 일반 행 `batch-write` 1.005, `single-array-verb` 1.002이고, 구조 batch는 이전 묶음 대비 1.74와 1.50, 순차 대비 1.11과 1.06입니다. 이 가격은 소유자 확인 항목입니다. |
| 10 | 표준 준수 | 앞의 조상 쓰기가 batch 끝에 `resetSubtree`를 되돌렸습니다. | reset이 남습니다. | subtree reset은 즉시 load하고 같은 범위의 표시를 버린다는 계약입니다. |
| 12 | 표준 준수(결정) | commit 번호만 바뀌어도 진행 중 판정을 버리고 다시 요청하여 끝없이 반복했습니다. | 출력과 context가 같으면 판정을 받아들입니다. 바뀌면 다시 검증하고 명시적 `validate()`는 항상 다시 실행합니다. | (1) 검증 입력은 출력과 context라는 규칙으로 IR-6의 범위를 좁혔습니다. (2) 같은 값의 쓰기가 판정을 무효로 만들지 않습니다. (3) `validate-request` 0.997, `route-issues` 0.804입니다. |
| 13 | 스펙 변경(결정, minor) | 독립 번들 두 애플리케이션의 등록이 서로 덮어썼습니다. | 고른 scope끼리 격리하고 같은 scope의 호환 사본은 공유합니다. scope가 없는 경로는 그대로입니다. | (1) 2라운드 7번의 realm 공유 결정을 뒤집지 않고 더하는 opt-in입니다. (2) 기본 동작이 그대로이고 고른 애플리케이션만 격리됩니다. (3) `register-plugin` 1.015, `react-bridges` 1.004입니다. |
| 15 | 표준 준수(결정) | 내장 `$id` 자원 안의 `#/$defs/X`를 문서 루트에서 풀었습니다(BLUEPRINT-030). | 그 자원의 기준 URI에서 풀고, 자원에 없는 조각은 루트로 대체하지 않고 실패합니다. 내장 `$id`가 있는 문서에서만 색인합니다. | (1) JSON Schema 2020-12 Core 8.2.1과 `$ref` 해석 규칙(내장 `$id`가 기준 URI를 정함)이며 BLUEPRINT-030을 고쳤습니다. (2) 폼과 검증기가 같은 스키마를 씁니다. (3) `compile-root-ref` 0.983(24회 세 번), `mount-single-ref` 1.007입니다. |
| 16 | 표준 준수 | 두 번째 정리 호출이 나중 구독자를 지웠습니다. | 지우지 않습니다. | 정리 함수의 멱등성입니다. |
| 17 | 동작 변화 없음 | issue 배정이 issue 수의 제곱으로 늘었습니다. | 선형입니다. 내용, 순서, 이전 스냅숏은 같습니다. | 관찰 결과가 같은 성능 수정입니다. |
| 8, 11, 14 | 문서만(결정으로 동작 유지) | 문서 예제가 예외를 던지거나 보존 값을 지우거나 마스킹하지 않았습니다. | 예제를 고쳤고 ERROR-011, updater 입력, `type` 처리는 그대로입니다. | (1) ERROR-011, updater는 `setValue(f(getValue()))`, `Form.Input`의 `type`은 바인딩 소유라는 기존 계약입니다. (2) 기존 동작을 바꾸지 않습니다. (3) 문서만이라 측정 면제입니다. |

### 플러그인 묶음

| 항목 | 구분 | 이전 | 이후 | 근거 |
|---|---|---|---|---|
| ajv7, ajv8 1과 ajv6 형제 | 표준 준수 | 앞선 compile 뒤에 더한 format과 keyword를 뒤의 루트가 건너뛰었습니다. | 적용합니다. 이미 만든 validator는 다시 만들지 않습니다. | 사용자 AJV 인스턴스에 더한 설정은 뒤의 compile에 적용된다는 계약입니다. |
| ajv6 1, 2 | 표준 준수 | 다른 사본의 오류가 예외가 되었고, 동적 키의 `dataPath`가 다른 필드를 가리킬 수 있었습니다. | issue로 반환하고 정확한 JSON Pointer를 씁니다. | 검증기 계약과 RFC 6901입니다. |
| ajv7, ajv8 동적 앵커 | 표준 준수 | `Object.prototype` 이름의 앵커가 저장되지 않거나 묶인 것으로 보였습니다. | 자기 바인딩만 봅니다. | JSON Schema 2020-12의 유효한 앵커 이름과 가드 범위 계약입니다. |
| antd5, antd6, mui 1, 2와 mui 4 | 표준 준수(결정) | Activity 뒤 마운트 때 scheme으로 돌아가 다음 편집이 그 scheme을 저장했고, 한 콜론 scheme에 `http://`가 붙었으며, 서버 렌더가 첫 protocol을 보였습니다. | 유효한 scheme 접두사를 그대로 두고 저장 값에서 표시합니다. 빈 계약은 아래 근거와 같습니다. | (1) RFC 3986 3.1의 scheme 문법입니다. (2) 편집하지 않은 값은 다시 쓰지 않고, 경로 편집은 scheme을, 주소가 있을 때 scheme 편집은 주소를 바꾸지 않으며, 표시 scheme과 주소를 이으면 저장 값입니다. 사용자가 비우거나 빈 주소에서 scheme만 고르면 `undefined`를 저장하고 고른 scheme은 다음 글자에 결합되며, 저장된 scheme만의 값은 편집 전까지 그대로입니다. (3) UI 플러그인은 측정 면제이고 scheme 상태는 파싱한 값으로 초기화한 `useState`라 렌더마다 도는 일을 더하지 않습니다. |
| enum label 4종, antd5와 antd6 4, mui 5, antd6 6 | 표준 준수 | 상속 키를 label로 읽었고, 표시 label로 검색되지 않았으며, MUI 경고와 antd 6 경고가 났습니다. | 자기 키만 읽고 label로 검색하며 경고가 나지 않습니다. | 자기 키 조회, 표시와 값 검색의 동치, MUI Select의 빈 문자열 표시값, antd 6이 지원하는 조합입니다. |
| antd-mobile 2, 3 | 표준 준수 | slider가 0에서 100에 고정되었고 `focus(path)`가 동작하지 않았습니다. | `items`의 제약과 키보드 조작이 가능한 thumb를 씁니다. | 숫자 `items` 스키마의 제약과 `focus(path)` 계약입니다. |
| 네 UI 플러그인 식별자(antd-mobile 4 포함) | 스펙 변경(결정, major) | 경로나 말단 이름을 DOM 주소로 썼습니다. | 코어의 id, `labelId`, 라디오 native name은 id입니다. | (1) 코어 1번, 6번과 같은 HTML 규칙입니다. (2) 두 Form의 같은 경로가 독립이며 동등성 표 98행이 고정합니다. (3) UI 플러그인은 측정 면제이고, 더한 callback ref는 마운트와 identity 변경 때만 실제 컨트롤을 찾습니다. |
| 테스트의 시간 fixture | 동작 변화 없음(결정) | 공통 offset 없는 fixture가 antd에서 Invalid Date를 보였습니다. | MUI와 antd-mobile은 `12:30:00`, antd는 문서화된 저장 형식 `12:30:00Z`를 씁니다. | (1) 각 플러그인이 문서화한 저장 형식입니다. (2) 표의 검사는 제목과 접근성만 보므로 두 시간대(UTC, 서울)에서 같습니다. (3) 테스트만 바뀌었습니다. |
| 문서만 고친 항목 | 문서만 | ajv6 3, ajv7 2, ajv8 2, 3, antd5 5, antd6 5, antd-mobile 5, 6 | 동작은 바뀌지 않았습니다. | 새 메타 스키마나 의존성을 더하지 않았습니다. |

## 호환성이 깨지는 변경과 뒤집은 테스트

`.changeset/stable-1-0-0.md`가 이미 패키지들을 1.0.0으로 올리므로, 여기의 major changeset은 버전을 1.0.0 위로 올리지 않습니다. Vincent는 지금이 호환성을 깨도 되는 구간이며 사용법이 일관되면 수정을 용인한다고 밝혔습니다.

### major

| 패키지 | 변경 | 이전 | 이후 |
|---|---|---|---|
| `@winglet/common-utils` | scheduler 기본 오류 보고 | `onTaskError` 없는 인스턴스의 작업 오류를 버렸습니다. | 호스트에 보고합니다. 호스트 handler가 없는 비브라우저 프로세스는 종료될 수 있으므로 오류를 직접 다루려면 `onTaskError`를 넘깁니다. |
| `@winglet/common-utils` | `getTrackableHandler`의 async hook | 기다리지 않았고 거절이 원 함수를 막지 않았습니다. | 기다리고, 거절은 호출을 거절합니다. |
| `@winglet/react-utils` | commit된 콜백 handler | 버려진 render가 unmount handler와 콜백 handler를 바꿀 수 있었습니다. | commit된 handler만 실행합니다. React 16.14와 17에서는 자식 layout effect가 이전 commit을 읽을 수 있습니다. |
| `@canard/schema-form` | scoped 식별자(1번, 6번) | 사용자 입력이 `id={path}`를 썼고 라디오 name이 말단 이름이었습니다. | `id={id}`를 씁니다. 사용자 라디오는 받은 id를 native name으로 씁니다. 경로로 id를 찾던 선택자는 scoped id로 바꿉니다. |
| `@canard/schema-form` | batch 항목 신원(9번) | 위치가 같으면 같은 항목이었습니다. | 순차 호출과 같은 항목 신원입니다. |
| `@canard/schema-form` | 내용을 볼 수 없는 context(7번) | 내용이 같다고 본 새 객체는 다시 계산하지 않았습니다. | 참조로 비교하며, 같은 객체를 제자리에서 바꾸면 감지하지 않습니다. |
| antd5, antd6, mui, antd-mobile 플러그인 | scoped 컨트롤 식별자 | 경로나 말단 이름이 DOM 주소였습니다. | 코어의 id, `labelId`, 라디오 native name은 id입니다. |

`@canard/schema-form` 13번의 `registerPlugin` scope 옵션과 `FormProvider`의 `pluginScope`는 minor입니다. 나머지는 patch이며, `@winglet/json` 1번은 기존 immutable 계약의 복원이라 patch로 둔다고 검토가 판단했고, `@lerx/promise-modal` 2번은 공개 문서가 Provider 숨김의 취소를 약속하지 않았으므로 patch입니다. 유틸리티 묶음의 두 changeset은 구현자가 patch로 적었다가 검토 요구로 major가 되었습니다.

### 뒤집은 테스트

유틸리티 묶음, promise-modal과 agents 묶음은 기존 테스트를 뒤집지 않았습니다. 2라운드의 구독자 테스트와 `MessageChannelScheduler.test.ts`는 원래 단언을 그대로 두고 호스트 보고 단언만 더했습니다. 2라운드의 `it.fails` 4건(`isEmpty` 2건, 주입 함수 2건)은 그대로입니다.

`@canard/schema-form`에서 결정에 따라 바꾼 기존 단언은 다음과 같습니다(경로는 `src/` 기준).

- 12번: `validation.commit-retry.test.ts:101`, `validation.pending.test.ts:99`, `:240`이 같은 출력의 새 commit 뒤 판정을 받아들이고 pending을 풉니다. 출력이나 context가 바뀌면 다시 검증하는 인접 테스트를 더했습니다.
- 5번: `settle.inactive-value.explicit.test.ts:118`이 batched Merge 뒤 `x`를 보존합니다.
- 9번: `dispatch.array-entry.test.ts:93`, `:163`, `:318`, `dispatch.batch.test.ts:413`, `dispatch.closing-branch.test.ts:86`, `:99`, `derive.fragment-array-reset.test.ts:184`, `agents-examples/arrays-and-scale.test.tsx:265`, `packages/aileron/schema-form-scenarios`의 `batch-verbs.scenario.ts:22`가 순차 배치, 즉시 읽기, 한 번의 외부 전달을 기대합니다.
- 7번: `agents-examples/validation-timing.test.tsx:243`이 새 `Point` 인스턴스를 새 context로 봅니다. Date와 Map은 계속 내용으로 비교합니다.
- 3번, 4번: H1 fixture `selection-18`의 정확한 방문 수가 173, 273, 370, 486에서 173, 245, 342, 458로 바뀌었고 상한은 그대로입니다.
- 식별자: `htmlFor` 9개, 선택자 86개, 테스트 보조 9개 hunk를 scoped id로 옮겼고, 관찰 키 두 개는 DOM id에서 `data-path`로 옮겼습니다. 동작 단언을 다른 경로나 값으로 바꾼 것은 없다고 검토가 확인했습니다.

플러그인 묶음은 코어 변경으로 실패하던 UI 플러그인의 식별자 기대 16곳(플러그인마다 `renderers.test.tsx` 4곳)과 경로 선택자를 scoped 기대로 바꿨고, 식별자 밖의 동작 단언은 뒤집지 않았습니다.

## 결정과 근거

아래 동작은 의도해서 정한 것입니다. 기준 순서는 `FIX-PROCEDURE.md`의 결정 규칙(표준 준수, 예측 가능한 동작, 합리적인 인터페이스)이고, Vincent가 정한 일관된 사용자 경험의 선호가 더해집니다. 각 결정의 세 수용 근거는 스펙표의 같은 행에 있습니다.

### 앞 라운드의 수정과 닿는 항목의 분류

앞 라운드가 고친 코드나 동작에 다시 들어온 항목은 모두 "새 결함"이며, 대부분 앞 라운드의 수정이 그 입력이나 경로를 빠뜨린 경우입니다. 계획 검토(Gemini Hydrogen)가 사전 분류를 앞 라운드의 `FIXES.md`와 커밋에 대조하여 확인했습니다. 수정이 만든 회귀와 진동은 없습니다. `@canard/schema-form` 13번이 가장 가까운 경우로, 2라운드의 realm 공유 레지스트리 결정의 비용이지만 그 결정을 뒤집지 않고 opt-in scope를 더하여 해결했습니다. `@lerx/promise-modal` 3번은 명세 문장("otherwise the current list of modals is walked")이 모호하여 명세를 코드보다 먼저 고쳤습니다. `@canard/schema-form` 1번은 2라운드 10번이 정한 `htmlFor`와 경로의 관계를 결정으로 넓혔습니다.

### 유틸리티 묶음

- `@winglet/common-utils` 2번과 15번은 hook을 기다립니다. 반환 타입을 동기로 좁히는 안은 문서의 async 예제와 맞지 않았습니다. 처음 구현은 동기 hook 행이 1.077이라 출하하지 않았고, 동기 진입부와 생성 시 고른 continuation으로 다시 구현하여 모든 행이 1.00 아래가 되었습니다.
- `@winglet/common-utils` 4번은 지휘 세션이 고른 세 번째 안입니다. 브라우저 wrapper만 보고하는 안은 singleton을 먼저 만든 순서에 따라 결과가 달랐고, 호출마다 adapter를 씌우는 안은 1.355, 1.274였습니다. 클래스 기본값으로 보고하는 안은 기존 catch에서만 일하므로 정상 작업에 비용이 없습니다. 저장소의 제품 호출자 가운데 버려지는 오류에 의존하는 곳은 없었습니다.
- `@winglet/common-utils` 10번은 모든 구독자에게 알리고, 완료 오류는 결과를 바꾸지 않은 채 `reportError` 또는 별도 native timer로 호스트에 보냅니다. 시작 오류가 호출을 거절한다는 2라운드 결정은 그대로입니다.
- `@winglet/common-utils` 9번은 회귀 테스트를 문서 수정 뒤에 더한 순서 예외가 있습니다. 이전 문서로 다섯 실패를, 현재 문서로 통과를 재생한 증거를 지휘 세션이 승인하여 순서를 다시 만들지 않았습니다.
- `@winglet/react-utils` 2번은 비공개 commit 참조 도우미가 React 18과 19에서는 `useInsertionEffect`로, 16.14와 17에서는 `useLayoutEffect`로 공개합니다. 공개 `useReference`의 render 시점 계약은 바꾸지 않았습니다. 처음에 지휘 세션이 비용을 정확성에 필요한 최소 예외로 승인했고, 검토가 다시 잰 두 행도 수용했습니다.
- `@winglet/json` 1번은 루트의 소유를 지연합니다. 처음에는 2라운드 루트 `move`의 즉시 한 단계 복사를 `add`, `replace`에 그대로 썼으나, 큰 루트에서 약 12배가 되어 소유자가 거부했습니다. 최종 규칙은 "immutable 모드는 원본과 patch 값을 바꾸지 않고, 쓰지 않은 컨테이너는 양쪽과 공유한다"이며 루트와 중첩 경로에 똑같이 적용됩니다. 2라운드의 루트 `move`도 같은 규칙으로 옮겼고 빨라졌습니다(`rootMoveTrue` 0.858).
- `@winglet/data-loader` 2번의 물러난 묶음 형제는 원 함수에 넘긴 배열을 제자리에서 비우지 않고 새 배열로 바꾸며, 정상 콜백의 `isResolved` 검사를 없앴습니다.
- `@winglet/style-utils`의 토큰 경계는 CSS Syntax의 규칙을 따르되 일반 CSS가 문자마다 부담하는 새 파서나 큰 lexer 재설계는 쓰지 않았습니다. 따옴표 없는 `url()` 안의 중괄호 스코핑 한계(1라운드)와 깊이 256 대체 경로는 그대로입니다.
- `@winglet/common-utils` 6번과 7번의 공용 빌드 부분은 지휘 세션의 승인으로 작업 단위 밖으로 넘겼습니다. 8번은 선언 소스만으로 해결했습니다.

### @lerx/promise-modal과 @slats/agents-assets-sync

- `@lerx/promise-modal` 2번은 Provider가 이미 가진 포털 자식이 앵커에 남는지를 정리 뒤 microtask에서 보고, 숨긴 동안의 실제 제거는 MutationObserver로 감지합니다. React 18과 19의 effect 정리 순서가 달라 그 순서에 의존하는 안은 쓰지 않았고, 새 sentinel 노드도 더하지 않았습니다. 2라운드 5번의 숨겨진 호출자 취소 규칙은 그대로입니다. 이전처럼 취소하려면 AbortSignal로 명시 취소하거나 unmount합니다.
- `@lerx/promise-modal` 3번은 Escape를 누르기 시작할 때 후보, 순서, 정착 상태를 캡처 단계에서 기록합니다. 누르는 동안 열리거나 순서가 바뀐 모달은 다음 Escape의 후보입니다.
- `@lerx/promise-modal` 5번은 패키지 문서가 "먼저 물어볼 것"으로 정한 `AbstractNode` 인터페이스에 비공개 불리언 하나와 읽기 전용 getter `isVisibleAtSettlement`를 더했습니다. 지휘 세션이 승인했고 `ModalNodeView`와 패키지 공개 API는 늘지 않았습니다. 기록이 없는 이전 호환 사본의 노드는 명시적인 `false`만 억제하는 규칙(`!== false`)으로 기존 종료를 유지하며, 레지스트리 공유를 끊는 안은 버렸습니다.
- `@slats/agents-assets-sync` 5번은 이번 실행이 건드리는 manifest 항목만 원본과 맞춥니다. manifest에 없는 새 파일을 찾지 않고, 잘못된 manifest는 계속 실행 오류입니다.

### @canard/schema-form

- 1번과 6번은 Form마다 `useId` 하나를 두고 모든 식별자를 항상 scoped로 만듭니다. Vincent가 이유를 물었을 때 지휘 세션은 결정을 유지했고, Vincent는 소비자의 일관된 사용을 원하며 지금은 호환성을 깨도 되는 구간이라고 확인했습니다. 처음 결정은 라디오 입력의 `name` prop을 scoped id로 바꿨지만, 검증 subagent가 MUI 라벨에 scoped 주소가 보이는 것을 찾아 지휘 세션이 결정을 고쳤습니다. 지금은 `FieldInputProps.name`이 항상 말단 이름이고 라디오 그룹만 `id`를 native name으로 씁니다.
- 1번의 연결 책임은 나뉩니다. 코어는 라벨 쪽, 내장 입력, `labelId`를 보장하고, 사용자 입력은 받은 `id`를 자기 컨트롤에 두어야 합니다. 코어는 사용자 입력 안의 어느 요소가 컨트롤인지 알 수 없기 때문입니다. 개발 경고는 늦은 렌더, Activity, 다른 문서로의 포털, shadow root, `aria-labelledby` 그룹에서 잘못 울리고 새 경고 코드가 필요하여 이번에 넣지 않았고, 단일 컨트롤과 그룹 예제로 책임을 문서화했습니다. 켜야만 동작하는 개발 검사는 미룬 항목입니다.
- 5번은 batched Merge가 순차 Merge와 같다는 쪽을 골랐습니다.
- 7번은 패키지 안의 스냅숏 비교만 바꾸고 `@winglet/common-utils`의 공용 `equals`는 바꾸지 않았습니다.
- 8번은 ERROR-011(degraded 상태가 `load`나 `reset`까지 남음)을 유지하고 자동 복구를 더하지 않았습니다.
- 9번은 소비자 문서의 약속(batch의 항목 신원)을 따랐습니다. 반대안은 EVENT-035의 위치 연속성을 문서에 남기는 문서 수정이며, 검토는 그 안이 계속 잘못된 항목을 고친다고 판단했습니다. 배열 동사가 없는 batch의 경로는 바뀌지 않았고, batch 안에서 예외를 던졌을 때의 동작은 문서대로입니다.
- 11번은 updater가 `setValue(f(getValue()))`와 같다는 계약을 유지하고 예제를 고쳤습니다.
- 12번은 출력이나 context가 바뀌지 않은 쓰기만 진행 중 판정을 유지합니다.
- 13번은 2라운드의 realm 공유 결정을 그대로 두고, scope가 없는 경로가 느려지지 않는 opt-in만 더했습니다. scope는 애플리케이션 수명 동안 안정된 토큰이어야 하며 등록은 반응형 API가 아닙니다.
- 14번은 `type` override를 통과시키지 않고 예제를 `format: password`로 고쳤습니다.
- 15번은 작성된 문서 안의 내장 자원만 색인하며 외부 가져오기나 앵커 확장은 하지 않습니다.
- 새 공개 API 네 가지(`FieldInputProps.id`, `FieldRendererProps.labelId`, `registerPlugin`의 `scope` 옵션, `FormProvider`의 `pluginScope`)는 지휘 세션이 승인했습니다. 공개 표면 스냅숏의 차이는 이 넷뿐이고 export 이름은 101개 그대로입니다.
- 1번의 문서 범위는 사이트 문서(`documents/docs/canard/schema-form`)와 한국어 번역, 패키지 에이전트 문서로 넓혔고, Vincent의 지시에 따라 패키지 스킬도 새 id 규칙을 가르칩니다.

### 플러그인 묶음

- URI는 RFC 3986의 유효한 scheme 접두사를 모두 그대로 두는 안을 골랐습니다. 대소문자 정규화와 URI 전체 검증은 하지 않습니다. 빈 값 계약은 저장 값을 비우는 쪽(B)을 골라 기존 빈 값 회귀 12건이 그대로이고 호환성을 깨지 않습니다.
- 시간 fixture는 공통 `12:30:00`을 쓰는 안(A)을 골랐다가, antd가 offset 없는 값을 표시하지 않아 antd 표만 문서화된 저장 형식 `12:30:00Z`로 고쳤습니다. offset이 있는 값이 지역 시간으로 표시되는 것은 알려진 동작으로 둡니다.
- AJV README의 Draft-04와 Draft-06은 새 의존성 없이 문서를 고쳤습니다.
- ajv6 2번은 오류 뒤의 경로 문자열 해석으로는 동적 키를 되살릴 수 없어 compile 동안의 `jsonPointers` 전환을 골랐습니다.
- UI 플러그인 식별자는 코어 변경이 UI 플러그인 테스트를 깨뜨리므로 쌓인 풀 리퀘스트로 통합했습니다. 플러그인 풀 리퀘스트(#649)의 기준을 코어 브랜치로 두고 먼저 합친 뒤, 코어 풀 리퀘스트(#648)의 CI가 녹색이 된 뒤 병합했습니다. 저장소 스킬(`.claude/skills/react-plugin-implementation`, `.claude/skills/ui-plugin-guidelines`, `.claude/commands/create-canard-plugin.md`)의 변경은 별도 문서 커밋이며 지휘 세션이 차이를 읽고 승인했습니다.
- URI protocol 선택기의 접근성 이름 `Protocol`은 영어로 두고, 소비자가 넘기는 label 옵션은 새 API 결정이라 제안으로만 남겼습니다.

## 알려진 한계

아래는 의도해서 남긴 한계입니다. 다음 수집에서는 알려진 것으로 봅니다.

### 유틸리티 묶음

- `@winglet/common-utils`: clone 프로필 밖의 값(Symbol과 BigInt 감싼 값, WeakMap, WeakSet, Promise, 함수)과 임의의 생성자나 프로토타입 변조는 보장하지 않습니다. 끝나지 않는 hook은 호출도 pending으로 남깁니다. 호스트 오류 handler가 없는 비브라우저 프로세스는 scheduler 작업 오류로 종료될 수 있습니다. 2라운드의 다른 realm `isEmpty` 한계는 그대로입니다.
- `@winglet/react-utils`: React 16.14와 17의 layout effect 대체 경로에서는 자식 layout effect가 이전 commit의 콜백을 읽을 수 있습니다. 이 경로는 코드를 읽어 확인했고 런타임 테스트는 React 18과 19입니다. 숨긴 동안 앵커의 key를 바꾸면 목적지가 새로 마운트됩니다.
- `@winglet/style-utils`: 따옴표 없는 `url()` 안의 중괄호 스코핑 한계, 깊이 256 대체 경로, `destroyScope` 뒤의 주입 함수 한계는 그대로입니다.
- `@winglet/json-schema`: dialect URI의 퍼센트 escape와 깊이 대체 한계는 그대로이며, type 배열은 유효하고 중복이 없다고 전제합니다.
- `@winglet/data-loader`: 키별 `Error`는 `clear(key)`까지 캐시에 남습니다.

### @lerx/promise-modal과 @slats/agents-assets-sync

- `@slats/agents-assets-sync`: 독립된 두 프로세스가 같은 `AGENTS.md`를 동시에 고치면 나중에 쓴 쪽이 남습니다. 레거시 문서를 UTF-8로 바꾸지 않습니다. 대상이 없는 실행은 모든 출력에서 0이며 `--json`은 `units: []`를 출력합니다.
- `@lerx/promise-modal`: 호환 사본이 섞이면 정착 기록이 없는 노드는 기존 수동 종료 규칙을 따릅니다. 닫힌 shadow root, iframe과 다른 realm, window나 먼저 등록된 document 캡처의 Escape 처리 한계는 그대로입니다. React 18에는 Activity가 없어 해당 테스트를 건너뜁니다.

### @canard/schema-form

- 사용자 입력이 받은 `id`를 컨트롤에 두지 않으면 라벨 연결이 없습니다.
- 독립된 React 서버 렌더 root는 서버와 클라이언트에 같고 서로 다른 `identifierPrefix`를 지정해야 합니다.
- 내용을 볼 수 없는 context 객체를 제자리에서 바꾸면 감지하지 않습니다.
- 매 실행마다 다른 값을 쓰는 검증기는 끝나지 않습니다(IR-6). 한 번만 다른 값을 쓰는 검증기는 정착합니다.
- plugin scope 캐시는 realm 수명 동안 남습니다.
- 2라운드의 배열 전체 소유 기록과 Frame 다시 마운트 한계, 재귀 값의 깊이 256 한계는 그대로입니다.

### 플러그인 묶음

- 서버 HTML에는 antd-mobile Stepper의 내부 input id와 name, Switch의 id, Radio의 native name, Slider thumb의 id와 `aria-labelledby`, antd5와 antd6 slider handle의 id가 없습니다. 라이브러리가 그 속성을 넘기는 prop을 제공하지 않아 연결은 hydration에서 완성됩니다. README(영어와 한국어)에 적었습니다.
- 앞선 입력 정의(먼저 등록한 플러그인 정의, 필드 수준 입력 맵, Form과 Provider 정의, 인라인 `presentation.FieldInput`)가 그룹 입력을 앞서면, 렌더러는 어느 정의가 이겼는지 볼 수 없어 라벨의 `for`를 빠뜨릴 수 있습니다. 정확한 해결은 코어가 선택된 입력의 그룹 소유 정보를 넘기는 새 API입니다.
- antd-mobile은 React 19에서 라이브러리의 내부 갱신이 지운 라디오 native name을 microtask에서 복원하므로, 같은 task에서 바로 읽는 코드는 복원 전 값을 볼 수 있습니다.
- URI protocol 선택기의 접근성 이름 `Protocol`은 영어뿐입니다.
- antd 시간 입력은 offset이 있는 형식(`12:30:00Z`)을 요구하고 MUI와 antd-mobile은 offset 없는 시간도 받습니다. offset이 있는 값은 지역 시간으로 표시되며, 편집 뒤 MUI는 지역 `HH:mm:ss`를, antd는 지역 `HH:mm:00Z`를 기록합니다.
- AJV의 늦은 등록은 앞으로의 compile에만 적용되고 이미 만든 validator를 다시 만들지 않습니다. 같은 AJV 인스턴스를 여러 스레드에서 공유하는 계약은 없습니다.
- URI는 `localhost:3000`과 `a:b`도 문법상 scheme으로 나눕니다. scheme 없는 값의 주소를 `urn:isbn:1`로 바꾸면 그 값의 파싱 결과대로 scheme `urn:`이 표시됩니다.

## 소유자가 정할 일

- `@canard/schema-form` 9번의 가격: 배열 동사를 batch로 묶은 비용이 이전 묶음 대비 1.74(관찰자 없음)와 1.50(관찰자 있음), 순차 호출 대비 1.11과 1.06입니다. 대안은 EVENT-035의 위치 연속성을 문서에 남기는 문서 수정입니다.
- `@winglet/json`의 immutable 루트 연산: 소유자의 요청으로 즉시 복사를 지연 소유로 바꿔 세 행이 1.006, 1.011, 0.991이 되었습니다. 확인할 것은 두 가지입니다. 마지막 루트 `add`, `replace`의 결과가 patch 값과 같은 객체라는 공유 규칙, 그리고 루트 교체 뒤 같은 패치가 다시 쓸 때의 복사 한 번(속성 1,000개에서 약 1.15마이크로초)입니다.
- `@winglet/react-utils` 2번의 비용: `unmountHookRender` 1.125, `handleRender` 1.049입니다.
- `@winglet/style-utils`의 두 행: `scopeEscapes` 1.0555, `scopePseudo` 1.030입니다.
- ajv6 `rootCompile` 1.051입니다.
- `@winglet/common-utils` 4번의 scheduler 오류 규칙(작업 오류를 잃지 않고 handler가 없으면 호스트에 보고)을 확인해야 합니다.
- major로 기록한 변경 일곱 가지(호환성이 깨지는 변경 절의 표)를 확인해야 합니다.
- "먼저 물어볼 것"으로 정한 변경의 승인: `@lerx/promise-modal`의 `AbstractNode` getter, `@canard/schema-form`의 새 공개 API 네 가지(`FieldInputProps.id`, `FieldRendererProps.labelId`, `registerPlugin(plugin, { scope })`, `FormProvider`의 `pluginScope`)입니다.
- 서버 렌더에서 antd-mobile과 antd slider의 라벨 연결이 hydration에서야 완성되는 한계를 받아들일지 정해야 합니다.
- antd의 시간 형식(offset 필요)과 MUI의 시간 형식(offset 없음 허용)의 차이를 그대로 둘지 정해야 합니다.
- 사용자 입력이 받은 `id`를 컨트롤에 두었는지 확인하는, 켜야만 동작하는 개발 검사를 만들지 정해야 합니다.
- 공용 빌드 작업([#651](https://github.com/vincent-kk/albatrion/pull/651)): 15개 패키지(여섯 winglet 패키지, `@canard/schema-form`, ajv 플러그인 셋, UI 플러그인 넷, `@lerx/promise-modal`)가 CommonJS 선언 그래프(`.d.cts`)를 갖고, 내보내기 설정의 형태가 `import`와 `require` 분기별 `{ types, default }`로 바뀌었습니다. 실행 파일과 기존 ESM 선언은 바이트 단위로 같습니다(검토가 두 패키지를 기준 커밋에서 다시 빌드하여 확인). `@lerx/promise-modal`의 문서화된 `.d.cts` 부재 한계는 없앴습니다(모든 패키지의 소비자 경험을 하나로 맞추는 지휘 세션의 결정). 선언 생성 단계의 빌드 시간은 약 1.06배입니다. 내보내기 설정을 문자열로 읽는 외부 도구가 있으면 영향을 받으므로 patch 판정을 확인해야 합니다.
- #648은 GitHub이 100개가 넘는 커밋(124개)의 리베이스 병합을 거부하여, 지휘 세션이 브랜치를 `1.0.0/bugbounty`에 로컬 fast-forward로 병합하고 push했습니다. 풀 리퀘스트는 병합됨으로 표시됩니다. 이 방식을 받아들일지 정해야 합니다.
- 이번 라운드에 바뀐 패키지 동봉 에이전트 문서에 대해 `DOCUMENTATION.md` 원칙 7의 평가는 하지 않았습니다. 병합 전에 이 평가를 할지는 소유자가 정합니다.

## 미룬 항목과 위험

### 고치지 않았거나 확정하지 않은 것

- `@winglet/common-utils` 6번과 7번의 나머지는 [#651](https://github.com/vincent-kk/albatrion/pull/651)로 고쳤습니다. 남는 한계: `moduleResolution`이 `node10`인 소비자는 내보내기 설정을 읽지 않으므로 패키지 루트만 최상위 `types`로 해석되고 하위 경로의 타입은 해석되지 않습니다(이번 변경 전과 같습니다). 와일드카드 주소의 내보내기는 모든 분기를 증명할 수 없어 검증 스크립트가 명시적으로 거부합니다.
- 유틸리티 묶음은 [#650](https://github.com/vincent-kk/albatrion/pull/650)로 병합되었습니다. GitHub가 커밋 100개를 넘는 rebase 병합을 거부하여 #648과 같이 로컬 fast-forward 푸시로 병합했습니다.
- `@winglet/react-utils`의 `untrackedRender`와 `callbackHookRender` 행은 검토가 다시 재지 않았습니다.
- `@canard/schema-form`의 FCA 경계 검사는 facts 추출이 0개라 확정되지 않았고, 플러그인 묶음의 FCA 검증은 기준 커밋과 같은 기존 실패 6개를 냅니다. 둘 다 통과로 기록하지 않습니다.
- 코어가 선택된 입력의 그룹 소유 정보를 넘기는 API, `protocolAriaLabel` 같은 소비자 label 옵션, antd-mobile 라이브러리의 native name prop(상위 프로젝트 수정)은 제안으로만 남았습니다.
- 실제 브라우저에서의 수동 시나리오는 실행하지 않았습니다. `@canard/schema-form` 6번의 화살표 키 이동은 브라우저에서 확인하지 않았고, DOM 접근성과 상호작용은 테스트로 검증했습니다.

### 다음 수집에서 다시 나올 수 있는 지점

- `@canard/schema-form`: 사용자 입력의 `id` 배치, 독립 서버 렌더 root의 `identifierPrefix`, 제자리에서 바뀐 context 객체, 매번 다른 값을 쓰는 검증기, 구조 batch의 비용.
- UI 플러그인: 서버 HTML의 라벨 연결, 정의 우선순위가 가리는 그룹 판정, antd-mobile 라디오 name의 microtask 복원, 영어 `Protocol` 이름, 시간 형식 차이.
- `@winglet/common-utils`: clone 프로필 밖의 값, 끝나지 않는 hook.
- `@winglet/style-utils`: 따옴표 없는 `url()`의 중괄호.
- `@slats/agents-assets-sync`: 동시 실행의 마지막 쓰기 우선.

### 4라운드에 영향을 주는 과정 기록

- 검증 시간을 줄이는 검토 방식을 썼습니다. 구현자는 다시 쓸 수 있는 수정 전과 후의 번들, 행 manifest(손댄 행과 손대지 않은 행), 일부 행만 다시 재는 명령, 단계별 깊이(6회 선별, 손댔거나 1.01을 넘으면 12회, 1.03에서 1.06이면 24회 세 번), 동작을 바꾼 결정마다 세 근거의 증거를 남깁니다. 검토자는 번들의 해시를 먼저 확인하고 손댄 행, 손대지 않은 행 가운데 표본 세 개, 1.00을 넘은 행만 다시 재며, 손대지 않았다는 주장 세 개를 호출 경로로 확인하고, 실패하는 테스트는 high 항목과 결정 항목 전부와 low 항목의 표본으로 확인합니다. 검토는 묶음마다 한 번이고, 뒤의 작은 차이는 지휘 세션이나 검증 subagent가 읽습니다. 묶음별 검토는 유틸리티 약 56분, promise-modal과 agents 약 45분, schema-form 약 74분, 플러그인 약 55분이었습니다.
- 손대지 않았다는 주장의 확인이 효과가 있었습니다. 유틸리티 검토는 `untrackedRender`가 바뀐 hook을 함께 마운트하여 손대지 않은 행이 아님을 찾았습니다.
- 검토의 재측정은 구현자의 값과 자주 달랐습니다(`scopeEscapes` 1.032에서 1.0555, `handleRender` 1.023에서 1.049, 9번 1.43에서 1.74, `anchor-presence` 5.92에서 11.79, ajv6 `rootIdCompile` 1.040에서 1.027). 가격 판단은 검토의 값으로 하고 절대 비용(연산당 시간)을 함께 적습니다.
- 공유 코어 계약이 바뀌면 플러그인마다 모든 입력 정의를 렌더하는 동등성 표 테스트를 둡니다. 검증 subagent가 식별자 커밋에서 결함 셋과 코어의 name 누출을 찾았고, 표(93행, 이어서 98행)가 URI protocol 이름, 날짜 범위 끝점, 그룹 wrapper 결함을 더 찾았습니다.
- 코어 계약 변경이 소비 패키지의 테스트를 깨뜨리면 쌓인 풀 리퀘스트로 통합합니다. GitHub은 100개가 넘는 커밋의 리베이스 병합을 거부하므로 큰 묶음은 fast-forward 병합을 미리 계획합니다.
- 시간대가 다른 CI에서 시간 표시 테스트가 실패했습니다(12:30 PM 대 09:30 PM). 시간을 다루는 표는 UTC와 서울 두 시간대에서 실행하며, 시간대는 명령 앞 환경 변수가 아니라 runner 안에서 정합니다.
- 테스트 환경의 NWSAPI는 `:`가 든 scoped id를 선택자로 만들 때 잘못 escape하여, antd 테스트 설정에서만 CSS hex escape로 보정했습니다.
- 병렬 전체 실행에서 `serverImport` 테스트가 5초 제한에 걸렸고, 의존 패키지의 `dist`를 다시 만드는 중에 타입 검사가 실패한 적이 있습니다. 둘 다 단독 실행이나 직렬 재실행에서 통과했습니다. 검토의 첫 실패하는 테스트 실행은 `/tmp`와 `/private/tmp`의 모듈 경로 불일치로 테스트를 모으지 못했고, 실제 경로로 다시 실행했습니다.
- 소유자의 질문은 질문으로 다룹니다. Vincent가 결정의 이유를 물으면 이유를 먼저 답하고, 결정을 뒤집거나 작업을 멈추지 않습니다.
- 다음 함수는 두 라운드에 같은 종류의 결함을 냈으므로, 세 번째로 같은 종류가 보고되면 진동 신호입니다: `applyPatch`의 루트 소유, 다른 realm의 `clone`, `getTrackableHandler`의 hook, `compressCss`의 문자열 문맥, 플러그인의 URI scheme, 재사용 템플릿의 `active` gate, Activity 아래의 `Portal`, agents의 터미널 계획 경로.
