# applyPatch contract

## Requirements

- RFC 6902 연산 6종을 순서대로 적용하고, 실패를 구조화된 `JSONPatchError`로 보고한다.
- 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)을 불투명한 문자열로 취급해 own 데이터 속성으로 읽고 쓴다. 어떤 패치 입력·옵션 조합에서도 반환 문서의 프로토타입은 교체되지 않고 `Object.prototype` 등 상속 객체는 변경되지 않는다.
- immutable 기본값에서 소스는 변경되지 않으며, 변경 경로만 copy-on-write로 분리된다.

## API Contracts

- `applyPatch(source, patches, options?)`:
  - `options.strict`: 값을 읽지 않는 `@deprecated` 옵션이다. 기존 호출의 타입 호환을 위해 타입에만 남아 있다.
  - `test`는 모든 모드에서 대상 값과 `value`를 깊은 비교하고, 불일치는 `PATCH_TEST_FAILED`로 패치 전체를 중단한다(RFC 6902 §4.6, §5). 비교를 끌 수 있으면 낙관적 동시성 제어 같은 방어 조건이 조용히 통과하고 뒤따르는 연산이 실행된다.
  - `options.immutable`(기본 true): 변경 경로 copy-on-write. false면 소스를 제자리에서 수정한다.
  - `protectPrototype` 옵션은 존재하지 않는다 — 0.13.x의 이 옵션은 제거되었다. 예약 멤버 안전성은 접근 프리미티브가 구조적으로 보증하므로 어떤 옵션 값으로도 끌 수 없고, 알 수 없는 옵션 키는 무시된다.
- 경로 순회: 각 세그먼트의 읽기와 copy-on-write 기록은 데이터 속성 프리미티브를 경유한다. 예약 멤버 세그먼트는 일반 키와 동일하게 순회·기록된다 — 예외를 던지지 않는다.
- `move`/`copy`의 `from` 경로도 동일한 own 데이터 의미론으로 해석된다: own이 아닌 예약 멤버 위치는 존재하지 않는 위치와 동일하게 처리된다(프로토타입 객체가 값으로 새어나오지 않는다).
- `move`는 RFC 6902 §4.4대로 `from`의 값을 먼저 제거한 뒤 `path`에 `add`한다. 제거는 배열에서 요소를 당기므로(splice) 구멍을 남기지 않고, `path`는 제거가 끝난 문서에서 해석된다(A.7: `/foo/1`을 `/foo/3`으로 옮기면 삽입이다). `from`이 없으면 `remove`와 같은 코드(`PATCH_OBJECT_PROPERTY_NOT_FOUND`, `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS`, `PATCH_PATH_INVALID_INTERMEDIATE`)로 실패한다 — 없는 값을 `undefined`로 옮기면 대상에 존재하지 않던 멤버가 생긴다.
- `replace`는 RFC 6902 §4.3대로 대상이 존재해야 한다. 없는 객체 멤버는 모든 모드에서 `PATCH_OBJECT_PROPERTY_NOT_FOUND`, 범위 밖 배열 인덱스는 `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS`다 — `replace`가 멤버를 추가하면 존재를 전제한 패치가 오타 난 경로에 새 멤버를 만들고도 성공한다.
- `copy`는 RFC 6902 §4.5대로 `from` 값의 깊은 복사를 `path`에 `add`한다. 배열 인덱스 대상은 삽입이다.
- 순환 금지는 `move`에서 `from`이 `path`의 진짜 접두사일 때만 `PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN`이다. `from`과 `path`가 같은 `move`는 제거 후 같은 위치에 다시 추가하므로 문서가 같다. `copy`에는 위치 제한이 없다 — 값을 먼저 읽고 복사하므로 자기 하위로의 복사도 유한하다. `copy`는 위치 관계 때문에 실패하지 않으며, 이를 나타내는 오류 코드도 없다.
- `immutable: false`에서 연산이 실패하면 그 전까지 적용된 변경은 소스에 남는다. `move`는 제거가 추가보다 먼저이므로, 추가 단계(예: 범위 밖 인덱스)에서 실패하면 제거만 남는다. 원자적 적용이 필요하면 immutable 기본값을 쓴다.
- 배열 컨텍스트의 세그먼트는 `0`이나 앞에 0이 없는 10진수 인덱스(RFC 6901 §4), 또는 `-`만 허용되고, 그 외에는 모든 모드에서 `PATCH_ARRAY_INDEX_INVALID`다. `01`처럼 앞에 0이 붙은 인덱스를 받아들이면 같은 요소를 가리키는 표기가 여럿 생겨, 패치를 검사한 쪽과 적용하는 쪽이 다른 위치를 본다.

예약 멤버 안전성은 구조적으로 보장되므로 옵션으로 끌 수 없습니다. 예약 경로의 거부가 필요한 호출자는 패치를 적용하기 전에 검증합니다.

## Acceptance Criteria

### reserved-data-patch — 예약 멤버 own 데이터 적용 (RC-6)

- 예약 멤버 경로의 add/replace가 own 데이터 속성을 만들고, 반환 문서의 프로토타입은 교체되지 않으며, 에러가 발생하지 않고, `Object.prototype`은 오염되지 않는다.
- 문서화된 동작과 실제 동작이 일치하고, 임의의 옵션 값(과거 `protectPrototype` 포함)을 넘겨도 상속 객체는 변경되지 않는다.
- own이 아닌 예약 멤버를 `from`으로 참조한 copy/move는 상속 객체를 값으로 노출하지 않는다.

### rfc6902-ops — RFC 6902 연산 의미론

- add/remove/replace/move/copy/test가 RFC 6902 §4 의미론을 따르고, 실패는 구조화된 에러 코드로 보고된다.

### immutability — copy-on-write 불변 기본값

- 기본 호출에서 소스는 변경되지 않고, 무변경 서브트리는 반환 문서와 구조를 공유한다.

## Boundary Exemptions

### `applySinglePatch.ts` — 연산 코어 root peer 유지

- **Consumers**: `applyPatch.ts`와 `__tests__`
- **Direct import**: `allowed`
- **Reason**: 진입점 `applyPatch`와 단일 연산 코어는 한 몸의 두 파일이다 — organ 재배치는 경로 깊이만 늘리고 경계를 바꾸지 못한다. flat root peer가 의도된 형태다.

## Last Updated

applyPatch의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
