# formatValidationError

## Requirements

치환 값의 `$&`, `$$` 등은 명령이 아니라 문자 그대로 표시합니다. 대체 문자열 문법이 사용자 입력을 변형하지 않도록 함수 치환을 사용하며, 첫 출현과 details 우선 순서는 유지합니다.

검증기가 준 판정의 의미를 유지하면서 작성자가 노드의 presentation에 지정한 메시지를 적용합니다. 오류의 재배정과 표시 자격은 이 모듈의 책임이 아니므로 문구를 바꾸기 위해 판정·경로·노드 값을 고치지 않습니다.

## API Contracts

FormatError 계약을 따르며, 메시지 선택은 해당 노드의 `presentation.errorMessages`와 전달받은 context로 한정합니다. 전역 번역 저장소나 별도 검증기 해석을 넣으면 폼별 설정과 검증기가 사용하는 keyword의 의미가 갈라지므로 추가하지 않습니다.

## Acceptance Criteria

### REACT-031 — 기본 문구의 번역 범위를 넓히지 않습니다

작성한 keyword 메시지 또는 default를 선택하고, 로케일 객체이면 명시한 context.locale만 사용합니다. 선택한 keyword의 로케일이 없다고 default를 다시 탐색하거나 임의의 언어를 고르지 않습니다. 사용할 수 있는 비어 있지 않은 메시지가 없으면 원래 검증기 message를 보존하여 불완전한 번역 설정이 판정의 설명을 지우지 않게 합니다.

`false schema`를 위한 내장 번역은 두지 않습니다. 작성자가 같은 이름의 errorMessages 키나 자기 formatError로 번역하게 하여, 검증기별 문구 정책을 이 기본 포맷터에 고정하지 않습니다. 잔여 키의 표시·배정은 [FormErrorMessage](../../../components/Form/components/FormErrorMessage/DETAIL.md)와 [검증 계약](../../../core/engine/validation/DETAIL.md)에 맡깁니다.

### format-validation-error-contract — 치환은 제한된 문자열 서식입니다

치환은 details를 먼저, 현재 노드의 value를 나중에 사용하고 같은 패턴의 첫 출현만 바꿉니다. details에 value가 있으면 첫 `{value}`도 그 순서의 영향을 받습니다. 이를 전역 치환이나 템플릿 평가로 바꾸면 기존 작성 메시지의 뜻이 달라지므로 표현 기능을 몰래 확장하지 않습니다.

선택 실패의 fallback과 예외 격리는 구별합니다. 현재 구현은 스키마·상세의 접근자나 값의 문자열 변환이 던지는 예외를 잡지 않으므로, 임의의 입력에서도 throw하지 않는 함수라고 약속하지 않습니다. 렌더 중 실패의 격리는 [필드 경계](../../../components/FieldProxy/DETAIL.md)가 소유합니다.

## Last Updated

메시지 선택·로케일 fallback·치환 문법 또는 판정 표현의 책임이 바뀔 때 갱신합니다.
