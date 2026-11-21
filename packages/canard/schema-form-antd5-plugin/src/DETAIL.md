# UI 입력 연결 계약

## Requirements

입력은 폼이 전달한 저장 값과 상태를 표시하며, 폼이 받은 입력의 유효성은 스키마 검증에서 판단합니다.

## API Contracts

코어가 공급한 inputId와 labelId는 Ant Design이 받는 id 및 ARIA 속성에 연결합니다. 복합 입력의 별도 주소는 getInputId(key)로 받습니다. path는 JSON Pointer로 사용합니다.

Select는 표시한 태그의 선택을 저장합니다. Checkbox 그룹은 표시하지 않는 기존 값을 유지합니다. 별칭은 제공된 객체의 자체 속성에서 읽습니다.

## Acceptance Criteria

### control-bindings — 컨트롤 연결

- 폼 간 식별자를 구별하며 지원되는 컨트롤 속성으로 연결합니다.
- 미설정, 읽기 전용 및 저장 시점은 폼과 라이브러리의 공개 입력 계약을 따릅니다.

## Last Updated

입력 바인딩·식별자 또는 부품 소유권의 경계가 바뀔 때 갱신합니다.
