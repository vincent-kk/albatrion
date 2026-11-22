# @winglet/json-schema 버그 바운티 결과

확인된 문제는 4건입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트:

- [`probes/winglet-json-schema/resolver.probe.test.ts`](probes/winglet-json-schema/resolver.probe.test.ts) (테스트 이름이 `H`로 시작)
- [`probes/winglet-json-schema/subpath-and-dialect.probe.test.ts`](probes/winglet-json-schema/subpath-and-dialect.probe.test.ts) (테스트 이름이 `S`로 시작. 통과하는 대조 테스트도 함께 들어 있습니다)

원인 파일:

- `ResolverStore.ts`: `packages/winglet/json-schema/src/utils/JSONSchemaScanner/createReferenceResolver/utils/ResolverStore/ResolverStore.ts`
- `ScanEngine.ts`: `packages/winglet/json-schema/src/utils/JSONSchemaScanner/utils/engine/ScanEngine.ts`

## 1. 내장 리졸버가 등록된 문서 안의 `$id` 자원을 그 문서가 참조된 뒤에야 색인해, 참조 결과가 순서에 따라 달라집니다

- 심각도: 중간. 같은 스키마가 속성 순서에 따라 다른 결과를 냅니다.
- 영향받는 공개 API: `resources` 옵션을 쓴 `createReferenceResolver`, `createReferenceResolverAsync`.
- 어긋난 계약: JSON Schema 2020-12의 9.1.2절과 9.2절은 제공된 문서 안에 내장된 자원도 식별 가능하다고 정합니다. 리졸버는 결정적이고 정규화된 결과를 내야 합니다. 명세는 `resources`가 "첫 조회 때 색인된다"고만 적고, 그 때문에 결과가 순서에 의존한다는 점은 언급하지 않습니다.
- 원인: `ResolverStore.ts:352`부터 364행의 `ensure(uri)`는 조회 키와 정확히 일치할 때만 찾으므로, 내장 식별자는 그것을 담은 문서가 색인되기 전까지 알려지지 않습니다.
- 재현:
  - 테스트 `H5`: 등록 문서 `types.json`이 `nested.json`을 내장합니다. 루트가 `types.json`을 먼저 참조하면 `$ref: 'nested.json'`이 해석되고, 순서를 바꾸면 해석되지 않습니다.
  - 테스트 `H5b`: 비동기 리졸버는 등록 자원이 내장하고 있는 주소인데도 `load('https://ex.example/nested.json')`을 호출하고, 참조는 해석되지 않은 채 남습니다.
- 확신도: 높음.

## 2. 리졸버 없이 스캔하면 식별자 키워드를 하위 스키마의 `$schema`가 아니라 바깥 방언으로 골라, 리졸버를 쓴 스캔과 결과가 달라집니다

- 심각도: 중간. 리졸버가 없으면 엉뚱한 위치가 비활성(inert) 또는 활성으로 표시되어, 의미 변환이 건너뛰어지거나 잘못 적용됩니다.
- 영향받는 공개 API: `resolveReference` 없이 쓰는 `JSONSchemaScanner`, `JSONSchemaScannerAsync`.
- 어긋난 계약: 명세는 "각 스키마 자신의 `$schema`가 어떤 키워드를 적용할지 정한다", 그리고 자원의 `$schema`가 방언을 고른다고 적고 있습니다. 리졸버 `DETAIL.md`도 draft-04는 `id`만, 이후 방언은 `$id`만 읽는다고 적고 있습니다.
- 원인: `ScanEngine.ts:233`부터 240행은 `$id`를 확인하고, 바깥 방언이 draft-04일 때만 `id`를 확인합니다. 리졸버의 `child()`(`ResolverStore.ts:99`, 100행)는 하위 스키마가 스스로 선언한 방언을 씁니다.
- 재현:
  - 테스트 `H1`: 2020-12 루트 아래 `id`를 가진 draft-04 하위 스키마에서, `contains`가 리졸버가 있으면 비활성이고 없으면 활성입니다.
  - 테스트 `H2`: draft-04 루트 아래 `id`만 가진 draft-06 하위 스키마에서 두 스캔이 다릅니다.
  - 테스트 `S3`: `JSONSchemaScanner.dialectResources.test.ts:38`부터 42행의 사례(draft-04 아래 `id`와 2020-12 `$schema`)에서 `prefixItems/0`이 리졸버 없이는 inert=false, 리졸버가 있으면 true입니다.
- 계약 충돌: 위 기존 테스트가 스캐너 단독 동작을 고정하고 있습니다.
- 확신도: 높음.

## 3. 리졸버가 대상을 복사할 때, 그 방언에서 식별자가 아닌 키워드까지 지웁니다

- 심각도: 낮음에서 중간. 인라인된 출력에서 주석(annotation) 키워드가 조용히 사라집니다. 2019-09와 2020-12의 `id`, draft-06과 draft-07의 `$anchor`가 이에 해당합니다.
- 영향받는 공개 API: `createReferenceResolver`, `resolveReference`.
- 어긋난 계약: 명세는 안전한 이동이 "식별자 경계를 제거한다"고 적고 있습니다. 위 방언에서 이 키들은 식별자가 아니라 일반적인 알 수 없는 키워드입니다.
- 원인: `ResolverStore.ts:29`부터 37행의 `identifiers` 목록이 방언과 무관하게 고정되어 있고, `hasIdentifiers`와 642행의 삭제에 그대로 쓰입니다.
- 재현:
  - 테스트 `H3`: 2020-12의 `$defs.A = {id:'user', type:'string'}`가 `{type:'string'}`으로 인라인됩니다.
  - 테스트 `H3b`: draft-07의 `{$anchor:'note', type:'string'}`이 `$anchor`를 잃습니다.
- 확신도: 높음.

## 4. `resources`의 키는 정규화된 철자로만 찾아집니다

- 심각도: 매우 낮음.
- 설명: 키 `'https://Ex.Example/types.json'`은 찾아지지 않습니다. 참조는 정규화된 `https://ex.example/...` 형태로 해석되기 때문입니다. RFC 3986은 스킴과 호스트를 대소문자 구분 없이 취급합니다.
- 재현: 테스트 `H6`.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 포인터 조각은 익명, `https`, `urn:` 기준 모두에서 올바르게 해석됩니다. `~0`과 `~1` 이스케이프, `%20`, `%C3%A9`, `%25`, 빈 토큰(`#/$defs/`), 이스케이프하지 않은 비ASCII 키를 확인했습니다(`H4`).
- `/keyword`, `/scanner`, `/async-scanner` 하위 경로는 ESM과 CommonJS 빌드 모두에서 패키지 루트와 같은 `DEFAULT_KEYWORDS`와 `Dialect` 객체를 공유합니다(`S1`, `S2`). 비동기 하위 경로가 `JSONSchemaScanError`를 내보내지 않는 것은 약속된 적이 없습니다.
- `properties` 아래의 자기 참조 `$ref: '#'`은 한 번 펼쳐진 뒤 `cycle`로 기록됩니다. 교체를 통해 도달한 조상만 활성으로 센다는 문서 규칙과 일치합니다.
- `prefixItems` 튜플 타입 추론은 `InferValueType.tuple.type.test.ts`가 촘촘히 다루고 있고, 타입을 읽어 본 결과 문제가 없어 깊이 탐색하지 않았습니다.
