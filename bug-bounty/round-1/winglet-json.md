# @winglet/json 버그 바운티 결과

확인된 문제는 7건이며, 그중 1건은 문서 불일치 두 가지를 묶은 것입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 몇몇 항목은 기존 테스트나 유지보수 문서가 현재 동작을 고정하고 있어, 버그라기보다 표준과의 계약 충돌로 표시했습니다.

재현 테스트:

- [`probes/winglet-json/json.patch-move.probe.test.ts`](probes/winglet-json/json.patch-move.probe.test.ts) (테스트 이름이 `M`으로 시작)
- [`probes/winglet-json/json.probe.test.ts`](probes/winglet-json/json.probe.test.ts) (테스트 이름이 `P`로 시작. 통과하는 대조 테스트도 함께 들어 있습니다)

공통 원인 파일 위치: `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/utils/`

## 1. `applyPatch`의 `move`가 배열 인덱스로 옮길 때 그 자리 요소를 덮어쓰고, 배열에서 옮겨 나갈 때 구멍을 남깁니다

- 심각도: 높음. 기본 옵션과 `immutable: false` 모두에서 데이터가 조용히 손상됩니다.
- 영향받는 공개 API: `applyPatch` (`@winglet/json`, `/pointer-patch`).
- 어긋난 계약: RFC 6902 4.4절은 move가 값을 지운 뒤 추가하는 것과 같다고 하고, 배열에 대한 add는 삽입입니다. 부록 A.7이 기준 예제입니다. applyPatch `DETAIL.md`의 수락 그룹 `rfc6902-ops`도 4절 의미를 약속합니다.
- 원인: `handleArray.ts:140`과 141행이 값을 끼워 넣지 않고 `array[index] = …`로 대입합니다. 이어서 `handleArray.ts:141`과 `handleObject.ts:102`가 `setValue(source, from, undefined)`로 원본을 지우는데, 이 호출은 속성을 삭제하므로 배열에서는 요소를 당기지 않고 구멍을 남깁니다.
- 재현:
  - 테스트 `M1`(두 immutable 모드)과 `P18`: A.7 입력 `['all','grass','cows','eat']`에서 `/foo/1`을 `/foo/3`으로 옮기면, 실제 `['all', <구멍>, 'cows', 'grass']`가 되어 `'eat'`이 사라집니다. 기대값은 `['all','cows','eat','grass']`입니다.
  - 테스트 `M2`: `{a:[1,2,3]}`에서 `/a/0`을 `/b`로 옮기면 실제 `a: [<구멍>,2,3]`, 기대 `a: [2,3]`.
- 계약 충돌: 기존 테스트 `applyPatch.test.ts:238`부터 247행이 덮어쓰기 동작(`/items/0`으로 옮기면 `[10,2,3]`)을 고정하고 있어 RFC와 충돌합니다. 구멍을 고정한 테스트는 없습니다.
- 확신도: 높음.

## 2. `applyPatch`의 `copy`가 배열 인덱스에 삽입하지 않고 그 자리 요소를 바꿉니다

- 심각도: 중간. 데이터가 사라집니다.
- 어긋난 계약: RFC 6902 4.5절은 copy가 대상 위치에 대한 add와 같다고 합니다.
- 원인: `handleArray.ts:172`가 끼워 넣지 않고 `array[index] = cloneLite(...)`로 대입합니다.
- 재현: 테스트 `M3`. `{a:[1,2,3]}`에서 `/x`(값 9)를 `/a/1`로 복사하면 실제 `[1,9,3]`, 기대 `[1,9,2,3]`.
- 확신도: 높음.

## 3. 기본(비엄격) 모드의 `test` 연산이 값을 비교하지 않아, 실패해야 할 테스트 뒤의 패치가 그대로 실행됩니다

- 심각도: 중간. 낙관적 동시성 제어처럼 패치를 멈춰야 하는 방어 조건이 조용히 통과합니다.
- 어긋난 계약: RFC 6902 4.6절은 불일치를 오류로, 5절은 그때 패치 전체를 중단해야 한다고 정합니다. 공개 문서 `docs/en/SPECIFICATION.md`도 `test`를 "Assert that value at path equals given value"로 설명하고 "Test + conditional update" 예제를 보여 줍니다.
- 계약 충돌: applyPatch `DETAIL.md`는 값 비교가 `strict: true`에서만 일어난다고 문서화하고 있습니다. 그래서 RFC와 공개 문서가 한쪽, 유지보수 문서가 다른 쪽에 선 계약 충돌입니다.
- 원인: `handleObject.ts:75`와 `handleArray.ts:100`이 모두 `if (!strict || equals(...)) return source;`를 씁니다.
- 재현: 테스트 `M8`과 `P6`. `{status:'published'}`에서 `/status`가 `'draft'`인지 테스트한 뒤 값을 바꾸면, 실제로는 패치가 성공해 `{status:'archived'}`가 됩니다. 기대 동작은 오류입니다.
- 확신도: 높음.

## 4. `from`과 `path`가 같은 `move`/`copy`, 그리고 자기 하위로의 `copy`가 예외를 던집니다

