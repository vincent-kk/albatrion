# 383라운드 — Vincent의 수정 의뢰 (오류 클래스의 group·specific을 상수로 조립하고, name 리터럴을 그룹 상수로 바꾼다; codex로)

2026-10-16. 소유자가 #404의 결과를 보고 추가 수정 둘을 의뢰했다: 생성자가 코드 문자열을 잘라 specific을 얻는 것이 이상하니 group과 specific을 모두 상수로 두고 code를 조립할 것, 그리고 클래스 name을 리터럴 대신 그룹 상수(대문자 스네이크)로 공유할 것. 도구는 앞서처럼 codex다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| group·specific 둘 다 상수화해 code를 조립하고 slice를 없앤다; name 리터럴을 그룹 상수로 바꾼다; codex로 | #404의 아쉬움(원장 관리자가 묻지 않음, 소유자 발의) | "흠 아까 코드리뷰를 할걸 그랬네 .\n\nerror warning 수정한거 보고있는데, 약간 아쉬움이 남아.\n추가 수정 의뢰를 할게. 아까처럼 codex 로 해줘.\n\n1. Group / Specific 를 둘다 상수화 해서 Code 에서 조립하던가 해.  매번  super(GROUP, code.slice(GROUP.length + 1), message, details); 이렇게 slice 해서 쓰는건 너무 이상하구나.\n2.     this.name = 'JSONSchemaError'; 이렇게 아직 리터럴로 name 을 내보내고 있는데, 이거 그냥 group 을 공유해서 대문자 스네이크 케이스를 쓰면 안되나? 아직 리터럴이 남아있는게 나중에 실수포인트가 될 수 있을거같은데." (2026-10-16, 원장 세션) | 후속 PR을 Orca·codex로 맡긴다. (1) 그룹별 specific 상수 표(오류 넷, 경고 하나)를 두고 `FormErrorCode`·`FormWarningCode`의 각 값을 `그룹.specific`으로 조립한다(원장 순서·값·공개 이름 94 불변). 생성자는 code를 받되 slice 대신 표에서 만든 code→specific 조회로 `BaseError`에 넘긴다. #404의 파생 표는 specific 표에서 조립한 것으로 바꾼다. (2) 네 클래스의 `name`은 그룹 상수 값(`JSON_SCHEMA_ERROR` 등)이다. `error.name`은 원장 계약이 아니며 시험 하나(blueprint.owned-inline-policy)만 옛 이름을 단언하므로 그 기대를 바꾼다. 스택 추적 머리말이 클래스 이름에서 그룹 이름으로 바뀌는 것이 관측 변화다. |

다음 라운드 번호는 384이다.
