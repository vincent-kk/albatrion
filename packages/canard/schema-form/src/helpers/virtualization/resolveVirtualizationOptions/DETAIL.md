# resolveVirtualizationOptions

## Requirements

폼 수준의 가상화 입력을 정규화하며, 옵션 계약은 매니저의 생명주기 상태와 독립적으로 유지합니다. 기본값은 렌더 경험을 바꾸는 정책이므로 성능 수치 하나만으로 바꾸지 않습니다.

## API Contracts

- 기본값을 보충하는 일과 입력 값을 검증·보정하는 일을 구별합니다. 명시한 값의 범위나 observer 생성 실패를 이 정규화가 대신 처리한다고 가정하지 않습니다.
- `ResolvedVirtualizationOptions`는 매니저 생성자의 선언이 참조하므로 내부용이어도 선언 산출물에서 제거하지 않습니다. 부모 집계 경계로 재수출할 이유는 되지 않습니다.

## Acceptance Criteria

### option-compatibility — 기존 옵션 의미 유지

threshold와 eagerCount는 가지별 선택입니다. 정규화 단계에서 전역 작업 예산으로 바꾸지 않아 같은 옵션이 다른 범위의 필드를 지연시키지 않게 합니다.

### IR-opt-in — 가상화는 기본 off를 유지합니다

입력이 없거나 false이면 비활성이고, true 또는 옵션 객체를 준 경우에만 활성화를 요청합니다. [미노출 DOM의 접근성 제약](../../../components/FieldProxy/components/DeferredFieldProxy/DETAIL.md#ir-accessibility--미노출-입력을-완전한-ui로-취급하지-않습니다)과 [전체 노출 비용](../DETAIL.md#ir-mount-cost--첫-화면과-전체-노출의-비용을-구별합니다) 때문에 기본 on으로 확대하지 않습니다. SSR 지원만으로 이 선택 이유가 없어지지는 않습니다.

### IR-option-meaning — 공간 추정과 backfill은 독립적인 선택입니다

estimateHeight는 실제 콘텐츠 높이를 보장하지 않는 예약값입니다. Placeholder는 그 공간의 시각적 채움이므로 사용자 콘텐츠 크기를 자동 측정하거나 레이아웃 점프를 완전히 없앤다고 약속하지 않습니다.

사용자 Placeholder는 지연 필드마다 마운트됩니다. 무거운 장식을 기본 제공하거나 권장하면 지연하려던 React 작업을 다시 늘리므로 가벼운 선택적 시각 요소로 유지합니다.

backfill은 None 또는 Idle 중 하나를 고릅니다. 비트마스크로 조합하면 자동 노출의 금지와 허용이 동시에 생기므로 상호 배타적인 값으로 유지합니다. rootMargin의 px·% 제한은 observer가 받는 단위에 맞춘 형 계약이며 런타임 보정은 제공하지 않습니다.

## Last Updated

기본 활성화 정책, 옵션 의미, 정규화의 책임 또는 선언 보존 조건이 바뀌면 갱신합니다.
