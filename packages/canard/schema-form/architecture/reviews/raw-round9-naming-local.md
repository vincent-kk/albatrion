# 9라운드 원문 — 이름 추천 (로컬 opus)

편집자 주: 같은 요청문(`round-9-spec.md` §3.3의 여섯 항목 N-a–N-f)을 세 곳에 보냈다. 로컬 opus는 `.claude/rules/seiri_naming.md`, `src/core/types/value.ts`의 `SetValueOption`, `docs/.../expressions.md`를 읽었다. 이것은 그 답 원문이며 편집자는 고치지 않았다.

---

## N-a. `computed`를 대체할 컨테이너
1. `control`: 오너가 정한 정의인 "값과 UI를 제어하는 계층"을 그대로 한 단어로 옮긴 이름입니다. `injectTo`와 `default`까지 담아도 어색하지 않습니다. 기존 컨테이너 키인 `options`, `computed`처럼 소문자 단일 명사라는 점을 따릅니다. 약점도 있습니다. HTML에서 "form control"은 입력 요소를 뜻하므로 `control.injectTo`가 "입력 요소의 속성"처럼 읽힐 여지가 조금 있습니다.
2. `behavior`: "이 노드가 어떻게 행동하는가"라는 뜻이라 상태, 값 출처, 동작을 모두 덮습니다. 다만 "제어 계층"이라는 오너의 어휘와는 연결이 약합니다. 형태로는 역시 `options`를 따릅니다.
3. `directives`: Vue와 Angular 사용자는 "선언적 지시"로 바로 읽습니다. 하지만 추상적이고, 이 저장소에 같은 어휘를 가진 이름이 없습니다.
- `formControl`은 제외를 권합니다. MUI와 Angular의 `FormControl`과 이름이 정면으로 겹쳐서 다른 개념으로 오독됩니다.

## N-b. `&pristine` 대체 (참이 되면 값을 비움)
1. `&clearValue`: 동사+목적어 형태라 "참이 되는 순간 값을 비운다"는 일회성 동작으로 읽힙니다. 같은 동사형인 `injectTo`를 따릅니다.
2. `&cleared`: 과거분사라 `derived`, `disabled`와 형태가 맞습니다. 하지만 형용사는 "참인 동안 계속 비어 있음"이라는 상태로 읽혀서, 참이 되는 순간의 동작이라는 의미와 어긋납니다.
3. `&emptyValue`: 결과 상태를 명확히 말합니다. 그러나 "empty"는 형용사로도 읽혀 "값이 비었는가?"라는 조건식으로 오독될 수 있습니다.
- `&removeValue`와 `&resetValue`는 피하시길 권합니다. remove는 `&active` false의 "출력에서 제거"와 섞입니다. reset은 이 라이브러리에서 "초기값으로 복귀"를 뜻합니다.
- 주의할 점이 있습니다. 현행 문서의 `pristine`은 값을 건드리지 않고 dirty와 touched 상태만 초기화합니다. 그 기능이 여전히 필요하다면 `&pristine`은 그 의미 그대로 두고 `&clearValue`를 별도로 추가하는 편이 오독을 막습니다.

## N-c. 적재 시 자동 쓰기를 끄고 켜는 플래그 쌍과 Form prop
1. `SetValueOption.PreventAutomaticWrites`와 `SetValueOption.AllowAutomaticWrites`, Form prop은 `preventAutomaticWrites`를 권합니다.
   - Prevent라는 동사는 기존 `PreventInjection`을 따릅니다.
   - Automatic이라는 어휘는 기존 `Automatic` 플래그를 따릅니다. 그 플래그의 설명이 "form이 스스로 쓴 값(default, reset, derived)"이라 끄려는 대상 집합과 정확히 겹칩니다.
   - `Overwrite | PreventAutomaticWrites`는 "덮어쓰되 자동 쓰기는 막는다"로 자연스럽게 읽힙니다.
   - 스키마 `default`는 `&` 계층 소속이 아닌데도 이 이름이 함께 덮습니다.
