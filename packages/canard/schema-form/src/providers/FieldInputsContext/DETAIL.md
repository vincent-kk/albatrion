# FieldInputsContext

## Requirements

단일 폼의 입력 맵과 정의를 정규화된 형태로 공급합니다.

## API Contracts

- 맵과 정의는 각 참조가 바뀔 때 독립적으로 정규화합니다. 잘못된 새 맵은 마지막 커밋의 유효한 맵을 유지하며 오류는 커밋에서 보고합니다.
- Context는 입력 선택을 직접 수행하지 않고 선택 훅에 정규화 결과를 제공합니다.
- 입력 맵 패턴 컴파일의 `FormTypeInputMap` 오류는 정규화 결과에 보관해 루트 로드로 전달합니다. 잘못된 설정을 무시해 다른 입력으로 대체하지 않으며, 렌더 중에는 `onError`를 호출하지 않습니다. 사용자 입력 컴포넌트의 실행은 정규화에 포함하지 않습니다.

- Context 객체와 Provider는 `components/`, 소비 훅은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### form-type-inputs-context-contract — 관찰 가능한 동작

- 원본 정의를 정규화 없이 소비자에게 노출하지 않습니다.
- 맵·정의 교체는 값을 초기화하지 않고 입력을 다시 선택하며 선택된 컴포넌트가 달라진 입력만 재마운트합니다.
- 컴파일되지 않는 `**` 포함 키는 폼을 fallback으로 유지하고, 일반 모드와 StrictMode 모두 `FormTypeInputMap`·`load` 기록 하나만 전달합니다. 정상 맵의 입력은 계속 렌더되며 입력 자체가 던진 오류는 `RenderFailed`·`render`로 보고합니다.

## Last Updated

입력 정규화의 실패 전달 또는 고정 수명 계약이 바뀔 때 갱신합니다.
