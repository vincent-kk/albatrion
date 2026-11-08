# derive 계약

## Requirements

derive는 완성된 형상에 걸린 규칙의 판정만 제공합니다. 값 적용·채움·나감·예산·원본 복원·커밋은 [settle](../settle/DETAIL.md)이 소유합니다. 판정 자료로 경계를 넘기므로 settle의 실행 organ이나 형을 import하지 않습니다.

## API Contracts

규칙 문법과 정적 허용 집합은 [blueprint/buildNodes](../blueprint/buildNodes/DETAIL.md), 식 문법·컴파일은 [compileBlueprintExpressions](../blueprint/compileBlueprintExpressions/DETAIL.md), 값 동등성은 [engine](../DETAIL.md)의 계약을 따릅니다. 후보의 승자·값 쓰기 에지와 동적 주입은 [evaluateDeriveRound](evaluateDeriveRound/DETAIL.md), 오류 분류·공개 코드는 [errors](../../../errors/DETAIL.md)에 둡니다.

## Acceptance Criteria

### SETTLE-048 — 로드와 일반 쓰기의 기준을 구별합니다

정착 시작의 기준은 직전 커밋이며 같은 정착에서는 마지막으로 소비한 값이 기준입니다. 로드는 원천이 그 범위 안에 있는 규칙의 기준을 새로 시작하지만 `setValue` 전체 교체는 그렇게 하지 않습니다. 같은 값을 다시 쓴 호출이 이미 편집한 파생 필드를 덮지 않아야 합니다. subtree reset이 범위 밖 원천까지 초기화하면 형제 영역이 뜻하지 않게 다시 주입됩니다.

### derive-fragment-owner-differential — CONTROLS-077: 직접 선언한 대상을 구별합니다

조각 규칙은 선택된 직접 자식 선언에만 걸며, 객체 속성과 배열의 반복·추가·tuple·prefixItems 후보를 같은 소유 판정으로 처리합니다. 속성 이름 `*`를 배열 템플릿으로 오해하지 않으며 빈 문자열 이름과 대상 이름 부재도 구별합니다. 이름 접두 비교만으로 대상을 정하면 키워드 이름 속성과 다른 fold에 규칙이 샙니다. 켜짐·생김의 기준은 [settle](../settle/DETAIL.md)에 둡니다.

### derive-fragment-array-cost — CONTROLS-073: 호스트 평가와 대상 에지는 별개입니다

fields·조각의 같은 식은 판정 호출의 호스트·식 위치마다 한 번 평가하고 결과를 모든 대상에 공유합니다. 기준점과 소비 에지는 대상마다 유지하므로 새 아이템만 새 에지를 가지며 아이템 수만큼 식을 재실행하지 않습니다. 고정된 규칙 수에서 후보·에지 작업은 대상 수에 비례하고 초기화 대상의 동일성 Set은 고유 대상 수만큼의 임시 메모리를 사용합니다.

### CONTROLS-032 — watch는 파생 의존을 넓히되 다른 식을 끌어오지 않습니다

derived의 의존 튜플은 자기 식의 경로와 대상 템플릿의 모든 선언이 적은 watch의 합집합입니다. 다른 controls 식의 경로까지 섞지 않습니다. 그렇지 않으면 표시용 조건의 변경이 사용자 편집값을 덮는 새로운 방아쇠가 됩니다. 공개 watchValues의 선택은 settle이 소유하며 의존 합집합과 같은 목록이라고 가정하지 않습니다.

### CONTROLS-080 — 식은 투영된 트리와 현재 맥락을 읽습니다

선언 호스트를 기준으로 경로를 풀고 이번 판정의 root.emit에서 자기 속성만 따라 읽습니다. extras·터미널 내부의 값도 경로로 읽히며 원시값 아래·없는 경로·연산자 경로는 undefined입니다. 원본·잠복 원본을 식의 별도 입력으로 만들지 않습니다. 맥락을 읽는 derived·unsetValue·resetInteraction은 맥락 변경을 기준과 비교하지만 injectTo는 원천 방출이 같으면 맥락만으로 발화하지 않습니다. 같은 식이 화면과 다른 원본을 읽는 이중 의미를 막습니다.

### derive-fragment-array-reset — CONTROLS-029: 상호작용은 최종 형상에서 초기화합니다

