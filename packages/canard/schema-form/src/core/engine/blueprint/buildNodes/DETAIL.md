# buildNodes contract

## Requirements

- Appending multiple templates for one named property sets the host's optional `hasPropertyCandidates` flag. Single-candidate bindings leave it absent, without a new index or cache; array candidate presence remains represented by the existing candidate lists. This construction-time proof guards candidate-owned exit cleanup (NODE-043, BLUEPRINT-044; 394C-01).

- 배열의 반복 템플릿과 각 prefixItems 자리에는 build가 돌려준 fold별 후보 전부를 작성 순서로 연결한다. 기존 단일 후보 필드는 첫 후보를 가리키며, 후보별 작성 스키마 위치와 선언 소유를 보존한다(BLUEPRINT-044, 389C-03, 391C-01).

- 선언 수집에서 packed gates/order를 복사할 때는 native slice를 사용한다. fragment와 declaration의 배열은 계속 각자 소유하고, 값, 순서, ID, DFS, 진단, capability는 같다. 속도 비용은 같은 원소 수에 비례하는 native 복사이며, 입력과 fragment를 iterator로 순회하던 일은 없어진다. 메모리 비용은 호출마다 기존의 네 배열과 원소 참조 수를 그대로 유지하고, 추가로 보유하는 자료는 없다(batch2 2-declaration-slice).

- 자식 이름의 escapeSegment는 이름마다 한 번 만든 값을 schemaPath와 data path에 재사용한다. 무게이트 경로는 지역 문자열 하나를 사용하고, 일반 집계는 기존 properties Map의 값에 escapedName, path, inputs를 같은 필드 순서로 보관한다. 공개 두 경로, template key의 바이트, 자식·기여·게이트 순서는 같다. 속도 비용은 이름 길이에 비례하는 escape 한 번이며, 반복되는 기여와 뒤쪽 build 순회에서 다시 escape하던 일이 없어진다. 메모리 비용은 빠른 경로에서 지역 문자열 하나, 일반 경로에서 이름마다 일시 기록 하나와 문자열 참조다. 소속 배열의 소유와 동결은 유지하며, 새로 보유하는 색인, 캐시, 공개 필드는 없다(107라운드 3-path-strings).

- 무게이트 자식 빠른 경로의 입력은 기존 순서인 context, gates, inherited, hostPath, fragment, role, schema, schemaPath, order의 literal로 만든다. 실제 자식 build, binding, 독립된 소속 배열 생산은 그대로다. 속도 비용은 고정 필드를 직접 읽고 쓰는 것이며, 자식마다 base spread로 범용 키를 복사하던 일이 없어진다. 메모리 비용은 기존의 부모별 base, 자식별 입력·배열, 공개 경로 두 개를 유지하며 새로 보유하는 자료는 없다(107라운드 2-child-input-literal).

- 조각 확장 키가 없는 선언은 기존의 control·type 검사와 capability, ID, fragment, 소유자, discriminator 기록을 마친 뒤 반환한다. `$ref`가 문자열이 아니고 allOf, if, oneOf, anyOf가 모두 undefined인 경우에만 visiting stack 복사와 고정 fragment keyword loop를 생략하며, 공개 청사진, 진단, DFS 순서는 같다. 속도 비용은 O(1) 고정 검사이며, 5개 keyword 반복과 배열 모양 검사 3회가 없어진다. 메모리 비용은 적격 호출에서 visiting 복사 배열이 없어지는 것이고, 기존 declaration, fragment, 소속 배열은 유지하며 새로 보유하는 색인이나 캐시는 없다. 두 모드의 59-schema differential과 105C-01 최소 크기 판정으로 확인한다(106라운드 빈 조각).

- 선언 수집은 소유자별 ordered sink에 기존 DFS 순서대로 한 번씩 추가한다. ID 예약, fragment 연결, capability, 게이트, 정적 검사는 기존에 방문하던 위치를 유지하고, 가상 노드는 수집 함수가 반환한 별도 배열을 소유한다. 속도 비용은 O(선언 수) 추가이며, 재귀 반환을 flatten하던 일과 build 입력마다 다시 복사하던 일이 없어진다. 메모리 비용은 노드별 기존 집계 배열과 가상 소유 배열을 유지하되, 재귀와 일반 입력마다 만들던 중간 결과 배열만 없앤다. 기록끼리 소속 배열을 공유하지 않고, 새로 보유하는 색인, 캐시, 노드 필드도 없다. 실제 종단 시간은 105C-01 판정으로 확인한다(106라운드 선언 수집).

