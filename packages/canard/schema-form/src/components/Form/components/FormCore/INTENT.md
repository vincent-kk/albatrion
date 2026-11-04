# FormCore — 폼 뿌리 조립

## Purpose

Provider 고정 중첩과 `FormHandle`을 조립하고, 인스턴스 보고기와 루트 오류 경계로 감싼 폼 본체를 부모 `Form`에 제공합니다.

## Conventions

- 진입점은 오류 경계를 입힌 `FormCore`와 형 셋(`FormProps`·`FormHandle`·`FormChildrenProps`)을 이름으로 내보냅니다.
- 소비자는 부모 `Form`이며, 정적 멤버(`Form.Render` 등)를 붙이는 일은 부모가 합니다.

## Boundaries

### Always do

- Provider 중첩 순서와 `FormHandle`의 18개 멤버를 부모 Form 계약대로 유지합니다.
- 인스턴스 보고기를 루트 오류 경계 바깥에 둡니다.

### Ask first

- 진입점에 심볼을 더하거나 내보내는 형의 모양을 바꿀 때

### Never do

- 형제 조각(`FormRender`·`FormField`·`FormLabel`·`FormInput`·`FormError`)을 가져오지 않습니다.
- 노드를 직접 생성하지 않습니다. `RootNodeContextProvider`가 담당합니다.