- 심각도: 낮음.
- 어긋난 계약: RFC 6902 4.4절은 `from`이 `path`의 진짜 접두사인 경우만 금지합니다. 4.5절은 `copy`에 그런 제한을 두지 않습니다.
- 원인: `isCircularMoveReference.ts`가 `from === path`를 순환으로 보고, 이 검사가 COPY에도 적용됩니다(`handleObject.ts`, `handleArray.ts`).
- 재현: 테스트 `M4`(`/a/0`을 `/a/0`으로 move), `P11`(`/a`를 `/a`로 move), `M6`(`/a`를 `/a/y`로 copy, 기대 `{a:{x:1, y:{x:1}}}`)이 모두 예외를 던집니다.
- 계약 충돌: 기존 테스트 `applyPatch.errors.test.ts:329`부터 345행이 같은 위치 move의 오류를 고정하고 있습니다.
- 확신도: 높음.

## 5. 없는 객체 멤버에 대한 `replace`가 `strict: true`에서도 성공해 멤버를 추가합니다

- 심각도: 낮음.
- 어긋난 계약: RFC 6902 4.3절은 대상 위치가 존재해야 한다고 정합니다.
- 원인: `handleObject.ts:41`과 42행이 ADD와 REPLACE를 똑같이 처리합니다.
- 재현: 테스트 `M7`과 `P5`. `{a:1}`에 `/b`를 replace하면 오류 대신 `{a:1,b:2}`가 됩니다.
- 확신도: 높음.

## 6. 앞에 0이 붙은 배열 인덱스를 받아들입니다

- 심각도: 낮음.
- 어긋난 계약: RFC 6901 4절은 배열 인덱스를 `0`이거나 앞에 0이 없는 숫자로 정의하고, 그 밖의 값은 오류로 봅니다.
- 원인: `getArrayIndex.ts`가 `isArrayIndex`가 받아들이는 키를 모두 받고 `~~key`로 변환합니다.
- 재현: 테스트 `M9`(`strict: true`)와 `P9`. `{a:[1,2]}`에서 `/a/01`을 remove하면 예외 대신 인덱스 1이 지워집니다.
- 확신도: 높음.

## 7. 공개 문서 불일치 두 가지

- 심각도: 낮음.
- (가) `convertJSONPointerToPath`:
  - `packages/winglet/json/docs/en/SPECIFICATION.md`의 265행부터 279행은 이 함수가 이스케이프를 푼 토큰의 `string[]`(예: `['a/b','c~d']`)를 반환한다고 적고 있습니다.
  - 실제로는 Ajv 스타일 dataPath 문자열을 반환하고 토큰 이스케이프도 풀지 않습니다. `'/~01'`은 `'.~01'`, `'/a~1b/c~0d'`는 `'.a~1b.c~0d'`가 됩니다.
  - JSDoc(`convertJSONPointerToPath.ts:3`부터 16행)은 코드와 일치하므로, 오래된 쪽은 SPECIFICATION입니다.
  - 재현: 테스트 `P24`, `M11`.
  - 확신도: 높음.
- (나) `getValue`가 상속 멤버와 인덱스가 아닌 멤버를 읽습니다:
  - `getValue({}, '/toString')`은 `Object.prototype.toString`을, `getValue({a:[1]}, '/a/length')`는 1을 반환합니다.
  - RFC 6901과 SPECIFICATION의 "Throws PROPERTY_NOT_FOUND"는 둘 다 오류를 요구하고, SPECIFICATION의 예약 멤버 절은 "읽기는 프로토타입 체인을 따라가지 않는다"고 적고 있습니다.
  - manipulator `DETAIL.md`는 일반 키의 필터 없는 읽기를 문서화하고 있으므로, 공개 문서와의 충돌입니다.
  - 재현: 테스트 `P26`.
  - 확신도: 중간.

## 버그가 아니라고 확인한 가설

- RFC 6902에서 통과하는 동작: 배열 중간 add, 끝에 추가, 범위 밖 인덱스 오류, 없는 멤버나 `-` 인덱스의 remove 오류, 키 순서와 무관한 깊은 비교 `test`(A.8), `~01` 이스케이프(A.14), 자기 자식으로의 move 오류, `copy`의 깊은 복사, `/`를 통한 빈 키 `""`, 루트 replace, 없는 부모 아래 add 오류(A.12), 실패한 immutable 패치가 원본을 바꾸지 않는 것.
- `compare` 뒤의 `applyPatch`는 10가지 모양에서 왕복이 일치합니다.
- `mergePatch`는 RFC 7396 부록 A의 15개 사례를 모두 통과합니다.
- `setValue`의 `-` 추가는 올바르고, immutable move는 원본을 건드리지 않습니다.
- `difference`가 merge patch로 "null로 설정"을 표현할 수 없는 것은 RFC 7396 자체의 한계입니다.
- `applyPatch`가 호출자의 `value` 객체를 참조로 결과에 넣는 것은 계약 위반이 아닙니다.
- `unknown` 입력에 대한 `getValue` 오버로드는 소스와 빌드된 선언 파일 모두에 있습니다.