- 단일 무게이트 연언 object는 properties의 eager `Object.entries` 스냅샷을 기존 순서 그대로 자식 build에 직접 전달한다. fields 제어 항목이 있거나, 선언이 여러 개이거나, 선언 문맥 또는 게이트 경로이면 기존 집계를 유지한다. 기존 binding 생산, DFS, 가상 자식 처리, 정적 검사와 청사진의 모든 내용은 같다. 속도 비용은 노드당 O(1) 자격 검사와 O(자식 수) 순회 한 번이며, properties Map에 넣고 조회하던 일과 두 번째 열거가 없어진다. 메모리 비용은 기존의 eager 스냅샷, 자식 입력, binding 결과를 유지하고, 적격 object에서는 properties Map과 쓰이지 않는 tuples Map을 만들지 않는다. 새로 보유하는 색인, 캐시, 노드 필드는 없으며 시간과 heap 바이트는 측정을 기다리는 중이다(105라운드 자식 열거).

- 분석 문맥은 선언마다 그 선언이 수집된 구성 입력의 인덱스(`declarationInputs`)를 기록한다. 재귀에 적중해 템플릿을 다시 쓰는 연결이 가리키는 입력의 게이트를 선언별로 찾기 위해서다(211C-01). 내부 template tuple은 작성 위치, 문맥, 최초로 나타난 gate 순서로 한 번 구성하고, 같은 조각의 외부 문자열 표현을 host-bound 키에 조합한다. 두 Map의 실제 키 바이트, 조회 순서, 공개 schema·data 경로는 유지한다. 속도 비용은 입력, gate, 소유 경로, 문자열 길이에 비례하며, 전체 tuple 문자열을 다시 JSON으로 인코딩하던 일과 중간 tuple·host 배열이 없어진다. 메모리 비용은 호출 중에 쓰는 키 두 개, 인코딩 조각, 중복 판정 목록이며 새로 보유하는 캐시나 노드 필드는 없다. 종단 시간은 105C-01과 그 최소 크기 규칙으로 확인한다(106라운드 감도 판정).

- 조각 순서는 properties, allOf, if/then/else, oneOf, anyOf이며, 배열 인덱스와 중첩 경로로 전순서를 정한다. 조각 문맥은 연언과 선언을 구별하고, 상속 overlay가 어느 호스트에 속하는지를 보존한다.

- 형이 없는 칸은 BLUEPRINT-048·050·051에 따라 먼저 게이트 없는 oneOf·anyOf의 허용 집합을 합친다. 두 키워드가 함께 있으면 둘을 교차한 U에서 null을 뗀 F로 종류를 정한다. F가 `{object}`나 `{array}`이면 variant 호스트이고, 다른 종류와 섞이면 오류다. 게이트 분기는 U에서 제외하며, 재귀 분기와 참조는 현재 경로에 다시 들어오는 지점에서 절단한다. 분기 없는 `const`·`enum` 칸은 단일 JSON 종류의 원시 리터럴 잎이고, 분기 안의 리터럴 전용 칸은 여전히 ⊤이다. union은 터미널이며, 가상 노드를 포함한 종류는 여덟 가지다.

- 명시된 discriminator만 정적 const·enum을 읽는다. 정적 allOf와 참조를 따라 태그를 교차하고, 끌어올린 선언과 자기 active의 결합을 보존하며, 작성 스키마는 바꾸지 않는다.

- controls, options, fields 항목에 허용하는 키는 닫힌 목록이다. controls의 두 목록은 `core/engine/types/controls.ts`의 `SchemaControls`·`ChildSchemaControls`와 형으로 묶여 있어서, 어느 쪽이 어긋나도 형 검사가 실패한다. 닫힌 목록 밖의 키는 UNKNOWN_GROUP_KEY, 목록 안 키의 값 모양이 틀리면 INVALID_CONTROL_SHAPE다. injectTo는 함수만 허용하며 정적 대상 분석은 하지 않는다. presentation은 불투명한 병합 데이터로만 취급한다.