2. `SkipAutomaticValues`와 `ApplyAutomaticValues`, prop은 `skipAutomaticValues`입니다. "이번 적재에서 건너뛴다"는 일회성이 잘 드러납니다. 다만 Skip과 Apply는 기존 enum에 없는 동사입니다.
3. `DisableAutomaticWrites`와 `EnableAutomaticWrites`, prop은 `disableAutomaticWrites`입니다. 현행 제안의 Disable과 Enable을 유지하므로 이전 비용이 가장 적습니다. 그러나 같은 계층의 `&disabled`(UI 잠금)와 어휘가 충돌합니다. 1순위를 Prevent와 Allow로 둔 이유가 이 충돌입니다.
- "Schema"나 "Control"을 이름에 넣으면 대상 범위가 다시 좁아집니다. 스키마 `default`는 control이 아니고, `&derived`는 schema default가 아니기 때문입니다.

## N-d. 조각 단위 게이트 `&if`
1. `&active`로 통합하시길 권합니다. 속성 스키마에 쓰면 노드 게이트가 되고, `then` 블록이나 `oneOf`/`anyOf` 분기 객체에 쓰면 조각 게이트가 됩니다. 한 메커니즘에 한 이름을 주고, 범위는 위치로 정하는 방식입니다. 의미도 맞습니다. 비활성 `oneOf` 분기의 값이 제거되는 동작이 곧 `&active` false의 "숨기고 값도 버림"과 같습니다. `oneOf: [{ '&active': "./type === 'A'" }]`는 "A일 때 이 분기가 활성"으로 바로 읽힙니다.
2. `&if`를 유지하는 안입니다. 익숙하고 JSON Schema `if`와 짝을 이룹니다. 하지만 표준 `if`는 부모에 놓이고 서브스키마를 값으로 받습니다. `&if`는 분기 객체 자체에 놓이고 표현식을 값으로 받습니다. 모양이 비슷해서 오히려 오독을 부릅니다.
3. `&when`입니다. 표준 `if`와 시각적으로 충돌하지 않고 조건으로 읽힙니다. 다만 기존 형제 이름이 없는 새 어휘이고, `&active`와 같은 메커니즘이라는 사실을 숨깁니다.
- 통합하면 N-e의 방식 B가 공짜로 따라옵니다.

## N-e. 부모가 자식 집합의 제어를 선언하는 방식
1. 이름 배열 그룹 방식입니다. 권장합니다.
   - 문법: `'&propertyGroups': [{ properties: ['name', 'email'], readOnly: '../locked === true', visible: '...' }]`
   - 장점: 직계 자식 이름을 문자열 배열로 받으므로 JSON Schema `required: ['name']`의 형태를 그대로 따릅니다. 대상이 명시적이고 grep으로 찾을 수 있습니다.
   - 단점: 속성 이름을 바꿀 때 배열도 함께 바꿔야 하고, 그러지 않으면 어긋납니다.
   - 경로 대신 직계 이름만 허용해야 예측 가능성이 유지됩니다.
2. 조각 범위 제어 방식입니다. N-d에서 통합을 택할 때만 성립합니다.
   - 문법: `allOf: [{ '&readOnly': '../locked', properties: { name: {…}, email: {…} } }]`
   - 장점: 조각에 걸린 제어가 그 조각이 선언한 모든 속성에 적용됩니다. 새 키가 전혀 필요 없습니다.
   - 단점: 스키마 배치를 제어 단위로 재구성해야 합니다. 속성이 어느 조각에 속하는지가 곧 동작이 되므로 구조 변경이 동작 변경이 됩니다.
3. 기존 키를 객체형으로 오버로드하는 방식입니다.
   - 문법: `'&readOnly': { expression: '../locked', properties: ['name', 'email'] }`
   - 장점: 새 키가 없습니다.
   - 단점: 값이 문자열이면 자기 자신, 객체이면 타인이 대상이 됩니다. 값의 형태가 의미를 바꾸므로 예측 가능성이 가장 낮습니다.
