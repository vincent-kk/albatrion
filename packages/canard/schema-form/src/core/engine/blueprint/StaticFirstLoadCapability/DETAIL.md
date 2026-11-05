# StaticFirstLoadCapability contract

## Requirements

정적 첫 로드 자격은 생성이 끝난 청사진의 고정 사실입니다. 엔진 모드를 바꿀 때 지우거나 조회 때 그래프를 다시 훑으면 같은 분석의 자격과 비용이 실행 이력에 좌우됩니다.

## API Contracts

has는 내부 staticFirstLoadEligible만 읽으며 사실이 없는 입력은 false입니다. 공개 노드 필드나 별도 등록 저장소를 추가하지 않습니다. 자격의 증명과 별도의 fixedFirstLoadPlan은 [부모](../DETAIL.md)의 계약을 따릅니다.

## Acceptance Criteria

### static-first-load — 재분석 없는 보관

비열거·읽기 전용 생성 사실을 그대로 조회하고 모드 초기화 뒤에도 유지합니다. 자격이 없음과 사실이 없음은 모두 일반 로드 경로로 보수적으로 돌아갑니다. 라이브 상태로 자격을 추정하거나 branchless와 같은 다른 capability를 자격 대신 읽지 않습니다.

## Last Updated

자격 조회·보관 수명·증명과의 경계가 바뀔 때 갱신합니다.
