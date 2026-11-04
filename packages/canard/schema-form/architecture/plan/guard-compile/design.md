# G 설계 — Amendment 1 포함

캐시 항목은 copy·guards와 compiled=false를 만들고 전체 compile은 하지 않습니다. compileValidationEntry는 최초 수요에서 compiled를 설정하고 같은 id 퇴출 뒤 compile(copy)를 시도하며 실패·duplicate를 보관합니다. assertValidationRootReady는 이를 호출한 뒤 기존 한 번 재시도를 적용합니다. 가드·개발 사전 준비는 전체 컴파일을 호출하지 않습니다.

compileGuard·release는 compile 선행을 요구하지 않으며 동일 copy를 공유합니다. Storybook 예제도 addSchema 후 pointer $ref를 컴파일합니다.

None은 전체 compile0, OnRequest·OnChange는 다음 프레임 뒤 슬롯 또는 먼저 온 명시 요청에서 컴파일합니다. root A 보유→B 생성·가드→A 해제→B 전체 판정의 순서를 지정 회귀로 고정합니다. 계약은471C-01·02·03입니다.
