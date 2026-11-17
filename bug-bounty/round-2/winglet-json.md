# @winglet/json 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 8건이며, 그중 1건은 문서 불일치 세 가지를 묶은 것입니다. 1라운드 문서([`../round-1/winglet-json.md`](../round-1/winglet-json.md))의 7건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-json/json.r2.test.ts`](probes/winglet-json/json.r2.test.ts) (테스트 이름이 `J`로 시작)

- 실행하려면 파일을 `packages/winglet/json/src/__bounty__/r2-json/`에 복사한 뒤 `yarn workspace @winglet/json test --run src/__bounty__/r2-json/json.r2.test.ts`를 실행합니다.
- 실패하지만 버그 항목이 아닌 테스트가 셋 있습니다. `J12h`는 참조 구현(fast-json-patch)도 같은 깊이에서 넘친다는 비교용이고, `J12z`는 넘치기 직전 깊이를 출력하는 측정용이며, `J13`은 아래 "버그가 아니라고 확인한 가설"에 적었습니다.

원인 파일 위치: `packages/winglet/json/src/JSONPointer/utils/`

## 1. 기본 immutable 모드의 `applyPatch`가 루트로 `move`나 `copy`를 한 뒤, 이어지는 연산에서 입력 문서를 직접 수정합니다

- 심각도: 높음. 기본 옵션만 써도 호출자의 원본 문서가 조용히 바뀝니다. 이 패키지의 핵심 보장을 깹니다.
- 영향받는 공개 API: `applyPatch` (패키지 루트와 `/pointer-patch` 하위 경로).
- 어긋난 계약:
  - `applyPatch.ts:22`의 JSDoc은 copy-on-write로 원본을 보존한다고 적고 있습니다.
  - applyPatch `DETAIL.md` 7행은 immutable 기본값에서 원본이 바뀌지 않는다고 적고 있습니다.
  - `docs/agents/skills/json-skill/knowledge/patching-and-safety.md:169`도 같은 보장을 약속합니다.
- 원인: `patch/applyPatch/utils/handleRootPatch.ts`의 45행과 59행이 `getValue(source, patch.from)`로 얻은 원본의 하위 트리를 복제하지 않고 그대로 새 루트로 반환합니다. 그 루트 객체는 복제 기록(`cloned` WeakSet)에 들어가지 않으므로, 다음 연산이 원본 객체를 제자리에서 수정합니다.
- 1라운드와의 관계: 새로운 종류입니다(copy-on-write 경로를 우회하는 문제).
- 재현:
  - `J2`: 깊게 동결한 입력에 `[move /a → "", add /z]`를 적용하면 "Cannot add property z, object is not extensible" 오류가 납니다. 기대 결과는 `{ b: 1, z: 3 }`입니다.
  - `J2b`: `[copy /a → "", replace /b 99]`를 적용하면 원본이 `{ a: { b: 99 } }`로 바뀝니다. 기대 동작은 원본이 그대로 남는 것입니다.
- 확신도: 높음.

## 2. 조상 위치로의 `move`가 "추가한 뒤 제거" 순서로 실행되어, 예외를 던지거나 잘못된 결과를 내고 immutable 모드에서도 입력을 바꿉니다

- 심각도: 중간에서 높음. 옮긴 값이 원시 값이면 처리되지 않은 `TypeError`가 나고, 객체이면 결과에 엉뚱한 키가 끼어들며 원본 입력까지 바뀝니다.
- 영향받는 공개 API: `applyPatch`.
- 어긋난 계약: RFC 6902 4.4절은 move가 `from`을 제거한 뒤 `path`에 추가하는 것과 같다고 정합니다. fast-json-patch는 기대값 `{ a: { d: 1 } }`를 냅니다.
- 원인: `handleObject.ts:101`이 먼저 `path`에 값을 기록하고, 102행이 그다음 `setValue(source, from, undefined)`를 호출합니다. 이때 `from` 경로가 방금 덮어쓴 값을 지나가는데, `setValueByPointer`가 없는 중간 노드를 자동으로 만들어 옮긴 값 안에 `b: {}`를 넣습니다. 그 값이 원시 값이면 `5['b'] = {}`에서 예외가 납니다. 옮긴 값은 원본의 하위 트리를 공유하므로 원본도 함께 바뀝니다.
- 1라운드와의 관계: 1라운드 1번과 같은 함수이지만 원인이 다릅니다. 1라운드 1번은 배열 인덱스 대입과 구멍 문제였고, 이 항목은 객체 경로에서 연산 순서가 뒤바뀐 문제입니다.
- 재현:
  - `J3`: `{ a: { b: { c: 5 } } }`에 `move /a/b/c → /a`를 적용하면 "TypeError: Cannot create property 'b' on number '5'"가 납니다. 기대 결과는 `{ a: 5 }`입니다.
  - `J3b`: 실제 결과는 `{ a: { d: 1, b: {} } }`이고, 기대 결과는 `{ a: { d: 1 } }`입니다.
  - `J3d`: 기본 immutable 모드에서 입력이 `{"a":{"b":{"c":{"d":1,"b":{}}}}}`로 바뀝니다.
