# 1라운드 버그 바운티 수정 기록

1라운드에서 확인된 79건(16개 패키지)은 모두 처리되어 있습니다. 72건은 코드를 고쳤고, 7건은 코드의 동작이 맞다고 판단하여 문서만 고쳤으며, 고치지 않고 남긴 항목은 없습니다. 수정은 패키지마다 하나씩 모두 16개의 풀 리퀘스트(626번부터 641번)로 `1.0.0/bugbounty` 브랜치에 리베이스 병합되어 있고, 병합이 끝난 브랜치의 끝 커밋은 `2d206783c`입니다. 검토 과정에서 드러난 형제 결함과 회귀도 같은 풀 리퀘스트에서 함께 고쳤으며, 그 범위는 패키지별 표에 적혀 있습니다. 이 문서의 용어(실패하는 테스트 커밋, 속도 조건, 형제 결함 등)는 [`../FIX-PROCEDURE.md`](../FIX-PROCEDURE.md)를 따릅니다.

커밋 해시는 모두 `1.0.0/bugbounty`에 병합된 뒤의 해시입니다. 풀 리퀘스트 본문에 적힌 해시는 리베이스 병합 전의 것이라 이 브랜치에 없습니다.

## 패키지별 결과

상태의 뜻은 다음과 같습니다. "수정됨"은 실패하는 테스트로 재현한 뒤 코드를 고친 항목입니다. "문서만 수정됨"은 코드의 동작을 그대로 두고 문서를 코드에 맞춘 항목입니다. "추가 수정"은 1라운드 문서에 번호가 없지만 검토나 리베이스 단계에서 찾아 함께 고친 형제 결함 또는 회귀입니다.

### @winglet/common-utils

