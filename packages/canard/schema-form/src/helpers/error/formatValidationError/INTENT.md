# formatValidationError

## Purpose

검증 결과의 메시지를 해당 노드에 작성한 메시지 설정으로 표현합니다. 판정의 의미·경로·표시 자격은 바꾸지 않습니다.

## Conventions

- FormatError 호출 계약을 유지합니다.
- 번역을 선택할 수 없으면 검증기의 메시지를 보존합니다.

## Boundaries

### Always do

- 메시지는 노드의 presentation과 전달받은 locale 문맥으로 선택합니다.
- 기존 메시지의 의미를 지키도록 제한된 패턴 치환 순서를 보존합니다.

### Ask first

- 치환 문법·반복 치환·로케일 fallback 또는 FormatError 계약을 바꿀 때.

### Never do

- 검증 결과나 노드 값을 수정하거나 오류를 보고하지 않습니다.
- 전역 메시지 저장소나 검증 keyword의 자체 해석을 추가하지 않습니다.
- 접근자·문자열 변환의 예외까지 격리한다고 가정하지 않습니다.
