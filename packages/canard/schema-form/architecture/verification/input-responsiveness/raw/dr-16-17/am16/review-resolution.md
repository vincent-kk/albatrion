# Amendment 16 검토 지적 해결 — 주 작업자 검증

독립 검토의 제품 결함 발견은 0건입니다. 증거 도구 P2는 다음 구현과 실행 대조로 주 작업자가 해결했습니다. 이 문서는 독립 검토자의 새 verdict가 아닙니다.

- G1은 기준 Git 원문 hash·criteria·red log·현재 테스트 hash·원시 assertion을 결합합니다.
- G3은 29개 mutation ID, definition의 after bytes, 실제 changed/before/restored/current hash, 명령 exit와 지정 실패 assertion을 대조합니다.
- G4는 자체 선언 summary를 읽지 않고 정본 기존 부분·82/85행·복원한 contract 문장·sup-plan/실제 ledger text·26개 raw log·FCA raw multiset을 직접 대조합니다.
- G5는 각 실행의 정확한 명령/project, 시작/종료/관측 시각, 실행 전후 실제 source/config digest, 원시 assertion 집계와 현재 source manifest를 대조합니다. 이전 해시 없는 실행을 재사용하지 않고 전체11개 명령을 다시 실행했습니다.
- build marker3개와 현재 배포 byte hash, 현재/기준 선언 manifest를 확인한 후 보존한 declaration comparator를 실제 입력으로 다시 실행합니다. exit·tool/input/result hash·stdout을 declaration-execution에 기록합니다.
- G6는 현재 Git 원문·추가 diff·추가 파일/decoded gzip·version·tracked output·configured identity·ancestry·trailer·clean tree·PR HEAD 링크를 직접 계산합니다.

원시 FCA diagnostic/sup count 대조2개와 command source digest/project/timing/선언 입력 hash 대조4개가 모두 실패하며 success marker를 내지 않았습니다. 원본 bytes를 복원한 뒤 양성 검사도 통과했습니다.

처음 전체 unit에서 나온 S1은 새 RootNodeContext fixture의 형제 내부 import였습니다. entry-point FormErrorService 타입의 mock으로 바꾸고 대상5개 및 affected routing mutation2개를 다시 확인했으며, 이후 source-bound 전체 unit은4191건 통과했습니다. 제품 소스는 이 fixture 수정과 검증 도구 보강 동안 변하지 않았습니다.

canonical supplement와 module contract, 공개 선언, 원장/FCA 기준, 기존 handler/sink 예외 의미는 승인 범위로 유지했습니다. 모든 helper worker는 종료 후 release했습니다.

Source digest: 16f0fd490e3dff741a32f1a8ee4e8aadb40ba561ef6a29994ec53b7490ae724f
