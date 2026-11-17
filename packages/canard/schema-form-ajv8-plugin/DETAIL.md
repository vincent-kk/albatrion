# AJV8 패키지 소유 계약

## Requirements

발행 manifest의 방언 경계와 공통 검증 구획을 함께 소유합니다. 방언은 각자의 bind·configure 선택과 등록 자원을 유지하며, 공통 구현을 쓴다는 이유로 프로필이나 스키마 수명을 합치지 않습니다.

## API Contracts

공개 검증 의미는 [플러그인 계약](../schema-form/src/app/plugin/DETAIL.md)을 따릅니다. 공통 validator는 세 방언이 재사용하는 조상의 내부 구획입니다. 외부에서는 발행된 방언 주소를 쓰고 자식 구현은 저장소의 위로 열린 참조 원칙에 따라 공통 구획의 구체 파일을 읽습니다.

루트 package manifest가 실제 공개 주소를 열거하므로 별도의 대표 index나 module-entry-point 면제를 추가하지 않습니다. 이 소유권은 구현을 옮기거나 모듈 초기화 순서를 바꾸지 않습니다.

## Acceptance Criteria

### dialect-ownership — 방언과 공통 구현의 소유자를 구별합니다

- 방언별 초기화·설정·등록의 실행 의미와 공개 이름을 유지합니다.
- 공통 validator 구획에는 이 패키지의 소유권이 적용됩니다.

### public-contract — 공개 진입점을 유지합니다

- manifest의 공개 주소와 타입·런타임 진입점 대상은 바뀌지 않습니다.
- 기존 검증·가드·수명 시험을 같은 단언으로 실행합니다.

## Last Updated

공개 방언 주소·공통 구현의 소유권 또는 설정과 등록 수명의 경계가 바뀔 때 갱신합니다.