- 확신도: 높음.

## 3. `compare`가 기본값 `immutable: true`에서도, 객체와 배열 사이에서 타입이 바뀌는 위치의 `replace`와 `test` 값에 원본 참조를 그대로 넣습니다

- 심각도: 중간. 나중에 `target`이나 `source`를 수정하면, 이미 받아 둔 패치 내용이 조용히 함께 바뀝니다.
- 영향받는 공개 API: `compare`.
- 어긋난 계약: compare `DETAIL.md`의 수락 그룹 `immutable-values`는 `immutable: true`에서 패치 값의 객체와 배열이 원본과 다른 참조를 갖는다고 하고, `patching-and-safety.md:172`도 같은 내용을 약속합니다.
- 원인: `compareRecursive.ts:93`, 95행에서 타입이 바뀌는 분기만 `processValue(…, immutable)`를 거치지 않고 `source`와 `target`을 그대로 넣습니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현:
  - `J1`: `compare({ a: { x: 1 } }, { a: [1, 2] })`의 replace 값이 `target.a`와 같은 참조입니다.
  - `J1b`: strict 모드의 test 값이 `source.a`와 같은 참조입니다.
- 확신도: 높음.

## 4. `difference`가 예약 멤버 키(`__proto__`, `constructor`, `prototype`)의 추가와 제거를 건너뛰어, `mergePatch`로 되돌린 결과가 target과 다릅니다

- 심각도: 중간에서 낮음. 예약 키만 다른 두 문서에 대해 "변경 없음"(`undefined`)을 반환합니다.
- 영향받는 공개 API: `difference`.
- 계약 충돌:
  - 공개 문서 `docs/agents/skills/json-skill/SKILL.md:46`은 예약 이름이 `difference`를 포함한 모든 함수에서 자기 데이터로 취급된다고 약속합니다. difference `DETAIL.md`의 `merge-patch-roundtrip` 수락 기준도 왕복 결과가 target과 같아야 한다고 요구합니다.
  - 반면 같은 `DETAIL.md`의 `reserved-member-excluded`는 예약 키를 건너뛴다고 문서화하고 있습니다. 공개 문서와 유지보수 문서가 서로 충돌합니다.
- 원인: `differenceRecursive.ts`의 36행부터 43행과 70행부터 75행이 예약 키를 `continue`로 건너뜁니다. 같은 패키지의 `mergePatchRecursive`는 예약 키를 일반 데이터로 다룹니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현:
  - `J4`: `difference({}, JSON.parse('{"constructor":1,"__proto__":{"x":1}}'))`가 `undefined`를 반환합니다.
  - `J4b`: source에서 `constructor`를 제거한 경우의 왕복 결과가 `{ constructor: 1, a: 1 }`입니다. 기대 결과는 `{ a: 1 }`입니다.
- 확신도: 높음.

## 5. `getJSONPointer`가 루트의 빈 문자열 키 아래 위치에 대해 잘못된 포인터를 반환합니다

- 심각도: 낮음. 반환된 포인터가 다른 위치를 가리킵니다.
- 영향받는 공개 API: `getJSONPointer` (`/pointer-common`, `/pointer` 하위 경로).
- 어긋난 계약: RFC 6901에서 빈 키는 `//x`처럼 빈 토큰으로 표현됩니다.
- 원인: `getJSONPointer.ts:56`, 68행의 `currentPath ? … : segments` 조건이 빈 문자열 경로를 루트로 오인해 앞의 빈 토큰을 버립니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: `J14`는 `{ '': { x: t } }`에서 `'/x'`를 반환합니다(기대 `'//x'`). `J14b`는 `{ '': [t] }`에서 `'/0'`을 반환합니다(기대 `'//0'`).
- 확신도: 높음.

## 6. 공개 에이전트 문서 세 곳이 실제 동작과 다릅니다

- 심각도: 낮음. 문서를 그대로 믿은 사용자가 잘못 판단하게 됩니다.
- (가) `setValue`의 예약 키 설명:
  - `docs/agents/skills/json-skill/knowledge/pointers-and-paths.md`의 23행과 29행은 `setValue({ x: 1 }, '/__proto__/pwn', true)`가 아무것도 하지 않는다고 적고 있습니다.
  - 실제로는 자기 데이터 `__proto__` 컨테이너를 만들어 값을 씁니다(`J5`, 실제 키 `['x', '__proto__']`). 같은 패키지의 `SKILL.md:60`은 실제 동작과 맞게 적고 있어, 문서끼리도 모순됩니다.
