# 266라운드 — Vincent의 스토리북 관찰 셋 (docs 직렬화 오류, nullable 분기의 화면·값 불일치, 스토리 가독성)

2026-10-14. 소유자가 schema-form 스토리북(localhost:6006)을 보며 발견한 문제를 "이후 수정사항으로 기록"해 달라고 했다(원문: "나 스토리북 보고있는데, 하나씩 문제가 발견되고있어.\n이거 말할테니까, 이후 수정사항으로 좀 기록해둬줄래?"). 원장 관리자가 원문대로 기록하고 소유자 대기열 40·41·42로 올린다.

| 확인 | 관찰 | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 관찰 1·2·3 | 스토리북 문제 셋 | "1. 스토리북의 docs 에서 jsonSchema 가 순환참조 오류로 직렬화 실패. 화면이 깨져서 표시됨. 리엑트 노드나 컴포넌트나 함수 등에 의한 이유로 추정, 산발적으로 재현되는 듯. 확인요청. http://localhost:6006/?path=/docs/features-derivation-contextreference--docs \ncomposite 쪽 스토리들이 전부 그런듯.\n\n2. http://localhost:6006/?path=/story/features-composition-nullablebranch--null-ancestor-promotion \n\n\n<pasted_content id=\"f11b\">\nnullable.object-null-branch: LANDING-139 null descendants are unfilled; LANDING-004 explicit activation.\n\n\n</pasted_content id=\"f11b\">\n\n 이슈에서, \n값은 {\"account\":null}, 스키마도 정상이나, form 에는 account.kind [a] 로 표시됨. 이때, kind 의 defualt 는 a 가 맞음. 이 부분이 설계상 정상인가? 화면에 보이는 것과 실제 값이 다르니 나조차 햇갈린다. 이건 null로 선언된 부모객체를 자식객체의 자동채움이 해제할 수 없다는 것 때문에 발생한 문제같은데, 만약 그렇다면 자식 노드의 값도 최소한 비어있어야 하지 않나 싶음. 정말 햇갈림 \n\n3. 스토리들의 가독성이 상당이 낮음. 어떤 동작을 해야할지, 어떤게 옳은 값일지, 현재 오류가 무엇인지 등을 전혀 알 수 없음. 이것은 레거시 스토리를 참고해서 설명과 재현, 그리고 현재값과 기본값, error, 스키마, 그리고 스토리별 설정정보를 페이지 내에 수록해주었으면 함. 지금은 어떤 테스트인지, 어떤게 정상동작인지 등을 파악하기 어려움. 다른것도 마찬가지이나 composite 쪽이 특히 그렇다." | 대기열 40(docs 직렬화 오류 — 확인·수정), 41(nullable 분기 화면·값 불일치 — 설계 판단 뒤 수정), 42(스토리 가독성 — 설명·재현·현재값·기본값·오류·스키마·설정 수록, composite 우선) |

다음 라운드 번호는 267이다.
