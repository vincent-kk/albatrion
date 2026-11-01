# 335라운드 — Vincent의 답 (WeakMap은 계획대로 측정으로; schemaType 자체를 없앨 수 있는지; stringify 키는 control.ts 구분자로 속도 단계에서, 되읽는 키만 예외; blueprint 등 engine 재구조화 수용)

2026-10-15. fairy08 조사 A·B·F·H1 보고에 소유자가 답했다. 원장 관리자의 답(schemaType 배제): 지금 schemaType이 kind·type과 달리 홀로 나르는 것은 둘 — `integer`와 `number`의 구분(kind는 integer를 number로 접음; 플러그인 시험 객체 `{schemaType:'integer'}`가 REACT-032로 여기에 기댐)과 nullable을 뗀 정규화된 형(union은 목록). 없애려면 플러그인 시험 계약(FieldInputHint.schemaType)과 제품 약 21파일이 effective schema의 `type`을 직접 읽어야 하고, 그러면 nullable 배열 문제가 되돌아온다. 그래서 권고는 안 1(JSON 형만 담고 virtual은 undefined) 유지이며 배제는 플러그인 계약을 바꿀 때 다시 본다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 조사 답 1차: WeakMap 측정, schemaType 배제 가능성, stringify는 control.ts 구분자로 속도 단계에서, engine 재구조화 수용 | 조사 A·B·F·H1 결과와 권고 | "1. weakMap 은 계획대로, 그리고 측정을 통해서 최적화하도록. 무조건 많다고 좋은건 아닐거고, 동적 생성은 더 안좋을거니까. \n\n2. schemaType 자체를 배제하는 방향은 불가능한가? 해당 타입을 추가한 까닭은 단일 문자열 타입으로 강제하고 nullable 을 분리해서 [string, null] 같은 타입을 schemaType: string ,nuallble:true 이렇게 쓰려고 만든 필드라 이젠 꼭 필요하진 않을수도 있는데.\n\n3. 구분자는 packages/canard/schema-form/src/constants/control.ts 의 특수문자를 고려하고, 속도개선 단계에서 수정해도 좋다. 다만, 난 되도록 stringify 를 적게 썼으면 한다. (다시 parse 를 하는 경우는 예외다. 키를 만드는 경우에 대해) \n\n4. 블루프린트 등 engine 에 대한 수정 수용합니다. \n\n\n이외 추가로 결정할 사항을 넘버링해서 알려주세요" (2026-10-15, 원장 세션) | (1) WeakMap: 호출 지역 셋만 Map·Set으로, 나머지는 밤 루프 측정으로 판단. (2) schemaType: 배제는 가능하나 integer 구분과 플러그인 시험 계약 때문에 지금은 안 1(JSON 형만, virtual은 undefined)로 간다; virtual 노드의 공개 jsonSchema.type 처리는 결정 대기. (3) stringify: 키 조립은 control.ts의 제어 문자(UNIT_SEPARATOR 등)를 구분자로 쓰고 속도 최적화 토막에서 고친다; 되읽는(JSON.parse) 키만 stringify 유지 허용, 그 밖의 키 생성은 직접 조립. (4) blueprint 재구조화(새 fractal 여섯, 공용 도구는 organ에) 수용; 세 세부(함수 껍데기 디렉토리 제거, effectiveSchema 승격, 미사용 stripSchema·resolveArrayLimits 삭제)는 원장 관리자 권고대로 가되 CLAUDE.md 한 줄은 별도 승인. |

다음 라운드 번호는 336이다.
