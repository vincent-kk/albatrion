# UI 입력 연결 계약

## Requirements

입력은 폼이 전달한 저장 값과 상태를 표시하며 라이브러리의 로컬 draft를 폼 값으로 오해하지 않습니다.

## API Contracts

입력은 labelId를 직접 읽어 주 컨트롤 또는 복합 그룹의 접근성 이름을 필드 제목과 연결합니다. inputId는 주 컨트롤, getInputId(key)는 보조 요소의 id입니다. 특정 렌더러만 전달하는 aria-labelledby에 의존하지 않습니다. renderer와 bound Label은 코어 labelId를 소유하며 입력 자체의 legend가 있으면 getInputId('legend')를 사용합니다.

같은 규칙은 플러그인 FieldRenderer, Form.Label과 Form.Input, bound Label을 렌더하는 사용자 renderer, hideLabel에서 유지합니다. 범위 양끝은 각각 필드 제목에 연결합니다. 선택지·날짜 세부 입력·URI Protocol 같은 보조 컨트롤은 자기 이름을 유지하고 제목 있는 그룹 또는 description으로 소속을 연결합니다. 이름 없는 컨트롤과 라이브러리의 기본 이름만 가진 컨트롤, 중복 id, 존재하지 않는 aria-labelledby·for 대상은 허용하지 않습니다. 선택 그룹의 제목은 접근성 트리에 한 번만 노출하며 중복 제목은 hidden으로 제외합니다.

## Acceptance Criteria

### control-names — 레이아웃과 무관한 입력 이름

- 입력 정의에서 파생한 표는 각 정의의 primary·range-end·auxiliary 분류를 요구합니다.
- 네 레이아웃에서 이름·소속·고유 id·참조 대상을 검사하며 새 정의가 미분류이면 실패합니다.

## Last Updated

입력 바인딩·식별자 또는 부품 소유권의 경계가 바뀔 때 갱신합니다.
