# types contract

## Requirements

여러 프랙탈이 공유하는 작성 스키마·값·입력·렌더러·오류 형의 의미를 소유합니다. 런타임이 허용하는 값을 형만으로 배제하거나, 정적으로 알 수 없는 실행 결과를 형이 안다고 약속하지 않습니다.

## API Contracts

실제 입력·알 수 없는 입력·자식 입력·덮어쓰기 props의 errors와 errorVisible은 optional never로 선언하여 목록 접근과 값 전달을 막습니다. 단순 진리값 검사는 TypeScript가 허용하므로 오류 정보 소비자는 useFieldErrors로 옮겨야 합니다. 묶인 Input만 직접 unwrapped를 해석하고 ChildFieldProps에는 그 키를 선언하지 않습니다.

LabelRendererProps·ErrorMessageRendererProps·InputRendererProps는 node·주소·이름·스키마·표시 필수 여부를 공유하는 공개 부품 계약입니다. 공통 기반은 비공개이며 오류 정보는 기본 props가 아닙니다. 라벨·오류의 context도 자동 주입하지 않고 호출자가 필요할 때 명시합니다. 입력 틀은 children을 같은 커밋에 정확히 한 번 조건 없이 그립니다. 틀 루트와 children 사이의 요소·컴포넌트 경로 변경은 입력을 교체합니다. 교체된 입력은 현재 노드 값에서 시작하며 포커스와 진행 중인 조합을 잃습니다. FieldRendererProps의 Label·ErrorMessage는 이 계약의 partial props를 받는 묶인 컴포넌트입니다.

### Roll 표현과 재귀 형

Roll은 편집기의 형 표시를 평평하게 하는 표현이며 런타임 변환이 아닙니다. 재귀 스키마의 정의 자리에서 Roll로 감싸면 순환 별칭이 되므로 재귀 고리 밖의 Rolled 형이 내부 형을 감싸고 패키지 진입점에서 공개 이름을 부여합니다. 내부 형과 공개 표시용 형을 분리하는 이유입니다.

작성 스키마를 값에서 추론하는 공개 InferJSONSchema와, virtual·여러 종류까지 아는 입력용 InferFieldInputSchema는 목적이 다릅니다. Form 조각 props의 Roll 표현은 [Form](../components/Form/DETAIL.md)이 소유하여 types와 Form 사이의 불필요한 형 순환을 막습니다. core·FieldProxy 역참조는 type import로 제한합니다.

### CONTROLS-081 — 열린 표현 payload

스키마 그룹은 controls·options·presentation으로 구분하고 맨 키를 입력 props의 대체 설정으로 해석하지 않습니다. presentation은 사용자 표현 확장에 열려 있으므로 낯선 키만으로 오류를 만들지 않습니다. options의 추가 키는 `[alt: string]: any`로 읽히며 알려진 옵션의 형과 자동완성, 명시 Options 제네릭 및 값 추론은 유지합니다. 소비자 확장 값을 읽을 때 불필요한 좁히기를 강제하지 않기 위한 계약입니다. 컴포넌트를 담는 키와 그 props 객체는 대응 이름을 유지하여 서로 다른 설정 입구를 만들지 않습니다.

alias·placeholder·className·style은 presentation.FieldInputProps, 렌더러 표현은 FieldRendererProps, 입력 선택 힌트는 inputType, 오류 문구는 errorMessages의 책임입니다. 입력이 값을 읽는 방식의 선언은 presentation.controlled와 입력 정의의 controlled이며, presentation.required는 불리언 표시 설정입니다. 두 설정의 뜻은 FieldInputBridge가 소유하며 required는 입력 선택 힌트가 아닙니다. 입력마다 의미가 다른 표현 payload를 core가 해석하거나 맨 키 alias와 혼합하면 제약과 표현의 경계가 흐려집니다. 전달 순서·입력 선택은 [FieldInputBridge](../components/FieldProxy/components/FieldInputBridge/DETAIL.md), 오류 문구 해석은 [formatValidationError](../helpers/error/formatValidationError/DETAIL.md)가 소유합니다.

### REACT-027 — 입력 초안과 값의 범위

입력은 치다 만 글자를 자기 초안으로 보유하고 커밋할 값만 onChange로 보냅니다. 빈 입력은 undefined이며 nullable만으로 빈 칸을 null로 바꾸지 않습니다. null은 입력이 명시적으로 보낼 때만 사용합니다. 제약이나 종류에 맞지 않는 값의 표시도 입력의 책임이며 core가 JSON 값을 임의 정정한다고 가정하지 않습니다. 객체·배열 값은 불변 입력으로 다루어 전달한 원본을 제자리 수정하지 않습니다.

### REACT-032 — Hint와 노드 종류

