# serialization

## Purpose

버전 있는 graph JSON으로 지원 값과 순환·공유 참조를 저장하고 복원하는 계약을 소유합니다. 키 생성과 동등성 비교는 형제 fingerprint의 책임입니다.

## Conventions

일반 JSON 데이터에는 native JSON을 사용합니다. graph 문자열을 JSON.parse하면 wire 표현이 나오며, 원래 값과 참조 관계를 얻으려면 parseGraph가 필요합니다. 속성 정렬이나 정규화된 비교 키는 보장하지 않습니다.

## Boundaries

### Always do

- 명시적으로 제외한 속성을 뺀 지원 데이터와 순환·공유 identity를 보존합니다.
- 외부 wire 전체를 검증한 뒤 복원 객체를 할당하고 참조를 연결합니다.
- 외부 소비자는 공개 entry point를 사용하고 순회·검증·복원 보조 구현은 내부에 둡니다.

### Ask first

- wire version, 지원 데이터의 보존 범위, omit 의미론 또는 자원 한도를 변경합니다.

### Never do

- 사용자 accessor/toJSON을 값 변환 수단으로 실행하거나 비지원 enumerable 데이터를 조용히 버립니다.
- 예약 속성 이름을 일반 대입으로 복원하여 상속 setter를 실행합니다.
- fingerprint의 속도를 위해 graph 검증이나 참조 보존을 완화합니다.
