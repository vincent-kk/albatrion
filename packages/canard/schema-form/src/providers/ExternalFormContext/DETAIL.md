# ExternalFormContext

## Requirements

여러 폼이 공통으로 사용할 외부 설정을 제공하며 폼별로 덮어쓰는 것을 허용합니다.

## API Contracts

`errorVisibility`는 실시간 기본 정책입니다. Form 설정이 우선하며 같은 실효 정책의 재전달은 Form 공개를 해제하지 않습니다. 입력 정의와 렌더러·포맷터도 불변 참조 교체로 갱신합니다.

- 입력 정의는 참조별로 정규화하고 사용자 context는 내용 기준으로 안정화합니다.
- 외부 설정은 폼 수준 props보다 낮은 우선순위이며 기본 Context는 빈 설정입니다.

- Context 객체와 Provider는 `components/`, 소비 훅은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### external-form-context-contract — 관찰 가능한 동작

- 외부 Provider가 없어도 소비자는 빈 설정에서 폴백을 선택할 수 있습니다.
- 마운트 후 정의를 교체하면 입력을 다시 선택하고 같은 컴포넌트의 DOM은 유지합니다.

## Last Updated

외부 설정의 우선순위 또는 갱신 수명이 바뀌면 갱신합니다.
