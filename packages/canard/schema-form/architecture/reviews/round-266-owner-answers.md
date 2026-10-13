# 266라운드 — Vincent의 스토리북 관찰 셋 (docs 직렬화 오류, nullable 분기의 화면·값 불일치, 스토리 가독성)

2026-10-14. 소유자가 schema-form 스토리북(localhost:6006)을 보며 발견한 문제를 "이후 수정사항으로 기록"해 달라고 했다(원문: "나 스토리북 보고있는데, 하나씩 문제가 발견되고있어.\n이거 말할테니까, 이후 수정사항으로 좀 기록해둬줄래?"). 원장 관리자가 원문대로 기록하고 소유자 대기열 40·41·42로 올린다.

| 확인 | 관찰 | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 관찰 1·2·3 | 스토리북 문제 셋 | "1. 스토리북의 docs 에서 jsonSchema 가 순환참조 오류로 직렬화 실패. 화면이 깨져서 표시됨. 리엑트 노드나 컴포넌트나 함수 등에 의한 이유로 추정, 산발적으로 재현되는 듯. 확인요청. http://localhost:6006/?path=/docs/features-derivation-contextreference--docs \ncomposite 쪽 스토리들이 전부 그런듯.\n\n2. http://localhost:6006/?path=/story/features-composition-nullablebranch--null-ancestor-promotion \n\n\n<pasted_content id=\"f11b\">\nnullable.object-null-branch: LANDING-139 null descendants are unfilled; LANDING-004 explicit activation.\n\n\n</pasted_content id=\"f11b\">\n\n 이슈에서, \n값은 {\"account\":null}, 스키마도 정상이나, form 에는 account.kind [a] 로 표시됨. 이때, kind 의 defualt 는 a 가 맞음. 이 부분이 설계상 정상인가? 화면에 보이는 것과 실제 값이 다르니 나조차 햇갈린다. 이건 null로 선언된 부모객체를 자식객체의 자동채움이 해제할 수 없다는 것 때문에 발생한 문제같은데, 만약 그렇다면 자식 노드의 값도 최소한 비어있어야 하지 않나 싶음. 정말 햇갈림 \n\n3. 스토리들의 가독성이 상당이 낮음. 어떤 동작을 해야할지, 어떤게 옳은 값일지, 현재 오류가 무엇인지 등을 전혀 알 수 없음. 이것은 레거시 스토리를 참고해서 설명과 재현, 그리고 현재값과 기본값, error, 스키마, 그리고 스토리별 설정정보를 페이지 내에 수록해주었으면 함. 지금은 어떤 테스트인지, 어떤게 정상동작인지 등을 파악하기 어려움. 다른것도 마찬가지이나 composite 쪽이 특히 그렇다." | 대기열 40(docs 직렬화 오류 — 확인·수정), 41(nullable 분기 화면·값 불일치 — 설계 판단 뒤 수정), 42(스토리 가독성 — 설명·재현·현재값·기본값·오류·스키마·설정 수록, composite 우선) |

다음 라운드 번호는 267이다.

## 덧붙임 (2026-10-14, 대기열 41 결정과 42 보강, 43 신설)

원장 관리자가 2번을 설명했다(쓰기 null 아래 자식은 빈 상태 — VALUE-036·18C-100; 로드 null은 자식 기본값 유지 — 시나리오 "VALUE-036 loaded null retains child defaults for later input promotion"; 선택지 셋: 로드 null도 빈 상태로 통일 / 지금 설계 유지하되 표시 구분 / 로드 null에서 자식 미렌더). 소유자 답: "2번에, 첫번째가 맞는거 같다. 일관된 규칙이 중요하고, 사용자는 form 만 보고 값을 믿어야 하니까 이렇게 표시와 실제가 다른건 매우 잘못된 것으로 보인다. \n\n나머지는 스토리를 어떻게 봐야하는지, 어떻게 테스트해야하는지 잘 모르겠어서 테스트를 충분히 못하겠다.\n그리고 ref 핸들을 통한 테스트도 아예 없어보이는군. \n\n스토리들에 적절한 구조화 데코레이터를 통해서 가독성과 사용성을 좀 올려달라. 사람도 보고 알 수 있어야지.\n그리고 ref 핸들러를 통한 스토리도 좀 추가해달라." → 대기열 41 결정: 로드 null도 쓰기 null과 같이 자식을 빈 상태로(기본값은 그 필드에 입력할 때만), 규칙 하나 — 공개 동작 변경이며 VALUE-036 보충과 시나리오 "loaded null retains child defaults" 수정 대상. 대기열 42 보강: 구조화 데코레이터(설명·재현 단계·현재값·기본값·오류·스키마·스토리별 설정을 페이지 안에)로 사람이 보고 알 수 있게. 대기열 43 신설: FormHandle(ref)을 통한 스토리 추가(focus·select·refresh·remount·reset·findNode·getValue·setValue·getErrors·validate·showError·submit·getState·setState·clearState·getAttachedFilesMap).
