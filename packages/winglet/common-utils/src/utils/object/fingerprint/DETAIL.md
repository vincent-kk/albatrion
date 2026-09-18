# Fingerprint performance contract

## Requirements

빠른 객체 키 생성이 목적입니다. parse 보장은 요구하지 않습니다. 직접 문자열 생성과 cache hit 경로를 사용하며 graph wire나 encoder에 의존하지 않습니다. 성능 측정과 미달 영역은 API 구현 완료와 구분해 보고합니다.

## API Contracts

세 함수는 각각 다른 목적의 키 생성기입니다. createFingerprint는 빠른 shallow 키를 생성하며 top-level 속성만 omit하고 중첩 값에는 native JSON을 사용합니다. 속성 삽입 순서에 민감하고 native JSON의 손실·예외·toJSON 동작을 따릅니다. createSortedFingerprint는 경로 flatten 정렬을 사용하며 재귀 omit과 순환 marker를 제공합니다. 두 경로는 delimiter·타입·빈 컨테이너 구분이 모호할 수 있으며 Map/Set payload를 비교하지 않습니다.

createSafeFingerprint는 정렬·순환 처리 키입니다. plain object/array의 내용을 비교하고 Date/RegExp는 값을, Map/Set/함수/사용자 인스턴스/symbol 값은 참조 identity를 비교합니다. Map/Set 내부 mutation은 키를 바꾸지 않습니다. standalone 함수의 opaque identity 범위는 module 수명이며 factory는 독립 범위입니다. factory 간 또는 프로세스 간 opaque 키 비교는 보장하지 않습니다. safe는 순환 종료와 타입/문자열 경계 구분의 의미이며 암호학적 hash나 복원 형식이 아닙니다.

세 함수는 { omit?, prefix? }를 받고 prefix 기본값은 빈 문자열입니다. createFingerprintFactory({ mode?: 'fast'|'sorted'|'safe', cache?: 'none'|'immutable', prefix? })는 생성 시 mode/prefix를 고정하며 mode 기본값은 safe입니다. 호출 옵션은 omit입니다. 기본은 mutation을 반영하고 immutable은 호출자가 깊은 불변성을 보장할 때만 사용합니다. omit 집합 변경은 매 호출 반영하며 완료된 root 결과만 cache에 저장합니다. 변경 불가능한 입력이라는 전제에서도 실패한 부분 결과는 저장하지 않습니다.

일반 속성을 직접 읽으므로 getter를 실행할 수 있습니다. omit은 읽기 전에 적용합니다. symbol key/non-enumerable/descriptor는 키에 포함하지 않습니다. graph UTF-8 byte 제한이나 복원 모델을 강제하지 않습니다. safe는 sort 옵션으로 객체 속성 정렬을 선택합니다. 기본 true는 속성 키를 정렬하며 false는 속성 삽입 순서에 민감합니다. 배열 순서는 항상 유지합니다. safe factory에서는 sort를 생성 시 고정하므로 캐시 중 의미가 바뀌지 않습니다. shared subtree와 같은 내용의 복사본은 같은 키일 수 있습니다. safe는 재귀 호출을 사용하므로 매우 깊은 입력은 엔진 stack 한도를 따릅니다.

strict compact 후보는 중간 token/node 배열 없이 참조 번호와 짧은 type/length 표식을 출력합니다. direct 후보는 일반 객체·밀집 배열의 직접 출력을 실험합니다. trusted 후보는 descriptor/symbol/byte 검사 생략 비용을 따로 측정합니다. hash 후보는 32-bit 충돌을 허용하는 실험이며 채택된 키 계약이 아닙니다.

측정은 독립 process, fresh identity cold 경로, immutable hit, 키 생성과 Map 조회 포함 경로를 구분합니다. 입력 생성은 timing 밖입니다. 문자열 길이만 줄인 결과를 성능 합격으로 취급하지 않습니다.

## Acceptance Criteria

### fingerprint-values — 직접 키 생성

- 정렬, string/value 경계, 숫자·bigint·undefined·Date·RegExp, 순환 종료와 shared/copy 의미론을 검증합니다.
- 재귀 omit과 일반 속성 읽기, 입력 mutation 반영을 검증합니다.

### fingerprint-fast — 빠른 키

- 일반 입력은 shallow 역순 키 형식을 사용하고 top-level omit과 native JSON 예외를 따릅니다.
- undefined 등 native JSON이 문자열을 만들지 않는 root에서도 키는 문자열입니다.

### fingerprint-sorted — 정렬 키

- 정렬된 경로 출력과 순환 marker를 유지하고 재귀 omit을 제공합니다.

### fingerprint-options — 옵션과 identity/cache

- 빈 prefix 기본값과 사용자 prefix, factory prefix 고정, opaque 참조 identity와 정확한 omit별 cache를 검증합니다.
- 예외가 난 호출의 부분 결과를 cache로 재사용하지 않습니다.

### fingerprint-sort — 안전성과 정렬의 조합

- safe 단독과 safe+sort를 모두 제공하며 생략 시 정렬합니다. 정렬 유무와 무관하게 순환 입력을 처리합니다.
- factory는 mode와 sort를 생성 시 고정하며 fast/sorted에 safe 전용 sort 옵션을 타입으로 허용하지 않습니다.

### fingerprint-surface — 공개 경계

- 네 함수와 해당 옵션 타입만 공개하며 구현 helper와 구형 이름은 노출하지 않습니다.

### candidate-correctness — 후보 구분 검증

- 지원 fixture 결정성, 경계 충돌 표본, 순환·공유 topology, omit/getter 회피, factory identity/cache를 검사합니다.
- 비교 기준보다 더 약한 구분은 테스트와 결과에 명시합니다.

### performance-replacement — 대체 성능

- 각 fingerprint mode가 담당하는 workload에서 기준 경로와 속도를 비교합니다.
- 계약 차이와 신뢰구간을 기록하고 미달 경로를 숨기지 않습니다.

## History

- 2026-09-19 — 0.16.0 공개 serializer 제거 뒤에도 fingerprint별 출력 계약과 성능 비교 기준을 독립적으로 유지하도록 계약을 정리했다.

## Last Updated

2026-09-19