- (나) 쓰기 API 동작 통일 주장:
  - `knowledge/patching-and-safety.md:21`은 세 쓰기 API가 같은 포인터에 같은 결과를 낸다고 적고 있습니다.
  - 실제로 `/__proto__/isAdmin`에 대해 `applyPatch`는 `PATCH_PATH_INVALID_INTERMEDIATE` 오류를 던지고, `setValue`는 중간 컨테이너를 만들어 성공합니다.
- (다) `getJSONPointer`의 루트 반환값:
  - `knowledge/pointers-and-paths.md`의 72행과 118행은 `getJSONPointer(doc, doc)`가 `'/'`를 반환한다고 적고 있습니다.
  - 실제 반환값은 `''`입니다(`J15`). 코드가 RFC 6901과 getJSONPointer `DETAIL.md:14`에 맞으므로, 고칠 대상은 문서입니다.
- 1라운드와의 관계: 1라운드 7번(공개 문서 불일치)과 같은 종류입니다.
- 확신도: 높음.

## 7. 재귀로 구현된 함수들이 수천 단계 깊이에서 스택 오버플로를 냅니다

- 심각도: 낮음. 참조 구현인 fast-json-patch도 약 4,000단계에서 넘치고, 이 깊이의 실제 JSON 문서는 드뭅니다. 다만 `compare`는 참조 구현보다 얕은 깊이에서 넘칩니다.
- 영향받는 공개 API: `compare`, `mergePatch`, `difference`, strict `test`를 쓰는 `applyPatch`(내부에서 common-utils의 `equals`를 호출합니다).
- 어긋난 계약: 기본 정확성(처리되지 않은 `RangeError`).
- 원인: `compareRecursive`, `mergePatchRecursive`, `differenceRecursive`, 그리고 common-utils의 `equalsRecursive`가 모두 호출 스택 재귀로 구현되어 있습니다.
- 1라운드와의 관계: 새로운 종류입니다(깊이).
- 재현: `J12a`, `J12c`, `J12d`, `J12g`가 10,000단계에서 모두 `RangeError`를 냅니다. 메인 세션 실행에서 넘치기 직전 깊이는 `compare` 2,441, fast-json-patch `compare` 4,002, `mergePatch` 5,564, `difference`와 strict `test` 4,783이었습니다(실행마다 조금씩 다릅니다). `getValue`, `setValue`, `getJSONPointer`, `getJSONPath`, `applyPatch`의 깊은 replace는 10,000단계에서도 통과합니다.
- 확신도: 높음.

## 8. 포인터 앞부분(접두사) 처리에 두 가지 문제가 있습니다

- 심각도: 낮음.
- (가) `#`으로 시작하는 URI 프래그먼트 포인터의 퍼센트 인코딩을 풀지 않습니다. RFC 6901 6절은 프래그먼트 표현에서 디코딩을 요구합니다. `J11`: `getValue({ 'a b': 1 }, '#/a%20b')`가 `undefined`를 반환합니다(기대 `1`).
- (나) 배열 형태 포인터의 첫 토큰이 `'#'`이나 `''`이면 실제 키가 아니라 루트 표시로 해석됩니다. 문서는 배열 형태를 "토큰 배열"로 설명합니다. `J10`: `getValue({ '#': { x: 1 } }, ['#'])`가 문서 전체를 반환합니다.
- 원인: `compileSegments.ts`의 `handleStringPointer`와 `getValueByPointer.ts`의 `hasRootPrefix` 처리.
- 1라운드와의 관계: 새로운 종류입니다.
- 확신도: 중간. (나)는 `compilePointer` 출력 형식과 맞추려는 의도된 설계일 수 있습니다.

## 버그가 아니라고 확인한 가설

- `applyPatch`를 fast-json-patch와 3,000회 차등 비교했습니다(seed 12345). add, remove, replace, 값이 일치하는 test, 객체 부모 사이의 move와 copy를 포함했고, 1라운드에서 알려진 경우는 제외했습니다. 입력을 깊게 동결한 상태에서도 불일치와 입력 변경이 없었습니다(`J6`). 루트가 아닌 경로에서는 immutable 보장이 지켜집니다.
- `compare`로 만든 패치를 이 패키지의 `applyPatch`와 fast-json-patch로 각각 적용하는 왕복 시험 3,000회가 strict와 비strict 모두에서 일치했습니다(`J7`).
- `difference` 뒤 `mergePatch`의 왕복 3,000회가 모두 일치했습니다(`J8`). null을 포함한 target은 RFC 7396 자체 한계라 제외했습니다.
- `escapeSegment`, `unescapePath`, `compilePointer`, `setValue`, `getValue`의 왕복이 특수 문자 무작위 토큰 5,000회에서 모두 일치했습니다(`J9`).
- `difference(NaN, NaN)`이 `NaN`을 반환하지만(`J13`), NaN은 JSON 값이 아니고 공개 타입도 `JSONValue`이므로 보고하지 않았습니다.