resetInteraction은 최종 형상에서 참으로 바뀌거나 로드·새 대상 발생의 참인 식에 한해 edited·touched 초기화 대상을 돌려줍니다. 값은 쓰지 않으므로 자동 값 쓰기가 억제되어도 판정합니다. 조각 재활성화에서 남아 있던 공유 아이템과 새로 들어온 아이템의 기준을 구별해 이미 소비한 참 조건이 상호작용을 매번 지우지 않게 합니다. 실제 플래그·interactionReset·revision 변경은 settle의 커밋이 담당합니다.

### derive-static-prepared-ids — 현재 선택을 준비물보다 우선합니다

선택 맵의 결과가 있으면 그것을 사용합니다. 그렇지 않은 정적 자식은 부모·경로·청사진·자식 증인이 맞는 준비물의 ID를 재사용하고, 증인이 없거나 다르면 커밋·작성 선언으로 후퇴합니다. 준비물을 무조건 신뢰하면 같은 위치의 다른 선택을 평가하므로 조회의 상수 시간 이득보다 현재 선택의 정확성을 우선합니다. 별도 ID 배열이나 영구 색인을 만들지 않습니다.

### derive-rule-lifetime — 규칙 표와 발생 키의 수명을 섞지 않습니다

규칙 표·watch·자식 순서 메모는 불변 분석 수명에 두고, 파생 부재가 capability로 증명된 경우만 공유 읽기 전용 빈 표로 건너뜁니다. 분기 부재나 우연히 빈 실행 표는 그 증명이 아닙니다. 발생 키는 원천·대상의 union fold, 선언 위치, 대상 인스턴스 ID와 경로를 포함하여 같은 경로로 다시 생긴 노드가 옛 에지를 물려받지 않게 합니다. 대상 ID 메모는 트리 런타임에 지연 생성하고 폼 전체 reset·폐기에서 해제하되 부분 reset에서는 유지합니다. ID 발급은 되감지 않아 서로 다른 수명을 충돌시키지 않습니다.

### derive-failures — 실패 하나가 다른 규칙의 진단을 지우지 않습니다

파생·상호작용 판정은 모든 실패를 발생 순서로 반환하고 원천 경로로 발생을 구별합니다. 실패가 없으면 공유 동결 빈 목록을 반환합니다. 정착의 중복 제거·첫 원인 선택·보고는 settle·write가 소유하므로 이곳에서 첫 실패만 남기거나 공개 오류 코드를 재분류하지 않습니다.

ERROR-122. resetInteraction 식의 실패는 거짓으로 판정하고 해당 에지를 소비합니다. 실패를 참으로 간주하여 edited·touched를 지우지 않으며, 실패한 평가를 성공한 참 에지로 보존하지 않습니다. 값 규칙의 실패한 후보 제외는 [라운드 판정](evaluateDeriveRound/DETAIL.md)이 소유합니다.

### derive-boundary — 개발 추적을 판정의 공개 표면으로 만들지 않습니다

개발 추적은 마지막 정착을 설명하는 내부 자료이며 console·onError·공개 노드 멤버로 내보내지 않습니다. 프로덕션에서는 추적 항목을 생성하지 않습니다. 추적을 상시 사건으로 만들면 규칙 수에 비례하는 할당이 입력 경로에 남고 발생 기록과 상태 관측이 섞입니다. 기록 보유와 라운드 예산은 settle이 소유합니다.

## Boundary Exemptions

### `utils/rules/getDeriveRuleTable.ts` — 규칙 결합의 공통 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 라운드와 상호작용 초기화가 공유하는 규칙 표를 부모에 유지하고 settle에는 진입점으로 제공합니다.

### `utils/evaluate/evaluateResetInteraction.ts` — 커밋 판정의 공통 보조 공유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 라운드 판정과 기준점·식 평가 보조를 공유하므로 같은 소유 구획에 두며 settle의 커밋은 명명된 진입점을 소비합니다.

### `constants/` — 실행기와 공유하는 상한

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: settle 실행기가 판정과 같은 상한을 사용해야 하므로 구현을 승격하지 않고 상수를 진입점으로 제공합니다.

### `types/` — 판정 자료의 경계

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: settle과 공유하는 판정 형을 organ에 유지하고 필요한 이름만 진입점으로 제공합니다.

## Last Updated

기준점·규칙 결합·발생 수명·상호작용 초기화 또는 판정 경계가 바뀔 때 갱신합니다.
