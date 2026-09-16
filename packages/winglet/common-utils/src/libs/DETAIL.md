# libs contract

## Requirements

- `cacheMapFactory`/`cacheWeakMapFactory`는 각각 `Map`/`WeakMap`을 감싸 `get`/`set`/`has`/`delete`와 원본 접근(`getCache`)을 제공하며, 초기값을 넘기면 그 인스턴스를 그대로 사용하고 넘기지 않으면 새로 생성한다.
- `counterFactory`는 초기값(기본 0)을 클로저에 캡슐화하고 `increment`/`decrement`/`reset`/`getValue`로만 조작 가능하다.
- `getKeys`는 배열이면 문자열 인덱스를, 객체면 own enumerable 키를, 그 외 값이면 `for...in` + own-property 검사 결과를 반환하며 `null`/`undefined`/원시값에는 빈 배열을 반환한다.
- `hasOwnProperty`는 `Object.prototype.hasOwnProperty.call()`을 사용해 상속 프로퍼티를 own으로 오판하지 않는다.
- `getTypeTag`는 `null`/`undefined`를 단축 반환하고, 그 외 값은 `Object.prototype.toString.call(value)` 결과를 그대로 반환한다.
- 난수 헬퍼 3종은 모두 `Math.random()` 기반이며, `getRandomNumber`는 `min`/`max` 양끝을 포함한 정수를 반환한다.

## API Contracts

- 캐시 팩토리에 기존 Map 또는 WeakMap을 넘기면 복사하지 않고 같은 인스턴스를 사용합니다. 원본 접근도 그 인스턴스를 반환합니다. WeakMap 래퍼에는 열거와 크기 조회 기능을 추가하지 않습니다.
- 카운터는 생성 시 초기값을 기억하고, 증감 결과를 반환하며, reset은 최초 초기값으로 돌아갑니다. 상태는 클로저 내부에서 관리합니다.
- 키 추출은 문자열 키 배열을 반환하고 own 프로퍼티 판별은 상속 프로퍼티를 제외합니다. hasOwnProperty의 타입 가드는 확인한 키를 입력 객체의 키 타입으로 좁힙니다.
- 타입 태그는 null과 undefined를 별도로 처리하며 그 외에는 네이티브 태그 문자열을 반환합니다.
- 난수 문자열은 지정한 진법을 사용하고 기본 진법은 32입니다. 정수 난수의 범위는 양 끝을 포함하며, 불린 난수는 true 또는 false를 반환합니다.

## Acceptance Criteria

### cache-factory-wrapping — 캐시 팩토리의 Map/WeakMap 위임

- 초기값을 주지 않으면 각각 새 `Map`/`WeakMap`을 생성하고, 기존 인스턴스를 주면 `getCache()`가 그 인스턴스를 그대로 반환한다.
- `set`/`has`/`get`/`delete`가 내부 `Map`/`WeakMap`에 정확히 위임되고, `cacheMapFactory`의 `size`/`keys`/`values`/`entries`/`clear`도 내부 `Map`과 일치한다.

### counter-mutation — counterFactory 상태 전이

- 초기값 없이 생성하면 `getValue()`가 0이고, 초기값을 주면 그 값에서 시작한다.
- `increment`/`decrement`는 값을 1씩 바꾸고 바뀐 값을 반환하며, `reset`은 항상 최초 초기값으로 되돌린다.

### key-extraction-parity — getKeys/hasOwnProperty의 own-property 판별

- `getKeys`는 배열에서 문자열 인덱스 배열을, 일반 객체에서 own enumerable 키만, `null`/`undefined`/숫자/불린에서 빈 배열을, `Object.create(null)` 객체에서도 own 키를 반환한다.
- `hasOwnProperty`는 상속 프로퍼티에는 `false`, own 프로퍼티(배열 인덱스 포함)에는 `true`를 반환한다.

### type-tag-detection — getTypeTag의 네이티브 태그 반환

- `getTypeTag(null)`/`getTypeTag(undefined)`는 각각 `NULL_TAG`/`UNDEFINED_TAG`를 반환한다.
- 원시값(숫자·문자열·불린·심볼)과 객체(`{}`/`[]`/`Date`/`RegExp`/`Map`/`Set`)에서 각각 대응하는 `[object X]` 문자열을 반환한다.
- 화살표 함수·일반 함수는 `'[object Function]'`, `async function`은 `'[object AsyncFunction]'`을 반환한다.

### random-helper-bounds — 난수 헬퍼의 값 범위

- `getRandomString(16)`은 16진수 문자만 포함한 문자열을 반환하고, 반복 호출 시 서로 다른 값을 만든다.
- `getRandomNumber(min, max)`는 `min`과 `max`를 포함한 범위 내 정수를 반환하며 `min === max`면 그 값을 그대로 반환한다.
- `getRandomBoolean()`은 반복 호출 시 `true`/`false`가 모두 관찰된다.

## Boundary Exemptions

### `*.ts` — flat 헬퍼 컬렉션 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: 캐시 생성·카운터·키 추출·타입 태그·own-property 판별·난수 생성은 서로 책임이 겹치지 않아 하나의 organ 이름으로 묶을 근거가 없다 — 강제로 묶으면 grab-bag이 된다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