Hint와 props의 type은 노드 종류이며 schemaType은 정적 선언으로 계산한 JSON 허용 종류를 보존합니다. integer는 number 노드 종류를 사용하고 virtual의 schemaType은 undefined입니다. 게이트가 좁힌 현재 허용 목록은 jsonSchema.type에서 읽으므로 정적 schemaType과 혼동하지 않습니다. Hint의 misfit과 required는 노드의 isMisfit·isRequired에 대응합니다. 입력·렌더러 props의 required는 [표시 값 해석 계약](../components/FieldProxy/components/FieldInputBridge/DETAIL.md#api-contracts)을 따릅니다. 같은 경계에서 같은 이름인 값은 같은 의미를 유지하되 노드 boolean 이름을 React props에 기계적으로 적용하지 않습니다.

FieldInputTestObject는 허용된 Hint 키의 대조용 형이고 함수 시험은 전체 Hint를 읽습니다. 객체 시험의 목록은 대안 매칭이며 union 목록의 정확한 동등성이 필요하면 함수 시험을 사용합니다. 정규화·잘못된 키·integer 종류 시험의 거부는 [fieldInputDefinition](../helpers/fieldInputDefinition/DETAIL.md)이 소유합니다.

렌더러 props는 입력 중계 콜백이나 기본값을 소유하지 않으므로 `onChange`, `onFileAttach`, `defaultValue`를 명시적으로 금지합니다. 열린 표현 색인 서명이 이 속성들을 any로 허용하여 입력과 렌더러의 쓰기 경계를 흐리지 않아야 합니다.

### NODE-058 — 읽기 판별과 쓰기 허용

일반 FieldInputProps는 Value를 매개변수로 받는 interface이며 value·defaultValue·onChange는 Optional<Value>를 사용합니다. misfit 값을 검사한다고 이 interface의 value가 자동 판별 합집합처럼 좁혀진다고 약속하지 않습니다. [surface](../core/surface/DETAIL.md)의 별도 FieldNodeInputProps는 union 입력의 판별 계약이며 misfit인 unknown 읽기가 onChange의 허용 종류까지 넓히지 않습니다.

misfit은 현재 허용 종류·nullable에 맞는지의 신호이며 검증 성공이나 입력 표시 가능성의 보증이 아닙니다. 오류 목록과 errorVisible도 별개입니다. errorVisible이 잠시 보류되어도 raw 오류는 유지하며 표시 release 의미는 [FieldRendererContext](../providers/FieldRendererContext/DETAIL.md)가 소유합니다.

### schema-inference — 추론과 작성 경계

객체 스키마만 controls.discriminator를 허용하고 virtual·다른 종류·추론된 여러 종류의 입력 스키마에는 허용하지 않습니다. 판별자 없는 넓은 type 배열과 형 없는 fragment 자식 controls는 계속 작성할 수 있습니다. union 없는 객체의 판별자를 런타임이 어떻게 경고하는지는 [buildNodes](../core/engine/blueprint/buildNodes/DETAIL.md)가 소유하며 타입 제한으로 대신하지 않습니다. inactiveValue는 동기 resolver 또는 리터럴이며 식 제어 키로 취급하지 않습니다.

명시적 type의 InferValueType은 readonly type tuple을 NormalizeType으로 정규화해 기반 패키지에 위임합니다. type이 없을 때 인라인 동종 object·array 분기와 단일 종류 const·enum만 정적으로 좁히며 참조·게이트·복합 연언을 실행한 것처럼 추측하지 않습니다. 넓어진 스키마는 느슨한 fallback을 유지하므로 정확한 값 형이 필요한 소비자는 명시적 제네릭을 사용합니다.

## Acceptance Criteria

### types-gateway — 관문으로만 소비

형 소비자는 진입점을 사용하고 공개 선언과 공개 표면 시험을 함께 유지합니다. 형 전용 역참조가 런타임 초기화나 상태를 만들지 않아야 합니다.

### rolled-contract — 공개 형의 Roll 표현

공개 표시용 형은 내부 형의 변경을 반영하되 Roll 때문에 재귀 별칭이나 런타임 초기화가 생기지 않아야 합니다.

### union-input-types — 입력 형과 값 범위

NODE-058의 일반 입력 형과 노드 전용 판별 형을 구분하고 nullable·빈 값·쓰기 허용 범위를 함께 검증합니다.

### public-value-inference — 정적 추론의 한계

schema-inference의 인라인 분기·리터럴 추론과 넓은 fallback을 함께 유지하여 실행 시에만 정해지는 종류를 확정하지 않습니다.

### value-tuples — 폼 값에 전달되는 튜플 추론

유한 prefixItems는 optional 위치와 rest 형을 전달하여 비활성·생략 필드가 빠질 수 있는 값 계약과 일치해야 합니다. 객체 속성은 optional이며 additionalProperties가 닫히지 않으면 열린 객체를 유지합니다. nullable의 두 표기는 null을 허용하고 명시적 type은 inline 분기 추론보다 우선합니다. 비리터럴 접두부·구식 items 배열의 fallback은 [기반 값 추론](../../../../winglet/json-schema/src/DETAIL.md)을 따릅니다. 같은 스키마라도 defaultValue가 추론하는 필수 키와 FormHandle 기본 Value가 다를 수 있으므로 ref에는 같은 명시 값 형을 사용합니다.

## Last Updated

공개 형의 의미·추론 한계·표현 payload 또는 입력 작성자 계약이 바뀔 때 갱신합니다.
