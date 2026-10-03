# 9라운드 원문 — 이름 추천 (cennad codex)

편집자 주: 같은 요청문(`round-9-spec.md` §3.3의 여섯 항목 N-a–N-f)을 세 곳에 보냈다. codex는 저장소의 `src/core/types/value.ts`, `docs/.../expressions.md`, `inject-to.md`, `.claude/rules/seiri_naming.md`를 읽을 수 있었다. 이것은 codex의 답 원문이며 편집자는 고치지 않았다.

---

### N-a. `computed`를 대체할 컨테이너

1. **`control`** — 값과 UI를 제어하는 계층이라는 책임을 직접 나타냅니다. 기존 `computed`처럼 단일 객체 컨테이너이며, `control.active`, `control.injectTo`로 자연스럽게 읽힙니다.
2. **`formControl`** — 폼 전용 확장이라는 소속까지 명시합니다. 기존 `formTypeInput`의 `form` 접두사를 따르지만, 개별 입력 컴포넌트를 뜻하는 이름으로 오해할 여지가 있습니다.
3. **`directives`** — 여러 동작 선언을 담는다는 점은 드러납니다. 기존 `computed`의 선언 묶음 역할을 계승하지만, `readOnly`·`injectTo`보다 추상적이어서 무엇을 제어하는지 덜 명확합니다.

### N-b. `&pristine`를 대체할 값 삭제 조건

1. **`&clearValueWhen`** — 조건이 참이 될 때 값을 지운다는 대상과 조건을 모두 명시합니다. 기존 `setValue`의 동사＋`Value` 구조를 따릅니다.
2. **`&clearWhen`** — 짧고 조건부 동작으로 읽힙니다. 기존 `injectTo`의 동사 중심 구조를 따르지만, 값과 상호작용 상태 중 무엇을 지우는지는 생략됩니다.
3. **`&removeValueWhen`** — 출력에서 값이 없어져야 한다는 의미가 강합니다. 기존 `setValue`의 동사＋`Value` 구조를 따르지만, 노드 자체를 제거하는 동작과 구별해야 합니다.

코덱스는 현재 `expressions.md`가 `pristine`를 "값 삭제가 아닌 `dirty`·`touched` 초기화"로 설명하고 있다는 점을 주의사항으로 덧붙였습니다. 위 추천은 요청하신 재설계 의미(삭제) 기준입니다. 또한 `When`만으로는 전이 감지(거짓→참)까지 확정되지 않으므로 계약에 명시가 필요하다고 지적했습니다.

### N-c. 로드 중 자동 쓰기를 제어할 플래그와 Form prop

| 순위 | 비활성화 / 활성화 플래그 | Form prop | 근거 |
|---|---|---|---|
| 1 | `DisableAutomaticWrites` / `EnableAutomaticWrites` | `disableAutomaticWrites` | 기본값 채우기·자기 값 계산·다른 노드 쓰기를 포괄. 기존 `SetValueOption.Automatic` 어휘와 대칭 |
| 2 | `DisableAutomaticValueWrites` / `EnableAutomaticValueWrites` | `disableAutomaticValueWrites` | 값에 대한 쓰기임을 더 명시하지만 이름이 길어짐 |
| 3 | `DisableControlWrites` / `EnableControlWrites` | `disableControlWrites` | N-a의 `control`에 범위를 한정하지만, 표준 `default` 적용 포함 여부는 별도 계약 필요 |

1순위 조합 예: `SetValueOption.DisableAutomaticWrites | SetValueOption.Overwrite`. 두 플래그는 서로 다른 비트여야 하며, 둘 다 없으면 Form prop 상속, 하나만 있으면 해당 호출에서 재정의, 둘 다 지정하면 오류 처리를 권장했습니다. "모든 자동 쓰기"에는 N-b의 `clearValueWhen` 삭제도 포함되어야 한다고 강조했습니다(단, `active`에 의한 출력 제외는 별도 경계).

### N-d. fragment 수준의 `&if`

1. **`&fragmentActive`로 변경** (권장) — `&active`와 같은 활성화 개념에 범위만 명시. 노드 활성화와 fragment 활성화를 구별 가능.
2. **`&active`로 통합** — 두 범위를 하나의 개념으로 표현하지만 적용 대상 구별이 어려움.
3. **`&if` 유지** — 이전 비용은 작지만 `control.if`에서 표준 조건 검증과의 차이가 덜 드러남.

### N-e. 부모가 여러 자식에 선언하는 제어 (`&children` 문법 3안)

1. **제어 종류별 대상+식** (권장, 최소 설계):
```typescript
'&children': {
  readOnly: { targets: ['./firstName', './lastName'], expression: './locked === true' },
}
```
절충점: 단순하지만 같은 제어를 다른 조건으로 여러 그룹에 적용하려면 추가 문법 필요.

2. **대상 그룹 배열**: 한 대상 집합에 여러 제어를 함께 선언. 절충점: 대상이 겹칠 때 결합 규칙 필요.

3. **경로별 제어 객체**: `injectTo`의 경로-키 형태를 따름. 절충점: 특정 자식 설정은 찾기 쉽지만 식 반복이 줄지 않음.

코덱스는 초기에는 직계 자식의 명시적 경로만 지원하고, 와일드카드/후손 선택은 별도 확장으로 미루는 편을 권했습니다.

### N-f. `&default` 대안

1. **`&default`** (권장) — 표준 `default`의 책임을 그대로 따르며 `&` 접두사가 폼 전용 식임을 구별하므로 가장 일관적.
2. **`&defaultValue`** — Form의 `defaultValue` prop과 정확히 대응하지만, Form 초기값과 노드별 동적 보충식이 같은 계약이라고 오해될 소지.
3. **`&fillMissing`** — 기존 값을 덮지 않는다는 의미가 가장 강하지만 표준 `default`/`defaultValue`와 어휘가 갈라짐.

`&initialValue`는 비권장(최초 시점만 암시, 이후 누락 시 채우는 동작을 설명 못 함).

### 일관성 점검 (코덱스 종합)
1순위들을 모으면 `control` 아래 `active`, `visible`, `readOnly`, `disabled`, `clearValueWhen`, `derived`, `injectTo`, `default`, `fragmentActive`, `children`이 놓이고, 로드 정책은 `DisableAutomaticWrites`/`EnableAutomaticWrites`와 `disableAutomaticWrites`로 표현됩니다. `active`와 `fragmentActive`는 같은 개념의 범위를 구별하고, `default`는 표준 키와 의미를 맞춥니다. 상태형(`active`, `derived`)과 동작형(`clearValueWhen`, `injectTo`)의 문법 차이는 책임 차이를 반영하므로 충돌하지 않습니다. 다만 **`DisableAutomaticWrites`가 `clearValueWhen`의 삭제까지 막을지는 이름과 계약이 충돌할 수 있는 지점**이므로, 두 기능의 적용 범위를 반드시 함께 확정해야 한다고 지적했습니다.
