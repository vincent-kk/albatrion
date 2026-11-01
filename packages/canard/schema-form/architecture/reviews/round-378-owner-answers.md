# 378라운드 — Vincent의 요청 (오류·경고 코드의 그룹 부분을 상수로 뺀다; 최적화 뒤에)

2026-10-15. 소유자가 `src/errors/codes/FormErrorCode.ts`·`FormWarningCode.ts`의 값이 `그룹.코드` 꼴인 것을 보고, 그룹 부분을 상수로 빼고 오류는 그룹별로도 상수화하며 경고도 짝을 맞춰 그룹을 상수화하자고 했다. 시점은 지금 하는 일(속도 루프)이 끝난 뒤다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 오류·경고 코드의 그룹을 상수로 빼고 오류는 그룹별로 상수화, 경고도 같은 꼴로; 속도 루프 뒤에 | 코드 상수의 구조(원장 관리자가 묻지 않음, 소유자 발의) | "이거 끝나고 하고싶은건데 말이야.\npackages/canard/schema-form/src/errors/codes/FormErrorCode.ts\npackages/canard/schema-form/src/errors/codes/FormWarningCode.ts\n\n여기 있는거 구조가 보면 `${group}.${code}` 잖아.\n이거 그룹 부분도 상수로 빼면 안될까? \npackages/canard/schema-form/src/errors/codes/FormErrorCode.ts 는 또 에러 그룹이 여러개니까 그룹별로 상수화도 필요할거같은데.\n\n하는김에 짝을 맞추기 위해 waring 도 그룹을 상수화 하고. \n\n이렇게 하는게 필요해보여" (2026-10-15, 원장 세션) | 정돈 항목으로 등록한다(속도 루프 뒤, 09 정리 전후). 현재 그룹 문자열은 다섯 곳에 흩어져 있다: 오류 클래스 넷의 `GROUP` 상수(`src/errors/classes/*.ts`), `src/errors/type.ts`의 템플릿 리터럴 형 넷, 코드 표 둘의 값 문자열. 그룹 상수 한 벌(오류 그룹 넷: JSON_SCHEMA_ERROR·SCHEMA_FORM_ERROR·UNHANDLED_ERROR·VALIDATION_ERROR, 경고 그룹 하나: SCHEMA_FORM_WARNING)을 두고 클래스·형·코드 표가 그것을 쓰며, 오류 코드 표는 그룹별 표(19·19·2·1)를 합쳐 `FormErrorCode`를 만든다. 값 문자열과 공개 이름 94는 바뀌지 않는다(ERROR-031, 289라운드 D4). 그룹 상수를 공개 표면에 낼지는 결정 대기열 61로 소유자에게 묻는다. |

다음 라운드 번호는 379이다.
