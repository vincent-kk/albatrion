# ExternalFormContext

## Requirements

FormProvider는 여러 폼의 기본 설정을 공급하며 인스턴스 선택을 대신하지 않습니다. 전역 플러그인 변경 없이 일부 폼만 다르게 구성할 수 있는 경계입니다.

## API Contracts

라벨·오류 등록 자리는 node와 children 중심의 전용 부품 props를 받습니다. 입력 자리는 실제 입력을 children으로 감싸는 InputRendererProps를 받습니다. 등록 컴포넌트의 참조 교체가 해당 부품을 다시 마운트하므로 안정된 컴포넌트 참조를 공급합니다.

정규화한 입력 정의와 그 Provider의 InputRenderer만 담은 별도 Context를 함께 제공합니다. 두 참조가 같으면 객체를 재사용하여 포맷터 같은 무관한 외부 설정 변경이 입력을 렌더하지 않게 합니다. 소비자는 자기 위치의 가장 가까운 Provider를 읽고 Provider가 없으면 두 설정이 undefined인 기존 기본 선택을 유지합니다.

입력 정의·렌더러·포맷터는 불변 참조 교체로 전달하고 context는 내용 기준으로 안정화합니다. 정의 참조가 그대로일 때 무관한 설정 변경이 입력 재정규화를 일으키지 않게 합니다. 빈 기본 Context에 렌더러를 하드코딩하지 않아 [플러그인 폴백](../../app/plugin/DETAIL.md)을 유지합니다.

## Acceptance Criteria

### external-form-context-contract — 기본값과 실효 설정을 구별합니다

Form override에 가려진 Provider 변경은 선택된 설정을 바꾸지 않습니다. 오류 공개 세대는 [FormCore](../../components/Form/components/FormCore/DETAIL.md), 렌더러 선택은 [FieldRendererContext](../FieldRendererContext/DETAIL.md)가 소유합니다. Provider 입력 정의의 갱신도 [입력 선택 수명](../FieldInputsContext/DETAIL.md)을 따릅니다.

### VALIDATE-044 — 검증기 인스턴스를 전달합니다

validatorFactory는 전역 등록의 대체물이 아니라 폼군에 공급할 검증기 인스턴스입니다. Form > FormProvider > 플러그인 선택과 참조 교체 시 루트 재생성은 [RootNodeContext](../RootNodeContext/DETAIL.md)가 소유합니다. 인스턴스별 캐시·등록 수명을 유지해야 하므로 매 render 새 검증기를 만드는 설정은 피합니다(VALIDATE-040·VALIDATE-041·VALIDATE-042). validationMode의 실시간 적용도 같은 소유자에 맡깁니다.

## Last Updated

외부 기본값의 우선순위 또는 참조·내용 안정화 계약이 바뀌면 갱신합니다.