- 어느 안이든 결합 규칙을 한 줄로 고정해야 합니다. 권장 규칙은 "안전한 쪽으로 결합"입니다.
  - `active`와 `visible`은 AND입니다. 부모와 자식이 모두 허용해야 켜집니다.
  - `readOnly`와 `disabled`는 OR입니다. 둘 중 하나라도 잠그면 잠깁니다.

## N-f. `&default`와 대안 비교
1. `&default`: 계층 규칙이 "`&key`는 표준 키워드의 표현식 버전"입니다(`readOnly`와 `&readOnly`, `if`와 `&if`). 그래서 "없을 때만 채움"이라는 표준 `default`의 의미를 그대로 물려받는다는 점이 이름만으로 전달됩니다. 표준 `default`로 떨어지는 폴백 관계도 짝 이름으로 자연스럽게 드러납니다.
2. `&fillMissing`: 동작을 정확히 서술합니다. 하지만 표준 `default`와 짝이라는 사실이 이름에서 사라집니다.
3. `&initialValue`: "마운트 시 한 번"으로 읽힙니다. 적재 때마다, 값이 빠질 때마다 채운다는 의미를 과소 전달합니다.
- `&defaultValue`는 제외를 권합니다. Form의 `defaultValue` prop은 호출자가 폼 전체에 주는 값입니다. 같은 이름을 스키마 노드 계층에 쓰면 두 층위가 섞이고 우선순위를 오독하게 됩니다.

## 일관성 점검
1순위를 한데 모으면 다음과 같습니다.
```ts
{
  '&propertyGroups': [{ properties: ['name', 'email'], readOnly: '../locked' }],
  properties: {
    discount: {
      '&active': "../kind === 'vip'",
      '&default': '../baseRate',
      '&clearValue': '../resetDiscount === true',
    },
  },
  oneOf: [{ '&active': "./kind === 'A'", properties: {} }],
}
form.setValue(data, SetValueOption.Overwrite | SetValueOption.PreventAutomaticWrites);
<Form preventAutomaticWrites />
```
문법은 세 부류로 정리되며, 이 구분 자체가 예측 규칙이 됩니다.
- 형용사 `active`, `visible`, `readOnly`, `disabled`는 참인 동안 유지되는 상태입니다.
- `default`, `derived`는 값의 출처입니다.
- 동사 `clearValue`, `injectTo`는 참이 되는 순간 일어나는 동작입니다.
- `&cleared`를 택하면 이 구분이 깨집니다. N-b의 1순위를 `&clearValue`로 둔 이유입니다.

충돌 또는 주의점은 네 가지입니다.
1. **`&clearValue`와 `&default`의 상호작용이 문제입니다.** `&default`가 "값이 없을 때마다" 채운다면 비운 직후 곧바로 다시 채웁니다. 그러면 비우기가 무의미해집니다. 채움이 "적재 시에만"인지 "빠질 때마다"인지 명세에서 고정해야 합니다.
2. **내부 플래그와 어휘가 겹칩니다.** 내부 `Reset` 조합에는 `Automatic` 플래그가 들어 있습니다. 그래서 `PreventAutomaticWrites`가 호출자의 적재 자체를 막는다고 오독할 수 있습니다. 공개 enum인 `PublicSetValueOption`만 보는 사용자에게는 문제가 없습니다. 하지만 내부 문서에는 "막는 대상은 적재에 뒤따르는 계층 쓰기이며, 적재 값 자체는 아니다"라는 한 줄이 필요합니다.
3. **`control` 안의 키는 `&` 없이 씁니다.** `&propertyGroups` 항목 안의 `readOnly`도 맨 키로 씁니다. 두 표기가 같은 규칙이므로 일관됩니다.
4. **`&active`를 분기에 쓰는 규칙은 분기 문서와 함께 바꿔야 합니다.** `allOf` 조각은 지금 무조건 적용됩니다. 여기에 `&active`를 허용하면 `allOf`도 조건부가 됩니다. 이 변화를 분기 표에 명시해야 합니다.
