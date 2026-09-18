# Graph codec contract

## Requirements

지원되는 그래프 데이터의 저장·복원을 제공합니다. 무손실은 아래 지원 데이터 모델과 보존되는 참조 관계에 한정합니다. non-enumerable 사용자 속성, descriptor, frozen/sealed 상태와 사용자 prototype은 보존 계약 밖입니다. 비교 키 생성·정렬·캐시 정책은 fingerprint가 소유합니다.

## API Contracts

### 저장과 복원의 경계

JSON.parse만으로는 원래 객체가 아닌 버전 있는 wire 배열을 얻습니다. parseGraph는 이를 해석하여 객체 identity를 복원합니다. 문자열은 정규 비교 키가 아니며 속성 삽입 순서가 다른 객체의 출력이 같다고 보장하지 않습니다. 인코더는 반복 순회와 참조 테이블로 중간 graph를 구성하고, 디코더는 전체 검증·노드 할당·참조 연결을 순서대로 수행합니다.

stringifyGraph(value, { omit? })는 own enumerable string 데이터 속성을 저장합니다. parseGraph(text)는 unknown을 반환하며 지원되지 않는 입력과 잘못된 wire에 TypeError, 잘못된 JSON 문법에 SyntaxError를 발생시킵니다. omit은 object/array 이름에 재귀 적용하며 값 접근보다 먼저 판정합니다. 배열 index 제외는 length를 유지한 hole입니다. Map/Set의 entry와 intrinsic payload에는 omit을 적용하지 않습니다. mutable omit 변경은 매 호출 반영합니다.

지원 값은 null, boolean, string, number(NaN/±Infinity/-0 포함), undefined, BigInt, plain/null-prototype object, array(hole 및 추가 enumerable string 속성), Date(Invalid Date 포함), Map, Set, RegExp(source/flags/임의 지원 값 lastIndex)입니다. 객체 타입 모두 identity를 보존합니다. 함수, symbol 값/키, 사용자 클래스, Promise, WeakMap/WeakSet, DOM, binary 타입은 거부합니다. accessor는 읽기 전에 거부하고 toJSON은 호출하지 않습니다. builtin 추가 enumerable 데이터와 symbol 키도 거부합니다.

형식은 `['winglet.graph',1,rootToken,nodes]`입니다. token은 `['null']`, `['undefined']`, `['boolean',v]`, `['string',v]`, `['number',finite 또는 'NaN'/'Infinity'/'-Infinity'/'-0']`, `['bigint',정규 10진 문자열]`, `['ref',nodeIndex]`입니다.

node는 `['object','plain'|'null',entries]`, `['array',length,entries]`, `['date',numberToken]`, `['map',tokenPairs]`, `['set',tokens]`, `['regexp',source,flags,lastIndexToken]`입니다. property entry는 `[string,token]`입니다. 배열 length entry는 금지하고 index는 length 미만입니다. Map/Set 삽입 순서를 보존하며 중복 entry를 거부합니다. 사용자 marker·예약 키도 데이터로 보존합니다.

입력 UTF-8 16 MiB, node 100,000, 총 property/collection entry 1,000,000, 단일 배열 length 1,000,000, 누적 배열 length 1,000,000을 제한합니다. hole과 도달 불가능 node를 합산하고 shared node는 한 번 셉니다. encoder에도 같은 제한을 적용합니다. JSON.parse의 wire 할당 뒤 검증을 완료하고 복원 node를 할당합니다. 모든 object/array 속성은 writable/enumerable/configurable own data property로 정의하며 RegExp.lastIndex는 intrinsic 슬롯에 복원합니다.

accessor 거부는 일반 데이터 객체의 descriptor 검사에 대한 보장입니다. Proxy의 reflection trap 실행까지 방지하는 sandbox는 아닙니다. 자원 한도는 wire 크기와 복원 데이터의 상한이며 실행 시간이나 전체 프로세스 메모리를 보장하지 않습니다.

### 성능과 호환성

일반 JSON에 대해 JSON.stringify보다 빠르다는 보장은 없습니다. graph 검증·태그·참조 보존 비용을 키 생성과 분리하여 측정합니다. stringify, parse, roundtrip, omit을 각각 측정하며 입력 생성은 측정 밖에 둡니다. 밀집 배열 실험 형식은 공개 계약에 포함하지 않습니다. wire version 변경은 기존 저장 문자열의 복원 호환성을 검토한 뒤 결정합니다.

## Acceptance Criteria

### graph-primitives — 스칼라 보존

- 모든 scalar, escaping, 특수 숫자를 보존하며 비지원 root를 거부합니다.

### graph-containers — 컨테이너 상태

- 각 컨테이너 값·순서·프로토타입·hole·추가 속성을 보존하고 accessor와 비지원 builtin 추가 데이터를 거부합니다.

### graph-references — 참조 관계

- self/mutual cycle, shared Date, Map key, Set self, RegExp lastIndex 참조를 보존합니다.

### graph-omit — 재귀 제외

- 재귀 제외, getter 회피, 배열 hole, mutable omit 변경 및 제외 후 참조 관계를 지킵니다.

## Last Updated

2026-09-19