풀 리퀘스트: [#626](https://github.com/vincent-kk/albatrion/pull/626). 실패하는 테스트 커밋은 `3259c2973`, `8b01c9423`, `5386e569e`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `c42d909ee`, `284d0cac5` | `equals`와 `stableEquals`가 `ArrayBuffer`, `DataView`, 박싱된 원시값을 내용으로 비교하고, 그 상태가 같으면 자기 속성 비교를 이어 갑니다. |
| 2 | 수정됨 | `cdc6a2942` | `debounce`가 디바운스된 함수 안에서 들어온 호출을 다음 대기 시간이 지난 뒤에 실행합니다. |
| 3 | 수정됨 | `e789d53cf` | `withTimeout`이 이미 중단된 신호를 받으면 곧바로 `AbortError`로 거부합니다. |
| 4 | 수정됨 | `983ad29ae`, `06ec70d45`, `6da60798f` | `clone`이 박싱된 원시값(다른 realm 포함)의 값과 프로토타입을 유지하고, `AggregateError`의 `message`와 `errors`를 유지합니다. |
| 5 | 수정됨 | `75ee9bdbf`, `06ec70d45` | `clone`이 상속된 setter, getter, 읽기 전용 속성이 가로챌 필드를 자기 데이터 속성으로 정의합니다. |
| 6 | 수정됨 | `0f0a77db2` | `stableEquals`가 오른쪽 피연산자의 자기 키만 일치로 인정합니다. |
| 7 | 수정됨 | `cdc6a2942` | `debounce`가 예외를 던진 leading 호출을 trailing에서 다시 실행하지 않습니다. 2번과 원인이 같습니다. |
| 추가 수정 | 수정됨 | `284d0cac5` | 검토에서 찾은 회귀입니다. 내장 객체의 상태가 같을 때 자기 속성 비교를 건너뛰던 것을 고쳤습니다. |
| 추가 수정 | 수정됨 | `6da60798f` | 다른 realm에서 온 박싱된 원시값의 복제를 고쳤습니다. |

함께 고친 형제 범위: `equals`는 메시지가 다른 오류 객체도 `name`과 `message`로 구별합니다.

### @winglet/data-loader

풀 리퀘스트: [#627](https://github.com/vincent-kk/albatrion/pull/627). 실패하는 테스트 커밋은 `8a73693e8`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `017cec93b`, `91d16d1f7` | 배치는 첫 키를 담고 그 키를 캐시에 기록한 뒤에 등록되고 예약됩니다. 동기 스케줄러 `(fn) => fn()`에서는 `load()` 하나가 키 하나짜리 배치로 실행됩니다. |
| 2 | 수정됨 | `d5c52655c` | `load()`가 `cacheKeyFn`이 돌려준 캐시 키를 그대로 쓰므로, `0`, `''`, `false`, `null`, `NaN` 같은 falsy 키도 캐시됩니다. |

### @slats/agents-assets-sync

풀 리퀘스트: [#628](https://github.com/vincent-kk/albatrion/pull/628). 실패하는 테스트 커밋은 `92aca6981`, `651bda4f9`, `139ee0736`, `718d62feb`, `1b16f6d85`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `46b3b2242` | `..` 세그먼트가 있는 manifest 키와 네임스페이스 접두사는 예외를 던집니다. |
| 2 | 수정됨 | `14fbb3aaa`, `0315a9c77` | 고아 파일이 있으면 언제나 `requiresForce`가 켜지고, 확인 대화상자가 삭제 목록을 보여 주며 수락 버튼이 하는 일(삭제, 덮어쓰기, 둘 다)을 이름으로 밝힙니다. |
| 3 | 수정됨 | `14fbb3aaa` | 비대화형 `--force`가 고아 파일 삭제 목록을 stderr에 남깁니다. |
| 4 | 수정됨 | `722ee4278`, `57b340ad9` | CRLF 줄바꿈의 블록을 인식하고, 줄바꿈만 다른 본문은 최신으로 봅니다. LF 경로는 원래 코드에 `indexOf('\r')` 한 번이 더해진 형태입니다. |
| 5 | 수정됨 | `61dcbf5f7` | 고아 파일 탐색이 소스 해시 계산과 같은 잡음 파일 필터(`.DS_Store` 등)를 씁니다. |
| 6 | 수정됨 | `78c73840d` | `--force`가 필요한 계획의 `--dry-run`이 종료 코드 0을 반환하고, 적용에 `--force`가 필요하다고 알립니다. |
| 추가 수정 | 수정됨 | `8869810d5` | 프로젝트 범위에서, 심볼릭 링크가 프로젝트 밖으로 풀어내는 대상 루트와 네임스페이스를 거부합니다. |
| 추가 수정 | 수정됨 | `c5c3f6f2f` | 프로젝트 범위에서, 대상 루트 아래의 파일 링크와 디렉터리 링크를 거쳐 쓰는 것을 거부합니다. |
| 추가 수정 | 수정됨 | `1fc7e1ec5` | 디렉터리 목록이 종류를 알려 주지 않는 항목은 이름으로 다시 검사합니다. |
| 추가 수정(속도) | 완료 | `0a4a70d68`, `1f6551320`, `911769a43` | 쓰기 검사를 디렉터리마다 한 번의 목록 읽기로 바꾸고, 캐시된 부모 목록으로 판정하며, 서로 다른 조상 아래의 디렉터리를 동시에 검사합니다. |

함께 고친 형제 범위: 심볼릭 링크 검사는 `--scope=project`에서 각 종류 루트, `AGENTS.md`, 각 스킬 디렉터리, 그 아래에 쓰는 모든 디렉터리와 파일에 적용됩니다. 백슬래시만 있는 키와 드라이브 문자 키는 대상을 받지 않으며, 테스트(`f71287f65`)가 이를 고정합니다.

### @canard/schema-form-ajv8-plugin

풀 리퀘스트: [#629](https://github.com/vincent-kk/albatrion/pull/629). 실패하는 테스트 커밋은 `d5b97fb4c`, `4e1d90e8b`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `411f76652`, `aafdf0732` | 루트에 `$id`가 있어도 세 진입점 모두 issue의 `schemaPath`를 작성된 `#/…` 형태로 보고합니다. |
| 2 | 수정됨 | `411f76652`, `c9f790e90`, `da971b762` | 단일 키 `not.required` 조회가 `#/…` 경로만 읽으므로, `$id`가 있는 루트는 올바른 키를 보고하고 다른 자원은 `rejectedKey`를 붙이지 않습니다. |
| 3 | 수정됨 | `229ed133d`, `0561a6457` | 값 수준의 `false` 스키마 issue가 값에 남습니다. `items`, `properties`처럼 키워드와 같은 이름의 필드에서도 같습니다. |
| 4 | 수정됨 | `dabab5fa4` | 퍼센트 인코딩된 스키마 경로 세그먼트를 디코딩하여 `rejectedKey`를 찾습니다. |
| 5 | 수정됨 | `79103225d` | `propertyNames` 안에서 생긴 모든 issue가 거부된 키를 가지고, `propertyNames: false`는 객체의 `dataPath`를 유지합니다. |
| 추가 수정 | 수정됨 | `0561a6457` | 검토에서 찾은 결함입니다. `then: false`가 `items`나 `properties`라는 이름의 필드에 있을 때 필드 이름을 키워드로 읽던 것을 고쳤습니다. |

함께 고친 형제 범위: `properties`, `patternProperties`, `items`, `prefixItems` 아래의 `false`는 계속 자식의 키를 거부합니다. 인라인된 `$ref` 대상이나 `allOf`로 도달한 `false` 스키마는 `rejectedKey`를 가지지 않습니다.

### @winglet/react-utils

풀 리퀘스트: [#630](https://github.com/vincent-kk/albatrion/pull/630). 실패하는 테스트 커밋은 `4fa7fbc01`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 문서만 수정됨 | `07b241c3f` | `useOnUnmount`와 `useOnUnmountLayout`은 가장 최근 렌더의 핸들러를 실행하며, 문서가 그렇게 설명합니다. 코드는 그대로입니다. |
| 2 | 수정됨 | `d8360463f` | `useRestProperties`에서 `undefined` 값은 이전 객체가 같은 키를 자기 키로 가질 때만 일치하므로, 키 이름이 바뀌면 새 객체를 반환합니다. |

### @winglet/json

풀 리퀘스트: [#631](https://github.com/vincent-kk/albatrion/pull/631). 실패하는 테스트 커밋은 `9edaa44c8`, `dec0cb430`, `0481326c1`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨(호환성 깨짐) | `2af7e7606` | `move`는 원본을 잘라 낸 뒤 `path`에 추가하며, `path`는 제거 뒤의 문서를 기준으로 해석합니다(RFC 6902 4.4). |
| 2 | 수정됨(호환성 깨짐) | `2af7e7606` | `copy`는 배열 인덱스에 `add`처럼 삽입합니다(RFC 6902 4.5). |
| 3 | 수정됨(호환성 깨짐) | `1ec1f85be` | `test`는 모든 모드에서 값을 비교하고 실패하면 `PATCH_TEST_FAILED`로 중단합니다. `strict`는 타입에 `@deprecated`로 남아 있고 읽히지 않습니다. |
| 4 | 수정됨(호환성 깨짐) | `2af7e7606` | `from`이 `path`의 진접두사인 `move`만 순환으로 봅니다. `from`과 `path`가 같은 `move`와 자기 하위로의 `copy`는 성공합니다. |
| 5 | 수정됨(호환성 깨짐) | `4f374f0a0` | 없는 객체 멤버에 대한 `replace`는 `PATCH_OBJECT_PROPERTY_NOT_FOUND`를 던집니다(RFC 6902 4.3). |
| 6 | 수정됨(호환성 깨짐) | `37fa76f46` | 앞에 0이 붙은 배열 인덱스는 `PATCH_ARRAY_INDEX_INVALID`를 던집니다(RFC 6901 4). |
| 7 | 문서만 수정됨 | `e9ec6df19`, `61c42806f`, `448adef35` | 첫째 불일치는 `convertJSONPointerToPath`가 돌려주는 데이터 경로 문자열을 문서가 설명하도록 고쳤습니다. 둘째 불일치는 `getValue`가 없는 위치에서 `undefined`를 반환하고 일반 키로 상속 멤버를 읽는다는 것과 실제 오류 코드를 문서에 적었습니다. 코드는 그대로입니다. |
| 추가 수정 | 수정됨 | `4f9ca9919`, `4983f912a` | 열 자리 이상의 인덱스가 32비트 변환으로 실제 요소에 닿던 것을 고쳤습니다. 인덱스는 4294967294까지 정확하게 처리합니다. |
| 추가 수정 | 수정됨 | `f1115019a`, `4983f912a` | 없는 위치에서의 `copy`는 `move`와 같은 오류 코드를 던지고, 값이 `undefined`로 존재하는 위치는 복사합니다. |

`e9df38a2a`는 위 수정을 `applyPatch`의 자주 도는 경로에서 떼어 내는 속도 커밋입니다.

### @canard/schema-form-ajv7-plugin

풀 리퀘스트: [#632](https://github.com/vincent-kk/albatrion/pull/632). 실패하는 테스트 커밋은 `0c78a2f6c`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `4e6ed8b8a` | 제자리 키워드(`then: false`, `allOf`, 인라인된 `$ref` 대상, `dependencies`, `dependentSchemas`, `propertyNames: false`)로 도달한 `false` 스키마 issue가 값에 남고 `rejectedKey`를 가지지 않습니다. |
| 2 | 수정됨 | `a550bb70f`, `d89b8d7fa` | 스키마 경로 세그먼트를 JSON Pointer 해제 전에 디코딩하고, 찾은 키를 컴파일된 검증기마다 기억합니다. |

함께 고친 형제 범위: 스키마 경로를 루트에서부터 걸으므로 `items`, `properties` 같은 이름의 필드와 정의를 이름으로 읽습니다. `properties/<이름>`, `patternProperties/<패턴>`, `items/<인덱스>`, 단일 `items`에 있는 `false`만 자식 키를 거부합니다.

### @canard/schema-form-ajv6-plugin

풀 리퀘스트: [#633](https://github.com/vincent-kk/albatrion/pull/633). 실패하는 테스트 커밋은 `12c8e8dd4`, `ef867934a`, `9d06bd9b3`, `b180dc0df`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `559f475f5`, `215c215e6`, `0b0a130e5`, `aea16e110` | 값 수준의 `false` 스키마 issue가 값에 남고 `rejectedKey`를 가지지 않습니다. `items`나 `properties`라는 이름의 필드와 자기 `$id`를 가진 하위 스키마 안에서도 같습니다. |
| 2 | 수정됨 | `a05b92d4b`, `215c215e6`, `1afd4aadc` | 퍼센트 인코딩된 세그먼트를 디코딩하여 `not.required`의 키를 보고하고, 키는 검증기가 컴파일한 스키마 사본에서 읽습니다. |
| 추가 수정 | 수정됨 | `215c215e6` | AJV 6은 `$id` 자원 안의 경로를 해시 없이 내보냅니다. 선언된 식별자를 검증기마다 한 번 모아 그 경로를 자원 기준으로 다시 해석합니다. |
| 추가 수정 | 수정됨 | `0b0a130e5` | 자원 식별을 연결된 Ajv와 같게 맞췄습니다. `schemaId`가 `'id'`나 `'auto'`이면 draft-04 `id`도 식별자로 보고, `const`, `enum`, `examples`, `default` 안은 찾지 않습니다. |
| 추가 수정 | 수정됨 | `aea16e110` | 데이터 키워드 건너뛰기는 스키마 위치에만 적용합니다. `properties`, `patternProperties`, `definitions`, `dependencies` 안의 키는 이름이므로 `default`나 `enum`이라는 이름의 필드도 걷습니다. |

속도 커밋은 `60e961366`, `f85696c5a`, `94f0fec92`, `b45b5aa60`입니다.

### @lerx/promise-modal

풀 리퀘스트: [#634](https://github.com/vincent-kk/albatrion/pull/634). 실패하는 테스트 커밋은 `c7d248370`, `0c27a9fe2`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `976bea58f` | 포커스가 목록에 있는 컨트롤이 아니고 문서 순서로 앞에 컨트롤이 없으면 트랩이 순환합니다. |
| 2 | 수정됨 | `2163c1af6`, `127741709`, `7633cb21a` | 열린 shadow root 안의 컨트롤을 호스트 자리에 끼워 넣고, 포커스된 요소를 shadow root를 거쳐 읽습니다. |
| 3 | 수정됨 | `976bea58f` | 1번과 같은 수정입니다. 첫 컨트롤 앞이나 마지막 컨트롤 뒤의 `tabindex="-1"` 요소에서 Tab과 Shift+Tab이 모달 안에서 순환합니다. |
| 4 | 수정됨 | `480f409f2`, `9f157e73d`, `b5ec65619` | 프로바이더의 `root`가 바뀌어 앵커가 옮겨진 뒤 포커스되어 있던 컨트롤에 다시 포커스를 줍니다. 열린 shadow root 안의 컨트롤도 포함합니다. |
| 5 | 수정됨(호환성 깨짐) | `4067b74f5`, `5d17a81cb`, `f2efae51f` | Escape 한 번은 모달을 하나까지만 닫습니다. 최상위 모달 안의 컨트롤이 `preventDefault` 없이 스스로 닫아도 같습니다. |
| 6 | 수정됨 | `7252479d8` | 소유권이 넘어갈 때 보이던 모달은 넘겨받은 프로바이더의 경로를 따릅니다. |
| 7 | 수정됨 | `23d1cdb37`, `7385c8e5b` | 편집 가능한 `contenteditable` 값(빈 값, `plaintext-only`, 대소문자 변형)을 모두 Tab 정지점으로 인식합니다. |
| 8 | 수정됨 | `1ebb17eb1`, `8f0558993` | 연 요소가 문서에서 떨어져 있으면 남아 있는 최상위 dimmed 모달에 포커스를 줍니다. 연 요소의 기록이 없으면 이전 동작을 유지합니다. |
| 추가 수정 | 수정됨 | `7633cb21a` | 검토에서 찾은 shadow DOM 빈틈 두 가지입니다. 라디오 그룹을 트리마다 따로 묶고, 어떤 slot도 그리지 않는 호스트 자식을 건너뜁니다. |
| 추가 수정 | 수정됨 | `b5ec65619` | `root`가 바뀔 때 shadow root 안쪽의 활성 요소를 기억합니다. |
| 추가 수정 | 수정됨 | `8f0558993` | 제거된 연 요소에 대한 대체 동작을 기록된 연 요소에만 적용합니다. |
| 추가 수정 | 수정됨 | `f2efae51f` | Escape의 자기 종료 감지를 정착 횟수 카운터로 바꿨습니다. |
| 추가 수정 | 수정됨 | `127741709` | Tab 후보 수집이 `NodeFilter`와 `ShadowRoot` 전역 없이 동작합니다. |

### @winglet/json-schema

풀 리퀘스트: [#635](https://github.com/vincent-kk/albatrion/pull/635). 실패하는 테스트 커밋은 `aaba091cb`, `fe3c30b06`, `9ec2296b3`, `c8d3d3e38`, `adb03a078`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `ddeb1e524`, `64ddf160b`, `baada168d`, `2a7473f7e`, `71bd678cf`, `5c58a969e` | 어떤 키도 가리키지 않는 주소를 찾을 때 등록된 문서를 먼저 모두 색인합니다. 등록된 키의 주소를 다른 등록 문서가 내장하면 참조 순서와 조회 이력에 상관없이 중복 식별자 오류를 던집니다. |
| 2 | 수정됨(호환성 깨짐) | `28b401014`, `56a4a1f3a` | 리졸버 없는 스캐너가 식별자 키워드(`id` 또는 `$id`)를 하위 스키마가 선언한 방언에서 고릅니다. |
| 3 | 수정됨 | `e3d0e87a0` | 복사한 위치의 방언에서 식별자인 키워드만 지웁니다. |
| 4 | 수정됨 | `14554c1cf` | `resources`의 키를 참조와 같은 URI 정규화를 거쳐 맞춥니다. 한 주소의 두 철자는 같은 문서를 등록해야 합니다. |
| 추가 수정 | 수정됨 | `64ddf160b` | 조회 실패 뒤의 전체 색인이 등록 순서에 따라 달라지던 것을 고쳤습니다. |
| 추가 수정 | 수정됨 | `baada168d` | 이미 아는 내장 주소의 직접 조회가 참조 순서에 따라 달라지던 것을 고쳤습니다. |
| 추가 수정 | 수정됨 | `2a7473f7e`, `71bd678cf` | 정규화되지 않은 키가 있을 때 아는 주소의 조회가 이력에 따라 달라지던 것을 고쳤습니다. |
| 추가 수정 | 수정됨 | `5c58a969e` | 등록 검사가 실패한 주소는 검사된 것으로 남기지 않으므로, 같은 리졸버에서 다시 시도해도 내장 스키마를 반환하지 않습니다. |

### @canard/schema-form

풀 리퀘스트: [#636](https://github.com/vincent-kk/albatrion/pull/636). 실패하는 테스트 커밋은 `e5d2221b8`, `ef9a73d6b`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `2a15e482d` | 의존 대상이 트리에서 빠지면 그 하위 트리를 읽던 derive 규칙을 다시 실행합니다. |
| 2 | 수정됨 | `e785a4f7f` | `Activity`로 파일 입력을 숨겼다가 보여도 첨부 파일이 유지됩니다. |
| 3 | 수정됨 | `19ca52638` | `useFormSubmit`이 컴포넌트가 커밋될 때마다 `ref.current.submit`이 바뀌었는지 보고 다시 연결합니다. |
| 4 | 수정됨 | `46650871c`, `502869c7b` | 경로를 코드 부분에서만 찾습니다. 문자열 리터럴, 템플릿 텍스트, 주석, 정규식 리터럴 안의 글자는 바꾸지 않습니다. |
| 5 | 수정됨(호환성 깨짐) | `653e20feb` | `null`로 로드된 nullable 가지는 `node.value`와 FieldInput의 `value` prop에서 `null`로 읽힙니다. |
| 6 | 수정됨 | `ce1288afa`, `5b1b5991b` | 보류 중인 issue의 경로가 배열 항목을 따라 움직이고, 제거된 항목의 issue는 폼 전체 목록에서 빠지며, `UpdateError`와 `UpdateGlobalError`가 전달됩니다. |
| 7 | 수정됨 | `66229dd1d` | 감시하는 값이 모두 `Object.is`로 같으면 `watchValues`가 같은 배열을 유지합니다. |
| 8 | 수정됨 | `c7c107596` | 예외를 던진 `registerPlugin` 호출은 플러그인의 어떤 부분도 적용하지 않습니다. |
| 추가 수정 | 수정됨 | `46650871c` | 검토에서 찾은 회귀입니다. 주석이나 정규식 리터럴 안의 따옴표가 뒤의 경로를 가리던 것을 고쳤습니다. |
| 추가 수정 | 수정됨 | `ce1288afa` | 검토에서 찾은 빈틈입니다. 배열 항목이 움직인 뒤 `onValidate`가 다시 쓴 issue 목록을 받습니다. |
| 추가 수정 | 수정됨 | `502869c7b` | 템플릿 자리표시자 안의 경로가 그 자리표시자를 닫는 중괄호에서 끝납니다. 문서의 예시 `` `${../first} ${../last}` ``가 컴파일됩니다. |

함께 고친 형제 범위: 따옴표와 주석이 없는 표현식은 수정 전과 같은 출력을 냅니다. 기존 경로 정규식 테스트 말뭉치의 710개 표현식 가운데 그 자체가 정규식 리터럴인 `/pattern/` 하나만 다릅니다.

### @winglet/style-utils

풀 리퀘스트: [#637](https://github.com/vincent-kk/albatrion/pull/637). 실패하는 테스트 커밋은 `c46ec1288`과, `9e1ac5859`부터 `75e636d32`까지의 검토 항목 재현 커밋, 그리고 `7ff00a9a2`, `0b04934fd`, `9447879cf`, `4b31415af`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨(호환성 깨짐) | `904c6ee2b`, `d305fe8dc` | 규칙을 중괄호 깊이로 걷습니다. 묶음 at-rule(`@media`, `@supports`, `@container`, `@layer`, `@scope`, `@document`, `@starting-style`) 안의 규칙은 재귀적으로 스코프를 붙이고, 다른 at-rule은 그대로 복사합니다. |
| 2 | 수정됨(호환성 깨짐) | `cd3dbc577` | 선택자 목록을 최상위 쉼표에서만 나누어 모든 선택자에 스코프를 붙입니다. |
| 3 | 수정됨 | `e0382d335` | `+` 양옆 공백은 괄호 밖에서만 지웁니다. |
| 4 | 수정됨 | `968812ab4`, `bae381980` | 따옴표 문자열과 따옴표 없는 `url(…)`을 그대로 복사합니다. |
| 5 | 수정됨 | `0ba0fa859`, `0abbdbf83` | 콜론이 선언에 속할 때만 그 앞의 공백을 지웁니다. |
| 추가 수정 | 수정됨 | `d305fe8dc` | 스코프 처리를 문자열, 주석, 이스케이프, 따옴표 없는 `url(…)` 안쪽을 건너뛰는 단일 전방 스캐너(`RuleScoper`)로 바꿨습니다. 그 안의 중괄호, 세미콜론, 쉼표는 구조로 읽지 않습니다. |
| 추가 수정 | 수정됨 | `d305fe8dc` | 떠도는 `}`와 규칙 사이의 주석을 버리고, 선언문만 있는 시트를 유지하며, 주석이 앞에 붙은 at-rule을 인식합니다. |
| 추가 수정 | 수정됨 | `0abbdbf83` | 콜론이 선언을 시작하는지 판정할 때 주석을 건너뜁니다. |
| 추가 수정 | 수정됨 | `d2faa3715` | `url(`을 대소문자와 상관없이 인식합니다. |
| 추가 수정 | 수정됨 | `db1bfd75b` | 따옴표 없는 `url()` 안의 세미콜론은 선언문을 끝내지 않습니다. |
| 추가 수정 | 수정됨 | `d36dccac9` | `url(`은 식별자가 아닌 문자 뒤에서만 URL로 읽습니다. `myurl(` 같은 함수는 URL이 아닙니다. |
| 추가 수정(속도) | 완료 | `f1ce75f94` | 평평한 스타일 규칙은 구조 탐색 없이 빠른 경로로 처리하며, 그 출력은 일반 경로와 바이트 단위로 같습니다. |

검토에서 찾은 회귀 3건이 위 추가 수정에 들어 있습니다. 동등성은 고정된 기준 스코퍼와의 비교 7380건에서 불일치 0건이고, `@lerx/promise-modal`이 주입하는 시트 5개는 수정 전후가 바이트 단위로 같습니다.

### @canard/schema-form-antd-mobile-plugin

풀 리퀘스트: [#638](https://github.com/vincent-kk/albatrion/pull/638). 실패하는 테스트 커밋은 `986589062`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨(호환성 깨짐) | `e61767f9d`, `0afee775f`, `80dabfc14` | 스키마 타입만으로 슬라이더 모양을 정합니다. 배열 스키마는 범위 슬라이더로 숫자 두 개짜리 배열만 쓰고, 숫자 스키마는 핸들 하나로 숫자만 씁니다. |
| 2 | 수정됨 | `00bf6493b` | 읽기 전용 폼의 라디오 그룹, 체크박스 그룹, 슬라이더가 비활성화됩니다. |
| 3 | 문서만 수정됨 | `fb6ddeaf9` | README(영어와 한국어)가 미정 상태는 `null`과 불리언이 아닌 값에서 나타나고 `undefined`는 체크 해제로 보인다고 설명합니다. |
| 대조 테스트 | 변경 없음 | `fcc08ebe5` | nullable 배열 노드가 `null`을 보고할 때 체크박스 그룹, 범위 슬라이더, 동적 목록이 빈 상태를 그리고 첫 변경에서 배열을 기록합니다. 대조 테스트 3건이 플러그인 변경 없이 통과합니다. |

함께 고친 형제 범위: 2번에서 슬라이더는 1라운드 문서의 재현 대상이 아니었지만 같은 종류의 형제로 함께 잠갔습니다. README의 입력 우선순위 목록은 실제 적용 순서(Slider가 Array보다 먼저)와 같습니다.

### @canard/schema-form-antd6-plugin

풀 리퀘스트: [#639](https://github.com/vincent-kk/albatrion/pull/639). 실패하는 테스트 커밋은 `0d186f837`, `e10b5eb9e`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `95ef2e44a`, `dd7d447d0` | 시간 범위의 `minimum`과 `maximum`이 달력 날짜가 아니라 현지 시각의 시와 분을 제한합니다. `minimum`이 `maximum`보다 늦으면 자정을 넘는 구간을 허용합니다. |
| 2 | 수정됨 | `1c07d782b`, `4fb4b6ba9` | 읽기 전용이면 라디오 그룹, 체크박스 그룹, enum 셀렉트, 슬라이더가 비활성화됩니다. |
| 3 | 수정됨 | `fff384c97` | 읽기 전용이면 시간, 날짜 범위, 월 범위, 시간 범위 피커가 비활성화됩니다. |
| 4 | 수정됨 | `8fac0d7a4`, `f3316453a` | 프로토콜 목록에 없는 스킴을 유지하고 드롭다운에 추가 선택지로 보여 줍니다. |
| 5 | 수정됨 | `23ba16283`, `e0cbe8f16` | `focus(path)`가 슬라이더 핸들에 포커스를 줍니다. |
| 6 | 문서만 수정됨 | `b432a7e58` | README(영어와 한국어)가 미정 상태가 나타나는 조건을 코드대로 설명합니다. |
| 추가 수정(7) | 수정됨 | `fd1b45d49` | `@canard/schema-form` 5번의 후속입니다. 값이 `null`인 nullable 다중 enum 셀렉트가 `null` 태그 없이 비어 보이고, 선택하면 배열을 기록합니다. |

`58f800e77`은 시간 파싱이 dayjs의 `customParseFormat`에 의존한다는 점을 패키지 `CLAUDE.md`에 적은 문서 커밋입니다.

### @canard/schema-form-antd5-plugin

풀 리퀘스트: [#640](https://github.com/vincent-kk/albatrion/pull/640). 실패하는 테스트 커밋은 `cf24ffa26`, `7fdd51422`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `6ba71c537`, `0a13f68e9` | 시간 범위의 `minimum`과 `maximum`이 현지 시각의 시와 분을 제한합니다. 최솟값이 최댓값보다 늦은 구간은 자정을 넘어 이어집니다. |
| 2 | 수정됨 | `10f37b0fe`, `575c24de1` | 읽기 전용이면 라디오 그룹, 체크박스 그룹, enum 셀렉트, 슬라이더가 비활성화됩니다. |
| 3 | 수정됨 | `c1cb8399a` | 읽기 전용이면 시간, 날짜 범위, 월 범위, 시간 범위 피커가 비활성화됩니다. |
| 4 | 수정됨 | `311394c8b`, `438b48a39`, `43270c880` | 프로토콜 목록에 없는 스킴을 유지하고 드롭다운에 추가 선택지로 보여 줍니다. |
| 5 | 수정됨 | `6bf20bf11`, `bfeadf456` | 슬라이더 핸들이 `data-focus-target`을 가지므로 `focus(path)`가 닿습니다. |
| 6 | 문서만 수정됨 | `faea6e8b1` | README가 `null`과 불리언이 아닌 값에서 미정 상태가 나타나고 설정되지 않은 값은 체크 해제로 보인다고 설명합니다. |
| 추가 수정(7) | 수정됨 | `2169b08f0` | `@canard/schema-form` 병합 뒤에 찾은 항목입니다. 값이 `null`인 다중 enum 셀렉트가 선택 없음으로 보이고, 선택하면 배열을 기록합니다. |

함께 고친 형제 범위: antd6에서 확인된 속도 개선 세 가지(파싱한 스킴으로 URI 프로토콜 상태 시작, 슬라이더 포커스 대상의 ref 콜백, 패널이 처음 물을 때의 시간 범위 제한 파싱)를 옮겨 왔습니다. `6a1fecbf7`은 `customParseFormat` 의존을 패키지 `CLAUDE.md`에 적은 문서 커밋입니다.

### @canard/schema-form-mui-plugin

풀 리퀘스트: [#641](https://github.com/vincent-kk/albatrion/pull/641). 실패하는 테스트 커밋은 `8a5afbe6c`, `ba62487dc`입니다.

| 항목 | 상태 | 수정 커밋 | 한 줄 설명 |
|---|---|---|---|
| 1 | 수정됨 | `8c2dffce9`, `15a24d694` | 읽기 전용 폼의 라디오 그룹, 체크박스 그룹, 불리언 체크박스, 슬라이더가 비활성화됩니다. |
| 2 | 수정됨 | `36b9af67d` | 프로토콜 목록에 없는 스킴을 유지하고 드롭다운에 보여 줍니다. |
| 3 | 수정됨 | `66687d247`, `2ee9be90b`, `d12f421ca` | 날짜와 월 피커가 `presentation.FieldInputProps.minimum`과 `maximum`을 읽습니다. 제한은 `YYYY-MM-DD`와 `YYYY-MM`으로 엄격하게 파싱합니다. |
| 4 | 수정됨 | `b34c1b006`, `c37c17364` | 값이 없는 슬라이더는 첫 변경 전까지 썸과 값 레이블을 숨기고 `aria-valuenow`를 생략하며 `Not set`을 알립니다. |
| 5 | 문서만 수정됨 | `16800dc13` | README가 미정 상태는 `null`과 불리언이 아닌 값에서 나타난다고 설명합니다. |
| 6 | 문서만 수정됨 | `1cc73a6f2` | README가 시간은 오프셋 없이 `HH:mm:ss`로 저장되고 enum 셀렉트는 단일 문자열을 다룬다고 설명합니다. |
| 추가 수정 | 수정됨 | `c37c17364` | 검토에서 찾은 결함입니다. 값이 없는 슬라이더에서 Home 키나 최솟값을 고르면 그 첫 선택을 저장합니다. |
| 추가 수정 | 수정됨 | `c37c17364` | 값이 없는 상태를 `aria-valuetext`로 알립니다. 문구는 `presentation.FieldInputProps.unsetValueText`로 바꿀 수 있습니다. |
| 추가 수정 | 수정됨 | `2ee9be90b` | `2024-02-31` 같은 잘못된 제한은 다음 달로 넘기지 않고 무시합니다. |
| 대조 테스트 | 변경 없음 | `2d206783c` | nullable 배열 값이 `null`일 때 체크박스 그룹과 배열 입력이 비어 보이고 첫 변경에서 배열을 기록합니다. 대조 테스트 2건이 수정 없이 통과합니다. |

이 플러그인에는 다중 enum 셀렉트와 범위 슬라이더가 없습니다.

## 속도

비율은 일반 입력에서 수정 후 시간을 수정 전 시간으로 나눈 값입니다. 1.03 이하는 측정 오차로 봅니다. 1.03을 넘는 행은 모두 아래에 따로 적고, 추가된 연산과 그것이 필요한 이유, 측정하고 버린 대안을 적습니다.

### 유틸리티 패키지

| 패키지 | 행 | 비율 | 판정 |
|---|---|---|---|
| `@winglet/common-utils` | `clone` 전체 | 0.73에서 0.93 | 통과입니다. |
| `@winglet/common-utils` | `equals` 전체 | 0.99에서 1.00 | 통과입니다. |
| `@winglet/common-utils` | `stableEquals` 전체 | 1.00에서 1.03 | 통과입니다. 6번 항목이 요구하는 자기 키 검사가 더해진 값입니다. |
| `@winglet/common-utils` | `debounce`, `throttle`, `withTimeout` | 1.00 | 통과입니다. |
| `@winglet/data-loader` | 전체 6개 행 | 0.96에서 0.99 | 통과입니다. 단일 스레드 CPU 시간으로 쟀고, 잡음 바닥은 2퍼센트입니다. |
| `@winglet/react-utils` | `useRestProperties` 전체 | 0.995 이하 | 통과입니다. 표본 중앙값 비율이며, 같은 빌드끼리의 대조가 29퍼센트까지 흔들렸습니다. 추가된 일은 키마다 `undefined` 검사 한 번입니다. |
| `@winglet/json` | 1.03 이하인 대부분의 행 | 0.61에서 1.03 | 통과입니다. |
| `@winglet/json` | 배열 `move` arrLarge(불변 / 변경) | 1.110 / 2.401 | 정확성에 필요한 최소로 수용했습니다. 요소를 잘라 내는 연산이 더해졌고, 예전의 상수 시간 경로는 구멍을 남겼습니다(1번). 같은 배열 안의 이동을 `copyWithin`으로 돌리는 방법은 다른 컨테이너로의 이동에 도움이 되지 않고 모든 `move`에 문자열 자르기를 더해서 버렸습니다. |
| `@winglet/json` | `test` 행(objSmall 변경, arrLarge 변경, objLarge 변경) | 1.031에서 1.051 | 정확성에 필요한 최소로 수용했습니다. RFC 6902 4.6이 요구하는 값 비교가 더해졌습니다(3번). 깊은 비교 앞에 동일성 검사를 둡니다. `isMissingMember`로 읽는 방법은 1.108이라 버렸습니다. |
| `@winglet/json` | 객체 `replace`(objSmall 변경 / objLarge 변경) | 1.13 / 1.34 | 정확성에 필요한 최소로 수용했습니다. RFC 6902 4.3이 요구하는 대상 멤버 존재 검사가 더해졌습니다(5번). 읽은 값이 `undefined`이거나 함수일 때만 자기 속성 검사를 합니다. 호출마다 `hasOwnProperty.call`을 하는 방법(1.112와 1.275)과 `Object.hasOwn`은 더 느려서 버렸습니다. |
| `@winglet/json` | 루트 `test` 같은 참조(불변 / 변경) | 2.336 / 1.222 | 정확성에 필요한 최소로 수용했습니다. 예전 기본 모드는 루트에서 비교하지 않았고, RFC가 비교를 요구합니다(3번). 불변 모드는 루트를 먼저 얕게 복제하므로 동일성 지름길을 탈 수 없습니다. |
| `@winglet/json` | 루트 `test` 깊은 동등(불변 / 변경) | 9.577 / 23.653 | 위와 같은 이유로 수용했습니다. 예전부터 비교하던 strict 행은 1.001과 1.013으로 비교 자체는 느려지지 않았습니다. |
| `@winglet/json` | `add` objSmall 변경 | 1.034 | 측정 오차로 판정했습니다. 직전 실행에서는 1.003이었고 객체 `add`에는 연산이 더해지지 않았습니다. |
| `@winglet/json` | 마지막 검토 변경분의 재측정 | 모든 행 1.022 이하 | 통과입니다. CPU 시간으로 다시 쟀습니다. |
| `@winglet/json-schema` | 직접 키 조회 / 색인된 문서 조회 / 내장 주소 조회 | 1.019 / 1.002 / 1.023 | 통과입니다. |
| `@winglet/json-schema` | 아는 주소 조회, 정규화되지 않은 키 | 1.220 | 정확성에 필요한 최소로 수용했습니다. 등록된 모든 키를 리졸버마다 한 번 정규화합니다. 정규 철자가 아닌 키가 있을 때만 실행합니다. 조회 실패 전까지 쓰인 철자만 보는 방법은 결과가 이력에 따라 달라지고, 조회마다 정규화하는 방법은 키가 모두 정규 철자여도 60개 키에 약 725마이크로초가 들어서 버렸습니다. |
| `@winglet/json-schema` | 철자가 다른 키 조회(실패하던 경로) | 36.4 | 정확성에 필요한 연산으로 수용했습니다. 같은 일회성 키 정규화와, 맞은 문서의 색인입니다. 정규화 없이는 키를 맞출 수 없습니다(4번). |
| `@winglet/json-schema` | 어떤 키도 가리키지 않는 주소(첫 조회 실패) | 49.4 | 정확성에 필요한 연산으로 수용했습니다. 아직 색인하지 않은 등록 문서를 리졸버마다 한 번 모두 색인합니다. 그 뒤의 실패는 다시 색인하지 않습니다. 생성 시점에 미리 색인하는 방법은 실패가 없는 리졸버에도 같은 일을 시켜서 버렸습니다(1번). |
| `@winglet/json-schema` | 등록된 키와 충돌하는 아는 주소 조회 | 구현자 측정 1.196, 독립 측정 0.980 | 수용했습니다. 구현자의 작은 사례에서 더해진 일은 오류를 내기 위해 충돌 문서를 색인하는 것입니다(1번). |
| `@winglet/style-utils` | `compressCss` | 0.689에서 0.908 | 통과입니다. |
| `@winglet/style-utils` | `compressCss/colonSpaces` | 1.022 | 통과입니다. |
| `@winglet/style-utils` | `scope/small` / `scope/large` / `add/large` | 0.901 / 0.774 / 0.890 | 통과입니다. 평평한 규칙의 빠른 경로가 적용됩니다. |
| `@winglet/style-utils` | `scope/lists` | 2.849 | 수정 전 코드가 건너뛰던 일이라 수용했습니다. 목록의 모든 선택자를 다듬고 접두사를 붙여 잇습니다. 예전 코드는 첫 선택자에만 붙였습니다(2번). 괄호, 따옴표, 슬래시, 백슬래시가 없으면 `indexOf(',')`로 나눕니다. 정규식 분할과 문자 반복은 더 느려서 버렸습니다. |
| `@winglet/style-utils` | `scope/isLists` | 4.567 | 같은 이유로 수용했습니다. 목록에 `:is(…)`와 따옴표 속성이 있어 괄호 깊이를 세고 문자열을 건너뛰며 나눕니다. `:is(.p, .q)`나 `"t,1"` 안의 쉼표에서 나누면 선택자가 깨집니다. 정규식 토크나이저는 더 느려서 버렸습니다. |
| `@winglet/style-utils` | `scope/media` | 1.275 | 같은 이유로 수용했습니다. `@media` 블록 안의 규칙에 스코프를 붙입니다. 예전 코드는 이 규칙을 건너뛰었습니다(1번). |
| `@winglet/style-utils` | `add/mixed` | 1.080 | 수용했습니다. 위 세 행의 입력을 이어 붙인 시트라 그 비용을 그대로 가집니다. |

### promise-modal과 schema-form

| 패키지 | 행 | 비율 | 판정 |
|---|---|---|---|
| `@lerx/promise-modal` | Escape를 거부하는 dimmed 모달에서의 Escape | 1.136 | 5번 항목이 허용하는 최소로 수용했습니다. 캡처 단계 리스너 하나와 정수 비교 한 번이 더해졌습니다. 버블링 리스너 하나로는 같은 키 입력 안에서 모달이 정착했는지 알 수 없습니다. 이벤트와 횟수를 지역 변수 두 개에 두는 방법은 1.119였고, 모달이 보일 때만 캡처 리스너를 다는 방법은 이득이 없었습니다. |
| `@lerx/promise-modal` | 가운데 컨트롤에서의 Tab | 1.045 | 수용했습니다. 더해진 연산은 1번, 2번, 3번, 7번 항목이 각각 요구합니다(shadow 호스트 탐색, `contenteditable` 속성 읽기, 포커스가 목록의 컨트롤인지 확인). |
| `@lerx/promise-modal` | 같은 root로의 `attach` | 1.072에서 1.109 | 최소로 수용했습니다. 앵커가 움직일지 알아내는 `parentElement` 비교 한 번입니다(4번). 조건 없이 `contains(document.activeElement)`를 부르는 방법은 1.40이라 버렸습니다. |
| `@lerx/promise-modal` | 중첩 dimmed 모달 정착 뒤 포커스 복원 | 구현자 측정 한 번에서 1.035 | 측정 오차로 판정했습니다. 다른 두 번은 1.018과 0.997이었고, 더해진 일은 검사 한 번과 카운터 증가입니다. |
| `@lerx/promise-modal` | 그 밖의 행 | 1.023 이하 | 통과입니다. |
| `@canard/schema-form` | `watch-read` | 1.017에서 1.029 | 통과입니다. |
| `@canard/schema-form` | `expr-scan` / `expr-division` | 0.896 / 0.914 | 통과입니다. |
| `@canard/schema-form` | `array-rekey` | 0.990에서 0.995 | 통과입니다. |
| `@canard/schema-form` | `react-bridges` | 0.984에서 1.013 | 통과입니다. |
| `@canard/schema-form` | `derive-write`, `react-form-submit`, `branch-nonnull`, `branch-null`, `register-plugin` | 0.812에서 1.013 | 통과입니다. |

### AJV 플러그인

| 패키지 | 행 | 비율 | 판정 |
|---|---|---|---|
| `@canard/schema-form-ajv8-plugin` | `transformErrors` 일반 issue | 0.767 | 통과입니다. |
| `@canard/schema-form-ajv8-plugin` | `transformErrors` `propertyNames` issue | 0.196 | 통과입니다. |
| `@canard/schema-form-ajv8-plugin` | 검증, `$id` 없는 루트 | 0.403 | 통과입니다. |
| `@canard/schema-form-ajv8-plugin` | 검증, `$id` 있는 루트(`not` issue 포함) | 1.105 | 정확성에 필요한 최소로 수용했습니다. 경로를 `#/`로 다시 쓰는 일(검증기마다 기억)과 `not` issue마다 캐시 읽기 한 번입니다. 버그는 이 두 가지를 건너뛰고 틀린 `schemaPath`를 돌려주었습니다. 캐시 없는 스키마 걷기는 약 2.1이라 버렸습니다. |
| `@canard/schema-form-ajv8-plugin` | 검증, `$id` 있는 루트(경로 다시 쓰기만) | 1.069 | 같은 이유로 수용했습니다. 캐시 없는 다시 쓰기는 1.6에서 2.3이라 버렸습니다. |
| `@canard/schema-form-ajv7-plugin` | 일반 issue / 혼합 issue | 0.757 / 0.495 | 통과입니다. |
| `@canard/schema-form-ajv6-plugin` | 일반 변환 / 검증(후속 실패 커밋 대비) | 0.996 / 1.001 | 통과입니다. |
| `@canard/schema-form-ajv6-plugin` | 일반 변환 / 검증(최초 실패 커밋 대비) | 0.584 / 0.878 | 통과입니다. |
| `@canard/schema-form-ajv6-plugin` | `$id` 자원 안의 변환 / 검증 | 0.923 / 0.955 | 통과입니다. |
| `@canard/schema-form-ajv6-plugin` | 컴파일(`$id` 없음 / 있음) | 1.009 / 1.023 | 통과입니다. |

### 측정 면제 패키지

UI 플러그인 네 종의 숫자는 구현자 측정이며 확정하지 않았습니다(UI 플러그인은 소유자 결정으로 측정 면제). `@slats/agents-assets-sync`도 이후 라운드부터 측정이 면제되며, 아래에는 1라운드에서 잰 값을 적습니다.

| 패키지 | 행 | 비율 | 판정 |
|---|---|---|---|
| `@slats/agents-assets-sync` | 새 프로젝트에 설치 | 0.950 | 통과입니다. |
| `@slats/agents-assets-sync` | 최신 상태에서 다시 실행 | 0.867 | 통과입니다. |
| `@slats/agents-assets-sync` | 모든 파일을 고친 뒤 `--force`로 덮어쓰기 | 1.053 | 필요한 연산으로 수용했습니다. 이미 있는 대상 디렉터리마다 목록 읽기 한 번이 더해졌습니다. 기준 코드에는 쓰기 검사가 없었습니다. 파일마다 `lstat`을 부르던 첫 형태는 1.148이었습니다. |
| `@slats/agents-assets-sync` | 마커 블록 함수(`parseBlocks`, `findBlockBody`, `blockBodyMatches`)와 `resolveDestinations` | 1.014 이하 | 통과입니다. |
| `@canard/schema-form-antd-mobile-plugin` | 슬라이더 마운트 / 범위 슬라이더 마운트 / 라디오 | 0.986 / 0.971 / 0.982 | 구현자 측정, 확정하지 않음 (UI 플러그인은 소유자 결정으로 측정 면제). |
| `@canard/schema-form-antd-mobile-plugin` | 체크박스 그룹 | 1.030(대조 1.029) | 구현자 측정, 확정하지 않음 (UI 플러그인은 소유자 결정으로 측정 면제). |
| `@canard/schema-form-antd-mobile-plugin` | 슬라이더 변경 / 범위 슬라이더 변경 | 0.960 / 1.002 | 구현자 측정, 확정하지 않음 (UI 플러그인은 소유자 결정으로 측정 면제). |
| `@canard/schema-form-antd6-plugin` | 시간 범위 마운트 / 패널 열기 / 슬라이더 / URI / 다중 enum | 1.012 / 0.950 / 1.004 / 0.740 / 0.987 | 구현자 측정, 확정하지 않음 (UI 플러그인은 소유자 결정으로 측정 면제). |
| `@canard/schema-form-antd5-plugin` | 시간 범위 마운트 / 패널 열기 / 슬라이더 / URI | 1.004 / 0.961 / 1.003 / 0.857 | 구현자 측정, 확정하지 않음 (UI 플러그인은 소유자 결정으로 측정 면제). |
| `@canard/schema-form-antd5-plugin` | 다중 enum 마운트 | 1.034(대조 대 수정 전 1.010) | 구현자 측정, 확정하지 않음 (UI 플러그인은 소유자 결정으로 측정 면제). 구현자는 잡음으로 보고했습니다. 더해진 검사 `mode === 'multiple'`은 배열이 아닌 값에서만 실행되어 이 경로에서는 돌지 않습니다. |
| `@canard/schema-form-mui-plugin` | 전체 6개 행 | 0.961에서 0.994(대조의 흔들림 0.957에서 1.038) | 구현자 측정, 확정하지 않음 (UI 플러그인은 소유자 결정으로 측정 면제). |

## 호환성이 깨지는 변경과 뒤집은 테스트

`.changeset/stable-1-0-0.md`가 이미 패키지들을 1.0.0으로 올리므로, 여기의 major changeset은 버전을 1.0.0 위로 올리지 않습니다. 서로 독립된 변경이라 changeset 항목은 따로 유지합니다.

### @winglet/json (major)

| 변경 | 이전 | 이후 |
|---|---|---|
| 배열 인덱스로의 `move`와 `copy` | 그 자리 요소를 덮어썼고, `move`는 원래 자리에 구멍을 남겼습니다. | 그 자리에 삽입하고, `move`는 원래 자리를 메웁니다. |
| 없는 위치에서의 `move`와 `copy` | `undefined`를 옮기거나 복사했습니다. | `PATCH_OBJECT_PROPERTY_NOT_FOUND`, `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS`, `PATCH_PATH_INVALID_INTERMEDIATE` 가운데 하나를 던집니다. |
| `from`과 `path`가 같은 `move`, 자기 하위로의 `copy` | 예외를 던졌습니다. | 성공합니다. `PATCH_COPY_INTO_DESCENDANT_FORBIDDEN`은 더 이상 던지지 않습니다. |
| `test` | `strict: true`에서만 비교했습니다. | 모든 모드에서 비교합니다. `strict`는 효과가 없습니다. |
| 없는 객체 멤버의 `replace` | 멤버를 추가했습니다. | 예외를 던집니다. |
| 앞에 0이 붙은 인덱스와 4294967294를 넘는 인덱스 | 받아들였습니다. | `PATCH_ARRAY_INDEX_INVALID`를 던집니다. |

뒤집은 기존 테스트는 다음과 같습니다.

- `applyPatch.test.ts`의 `/items/0`으로의 `move`는 덮어쓴 결과 `[10, 2, 3]` 대신 삽입 결과 `[10, 1, 2, 3]`을 기대합니다(1번).
- `applyPatch.test.ts`의 `/items/1`로의 `copy`는 `[1, 10, 3]` 대신 `[1, 10, 2, 3]`을 기대합니다(2번).
- `applyPatch.test.ts`의 `strict: false`에서 실패하는 `test`는 오류 없음 대신 `PATCH_TEST_FAILED`를 기대합니다(3번).
- `applyPatch.errors.test.ts`의 `from`과 `path`가 같은 `move`와 하위로의 `copy`는 금지 오류 대신 바뀌지 않은 문서와 복사된 결과를 기대합니다(4번).
- `applyPatch.security.test.ts`의 자기 것이 아닌 `__proto__`에서의 `move`와 `copy`는 `alias: undefined` 결과 대신 `PATCH_OBJECT_PROPERTY_NOT_FOUND`를 기대합니다.

### @winglet/style-utils (major)

| 변경 | 이전 | 이후 |
|---|---|---|
| `@media`와 다른 묶음 at-rule 안의 규칙 | 스코프가 붙지 않았고 닫는 중괄호를 잃었습니다. 예: `@media (max-width:600px){.title{color:red}.card .body{color:blue}` | 스코프가 붙습니다. 예: `@media (max-width:600px){.card .title{color:red}}.card .body{color:blue}` |
| 선택자 목록 | 첫 선택자에만 스코프가 붙었습니다. 예: `.card .title,.subtitle{color:red}` | 모든 선택자에 붙습니다. 예: `.card .title,.card .subtitle{color:red}` |

뒤집은 기존 테스트는 없습니다.

### @lerx/promise-modal (major)

| 변경 | 이전 | 이후 |
|---|---|---|
| 최상위 모달 안의 컨트롤이 `preventDefault` 없이 Escape에 스스로 닫을 때 | 같은 Escape가 아래 모달도 취소했습니다. | Escape 한 번은 모달을 하나까지만 닫습니다. 아래 모달은 대기 상태로 남으므로 `signal` 등으로 직접 취소합니다. |

뒤집은 기존 테스트는 없습니다. 캡처 단계 리스너가 더해져서 기존 테스트 두 개를 더 엄격하게 했습니다. `src/bootstrap/__tests__/escape.render.test.tsx`는 버블링 등록 하나와 캡처 등록 하나를 확인하고, 모듈 사본 검사(`runModuleCopies.mjs`, `moduleCopies.build.test.ts`)의 출력 문자열은 `keydown=1 cleanup=1`에서 `keydown=bubble+capture cleanup=2`로 바뀌었습니다.

### @winglet/json-schema

| 변경 | 이전 | 이후 |
|---|---|---|
| 리졸버 없는 `JSONSchemaScanner`와 `JSONSchemaScannerAsync`의 식별자 키워드 | 바깥 방언에서 골랐습니다. | 인식되는 `$schema`를 가진 하위 스키마는 자기가 선언한 방언에서 고릅니다(draft-04는 `id`, 그 뒤 방언은 `$id`). |

뒤집은 기존 테스트는 `JSONSchemaScanner.dialectResources.test.ts`의 `recognizes normalized metaschema URIs only at resource roots and restores sibling dialects` 한 건이며, `#/properties/embedded/prefixItems/0`의 기대값이 `false`에서 `true`로 바뀌었습니다.

### @canard/schema-form (major)

| 변경 | 이전 | 이후 |
|---|---|---|
| 값이 `null`인 nullable 배열 또는 객체 필드 | `node.value`와 FieldInput의 `value` prop이 `[]` 또는 `{}`였습니다. | `null`입니다. nullable 배열이나 객체를 받는 사용자 정의 FieldInput은 값을 읽기 전에 `null`을 처리해야 합니다. |

뒤집은 기존 테스트는 모두 5번 항목에 속합니다.

- `childSelectionHead.json`(`selectChildren.head-differential.test.ts`가 읽습니다)의 `value` 항목 476개가 `null`이 되었습니다.
- gate-table의 `selection-13.json`과 `selection-19.json`에서 21개 위치(`value`와 `storedValue`)가 `null`이 되었습니다.

### @canard/schema-form-antd-mobile-plugin

| 변경 | 이전 | 이후 |
|---|---|---|
| 표현 옵션 `range` | 슬라이더 모양을 정했고, 숫자 스키마에 `range: true`를 주면 숫자 필드에 배열을 썼습니다. | 무시되며 `@deprecated`입니다. 스키마 타입만으로 모양을 정합니다. 범위 슬라이더는 `type: 'array'`, `items: { type: 'number' }`, `format: 'slider'`로 씁니다. |
| 읽기 전용 라디오 그룹, 체크박스 그룹, 슬라이더 | 누른 선택이 화면에 보였습니다. | 비활성 모양으로 그려집니다. |

뒤집은 기존 테스트는 `FieldInputSlider.test.tsx`의 한 건입니다. 테스트 이름이 "reads marks and lazy from presentation.FieldInputProps and lets the schema decide range"로 바뀌었고, `range` 단언이 `true`에서 `false`로 바뀌었습니다.

### 호환성 깨짐으로 분류하지 않은 관찰 가능한 변경

| 패키지 | 변경 | 뒤집은 테스트 |
|---|---|---|
| `@winglet/common-utils` | `equals`는 내용이 다른 `ArrayBuffer`, `DataView`, 박싱된 값을 같다고 하지 않습니다. `stableEquals`는 값이 다른 박싱된 `Number`와 `Boolean`, 자기 속성이 다른 `ArrayBuffer`를 같다고 하지 않습니다. | 없습니다. |
| `@winglet/data-loader` | 동기 스케줄러에서 `load()` 하나가 키 하나짜리 배치로 실행됩니다. falsy 캐시 키가 캐시되므로, `load(0)`이 매번 배치 로더를 부르기를 기대하던 코드는 `clear(key)`를 먼저 부릅니다. | 없습니다. |
| `@slats/agents-assets-sync` | `--json`의 단위가 고아 파일을 지우는 `--force` 단위에 `requiresForce: true`를 보고합니다. `--dry-run`은 0으로 끝납니다. 프로젝트 범위 실행은 링크가 프로젝트 밖으로 풀어내는 대상을 거부합니다. | 없습니다. |
| `@canard/schema-form-ajv8-plugin` | 인라인된 `$ref` 대상이나 `allOf`로 도달한 `false` 스키마는 `rejectedKey`를 가지지 않습니다. | 없습니다. |
| `@canard/schema-form-ajv7-plugin` | issue의 위치가 위 패키지별 결과대로 바뀝니다. | 없습니다. |
| `@canard/schema-form-ajv6-plugin` | issue의 위치가 위 패키지별 결과대로 바뀝니다. | 기준 브랜치의 테스트는 뒤집지 않았습니다. 이 브랜치에서 더한 `createNotRequiredKeyLookup.test.ts`의 한 행은 "선언된 `$id`와 맞지 않는 참조"로 바뀌었습니다. |
| `@winglet/react-utils` | 없습니다. | 없습니다. |
| `@canard/schema-form-antd6-plugin` | 읽기 전용 선택 위젯과 피커가 비활성 모양으로 그려집니다. | `FieldInputTimeRange.test.tsx`의 "reads minimum and maximum from presentation.FieldInputProps"가 `disabledDate` 대신 `disabledTime`의 분 경계(09:59 비활성, 10:00과 18:00 활성, 18:01 비활성)를 단언합니다. |
| `@canard/schema-form-antd5-plugin` | 읽기 전용 선택 위젯과 피커가 비활성 모양으로 그려집니다. | 같은 이름의 테스트가 `disabledDate` 대신 `disabledTime`의 분 경계를 단언합니다. |
| `@canard/schema-form-mui-plugin` | 읽기 전용 라디오 그룹, 체크박스 그룹, 불리언 체크박스, 슬라이더가 비활성 모양으로 그려집니다. | 없습니다. |

## 결정과 근거

아래 동작은 의도해서 정한 것입니다. 기준 순서는 `FIX-PROCEDURE.md`의 결정 규칙(표준 준수, 예측 가능한 동작, 합리적인 인터페이스)입니다.

### @winglet/json

- RFC 6902 쪽으로 정한 결정 다섯 가지를 소유자가 승인했습니다. 근거는 표준(RFC 6902, RFC 6901)입니다. 이 승인에 따라 정해진 동작은 `move`가 제거 뒤 추가로 동작하는 것, `copy`와 `move`가 배열 인덱스에 삽입하는 것, `test`가 모든 모드에서 비교하는 것, 없는 멤버의 `replace`가 실패하는 것, 앞에 0이 붙은 인덱스를 거부하는 것입니다.
- 없는 멤버의 `replace`(5번), 앞에 0이 붙은 인덱스(6번), 없는 `from`에서의 `move`는 모든 모드에서 오류입니다. 근거는 표준입니다.
- 희소 배열의 구멍은 `copy`와 `move`에서 존재하는 위치로 봅니다. 근거는 일관성이며, `remove`, `replace`, `test`가 쓰는 규칙과 같습니다.
- 없는 위치에서의 `copy`는 오류이고, 값이 `undefined`로 존재하는 위치는 복사합니다. 근거는 표준(RFC 6902 4.5)과 `move`와의 일관성입니다.
- `strict` 옵션은 타입에 `@deprecated`로 남기고 읽지 않습니다. 공개 타입에서 옵션을 없애는 것은 소유자가 정할 일이기 때문입니다.
- `getValue`가 자기 속성만 읽도록 막는 수정은 속도 조건(1.03 이하)에 묶었고, 측정이 1.03에서 1.05였으므로 문서만 고쳤습니다. 근거는 `FIX-PROCEDURE.md`의 "가장 싼 검사로도 1.03을 넘으면 문서만 고친다"는 규칙입니다.

### @canard/schema-form

- `null`로 로드된 nullable 가지는 `null`로 읽힙니다(5번). 가지를 조립할 때 `null`을 유지합니다. 근거는 일관성이며, `getValue()`와 `options.terminal: true`의 동작과 같습니다.
- `watchValues`의 동일성은 `Object.is`로 비교합니다(7번). 같은 배열 참조를 제자리에서 바꾼 것은 보이지 않습니다.
- 예외를 던진 `registerPlugin`은 아무것도 적용하지 않습니다(8번). 근거는 예측 가능한 동작입니다.
- 표현식에서 전체가 절대 경로로도 읽히는 슬래시 묶음은 경로로 읽습니다(4번). 근거는 수정 전 동작과의 일관성이며, 그런 모양의 정규식은 `new RegExp`로 씁니다.

### @lerx/promise-modal

- Escape 한 번은 모달을 하나만 닫습니다(5번). 근거는 예측 가능한 동작이며, major changeset으로 기록했습니다.
- 소유권이 넘어갈 때 보이던 살아 있는 모달을 받아들입니다(6번). 구현은 프로바이더 안의 입양 지도이고 `AbstractNode`는 건드리지 않습니다. 근거는 패키지 `INTENT.md`가 노드 인터페이스 변경을 먼저 물어볼 것으로 정했기 때문입니다.
- 연 요소가 제거되었으면 남은 최상위 dimmed 모달에 포커스를 줍니다(8번).
- 6번과 8번은 patch 수준으로 기록했습니다.
- 이 패키지는 `@winglet/style-utils`의 병합을 기다리지 않고 병합했습니다. 근거는 이 패키지가 주입하는 CSS가 style-utils 변경 전후로 바이트 단위로 같고, style-utils 풀 리퀘스트의 CI가 의존 패키지로서 이 패키지를 다시 검사한다는 점입니다.

### AJV 플러그인

- ajv8에서는 `#/`로 시작하는 루트 지역 경로만 `rejectedKey`를 받습니다(2번). 중첩된 `$id` 자원 안의 `not` issue는 키를 가지지 않고 값을 가진 객체에 남습니다. README가 이를 밝힙니다.
- ajv6의 `$id` 접두 경로 해석은 ajv6에만 필요합니다. 근거는 세 플러그인의 일관성 검토입니다. 분류기는 draft-07 경로에서 서로 일치하고, 차이는 AJV 버전이 다른 곳에만 있습니다. AJV 7은 `$id`가 있어도 `#/` 프래그먼트를 보고하므로 ajv8에 후속 수정이 필요하지 않습니다.
- `contains: false`의 issue는 배열 항목에 남고 `rejectedKey`를 가지지 않습니다(ajv6, ajv7). 근거는 제자리 규칙과의 일관성입니다.

### UI 플러그인

- 읽기 전용 선택 위젯과 피커는 비활성(`disabled`)으로 그립니다. 근거는 일관성이며, 날짜와 월 피커가 이미 그렇게 잠깁니다. 네 플러그인이 같은 정책을 씁니다.
- 불리언 체크박스의 미정 상태는 README를 코드에 맞췄습니다(antd5 6번, antd6 6번, antd-mobile 3번, mui 5번). 근거는 항목 제목이 문서 불일치이고 코드의 동작이 합리적이라는 결정 규칙이며, 형제 플러그인이 같은 문구를 씁니다.
- antd-mobile의 슬라이더 모양은 스키마 타입만으로 정합니다(1번). 표현 옵션 `range`는 무시하고 `@deprecated`로 둡니다. 근거는 예측 가능한 동작입니다. 값의 모양이 스키마 타입과 어긋나는 일이 없습니다.
- 저장되는 시간 형식은 antd 플러그인(`HH:mm:00Z`)과 mui 플러그인(오프셋 없는 `HH:mm:ss`)이 다른 채로 둡니다. mui 6번은 README를 코드에 맞췄습니다. 근거는 두 값 모두 세 AJV 플러그인의 `format: time`을 통과한다는 조사이며, 통일은 소유자가 정할 일입니다.
- mui의 enum 셀렉트 설명은 README를 코드에 맞췄습니다(6번).
- mui의 슬라이더는 첫 변경 전까지 값이 없는 상태로 보입니다(4번). 근거는 화면이 저장되지 않은 값을 저장된 것처럼 보여 주지 않아야 한다는 예측 가능한 동작입니다.
- antd5와 antd6의 `customParseFormat` 의존은 코드로 굳히지 않고 패키지 `CLAUDE.md`에 적었습니다. 근거는 antd의 피커 모듈을 가져오면 모듈 로드 때 플러그인이 등록된다는 검토 확인입니다.

### 그 밖의 패키지

- `@winglet/common-utils`의 `equals`는 `ArrayBuffer`와 `DataView`를 바이트로 비교합니다(1번).
- `@winglet/react-utils` 1번은 문서를 고치고 코드를 유지합니다. 훅은 처음부터 최신 핸들러를 실행해 왔고 기존 테스트가 이를 고정합니다.
- `@winglet/react-utils`의 `useRestProperties`는 심볼 키와 상속 값에 대한 검사를 더하지 않습니다. 근거는 속도이며, 모든 키에서 소유 여부를 확인하면 일반 경로가 느려집니다.
- `@slats/agents-assets-sync`는 모든 고아 파일에 `requiresForce`를 켭니다(2번, 3번).
- `@slats/agents-assets-sync`의 심볼릭 링크 검사는 프로젝트 범위에만 적용하고, 링크를 거쳐 쓸 때만 거부합니다. 사용자 범위는 링크를 의도적으로 따라갑니다. dotfiles로 연결한 `~/.claude`는 의도된 구성이기 때문입니다. 종류를 알 수 없는 디렉터리 항목은 닫힌 쪽으로 판정합니다.
- `@winglet/json-schema` 1번은 조회가 실패할 때 색인하는 방식이고, 4번은 키 정규화를 필요할 때 하며 중복은 오류입니다.
- `@winglet/style-utils`의 평평한 규칙 빠른 경로는 `FIX-PROCEDURE.md`의 어려운 문제 상의 역할에게 받은 설계이고, 구현자가 그 제안의 결함(세미콜론이나 주석 뒤의 빈 선택자)을 찾아 고친 뒤 적용했습니다.

## 알려진 한계

아래는 의도해서 남긴 한계입니다. 다음 수집에서는 알려진 것으로 봅니다.

### @winglet/common-utils

- `clone`은 프로토타입 사슬에 대해 알아낸 것을 그 프로토타입의 첫 복제 때 캐시하고 무효화하지 않습니다. 나중에 프로토타입에 더한 setter는 이후 복제에서 실행되고, 나중에 더한 getter 전용 또는 읽기 전용 속성은 `clone`이 `TypeError`를 던지게 합니다. 키마다 사슬을 확인하면 클래스 인스턴스에서 약 6.5퍼센트가 듭니다.
- `Date`, `RegExp`, `Map`, `Set`은 자기 속성을 보지 않고 상태만으로 비교를 끝냅니다.
- `stableEquals`는 `DataView`와 typed array를 바이트로만 비교하고, `ArrayBuffer`는 자기 키 비교까지 이어 갑니다.
- 내장 규칙은 `Object.prototype.toString` 태그를 믿습니다. 위조된 태그에 값 슬롯이 없으면 `clone`은 일반 복사로 넘어갑니다.

### @winglet/data-loader

- 작업을 두 번 부르는 `batchScheduler`는 같은 배치의 로더를 두 번 실행합니다. 재진입 방지는 없습니다.

### @slats/agents-assets-sync

- 포함 여부 검사와 복사 사이에 다른 프로세스가 만든 링크는 잡지 못합니다.
- 하드 링크는 범위 밖입니다. 검사는 심볼릭 링크만 봅니다.
- Windows에서 `path.win32.join`이 대상을 받는 모든 키를 루트 안에 두는지는 검증하지 않았습니다. CI는 Ubuntu에서만 돕니다.
- 벤치마크는 `SKILL.md`만 있는 스킬이 타는 단일 이름 `lstat` 분기를 재지 않습니다.
- `--force`는 링크를 거쳐 지우지 않으며, 고아 링크와 그 대상을 그대로 둡니다.
- 사용자 범위는 심볼릭 링크 검사에서 제외됩니다.
- README는 TTY 확인이 `@inquirer/prompts`를 쓴다고 말하지만 실제 화면은 Ink입니다.

### @canard/schema-form-ajv8-plugin

- 중첩된 `$id` 자원 안에서 `$ref`로 도달한 `not` issue는 참조 아래의 AJV 경로(예: `urn:item/not`)를 유지하고 `rejectedKey`를 가지지 않습니다.
- Draft 2020의 `prefixItems` 뒤 `items: false`는 AJV가 키워드 `items`로 보고하며 `rejectedKey`를 가지지 않습니다.
- `false` 스키마의 경로가 다른 자원의 URI 접두사로 시작하면 분류기가 접두사 세그먼트를 키워드로 읽습니다.
- 검증기마다 가지는 경로 캐시와 조회 캐시에는 크기 제한이 없습니다. 컴파일된 루트 하나의 고정된 스키마 경로만 담습니다.

### @canard/schema-form-ajv7-plugin

- `not.required` 조회는 작성된 스키마를 그때 읽으므로, 컴파일과 첫 검증 사이에 바뀐 스키마는 바뀐 모습으로 읽힙니다. 컴파일 뒤에는 스키마를 바꾸지 않아야 합니다.
- 이름 붙은 하위 스키마의 지도를 받는 사용자 정의 키워드는 단일 스키마 키워드로 걷습니다. 그 아래에서 `items`라는 이름은 키워드로 읽힐 수 있습니다.
- `contains: false`의 issue는 항목(`/a/0`)에 남고 `rejectedKey`를 가지지 않습니다.

### @canard/schema-form-ajv6-plugin

- 상대 id가 풀린 절대 URI로 쓴 참조와, 빈 프래그먼트 id(`…#`)인데 `#`을 뺀 참조는 모은 식별자와 맞지 않아 대체 경로로 떨어집니다. 그 경우 `items`나 `properties`라는 이름의 필드에서 값 수준 `false` issue가 부모로 갈 수 있고, `not.required`는 키를 가지지 않습니다.
- 컴파일 뒤에는 스키마를 바꾸지 않아야 합니다.
- `contains: false`의 issue는 배열 항목에 남고 `rejectedKey`를 가지지 않습니다.
- 분류기의 이름 지도에는 AJV 6이 내보내지 않는 `$defs`와 `dependentSchemas`가 없습니다.

### @winglet/react-utils

- `useRestProperties`는 심볼 키를 보지 않으므로, 심볼 키의 값이 바뀌어도 이전 객체를 반환합니다.
- 새 키의 값이 이전 객체의 상속 값과 같으면 이전 객체를 반환합니다.

### @winglet/json

- `getValue`는 일반 키로 상속 멤버와 인덱스가 아닌 배열 멤버를 읽습니다(`getValue({}, '/toString')`은 함수를 반환합니다). RFC 6901과 다릅니다.
- `copy`는 `from`을 `getValue`로 읽으므로 `/toString` 같은 상속 멤버를 존재하는 위치로 봅니다.
- `replace`와 `move`는 읽은 값이 `undefined`이거나 함수일 때만 자기 속성 검사를 합니다. 다른 코드가 `Object.prototype`에 더한 함수가 아닌 값은 존재하는 멤버로 봅니다.
- `immutable: false`에서 실패한 연산은 앞선 연산의 변경을 원본에 남깁니다. 추가 단계가 실패한 `move`는 제거가 적용된 채로 남습니다. 기본값 `immutable: true`는 원자적입니다.
- `ApplyPatchOptions`의 `strict`는 타입에 남아 있고 효과가 없습니다.

### @lerx/promise-modal

- `window`의 캡처 리스너나 프로바이더가 마운트되기 전에 등록된 `document` 캡처 리스너는 Escape 기록보다 먼저 실행됩니다. 그 리스너가 닫은 모달은 세지 않으므로 아래 모달이 함께 닫힐 수 있습니다.
- 6번의 입양은 보임 여부만 정합니다. 프레임과 배경은 이전 소유자의 `initiator`를 받습니다. 입양은 프로바이더 인스턴스의 첫 경로 effect에서 일어나므로, 같은 커밋에서 다른 경로로 다시 마운트되어도 보이던 모달을 받아들입니다.
- 채워진 slot의 대체 콘텐츠는 Tab으로 닿습니다.
- root 변경과 같은 커밋에서 언마운트된 컨트롤은 포커스를 body에 잃습니다.
- 닫힌 shadow root는 탐색하지 않습니다. slot에 들어간 자식은 slot 자리가 아니라 호스트 자리에 놓입니다. shadow root 안에서 후보 목록에 없는 요소에 포커스가 있으면 트리를 넘어 위치를 비교하므로 브라우저와 다를 수 있습니다.
- 숨겨진 동안의 언마운트는 다루지 않습니다.
- jsdom은 `inert`를 강제하지 않으므로 격리 뒤 재포커스의 순서는 테스트로 확인되지 않았습니다.

### @winglet/json-schema

- 리졸버 없는 스캐너는 선언된 방언의 문자열 식별자 어느 것에서나 방언을 바꿉니다. 리졸버는 비어 있지 않은 프래그먼트를 가진 식별자와 풀리지 않는 식별자를 거절하므로, 그 아래에서는 `inert`가 다를 수 있습니다.
- `resources`의 키는 조회 주소입니다. 프래그먼트(빈 것 포함), 쿼리, userinfo가 있는 키는 그것이 없는 키와 다른 주소이고, 그런 키의 결과는 참조 순서에 따라 달라질 수 있습니다.
- 처음 실패한 조회가 등록된 문서를 모두 색인하므로, 등록 집합 어디에 있는 중복 식별자든 그 시점에 보고됩니다. 실패가 없는 실행은 보고하지 않습니다.
- 중복 식별자 오류 메시지는 두 선언 위치를 어느 순서로든 적을 수 있습니다.
- 한 주소의 두 철자가 서로 다른 문서를 등록한 것은 조회가 정규화된 키를 필요로 할 때에만 보고됩니다.

### @canard/schema-form

- `Activity`로 숨겨진 동안 언마운트된 FieldInputBridge는 정리를 다시 실행하지 않으므로, 첨부 기록이 초기화 때까지 남습니다.
- 파일이 붙은 뒤에 교체된 입력 컨테이너는 숨길 때 이미 떨어져 있으므로, 숨기면 그 파일이 풀립니다.
- 같은 배열 참조를 제자리에서 바꾼 것은 `watchValues`에 보이지 않습니다.
- 텍스트가 절대 경로로도 읽히는 정규식 리터럴(`/a/g`, `/user/id`, `/foo/.test(../name)`)은 경로로 읽힙니다. 백슬래시가 있는 정규식(`/km\/h/.test(../speed)`)은 정규식으로 읽힙니다.
- 불리언 컨트롤 끝의 줄 주석은 컴파일에 실패하고, `derived` 표현식 맨 앞의 줄 주석은 `undefined`를 반환합니다. 블록 주석은 어디서나 안전합니다.

### @winglet/style-utils

- 따옴표 없는 `url(…)` 안의 중괄호는 스코퍼가 구조로 세므로, 그 규칙과 뒤의 규칙이 빠집니다. 그런 URL은 따옴표로 감쌉니다.
- `compressCss`는 주석이 `}`나 `)` 바로 앞의 마지막 요소일 때 공백 하나를 남깁니다.

### @canard/schema-form-antd-mobile-plugin

- 1라운드 문서의 "확인하지 못한 가능성"인 슬라이더의 `focus(path)`는 재현이 없어 다루지 않았습니다.
- `NullHandling` 스토리의 `rangeSlider` 필드는 `format`이 아니라 `inputType: 'slider'`로 슬라이더를 고르며, 바꾸거나 확인하지 않았습니다.
- 읽기 전용 선택 위젯은 비활성 모양으로 그려집니다.

### @canard/schema-form-antd6-plugin

- 읽기 전용은 antd의 `disabled`로 그립니다.
- 시간 제한은 보는 사람의 시간대로 읽습니다. 한쪽만 있는 제한은 현지 자정까지 이어집니다.
- 비어 있지 않지만 파싱할 수 없는 시간 제한은 제한을 만들지 않습니다.
- 시간 파싱은 antd 피커 모듈이 등록하는 dayjs `customParseFormat`에 의존합니다.
- 슬라이더의 포커스 표식은 마운트 때 붙고, antd가 같은 핸들 요소를 유지한다는 데 의존합니다. 슬라이더 레이블은 핸들이 아니라 슬라이더 루트를 가리킵니다.
- 저장되는 시간 형식은 `HH:mm:00Z`입니다.

### @canard/schema-form-antd5-plugin

- 읽기 전용은 antd의 `disabled`로 그립니다. 위젯이 회색이 되고 Tab 순서에서 빠지며, 네이티브 폼 제출에서 빠지고, `focus(path)`는 읽기 전용 슬라이더를 건너뜁니다.
- 한쪽만 있는 시간 제한은 현지 자정까지 이어집니다.
- 대문자 `MAILTO:` 스킴은 예전 경로를 탑니다.
- 슬라이더 레이블의 `for`는 핸들이 아니라 슬라이더 루트를 가리킵니다.
- 기본값이 아닌 URI 스킴의 첫 그리기는 파싱한 스킴을 보여 줍니다. antd6과 같은 동작입니다.
- 시간 파싱은 `customParseFormat`에 의존하고, 저장되는 시간 형식은 `HH:mm:00Z`입니다.

### @canard/schema-form-mui-plugin

- 시간 피커는 오프셋 없는 `HH:mm:ss`를 저장하며, antd 플러그인의 `HH:mm:00Z`와 다릅니다.
- 문자열 enum의 nullable 배열은 새 빈 항목에 `[null]`을 저장합니다.
- 값이 없는 슬라이더의 썸은 최솟값 자리에 있습니다. 키보드 포커스가 있는 동안에는 썸이 보이며, jsdom이 focus-visible을 일으키지 못해 그 스타일은 테스트로 덮이지 않았습니다.
- 날짜나 월 문자열에 스키마 수준으로 준 `minimum`과 `maximum`은 효과가 없습니다. 제한은 `presentation.FieldInputProps`에 둡니다.
- 값이 없는 슬라이더의 안내 `Not set`은 기본이 영어입니다. 현지화한 폼은 `unsetValueText`를 넘깁니다.
- 잘못된 날짜 제한은 무시됩니다.

## 소유자가 정할 일

- `@winglet/json`: `ApplyPatchOptions` 타입에서 `@deprecated`인 `strict` 옵션을 없앨지 정해야 합니다.
- `@winglet/json`: `getValue`가 상속 멤버와 인덱스가 아닌 배열 키를 읽는 것이 RFC 6901과 다릅니다. 막는 검사는 1.03에서 1.05로 측정되어 문서만 고쳤습니다. 속도를 내주고 코드를 고칠지 정해야 합니다.
- UI 플러그인: 저장되는 시간 형식을 통일할지 정해야 합니다. antd5와 antd6은 `HH:mm:00Z`, mui는 오프셋 없는 `HH:mm:ss`이고, RFC 3339의 full-time은 오프셋을 요구합니다.
- `@lerx/promise-modal`: 프레임이 입양된 경로를 보도록 `AbstractNode.adoptInitiator`를 더할지 정해야 합니다. 지금은 입양 뒤 프레임의 `initiator`가 실제 소유자와 다릅니다. 패키지 `INTENT.md`가 먼저 물어볼 것으로 정한 변경입니다.
- `@canard/schema-form-antd-mobile-plugin`: 표현 옵션 `range`를 무시하고 `@deprecated`로 둔 결정을 확인해야 합니다. 문서에 있던 옵션의 효과를 없애는 변경입니다.
- `@winglet/style-utils`: `@media` 안의 규칙과 선택자 목록의 모든 선택자에 스코프를 붙이는 변경을 major changeset으로 기록했습니다. 확인이 필요합니다.
- `@slats/agents-assets-sync`: README가 TTY 확인에 `@inquirer/prompts`를 쓴다고 말하지만 실제 화면은 Ink입니다. 범위 밖이라 그대로 두었습니다.
- `@canard/schema-form-ajv6-plugin`: 기존 테스트 `transformDataPath.test.ts`의 "대량의 에러를 효율적으로 처리해야 한다"는 10밀리초 벽시계 기준을 가지고 있어 CI에서 흔들립니다. 기준을 어떻게 할지 정해야 합니다.
- `@winglet/common-utils`: 패키지에 실리는 에이전트 안내 문서가 바뀌었습니다. `DOCUMENTATION.md` 원칙 7의 평가는 검토자가 문서만 보고 소비자 코드를 써 보는 가벼운 형태로만 했습니다. 정식 평가를 할지 정해야 합니다.

## 미룬 항목과 위험

### 고치지 않았거나 확정하지 않은 것

- 고치지 않고 다음 라운드로 넘긴 1라운드 항목은 없습니다.
- `@canard/schema-form-antd5-plugin`의 다중 enum 마운트 행 1.034와 `@canard/schema-form-mui-plugin`의 측정(대조의 흔들림 0.957에서 1.038)은 확정하지 않았습니다. UI 플러그인이 측정에서 면제되면서 병합을 막지 않게 되었습니다.
- `@winglet/json` 7번의 둘째 불일치는 문서만 고쳤고, 코드와 RFC 6901의 차이는 남아 있습니다.
- `@canard/schema-form-antd-mobile-plugin`의 슬라이더 `focus(path)` 가능성은 재현이 없어 확인하지 못한 채입니다.

### 다음 수집에서 다시 나올 수 있는 지점

- `@winglet/json-schema`: 프래그먼트, 쿼리, userinfo가 있는 키의 순서 의존, 중복 식별자 메시지의 선언 위치 순서, 첫 조회 실패 때의 전체 색인.
- `@winglet/react-utils`: `useRestProperties`의 심볼 키와 상속 값. 속도를 위해 의도해서 고치지 않았습니다.
- `@canard/schema-form-antd5-plugin`: 대문자 `MAILTO:` 스킴. 다음 라운드의 형제 후보입니다.
- `@winglet/json`: `copy /toString`이 함수를 설치하는 것은 `getValue`의 상속 멤버 읽기에서 나옵니다.
- `@canard/schema-form`: 절대 경로로도 읽히는 정규식 리터럴.

### 2라운드에 영향을 주는 과정 기록

- `@canard/schema-form-ajv6-plugin`의 기존 벽시계 테스트 `src/validator/utils/__tests__/transformDataPath.test.ts`("대량의 에러를 효율적으로 처리해야 한다", 10밀리초 미만 기준)가 관련 없는 풀 리퀘스트(628번)의 CI에서 12.1밀리초로 한 번 실패했습니다. 실패한 작업을 다시 돌려 통과했습니다.
- AJV 플러그인의 테스트 도우미 `src/validator/__tests__/utils/checkGuardRootCollection.ts`는 절대 경로에서 `/ajv([678])-plugin/`의 첫 일치로 AJV 버전을 고릅니다. 워크트리 디렉터리 이름(`bb-ajv6-plugin` 등)이 먼저 맞으면 다른 플러그인의 `guard-root-lifetime` 테스트가 거짓으로 실패합니다. 제품 결함이 아니라 도우미가 취약한 것입니다.
- `@lerx/promise-modal`의 `src/__tests__/serverImport.test.tsx`는 자체 제한 시간이 없어 Vitest 기본값 5초를 씁니다. lint와 타입 검사와 함께 돌리면 시간 초과가 날 수 있고, 단독으로는 통과합니다. CI는 `--testTimeout=120000`을 넘깁니다.
- 1라운드 커밋의 `round-1 <패키지> <번호>` 꼬리표는 중간부터 붙였으므로, 초기 수정 커밋에는 꼬리표가 없습니다. 이 문서의 표가 항목과 커밋을 잇습니다. `@winglet/common-utils`의 후속 커밋에 붙은 번호(1부터 7)는 항목 번호가 아니라 후속 커밋의 순번입니다.
- 벤치마크는 바뀐 함수마다 그 함수에 닿는 입력으로 재야 합니다. `@winglet/style-utils`의 첫 검토에서 구현자의 입력이 새 코드 경로에 닿지 않았음이 드러났습니다.
- 부하가 높을 때 같은 빌드끼리의 대조가 한 행에서 1.5배까지 흔들렸습니다. 측정에는 같은 빌드 대조를 함께 돌리고 불안정한 계열을 버립니다. 단일 스레드 CPU 시간 측정이 적절하다고 판정되었습니다.
- JSON Schema 트리를 키워드 이름으로 걷는 수정은 스키마 위치와 이름 지도(`properties`, `patternProperties`, `definitions`, `$defs`, `dependencies`)를 구별해야 합니다. ajv6과 ajv8에서 같은 종류의 결함이 검토에서 나왔습니다.
- 검토자는 재현 파일을 저장소 트리 밖에 두어야 합니다. 1라운드에서 검토자가 워크트리에 남긴 재현 파일을 지휘 세션이 지웠습니다. 검토자가 만든 분리된 git 워크트리 `/private/tmp/antd5-red-green`과 `/private/tmp/mui-review-red`는 정리 대상입니다.
- `@canard/schema-form` 5번 때문에 가지 노드의 값이 `null`일 수 있습니다. antd5와 antd6의 다중 enum 셀렉트는 이번 라운드에서 고쳤고, antd-mobile과 mui는 대조 테스트로 확인했습니다. 다른 사용자 정의 입력은 같은 처리가 필요합니다.