## API Contracts

- 같은 종류의 그룹 판정은 engine 공통 fold 보조를 소비한다. 이 보조는 schemaType을 읽는 런타임 식별과 같은 비트 의미를 소유하므로 빌드와 정착이 number/integer·nullable·형 나열 순서를 동일하게 접는다. 청사진 노드에는 새 필드를 보관하지 않는다(BLUEPRINT-043, 389C-02, 390C-01).

- 옛 표기 `items: [...]`는 자리별 `prefixItems` 템플릿으로 컴파일한다. 같은 선언의 `additionalItems`가 스키마 객체이면 그 꼬리 자리의 아이템 템플릿(`item`)으로 컴파일한다. `additionalItems`가 `false`나 `true`이거나 없으면 꼬리는 청사진이 없는 자리다. 꼬리가 닫혔는지는 검증기가 판단할 일이라 청사진은 모형으로 두지 않는다. 기존 `items` 튜플 컴파일과 그 시험은 그대로다(NODE-052, SCHEMA-001, 36C-02).

- 자식 연결은 이름, 참조 템플릿, 해당 호스트의 선언과 게이트를 보존한다. 같은 참조 대상이라도 호스트별 덧씌움이나 선언 문맥이 다르면 유효 스키마의 선언 집합을 공유하지 않는다. 재귀 참조는 분석 중인 템플릿을 다시 가리키게 해서 유한하게 유지하며, 최초 방문 경로를 이후 연결의 호스트 경로로 잘못 쓰지 않는다. 재귀에 적중해 구성 중인 템플릿을 다시 가리키는 연결의 게이트는, 가리키는 입력의 게이트 뒤에 템플릿 자신의 선언 게이트를 새 경로로 다시 묶은 목록이다. 첫 방문의 절대 호스트 경로는 물려받지 않는다(FRAGMENT-003·009, 211C-01).

- `BlueprintGate.evaluationReads`는 식이 읽는 자리의 정적 목록이다. 절대 경로는 `#`·`(/)`의 루트 `''`, `/p`·`#/p`의 `'/p'`처럼 절대 경로 문자열로 보존한다. 상대 경로는 선언 호스트에서 오르는 `..` 횟수(0 이상인 수)로 보존하고, `@`는 제외한다. 청사진은 유한한 작성 위치마다 템플릿을 하나만 만들며, 발생의 절대 평가 자리 L은 정하지 않는다. 정착이 각 발생을 만들 때, 그 발생 호스트와 모든 읽기 자리의 최저 공통 조상 L을 한 번 계산해 메모한다. 단일 발생의 L은 종전 정적 규칙과 같다(SETTLE-045, BLUEPRINT-030, 26C-04·07).

- 내부 참조의 URI 디코딩이나 JSON Pointer 해석이 실패하면, 작성 위치와 원인을 보존한 UNKNOWN_JSON_SCHEMA로 보고한다.

## Acceptance Criteria

### owned-inline-public — 생성 지점 공개·공유 값 보호

- 정적·runtime 유효 schema, 공개 값 11종, 공유 gate 내부가 두 모드에서 동결되고, 입력은 원래 참조와 동결 상태를 유지한다. hint style 병합은 결과만 보호하며, 작성된 React 값과 함수의 참조와 상태는 유지한다.

### owned-inline-memberships — 기록별 소유와 개발 보호

- 59종, 가상, 재바인딩, validationOnly, fields-control, discriminator, compiled expression, 지연 slot에서 두 기록이 소속 배열을 공유하지 않는다. 내부 기록은 개발 모드에서만 동결하고 appliesWhen은 두 모드에서 보호한다. EMPTY_INDEX 공유와 node-local memo를 유지한다.

- 위 두 절은 이 fractal의 시험이 직접 검증한다. 형, 조각, 판별, 게이트 위치, 재귀, 코퍼스에 대한 분석 결과는 부모 blueprint의 통합 시험이 `blueprint()`로 검증한다(부모 DETAIL의 `type-syntax`, `type-inference`, `type-static-intersection`, `discriminator`, `gate-evaluation-location`, `corpus` 절).

## Last Updated

정돈-3 blueprint 재구성(2026-10-15)
